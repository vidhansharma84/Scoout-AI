"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { SHOP, USER, STATS } from "@/lib/portal-mocks";

type Me = {
  user: { name: string | null; email: string; initials: string | null };
  shop: { name: string; city: string | null; plan: string };
};

const NAV: { href: string; label: string; icon: string; badge?: () => string }[] = [
  { href: "/portal", label: "Dashboard", icon: "▦" },
  { href: "/portal/cameras", label: "Cameras", icon: "◉", badge: () => `${STATS.camerasOnline}/${STATS.camerasTotal}` },
  { href: "/portal/alerts", label: "Alerts", icon: "⚑", badge: () => String(STATS.alertsOpen) },
  { href: "/portal/watchlist", label: "Watchlist", icon: "❖" },
  { href: "/portal/team", label: "Team", icon: "◈" },
  { href: "/portal/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch("/api/v1/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMe(d))
      .catch(() => {});
  }, []);
  const shopName = me?.shop.name ?? SHOP.name;
  const shopCity = me?.shop.city ?? SHOP.city;
  const userName = me?.user.name ?? USER.name;
  const userEmail = me?.user.email ?? USER.email;
  const userInitials = me?.user.initials ?? USER.initials;
  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex-col border-r border-border bg-surface/40 backdrop-blur">
      <div className="px-5 py-5 flex items-center gap-3">
        <Logo className="w-8 h-8" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
            Scoout AI
          </p>
          <p className="font-display font-semibold leading-none">Portal</p>
        </div>
      </div>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-border bg-background/40 px-3 py-2.5">
          <p className="text-sm font-medium truncate">{shopName}</p>
          <p className="text-[11px] text-foreground/55 mt-0.5">{shopCity}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/portal" ? path === "/portal" : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-accent/15 text-foreground border border-accent/30"
                  : "text-foreground/70 hover:text-foreground hover:bg-surface"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`text-base ${active ? "text-accent" : "text-foreground/50"}`}
                  aria-hidden
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    active
                      ? "bg-accent text-background"
                      : "bg-surface-2 text-foreground/60"
                  }`}
                >
                  {item.badge()}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-sm font-semibold">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-[11px] text-foreground/55 truncate">{userEmail}</p>
          </div>
          <button
            title="Sign out"
            onClick={async () => {
              await fetch("/api/v1/auth/logout", { method: "POST" });
              window.location.href = "/portal/login";
            }}
            className="text-foreground/40 hover:text-foreground transition-colors text-sm"
          >
            ↗
          </button>
        </div>
      </div>
    </aside>
  );
}
