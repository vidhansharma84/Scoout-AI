// Mock inference worker for Scoout AI.
//
// Talks to the internal endpoints the real GPU worker will use:
//   GET  /api/internal/v1/cameras/assigned
//   POST /api/internal/v1/detections
//   POST /api/internal/v1/clip-upload-url
//   PUT  /api/internal/v1/clip-upload/<token>
//   POST /api/internal/v1/rule-match
//   POST /api/internal/v1/health
//
// Every TICK_MS, for each camera:
//   - post a health ping,
//   - roll a small chance of a detection; if it fires and the shop has
//     applicable rules, upload a canned demo clip and post a rule-match
//     with the resulting clipKey so alerts have playable video.

import fs from "node:fs";

const API = process.env.SCOOUT_API_URL || "http://127.0.0.1:3000";
const TOKEN = process.env.WORKER_TOKEN;
const WORKER_ID = process.env.WORKER_ID || "mock-1";
const TICK_MS = Number(process.env.WORKER_TICK_MS || 30_000);
const DETECT_CHANCE = Number(process.env.WORKER_DETECT_CHANCE || 0.06);
const DEMO_CLIP_PATH = process.env.DEMO_CLIP_PATH || "/opt/scoout-clips/_demo.mp4";

if (!TOKEN) {
  console.error("WORKER_TOKEN is not set — refusing to start");
  process.exit(1);
}

let demoClipBytes = null;
function loadDemoClip() {
  if (demoClipBytes) return demoClipBytes;
  try {
    demoClipBytes = fs.readFileSync(DEMO_CLIP_PATH);
    console.log(`[demo-clip] loaded ${demoClipBytes.length} bytes from ${DEMO_CLIP_PATH}`);
  } catch (e) {
    console.warn(
      `[demo-clip] could not read ${DEMO_CLIP_PATH}: ${e.message}. Alerts will have no clip attached.`,
    );
    demoClipBytes = null;
  }
  return demoClipBytes;
}

const CLASS_POOL = [
  { class: "person",    weight: 6 },
  { class: "motion",    weight: 5 },
  { class: "loitering", weight: 2 },
  { class: "crowd",     weight: 1 },
  { class: "smoke",     weight: 0.4 },
  { class: "fire",      weight: 0.15 },
];
const TOTAL_WEIGHT = CLASS_POOL.reduce((a, x) => a + x.weight, 0);

function weightedPick() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const { class: cls, weight } of CLASS_POOL) {
    r -= weight;
    if (r <= 0) return cls;
  }
  return "motion";
}

const jsonHeaders = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: jsonHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function uploadDemoClip() {
  const bytes = loadDemoClip();
  if (!bytes) return null;
  try {
    const { key, uploadUrl } = await api("POST", "/api/internal/v1/clip-upload-url", {
      kind: "mp4",
    });
    const putRes = await fetch(API + uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "video/mp4",
      },
      body: bytes,
    });
    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      console.error(`[clip-upload] PUT ${putRes.status}: ${text.slice(0, 200)}`);
      return null;
    }
    return key;
  } catch (e) {
    console.error("[clip-upload] failed:", e.message);
    return null;
  }
}

async function tick() {
  const t0 = Date.now();
  let data;
  try {
    data = await api("GET", "/api/internal/v1/cameras/assigned");
  } catch (e) {
    console.error("[assigned] failed:", e.message);
    return;
  }
  const cameras = data?.cameras ?? [];
  if (cameras.length === 0) {
    console.log(`[tick] no cameras assigned yet`);
    return;
  }

  let detCount = 0;
  let alertCount = 0;
  for (const cam of cameras) {
    try {
      await api("POST", "/api/internal/v1/health", {
        workerId: WORKER_ID,
        cameraId: cam.id,
        lastFrameAt: new Date().toISOString(),
        fpsActual: 24 + Math.random() * 6,
        latencyMs: 30 + Math.round(Math.random() * 20),
        streamState: "online",
      });
    } catch (e) {
      console.error(`[health] ${cam.id}:`, e.message);
    }

    if (Math.random() > DETECT_CHANCE) continue;
    const cls = weightedPick();
    const at = new Date().toISOString();
    let det;
    try {
      det = await api("POST", "/api/internal/v1/detections", {
        workerId: WORKER_ID,
        cameraId: cam.id,
        at,
        class: cls,
        confidence: 0.7 + Math.random() * 0.3,
      });
      detCount++;
    } catch (e) {
      console.error(`[detection] ${cam.id}:`, e.message);
      continue;
    }

    const applicable = det?.applicableRules ?? [];
    if (applicable.length === 0) continue;
    if (Math.random() > 0.35) continue;
    const rule = applicable[Math.floor(Math.random() * applicable.length)];

    // Upload a clip first so the alert has a playable URL.
    const clipKey = await uploadDemoClip();

    try {
      await api("POST", "/api/internal/v1/rule-match", {
        detectionId: det.detectionId,
        ruleId: rule.id,
        confidence: 0.75 + Math.random() * 0.2,
        clipKey,
        reasoning: `Mock worker: detected "${cls}" — matches rule "${rule.prompt.slice(0, 80)}".`,
      });
      alertCount++;
    } catch (e) {
      console.error(`[rule-match] ${cam.id}:`, e.message);
    }
  }

  console.log(
    `[tick] cams=${cameras.length} detections=${detCount} alerts=${alertCount} in ${Date.now() - t0}ms`,
  );
}

console.log(
  `Scoout mock worker ${WORKER_ID} starting: API=${API} tick=${TICK_MS}ms detect_chance=${DETECT_CHANCE}`,
);
tick();
setInterval(tick, TICK_MS);
