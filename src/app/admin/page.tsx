import { listSubmissions } from "@/lib/submissions";
import Logo from "@/components/Logo";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const submissions = await listSubmissions();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
                Scoout AI
              </p>
              <p className="font-display text-lg font-semibold leading-none">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              ← Back to site
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / demo requests
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">
              {submissions.length}{" "}
              <span className="text-foreground/50 font-medium">
                {submissions.length === 1 ? "submission" : "submissions"}
              </span>
            </h1>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/export"
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
            >
              Export CSV
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/50 p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-display text-xl font-semibold">No submissions yet</p>
            <p className="mt-2 text-foreground/60 max-w-sm mx-auto">
              When someone fills out the demo request form on the landing page, it&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-surface/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 text-foreground/55 text-[10px] uppercase tracking-[0.18em]">
                    <th className="text-left px-4 py-3 whitespace-nowrap">When</th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">City</th>
                    <th className="text-left px-4 py-3">Business</th>
                    <th className="text-left px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-border hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground/65 whitespace-nowrap font-mono text-xs">
                        {new Date(s.createdAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${s.phone}`}
                          className="text-foreground/80 hover:text-accent"
                        >
                          {s.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${s.email}`}
                          className="text-foreground/80 hover:text-accent"
                        >
                          {s.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {s.city || <span className="text-foreground/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {s.businessName || <span className="text-foreground/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {s.businessType || <span className="text-foreground/30">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-foreground/40 font-mono">
          Newest first. Data stored at <code className="text-foreground/60">data/submissions.ndjson</code> on the server.
        </p>
      </div>
    </div>
  );
}
