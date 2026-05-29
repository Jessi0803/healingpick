import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import PageLayout from "@/components/PageLayout";
import { supabase, updatePassword } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The Supabase password-reset link drops the user here with a session in
  // the URL hash; supabase-js picks it up automatically. We just wait for the
  // session to materialise so updatePassword() will work.
  useEffect(() => {
    if (!supabase) {
      setError("Supabase 尚未設定");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // also check immediately in case the event already fired before mount
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("密碼至少 6 個字");
      return;
    }
    if (password !== confirm) {
      setError("兩次輸入的密碼不一樣");
      return;
    }
    setBusy(true);
    const res = await updatePassword(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "更新失敗,請稍後再試");
      return;
    }
    setDone(true);
    setTimeout(() => setLocation("/"), 2200);
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="glass-panel rounded-2xl border border-[#D1BE9B]/30 p-8 w-full max-w-sm text-center">
          <h1 className="text-[15px] tracking-[0.25em] font-extralight text-[#31353A] mb-2"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}>
            重設密碼
          </h1>
          <p className="text-[11px] tracking-wider text-[#31353A]/60 mb-6"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
            設一組新密碼就能繼續使用 🐾
          </p>

          {done ? (
            <div className="py-4">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-[12px] text-[#31353A]/80"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
                密碼已更新,正在帶你回首頁…
              </p>
            </div>
          ) : !ready ? (
            <p className="text-[11px] text-[#31353A]/60 py-6">
              正在驗證連結… 如果一直停在這裡,代表連結已失效,請回登入頁重新申請。
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新密碼(至少 6 個字)"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-white/60 border border-[#D1BE9B]/40 rounded-full px-4 py-2.5 text-[13px] text-[#31353A]/85 placeholder:text-[#31353A]/40 focus:outline-none focus:border-[#A38D6B]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="再次輸入新密碼"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-white/60 border border-[#D1BE9B]/40 rounded-full px-4 py-2.5 text-[13px] text-[#31353A]/85 placeholder:text-[#31353A]/40 focus:outline-none focus:border-[#A38D6B]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full mt-1 py-3 text-[12px] tracking-[0.25em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 disabled:opacity-50"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
                {busy ? "更新中…" : "設定新密碼"}
              </button>
              {error && (
                <p className="text-center text-[11px] text-[#C9837A] tracking-wider mt-1">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
