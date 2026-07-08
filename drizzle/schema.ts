import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const readingTypeEnum = pgEnum("reading_type", ["tarot", "ziwei", "fortune", "dream"]);
export const feedbackSourceEnum = pgEnum("feedback_source", ["tarot", "ziwei"]);
export const productOrderFitEnum = pgEnum("product_order_fit", ["貼手", "剛好", "微鬆"]);

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
  birthDate: varchar("birthDate", { length: 10 }),
  birthTime: varchar("birthTime", { length: 16 }),
  gender: varchar("gender", { length: 16 }),
  adminNote: text("adminNote"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  lineUserId: varchar("lineUserId", { length: 128 }),
  role: roleEnum("role").default("user").notNull(),
  /** Purchasable point balance. Each paid reading consumes from here. */
  credits: integer("credits").default(0).notNull(),
  /** Free readings already used in the current day. */
  freeUsedToday: integer("freeUsedToday").default(0).notNull(),
  /** When the daily free quota was last reset. */
  lastFreeReset: timestamp("lastFreeReset").defaultNow().notNull(),
  /** Authenticated app-open count used to schedule little postcard letters. */
  loginCount: integer("loginCount").default(0).notNull(),
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
 * Additional emails that should resolve to the same app user. This lets a
 * customer sign in through more than one email while sharing credits/history.
 */
export const userEmailAliases = pgTable("user_email_aliases", {
  email: varchar("email", { length: 320 }).primaryKey(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserEmailAlias = typeof userEmailAliases.$inferSelect;
export type InsertUserEmailAlias = typeof userEmailAliases.$inferInsert;

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
 * Small key/value settings table for admin-controlled runtime options.
 */
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  integerValue: integer("integerValue").notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

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
  /** Anonymous visitor session id (set when the reading is done while logged out). */
  anonId: varchar("anonId", { length: 64 }),
  /** Hashed visitor IP for logged-out readings; pairs with anonId to identify visitors. */
  ipHash: varchar("ipHash", { length: 64 }),
  type: readingTypeEnum("type").notNull(),
  question: text("question"),
  inputData: text("inputData"),
  interpretation: text("interpretation"),
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

/**
 * One-time care messages sent when a member has not returned after a reading.
 */
export const readingFollowups = pgTable("reading_followups", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  readingId: integer("readingId").notNull(),
  channel: varchar("channel", { length: 24 }).notNull(),
  status: varchar("status", { length: 24 }).default("pending").notNull(),
  subject: text("subject"),
  message: text("message"),
  failureReason: text("failureReason"),
  scheduledAt: timestamp("scheduledAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReadingFollowup = typeof readingFollowups.$inferSelect;
export type InsertReadingFollowup = typeof readingFollowups.$inferInsert;

/**
 * Delayed postcard letters. Odd authenticated opens create the postcard;
 * the following even open delivers it.
 */
export const userPostcards = pgTable("user_postcards", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  createdLoginCount: integer("createdLoginCount").notNull(),
  deliverLoginCount: integer("deliverLoginCount").notNull(),
  imageUrl: text("imageUrl").notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 24 }).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  notifiedAt: timestamp("notifiedAt"),
  openedAt: timestamp("openedAt"),
});

export type UserPostcard = typeof userPostcards.$inferSelect;
export type InsertUserPostcard = typeof userPostcards.$inferInsert;

/**
 * Customer feedback submitted after tarot / ziwei readings.
 */
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  source: feedbackSourceEnum("source").notNull(),
  message: text("message").notNull(),
  context: text("context"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * Shop orders submitted from ready-made bracelet product pages.
 * Items are stored as JSON text so the order keeps the exact product names,
 * prices, and quantities the customer confirmed at checkout.
 */
export const productOrders = pgTable("product_orders", {
  id: serial("id").primaryKey(),
  customerName: text("customerName").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  wristSize: varchar("wristSize", { length: 32 }).notNull(),
  fit: productOrderFitEnum("fit").notNull(),
  address: text("address").notNull(),
  items: text("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  freeGift: text("freeGift").default("白水晶碎石一包").notNull(),
  status: varchar("status", { length: 24 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductOrder = typeof productOrders.$inferSelect;
export type InsertProductOrder = typeof productOrders.$inferInsert;

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
