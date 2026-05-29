/**
 * CatCompanion.tsx
 * 全站浮動貓咪助理 Mochi — 右下角固定
 * 點擊貓咪 → 顯示「今日語錄」+ 各個算命服務的捷徑
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

// ─── 各頁面情境語錄 ──────────────────────────────────────────────────────────
const PAGE_MESSAGES: Record<string, string[]> = {
  '/': [
    '歡迎來到療癒聖所 ✦',
    '今天的你,有什麼煩惱嗎?',
    '讓星光指引你前行的方向 ☽',
    '水晶在等待與你共振的那個人 ✦',
    '有什麼心事,輕輕放下來就好 ♡',
  ],
  '/tarot': [
    '洗牌前,先讓心靜下來 ✦',
    '每一張牌都是宇宙給你的訊息 ☽',
    '相信你的直覺,它從不說謊 ♡',
    '牌面只是鏡子,真相在你心中 ✦',
  ],
  '/ziwei': [
    '星盤記錄了你靈魂的旅程 ☽',
    '命盤是地圖,但你才是旅人 ✦',
    '每個宮位都藏著一段故事 ♡',
    '紫微星在守護著你呢 ✦',
  ],
  '/fortune': [
    '今天的宇宙能量正在向你傾訴 ☽',
    '運勢只是參考,你的選擇才是關鍵 ✦',
    '讓今天的星光為你充電 ♡',
    '每一天都是全新的開始 ✦',
  ],
  '/treehole': [
    '說出來,心會輕一點的 ♡',
    '你的感受,都是真實且重要的 ✦',
    '不需要堅強,放心說吧 ☽',
    'Mochi 會一直在這裡陪著你 ♡',
  ],
  '/shop': [
    '每顆水晶都有它想找的主人 ✦',
    '讓能量商品為你帶來好運 ☽',
    '水晶的振動頻率與你的心共鳴 ♡',
    '今天適合帶一顆新水晶回家 ✦',
  ],
  '/history': [
    '你的每一次占卜都是一段旅程 ✦',
    '回顧過去,看見成長 ☽',
    '每一次探索都讓你更了解自己 ♡',
  ],
};

const DEFAULT_MESSAGES = [
  '宇宙正在聆聽你的心聲 ✦',
  '你來了,太好了 ♡',
  '一切都會慢慢變好的 ☽',
];

// ─── 服務捷徑(會顯示在語錄下方的小按鈕) ────────────────────────────────────
const SERVICE_LINKS: { label: string; href: string; emoji: string; desc: string }[] = [
  { label: '塔羅占卜', href: '/tarot', emoji: '🃏', desc: '抽 5 張牌,看看現在的能量流向' },
  { label: '紫微斗數', href: '/ziwei', emoji: '✦', desc: '一張命盤,讀你這一生的格局' },
  { label: '每日運勢', href: '/fortune/daily', emoji: '☽', desc: '今天的星象 + 月相給你的建議' },
  { label: '心靈樹洞', href: '/treehole', emoji: '♡', desc: '說說心事,Mochi 在這裡聽' },
];

type CatMood = 'idle' | 'happy' | 'curious';

// ─── 貓咪 SVG ─────────────────────────────────────────────────────────────────
function CompanionCatSVG({ mood, onClick }: { mood: CatMood; onClick: () => void }) {
  const [tailSway, setTailSway] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTailSway(p => !p), 1400);
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

// ─── 主元件 ──────────────────────────────────────────────────────────────────
export default function CatCompanion() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState<CatMood>('idle');
  const [messageIdx, setMessageIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const getMessages = useCallback(() => {
    return PAGE_MESSAGES[location] ?? DEFAULT_MESSAGES;
  }, [location]);

  // 頁面切換時更換語錄
  useEffect(() => {
    const msgs = getMessages();
    setMessageIdx(0);
    setMessage(msgs[0]);
    setMood('curious');
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // 元件掛載時淡入
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleCatClick = () => {
    setIsOpen(o => !o);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1800);
  };

  // 點面板裡的語錄可以換下一句
  const handleBubbleClick = () => {
    const msgs = getMessages();
    const nextIdx = (messageIdx + 1) % msgs.length;
    setMessageIdx(nextIdx);
    setMessage(msgs[nextIdx]);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
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
      {/* 面板 */}
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
          {/* 頂部標題列 */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span
              className="text-[11px] tracking-[0.25em] uppercase"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#A38D6B' }}
            >
              Today
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[12px] text-[#31353A]/40 hover:text-[#31353A]/72 transition-colors"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>

          {/* 今日語錄 */}
          <div className="px-4 pb-3" onClick={handleBubbleClick} style={{ cursor: 'pointer' }}>
            <p
              className="text-[13px] leading-[1.95] text-[#31353A]/82 tracking-wider"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              {message}
            </p>
            <p
              className="text-[10px] text-[#D1BE9B]/70 tracking-wider mt-1.5"
              style={{ fontFamily: 'Noto Serif TC, serif' }}
            >
              點一下換下一句 ✦
            </p>
          </div>

          {/* 分隔線 */}
          <div className="mx-4 h-px bg-[#D1BE9B]/20" />

          {/* 服務捷徑 */}
          <div className="px-3 py-3">
            <p
              className="px-1 mb-2 text-[10px] tracking-[0.2em] text-[#A38D6B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              想算什麼?
            </p>
            <div className="flex flex-col gap-1">
              {SERVICE_LINKS.map((s) => (
                <button
                  key={s.href}
                  onClick={() => goTo(s.href)}
                  className="group flex items-start gap-2.5 text-left px-2 py-2 rounded-lg hover:bg-[#D1BE9B]/12 transition-colors"
                >
                  <span className="text-[14px] mt-0.5 flex-shrink-0">{s.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span
                      className="block text-[12px] tracking-[0.12em] text-[#31353A]/85 group-hover:text-[#A38D6B] transition-colors"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="block text-[10px] leading-[1.6] text-[#31353A]/50 tracking-wider mt-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {s.desc}
                    </span>
                  </span>
                  <span className="text-[#D1BE9B]/60 group-hover:text-[#A38D6B] transition-colors text-[11px] mt-1 flex-shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
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
            className="text-[10px] tracking-[0.15em] text-[#D1BE9B]/60"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, color: '#918888', fontSize: '10px' }}
          >
            點擊看今日語錄
          </span>
        </div>
      </div>
    </div>
  );
}
