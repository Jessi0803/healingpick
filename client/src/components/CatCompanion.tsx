/**
 * CatCompanion.tsx
 * 全站浮動貓咪助理 Mochi — 右下角固定
 * 點擊貓咪 → 顯示一則內容:
 *   - 療癒語錄(無連結),或
 *   - 塔羅 / 紫微小知識(配一個對應的「去算算看」連結)
 * 點一下卡片可以換下一則。
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';

type Pearl = {
  text: string;
  cta?: { label: string; href: string };
};

// ─── 卡片內容池 ──────────────────────────────────────────────────────────────
const PEARLS: Pearl[] = [
  // 純療癒語錄(不配連結)
  { text: '每一個感受都值得被聽見 ✦' },
  { text: '你不需要完美,只需要真實 ♡' },
  { text: '深呼吸三秒,當下就會溫柔一點 ☽' },
  { text: '宇宙的節奏,跟你的呼吸是一樣的 ✦' },
  { text: '你已經比昨天的自己更勇敢一點了 ♡' },
  { text: '慢下來,光才照得進來 ☽' },
  { text: '不必急著好起來,也不必假裝沒事 ♡' },

  // 塔羅小知識(配連結到 /tarot)
  {
    text: '塔羅 22 張大牌,是「愚者的旅程」—— 從天真的出發,一路走到圓滿。',
    cta: { label: '抽一張看看 →', href: '/tarot' },
  },
  {
    text: '逆位不等於壞事,只是同一張牌「另一面」的能量提醒。',
    cta: { label: '去試塔羅 →', href: '/tarot' },
  },
  {
    text: '塔羅不是預言,是一面照出你內心真實樣子的鏡子。',
    cta: { label: '照照看 →', href: '/tarot' },
  },
  {
    text: '抽牌時心裡想著問題,你的直覺會引導你選到「最該看見」的那張。',
    cta: { label: '現在來抽 →', href: '/tarot' },
  },

  // 紫微小知識(配連結到 /ziwei)
  {
    text: '紫微斗數有 12 宮,每一宮對應你人生不同的領域:財帛、感情、事業、健康……',
    cta: { label: '看看你的命盤 →', href: '/ziwei' },
  },
  {
    text: '命宮不是「決定你是誰」,而是「你會用什麼方式去面對人生」。',
    cta: { label: '排盤試試 →', href: '/ziwei' },
  },
  {
    text: '紫微星是星盤裡的「主帥」,看你天生帶著什麼樣的氣場。',
    cta: { label: '查你的紫微 →', href: '/ziwei' },
  },
  {
    text: '命盤是地圖,但你才是旅人 —— 怎麼走,還是你決定。',
    cta: { label: '看地圖 →', href: '/ziwei' },
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

  // 卡片打開時,每 8 秒自動切下一則
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, order.length]);

  const handleCatClick = () => {
    setIsOpen((o) => !o);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
  };

  // 點卡片 → 下一則(走完一輪就重新洗牌)
  const handleBubbleClick = () => {
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

  const goTo = (href: string) => {
    setIsOpen(false);
    setLocation(href);
  };

  return (
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
          width: '260px',
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
          }}
        >
          {/* 頂部 */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span
              className="text-[11px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#A38D6B' }}
            >
              ✦ Mochi
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[12px] text-[#31353A]/40 hover:text-[#31353A]/72 transition-colors"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>

          {/* 內容 */}
          <div
            className="px-4 pt-2 pb-3"
            onClick={handleBubbleClick}
            style={{ cursor: 'pointer' }}
          >
            <p
              className="text-[13px] leading-[2] text-[#31353A]/85 tracking-wider"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              {pearl.text}
            </p>
          </div>

          {/* CTA(只在那則有附連結時顯示) */}
          {pearl.cta && (
            <div className="px-4 pb-3">
              <button
                onClick={() => goTo(pearl.cta!.href)}
                className="w-full text-[12px] tracking-[0.2em] py-2 rounded-full border border-[#D1BE9B]/50 text-[#A38D6B] hover:bg-[#D1BE9B]/15 hover:text-[#8A7250] transition-colors"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                {pearl.cta.label}
              </button>
            </div>
          )}

          {/* 自動輪播提示 */}
          <div className="px-4 pb-3">
            <p
              className="text-[10px] text-[#D1BE9B]/70 tracking-wider text-center"
              style={{ fontFamily: 'Noto Serif TC, serif' }}
            >
              ✦ 每幾秒自動換一則(也可以點卡片換)
            </p>
          </div>

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
  );
}
