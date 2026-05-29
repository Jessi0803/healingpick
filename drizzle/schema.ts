import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const readingTypeEnum = pgEnum("reading_type", ["tarot", "ziwei", "fortune"]);

/**
 * Core user table backing auth + credits.
 * `openId` stores the Supabase Auth user id (uuid) of the signed-in user.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user id (uuid). Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  /** Purchasable point balance. Each paid reading consumes from here. */
  credits: integer("credits").default(0).notNull(),
  /** Free readings already used in the current day. */
  freeUsedToday: integer("freeUsedToday").default(0).notNull(),
  /** When the daily free quota was last reset. */
  lastFreeReset: timestamp("lastFreeReset").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ledger of every credit change (signup bonus, purchase, per-reading spend,
 * admin top-up). Lets us audit balances.
 */
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** Positive = added, negative = spent. */
  amount: integer("amount").notNull(),
  /** e.g. "signup_bonus", "tarot", "ziwei", "admin_topup", "purchase". */
  reason: varchar("reason", { length: 64 }).notNull(),
  balanceAfter: integer("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Per-browser free-quota tracking for visitors who haven't signed up yet.
 * The id is a UUID generated client-side and stored in localStorage + a
 * cookie header so the same browser is recognised across requests.
 */
export const anonymousSessions = pgTable("anonymous_sessions", {
  anonId: varchar("anonId", { length: 64 }).primaryKey(),
  freeUsedToday: integer("freeUsedToday").default(0).notNull(),
  lastFreeReset: timestamp("lastFreeReset").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type InsertAnonymousSession = typeof anonymousSessions.$inferInsert;

/**
 * Per-IP free-quota tracking. Keyed by a hash of the visitor IP so the same
 * machine can't bypass the daily limit by clearing cookies / going incognito
 * / switching browsers.
 */
export const ipQuotas = pgTable("ip_quotas", {
  ipHash: varchar("ipHash", { length: 64 }).primaryKey(),
  freeUsedToday: integer("freeUsedToday").default(0).notNull(),
  lastFreeReset: timestamp("lastFreeReset").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
});

export type IpQuota = typeof ipQuotas.$inferSelect;
export type InsertIpQuota = typeof ipQuotas.$inferInsert;

/**
 * Tarot / Ziwei / Fortune reading records (user divination history).
 */
export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  type: readingTypeEnum("type").notNull(),
  question: text("question"),
  inputData: text("inputData"),
  interpretation: text("interpretation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

/**
 * Treehole session records (comfort conversations).
 */
export const treeholeSessions = pgTable("treehole_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  mood: varchar("mood", { length: 32 }),
  userText: text("userText").notNull(),
  aiResponse: text("aiResponse"),
  crystalName: varchar("crystalName", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TreeholeSession = typeof treeholeSessions.$inferSelect;
export type InsertTreeholeSession = typeof treeholeSessions.$inferInsert;
