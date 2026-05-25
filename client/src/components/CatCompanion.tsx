/**
 * CatCompanion.tsx
 * 全站浮動貓咪助理 Mochi — 右下角固定
 * - 點擊貓咪：展開對話面板
 * - 預設模式：顯示情境療癒語句（點擊換句）
 * - AI 對話模式：使用者輸入訊息，Mochi 以 AI 回應
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

// ─── 各頁面情境語句 ──────────────────────────────────────────────────────────
const PAGE_MESSAGES: Record<string, string[]> = {
  '/': [
    '喵～ 歡迎來到療癒聖所 ✦',
    '今天的你，有什麼煩惱嗎？',
    '讓星光指引你前行的方向 ☽',
    '水晶在等待與你共振的那個人 ✦',
    '有什麼心事，說給我聽吧 ♡',
  ],
  '/tarot': [
    '洗牌前，先讓心靜下來 ✦',
    '每一張牌都是宇宙給你的訊息 ☽',
    '相信你的直覺，它從不說謊 ♡',
    '喵～ 我也想知道你抽到什麼牌！',
    '牌面只是鏡子，真相在你心中 ✦',
  ],
  '/ziwei': [
    '星盤記錄了你靈魂的旅程 ☽',
    '命盤是地圖，但你才是旅人 ✦',
    '喵～ 讓我們一起看看你的星圖吧',
    '每個宮位都藏著一段故事 ♡',
    '紫微星在守護著你呢 ✦',
  ],
  '/fortune': [
    '今天的宇宙能量正在向你傾訴 ☽',
    '喵～ 今天是個好日子！',
    '運勢只是參考，你的選擇才是關鍵 ✦',
    '讓今天的星光為你充電 ♡',
    '每一天都是全新的開始 ✦',
  ],
  '/treehole': [
    '有什麼想說的，跟 Mochi 說就好 ♡',
    '喵～ 說出來，心會輕一點的',
    '你的感受，都是真實且重要的 ✦',
    '不需要堅強，跟 Mochi 說說吧 ☽',
    'Mochi 會一直在這裡陪著你 ♡',
  ],
  '/shop': [
    '喵～ 這些水晶都是我精心挑選的！',
    '每顆水晶都有它想找的主人 ✦',
    '讓能量商品為你帶來好運 ☽',
    '水晶的振動頻率與你的心共鳴 ♡',
    '今天適合帶一顆新水晶回家 ✦',
  ],
  '/history': [
    '你的每一次占卜都是一段旅程 ✦',
    '喵～ 回顧過去，看見成長 ☽',
    '每一次探索都讓你更了解自己 ♡',
  ],
};

const DEFAULT_MESSAGES = [
  '喵～ 有什麼我能幫你的嗎？',
  '宇宙正在聆聽你的心聲 ✦',
  '你來了，太好了 ♡',
];

type CatMood = 'idle' | 'happy' | 'sleepy' | 'curious' | 'thinking';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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
    if (blink || mood === 'sleepy') {
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
    if (mood === 'curious' || mood === 'thinking') {
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
      {/* Body */}
      <ellipse cx="30" cy="55" rx="18" ry="20" stroke="#D1BE9B" strokeWidth="1.2" fill="rgba(209,190,155,0.06)" />
      {/* Head */}
      <circle cx="30" cy="25" r="16" stroke="#D1BE9B" strokeWidth="1.2" fill="rgba(209,190,155,0.08)" />
      {/* Ears */}
      <path d="M16 14 L12 4 L22 10 Z" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
      <path d="M44 14 L48 4 L38 10 Z" stroke="#D1BE9B" strokeWidth="1" fill="rgba(209,190,155,0.1)" />
      <path d="M17 13 L14 6 L21 11 Z" fill="rgba(209,190,155,0.2)" />
      <path d="M43 13 L46 6 L39 11 Z" fill="rgba(209,190,155,0.2)" />
      {/* Eyes */}
      {renderEyes()}
      {/* Nose */}
      <path d="M29 31 L30 33 L31 31 Q30 29.5 29 31 Z" fill="#D1BE9B" opacity="0.6" />
      {/* Mouth */}
      {mood === 'happy' ? (
        <path d="M26 35 Q30 39 34 35" stroke="#D1BE9B" strokeWidth="0.9" fill="none" />
      ) : (
        <path d="M27 35 Q30 37.5 33 35" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
      )}
      {/* Whiskers */}
      <line x1="8" y1="30" x2="22" y2="31" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="7" y1="33" x2="21" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="52" y1="30" x2="38" y2="31" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="53" y1="33" x2="39" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Collar */}
      <path d="M15 42 Q30 46 45 42" stroke="#D1BE9B" strokeWidth="0.7" fill="none" />
      <path d="M28 44 L30 47 L32 44" stroke="#D1BE9B" strokeWidth="0.6" strokeLinejoin="round" />
      {/* Animated tail */}
      <path
        d="M46 68 Q58 60 54 48 Q50 38 46 46"
        stroke="#D1BE9B" strokeWidth="1.3" fill="none"
        style={{
          transform: tailSway ? 'rotate(14deg)' : 'rotate(-10deg)',
          transformOrigin: '46px 68px',
          transition: 'transform 1.2s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      {/* Paws */}
      <ellipse cx="21" cy="71" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="39" cy="71" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}

// ─── 主元件 ──────────────────────────────────────────────────────────────────
export default function CatCompanion() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState<CatMood>('idle');
  const [messageIdx, setMessageIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  // AI 對話模式
  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mochiChat = trpc.mochi.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setMood('happy');
      setTimeout(() => setMood('idle'), 2000);
    },
    onError: () => {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: '喵～ Mochi 剛才走神了，可以再說一次嗎？♡',
      }]);
      setMood('idle');
    },
  });

  const getMessages = useCallback(() => {
    return PAGE_MESSAGES[location] ?? DEFAULT_MESSAGES;
  }, [location]);

  // 頁面切換時更換語句並打招呼
  useEffect(() => {
    const msgs = getMessages();
    setMessageIdx(0);
    setMessage(msgs[0]);
    setMood('curious');
    setHasGreeted(false);
    setChatMode(false);
    setChatHistory([]);

    const t = setTimeout(() => {
      if (!hasGreeted) {
        setIsOpen(true);
        setHasGreeted(true);
        const t2 = setTimeout(() => setIsOpen(false), 3500);
        return () => clearTimeout(t2);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // 元件掛載時淡入
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  // 對話更新時滾到底部
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, mochiChat.isPending]);

  const handleCatClick = () => {
    const msgs = getMessages();
    if (!isOpen) {
      // 首次點擊：直接進入對話模式
      const nextIdx = (messageIdx + 1) % msgs.length;
      setMessageIdx(nextIdx);
      setMessage(msgs[nextIdx]);
      setMood('happy');
      setTimeout(() => setMood('idle'), 2000);
      setChatMode(true);
    } else {
      // 已開啟時再次點擊：關閉
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  };

  const handleBubbleClick = () => {
    if (chatMode) return;
    const msgs = getMessages();
    const nextIdx = (messageIdx + 1) % msgs.length;
    setMessageIdx(nextIdx);
    setMessage(msgs[nextIdx]);
    setMood('happy');
    setTimeout(() => setMood('idle'), 1500);
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || mochiChat.isPending) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);
    setInputText('');
    setMood('thinking');

    mochiChat.mutate({
      message: text,
      history: chatHistory.slice(-8),
      currentPage: location,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const enterChatMode = () => {
    setChatMode(true);
    if (chatHistory.length === 0) {
      const greetings: Record<string, string> = {
        '/treehole': '喵～ 有什麼想說的嗎？我在這裡陪你 ♡',
        '/tarot': '喵～ 對今天的牌陣有什麼感受嗎？',
        '/ziwei': '喵～ 看完命盤有什麼想聊的嗎？',
        '/shop': '喵～ 有沒有特別吸引你的水晶呢？',
      };
      const greeting = greetings[location] ?? '喵～ 有什麼想跟 Mochi 說的嗎？ ♡';
      setChatHistory([{ role: 'assistant', content: greeting }]);
    }
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
      {/* 對話面板 */}
      <div
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
          transition: 'opacity 0.3s cubic-bezier(0.23,1,0.32,1), transform 0.3s cubic-bezier(0.23,1,0.32,1)',
          pointerEvents: isOpen ? 'auto' : 'none',
          width: chatMode ? '260px' : '200px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="relative rounded-2xl rounded-br-sm border"
          style={{
            background: 'rgba(250,247,244,0.95)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(209,190,155,0.3)',
            boxShadow: '0 4px 24px rgba(209,190,155,0.2)',
          }}
        >
          {/* 頂部標題列（AI 模式才顯示） */}
          {chatMode && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#D1BE9B]/15">
              <span
                className="text-[11px] tracking-[0.15em] text-[#D1BE9B]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300, color: '#888072', fontSize: '11px' }}
              >
                遇到什麼煩惱嗎？跟 Mochi 說說 ♡
              </span>
              <button
                onClick={() => { setChatMode(false); setChatHistory([]); }}
                className="text-[11px] text-[#31353A]/46 hover:text-[#31353A]/72 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* 內容區域 */}
          {!chatMode ? (
            /* 預設模式：情境語句 + 直接輸入框 */
            <div>
              <div className="px-4 pt-3 pb-2" onClick={handleBubbleClick} style={{ cursor: 'pointer' }}>
                <p
                  className="text-[12px] leading-[1.8] text-[#31353A]/80 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {message}
                </p>
                <p
                  className="text-[11px] text-[#D1BE9B]/60 tracking-wider mt-1"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}
                >
                  點擊換一句 ✦
                </p>
              </div>
              {/* 快速輸入框 */}
              <div className="px-3 pb-3 border-t border-[#D1BE9B]/10 pt-2">
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        enterChatMode();
                        setTimeout(() => handleSendMessage(), 50);
                      }
                    }}
                    onFocus={() => enterChatMode()}
                    placeholder="說給 Mochi 聽 ♡"
                    className="flex-1 text-[11px] bg-transparent border-b border-[#D1BE9B]/30 focus:border-[#D1BE9B]/60 outline-none py-1 text-[#31353A]/80 placeholder-[#D1BE9B]/40 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <button
                    onClick={() => { enterChatMode(); setTimeout(() => handleSendMessage(), 50); }}
                    disabled={!inputText.trim()}
                    className="text-[11px] text-[#D1BE9B]/60 hover:text-[#D1BE9B] disabled:opacity-30 transition-colors"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AI 對話模式 */
            <div>
              {/* 對話歷史 */}
              <div
                className="px-3 py-2 space-y-2 overflow-y-auto"
                style={{ maxHeight: '200px' }}
              >
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-[1.7] tracking-wider ${
                        msg.role === 'user'
                          ? 'bg-[#D1BE9B]/20 text-[#31353A]/82 rounded-tr-sm'
                          : 'bg-white/60 text-[#31353A]/80 rounded-tl-sm border border-[#D1BE9B]/15'
                      }`}
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {mochiChat.isPending && (
                  <div className="flex justify-start">
                    <div
                      className="px-3 py-2 rounded-xl rounded-tl-sm bg-white/60 border border-[#D1BE9B]/15 text-[11px] text-[#D1BE9B]/60"
                      style={{ fontFamily: 'Noto Serif TC, serif' }}
                    >
                      <span className="inline-flex gap-0.5">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 輸入框 */}
              <div className="px-3 pb-3 pt-1 flex gap-2 border-t border-[#D1BE9B]/10">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="說點什麼…"
                  disabled={mochiChat.isPending}
                  className="flex-1 bg-white/50 border border-[#D1BE9B]/20 rounded-full px-3 py-1.5 text-[11px] text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/40 placeholder:text-[#31353A]/42 disabled:opacity-50"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || mochiChat.isPending}
                  className="w-7 h-7 rounded-full bg-[#D1BE9B]/30 hover:bg-[#D1BE9B]/50 disabled:opacity-30 transition-colors flex items-center justify-center flex-shrink-0"
                  style={{ fontSize: '12px' }}
                >
                  ↑
                </button>
              </div>
            </div>
          )}

          {/* 泡泡尾巴 */}
          <div
            className="absolute -bottom-2 right-4 w-3 h-3"
            style={{
              background: 'rgba(250,247,244,0.95)',
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
            點擊跟Mochi對話
          </span>
        </div>
      </div>
    </div>
  );
}
