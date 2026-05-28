import { TRPCError } from "@trpc/server";
import { spendForReading } from "../db";
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
 * Charge one unit for a reading. Throws UNAUTHORIZED if not signed in, or
 * FORBIDDEN ("INSUFFICIENT_CREDITS") when out of free quota and credits.
 * No-op when the credits backend isn't configured yet.
 */
export async function chargeReading(ctx: TrpcContext, reason: string): Promise<void> {
  if (!isCreditsEnabled()) return;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }

  const result = await spendForReading(ctx.user.id, reason);
  if (!result.ok) {
    if (result.reason === "no_db") return; // configured but DB unreachable: fail open
    throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_CREDITS" });
  }
}
