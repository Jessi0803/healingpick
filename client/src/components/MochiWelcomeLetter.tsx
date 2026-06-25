import { useEffect, useState } from "react";
import { Heart, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "healingpick-mochi-welcome-letter:v1";

export default function MochiWelcomeLetter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenLetter = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeenLetter) setIsVisible(true);
  }, []);

  const closeLetter = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#31353A]/35 px-4 py-7 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeLetter} aria-hidden="true" />
      <section
        className="relative max-h-[88vh] w-full max-w-[34rem] overflow-hidden rounded-[8px] border border-white/75 bg-[#FFFDF8] shadow-[0_24px_70px_rgba(49,53,58,0.22)]"
        aria-label="Mochi 給你的信"
        role="dialog"
        aria-modal="true"
      >
        <div className="pointer-events-none absolute -left-16 -top-20 h-44 w-44 rounded-full bg-[#E5DFEE]/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-14 h-48 w-48 rounded-full bg-[#F7D991]/35 blur-3xl" />
        <button
          type="button"
          onClick={closeLetter}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-[#6F5648] shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#D1BE9B]"
          aria-label="關閉 Mochi 給你的信"
        >
          <X size={18} />
        </button>

        <div className="relative max-h-[88vh] overflow-y-auto px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-5 flex items-center justify-center gap-3 text-[#A38D6B]">
            <span className="h-px w-12 bg-[#D1BE9B]/65" />
            <Sparkles size={18} strokeWidth={1.45} />
            <span className="h-px w-12 bg-[#D1BE9B]/65" />
          </div>

          <div
            className="space-y-4 text-center text-[#4B4440]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            <p className="text-[15px] leading-[1.9] tracking-[0.12em] text-[#8A7250] sm:text-[16px]">
              𓂃 𓈒𓏸 Mochi 給你的信 𓂃 𓈒𓏸
            </p>

            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#D1BE9B]/55 bg-[#FFF8E8]/80 text-[#A38D6B] shadow-[0_10px_28px_rgba(163,141,107,0.16)]">
              <Heart size={24} strokeWidth={1.5} />
            </div>

            <p className="text-[16px] leading-[1.95] tracking-[0.08em] sm:text-[17px]">
              𓂃 𓈒𓏸 HealingPick 的會員寶寶們看過來 𓂃 𓈒𓏸
            </p>

            <p className="text-[14px] leading-[2] tracking-[0.06em] text-[#5B524C] sm:text-[15px]">
              除了 AI 免費占卜之外，HealingPick 現在也有「真人占卜服務」啦 𓆩♡𓆪
            </p>

            <p className="text-[14px] leading-[2] tracking-[0.06em] text-[#5B524C] sm:text-[15px]">
              這次邀請到擁有 30 年占卜經驗的占卜老師，擅長感情、事業、人際關係，以及各種人生小煩惱的解析 ☽⋆
            </p>

            <div className="mx-auto my-5 max-w-[22rem] rounded-[8px] border border-[#D1BE9B]/45 bg-[#FFF9F1]/82 px-4 py-4 text-[#6F5648] shadow-[0_12px_30px_rgba(163,141,107,0.1)]">
              <p className="mb-3 text-[14px] leading-[1.8] tracking-[0.12em] text-[#A38D6B]">
                現在推出限時優惠 𓇬
              </p>
              <p className="text-[15px] leading-[1.9] tracking-[0.06em]">✦ 30 分鐘問到飽只要 500 元</p>
              <p className="text-[15px] leading-[1.9] tracking-[0.06em]">✧ 單題詢問 300 元</p>
            </div>

            <p className="text-[14px] leading-[2] tracking-[0.06em] text-[#5B524C] sm:text-[15px]">
              歡迎私訊官方 LINE 預約 𓍯
            </p>

            <a
              href="https://lin.ee/6PBHLFX"
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-1 inline-flex min-h-11 items-center justify-center rounded-full border border-[#A38D6B]/45 bg-[#31353A] px-5 py-2.5 text-[13px] tracking-[0.12em] text-[#FFFDF8] shadow-[0_12px_26px_rgba(49,53,58,0.18)] transition hover:bg-[#4B4440] focus-visible:ring-2 focus-visible:ring-[#D1BE9B] sm:text-[14px]"
            >
              打開官方 LINE
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
