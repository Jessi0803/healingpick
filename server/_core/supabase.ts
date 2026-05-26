import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let _client: SupabaseClient | null = null;

function client(): SupabaseClient | null {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) return null;
  if (!_client) {
    _client = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

/** True once the Supabase auth backend is configured via env. */
export function isSupabaseConfigured(): boolean {
  return Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);
}

export type SupabaseIdentity = {
  id: string;
  email: string | null;
  name: string | null;
};

/** Verify a Supabase access token and return the identity, or null. */
export async function verifyAccessToken(token: string): Promise<SupabaseIdentity | null> {
  const c = client();
  if (!c) return null;
  const { data, error } = await c.auth.getUser(token);
  if (error || !data?.user) return null;
  const u = data.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  return { id: u.id, email: u.email ?? null, name };
}
