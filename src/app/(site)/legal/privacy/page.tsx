import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Scoout AI",
};

export default function PrivacyPage() {
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        / legal
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-foreground/55 font-mono">
        Effective: 2026-07-14
      </p>

      <div className="mt-10 space-y-8 text-foreground/80 leading-relaxed">
        <Section title="What we collect">
          <ul className="list-disc list-outside pl-6 mt-2 space-y-1">
            <li>
              <strong>Account details</strong> you give us: name, email, phone
              number, business name and location.
            </li>
            <li>
              <strong>Camera stream URLs and credentials</strong> you connect.
              Encrypted at rest.
            </li>
            <li>
              <strong>Frames and clips</strong> our workers pull from those
              streams for detection and evidence.
            </li>
            <li>
              <strong>Detection events</strong>: object classes, timestamps,
              bounding boxes, and the AI&apos;s reasoning.
            </li>
            <li>
              <strong>Usage data</strong>: pages visited, alerts reviewed, and
              basic device information — for product analytics and abuse
              prevention.
            </li>
          </ul>
        </Section>

        <Section title="What we use it for">
          To run the Service — connect your cameras, generate detections and
          alerts, deliver notifications, and store clips you may want to
          review. To secure the Service against fraud and abuse. To
          communicate with you about your account and product updates. Not for
          advertising, ever.
        </Section>

        <Section title="Who sees your footage">
          Only you (and teammates you invite), Scoout engineers who need
          access to debug the Service, and our AI inference workers running
          under our contract. We do not sell footage. We do not share it with
          governments or third parties except when compelled by valid legal
          process, and we&apos;ll challenge overly broad requests.
        </Section>

        <Section title="Where it lives">
          Application data (accounts, cameras, alerts, watchlist rules) lives
          in a Postgres database in a data centre in France. Event clips and
          snapshots live on either the same server or (as we scale) on
          Backblaze B2 / Cloudflare R2 storage. Cloudflare fronts all our
          public endpoints.
        </Section>

        <Section title="Retention">
          <ul className="list-disc list-outside pl-6 mt-2 space-y-1">
            <li>Alert clips: 14 days on trial and starter plans.</li>
            <li>Detection events (metadata): 90 days.</li>
            <li>Account data: for as long as your account is active.</li>
            <li>After you delete a resource, we purge it from primary storage
              immediately and from backups within 30 days.</li>
          </ul>
        </Section>

        <Section title="Your rights">
          You can access, correct, export, or delete your data from the
          portal or by writing to{" "}
          <a href="mailto:privacy@scoout.app" className="text-accent hover:underline">
            privacy@scoout.app
          </a>
          . We respond within 30 days.
        </Section>

        <Section title="Third parties we use">
          <ul className="list-disc list-outside pl-6 mt-2 space-y-1">
            <li>Cloudflare — CDN + WAF + tunnel.</li>
            <li>Anthropic / Google — LLM vision inference on triggered frames.</li>
            <li>Backblaze B2 / Cloudflare R2 — clip storage.</li>
            <li>Africa&apos;s Talking — SMS and phone-call delivery.</li>
            <li>Firebase Cloud Messaging — mobile push.</li>
            <li>Resend — transactional email.</li>
            <li>Paystack — payments.</li>
          </ul>
          Each of these processes only the data required to deliver its
          function, under a data-processing agreement with us.
        </Section>

        <Section title="Cookies">
          We use HTTP-only auth cookies to keep you signed in. No third-party
          ad or tracking cookies.
        </Section>

        <Section title="Contact">
          <a href="mailto:privacy@scoout.app" className="text-accent hover:underline">
            privacy@scoout.app
          </a>{" "}
          for any privacy question, correction, or deletion request.
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-foreground mb-3">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
