import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { signDownloadUrl } from "@/lib/clip-storage";
import { severityClasses, timeAgo, type AlertViewSeverity } from "@/lib/alert-view";
import AlertActions from "@/components/portal/AlertDetailActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) return null;
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.alerts)
    .where(and(eq(schema.alerts.id, id), eq(schema.alerts.shopId, me.shop.id)))
    .limit(1);
  if (!row) notFound();

  let cameraLabel = "Unknown camera";
  let cameraId: string | null = row.cameraId;
  if (row.cameraId) {
    const [cam] = await db
      .select({ name: schema.cameras.name, location: schema.cameras.location })
      .from(schema.cameras)
      .where(eq(schema.cameras.id, row.cameraId))
      .limit(1);
    if (cam) cameraLabel = cam.name + (cam.location ? ` · ${cam.location}` : "");
  }
  const clipUrl = row.clipKey ? await signDownloadUrl(row.clipKey, 3600) : null;

  const sc = severityClasses(row.severity as AlertViewSeverity);

  let rulePrompt: string | null = null;
  if (row.ruleId) {
    const [rule] = await db
      .select({ prompt: schema.rules.prompt })
      .from(schema.rules)
      .where(eq(schema.rules.id, row.ruleId))
      .limit(1);
    rulePrompt = rule?.prompt ?? null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-5xl">
      <nav className="mb-4 text-sm">
        <Link
          href="/portal/alerts"
          className="text-foreground/55 hover:text-foreground transition-colors"
        >
          Alerts
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">{row.type}</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          / {row.severity}
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${sc.border} ${sc.bg}`}
            aria-hidden
          >
            {sc.icon}
          </span>
          {row.type}
        </h1>
        <p className="mt-2 text-foreground/60 text-sm">
          {cameraLabel} · {new Date(row.at).toLocaleString()} ({timeAgo(row.at)})
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-surface/50 overflow-hidden">
            {clipUrl ? (
              <video
                controls
                autoPlay
                muted
                playsInline
                loop
                className="w-full aspect-video bg-black"
                src={clipUrl}
              />
            ) : (
              <div className="aspect-video bg-surface-2 flex flex-col items-center justify-center text-center px-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-foreground/45">
                  No clip attached
                </p>
                <p className="mt-2 text-sm text-foreground/60 max-w-sm">
                  This alert was captured before clip recording came online, or
                  the worker didn&apos;t upload one.
                </p>
              </div>
            )}
          </div>

          <section className="rounded-2xl border border-border bg-surface/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55 mb-2">
              / what happened
            </p>
            <p className="text-foreground/85 text-[15px] leading-relaxed">
              {row.summary}
            </p>
            {row.reasoning && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55 mt-6 mb-2">
                  / ai reasoning
                </p>
                <p className="text-foreground/75 text-sm leading-relaxed">
                  {row.reasoning}
                </p>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <AlertActions
            id={row.id}
            status={row.status as "open" | "reviewed" | "dismissed"}
          />

          <div className="rounded-2xl border border-border bg-surface/40 p-4 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55 mb-3">
              / details
            </p>
            <dl className="space-y-3">
              <Row label="Camera" value={cameraLabel} />
              {rulePrompt && (
                <Row label="Rule" value={<span className="italic">&quot;{rulePrompt}&quot;</span>} />
              )}
              <Row label="Severity" value={row.severity} />
              <Row label="Status" value={row.status} />
              <Row label="Detected" value={new Date(row.at).toLocaleString()} />
              <Row label="Alert id" value={<code className="font-mono text-xs">{row.id.slice(0, 12)}…</code>} />
            </dl>
            {cameraId && (
              <Link
                href={`/portal/cameras/${cameraId}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                Open camera →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground/85">{value}</dd>
    </div>
  );
}
