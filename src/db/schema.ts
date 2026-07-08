// Postgres schema for the Scoout AI portal.
// Week 1 slice: shops (tenancy), users (auth), sessions (refresh tokens),
// cameras (portal CRUD). Rules/alerts/detections land in Week 2-3.
//
// Migrations live in src/db/migrations. Regenerate with `npm run db:generate`.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  inet,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city"),
  country: text("country").default("GH"),
  plan: text("plan").notNull().default("trial"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true })
    .default(sql`now() + interval '14 days'`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("reviewer"), // owner | reviewer
    name: text("name"),
    initials: text("initials"),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    userAgent: text("user_agent"),
    ip: inet("ip"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const cameras = pgTable(
  "cameras",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    location: text("location"),
    protocol: text("protocol").notNull().default("rtsp"),
    streamUrl: text("stream_url").notNull(),
    hue: integer("hue").default(30),
    resolution: text("resolution"),
    fpsTarget: integer("fps_target").default(15),
    inferenceProfile: text("inference_profile").default("balanced"),
    status: text("status").notNull().default("connecting"), // connecting|online|degraded|offline
    workerId: text("worker_id"),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("cameras_shop_id_idx").on(t.shopId)],
);

export const rules = pgTable(
  "rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    active: boolean("active").notNull().default(true),
    // camera ids this rule applies to; empty array = every camera in the shop
    cameras: uuid("cameras").array().notNull().default(sql`ARRAY[]::uuid[]`),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("rules_shop_id_idx").on(t.shopId)],
);

export type Shop = typeof shops.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Camera = typeof cameras.$inferSelect;
export type Rule = typeof rules.$inferSelect;
