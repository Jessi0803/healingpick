import { desc, eq, inArray, like, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { creditTransactions, feedbacks, productOrders, readings, users } from "../../drizzle/schema";
import { DEFAULT_DAILY_FREE_QUOTA, MAX_DAILY_FREE_QUOTA, getDailyFreeQuota, getDb, setDailyFreeQuota } from "../db";
import { normalizeEmailList, sendBatchEmail } from "../_core/email";
import { adminProcedure, router } from "../_core/trpc";

const limitInput = z.object({
  limit: z.number().int().min(1).max(200).default(100),
  tab: z.enum(["users", "orders", "shopOrders", "visitors", "feedbacks", "transactions"]).default("users"),
});

function toNumber(value: unknown): number {
  return Number(value ?? 0);
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

function todayFreeUsed(row: { freeUsedToday: number; lastFreeReset: Date }): number {
  return taipeiDateKey(new Date()) === taipeiDateKey(row.lastFreeReset) ? row.freeUsedToday : 0;
}

const signedInTodaySort = sql`
  case
    when (${users.lastSignedIn} AT TIME ZONE 'Asia/Taipei')::date = (now() AT TIME ZONE 'Asia/Taipei')::date
    then 0
    else 1
  end
`;

const readTodaySort = sql`
  case
    when exists (
      select 1
      from ${readings}
      where ${readings.userId} = ${users.id}
        and (${readings.createdAt} AT TIME ZONE 'Asia/Taipei')::date = (now() AT TIME ZONE 'Asia/Taipei')::date
    )
    then 0
    else 1
  end
`;

const latestReadingTodaySort = sql`
  (
    select max(${readings.createdAt})
    from ${readings}
    where ${readings.userId} = ${users.id}
      and (${readings.createdAt} AT TIME ZONE 'Asia/Taipei')::date = (now() AT TIME ZONE 'Asia/Taipei')::date
  )
`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToEmailHtml(content: string): string {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("\n");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #31353A;">
      ${paragraphs}
    </div>
  `;
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
            shopOrders: 0,
          },
          settings: {
            dailyFreeQuota: DEFAULT_DAILY_FREE_QUOTA,
          },
          users: [],
          orders: [],
          shopOrders: [],
          transactions: [],
          readings: [],
        };
      }

      const limit = input?.limit ?? 100;
      const tab = input?.tab ?? "users";

      // Distinct visitor key: prefer the anon session id, fall back to the hashed IP.
      const visitorKey = sql<string>`coalesce('anon:' || ${readings.anonId}, 'ip:' || ${readings.ipHash})`;
      const emptyQuery = Promise.resolve([]);

      const [
        userCount,
        readingCount,
        visitorStats,
        purchaseStats,
        productOrderCount,
        userRows,
        orderRows,
        transactionRows,
        shopOrderRows,
        readingRows,
        feedbackRows,
        dailyFreeQuota,
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
          db.select({ count: sql<number>`count(*)` }).from(productOrders),
          tab === "users" ? db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              loginMethod: users.loginMethod,
              adminNote: users.adminNote,
              credits: users.credits,
              freeUsedToday: users.freeUsedToday,
              lastFreeReset: users.lastFreeReset,
              braceletPurchaseHistory: sql<string>`(
                SELECT coalesce(
                  json_agg(
                    json_build_object(
                      'id', ${productOrders.id},
                      'items', ${productOrders.items},
                      'subtotal', ${productOrders.subtotal},
                      'status', ${productOrders.status},
                      'createdAt', ${productOrders.createdAt}
                    )
                    ORDER BY ${productOrders.createdAt} DESC
                  )::text,
                  '[]'
                )
                FROM ${productOrders}
                WHERE ${users.email} IS NOT NULL
                  AND lower(${productOrders.email}) = lower(${users.email})
              )`,
              createdAt: users.createdAt,
              lastSignedIn: users.lastSignedIn,
            })
            .from(users)
            .orderBy(
              readTodaySort,
              desc(latestReadingTodaySort),
              signedInTodaySort,
              desc(users.lastSignedIn),
              desc(users.createdAt)
            )
            .limit(limit) : emptyQuery,
          tab === "orders" ? db
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
            .limit(limit) : emptyQuery,
          tab === "transactions" ? db
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
            .limit(limit) : emptyQuery,
          tab === "shopOrders" ? db
            .select({
              id: productOrders.id,
              customerName: productOrders.customerName,
              email: productOrders.email,
              phone: productOrders.phone,
              wristSize: productOrders.wristSize,
              fit: productOrders.fit,
              address: productOrders.address,
              items: productOrders.items,
              subtotal: productOrders.subtotal,
              freeGift: productOrders.freeGift,
              status: productOrders.status,
              createdAt: productOrders.createdAt,
            })
            .from(productOrders)
            .orderBy(desc(productOrders.createdAt))
            .limit(limit) : emptyQuery,
          tab === "visitors" ? db
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
            .limit(limit) : emptyQuery,
          tab === "feedbacks" ? db
            .select({
              id: feedbacks.id,
              userId: feedbacks.userId,
              email: users.email,
              name: users.name,
              source: feedbacks.source,
              message: feedbacks.message,
              context: feedbacks.context,
              createdAt: feedbacks.createdAt,
            })
            .from(feedbacks)
            .leftJoin(users, eq(feedbacks.userId, users.id))
            .orderBy(desc(feedbacks.createdAt))
            .limit(limit) : emptyQuery,
          getDailyFreeQuota(),
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
          shopOrders: toNumber(productOrderCount[0]?.count),
        },
        settings: {
          dailyFreeQuota,
        },
        users: userRows.map((row) => ({
          ...row,
          freeUsedToday: todayFreeUsed(row),
        })),
        orders: orderRows,
        shopOrders: shopOrderRows,
        transactions: transactionRows,
        readings: readingRows,
        feedbacks: feedbackRows,
      };
    }),
  sendMemberEmail: adminProcedure
    .input(
      z.object({
        subject: z.string().trim().min(1, "請輸入 email 主旨").max(160),
        content: z.string().trim().min(1, "請輸入 email 內容").max(12000),
        recipientUserIds: z.array(z.number().int().positive()).max(200).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const selectedUserIds = Array.from(new Set(input.recipientUserIds ?? []));
      const recipientRows = selectedUserIds.length > 0
        ? await db
            .select({ email: users.email })
            .from(users)
            .where(
              sql`${inArray(users.id, selectedUserIds)} AND ${users.email} IS NOT NULL AND btrim(${users.email}) <> ''`
            )
        : await db
            .select({ email: users.email })
            .from(users)
            .where(sql`${users.email} IS NOT NULL AND btrim(${users.email}) <> ''`);
      const recipients = normalizeEmailList(recipientRows.map((row) => row.email));

      if (recipients.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: selectedUserIds.length > 0 ? "選取的會員沒有可寄送的 email" : "目前沒有可寄送的會員 email",
        });
      }

      return sendBatchEmail({
        recipients,
        subject: input.subject,
        html: textToEmailHtml(input.content),
      });
    }),
  userReadings: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      return db
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
        .where(eq(readings.userId, input.userId))
        .orderBy(desc(readings.createdAt))
        .limit(input.limit);
    }),
  updateDailyFreeQuota: adminProcedure
    .input(
      z.object({
        dailyFreeQuota: z.number().int().min(1).max(MAX_DAILY_FREE_QUOTA),
      })
    )
    .mutation(async ({ input }) => {
      const dailyFreeQuota = await setDailyFreeQuota(input.dailyFreeQuota);
      return { dailyFreeQuota };
    }),
  updateUserCredits: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        credits: z.number().int().min(0).max(100000),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const targetRows = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      const target = targetRows[0];
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "找不到這個會員",
        });
      }

      const delta = input.credits - target.credits;
      if (delta === 0) {
        return { userId: input.userId, credits: target.credits };
      }

      const updated = await db
        .update(users)
        .set({ credits: input.credits })
        .where(eq(users.id, input.userId))
        .returning();

      const user = updated[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "找不到這個會員",
        });
      }

      await db.insert(creditTransactions).values({
        userId: user.id,
        amount: delta,
        reason: "admin_adjustment",
        balanceAfter: user.credits,
      });

      return { userId: user.id, credits: user.credits };
    }),
  updateUserNote: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        adminNote: z.string().max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const normalizedNote = input.adminNote.trim();
      const updated = await db
        .update(users)
        .set({ adminNote: normalizedNote || null })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          adminNote: users.adminNote,
        });

      const user = updated[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "找不到這個會員",
        });
      }

      return { userId: user.id, adminNote: user.adminNote };
    }),
  deleteUser: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "不能刪除目前登入中的管理員帳號",
        });
      }

      const deleted = await db
        .delete(users)
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
        });

      const user = deleted[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "找不到這個會員",
        });
      }

      return user;
    }),
});
