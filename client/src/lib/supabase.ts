import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Whether Supabase auth is configured in this build. */
export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string)
  : null;

/** Current Supabase access token (JWT) for authorising tRPC calls, or null. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Start the Google sign-in redirect flow. */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

/**
 * Send a passwordless magic-link login email. Returns true if Supabase
 * accepted the request (doesn't guarantee delivery).
 */
export async function signInWithEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Auth not configured" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
