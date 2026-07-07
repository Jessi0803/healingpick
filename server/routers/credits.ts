import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { sql } from "drizzle-orm";
import { addCredits, getCreditState, getDb, getUserByEmail, getVisitorCreditState } from "../db";
import { isCreditsEnabled } from "../_core/credits";
import { createPayuniCheckout } from "../_core/payuni";
import { verifyAccessToken } from "../_core/supabase";
import { users } from "../../drizzle/schema";
import { CREDIT_PACKAGES } from "../../shared/creditPackages";

const packageCodeSchema = z.enum(CREDIT_PACKAGES.map((p) => p.code) as [string, ...string[]]);

export const creditsRouter = router({
  /** Current balance + remaining daily free quota for the visitor / user. */
  state: publicProcedure.query(async ({ ctx }) => {
    const enabled = isCreditsEnabled();
    if (!enabled) {
      return { enabled, signedIn: false, credits: 0, freeRemaining: 0, dailyFreeQuota: 0 };
    }
    if (ctx.user) {
      const s = await getCreditState(ctx.user.id, ctx.anonId, ctx.ipHash);
      return {
        enabled: true,
        signedIn: true,
        credits: s?.credits ?? 0,
        freeRemaining: s?.freeRemaining ?? 0,
        dailyFreeQuota: s?.dailyFreeQuota ?? 0,
      };
    }
    if (ctx.anonId || ctx.ipHash) {
      const s = await getVisitorCreditState(ctx.anonId, ctx.ipHash);
      return {
        enabled: true,
        signedIn: false,
        credits: 0,
        freeRemaining: s?.freeRemaining ?? 0,
        dailyFreeQuota: s?.dailyFreeQuota ?? 0,
      };
    }
    return { enabled: true, signedIn: false, credits: 0, freeRemaining: 0, dailyFreeQuota: 0 };
  }),

  /** Temporary diagnostic: surfaces token-verify and DB errors. */
  diagnose: publicProcedure.query(async ({ ctx }) => {
    const out: Record<string, unknown> = {};
    const auth = ctx.req.headers["authorization"];
    const token =
      typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    out.hasAuthHeader = Boolean(token);

    if (token) {
      try {
        const identity = await verifyAccessToken(token);
        out.identity = identity ? { id: identity.id, email: identity.email } : null;
      } catch (e) {
        out.verifyError = String((e as Error)?.message ?? e);
      }
    }

    try {
      const db = await getDb();
      out.dbConnected = Boolean(db);
      if (db) {
        // 1) Simplest possible query first
        try {
          const ping = await db.execute(sql`select 1 as ok`);
          out.simplePing = JSON.stringify(ping).slice(0, 200);
        } catch (e) {
          const err = e as { name?: string; message?: string; code?: string; detail?: string; hint?: string; cause?: unknown };
          const cause = err?.cause as { name?: string; message?: string; code?: string } | undefined;
          out.simpleError = {
            name: err?.name,
            message: err?.message,
            code: err?.code,
            detail: err?.detail,
            hint: err?.hint,
            cause: cause ? { name: cause.name, message: cause.message, code: cause.code } : undefined,
          };
        }
        // 2) Then the actual users query
        try {
          const rows = await db.select().from(users).limit(1);
          out.userQueryOk = true;
          out.usersCount = rows.length;
        } catch (e) {
          const err = e as { message?: string; code?: string; detail?: string; hint?: string };
          out.userQueryError = { message: err?.message, code: err?.code, detail: err?.detail, hint: err?.hint };
        }
      }
    } catch (e) {
      out.dbError = String((e as Error)?.message ?? e);
    }

    return out;
  }),

  /** Create a PAYUNi checkout form payload for the selected credit package. */
  createPayuniCheckout: publicProcedure
    .input(z.object({ packageCode: packageCodeSchema }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "LOGIN_REQUIRED" });
      }

      try {
        return createPayuniCheckout({
          req: ctx.req,
          userId: ctx.user.id,
          userEmail: ctx.user.email ?? null,
          packageCode: input.packageCode as (typeof CREDIT_PACKAGES)[number]["code"],
        });
      } catch (error) {
        const message = String((error as Error)?.message ?? error);
        if (message === "PAYUNI_NOT_CONFIGURED") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message });
        }
        throw error;
      }
    }),

  /** Admin-only manual top-up (used for testing before real payment exists). */
  adminTopup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        amount: z.number().int().positive().max(100000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_ONLY" });
      }
      const target = await getUserByEmail(input.email);
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "USER_NOT_FOUND" });
      }
      const updated = await addCredits(target.id, input.amount, "admin_topup");
      return { email: input.email, credits: updated?.credits ?? null };
    }),
});
