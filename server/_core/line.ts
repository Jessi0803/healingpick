import { randomBytes } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const LINE_STATE_COOKIE = "line_oauth_state";
const LINE_RETURN_COOKIE = "line_oauth_return_to";
const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_PROFILE_URL = "https://api.line.me/v2/profile";

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
    url.searchParams.set("scope", "profile openid");
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
      try {
        await db.upsertUser({
          openId,
          name,
          email: null,
          loginMethod: "line",
          lastSignedIn: new Date(),
        });
      } catch (dbError) {
        throw new LineCallbackError("db_failed", dbError instanceof Error ? dbError.message : String(dbError));
      }

      let sessionToken: string;
      try {
        sessionToken = await sdk.createSessionToken(openId, {
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
