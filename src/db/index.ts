// Singleton Postgres client for the Node runtime (API routes only, not middleware).

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

function getSql() {
  if (globalForDb.sql) return globalForDb.sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. See systemd drop-in /etc/systemd/system/scoout.service.d/override.conf",
    );
  }
  const sql = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  globalForDb.sql = sql;
  return sql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}

export { schema };
