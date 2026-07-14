import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Scoout AI",
};

export default function TermsPage() {
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        / legal
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-foreground/55 font-mono">
        Effective: 2026-07-14
      </p>

      <div className="mt-10 space-y-8 text-foreground/80 leading-relaxed">
        <Section title="1. Who we are">
          Scoout AI (&quot;Scoout&quot;, &quot;we&quot;, &quot;us&quot;) is a
          surveillance-intelligence service operated by Moondoog Technologies.
          By using our website, mobile apps, portal, or APIs (together, the
          &quot;Service&quot;), you agree to these Terms.
        </Section>

        <Section title="2. What Scoout does">
          Scoout plugs into your existing CCTV or NVR cameras and applies AI
          detection models to help you notice suspicious activity, smoke, fire,
          and other events you configure. Scoout does not replace human
          judgement, an alarm-response service, or emergency services.
        </Section>

        <Section title="3. Your account">
          You must give us accurate registration details, keep your credentials
          confidential, and be legally allowed to operate the cameras you
          connect. You are responsible for anything anyone does under your
          account. Notify us immediately at security@scoout.app if you suspect
          unauthorized access.
        </Section>

        <Section title="4. Camera footage & privacy">
          You are the controller of the footage you send us. You must have the
          right to record every location a Scoout-connected camera monitors,
          and you must display clear notices where required by law. We process
          footage only to run the Service (detection, alerts, clip storage) and
          never sell footage to third parties. Our Privacy Policy explains this
          in more detail.
        </Section>

        <Section title="5. Acceptable use">
          Don&apos;t use Scoout to monitor spaces where people have a
          reasonable expectation of privacy (bathrooms, changing rooms, private
          residences you don&apos;t own), to harass individuals, to violate any
          person&apos;s legal rights, or for any purpose that violates
          applicable law.
        </Section>

        <Section title="6. Fees & billing">
          Some features are only available on paid plans. Fees are billed per
          the plan you choose. We may adjust prices with 30 days&apos; notice
          for existing customers. Cancellations take effect at the end of the
          current billing period. Refunds are handled case-by-case, in good
          faith.
        </Section>

        <Section title="7. Availability">
          We aim for high uptime but the Service is provided
          &quot;as-is&quot;. We do not guarantee that every event will be
          detected, that alerts will always be delivered instantly, or that the
          Service will be uninterrupted. You are responsible for maintaining
          appropriate physical security controls independent of Scoout.
        </Section>

        <Section title="8. Data retention">
          Alert clips and snapshots are retained for 14 days on the trial and
          starter plans, longer on higher plans. You can delete data manually
          from the portal at any time. Backups may take up to 30 additional
          days to fully purge.
        </Section>

        <Section title="9. Termination">
          You can cancel your account at any time from the portal. We may
          suspend or terminate accounts that violate these Terms, that we
          reasonably believe pose a security or legal risk, or that stay
          unpaid past their grace period.
        </Section>

        <Section title="10. Liability">
          To the fullest extent allowed by law, Scoout&apos;s aggregate
          liability under these Terms is limited to the amount you paid us in
          the 12 months before the claim arose. We are not liable for
          indirect, incidental, or consequential damages including property
          loss, business interruption, or damages arising from a missed alert.
        </Section>

        <Section title="11. Changes">
          We may update these Terms. Material changes will be communicated
          via the portal or email at least 14 days before they take effect.
          Continued use after the effective date means you accept the update.
        </Section>

        <Section title="12. Contact">
          Questions:{" "}
          <a href="mailto:hello@scoout.app" className="text-accent hover:underline">
            hello@scoout.app
          </a>
          .<br />
          Security disclosures:{" "}
          <a href="mailto:security@scoout.app" className="text-accent hover:underline">
            security@scoout.app
          </a>
          .
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
      <p>{children}</p>
    </section>
  );
}
