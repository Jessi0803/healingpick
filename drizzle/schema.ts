import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * Tarot and Ziwei reading records.
 * Stores user divination history for future reference.
 */
export const readings = mysqlTable("readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", ["tarot", "ziwei", "fortune"]).notNull(),
  question: text("question"),
  inputData: text("inputData"), // JSON string of cards drawn / birth info
  interpretation: text("interpretation"), // LLM response
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

/**
 * Treehole session records.
 * Stores comfort conversations for user reference.
 */
export const treeholeSessions = mysqlTable("treehole_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  mood: varchar("mood", { length: 32 }),
  userText: text("userText").notNull(),
  aiResponse: text("aiResponse"),
  crystalName: varchar("crystalName", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TreeholeSession = typeof treeholeSessions.$inferSelect;
export type InsertTreeholeSession = typeof treeholeSessions.$inferInsert;