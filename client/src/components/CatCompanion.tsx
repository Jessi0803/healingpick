/**
 * CatCompanion.tsx
 * 全站浮動貓咪助理 Mochi — 右下角固定
 * 點擊貓咪 → 顯示一則內容:
 *   - 療癒語錄(無連結),或
 *   - 塔羅 / 紫微小知識(配一個對應的「去算算看」連結)
 *   - 心靈療癒小物專屬微型小測驗 🐾 (作為輪播卡片之一，根據情緒與直覺推薦水晶商品並一鍵諮詢官方LINE/IG)
 * 點一下卡片可以換下一則。
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { PRODUCTS, Product } from '../data/products';
import ContactDialog from './ContactDialog';

type Pearl = {
  text: string;
  cta?: { label: string; href: string };
};

// ─── 卡片內容池 ──────────────────────────────────────────────────────────────
const PEARLS: Pearl[] = [
  // 三種純療癒語錄 (僅保留 3 種最溫柔的語錄)
  { text: '每一個感受都值得被聽見 ✦' },
  { text: '你不需要完美,只需要真實 ♡' },
  { text: '深呼吸三秒,當下就會溫柔一點 ☽' },

  // Mochi 心理測驗入口卡片 (作為輪播項目之一顯示)
  {
    text: '🔮 最近有些疲憊或迷茫嗎？讓 Mochi 幫你感應一下，測測現在最適合你狀態的水晶與療癒小物吧 🐾',
    cta: { label: '開始心理測驗 ✦', href: 'quiz-trigger' }
  },

  // 塔羅小知識(配連結到 /tarot)
  {
    text: '塔羅不是預言,是一面照出你內心真實樣子的鏡子。',
    cta: { label: '照照看 →', href: '/tarot' },
  },

  // 紫微小知識(配連結到 /ziwei)
  {
    text: '紫微命盤會幫你看見自己的優勢劣勢，以及現在適合怎麼調整。',
    cta: { label: '看紫微命盤 →', href: '/ziwei' },
  },
];

// ─── 貓咪 SVG ─────────────────────────────────────────────────────────────────
type CatMood = 'idle' | 'happy' | 'curious';

function CompanionCatSVG({ mood, onClick }: { mood: CatMood; onClick: () => void }) {
  const [tailSway, setTailSway] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTailSway((p) => !p), 1400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const renderEyes = () => {
    if (blink) {
      return (
        <>
          <path d="M22 26 Q26 24 30 26" stroke="#D1BE9B" strokeWidth="1.1" fill="none" />
          <path d="M30 26 Q34 24 38 26" stroke="#D1BE9B" strokeWidth="1.1" fill="none" />
        </>
      );
    }
    if (mood === 'happy') {
      return (
        <>
          <path d="M22 27 Q26 23 30 27" stroke="#D1BE9B" strokeWidth="1.1" fill="none" />
          <path d="M30 27 Q34 23 38 27" stroke="#D1BE9B" strokeWidth="1.1" fill="none" />
        </>
      );
    }
    if (mood === 'curious') {
      return (
        <>
          <circle cx="26" cy="26" r="3.5" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.15)" />
          <circle cx="34" cy="26" r="3.5" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.15)" />
          <circle cx="27" cy="25.5" r="1.2" fill="#D1BE9B" opacity="0.6" />
          <circle cx="35" cy="25.5" r="1.2" fill="#D1BE9B" opacity="0.6" />
        </>
      );
    }
    return (
      <>
        <circle cx="26" cy="26" r="3" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
        <circle cx="34" cy="26" r="3" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
        <circle cx="26.8" cy="25.5" r="1" fill="#D1BE9B" opacity="0.5" />
        <circle cx="34.8" cy="25.5" r="1" fill="#D1BE9B" opacity="0.5" />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 60 80"
      width="64" height="80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <ellipse cx="30" cy="55" rx="18" ry="20" stroke="#D1BE9B" strokeWidth="1.2" fill="rgba(209,190,155,0.06)" />
      <circle cx="30" cy="25" r="16" stroke="#D1BE9B" strokeWidth="1.2" fill="rgba(209,190,155,0.08)" />
      <path d="M16 14 L12 4 L22 10 Z" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
      <path d="M44 14 L48 4 L38 10 Z" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
      <path d="M17 13 L14 6 L21 11 Z" fill="rgba(209,190,155,0.2)" />
      <path d="M43 13 L46 6 L39 11 Z" fill="rgba(209,190,155,0.2)" />
      {renderEyes()}
      <path d="M29 31 L30 33 L31 31 Q30 29.5 29 31 Z" fill="#D1BE9B" opacity="0.6" />
      {mood === 'happy' ? (
        <path d="M26 35 Q30 39 34 35" stroke="#D1BE9B" strokeWidth="0.9" fill="none" />
      ) : (
        <path d="M27 35 Q30 37.5 33 35" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
      )}
      <line x1="8" y1="30" x2="22" y2="31" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="7" y1="33" x2="21" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="52" y1="30" x2="38" y2="31" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="53" y1="33" x2="39" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      <path d="M15 42 Q30 46 45 42" stroke="#D1BE9B" strokeWidth="0.7" fill="none" />
      <path d="M28 44 L30 47 L32 44" stroke="#D1BE9B" strokeWidth="0.6" strokeLinejoin="round" />
      <path
        d="M46 68 Q58 60 54 48 Q50 38 46 46"
        stroke="#D1BE9B" strokeWidth="1.3" fill="none"
        style={{
          transform: tailSway ? 'rotate(14deg)' : 'rotate(-10deg)',
          transformOrigin: '46px 68px',
          transition: 'transform 1.2s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      <ellipse cx="21" cy="71" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="39" cy="71" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
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
    question: '最近你的精神與情緒狀態最接近哪一種？',
    options: [
      { text: '🟢 思緒繁雜、容易胡思亂想', scores: { 'calm-light': 2, 'glimmer-fox': 1 } },
      { text: '🔵 覺得疲憊緊繃、睡眠不安穩', scores: { 'calm-light': 1, 'moonlight-wings': 2 } },
      { text: '🟡 缺乏方向，渴望著新動力', scores: { 'courage-cat': 2, 'wish-bunny': 1, 'wealth-stone': 1 } },
      { text: '🌸 常感寂寞，期待招好桃花', scores: { 'wish-fox': 2, 'glimmer-fox': 1 } },
    ]
  },
  {
    question: '如果眼前有一隻熟睡的小動物，你最想撫摸牠？',
    options: [
      { text: '🐈 毛茸茸腳掌 (安全與安定感)', scores: { 'courage-cat': 2, 'glimmer-fox': 1 } },
      { text: '🐇 靈動長耳朵 (願望與美好)', scores: { 'wish-bunny': 2, 'wish-fox': 1 } },
      { text: '💎 溫潤發光背脊 (沉靜與專注)', scores: { 'calm-light': 2, 'wealth-stone': 1 } },
      { text: '🪽 隱隱閃爍的羽翼 (守護直覺)', scores: { 'moonlight-wings': 2 } },
    ]
  },
  {
    question: '如果可以帶一個療癒能量回家，你希望它如何陪你？',
    options: [
      { text: '🛌 擺在床頭或桌前默默陪我', scores: { 'glimmer-fox': 2, 'wish-bunny': 1, 'wish-fox': 1 } },
      { text: '💼 放在桌旁幫我吸引好運財氣', scores: { 'wealth-stone': 2, 'courage-cat': 1 } },
      { text: '🕯️ 寫日記或冥想淨化心靈磁場', scores: { 'calm-light': 2 } },
      { text: '💍 隨身佩戴做我的自信護身符', scores: { 'moonlight-wings': 2 } },
    ]
  }
];

const INITIAL_SCORES = {
  'glimmer-fox': 0,
  'wish-fox': 0,
  'courage-cat': 0,
  'wish-bunny': 0,
  'calm-light': 0,
  'moonlight-wings': 0,
  'wealth-stone': 0,
};

const BLESSINGS: Record<string, string> = {
  'glimmer-fox': '“當你覺得疲憊或自我懷疑時，讓茶晶小狐狸在夜裡靜靜接住你。你不需要完美，你已經很勇敢了。🌙”',
  'wish-fox': '“九尾狐會幫你把心願收在尾巴裡，提醒你找回自信與魅力。相信自己，你值得世上所有的溫柔與幸運。🦊🌈”',
  'courage-cat': '“虎眼石小貓會陪你做那個「深呼吸」，帶給你前行的勇氣與穩定力量。不用急，慢慢來，一定跳得過去。🐾🤎”',
  'wish-bunny': '“白水晶小兔幫你回歸初心、收藏小小但珍貴的心願。只要一直相信，美好的期待就會朝你慢慢走來。🐰🤍”',
  'calm-light': '“當思緒過於繁雜時，白菘石的淨化能量能提醒你先停 30 秒。努力的人也需要好好呼吸，慢下來也是一種前進。🤍☁️”',
  'moonlight-wings': '“拉長石散發的神祕藍光會指引你的直覺，陪你傾聽內在深處最真實的聲音。勇敢相信自己，你一直都很有力量。🪽☽”',
  'wealth-stone': '“天然結晶將好運與豐盛凝聚於你身邊。相信自己值得更多富足，你的每一份努力都正在悄悄積累運氣。💛✨”',
};

// ─── 主元件 ──────────────────────────────────────────────────────────────────
export default function CatCompanion() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<CatMood>('idle');
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
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
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

  // 卡片打開時,每 8 秒自動切下一則 (若在測驗中則暫停輪播)
  useEffect(() => {
    if (!isOpen || quizActive) return;
    const id = setInterval(() => {
      setCursor((c) => {
        const next = c + 1;
        if (next >= order.length) {
          setOrder(shuffle(Array.from({ length: PEARLS.length }, (_, i) => i)));
          return 0;
        }
        return next;
      });
    }, 8000);
    return () => clearInterval(id);
  }, [isOpen, order.length, quizActive]);

  const handleCatClick = () => {
    setIsOpen((o) => {
      const next = !o;
      if (!next) {
        resetQuiz();
      }
      return next;
    });
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
  };

  // 點卡片 → 下一則 (非測驗中有效)
  const handleBubbleClick = () => {
    if (quizActive) return;
    const next = cursor + 1;
    if (next >= order.length) {
      setOrder(shuffle(Array.from({ length: PEARLS.length }, (_, i) => i)));
      setCursor(0);
    } else {
      setCursor(next);
    }
    setMood('curious');
    setTimeout(() => setMood('idle'), 1000);
  };

  const goTo = (href: string, e?: React.MouseEvent) => {
    if (href === 'quiz-trigger') {
      if (e) e.stopPropagation();
      setQuizActive(true);
      setQuizStep(0);
      setScores(INITIAL_SCORES);
      setRecommendedProduct(null);
      setLoadingResult(false);
      setMood('curious');
      setTimeout(() => setMood('idle'), 1000);
      return;
    }
    setIsOpen(false);
    resetQuiz();
    setLocation(href);
  };

  const handleOptionClick = (optionScores: Record<string, number>) => {
    // 累加分數
    setScores((prev) => {
      const updated = { ...prev };
      Object.entries(optionScores).forEach(([slug, score]) => {
        if (slug in updated) {
          updated[slug as keyof typeof INITIAL_SCORES] += score;
        }
      });
      return updated;
    });

    const nextStep = quizStep + 1;
    setMood('happy');
    setTimeout(() => setMood('idle'), 600);

    if (nextStep < MINI_QUIZ_QUESTIONS.length) {
      setQuizStep(nextStep);
    } else {
      // 測驗結束，展示能量感應 loading
      setLoadingResult(true);
      setMood('curious');
      
      setTimeout(() => {
        // 感應結束，計算分數最高的商品
        setLoadingResult(false);
        setMood('happy');
        
        let maxScore = -1;
        let bestSlug = 'glimmer-fox'; // default fallback
        
        setScores((currentScores) => {
          Object.entries(currentScores).forEach(([slug, score]) => {
            if (score > maxScore) {
              maxScore = score;
              bestSlug = slug;
            }
          });
          
          const matched = PRODUCTS.find((p) => p.slug === bestSlug) || PRODUCTS[0];
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
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)',
          pointerEvents: 'none',
        }}
      >
        {/* 卡片 */}
        <div
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
            transition: 'opacity 0.3s cubic-bezier(0.23,1,0.32,1), transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            pointerEvents: isOpen ? 'auto' : 'none',
            width: quizActive ? '252px' : '232px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            className="relative rounded-2xl rounded-br-sm border overflow-hidden"
            style={{
              background: 'rgba(250,247,244,0.96)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(209,190,155,0.3)',
              boxShadow: '0 4px 24px rgba(209,190,155,0.2)',
              transition: 'width 0.3s ease',
            }}
          >
            {/* 頂部 */}
            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-0.5">
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#A38D6B' }}
              >
                {quizActive ? '✦ Mochi 心理測驗' : '✦ Mochi'}
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
                    style={{ fontFamily: 'Noto Serif TC, serif' }}
                  >
                    Mochi 正在為你<br />感應空間的水晶能量氣場… 🐾<br />
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
                    <img 
                      src={recommendedProduct.img} 
                      alt={recommendedProduct.name} 
                      className="w-11 h-11 object-cover rounded-lg border border-[#D1BE9B]/15 flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[12px] font-medium tracking-[0.1em] text-[#31353A] truncate animate-fade-in" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        {recommendedProduct.name}
                      </h5>
                      <p className="text-[9px] text-[#D1BE9B] tracking-[0.1em] mt-0.5 truncate">
                        {recommendedProduct.material} · ✦
                      </p>
                      <p className="text-[11px] font-semibold text-[#8A7250] mt-1">
                        NT$ {recommendedProduct.price}
                      </p>
                    </div>
                  </div>

                  <p
                    className="text-[11px] leading-[1.8] text-[#31353A]/76 tracking-wider mb-4 px-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {BLESSINGS[recommendedProduct.slug] || '每一份相遇的能量，都是宇宙最美好的安排。✦'}
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="w-full text-[10.5px] font-medium tracking-[0.2em] py-2 rounded-full bg-[#3D4144] hover:bg-[#D1BE9B] text-[#FAF7F4] hover:text-[#31353A] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm text-center"
                      style={{ fontFamily: 'Noto Serif TC, serif' }}
                    >
                      立即諮詢購買 ♡
                    </button>
                    <button
                      onClick={() => goTo(`/shop/${recommendedProduct.slug}`)}
                      className="w-full text-[10.5px] tracking-[0.2em] py-2 rounded-full border border-[#D1BE9B]/40 text-[#A38D6B] hover:bg-[#D1BE9B]/10 transition-all duration-300 active:scale-95 cursor-pointer text-center"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      了解療癒詳情 →
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="w-full text-[9px] tracking-[0.25em] py-1 text-[#31353A]/40 hover:text-[#31353A]/72 transition-colors cursor-pointer text-center mt-1.5 border-none bg-transparent"
                      style={{ fontFamily: 'Noto Serif TC, serif' }}
                    >
                      重新測驗 🐾
                    </button>
                  </div>
                </div>
              ) : (
                // 題目畫面
                <div className="px-3.5 pt-1.5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-[#D1BE9B] tracking-[0.15em]" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                      Question {quizStep + 1} of 3
                    </span>
                    <span className="text-[10px] text-[#A38D6B] tracking-[0.2em]">✦ {quizStep + 1} / 3 ✦</span>
                  </div>
                  <p
                    className="text-[11.5px] leading-[1.8] text-[#31353A]/90 font-medium tracking-wider mb-3.5"
                    style={{ fontFamily: 'Noto Serif TC, serif' }}
                  >
                    {MINI_QUIZ_QUESTIONS[quizStep].question}
                  </p>
                  <div className="flex flex-col gap-2">
                    {MINI_QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt.scores)}
                        className="w-full text-left text-[11px] leading-[1.7] tracking-wider px-3 py-2 rounded-xl border border-[#D1BE9B]/30 hover:border-[#A38D6B] hover:bg-[#D1BE9B]/10 text-[#31353A]/80 hover:text-[#31353A] transition-all duration-200 active:scale-[0.98] cursor-pointer bg-white/40"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
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
                  style={{ cursor: 'pointer' }}
                >
                  <p
                    className="text-[11.5px] leading-[1.9] text-[#31353A]/85 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {pearl.text}
                  </p>
                </div>

                {/* CTA(只在那則有附連結時顯示) */}
                {pearl.cta && (
                  <div className="px-3.5 pb-2.5">
                    <button
                      onClick={(e) => goTo(pearl.cta!.href, e)}
                      className="w-full text-[11px] tracking-[0.2em] py-1.5 rounded-full border border-[#D1BE9B]/50 text-[#A38D6B] hover:bg-[#D1BE9B]/15 hover:text-[#8A7250] transition-colors cursor-pointer"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {pearl.cta.label}
                    </button>
                  </div>
                )}

                {/* 自動輪播提示 */}
                <div className="px-3.5 pb-2.5">
                  <p
                    className="text-[9px] text-[#D1BE9B]/70 tracking-wider text-center"
                    style={{ fontFamily: 'Noto Serif TC, serif' }}
                  >
                    ✦ 每幾秒自動換一則(也可以點卡片換)
                  </p>
                </div>
              </>
            )}

            {/* 泡泡尾巴 */}
            <div
              className="absolute -bottom-2 right-4 w-3 h-3"
              style={{
                background: 'rgba(250,247,244,0.96)',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                border: '1px solid rgba(209,190,155,0.3)',
              }}
            />
          </div>
        </div>

        {/* 貓咪本體 */}
        <div
          className="relative"
          style={{ width: '64px', height: '80px', pointerEvents: 'auto', position: 'relative', zIndex: 2 }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(209,190,155,0.15) 0%, transparent 70%)',
              transform: 'scale(1.4)',
              pointerEvents: 'none',
            }}
          />
          <CompanionCatSVG mood={mood} onClick={handleCatClick} />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span
              className="text-[10px] tracking-[0.15em]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, color: '#918888', fontSize: '10px' }}
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
