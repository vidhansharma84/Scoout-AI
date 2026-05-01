"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function RequestForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="request" className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / request access
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[1.0] text-balance">
              Turn your CCTV into a
              <br />
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                business security guard.
              </span>
            </h2>
            <p className="mt-6 text-foreground/70 text-base sm:text-lg max-w-md">
              Fire outbreaks destroy businesses and homes. Night robbers and
              insider threats are actively working to collapse your business.
              Get peace of mind — request access today.
            </p>
            <ul className="mt-8 space-y-2 text-foreground/75">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Free pilot for qualifying sites
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live setup in under 24 hours
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Cancel any time
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-10 backdrop-blur-xl"
            >
              {submitted ? (
                <SuccessCard />
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" name="name" placeholder="Your full name" />
                    <Field label="Phone" name="phone" type="tel" placeholder="+233 ..." />
                    <Field label="Email" name="email" type="email" placeholder="you@business.com" />
                    <Field label="City / Town" name="city" placeholder="Accra" />
                  </div>

                  <div className="mt-5">
                    <Field
                      label="Type of site"
                      name="site"
                      placeholder="Retail store, supermarket, hotel, petrol station..."
                    />
                  </div>

                  <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-xs text-foreground/55 max-w-sm">
                      By submitting, you agree to receive a follow-up call or
                      message from Scoout AI to set up your demo.
                    </p>
                    <button
                      type="submit"
                      className="btn-shine inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-6 py-3.5 font-medium glow-orange hover:bg-accent-2 transition-colors"
                    >
                      Request access
                      <span aria-hidden>→</span>
                    </button>
                  </div>
                </>
              )}
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background"
      />
    </label>
  );
}

function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="text-center py-8"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 border border-accent/30 text-2xl">
        ✓
      </div>
      <h3 className="mt-5 font-display text-3xl font-semibold">You&apos;re on the list.</h3>
      <p className="mt-2 text-foreground/65 max-w-md mx-auto">
        We&apos;ll reach out within 24 hours with next steps for your demo.
      </p>
    </motion.div>
  );
}
