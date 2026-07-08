// Minimal migration runner: applies each .sql file in src/db/migrations in
// filename order, records applied ones in a schema_migrations table.
// Idempotent — safe to run on every deploy.

import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;

  const dir = path.join(process.cwd(), "src", "db", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const already = await sql`SELECT 1 FROM schema_migrations WHERE name = ${file}`;
    if (already.length) {
      console.log(`✓ ${file} (already applied)`);
      continue;
    }
    const contents = fs.readFileSync(path.join(dir, file), "utf-8");
    console.log(`→ applying ${file}...`);
    await sql.unsafe(contents);
    await sql`INSERT INTO schema_migrations (name) VALUES (${file})`;
    console.log(`✓ ${file}`);
  }

  await sql.end();
  console.log("Migrations done.");
}

main().catch(async (e) => {
  console.error(e);
  try {
    await sql.end();
  } catch {}
  process.exit(1);
});
