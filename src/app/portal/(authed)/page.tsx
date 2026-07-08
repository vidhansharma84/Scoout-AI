import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import CameraTile from "@/components/portal/CameraTile";
import EmptyCameras from "@/components/portal/EmptyCameras";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { toCameraViewModel } from "@/lib/camera-view";
import { ALERTS, severityClasses, timeAgo } from "@/lib/portal-mocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PortalDashboard() {
  const me = await currentUser();
  // Middleware guarantees me is present, but be defensive.
  if (!me) return null;

  const db = getDb();
  const cameraRows = await db
    .select()
    .from(schema.cameras)
    .where(
      and(
        eq(schema.cameras.shopId, me.shop.id),
        eq(schema.cameras.archived, false),
      ),
    )
    .orderBy(desc(schema.cameras.createdAt));
  const cameras = cameraRows.map((r) => toCameraViewModel(r));

  // Alerts still mocked in Week 2 — Week 3 replaces them. Empty for new users
  // so the dashboard doesn't lie.
  const recentAlerts = cameras.length > 0 ? ALERTS.slice(0, 4) : [];

  const camerasOnline = cameras.filter((c) => c.status === "online").length;
  const camerasTotal = cameras.length;
  const openAlerts = recentAlerts.filter((a) => a.status === "open").length;
  const firstName = (me.user.name ?? "there").split(" ")[0];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / live dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-foreground/60 text-sm">
            {me.shop.name}
            {me.shop.city ? ` — ${me.shop.city}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/portal/cameras/new"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-2 text-sm transition-colors"
          >
            <span aria-hidden>+</span> Add camera
          </Link>
          <Link
            href="/portal/watchlist"
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-4 py-2 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
          >
            Watchlist
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          label="Cameras online"
          value={`${camerasOnline} / ${camerasTotal}`}
          hint={
            camerasTotal === 0
              ? "connect your first"
              : camerasOnline === camerasTotal
                ? "all good"
                : `${camerasTotal - camerasOnline} offline`
          }
          tone={
            camerasTotal === 0
              ? "neutral"
              : camerasOnline === camerasTotal
                ? "ok"
                : "warn"
          }
        />
        <StatCard
          label="Open alerts"
          value={String(openAlerts)}
          hint={
            camerasTotal === 0
              ? "no cameras yet"
              : `${recentAlerts.length} in last 24h`
          }
          tone={openAlerts > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Hours monitored today"
          value={camerasTotal === 0 ? "0.0" : "30.4"}
          hint={
            camerasTotal === 0 ? "no cameras yet" : "across all cameras"
          }
        />
        <StatCard
          label="Model latency"
          value="38ms"
          hint="p95"
          tone="ok"
        />
      </section>

      {camerasTotal === 0 ? (
        <EmptyCameras variant="dashboard" />
      ) : (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
                / cameras
              </p>
              <h2 className="font-display text-2xl font-semibold mt-1">
                Live cameras
              </h2>
            </div>
            <Link
              href="/portal/cameras"
              className="text-sm text-foreground/60 hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cameras.map((cam) => (
              <CameraTile key={cam.id} camera={cam} />
            ))}
          </div>
        </section>
      )}

      {recentAlerts.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
                / alerts
              </p>
              <h2 className="font-display text-2xl font-semibold mt-1">
                Recent activity
              </h2>
            </div>
            <Link
              href="/portal/alerts"
              className="text-sm text-foreground/60 hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden divide-y divide-border">
            {recentAlerts.map((a) => {
              const sc = severityClasses(a.severity);
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-4 px-4 sm:px-5 py-4 hover:bg-surface-2/30 transition-colors"
                >
                  <div
                    className={`shrink-0 grid h-10 w-10 place-items-center rounded-xl border ${sc.border} ${sc.bg}`}
                  >
                    <span aria-hidden className="text-base">
                      {sc.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${sc.text}`}>
                        {a.type}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/45 uppercase tracking-wider">
                        {a.cameraLabel}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/45">
                        · {timeAgo(a.at)}
                      </span>
                      {a.status !== "open" && (
                        <span className="ml-auto sm:ml-0 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-foreground/55">
                          {a.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground/75 line-clamp-2">
                      {a.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn" | "neutral";
}) {
  const dot =
    tone === "ok"
      ? "bg-emerald-400"
      : tone === "warn"
        ? "bg-accent"
        : "bg-foreground/30";
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}
