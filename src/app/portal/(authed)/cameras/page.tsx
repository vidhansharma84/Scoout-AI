import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import CameraTile from "@/components/portal/CameraTile";
import EmptyCameras from "@/components/portal/EmptyCameras";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { toCameraViewModel } from "@/lib/camera-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CamerasListPage() {
  const me = await currentUser();
  if (!me) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.cameras)
    .where(
      and(
        eq(schema.cameras.shopId, me.shop.id),
        eq(schema.cameras.archived, false),
      ),
    )
    .orderBy(desc(schema.cameras.createdAt));
  const cameras = rows.map((r) => toCameraViewModel(r));
  const live = cameras.filter((c) => c.status === "online").length;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / cameras
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
            All cameras
          </h1>
          <p className="mt-1 text-foreground/60 text-sm">
            {cameras.length === 0
              ? "None yet — connect your first below."
              : `${cameras.length} connected · ${live} live`}
          </p>
        </div>
        {cameras.length > 0 && (
          <Link
            href="/portal/cameras/new"
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
          >
            <span aria-hidden>+</span> Add camera
          </Link>
        )}
      </header>

      {cameras.length === 0 ? (
        <EmptyCameras variant="list" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cameras.map((c) => (
            <CameraTile key={c.id} camera={c} />
          ))}
        </div>
      )}
    </div>
  );
}
