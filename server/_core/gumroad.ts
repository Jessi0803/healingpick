import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { creditTransactions } from "../../drizzle/schema";
import { addCredits, getDb, getUserByEmail } from "../db";
import { ENV } from "./env";

/**
 * Gumroad "Version" name → credits granted.
 * The keys MUST match the version names configured in the Gumroad product
 * (Starter Pack / Standard Pack / Premium Pack).
 */
const VERSION_CREDITS: Record<string, number> = {
  "Starter Pack": 30,
  "Standard Pack": 100,
  "Premium Pack": 300,
};

function pickVariantName(body: Record<string, unknown>): string | undefined {
  // Gumroad sends `variants[Version]=Starter Pack`; express.urlencoded with
  // extended:true parses this into `variants: { Version: "..." }`.
  const variants = body.variants;
  if (!variants || typeof variants !== "object") return undefined;
  const v = variants as Record<string, string>;
  return v.Version || v.Tier || v.Option || Object.values(v)[0];
}

/**
 * Gumroad Ping handler. Verified by shared secret in the query string so the
 * Seller ID is not required.
 */
export async function handleGumroadPing(req: Request, res: Response) {
  try {
    if (!ENV.gumroadWebhookSecret || req.query.secret !== ENV.gumroadWebhookSecret) {
      console.warn("[Gumroad] Invalid or missing webhook secret");
      // 200 so attackers don't get retried; legit hits will have the secret
      return res.status(200).end();
    }

    const body = (req.body || {}) as Record<string, unknown>;
    const email = body.email as string | undefined;
    const saleId = body.sale_id as string | undefined;
    const variantName = pickVariantName(body);

    if (!email || !variantName || !saleId) {
      console.warn("[Gumroad] Missing required fields", { email, variantName, saleId });
      return res.status(200).end();
    }

    const credits = VERSION_CREDITS[variantName];
    if (!credits) {
      console.warn("[Gumroad] Unknown variant name:", variantName);
      return res.status(200).end();
    }

    const db = await getDb();
    if (!db) {
      console.error("[Gumroad] DB not configured");
      return res.status(500).end();
    }

    // Idempotency: same sale_id can only credit once even if Gumroad retries.
    const reason = `gumroad:${saleId}`;
    const existing = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.reason, reason))
      .limit(1);
    if (existing.length > 0) {
      console.log("[Gumroad] Sale already processed:", saleId);
      return res.status(200).end();
    }

    const user = await getUserByEmail(email);
    if (!user) {
      console.warn(
        "[Gumroad] No matching user for email:",
        email,
        "— credits not granted; ask customer to sign in once first"
      );
      return res.status(200).end();
    }

    const updated = await addCredits(user.id, credits, reason);
    console.log(
      `[Gumroad] +${credits} credits → ${email} (sale ${saleId}); balance=${updated?.credits}`
    );
    return res.status(200).end();
  } catch (e) {
    console.error("[Gumroad] Webhook error:", e);
    return res.status(500).end();
  }
}
