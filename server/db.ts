import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertReading,
  InsertTreeholeSession,
  InsertUser,
  creditTransactions,
  readings,
  treeholeSessions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

type Db = ReturnType<typeof drizzle>;
let _db: Db | null = null;

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
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Number of free readings granted per day. */
export const DAILY_FREE_QUOTA = 3;
/** Credits granted once when a user first signs up. */
export const SIGNUP_BONUS_CREDITS = 5;

function isNewDay(last: Date): boolean {
  const now = new Date();
  return (
    now.getUTCFullYear() !== last.getUTCFullYear() ||
    now.getUTCMonth() !== last.getUTCMonth() ||
    now.getUTCDate() !== last.getUTCDate()
  );
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

// ─── Credits ──────────────────────────────────────────────────────────────────

export type CreditState = {
  credits: number;
  freeRemaining: number;
  dailyFreeQuota: number;
};

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
  return {
    credits: user.credits,
    freeRemaining: Math.max(0, DAILY_FREE_QUOTA - user.freeUsedToday),
    dailyFreeQuota: DAILY_FREE_QUOTA,
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

  // 1) Free quota first.
  if (user.freeUsedToday < DAILY_FREE_QUOTA) {
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

// ─── Readings (Tarot / Ziwei / Fortune) ──────────────────────────────────────

export async function saveReading(data: InsertReading): Promise<void> {
  const db = await getDb();
  if (!db) return;
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

// ─── Treehole Sessions ────────────────────────────────────────────────────────

export async function saveTreeholeSession(data: InsertTreeholeSession): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(treeholeSessions).values(data);
}

export async function getTreeholeSessionsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(treeholeSessions)
    .where(eq(treeholeSessions.userId, userId))
    .orderBy(desc(treeholeSessions.createdAt))
    .limit(limit);
}
