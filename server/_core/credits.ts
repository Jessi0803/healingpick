import { TRPCError } from "@trpc/server";
import { spendForReading, spendPaidCredit } from "../db";
import type { TrpcContext } from "./context";
import { isSupabaseConfigured } from "./supabase";

/**
 * Credits gating is only active once both the auth backend (Supabase) and the
 * database are configured. Until then every service stays free so the live
 * site keeps working during rollout.
 */
export function isCreditsEnabled(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.DATABASE_URL);
}

/**
 * Charge one unit for a reading. Once auth is configured, readings require a
 * signed-in user. Throws FORBIDDEN ("INSUFFICIENT_CREDITS") when out of free
 * quota and credits. No-op when the credits backend isn't configured yet.
 */
export async function chargeReading(ctx: TrpcContext, reason: string): Promise<void> {
  if (isSupabaseConfigured() && !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }

  if (!isCreditsEnabled()) return;

  if (ctx.user) {
    const result = await spendForReading(ctx.user.id, reason);
    if (!result.ok) {
      if (result.reason === "no_db") return; // fail open
      throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_CREDITS" });
    }
    return;
  }
}

/**
 * Charge one paid credit only. This does not consume daily free quota and is
 * used for paid add-ons after a free trial action has already been used.
 */
export async function chargePaidCredit(ctx: TrpcContext, reason: string): Promise<void> {
  if (isSupabaseConfigured() && !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }

  if (!isCreditsEnabled()) return;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }

  const result = await spendPaidCredit(ctx.user.id, reason);
  if (!result.ok) {
    if (result.reason === "no_db") return; // fail open
    throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_CREDITS" });
  }
}
