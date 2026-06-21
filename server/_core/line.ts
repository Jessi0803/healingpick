import { randomBytes } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const LINE_STATE_COOKIE = "line_oauth_state";
const LINE_RETURN_COOKIE = "line_oauth_return_to";
const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_PROFILE_URL = "https://api.line.me/v2/profile";
const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
const LINE_ISSUER = "https://access.line.me";
const LINE_JWKS = createRemoteJWKSet(new URL("https://api.line.me/oauth2/v2.1/certs"));

type LineTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type LineProfileResponse = {
  userId?: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type LineIdTokenClaims = {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
};

class LineCallbackError extends Error {
  constructor(
    readonly code:
      | "token_failed"
      | "profile_failed"
      | "db_failed"
      | "session_failed",
    message: string,
  ) {
    super(message);
    this.name = "LineCallbackError";
  }
}

function getPublicOrigin(req: Request) {
  const proto = String(req.headers["x-forwarded-proto"] ?? req.protocol ?? "https")
    .split(",")[0]
    .trim();
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

function getRedirectUri(req: Request) {
  return ENV.lineLoginRedirectUri || `${getPublicOrigin(req)}/api/line-callback`;
}

function requireLineConfig(res: Response) {
  if (ENV.lineChannelId && ENV.lineChannelSecret) return true;
  res.status(500).json({ error: "LINE login is not configured" });
  return false;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getCookie(req: Request, key: string): string | undefined {
  const parsed = parseCookieHeader(req.headers.cookie ?? "");
  return parsed[key];
}

function getSafeReturnTo(value: string | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("\n")) {
    return "/";
  }
  return value;
}

async function getVerifiedLineEmail(idToken: string | undefined, expectedUserId: string): Promise<string | null> {
  if (!ENV.lineLoginRequestEmail) return null;
  if (!idToken) return null;

  try {
    const { payload } = await jwtVerify(idToken, LINE_JWKS, {
      issuer: LINE_ISSUER,
      audience: ENV.lineChannelId,
    });
    const claims = payload as LineIdTokenClaims;
    if (claims.sub !== expectedUserId) return null;
    if (claims.email_verified === false) return null;
    if (typeof claims.email !== "string" || !claims.email.includes("@")) return null;
    return claims.email.trim().toLowerCase();
  } catch (error) {
    console.warn("[LINE] Failed to verify email id_token; continuing without email", error);
    return null;
  }
}

export async function pushLineTextMessage(lineUserId: string, text: string): Promise<boolean> {
  if (!ENV.lineMessagingAccessToken) return false;
  const response = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.lineMessagingAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text }],
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.warn(`[LINE] Push message failed (${response.status}): ${body}`);
    return false;
  }
  return true;
}

export function registerLineRoutes(app: Express) {
  app.get("/api/line-session-debug", async (req: Request, res: Response) => {
    const sessionCookie = getCookie(req, COOKIE_NAME);
    const session = await sdk.verifySession(sessionCookie);
    const user = session ? await db.getUserByOpenId(session.openId) : null;

    res.json({
      hasCookie: Boolean(sessionCookie),
      sessionValid: Boolean(session),
      userFound: Boolean(user),
      openIdPrefix: session?.openId.split(":")[0] ?? null,
    });
  });

  app.get("/api/line-login", (req: Request, res: Response) => {
    if (!requireLineConfig(res)) return;

    const state = randomBytes(24).toString("hex");
    const returnTo = getSafeReturnTo(getQueryParam(req, "return_to"));
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(LINE_STATE_COOKIE, state, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000,
    });
    res.cookie(LINE_RETURN_COOKIE, returnTo, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000,
    });

    const url = new URL(LINE_AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", ENV.lineChannelId);
    url.searchParams.set("redirect_uri", getRedirectUri(req));
    url.searchParams.set("state", state);
    url.searchParams.set("scope", ENV.lineLoginRequestEmail ? "profile openid email" : "profile openid");
    url.searchParams.set("bot_prompt", "aggressive");

    res.redirect(302, url.toString());
  });

  app.get("/api/line-callback", async (req: Request, res: Response) => {
    if (!requireLineConfig(res)) return;

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error_description") ?? getQueryParam(req, "error");
    const cookieOptions = getSessionCookieOptions(req);

    if (error) {
      res.clearCookie(LINE_STATE_COOKIE, cookieOptions);
      res.clearCookie(LINE_RETURN_COOKIE, cookieOptions);
      res.redirect(302, `/?line_error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state || getCookie(req, LINE_STATE_COOKIE) !== state) {
      res.clearCookie(LINE_STATE_COOKIE, cookieOptions);
      res.clearCookie(LINE_RETURN_COOKIE, cookieOptions);
      res.redirect(302, "/?line_error=invalid_state");
      return;
    }

    try {
      const returnTo = getSafeReturnTo(getCookie(req, LINE_RETURN_COOKIE));
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getRedirectUri(req),
        client_id: ENV.lineChannelId,
        client_secret: ENV.lineChannelSecret,
      });

      const tokenResponse = await fetch(LINE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const tokenData = (await tokenResponse.json()) as LineTokenResponse;

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new LineCallbackError(
          "token_failed",
          tokenData.error_description || tokenData.error || "LINE token exchange failed",
        );
      }

      const profileResponse = await fetch(LINE_PROFILE_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = (await profileResponse.json()) as LineProfileResponse;

      if (!profileResponse.ok || !profile.userId) {
        throw new LineCallbackError("profile_failed", "LINE profile missing userId");
      }

      const openId = `line:${profile.userId}`;
      const name = profile.displayName || "LINE user";
      const email = await getVerifiedLineEmail(tokenData.id_token, profile.userId);
      let sessionOpenId = openId;
      try {
        const existingUser = email ? await db.getUserByEmail(email) : undefined;
        if (existingUser) {
          await db.touchUserSignInById(existingUser.id, {
            name: existingUser.name ?? name,
            email: existingUser.email ?? email,
            loginMethod: existingUser.loginMethod ?? "line",
          });
          await db.updateUserLineIdentity(existingUser.id, profile.userId);
          sessionOpenId = existingUser.openId;
        } else {
          await db.upsertUser({
            openId,
            name,
            email,
            loginMethod: "line",
            lineUserId: profile.userId,
            lastSignedIn: new Date(),
          });
        }
      } catch (dbError) {
        throw new LineCallbackError("db_failed", dbError instanceof Error ? dbError.message : String(dbError));
      }

      let sessionToken: string;
      try {
        sessionToken = await sdk.createSessionToken(sessionOpenId, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });
      } catch (sessionError) {
        throw new LineCallbackError(
          "session_failed",
          sessionError instanceof Error ? sessionError.message : String(sessionError),
        );
      }

      res.clearCookie(LINE_STATE_COOKIE, cookieOptions);
      res.clearCookie(LINE_RETURN_COOKIE, cookieOptions);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, returnTo);
    } catch (callbackError) {
      console.error("[LINE] Callback failed", callbackError);
      res.clearCookie(LINE_STATE_COOKIE, cookieOptions);
      res.clearCookie(LINE_RETURN_COOKIE, cookieOptions);
      const code = callbackError instanceof LineCallbackError ? callbackError.code : "callback_failed";
      res.redirect(302, `/?line_error=${code}`);
    }
  });
}
