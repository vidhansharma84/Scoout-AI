"use client";

import { motion } from "framer-motion";
import {
  FaWhatsapp,
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

type Channel = {
  label: string;
  value: string;
  href: string;
  hint?: string;
  icon: React.ReactNode;
};

const channels: Channel[] = [
  {
    label: "Call — Ghana",
    value: "+233 50 381 8938",
    hint: "Accra HQ",
    href: "tel:+233503818938",
    icon: <PhoneIcon />,
  },
  {
    label: "Call — Canada",
    value: "+1 (647) 765-8028",
    hint: "Toronto",
    href: "tel:+16477658028",
    icon: <PhoneIcon />,
  },
  {
    label: "Email us",
    value: "hello@scoout.app",
    hint: "we reply within one business day",
    href: "mailto:hello@scoout.app",
    icon: <MailIcon />,
  },
];

const socials = [
  {
    label: "WhatsApp",
    href: "https://wa.me/233503818938",
    icon: <FaWhatsapp className="h-4 w-4" />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/linkedin.com.scout.com.co/",
    icon: <FaLinkedinIn className="h-4 w-4" />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1Eu8RGN5QC/?mibextid=wwXIfr",
    icon: <FaFacebookF className="h-4 w-4" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/scoout.ai?igsh=MWg3M2VwMXB3NnR2YQ%3D%3D&utm_source=qr",
    icon: <FaInstagram className="h-4 w-4" />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@scoout.ai?_r=1&_t=ZS-96NzPGRfWUf",
    icon: <FaTiktok className="h-4 w-4" />,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/scooutai?s=11",
    icon: <FaXTwitter className="h-4 w-4" />,
  },
];

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / contact us
            </p>
            <h2 className="mt-4 font-display text-5xl sm:text-6xl font-semibold leading-[1.02] text-balance">
              Talk to a<br />
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                human at Scoout.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-foreground/70 text-base sm:text-lg">
              Two offices, one team. Call or WhatsApp us in Ghana, Canada — or
              just send an email. We answer every message.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid place-items-center h-10 w-10 rounded-full border border-border bg-surface/60 text-foreground/75 hover:text-accent hover:border-accent/50 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-1">
              {channels.map((c, i) => (
                <motion.a
                  key={c.value}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    delay: 0.08 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative flex items-center gap-5 rounded-2xl border border-border bg-surface/60 hover:bg-surface hover:border-accent/40 px-5 py-5 sm:px-6 sm:py-6 transition-colors"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 border border-accent/30 text-accent">
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/50">
                      {c.label}
                    </p>
                    <p className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-foreground group-hover:text-accent transition-colors">
                      {c.value}
                    </p>
                    {c.hint && (
                      <p className="mt-1 text-sm text-foreground/55">{c.hint}</p>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className="text-foreground/35 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-2xl"
                  >
                    →
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
