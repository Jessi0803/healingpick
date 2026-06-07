import { trpc } from "@/lib/trpc";
import { completeOAuthRedirect, signOut, supabase, supabaseEnabled } from "@/lib/supabase";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Refetch identity whenever the Supabase session changes (sign in / out).
  useEffect(() => {
    if (!supabase) return;
    const authClient = supabase;
    const { data: sub } = authClient.auth.onAuthStateChange(() => {
      void utils.auth.me.invalidate();
    });

    void completeOAuthRedirect()
      .then((result) => {
        if (!result.ok && result.error && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-error", { detail: result.error }));
        }
      })
      .catch((error) => {
        console.warn("[Auth] OAuth redirect exchange failed", error);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-error", { detail: String(error) }));
        }
      })
      .finally(() => {
        void authClient.auth.getSession().then(({ data }) => {
          if (data.session) void utils.auth.me.invalidate();
        });
      });

    return () => sub.subscription.unsubscribe();
  }, [utils]);

  // Open the global LoginDialog so the user can pick LINE or Email.
  const login = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-login"));
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [meQuery.data, meQuery.error, meQuery.isLoading]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading) return;
    if (state.user) return;
    if (!supabaseEnabled) return;
    window.dispatchEvent(new Event("open-login"));
  }, [redirectOnUnauthenticated, meQuery.isLoading, state.user]);

  return {
    ...state,
    login,
    logout,
    refresh: () => meQuery.refetch(),
  };
}
