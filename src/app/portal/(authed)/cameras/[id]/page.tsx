import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import CameraLive from "@/components/portal/CameraLive";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { toCameraViewModel } from "@/lib/camera-view";
import { statusColor } from "@/lib/portal-mocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function CameraDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) return null;

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.cameras)
    .where(
      and(
        eq(schema.cameras.id, id),
        eq(schema.cameras.shopId, me.shop.id),
        eq(schema.cameras.archived, false),
      ),
    )
    .limit(1);
  if (!row) notFound();

  const cam = toCameraViewModel(row);
  const dotColor = statusColor(cam.status);
  const isOffline = cam.status === "offline";

  // Events land in Week 3. For now show the "AI is watching" empty state.
  const events: never[] = [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <nav className="mb-4 text-sm">
        <Link
          href="/portal/cameras"
          className="text-foreground/55 hover:text-foreground transition-colors"
        >
          Cameras
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">{cam.name}</span>
      </nav>

      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
            / camera · {cam.name}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold flex items-center gap-3">
            {cam.location || cam.name}
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2 py-0.5 text-xs font-medium text-foreground/75 uppercase tracking-wider"
              style={{ borderColor: `${dotColor}55` }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isOffline ? "" : "blink"}`}
                style={{ background: dotColor }}
              />
              {cam.status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            {cam.resolution} · {cam.fps}fps · {row.protocol.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-2 text-sm transition-colors">
            Snapshot
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-2 text-sm transition-colors">
            Edit
          </button>
          <button className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-4 py-2 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors">
            Add rule
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CameraLive camera={cam} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Meta label="Model" value="Scoout v3.2" />
            <Meta label="p95 latency" value="—" />
            <Meta label="Stream" value={`${row.protocol.toUpperCase()} · h.264`} />
            <Meta label="Recording" value="14 days · cloud" />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-surface/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
              / events
            </p>
            <h3 className="font-display text-lg font-semibold mt-1 mb-4">
              On this camera
            </h3>

            {events.length === 0 && (
              <p className="text-sm text-foreground/55 text-center py-8">
                No alerts on this camera yet. The AI is watching.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
