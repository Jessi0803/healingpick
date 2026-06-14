import { asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertReading,
  InsertUser,
  anonymousSessions,
  appSettings,
  creditTransactions,
  ipQuotas,
  readings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

type Db = ReturnType<typeof drizzle>;
let _db: Db | null = null;
let userProfileColumnsReady = false;
let readingSummaryColumnReady = false;
let userAdminNoteColumnReady = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
// Uses postgres-js against Supabase's pooled connection (prepare:false is
// required for the transaction-mode pooler used by serverless functions).
export async function getDb(): Promise<Db | null> {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        prepare: false,
        ssl: "require",
      });
      _db = drizzle(client);
      await ensureUserProfileColumns(_db);
      await ensureUserAdminNoteColumn(_db);
      await ensureReadingSummaryColumn(_db);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Fallback number of free readings granted per day. */
export const DEFAULT_DAILY_FREE_QUOTA = 1;
export const DAILY_FREE_QUOTA = DEFAULT_DAILY_FREE_QUOTA;
/** Credits granted once when a user first signs up. */
export const SIGNUP_BONUS_CREDITS = 5;
const DAILY_FREE_QUOTA_KEY = "daily_free_quota";
let appSettingsReady = false;

async function ensureUserProfileColumns(db: Db) {
  if (userProfileColumnsReady) return;
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthDate" varchar(10)
  `);
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthTime" varchar(16)
  `);
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" varchar(16)
  `);
  userProfileColumnsReady = true;
}

async function ensureUserAdminNoteColumn(db: Db) {
  if (userAdminNoteColumnReady) return;
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "adminNote" text
  `);
  userAdminNoteColumnReady = true;
}

async function ensureReadingSummaryColumn(db: Db) {
  if (readingSummaryColumnReady) return;
  await db.execute(sql`
    ALTER TABLE "readings" ADD COLUMN IF NOT EXISTS "summary" text
  `);
  readingSummaryColumnReady = true;
}

function taipeiDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isNewDay(last: Date): boolean {
  return taipeiDateKey(new Date()) !== taipeiDateKey(last);
}

/**
 * Find or create the app user for a Supabase auth identity, granting the
 * one-time signup bonus on first creation.
 */
export async function upsertUser(user: InsertUser) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return undefined;
  }

  const existing = await getUserByOpenId(user.openId);
  if (existing) {
    await db
      .update(users)
      .set({
        name: user.name ?? existing.name,
        email: user.email ?? existing.email,
        loginMethod: user.loginMethod ?? existing.loginMethod,
        lastSignedIn: new Date(),
      })
      .where(eq(users.openId, user.openId));
    return getUserByOpenId(user.openId);
  }

  const role = user.openId === ENV.ownerOpenId ? "admin" : "user";
  const inserted = await db
    .insert(users)
    .values({
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role,
      credits: SIGNUP_BONUS_CREDITS,
      lastSignedIn: new Date(),
    })
    .returning();
  const created = inserted[0];
  if (created) {
    await db.insert(creditTransactions).values({
      userId: created.id,
      amount: SIGNUP_BONUS_CREDITS,
      reason: "signup_bonus",
      balanceAfter: created.credits,
    });
  }
  return created;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPreferredUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalizedEmail = email.trim().toLowerCase();
  const result = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .orderBy(sql`case when ${users.role} = 'admin' then 0 else 1 end`, asc(users.createdAt), asc(users.id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function touchUserSignInById(
  id: number,
  values: Pick<InsertUser, "name" | "email" | "loginMethod">,
) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .update(users)
    .set({
      name: values.name ?? null,
      email: values.email ?? null,
      loginMethod: values.loginMethod ?? null,
      lastSignedIn: new Date(),
    })
    .where(eq(users.id, id));
  return getUserById(id);
}

export async function updateUserProfile(
  id: number,
  values: Pick<InsertUser, "name" | "birthDate" | "birthTime" | "gender">,
) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .update(users)
    .set({
      name: values.name ?? null,
      birthDate: values.birthDate ?? null,
      birthTime: values.birthTime ?? null,
      gender: values.gender ?? null,
    })
    .where(eq(users.id, id));
  return getUserById(id);
}

// ─── Credits ──────────────────────────────────────────────────────────────────

export type CreditState = {
  credits: number;
  freeRemaining: number;
  dailyFreeQuota: number;
};

async function ensureAppSettingsTable(db: Db) {
  if (appSettingsReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "app_settings" (
      "key" varchar(64) PRIMARY KEY NOT NULL,
      "integerValue" integer NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    INSERT INTO "app_settings" ("key", "integerValue")
    VALUES (${DAILY_FREE_QUOTA_KEY}, ${DEFAULT_DAILY_FREE_QUOTA})
    ON CONFLICT ("key") DO NOTHING
  `);
  appSettingsReady = true;
}

export async function getDailyFreeQuota(): Promise<number> {
  const db = await getDb();
  if (!db) return DEFAULT_DAILY_FREE_QUOTA;
  try {
    await ensureAppSettingsTable(db);
    const rows = await db
      .select({ integerValue: appSettings.integerValue })
      .from(appSettings)
      .where(eq(appSettings.key, DAILY_FREE_QUOTA_KEY))
      .limit(1);
    const value = rows[0]?.integerValue;
    return Number.isInteger(value) && value >= 0
      ? Math.min(value, DEFAULT_DAILY_FREE_QUOTA)
      : DEFAULT_DAILY_FREE_QUOTA;
  } catch (error) {
    console.warn("[Settings] Failed to read daily free quota:", error);
    return DEFAULT_DAILY_FREE_QUOTA;
  }
}

export async function setDailyFreeQuota(value: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const normalized = DEFAULT_DAILY_FREE_QUOTA;
  await ensureAppSettingsTable(db);
  await db
    .insert(appSettings)
    .values({ key: DAILY_FREE_QUOTA_KEY, integerValue: normalized })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { integerValue: normalized, updatedAt: new Date() },
    });
  return normalized;
}

/** Reset the daily free counter if we've crossed into a new day. */
async function ensureFreshDay(userId: number) {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (!user) return;
  if (isNewDay(user.lastFreeReset)) {
    await db
      .update(users)
      .set({ freeUsedToday: 0, lastFreeReset: new Date() })
      .where(eq(users.id, userId));
  }
}

export async function getCreditState(userId: number): Promise<CreditState | null> {
  await ensureFreshDay(userId);
  const user = await getUserById(userId);
  if (!user) return null;
  const dailyFreeQuota = await getDailyFreeQuota();
  return {
    credits: user.credits,
    freeRemaining: Math.max(0, dailyFreeQuota - user.freeUsedToday),
    dailyFreeQuota,
  };
}

export type SpendResult =
  | { ok: true; usedFree: boolean; state: CreditState }
  | { ok: false; reason: "no_db" | "insufficient" };

/**
 * Charge one unit for a reading: consume a daily free use if available,
 * otherwise spend one credit. Returns ok:false when neither is available.
 */
export async function spendForReading(userId: number, reason: string): Promise<SpendResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  await ensureFreshDay(userId);
  const user = await getUserById(userId);
  if (!user) return { ok: false, reason: "no_db" };
  const dailyFreeQuota = await getDailyFreeQuota();

  // 1) Free quota first.
  if (user.freeUsedToday < dailyFreeQuota) {
    await db
      .update(users)
      .set({ freeUsedToday: user.freeUsedToday + 1 })
      .where(eq(users.id, userId));
    const state = await getCreditState(userId);
    return { ok: true, usedFree: true, state: state! };
  }

  // 2) Then paid credits (guard against concurrent double-spend).
  if (user.credits > 0) {
    const updated = await db
      .update(users)
      .set({ credits: sql`${users.credits} - 1` })
      .where(sql`${users.id} = ${userId} AND ${users.credits} > 0`)
      .returning();
    if (updated.length > 0) {
      await db.insert(creditTransactions).values({
        userId,
        amount: -1,
        reason,
        balanceAfter: updated[0].credits,
      });
      const state = await getCreditState(userId);
      return { ok: true, usedFree: false, state: state! };
    }
  }

  return { ok: false, reason: "insufficient" };
}

/**
 * Spend one paid credit only. This intentionally does not consume daily free
 * quota, for paid add-ons such as extra follow-up questions.
 */
export async function spendPaidCredit(userId: number, reason: string): Promise<SpendResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  await ensureFreshDay(userId);
  const user = await getUserById(userId);
  if (!user) return { ok: false, reason: "no_db" };

  if (user.credits > 0) {
    const updated = await db
      .update(users)
      .set({ credits: sql`${users.credits} - 1` })
      .where(sql`${users.id} = ${userId} AND ${users.credits} > 0`)
      .returning();
    if (updated.length > 0) {
      await db.insert(creditTransactions).values({
        userId,
        amount: -1,
        reason,
        balanceAfter: updated[0].credits,
      });
      const state = await getCreditState(userId);
      return { ok: true, usedFree: false, state: state! };
    }
  }

  return { ok: false, reason: "insufficient" };
}

/** Add credits (admin top-up or, later, a completed purchase). */
export async function addCredits(userId: number, amount: number, reason: string) {
  const db = await getDb();
  if (!db || amount <= 0) return undefined;
  const updated = await db
    .update(users)
    .set({ credits: sql`${users.credits} + ${amount}` })
    .where(eq(users.id, userId))
    .returning();
  if (updated.length > 0) {
    await db.insert(creditTransactions).values({
      userId,
      amount,
      reason,
      balanceAfter: updated[0].credits,
    });
    return updated[0];
  }
  return undefined;
}

// ─── Anonymous (per-browser) free quota ──────────────────────────────────────

async function ensureFreshDayAnon(anonId: string) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(anonymousSessions).where(eq(anonymousSessions.anonId, anonId)).limit(1);
  const row = rows[0];
  if (!row) return;
  if (isNewDay(row.lastFreeReset)) {
    await db
      .update(anonymousSessions)
      .set({ freeUsedToday: 0, lastFreeReset: new Date() })
      .where(eq(anonymousSessions.anonId, anonId));
  }
}

export async function getAnonCreditState(anonId: string): Promise<CreditState | null> {
  const db = await getDb();
  if (!db) return null;
  await ensureFreshDayAnon(anonId);
  const rows = await db.select().from(anonymousSessions).where(eq(anonymousSessions.anonId, anonId)).limit(1);
  const row = rows[0];
  const used = row?.freeUsedToday ?? 0;
  const dailyFreeQuota = await getDailyFreeQuota();
  return {
    credits: 0,
    freeRemaining: Math.max(0, dailyFreeQuota - used),
    dailyFreeQuota,
  };
}

/** Spend one free read for an anonymous browser. */
export async function spendAnonFree(anonId: string): Promise<SpendResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  // Upsert the session row (create on first use).
  await db
    .insert(anonymousSessions)
    .values({ anonId })
    .onConflictDoUpdate({
      target: anonymousSessions.anonId,
      set: { lastSeen: new Date() },
    });

  await ensureFreshDayAnon(anonId);
  const rows = await db.select().from(anonymousSessions).where(eq(anonymousSessions.anonId, anonId)).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, reason: "no_db" };
  const dailyFreeQuota = await getDailyFreeQuota();

  if (row.freeUsedToday < dailyFreeQuota) {
    await db
      .update(anonymousSessions)
      .set({ freeUsedToday: row.freeUsedToday + 1 })
      .where(eq(anonymousSessions.anonId, anonId));
    const state = await getAnonCreditState(anonId);
    return { ok: true, usedFree: true, state: state! };
  }

  return { ok: false, reason: "insufficient" };
}

// ─── IP-based free quota (extra anti-abuse layer for anonymous visitors) ────

async function ensureFreshDayIp(ipHash: string) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(ipQuotas).where(eq(ipQuotas.ipHash, ipHash)).limit(1);
  const row = rows[0];
  if (!row) return;
  if (isNewDay(row.lastFreeReset)) {
    await db
      .update(ipQuotas)
      .set({ freeUsedToday: 0, lastFreeReset: new Date() })
      .where(eq(ipQuotas.ipHash, ipHash));
  }
}

async function getIpUsed(ipHash: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  await ensureFreshDayIp(ipHash);
  const rows = await db.select().from(ipQuotas).where(eq(ipQuotas.ipHash, ipHash)).limit(1);
  return rows[0]?.freeUsedToday ?? 0;
}

/**
 * Spend one free read for an anonymous visitor. Charges BOTH the browser-id
 * quota and the per-IP quota — a request is blocked if either is exhausted,
 * so clearing cookies or switching to incognito doesn't reset the limit.
 */
export async function spendVisitorFree(
  anonId: string | null,
  ipHash: string | null
): Promise<SpendResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  // Upsert + refresh both rows so we can read current counts.
  if (anonId) {
    await db
      .insert(anonymousSessions)
      .values({ anonId })
      .onConflictDoUpdate({ target: anonymousSessions.anonId, set: { lastSeen: new Date() } });
    await ensureFreshDayAnon(anonId);
  }
  if (ipHash) {
    await db
      .insert(ipQuotas)
      .values({ ipHash })
      .onConflictDoUpdate({ target: ipQuotas.ipHash, set: { lastSeen: new Date() } });
    await ensureFreshDayIp(ipHash);
  }

  const anonUsed = anonId
    ? (await db.select().from(anonymousSessions).where(eq(anonymousSessions.anonId, anonId)).limit(1))[0]
        ?.freeUsedToday ?? 0
    : 0;
  const ipUsed = ipHash ? await getIpUsed(ipHash) : 0;
  const dailyFreeQuota = await getDailyFreeQuota();

  if ((anonId && anonUsed >= dailyFreeQuota) || (ipHash && ipUsed >= dailyFreeQuota)) {
    return { ok: false, reason: "insufficient" };
  }

  if (anonId) {
    await db
      .update(anonymousSessions)
      .set({ freeUsedToday: anonUsed + 1 })
      .where(eq(anonymousSessions.anonId, anonId));
  }
  if (ipHash) {
    await db
      .update(ipQuotas)
      .set({ freeUsedToday: ipUsed + 1 })
      .where(eq(ipQuotas.ipHash, ipHash));
  }

  return {
    ok: true,
    usedFree: true,
    state: {
      credits: 0,
      freeRemaining: Math.max(0, dailyFreeQuota - Math.max(anonUsed + 1, ipUsed + 1)),
      dailyFreeQuota,
    },
  };
}

/** Combined "what's my remaining free?" for the navbar — min of anon and IP. */
export async function getVisitorCreditState(
  anonId: string | null,
  ipHash: string | null
): Promise<CreditState | null> {
  const db = await getDb();
  if (!db) return null;
  if (anonId) await ensureFreshDayAnon(anonId);
  if (ipHash) await ensureFreshDayIp(ipHash);
  const anonUsed = anonId
    ? (await db.select().from(anonymousSessions).where(eq(anonymousSessions.anonId, anonId)).limit(1))[0]
        ?.freeUsedToday ?? 0
    : 0;
  const ipUsed = ipHash ? await getIpUsed(ipHash) : 0;
  const used = Math.max(anonUsed, ipUsed);
  const dailyFreeQuota = await getDailyFreeQuota();
  return {
    credits: 0,
    freeRemaining: Math.max(0, dailyFreeQuota - used),
    dailyFreeQuota,
  };
}

// ─── Readings (Tarot / Ziwei / Fortune) ──────────────────────────────────────

export async function saveReading(data: InsertReading): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.type === "fortune" && data.inputData) {
    const existingFortune = await db
      .select({ id: readings.id })
      .from(readings)
      .where(sql`
        ${readings.type} = ${data.type}
        AND coalesce(${readings.userId}, -1) = coalesce(${data.userId ?? null}, -1)
        AND coalesce(${readings.anonId}, '') = coalesce(${data.anonId ?? null}, '')
        AND coalesce(${readings.ipHash}, '') = coalesce(${data.ipHash ?? null}, '')
        AND ${readings.inputData} = ${data.inputData}
      `)
      .limit(1);
    if (existingFortune.length > 0) return;
  }
  if (data.interpretation) {
    const recentDuplicate = await db
      .select({ id: readings.id })
      .from(readings)
      .where(sql`
        ${readings.type} = ${data.type}
        AND coalesce(${readings.userId}, -1) = coalesce(${data.userId ?? null}, -1)
        AND coalesce(${readings.anonId}, '') = coalesce(${data.anonId ?? null}, '')
        AND coalesce(${readings.ipHash}, '') = coalesce(${data.ipHash ?? null}, '')
        AND ${readings.interpretation} = ${data.interpretation}
        AND ${readings.createdAt} > now() - interval '2 minutes'
      `)
      .limit(1);
    if (recentDuplicate.length > 0) return;
  }
  await db.insert(readings).values(data);
}

export async function getReadingsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(readings)
    .where(eq(readings.userId, userId))
    .orderBy(desc(readings.createdAt))
    .limit(limit);
}

export async function getRecentReadingSummariesByUser(userId: number, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      type: readings.type,
      question: readings.question,
      summary: readings.summary,
      createdAt: readings.createdAt,
    })
    .from(readings)
    .where(sql`${readings.userId} = ${userId} AND ${readings.summary} IS NOT NULL AND ${readings.summary} <> ''`)
    .orderBy(desc(readings.createdAt))
    .limit(limit);
}
