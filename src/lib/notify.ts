// Who gets texted about what. Every function here is fire-and-forget safe:
// it never throws, because the thing it reports on is already stored.
//
// Shop notifications go to every team member with a phone on file.
// Internal notifications (new leads, low credit) go to SCOOUT_TEAM_PHONES,
// a comma-separated list — e.g. Hassan and Zerk.

import { and, eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Alert, Camera, Shop } from "@/db/schema";

type CameraRef = Pick<Camera, "id" | "shopId" | "name">;
type ShopRef = Pick<Shop, "id" | "name" | "trialEndsAt">;
import type { Submission } from "./submissions";
import { sendSms, sendVoiceCall } from "./sms";

export function appUrl(): string {
  return (process.env.APP_URL || "https://scoout.ai").replace(/\/$/, "");
}

async function teamPhones(shopId: string, ownersOnly = false): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ phone: schema.users.phone })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.shopId, shopId),
        isNotNull(schema.users.phone),
        ownersOnly ? eq(schema.users.role, "owner") : undefined,
      ),
    );
  return rows.map((r) => r.phone).filter((p): p is string => !!p);
}

function scooutTeamPhones(): string[] {
  return (process.env.SCOOUT_TEAM_PHONES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function safely(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error(`[notify:${label}] failed:`, e);
  }
}

// Critical alerts (fire, smoke, anything a worker marks critical): SMS the
// whole team, and for fire also ring them if a voice recording is configured.
export function notifyCriticalAlert(alert: Alert): Promise<void> {
  return safely("alert", async () => {
    if (alert.severity !== "critical") return;
    const phones = await teamPhones(alert.shopId);
    if (phones.length === 0) return;

    await sendSms({
      to: phones,
      message:
        `SCOOUT ALERT: ${alert.type}\n${alert.summary}\n` +
        `Review: ${appUrl()}/portal/alerts/${alert.id}`,
    });
    if (/fire|smoke/i.test(alert.type)) {
      await sendVoiceCall({ to: phones, campaign: `Scoout ${alert.type}` });
    }
  });
}

export function notifyCameraOffline(cam: CameraRef): Promise<void> {
  return safely("camera-offline", async () => {
    const phones = await teamPhones(cam.shopId);
    await sendSms({
      to: phones,
      message:
        `Scoout: camera "${cam.name}" has stopped sending video, so it is not ` +
        `being watched right now. Check its power and internet. ` +
        `${appUrl()}/portal/cameras/${cam.id}`,
    });
  });
}

export function notifyCameraBackOnline(cam: CameraRef): Promise<void> {
  return safely("camera-online", async () => {
    const phones = await teamPhones(cam.shopId);
    await sendSms({
      to: phones,
      message: `Scoout: camera "${cam.name}" is back online and being watched again.`,
    });
  });
}

export function notifyTrialEnding(shop: ShopRef): Promise<void> {
  return safely("trial", async () => {
    const phones = await teamPhones(shop.id, true);
    const days = Math.max(
      1,
      Math.ceil((shop.trialEndsAt.getTime() - Date.now()) / 86_400_000),
    );
    await sendSms({
      to: phones,
      message:
        `Scoout: your free trial for ${shop.name} ends in ${days} day${days === 1 ? "" : "s"}. ` +
        `To keep your cameras protected, call or WhatsApp +233 50 381 8938.`,
    });
  });
}

export function notifyNewLead(rec: Submission): Promise<void> {
  return safely("lead", async () => {
    const phones = scooutTeamPhones();
    if (phones.length === 0) return;
    const contact = [rec.phone, rec.email].filter(Boolean).join(" / ");
    const where = [rec.businessName, rec.businessType, rec.city].filter(Boolean).join(", ");
    await sendSms({
      to: phones,
      message: `New Scoout lead: ${rec.name} — ${contact}${where ? `\n${where}` : ""}`,
    });
  });
}

export function notifyLowCredit(balance: number): Promise<void> {
  return safely("credit", async () => {
    const phones = scooutTeamPhones();
    if (phones.length === 0) return;
    await sendSms({
      to: phones,
      message:
        `Scoout: mNotify SMS credit is low (${balance} left). Top up soon — ` +
        `when it runs out, fire alerts stop reaching customers.`,
    });
  });
}
