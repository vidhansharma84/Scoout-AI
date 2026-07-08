// Mock inference worker for Scoout AI.
//
// Talks to the same 4 internal endpoints the real GPU worker will use:
//   GET  /api/internal/v1/cameras/assigned
//   POST /api/internal/v1/detections
//   POST /api/internal/v1/rule-match
//   POST /api/internal/v1/health
//
// Every TICK_MS, for each camera:
//   - post a health ping,
//   - roll a small chance of a detection; if it fires and the shop has
//     applicable rules, immediately post a rule-match (creating an alert).
//
// Read-only from the DB perspective — this script never touches Postgres
// directly. The moment we swap it for a real GPU worker, the API contract
// is unchanged.

const API = process.env.SCOOUT_API_URL || "http://127.0.0.1:3000";
const TOKEN = process.env.WORKER_TOKEN;
const WORKER_ID = process.env.WORKER_ID || "mock-1";
const TICK_MS = Number(process.env.WORKER_TICK_MS || 30_000);
const DETECT_CHANCE = Number(process.env.WORKER_DETECT_CHANCE || 0.06);

if (!TOKEN) {
  console.error("WORKER_TOKEN is not set — refusing to start");
  process.exit(1);
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

const authHeaders = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: authHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json();
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
    // 1) Health ping — always
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

    // 2) Roll a detection
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

    // 3) If any rules apply, ~35% chance one matches — pick the first
    // (real worker uses the LLM; mock just guesses).
    const applicable = det?.applicableRules ?? [];
    if (applicable.length === 0) continue;
    if (Math.random() > 0.35) continue;
    const rule = applicable[Math.floor(Math.random() * applicable.length)];
    try {
      await api("POST", "/api/internal/v1/rule-match", {
        detectionId: det.detectionId,
        ruleId: rule.id,
        confidence: 0.75 + Math.random() * 0.2,
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
tick(); // one immediately, so the first alert lands within seconds
setInterval(tick, TICK_MS);
