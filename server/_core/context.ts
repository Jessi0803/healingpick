import { createHash } from "node:crypto";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { sdk } from "./sdk";
import { verifyAccessToken } from "./supabase";

const IP_SALT = process.env.IP_HASH_SALT ?? "hp-anon-salt";
function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip + IP_SALT).digest("hex").slice(0, 32);
}
function clientIp(req: CreateExpressContextOptions["req"]): string | null {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0].trim() || null;
  if (Array.isArray(xff) && xff[0]) return xff[0].split(",")[0].trim() || null;
  return req.socket?.remoteAddress ?? null;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** Browser-scoped id for visitors that haven't signed up yet. */
  anonId: string | null;
  /** Hashed visitor IP; used together with anonId to gate the free quota. */
  ipHash: string | null;
};

function bearerToken(req: CreateExpressContextOptions["req"]): string | null {
  const header = req.headers["authorization"];
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim() || null;
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = bearerToken(opts.req);
    if (token) {
      const identity = await verifyAccessToken(token);
      if (identity) {
        // Read first; only create (with signup bonus) on first sign-in.
        let appUser = await getUserByOpenId(identity.id);
        if (!appUser) {
          appUser =
            (await upsertUser({
              openId: identity.id,
              email: identity.email ?? undefined,
              name: identity.name ?? undefined,
              loginMethod: "email",
            })) ?? undefined;
        }
        user = appUser ?? null;
      }
    }
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch {
    // Auth is optional for public procedures.
    user = null;
  }

  const anonHeader = opts.req.headers["x-anon-id"];
  const anonId =
    typeof anonHeader === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(anonHeader)
      ? anonHeader
      : null;

  const ipHash = hashIp(clientIp(opts.req));

  return { req: opts.req, res: opts.res, user, anonId, ipHash };
}
