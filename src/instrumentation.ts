// Runs once when the Next.js server boots. Starts the background jobs
// (camera-offline texts, trial reminders, SMS credit watch) on the Node
// runtime only — never on the edge, never during `next build`.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.SCOOUT_JOBS === "off") return;
  const { startJobs } = await import("./lib/jobs");
  startJobs();
}
