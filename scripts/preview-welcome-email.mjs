// Render the access-request welcome email to an HTML file so the template can
// be eyeballed in a browser without sending anything.
//
//   node scripts/preview-welcome-email.mjs [outfile]
//
// Uses the same renderWelcomeEmail() the API route uses, so what you see here
// is what a prospect receives.

import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Let Node import the .ts source directly (Node 22.6+ type stripping).
try {
  register("data:text/javascript,", pathToFileURL("./"));
} catch {
  /* not needed on newer Node */
}

const { renderWelcomeEmail } = await import("../src/lib/welcome-email.ts");

const sample = {
  id: "preview",
  createdAt: new Date().toISOString(),
  name: "Kojo Mensah",
  phone: "+233 50 381 8938",
  email: "kojo@kojosprovisions.com",
  city: "Accra",
  businessName: "Kojo's Provisions",
  businessType: "Retail store",
};

const { subject, html, text } = renderWelcomeEmail(sample, "https://scoout.ai");

const out = path.resolve(process.argv[2] ?? "welcome-email-preview.html");
fs.writeFileSync(out, html, "utf-8");

console.log("subject:", subject);
console.log("written:", out);
console.log("\n--- plain text version ---\n");
console.log(text);
