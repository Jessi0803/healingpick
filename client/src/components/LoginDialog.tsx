import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  sendPasswordResetEmail,
  signInWithLine,
  signInWithPassword,
  signUpWithPassword,
  supabaseEnabled,
} from "@/lib/supabase";

type Mode = "login" | "register" | "forgot";

const TITLE: Record<Mode, string> = {
  login: "登入",
  register: "建立帳號",
  forgot: "重設密碼",
};

const SUBTITLE: Record<Mode, string> = {
  login: "歡迎回來,Mochi 在等你 🐾",
  register: "註冊就送 5 點 + 每天 2 次免費占卜 🐾",
  forgot: "輸入你的 email,我們會寄重設密碼的連結給你",
};

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setMode("login");
      setError(null);
      setInfo(null);
    };
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      setOpen(true);
      setMode("login");
      setError(translateAuthError(typeof detail === "string" ? detail : "登入失敗,請稍後再試"));
      setInfo(null);
    };
    window.addEventListener("auth-error", handler);
    return () => window.removeEventListener("auth-error", handler);
  }, []);

  // Reset transient state whenever mode flips.
  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [mode]);

  if (!supabaseEnabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    if (mode === "login") {
      const res = await signInWithPassword(email.trim(), password);
      setBusy(false);
      if (!res.ok) {
        setError(translateAuthError(res.error));
        return;
      }
      setOpen(false);
    } else if (mode === "register") {
      if (password.length < 6) {
        setBusy(false);
        setError("密碼至少 6 個字");
        return;
      }
      const res = await signUpWithPassword(email.trim(), password);
      setBusy(false);
      if (!res.ok) {
        setError(translateAuthError(res.error));
        return;
      }
      if (res.needsVerification) {
        setInfo(`註冊成功!驗證信已寄到 ${email}\n請打開信點裡面的連結完成驗證,之後就能登入。`);
        return;
      }
      // Already signed in (no email verification required)
      setOpen(false);
    } else {
      const res = await sendPasswordResetEmail(email.trim());
      setBusy(false);
      if (!res.ok) {
        setError(translateAuthError(res.error));
        return;
      }
      setInfo(`重設密碼連結已寄到 ${email}\n打開信點連結就能設一組新密碼。`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm bg-[#FAF7F4] border border-[#D1BE9B]/30">
        <DialogTitle className="text-center text-[15px] tracking-[0.25em] font-extralight text-[#31353A]"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}>
          {TITLE[mode]}
        </DialogTitle>
        <DialogDescription className="text-center text-[11px] tracking-wider text-[#31353A]/60 mt-1 mb-3 whitespace-pre-line"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
          {SUBTITLE[mode]}
        </DialogDescription>

        {info ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✉️</div>
            <p className="text-[12px] text-[#31353A]/80 tracking-wider whitespace-pre-line"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
              {info}
            </p>
            <p className="text-[10px] text-[#31353A]/50 tracking-wider mt-3"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}>
              沒收到也順便檢查垃圾信件夾
            </p>
            <button
              onClick={() => { setMode("login"); setInfo(null); setPassword(""); }}
              className="mt-5 text-[11px] tracking-[0.2em] text-[#A38D6B] hover:text-[#31353A] transition-colors border-b border-[#A38D6B]/40 pb-0.5"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
              返回登入
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
                autoComplete="email"
                className="w-full bg-white/60 border border-[#D1BE9B]/40 rounded-full px-4 py-2.5 text-[13px] text-[#31353A]/85 placeholder:text-[#31353A]/40 focus:outline-none focus:border-[#A38D6B]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              />
              {mode !== "forgot" && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "密碼(至少 6 個字)" : "密碼"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full bg-white/60 border border-[#D1BE9B]/40 rounded-full px-4 py-2.5 text-[13px] text-[#31353A]/85 placeholder:text-[#31353A]/40 focus:outline-none focus:border-[#A38D6B]"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full mt-1 py-3 text-[12px] tracking-[0.25em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 disabled:opacity-50"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                {busy
                  ? "處理中…"
                  : mode === "login"
                    ? "登入"
                    : mode === "register"
                      ? "建立帳號"
                      : "寄重設連結"}
              </button>
              {error && (
                <div className="mt-1 text-center">
                  <p className="text-[11px] text-[#C9837A] tracking-wider">
                    {error}
                  </p>
                </div>
              )}
            </form>

            {/* Secondary actions */}
            <div className="mt-3 flex items-center justify-between text-[11px] tracking-wider"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
              {mode === "login" ? (
                <>
                  <button onClick={() => setMode("forgot")} className="text-[#A38D6B] hover:text-[#31353A]">
                    忘記密碼?
                  </button>
                  <button onClick={() => setMode("register")} className="text-[#A38D6B] hover:text-[#31353A]">
                    建立帳號
                  </button>
                </>
              ) : (
                <button onClick={() => setMode("login")} className="text-[#A38D6B] hover:text-[#31353A]">
                  返回登入
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#D1BE9B]/30" />
              <span className="text-[10px] tracking-[0.3em] text-[#31353A]/40"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>
                OR
              </span>
              <div className="flex-1 h-px bg-[#D1BE9B]/30" />
            </div>

            <button
              onClick={async () => {
                setError(null);
                setInfo(null);
                const res = await signInWithLine();
                if (!res.ok) setError(translateAuthError(res.error));
              }}
              className="w-full py-3 text-[12px] tracking-[0.25em] border border-[#06C755]/45 bg-[#06C755] text-white rounded-full hover:bg-[#05B94F] transition-all duration-500"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
              使用 LINE {mode === "register" ? "註冊" : "登入"}
            </button>

          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function translateAuthError(msg: string | undefined): string {
  if (!msg) return "未知錯誤,請稍後再試";
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email 或密碼錯誤";
  }
  if (lower.includes("user already") || lower.includes("already registered")) {
    return "這個 email 已經註冊過了,直接登入即可";
  }
  if (lower.includes("email not confirmed")) {
    return "這個 email 還沒驗證,請先去信箱點驗證連結";
  }
  if (lower.includes("password should be")) {
    return "密碼至少 6 個字";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "請求太頻繁,請等一下再試";
  }
  return msg;
}
