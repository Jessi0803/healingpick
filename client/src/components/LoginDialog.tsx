import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { signInWithEmail, signInWithGoogle, supabaseEnabled } from "@/lib/supabase";

/**
 * Global login dialog. Listens for the `open-login` window event so any
 * component can trigger it via `window.dispatchEvent(new Event("open-login"))`.
 */
export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setSent(false);
      setError(null);
    };
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  if (!supabaseEnabled) return null;

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const res = await signInWithEmail(email.trim());
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError(res.error || "寄信失敗，請稍後再試");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm bg-[#FAF7F4] border border-[#D1BE9B]/30">
        <DialogTitle className="text-center text-[15px] tracking-[0.25em] font-extralight text-[#31353A]"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}>
          登入 / 註冊
        </DialogTitle>
        <DialogDescription className="text-center text-[11px] tracking-wider text-[#31353A]/60 mt-1 mb-4"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
          選一種方式進來,點數會跟著你的帳號 🐾
        </DialogDescription>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full py-3 text-[12px] tracking-[0.25em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
        >
          使用 Google 登入
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#D1BE9B]/30" />
          <span className="text-[10px] tracking-[0.3em] text-[#31353A]/40"
            style={{ fontFamily: "Cormorant Garamond, serif" }}>
            OR
          </span>
          <div className="flex-1 h-px bg-[#D1BE9B]/30" />
        </div>

        {/* Email magic link */}
        {sent ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✉️</div>
            <p className="text-[12px] text-[#31353A]/80 tracking-wider"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
              登入連結已寄到 <span className="text-[#A38D6B]">{email}</span>
            </p>
            <p className="text-[10px] text-[#31353A]/50 tracking-wider mt-2"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}>
              請打開信箱、點裡面的連結就會自動登入
              <br />(沒收到也檢查垃圾信件夾)
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="你的 email"
              required
              autoComplete="email"
              className="w-full bg-white/60 border border-[#D1BE9B]/40 rounded-full px-4 py-2.5 text-[13px] text-[#31353A]/85 placeholder:text-[#31353A]/40 focus:outline-none focus:border-[#A38D6B]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full py-3 text-[12px] tracking-[0.25em] border border-[#31353A]/30 text-[#31353A]/85 rounded-full hover:bg-[#31353A] hover:text-[#FAF7F4] transition-all duration-500 disabled:opacity-50"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              {sending ? "寄送中…" : "寄登入連結到 Email"}
            </button>
            {error && (
              <p className="text-center text-[11px] text-[#C9837A] tracking-wider mt-1">
                {error}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
