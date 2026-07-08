/**
 * CatCompanion.tsx
 * 全站浮動貓咪助理 Mochi — 右下角固定
 * 點擊貓咪 → 顯示一則內容:
 *   - 療癒語錄(無連結),或
 *   - 塔羅 / 紫微小知識(配一個對應的「去算算看」連結)
 *   - 心靈療癒小物專屬微型小測驗 🐾 (作為輪播卡片之一，根據情緒與直覺推薦水晶商品並一鍵諮詢官方LINE/IG)
 * 點一下卡片可以換下一則。
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { PRODUCTS, Product } from "../data/products";
import ContactDialog from "./ContactDialog";
import ProductImageWatermark from "./ProductImageWatermark";
import SalePrice from "./SalePrice";

type Pearl = {
  text: string;
  cta?: { label: string; href: string };
};

// ─── 卡片內容池 ──────────────────────────────────────────────────────────────
const PEARLS: Pearl[] = [
  {
    text: "登入會員後，Mochi 可以參考你的占卜歷史，讓分析和回答更貼近你的狀態喔。",
  },
];

// ─── 貓咪圖片守護靈 ───────────────────────────────────────────────────────────
type CatMood = "idle" | "happy" | "curious";

function CompanionCat({
  mood,
  onClick,
}: {
  mood: CatMood;
  onClick: () => void;
}) {
  const [blink, setBlink] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const schedule = () => {
      const delay = 1800 + Math.random() * 2200;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 190);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const gazes = [
      { x: -0.85, y: -0.15 },
      { x: 0.75, y: -0.05 },
      { x: 0.18, y: -0.65 },
      { x: 0, y: 0 },
    ];
    let index = 0;
    const t = window.setInterval(() => {
      index = (index + 1) % gazes.length;
      setLook(gazes[index]);
    }, 1700);
    return () => window.clearInterval(t);
  }, []);

  const handleClick = () => {
    setIsReacting(true);
    window.setTimeout(() => setIsReacting(false), 520);
    onClick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setLook({
      x: Math.max(-1, Math.min(1, x * 2)),
      y: Math.max(-1, Math.min(1, y * 2)),
    });
  };

  const resetLook = () => {};

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetLook}
      className={`mochi-guardian mochi-guardian--${mood} ${isReacting ? "is-reacting" : ""} ${blink ? "is-blinking" : ""}`}
      style={
        {
          "--mochi-look-x": `${look.x}`,
          "--mochi-look-y": `${look.y}`,
        } as React.CSSProperties
      }
      aria-label="打開 Mochi 的話"
    >
      <span className="mochi-guardian__aura" aria-hidden="true" />
      <span
        className="mochi-guardian__sparkle mochi-guardian__sparkle--one"
        aria-hidden="true"
      />
      <span
        className="mochi-guardian__sparkle mochi-guardian__sparkle--two"
        aria-hidden="true"
      />
      <span
        className="mochi-guardian__sparkle mochi-guardian__sparkle--three"
        aria-hidden="true"
      />
      <span className="mochi-guardian__body">
        <img src="/cat-companion.png" alt="" draggable={false} />
        <span
          className="mochi-guardian__blink mochi-guardian__blink--left"
          aria-hidden="true"
        />
        <span
          className="mochi-guardian__blink mochi-guardian__blink--right"
          aria-hidden="true"
        />
      </span>
      <span className="mochi-guardian__shadow" aria-hidden="true" />
    </button>
  );
}

// 給定隨機種子般的順序,確保不會連續抽到同一則
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── 測驗題目結構 ─────────────────────────────────────────────────────────────
interface MiniQuizQuestion {
  question: string;
  options: {
    text: string;
    scores: Record<string, number>;
  }[];
}

const MINI_QUIZ_QUESTIONS: MiniQuizQuestion[] = [
  {
    question: "最近你的精神與情緒狀態最接近哪一種？",
    options: [
      {
        text: "🟢 思緒繁雜、容易胡思亂想",
        scores: { "calm-light": 2, "glimmer-fox": 1 },
      },
      {
        text: "🔵 覺得疲憊緊繃、睡眠不安穩",
        scores: { "calm-light": 1, "moonlight-wings": 2 },
      },
      {
        text: "🟡 缺乏方向，渴望著新動力",
        scores: { "courage-cat": 2, "wish-bunny": 1, "wealth-stone": 1 },
      },
      {
        text: "🌸 常感寂寞，期待招好桃花",
        scores: { "wish-fox": 2, "glimmer-fox": 1 },
      },
    ],
  },
  {
    question: "如果眼前有一隻熟睡的小動物，你最想撫摸牠？",
    options: [
      {
        text: "🐈 毛茸茸腳掌 (安全與安定感)",
        scores: { "courage-cat": 2, "glimmer-fox": 1 },
      },
      {
        text: "🐇 靈動長耳朵 (願望與美好)",
        scores: { "wish-bunny": 2, "wish-fox": 1 },
      },
      {
        text: "💎 溫潤發光背脊 (沉靜與專注)",
        scores: { "calm-light": 2, "wealth-stone": 1 },
      },
      {
        text: "🪽 隱隱閃爍的羽翼 (守護直覺)",
        scores: { "moonlight-wings": 2 },
      },
    ],
  },
  {
    question: "如果可以帶一個療癒能量回家，你希望它如何陪你？",
    options: [
      {
        text: "🛌 擺在床頭或桌前默默陪我",
        scores: { "glimmer-fox": 2, "wish-bunny": 1, "wish-fox": 1 },
      },
      {
        text: "💼 放在桌旁幫我吸引好運財氣",
        scores: { "wealth-stone": 2, "courage-cat": 1 },
      },
      { text: "🕯️ 寫日記或冥想淨化心靈磁場", scores: { "calm-light": 2 } },
      { text: "💍 隨身佩戴做我的自信護身符", scores: { "moonlight-wings": 2 } },
    ],
  },
];

const INITIAL_SCORES = {
  "glimmer-fox": 0,
  "wish-fox": 0,
  "courage-cat": 0,
  "wish-bunny": 0,
  "calm-light": 0,
  "moonlight-wings": 0,
  "wealth-stone": 0,
};

const BLESSINGS: Record<string, string> = {
  "glimmer-fox":
    "“當你覺得疲憊或自我懷疑時，讓茶晶小狐狸在夜裡靜靜接住你。你不需要完美，你已經很勇敢了。🌙”",
  "wish-fox":
    "“九尾狐會幫你把心願收在尾巴裡，提醒你找回自信與魅力。相信自己，你值得世上所有的溫柔與幸運。🦊🌈”",
  "courage-cat":
    "“虎眼石小貓會陪你做那個「深呼吸」，帶給你前行的勇氣與穩定力量。不用急，慢慢來，一定跳得過去。🐾🤎”",
  "wish-bunny":
    "“白水晶小兔幫你回歸初心、收藏小小但珍貴的心願。只要一直相信，美好的期待就會朝你慢慢走來。🐰🤍”",
  "calm-light":
    "“當思緒過於繁雜時，白菘石的淨化能量能提醒你先停 30 秒。努力的人也需要好好呼吸，慢下來也是一種前進。🤍☁️”",
  "moonlight-wings":
    "“拉長石散發的神祕藍光會指引你的直覺，陪你傾聽內在深處最真實的聲音。勇敢相信自己，你一直都很有力量。🪽☽”",
  "wealth-stone":
    "“天然結晶將好運與豐盛凝聚於你身邊。相信自己值得更多富足，你的每一份努力都正在悄悄積累運氣。💛✨”",
};

// ─── 主元件 ──────────────────────────────────────────────────────────────────
export default function CatCompanion() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<CatMood>("idle");
  const [isVisible, setIsVisible] = useState(false);
  const [order, setOrder] = useState<number[]>(() =>
    shuffle(Array.from({ length: PEARLS.length }, (_, i) => i))
  );
  const [cursor, setCursor] = useState(0);

  // ── 測驗專用 State ──
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(INITIAL_SCORES);
  const [loadingResult, setLoadingResult] = useState(false);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(
    null
  );
  const [isContactOpen, setIsContactOpen] = useState(false);

  const pearl = useMemo(() => PEARLS[order[cursor] ?? 0], [order, cursor]);

  // 元件掛載時淡入 + 自動展開卡片
  useEffect(() => {
    const t1 = setTimeout(() => setIsVisible(true), 500);
    const t2 = setTimeout(() => setIsOpen(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleCatClick = () => {
    setIsOpen(o => {
      const next = !o;
      if (!next) {
        resetQuiz();
      }
      return next;
    });
    setMood("happy");
    setTimeout(() => setMood("idle"), 1500);
  };

  // 點卡片 → 下一則 (非測驗中有效)
  const handleBubbleClick = () => {
    if (quizActive) return;
    if (PEARLS.length <= 1) return;
    const next = cursor + 1;
    if (next >= order.length) {
      setOrder(shuffle(Array.from({ length: PEARLS.length }, (_, i) => i)));
      setCursor(0);
    } else {
      setCursor(next);
    }
    setMood("curious");
    setTimeout(() => setMood("idle"), 1000);
  };

  const goTo = (href: string, e?: React.MouseEvent) => {
    if (href === "quiz-trigger") {
      if (e) e.stopPropagation();
      setQuizActive(true);
      setQuizStep(0);
      setScores(INITIAL_SCORES);
      setRecommendedProduct(null);
      setLoadingResult(false);
      setMood("curious");
      setTimeout(() => setMood("idle"), 1000);
      return;
    }
    setIsOpen(false);
    resetQuiz();
    setLocation(href);
  };

  const handleOptionClick = (optionScores: Record<string, number>) => {
    // 累加分數
    setScores(prev => {
      const updated = { ...prev };
      Object.entries(optionScores).forEach(([slug, score]) => {
        if (slug in updated) {
          updated[slug as keyof typeof INITIAL_SCORES] += score;
        }
      });
      return updated;
    });

    const nextStep = quizStep + 1;
    setMood("happy");
    setTimeout(() => setMood("idle"), 600);

    if (nextStep < MINI_QUIZ_QUESTIONS.length) {
      setQuizStep(nextStep);
    } else {
      // 測驗結束，展示能量感應 loading
      setLoadingResult(true);
      setMood("curious");

      setTimeout(() => {
        // 感應結束，計算分數最高的商品
        setLoadingResult(false);
        setMood("happy");

        let maxScore = -1;
        let bestSlug = "glimmer-fox"; // default fallback

        setScores(currentScores => {
          Object.entries(currentScores).forEach(([slug, score]) => {
            if (score > maxScore) {
              maxScore = score;
              bestSlug = slug;
            }
          });

          const matched =
            PRODUCTS.find(p => p.slug === bestSlug) || PRODUCTS[0];
          setRecommendedProduct(matched);
          return currentScores;
        });
      }, 1600);
    }
  };

  const resetQuiz = () => {
    setQuizActive(false);
    setQuizStep(0);
    setScores(INITIAL_SCORES);
    setRecommendedProduct(null);
    setLoadingResult(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quizActive) {
      resetQuiz();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <style>{`
        .mochi-guardian {
          position: relative;
          width: 96px;
          height: 124px;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          transform-origin: 50% 92%;
          animation: mochi-presence 5.2s ease-in-out infinite;
          filter: drop-shadow(0 16px 20px rgba(138, 114, 80, 0.22));
          perspective: 600px;
          -webkit-tap-highlight-color: transparent;
        }

        .mochi-guardian:focus-visible {
          outline: 2px solid rgba(209, 190, 155, 0.65);
          outline-offset: 6px;
          border-radius: 999px;
        }

        .mochi-guardian__body {
          position: absolute;
          inset: 0;
          display: block;
          overflow: visible;
          transform-origin: 50% 88%;
          animation: mochi-breathe 3.4s ease-in-out infinite;
          transition: transform 360ms cubic-bezier(0.22, 0.78, 0.28, 1);
        }

        .mochi-guardian__body img {
          position: absolute;
          left: 50%;
          bottom: -2px;
          width: 118px;
          max-width: none;
          transform:
            translateX(calc(-50% + (var(--mochi-look-x, 0) * 7px)))
            translateY(calc(var(--mochi-look-y, 0) * 3px))
            rotate(calc(var(--mochi-look-x, 0) * 4deg));
          transition: transform 520ms cubic-bezier(0.2, 0.84, 0.3, 1), filter 220ms ease-out;
          user-select: none;
          pointer-events: none;
        }

        .mochi-guardian__aura {
          position: absolute;
          inset: 4px -6px -4px -6px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 48% 38%, rgba(255, 218, 121, 0.32), transparent 44%),
            radial-gradient(circle at 50% 72%, rgba(209, 190, 155, 0.22), transparent 60%);
          filter: blur(10px);
          opacity: 0.78;
          animation: mochi-aura 3.8s ease-in-out infinite;
          pointer-events: none;
        }

        .mochi-guardian__shadow {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 3px;
          height: 11px;
          border-radius: 999px;
          background: rgba(84, 66, 45, 0.16);
          filter: blur(5px);
          animation: mochi-shadow 4.2s ease-in-out infinite;
          pointer-events: none;
        }

        .mochi-guardian__sparkle {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(255, 221, 107, 0.92);
          box-shadow: 0 0 12px rgba(255, 214, 88, 0.75);
          opacity: 0;
          pointer-events: none;
        }

        .mochi-guardian__sparkle--one {
          top: 14px;
          left: 7px;
          animation: mochi-sparkle 5.6s ease-in-out infinite;
        }

        .mochi-guardian__sparkle--two {
          top: 30px;
          right: 2px;
          width: 5px;
          height: 5px;
          animation: mochi-sparkle 6.2s 1.4s ease-in-out infinite;
        }

        .mochi-guardian__sparkle--three {
          left: 18px;
          bottom: 24px;
          width: 4px;
          height: 4px;
          animation: mochi-sparkle 6.8s 2.6s ease-in-out infinite;
        }

        .mochi-guardian__blink {
          position: absolute;
          top: 44px;
          width: 18px;
          height: 2px;
          border-radius: 999px;
          background: rgba(52, 25, 9, 0.88);
          opacity: 0;
          transform: scaleX(0.7);
          pointer-events: none;
        }

        .mochi-guardian__blink--left {
          left: 27px;
          rotate: -3deg;
        }

        .mochi-guardian__blink--right {
          right: 24px;
          rotate: 3deg;
        }

        .mochi-guardian.is-blinking .mochi-guardian__blink {
          opacity: 1;
        }

        .mochi-guardian.is-blinking .mochi-guardian__body img {
          filter: brightness(1.02) saturate(1.05);
        }

        .mochi-guardian--happy {
          animation: mochi-acknowledge 0.62s ease-out, mochi-presence 5.2s 0.62s ease-in-out infinite;
        }

        .mochi-guardian--happy .mochi-guardian__aura {
          opacity: 0.92;
          filter: blur(9px) saturate(1.2);
        }

        .mochi-guardian--curious .mochi-guardian__body {
          animation: mochi-listen 0.8s ease-in-out, mochi-breathe 3.4s 0.8s ease-in-out infinite;
        }

        .mochi-guardian.is-reacting .mochi-guardian__body {
          animation: mochi-soft-react 0.62s ease-out, mochi-breathe 3.4s 0.62s ease-in-out infinite;
        }

        .mochi-guardian:hover .mochi-guardian__body {
          transform: translateY(-2px);
        }

        @keyframes mochi-presence {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes mochi-breathe {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          28% { transform: translateY(-2px) rotate(-1.2deg); }
          64% { transform: translateY(1px) rotate(1deg); }
        }

        @keyframes mochi-acknowledge {
          0%, 100% { transform: translateY(0); }
          42% { transform: translateY(-8px); }
        }

        @keyframes mochi-listen {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-1.8deg); }
        }

        @keyframes mochi-soft-react {
          0%, 100% { transform: translateY(0); }
          45% { transform: translateY(-8px) rotate(-2.5deg); }
        }

        @keyframes mochi-aura {
          0%, 100% { opacity: 0.58; transform: scale(0.96); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }

        @keyframes mochi-shadow {
          0%, 100% { opacity: 0.72; transform: scaleX(1); }
          50% { opacity: 0.46; transform: scaleX(0.84); }
        }

        @keyframes mochi-sparkle {
          0%, 100% { opacity: 0; transform: translateY(5px) scale(0.4); }
          42% { opacity: 0.95; transform: translateY(0) scale(1); }
          70% { opacity: 0.25; transform: translateY(-4px) scale(0.72); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mochi-guardian,
          .mochi-guardian__body,
          .mochi-guardian__aura,
          .mochi-guardian__shadow,
          .mochi-guardian__sparkle {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)",
          pointerEvents: "none",
        }}
      >
        {/* 卡片 */}
        <div
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen
              ? "translateY(0) scale(1)"
              : "translateY(8px) scale(0.95)",
            transition:
              "opacity 0.3s cubic-bezier(0.23,1,0.32,1), transform 0.3s cubic-bezier(0.23,1,0.32,1)",
            pointerEvents: isOpen ? "auto" : "none",
            width: quizActive ? "252px" : "232px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="relative rounded-2xl rounded-br-sm border overflow-hidden"
            style={{
              background: "rgba(250,247,244,0.96)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(209,190,155,0.3)",
              boxShadow: "0 4px 24px rgba(209,190,155,0.2)",
              transition: "width 0.3s ease",
            }}
          >
            {/* 頂部 */}
            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-0.5">
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontStyle: "italic",
                  color: "#A38D6B",
                }}
              >
                {quizActive ? "✦ Mochi 心理測驗" : "✦ Mochi"}
              </span>
              <button
                onClick={handleClose}
                className="text-[11px] text-[#31353A]/40 hover:text-[#31353A]/72 transition-colors border-none bg-transparent cursor-pointer p-0.5"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            {/* ── 測驗進行中 ── */}
            {quizActive ? (
              loadingResult ? (
                // 讀取畫面
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t border-b border-[#D1BE9B] mb-4"></div>
                  <p
                    className="text-[11.5px] leading-[2] text-[#31353A]/80 tracking-wider font-light"
                    style={{ fontFamily: "Noto Serif TC, serif" }}
                  >
                    Mochi 正在為你
                    <br />
                    感應空間的水晶能量氣場… 🐾
                    <br />
                    <span className="text-[10px] text-[#D1BE9B]">𓇢𓆸 𓂃𓈒𓏸 ✧</span>
                  </p>
                </div>
              ) : recommendedProduct ? (
                // 結果畫面
                <div className="px-3.5 pt-1.5 pb-3">
                  <div className="text-center text-[10px] text-[#D1BE9B]/80 tracking-widest mb-2 select-none">
                    ୨୧ ───────── ୨୧
                  </div>
                  <p className="text-[10px] text-[#A38D6B] tracking-[0.2em] font-medium text-center mb-3">
                    ✦ Mochi 的專屬能量推薦 ✦
                  </p>

                  <div className="flex gap-2.5 items-center bg-[#F2EDE8]/40 border border-[#D1BE9B]/15 rounded-xl p-2.5 mb-3">
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-[#D1BE9B]/15">
                      <ProductImageWatermark
                        product={recommendedProduct}
                        alt={recommendedProduct.name}
                        imageClassName="h-full w-full object-cover"
                        watermarkClassName="bottom-0.5 right-0.5 max-w-[calc(100%-0.25rem)] px-1 py-0.5 text-[6px] [&_svg]:h-2 [&_svg]:w-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5
                        className="text-[12px] font-medium tracking-[0.1em] text-[#31353A] truncate animate-fade-in"
                        style={{ fontFamily: "Noto Serif TC, serif" }}
                      >
                        {recommendedProduct.name}
                      </h5>
                      <p className="text-[9px] text-[#D1BE9B] tracking-[0.1em] mt-0.5 truncate">
                        {recommendedProduct.material} · ✦
                      </p>
                      <SalePrice
                        price={recommendedProduct.price}
                        originalPrice={recommendedProduct.originalPrice}
                        className="mt-1 flex flex-wrap items-baseline gap-1.5"
                        originalClassName="text-[9px] text-[#31353A]/38 line-through"
                        saleClassName="text-[11px] font-semibold text-[#8A7250]"
                      />
                    </div>
                  </div>

                  <p
                    className="text-[11px] leading-[1.8] text-[#31353A]/76 tracking-wider mb-4 px-1"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {BLESSINGS[recommendedProduct.slug] ||
                      "每一份相遇的能量，都是宇宙最美好的安排。✦"}
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => goTo(`/shop/${recommendedProduct.slug}`)}
                      className="w-full text-[10.5px] tracking-[0.2em] py-2 rounded-full border border-[#D1BE9B]/40 text-[#A38D6B] hover:bg-[#D1BE9B]/10 transition-all duration-300 active:scale-95 cursor-pointer text-center"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 400,
                      }}
                    >
                      了解療癒詳情 →
                    </button>
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="w-full text-[10.5px] font-medium tracking-[0.2em] py-2 rounded-full bg-[#3D4144] hover:bg-[#D1BE9B] text-[#FAF7F4] hover:text-[#31353A] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm text-center"
                      style={{ fontFamily: "Noto Serif TC, serif" }}
                    >
                      問問適不適合我 ♡
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="w-full text-[10.5px] tracking-[0.2em] py-1.5 text-[#8A7250] hover:text-[#31353A] transition-colors cursor-pointer text-center mt-1.5 border-none bg-transparent"
                      style={{ fontFamily: "Noto Serif TC, serif" }}
                    >
                      重新測驗 🐾
                    </button>
                  </div>
                </div>
              ) : (
                // 題目畫面
                <div className="px-3.5 pt-1.5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[9px] text-[#D1BE9B] tracking-[0.15em]"
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontStyle: "italic",
                      }}
                    >
                      Question {quizStep + 1} of 3
                    </span>
                    <span className="text-[10px] text-[#A38D6B] tracking-[0.2em]">
                      ✦ {quizStep + 1} / 3 ✦
                    </span>
                  </div>
                  <p
                    className="text-[11.5px] leading-[1.8] text-[#31353A]/90 font-medium tracking-wider mb-3.5"
                    style={{ fontFamily: "Noto Serif TC, serif" }}
                  >
                    {MINI_QUIZ_QUESTIONS[quizStep].question}
                  </p>
                  <div className="flex flex-col gap-2">
                    {MINI_QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt.scores)}
                        className="w-full text-left text-[11px] leading-[1.7] tracking-wider px-3 py-2 rounded-xl border border-[#D1BE9B]/30 hover:border-[#A38D6B] hover:bg-[#D1BE9B]/10 text-[#31353A]/80 hover:text-[#31353A] transition-all duration-200 active:scale-[0.98] cursor-pointer bg-white/40"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              // ── 正常語錄/知識輪播模式 ──
              <>
                {/* 內容 */}
                <div
                  className="px-3.5 pt-2.5 pb-2.5"
                  onClick={handleBubbleClick}
                  style={{ cursor: "pointer" }}
                >
                  <p
                    className="text-[11.5px] leading-[1.9] text-[#31353A]/85 tracking-wider"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {pearl.text}
                  </p>
                </div>

                {/* CTA(只在那則有附連結時顯示) */}
                {pearl.cta && (
                  <div className="px-3.5 pb-2.5">
                    <button
                      onClick={e => goTo(pearl.cta!.href, e)}
                      className="w-full text-[11px] tracking-[0.2em] py-1.5 rounded-full border border-[#D1BE9B]/50 text-[#A38D6B] hover:bg-[#D1BE9B]/15 hover:text-[#8A7250] transition-colors cursor-pointer"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 400,
                      }}
                    >
                      {pearl.cta.label}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* 泡泡尾巴 */}
            <div
              className="absolute -bottom-2 right-4 w-3 h-3"
              style={{
                background: "rgba(250,247,244,0.96)",
                clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                border: "1px solid rgba(209,190,155,0.3)",
              }}
            />
          </div>
        </div>

        {/* 貓咪本體 */}
        <div
          className="relative"
          style={{
            width: "96px",
            height: "138px",
            pointerEvents: "auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(209,190,155,0.14) 0%, transparent 68%)",
              transform: "scale(1.35)",
              pointerEvents: "none",
            }}
          />
          <CompanionCat mood={mood} onClick={handleCatClick} />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span
              className="text-[10px] tracking-[0.15em]"
              style={{
                fontFamily: "Noto Serif TC, serif",
                fontWeight: 200,
                color: "#918888",
                fontSize: "10px",
              }}
            >
              點擊看 Mochi 的話
            </span>
          </div>
        </div>
      </div>

      {/* 聯繫購買 Dialog 彈窗 */}
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productName={recommendedProduct?.name}
      />
    </>
  );
}
