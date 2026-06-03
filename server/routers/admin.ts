import { desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { creditTransactions, readings, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const limitInput = z.object({
  limit: z.number().int().min(1).max(200).default(100),
});

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

export const adminRouter = router({
  dashboard: adminProcedure
    .input(limitInput.optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          stats: {
            users: 0,
            readings: 0,
            visitors: 0,
            visitorReadings: 0,
            purchases: 0,
            creditsSold: 0,
          },
          users: [],
          orders: [],
          transactions: [],
          readings: [],
        };
      }

      const limit = input?.limit ?? 100;

      // Distinct visitor key: prefer the anon session id, fall back to the hashed IP.
      const visitorKey = sql<string>`coalesce('anon:' || ${readings.anonId}, 'ip:' || ${readings.ipHash})`;

      const [
        userCount,
        readingCount,
        visitorStats,
        purchaseStats,
        userRows,
        orderRows,
        transactionRows,
        readingRows,
      ] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(users),
          db.select({ count: sql<number>`count(*)` }).from(readings),
          db
            .select({
              readings: sql<number>`count(*)`,
              visitors: sql<number>`count(distinct ${visitorKey})`,
            })
            .from(readings)
            .where(sql`${readings.userId} is null`),
          db
            .select({
              count: sql<number>`count(*)`,
              creditsSold: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)`,
            })
            .from(creditTransactions)
            .where(like(creditTransactions.reason, "gumroad:%")),
          db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              loginMethod: users.loginMethod,
              credits: users.credits,
              freeUsedToday: users.freeUsedToday,
              lastFreeReset: users.lastFreeReset,
              createdAt: users.createdAt,
              lastSignedIn: users.lastSignedIn,
            })
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(limit),
          db
            .select({
              id: creditTransactions.id,
              userId: creditTransactions.userId,
              email: users.email,
              name: users.name,
              amount: creditTransactions.amount,
              reason: creditTransactions.reason,
              balanceAfter: creditTransactions.balanceAfter,
              createdAt: creditTransactions.createdAt,
            })
            .from(creditTransactions)
            .leftJoin(users, eq(creditTransactions.userId, users.id))
            .where(like(creditTransactions.reason, "gumroad:%"))
            .orderBy(desc(creditTransactions.createdAt))
            .limit(limit),
          db
            .select({
              id: creditTransactions.id,
              userId: creditTransactions.userId,
              email: users.email,
              name: users.name,
              amount: creditTransactions.amount,
              reason: creditTransactions.reason,
              balanceAfter: creditTransactions.balanceAfter,
              createdAt: creditTransactions.createdAt,
            })
            .from(creditTransactions)
            .leftJoin(users, eq(creditTransactions.userId, users.id))
            .orderBy(desc(creditTransactions.createdAt))
            .limit(limit),
          db
            .select({
              id: readings.id,
              userId: readings.userId,
              anonId: readings.anonId,
              ipHash: readings.ipHash,
              email: users.email,
              name: users.name,
              type: readings.type,
              question: readings.question,
              inputData: readings.inputData,
              interpretation: readings.interpretation,
              createdAt: readings.createdAt,
            })
            .from(readings)
            .leftJoin(users, eq(readings.userId, users.id))
            .orderBy(desc(readings.createdAt))
            .limit(limit),
        ]);

      const purchaseStat = purchaseStats[0];
      const visitorStat = visitorStats[0];

      return {
        stats: {
          users: toNumber(userCount[0]?.count),
          readings: toNumber(readingCount[0]?.count),
          visitors: toNumber(visitorStat?.visitors),
          visitorReadings: toNumber(visitorStat?.readings),
          purchases: toNumber(purchaseStat?.count),
          creditsSold: toNumber(purchaseStat?.creditsSold),
        },
        users: userRows,
        orders: orderRows,
        transactions: transactionRows,
        readings: readingRows,
      };
    }),
});
