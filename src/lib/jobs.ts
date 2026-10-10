// In-process background jobs, started once from src/instrumentation.ts.
// The app runs as a single long-lived `next start` process (scoout.service),
// so a timer here is enough — no separate cron needed.
//
// Each job claims its rows with an UPDATE ... RETURNING before texting, so a
// row is only ever notified once even if two ticks overlap.

import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  notifyCameraOffline,
  notifyLowCredit,
  notifyTrialEnding,
} from "./notify";
import { smsBalance } from "./sms";

const TICK_MS = 5 * 60 * 1000;
const CAMERA_STALE = "10 minutes";
const TRIAL_WARN = "3 days";
const CREDIT_CHECK_MS = 60 * 60 * 1000;
const CREDIT_REWARN_MS = 24 * 60 * 60 * 1000;

let lastCreditCheck = 0;
let lastCreditWarn = 0;

// Cameras whose worker says offline, or that haven't sent a frame / a health
// report in CAMERA_STALE. Cameras with no health row (phone nodes) are skipped.
async function staleCameras(): Promise<void> {
  const db = getDb();
  const rows = await db.execute(sql`
    UPDATE ${schema.cameras} c
       SET offline_notified_at = now(), status = 'offline'
      FROM ${schema.cameraHealth} h
     WHERE h.camera_id = c.id
       AND c.archived = false
       AND c.offline_notified_at IS NULL
       AND (h.stream_state = 'offline'
            OR h.last_frame_at < now() - ${CAMERA_STALE}::interval
            OR h.updated_at < now() - ${CAMERA_STALE}::interval)
    RETURNING c.id, c.shop_id AS "shopId", c.name
  `);
  for (const cam of rows as unknown as { id: string; shopId: string; name: string }[]) {
    await notifyCameraOffline(cam);
  }
}

async function trialReminders(): Promise<void> {
  const db = getDb();
  const rows = await db.execute(sql`
    UPDATE ${schema.shops}
       SET trial_reminder_sent_at = now()
     WHERE plan = 'trial'
       AND trial_reminder_sent_at IS NULL
       AND trial_ends_at > now()
       AND trial_ends_at < now() + ${TRIAL_WARN}::interval
    RETURNING id, name, trial_ends_at AS "trialEndsAt"
  `);
  for (const r of rows as unknown as { id: string; name: string; trialEndsAt: string | Date }[]) {
    await notifyTrialEnding({ ...r, trialEndsAt: new Date(r.trialEndsAt) });
  }
}

async function creditCheck(): Promise<void> {
  const now = Date.now();
  if (now - lastCreditCheck < CREDIT_CHECK_MS) return;
  lastCreditCheck = now;
  const balance = await smsBalance();
  const floor = Number(process.env.MNOTIFY_LOW_CREDIT ?? 100);
  if (balance !== null && balance < floor && now - lastCreditWarn > CREDIT_REWARN_MS) {
    lastCreditWarn = now;
    await notifyLowCredit(balance);
  }
}

async function tick(): Promise<void> {
  for (const [name, job] of [
    ["cameras", staleCameras],
    ["trials", trialReminders],
    ["credit", creditCheck],
  ] as const) {
    try {
      await job();
    } catch (e) {
      console.error(`[jobs:${name}] failed:`, e);
    }
  }
}

const g = globalThis as unknown as { scooutJobs?: NodeJS.Timeout };

export function startJobs(): void {
  if (g.scooutJobs || !process.env.DATABASE_URL) return;
  g.scooutJobs = setInterval(() => void tick(), TICK_MS);
  // First run shortly after boot, not during it.
  setTimeout(() => void tick(), 30_000);
  console.log("[jobs] started — every %ds", TICK_MS / 1000);
}
