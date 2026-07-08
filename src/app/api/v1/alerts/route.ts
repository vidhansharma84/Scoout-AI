// GET /api/v1/alerts?status=&severity=&camera=&cursor=&limit=

import { NextResponse } from "next/server";
import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEVERITIES = new Set(["critical", "warn", "info"]);
const STATUSES = new Set(["open", "reviewed", "dismissed"]);

export async function GET(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status") ?? undefined;
  const severityParam = url.searchParams.get("severity") ?? undefined;
  const cameraParam = url.searchParams.get("camera") ?? undefined;
  const cursor = url.searchParams.get("cursor"); // ISO date-time of `at`
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);

  const conds = [eq(schema.alerts.shopId, me.shop.id)];
  if (statusParam && STATUSES.has(statusParam)) {
    conds.push(eq(schema.alerts.status, statusParam));
  }
  if (severityParam && SEVERITIES.has(severityParam)) {
    conds.push(eq(schema.alerts.severity, severityParam));
  }
  if (cameraParam) {
    conds.push(eq(schema.alerts.cameraId, cameraParam));
  }
  if (cursor) {
    const d = new Date(cursor);
    if (!isNaN(d.getTime())) conds.push(lt(schema.alerts.at, d));
  }

  const db = getDb();
  const rows = await db
    .select({
      id: schema.alerts.id,
      cameraId: schema.alerts.cameraId,
      ruleId: schema.alerts.ruleId,
      type: schema.alerts.type,
      severity: schema.alerts.severity,
      summary: schema.alerts.summary,
      status: schema.alerts.status,
      at: schema.alerts.at,
      reasoning: schema.alerts.reasoning,
      cameraName: schema.cameras.name,
      cameraLocation: schema.cameras.location,
    })
    .from(schema.alerts)
    .leftJoin(schema.cameras, eq(schema.cameras.id, schema.alerts.cameraId))
    .where(and(...conds))
    .orderBy(desc(schema.alerts.at))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Summary counts for the filter chips (all statuses/severities, ignoring
  // whatever filter the user is currently applying).
  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${schema.alerts.status} = 'open')::int`,
      reviewed: sql<number>`count(*) filter (where ${schema.alerts.status} = 'reviewed')::int`,
      dismissed: sql<number>`count(*) filter (where ${schema.alerts.status} = 'dismissed')::int`,
      critical: sql<number>`count(*) filter (where ${schema.alerts.severity} = 'critical')::int`,
      warn: sql<number>`count(*) filter (where ${schema.alerts.severity} = 'warn')::int`,
    })
    .from(schema.alerts)
    .where(eq(schema.alerts.shopId, me.shop.id));

  return NextResponse.json({
    alerts: page.map((r) => ({
      id: r.id,
      cameraId: r.cameraId,
      cameraLabel:
        r.cameraName != null
          ? r.cameraName + (r.cameraLocation ? " · " + r.cameraLocation : "")
          : "Unknown camera",
      type: r.type,
      severity: r.severity,
      summary: r.summary,
      status: r.status,
      at: r.at,
      reasoning: r.reasoning,
    })),
    counts,
    nextCursor: hasMore ? page[page.length - 1].at.toISOString() : null,
  });
  void or;
}
