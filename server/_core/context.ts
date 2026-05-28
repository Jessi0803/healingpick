import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { verifyAccessToken } from "./supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
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
              loginMethod: "google",
            })) ?? undefined;
        }
        user = appUser ?? null;
      }
    }
  } catch {
    // Auth is optional for public procedures.
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
