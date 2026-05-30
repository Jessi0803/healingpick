import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Whether Supabase auth is configured in this build. */
export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string)
  : null;

export const IN_APP_BROWSER_LOGIN_MESSAGE =
  "目前的瀏覽器無法使用 Google 登入。請點右下角選單，選擇「在 Safari 開啟」或「在 Chrome 開啟」後再登入。";

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return [
    "line/",
    "instagram",
    "fban",
    "fbav",
    "fb_iab",
    "messenger",
    "micromessenger",
    "tiktok",
    "gsa/",
  ].some((token) => ua.includes(token));
}

/** Current Supabase access token (JWT) for authorising tRPC calls, or null. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Start the Google sign-in redirect flow. */
export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  if (isInAppBrowser()) return { ok: false, error: IN_APP_BROWSER_LOGIN_MESSAGE };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Email + password sign in. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Email + password sign up. Supabase will (depending on project settings)
 * send a verification email; the user must click it before they can log in.
 */
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; needsVerification?: boolean }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { ok: false, error: error.message };
  // Supabase's "Prevent email enumeration" protection returns a fake user
  // object with empty `identities` when the email is already registered.
  const identities = (data.user as { identities?: unknown[] } | null)?.identities;
  if (Array.isArray(identities) && identities.length === 0) {
    return { ok: false, error: "這個 email 已經註冊過了,請直接登入或點忘記密碼" };
  }
  // session is null when email confirmation is required
  return { ok: true, needsVerification: !data.session };
}

/** Send a password reset email; the link lands on /reset-password. */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Update the signed-in user's password (used on /reset-password). */
export async function updatePassword(
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
