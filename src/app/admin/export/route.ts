import { listSubmissions, type Submission } from "@/lib/submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const submissions = await listSubmissions();

  const columns: (keyof Submission)[] = [
    "createdAt",
    "name",
    "phone",
    "email",
    "city",
    "businessName",
    "businessType",
  ];

  const lines = [columns.join(",")];
  for (const s of submissions) {
    lines.push(columns.map((c) => csvEscape(s[c])).join(","));
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scoout-submissions-${today}.csv"`,
    },
  });
}
