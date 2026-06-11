import { SHOP, USER } from "@/lib/portal-mocks";

export default function SettingsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-4xl">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          / settings
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
          Account
        </h1>
      </header>

      <div className="space-y-6">
        <Card title="Business" subtitle="Shown to your team and on alerts.">
          <Row label="Business name" value={SHOP.name} />
          <Row label="City" value={SHOP.city} />
          <Row label="Plan" value={SHOP.plan} action="Manage" />
        </Card>

        <Card title="Owner" subtitle="Primary account & alert recipient.">
          <Row label="Name" value={USER.name} />
          <Row label="Email" value={USER.email} />
          <Row label="Role" value={USER.role} />
        </Card>

        <Card title="Notification channels" subtitle="How we reach you on critical alerts.">
          <Row label="Push notifications" value="On — Scoout mobile app" action="Configure" />
          <Row label="SMS" value="+233 ••• ••• 4012" action="Configure" />
          <Row label="Phone call (critical only)" value="+233 ••• ••• 4012" action="Configure" />
          <Row label="Email digest" value="Daily at 09:00" action="Configure" />
        </Card>

        <Card title="Team" subtitle="People who can review alerts." footerAction="Invite teammate">
          <TeamRow name="Kojo Mensah" email="kojo@kojosprovisions.com" role="Owner" />
          <TeamRow name="Ama Boateng" email="ama@kojosprovisions.com" role="Reviewer" />
          <TeamRow name="Yaw Owusu" email="yaw@kojosprovisions.com" role="Reviewer" />
        </Card>

        <Card title="Danger zone" tone="danger">
          <Row
            label="Pause all cameras"
            value="Stop AI inference across all 6 cameras"
            action="Pause"
            tone="danger"
          />
          <Row
            label="Delete account"
            value="Permanently remove your business, cameras, and history"
            action="Delete"
            tone="danger"
          />
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  footerAction,
  tone,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerAction?: string;
  tone?: "danger";
}) {
  return (
    <section
      className={`rounded-2xl border bg-surface/40 ${
        tone === "danger" ? "border-red-500/30" : "border-border"
      }`}
    >
      <div className="px-5 sm:px-6 py-4 border-b border-border">
        <h2 className={`font-display text-lg font-semibold ${tone === "danger" ? "text-red-300" : ""}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-foreground/55 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="divide-y divide-border">{children}</div>
      {footerAction && (
        <div className="px-5 sm:px-6 py-3 border-t border-border">
          <button className="text-sm text-accent hover:underline">
            + {footerAction}
          </button>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  action,
  tone,
}: {
  label: string;
  value: string;
  action?: string;
  tone?: "danger";
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-foreground/55 mt-0.5 truncate">{value}</p>
      </div>
      {action && (
        <button
          className={`shrink-0 text-sm transition-colors ${
            tone === "danger"
              ? "text-red-400 hover:text-red-300"
              : "text-foreground/60 hover:text-accent"
          }`}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function TeamRow({ name, email, role }: { name: string; email: string; role: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-foreground/55 truncate">{email}</p>
        </div>
      </div>
      <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/70 shrink-0">
        {role}
      </span>
    </div>
  );
}
