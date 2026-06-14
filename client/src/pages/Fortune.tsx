/**
 * SOUL EASE | Mochi．crystal — Fortune Page (Daily)
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - 12 zodiac signs + AI fortune with moon phase
 *   - Crystal of the day recommendation
 *   - Lucky colors, numbers, directions
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Streamdown } from 'streamdown';
import PageLayout from '@/components/PageLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CatListening } from '@/components/CatElements';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { recommendForFortune } from '@/data/recommend';
import { getContextualRecommendationReason, getProductImageStyle, type Product } from '@/data/products';
import { useRotatingText } from '@/hooks/useRotatingText';

const REPEAT_READING_LOGIN_PROMPT = {
  title: '登入會員，獲得更準確的個人解析',
  subtitle: '加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。',
};

// ─── Zodiac Signs ─────────────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
  { id: 'aries',       name: '牡羊座', en: 'Aries',       symbol: '♈', dates: '3/21–4/19',  element: '火', color: '#C09898' },
  { id: 'taurus',      name: '金牛座', en: 'Taurus',      symbol: '♉', dates: '4/20–5/20',  element: '土', color: '#A0B898' },
  { id: 'gemini',      name: '雙子座', en: 'Gemini',      symbol: '♊', dates: '5/21–6/20',  element: '風', color: '#A8C0C8' },
  { id: 'cancer',      name: '巨蟹座', en: 'Cancer',      symbol: '♋', dates: '6/21–7/22',  element: '水', color: '#B8B0C8' },
  { id: 'leo',         name: '獅子座', en: 'Leo',         symbol: '♌', dates: '7/23–8/22',  element: '火', color: '#DEC180' },
  { id: 'virgo',       name: '處女座', en: 'Virgo',       symbol: '♍', dates: '8/23–9/22',  element: '土', color: '#A8C0A8' },
  { id: 'libra',       name: '天秤座', en: 'Libra',       symbol: '♎', dates: '9/23–10/22', element: '風', color: '#D0A8B8' },
  { id: 'scorpio',     name: '天蠍座', en: 'Scorpio',     symbol: '♏', dates: '10/23–11/21',element: '水', color: '#9898C0' },
  { id: 'sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐', dates: '11/22–12/21',element: '火', color: '#C0A880' },
  { id: 'capricorn',   name: '摩羯座', en: 'Capricorn',   symbol: '♑', dates: '12/22–1/19', element: '土', color: '#A0A8A0' },
  { id: 'aquarius',    name: '水瓶座', en: 'Aquarius',    symbol: '♒', dates: '1/20–2/18',  element: '風', color: '#98B8C8' },
  { id: 'pisces',      name: '雙魚座', en: 'Pisces',      symbol: '♓', dates: '2/19–3/20',  element: '水', color: '#B8A8C8' },
];

const FORTUNE_WAITING_MESSAGES = [
  '正在看看今天的整體節奏...',
  'Mochi 正在整理今天適合留意的地方...',
  '正在把感情、工作和狀態分開看看...',
  '快好了，正在準備今天的小提醒...',
  '正在找出今天最適合你的行動建議...',
];

const ELEMENT_RECOMMENDATION_MESSAGES: Record<string, string> = {
  火: '先把行動力收回自己手上。',
  土: '先穩住生活節奏，再慢慢推進。',
  風: '先釐清想法，再開口溝通。',
  水: '先照顧情緒，再做判斷。',
};

type FortuneRecommendationSource = {
  overallScore?: number;
  loveScore?: number;
  careerScore?: number;
  healthScore?: number;
};

const FORTUNE_ELEMENT_THEMES: Record<string, string> = {
  火: '行動節奏',
  土: '生活節奏',
  風: '想法和溝通',
  水: '情緒狀態',
};

function getFortuneRecommendationMessage(
  element: string,
  fortune?: FortuneRecommendationSource | null
) {
  if (fortune) {
    const focusAreas = [
      { label: '整體節奏', score: fortune.overallScore },
      { label: '感情互動', score: fortune.loveScore },
      { label: '工作財務', score: fortune.careerScore },
      { label: '身體狀態', score: fortune.healthScore },
    ].filter((item): item is { label: string; score: number } => typeof item.score === 'number');

    const focus = focusAreas.sort((a, b) => a.score - b.score)[0];
    if (focus) {
      const theme = FORTUNE_ELEMENT_THEMES[element] ?? '今天的節奏';
      const action = focus.score >= 8 ? '順著好的狀態往前推進' : `先把${theme}調穩`;
      return `今天重點在${focus.label}，${action}`;
    }
  }

  return ELEMENT_RECOMMENDATION_MESSAGES[element] ?? '先穩住自己，再做決定。';
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  context,
  role = 'primary',
}: {
  product: Product;
  context?: string;
  role?: 'primary' | 'secondary';
}) {
  const meanings = product.meanings.slice(0, 3).map((m) => m.title);
  const recommendationReason = getContextualRecommendationReason(product, context, role);
  const roleLabel = role === 'primary' ? '最呼應此刻' : '想加強也可看';
  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-[#D1BE9B]/25 bg-white/40 hover:border-[#D1BE9B]/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
        <div className="w-full h-52 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0EBE3]/40">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" style={getProductImageStyle(product)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              {product.tag && (
                <span className="text-[10px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-[#D1BE9B]/20 text-[#A38D6B] mr-1.5"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {product.tag}
                </span>
              )}
              <span className="text-[10px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-white/70 text-[#6F5A3A] border border-[#D1BE9B]/20"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {roleLabel}
              </span>
              <p className="text-[12px] tracking-[0.12em] text-[#31353A]/86 mt-0.5 truncate"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.name}
              </p>
              <p className="text-[11px] text-[#31353A]/50 tracking-wider italic truncate"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {product.subtitle}
              </p>
            </div>
            <p className="text-sm font-light text-[#D1BE9B] flex-shrink-0"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              NT$ {product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {meanings.map((m) => (
              <span key={m} className="text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#F0EBE3]/70 text-[#31353A]/62 border border-[#D1BE9B]/15"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                {m}
              </span>
            ))}
          </div>
          <div className="mb-2 rounded-xl border border-[#D1BE9B]/15 bg-[#F8F4EC]/45 px-3 py-2">
            <p className="text-[10px] tracking-[0.18em] text-[#A38D6B] mb-1"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              為什麼 Mochi 想到它
            </p>
            <div className="text-[11px] leading-relaxed tracking-[0.08em] text-[#31353A]/62 prose prose-sm max-w-none prose-strong:text-[#31353A]/86 prose-strong:font-semibold [&_p]:!my-0 [&_p]:!text-[11px] [&_p]:!leading-relaxed"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              <Streamdown>{recommendationReason}</Streamdown>
            </div>
          </div>
          <span className="text-[11px] tracking-[0.15em] text-[#A38D6B]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            看看這款商品 →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── How It Works Panel ─────────────────────────────────────────────────────
function HowItWorksPanel() {
  const insights = [
    {
      icon: '✦',
      label: '收到溫柔提醒',
      desc: '感情、工作、健康與心情，都會有一段給今天的你剛剛好的提醒。',
    },
    {
      icon: '◈',
      label: '帶走幸運線索',
      desc: '幸運色、幸運數字與能量水晶，讓你用一個小小儀式開啟今天。',
    },
  ];

  return (
    <div className="mb-8 px-5 py-4 rounded-2xl border border-[#D1BE9B]/15 bg-[#D1BE9B]/5">
      <p className="text-[11px] tracking-[0.3em] text-[#8A7250] mb-3 text-center"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
        ◎ 今日運勢會告訴你什麼
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-start">
        {insights.map((item, i) => (
          <div key={item.label} className="flex sm:flex-col sm:flex-1 items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
            {i > 0 && (
              <div className="hidden sm:flex items-center justify-center w-8 mt-4 flex-shrink-0">
                <div className="h-px w-full bg-[#D1BE9B]/25" />
              </div>
            )}
            <div className="flex sm:flex-col sm:items-center gap-3 sm:gap-2 flex-1">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#D1BE9B]/12 flex items-center justify-center text-base">
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.2em] text-[#8A7250] mb-0.5"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                  {item.label}
                </p>
                {item.desc && (
                  <p className="text-[12px] leading-[1.7] text-[#31353A]/62 tracking-wide"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {item.desc}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FortuneClassroomEnvelope() {
  return (
    <div className="absolute right-4 md:right-12 top-[calc(50%+0.5rem)] -translate-y-1/2 animate-float-envelope">
      <Dialog>
        <DialogTrigger asChild>
          <button className="relative flex flex-col items-center justify-center group bg-transparent focus:outline-none border-none hover:scale-105 active:scale-[0.92] transition-transform duration-150 ease-out">
            <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#FDFBF7] to-[#F0E8DC] border border-[#D1BE9B]/60 shadow-[0_4px_16px_rgba(209,190,155,0.25)] hover:shadow-[0_8px_24px_rgba(163,141,107,0.35)] transition-shadow duration-500 overflow-visible">
              <div className="absolute inset-0 rounded-full border border-[#D1BE9B]/50 animate-envelope-ping pointer-events-none" />
              <div className="absolute inset-0.5 md:inset-1 rounded-full border border-[#D1BE9B]/40 border-dashed animate-[spin_30s_linear_infinite] pointer-events-none" />
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
                <div className="absolute top-0 left-0 h-full w-1/2 animate-wax-glint"
                  style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)' }} />
              </div>
              <div className="relative z-10 flex items-center justify-center text-[#A38D6B] group-hover:text-[#8A7250] transition-colors drop-shadow-sm scale-75 md:scale-90">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12" cy="13.2" r="3" fill="#D1BE9B" className="group-hover:fill-[#C9A86A] transition-colors" />
                  <path d="M11 13.2H13M12 12.2V14.2" stroke="#FDFBF7" strokeWidth="0.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="absolute top-[110%] bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#D1BE9B]/20 text-[#8A7250] text-[9px] md:text-[10px] tracking-[0.1em] px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              運勢小教室
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#FDFBF7] border-[#D1BE9B]/30" style={{ fontFamily: 'Noto Serif TC, serif' }}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg tracking-[0.2em] font-extralight text-[#31353A] mb-2 mt-2">
              ✦ Mochi 的每日運勢小秘密 ✦
            </DialogTitle>
          </DialogHeader>
          <div className="text-[13px] text-[#31353A]/80 leading-[2.2] tracking-wider space-y-6 mt-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
            <p>
              你可以把每日運勢想成一份<strong className="font-medium text-[#A38D6B]">「今天的能量天氣預報」</strong>。<br/><br/>
              天氣預報不會替你決定要不要出門，但它會提醒你：「今天可能會下雨，記得帶傘。」每日運勢也是這樣，不是要替你安排命運，而是幫你先看見今天比較順的節奏。
            </p>

            <div>
              <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>🌙 第一步：先看今天的月相</h4>
              <p>
                Mochi 會先用今天的日期計算月亮走到哪個階段。新月、滿月、上弦月、下弦月的感覺都不一樣：有些日子適合開始，有些日子適合整理，有些日子則比較適合放下。<br/><br/>
                所以運勢不是每天亂寫一句好聽的話，而是先看今天整體環境的能量底色。
              </p>
            </div>

            <div>
              <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>♈ 第二步：再放進你的星座特性</h4>
              <p>
                同一個滿月，牡羊座和雙魚座感受到的重點不會完全一樣。牡羊可能會被提醒「別急著衝」，雙魚可能會被提醒「先照顧情緒」。<br/><br/>
                因為每個星座都有自己的元素、性格節奏、優勢和容易卡住的地方，Mochi 會把這些放進解讀裡，讓提醒比較像是寫給你，而不是寫給所有人。
              </p>
            </div>

            <div>
              <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>☀️ 第三步：翻譯成今天能用的提醒</h4>
              <p>
                最後，Mochi 會把「今日月相」和「你的星座特性」整理成幾個生活面向：整體狀態、感情、工作財運、健康與行動建議。<br/><br/>
                你不需要把它當成絕對答案。更像是早上出門前，有一隻懂你的貓咪輕輕提醒：「今天可以勇敢一點，但也別忘了留一點力氣給自己。」
              </p>
            </div>

            <div className="bg-[#D1BE9B]/10 p-5 rounded-2xl border border-[#D1BE9B]/20 text-[#31353A]/80 mt-8 shadow-sm">
              <div className="font-medium text-[#A38D6B] mb-2 flex items-center gap-2 text-[14px]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                <CatListening className="w-7 h-7" /> Mochi 的悄悄話：
              </div>
              <p className="text-[13px] leading-[2.2] tracking-wider italic" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                「今天適合怎麼走，有時候先知道一點點，心裡就會穩很多。<br/>
                如果今天的提醒剛好說中你心裡某個地方，那就把它當成一盞小燈，陪你走過今天就好 🐾」
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Score Bar Component ──────────────────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.min(100, Math.max(0, score * 10)); // score 1-10 → 10-100%
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] tracking-[0.15em] text-[#31353A]/72 w-12 flex-shrink-0"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-[#D1BE9B]/15 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[11px] tracking-wider text-[#31353A]/62 w-6 text-right"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {score}
      </span>
    </div>
  );
}

// ─── Moon Phase Badge ─────────────────────────────────────────────────────────
function MoonPhaseBadge({ symbol, name }: { symbol: string; name: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1BE9B]/10 border border-[#D1BE9B]/20">
      <span className="text-base leading-none">{symbol}</span>
      <span className="text-[11px] tracking-[0.2em] text-[#D1BE9B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
        {name}
      </span>
    </div>
  );
}

export default function FortunePage() {
  const { isAuthenticated, login } = useAuth();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [hasClickedGenerate, setHasClickedGenerate] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [today] = useState(new Date());
  const savedFortuneRef = useRef<string>('');

  const creditsQuery = trpc.credits.state.useQuery();
  const credits = creditsQuery.data;

  function handleSignSelect(signId: string) {
    if (selectedSign === signId) {
      setSelectedSign(null);
      setHasClickedGenerate(false);
      setUnlockDialogOpen(false);
      return;
    }
    setSelectedSign(signId);
    setHasClickedGenerate(false);
    setUnlockDialogOpen(true);
  }

  const selectedSignData = ZODIAC_SIGNS.find(s => s.id === selectedSign);

  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const apiDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const saveReadingMutation = trpc.history.saveReading.useMutation();

  // ── AI 每日運勢查詢（含月相 + 星座特性）──────────────────────────────
  const dailyFortuneQuery = trpc.fortune.daily.useQuery(
    {
      sign: selectedSign || '',
      signName: selectedSignData?.name || '',
      date: apiDateStr,
    },
    {
      enabled: !!selectedSign && hasClickedGenerate,
      staleTime: 1000 * 60 * 60 * 6, // 6 小時快取，同一天同一星座只呼叫一次
      retry: 1,
    }
  );

  // 儲存每日運勢紀錄（僅登入後，且同一星座同一天只儲一次）
  useEffect(() => {
    if (!dailyFortuneQuery.data) return;
    const key = `${selectedSign}-${apiDateStr}`;
    if (savedFortuneRef.current === key) return;
    savedFortuneRef.current = key;
    const d = dailyFortuneQuery.data;
    saveReadingMutation.mutate({
      type: 'fortune',
      inputData: JSON.stringify({ sign: selectedSign, signName: selectedSignData?.name, date: apiDateStr }),
      interpretation: [
        `整體運勢（${d.overallScore}/10）：${d.overall}`,
        `感情愛情（${d.loveScore}/10）：${d.love}`,
        `事業財運（${d.careerScore}/10）：${d.career}`,
        `健康提醒（${d.healthScore}/10）：${d.health}`,
        `幸運資訊：${d.luckyColor}｜${d.luckyNumber}｜${d.crystal}`,
        `水晶原因：${d.crystalReason}`,
        `月相：${d.moonSymbol} ${d.moonPhase}`,
        `行動建議：${d.advice}`,
      ].join('\n\n'),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyFortuneQuery.data]);

  const aiData = dailyFortuneQuery.data;
  const fortuneWaitingMessage = useRotatingText(FORTUNE_WAITING_MESSAGES, dailyFortuneQuery.isLoading);

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              Celestial Guidance
            </span>
            <div className="relative mt-3 mb-10 md:mb-8 flex justify-center items-center">
              <h1 className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] m-0"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                每日運勢
              </h1>
              <FortuneClassroomEnvelope />
            </div>
            <p className="text-xs text-[#31353A]/54 tracking-[0.2em]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              {dateStr}
            </p>
          </div>

          {/* How It Works */}
          <HowItWorksPanel />

          {/* ── DAILY ──────────────────────────────────────────────────────── */}
          <div>
              {/* AI 今日水晶推薦（有 AI 資料時顯示 AI 推薦，否則顯示預設） */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#D1BE9B]/15 flex items-center justify-center">
                  <span className="text-2xl opacity-60">◆</span>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.3em] text-[#D1BE9B] mb-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    今日能量水晶
                  </p>
                  <p className="text-lg tracking-[0.15em] text-[#31353A]/86 mb-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {aiData?.crystal || '選擇星座以獲取推薦'}
                  </p>
                  <p className="text-[12px] leading-[1.9] text-[#31353A]/62 tracking-wider"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {aiData?.crystalReason || '選擇你的星座，Mochi 將根據今日月相為你推薦最適合的能量水晶。'}
                  </p>
                </div>
                {aiData && (
                  <Link href="/shop" className="flex-shrink-0">
                    <button className="text-xs tracking-[0.15em] px-4 py-2 border border-[#D1BE9B]/30 rounded-full text-[#D1BE9B] hover:bg-[#D1BE9B]/10 transition-colors"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      選購
                    </button>
                  </Link>
                )}
              </div>

              {/* Zodiac grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
                {ZODIAC_SIGNS.map(sign => (
                  <button
                    key={sign.id}
                    onClick={() => handleSignSelect(sign.id)}
                    className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                      selectedSign === sign.id
                        ? 'border-[#D1BE9B] shadow-[0_4px_16px_rgba(209,190,155,0.25)] scale-105'
                        : 'border-[#D1BE9B]/15 hover:border-[#D1BE9B]/35 hover:scale-[1.02]'
                    }`}
                    style={{
                      background: selectedSign === sign.id ? sign.color + '25' : 'rgba(250,247,244,0.6)',
                    }}>
                    <span className="text-xl" style={{ color: sign.color }}>{sign.symbol}</span>
                    <span className="text-[11px] tracking-[0.1em] text-[#31353A]/80"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {sign.name}
                    </span>
                    <span className="text-[9px] text-[#31353A]/50 tracking-wider"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {sign.dates}
                    </span>
                  </button>
                ))}
              </div>

              {selectedSignData && (
                <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
                  <DialogContent className="sm:max-w-md bg-[#FDFBF7] border-[#D1BE9B]/30 rounded-2xl p-6" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                    <DialogHeader>
                      <DialogTitle className="text-center text-[15px] tracking-[0.18em] font-light text-[#31353A]">
                        解鎖每日運勢
                      </DialogTitle>
                    </DialogHeader>
                    <div className="text-center pt-2">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D1BE9B]/35"
                        style={{ background: selectedSignData.color + '20' }}>
                        <span className="text-3xl" style={{ color: selectedSignData.color }}>
                          {selectedSignData.symbol}
                        </span>
                      </div>
                      <p className="mb-1 text-[13px] tracking-[0.18em] text-[#31353A]/84"
                        style={{ fontWeight: 400 }}>
                        {selectedSignData.name}
                      </p>
                      <p className="mb-5 text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/60"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        Mochi 將結合今日月相能量，為你生成今天的整體、感情、事業與健康提醒。
                      </p>

                      {credits?.enabled && credits.freeRemaining <= 0 && credits.credits <= 0 ? (
                        <Link href="/buy" className="block">
                          <button
                            onClick={() => setUnlockDialogOpen(false)}
                            className="w-full rounded-full bg-[#D1BE9B]/15 px-5 py-3.5 text-xs font-medium tracking-[0.2em] text-[#A38D6B] transition-all duration-300 hover:bg-[#D1BE9B]/25 active:scale-95"
                            style={{ fontFamily: 'Noto Serif TC, serif' }}
                          >
                            點數與免費額度不足，前往加值
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (
                              credits?.enabled &&
                              !isAuthenticated &&
                              credits.dailyFreeQuota > 0 &&
                              credits.freeRemaining <= 0
                            ) {
                              void login(REPEAT_READING_LOGIN_PROMPT);
                              return;
                            }
                            setHasClickedGenerate(true);
                            setUnlockDialogOpen(false);
                          }}
                          className="w-full rounded-full bg-[#3D4144] px-5 py-3.5 text-xs font-medium tracking-[0.25em] text-[#FAF7F4] shadow-sm transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}
                        >
                          確認解鎖
                        </button>
                      )}

                      {credits?.enabled && (
                        <p className="mt-3 text-[11px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                          免費額度每日 00:00 重置；用完後每次解讀消耗 1 點。
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Fortune detail */}
              {selectedSign && selectedSignData && hasClickedGenerate && (
                <div className="animate-fade-in-up">
                  <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20">

                    {/* Sign header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#D1BE9B]/15">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: selectedSignData.color + '20' }}>
                        <span className="text-2xl" style={{ color: selectedSignData.color }}>
                          {selectedSignData.symbol}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg tracking-[0.15em] text-[#31353A]/86"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {selectedSignData.name}
                        </h3>
                        <p className="text-[11px] italic text-[#D1BE9B]"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {selectedSignData.en} · {selectedSignData.element}象星座
                        </p>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-2">
                        {/* 月相徽章 */}
                        {aiData?.moonPhase && aiData?.moonSymbol && (
                          <MoonPhaseBadge symbol={aiData.moonSymbol} name={aiData.moonPhase} />
                        )}
                        {dailyFortuneQuery.isLoading && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1BE9B]/10 border border-[#D1BE9B]/20">
                            <span className="text-[#D1BE9B] animate-spin text-xs">✦</span>
                            <span className="text-[11px] tracking-[0.15em] text-[#31353A]/54"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              {fortuneWaitingMessage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <>
                        {/* Loading state */}
                        {dailyFortuneQuery.isLoading && (
                          <div className="flex flex-col items-center gap-4 py-12">
                            <div className="text-3xl animate-pulse">🌙</div>
                            <p className="text-[12px] tracking-[0.2em] text-[#31353A]/54"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              {fortuneWaitingMessage}
                            </p>
                          </div>
                        )}

                        {/* Error state */}
                        {dailyFortuneQuery.isError && (
                          <div className="text-center py-8">
                            <p className="text-[12px] text-[#31353A]/54 tracking-wider mb-3"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              運勢解讀暫時無法取得，請稍後再試
                            </p>
                            <button
                              onClick={() => dailyFortuneQuery.refetch()}
                              className="text-[11px] tracking-[0.15em] text-[#D1BE9B] border-b border-[#D1BE9B]/40 pb-0.5"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              重新嘗試
                            </button>
                          </div>
                        )}

                        {/* AI Fortune content */}
                        {aiData && (
                          <>
                            {/* Scores */}
                            <div className="space-y-3 mb-6">
                              <ScoreBar label="整體" score={aiData.overallScore}  color={selectedSignData.color} />
                              <ScoreBar label="感情" score={aiData.loveScore}     color="#EAA8AC" />
                              <ScoreBar label="事業" score={aiData.careerScore}   color="#A0B898" />
                              <ScoreBar label="健康" score={aiData.healthScore}   color="#A8C0A8" />
                            </div>

                            {/* Lucky info */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                              {[
                                { label: '幸運顏色', value: aiData.luckyColor },
                                { label: '幸運數字', value: aiData.luckyNumber.toString() },
                                { label: '能量水晶', value: aiData.crystal },
                              ].map(item => (
                                <div key={item.label} className="text-center p-3 rounded-xl bg-[#D1BE9B]/8">
                                  <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-1"
                                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                    {item.label}
                                  </p>
                                  <p className="text-xs tracking-[0.1em] text-[#31353A]/80"
                                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                    {item.value}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Fortune messages */}
                            <div className="space-y-4 mb-6">
                              {[
                                { icon: '✦', label: '整體運勢', text: aiData.overall },
                                { icon: '♥', label: '感情運勢', text: aiData.love },
                                { icon: '◈', label: '事業財運', text: aiData.career },
                                { icon: '◉', label: '健康提醒', text: aiData.health },
                              ].map(item => (
                                <div key={item.label} className="flex gap-3">
                                  <span className="text-[#D1BE9B] flex-shrink-0 mt-0.5 text-sm">{item.icon}</span>
                                  <div>
                                    <p className="text-[12px] tracking-[0.2em] text-[#6F5A3A] mb-1"
                                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                                      {item.label}
                                    </p>
                                    <div className="text-[13.5px] leading-[2] text-[#31353A]/72 tracking-wider prose prose-sm max-w-none prose-strong:text-[#31353A]/90 prose-strong:font-semibold [&_p]:!text-[13.5px] [&_p]:!leading-[2]"
                                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                      <Streamdown>{item.text}</Streamdown>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Today's advice */}
                            <div className="pt-4 border-t border-[#D1BE9B]/15">
                              <div className="flex gap-3">
                                <span className="text-[#D1BE9B] flex-shrink-0 mt-0.5 text-sm">☽</span>
                                <div>
                                  <p className="text-[12px] tracking-[0.2em] text-[#6F5A3A] mb-1"
                                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                                    今日月相指引
                                  </p>
                                  <div className="text-[13.5px] leading-[2] text-[#31353A]/72 tracking-wider italic prose prose-sm max-w-none prose-strong:text-[#31353A]/90 prose-strong:font-semibold [&_p]:!text-[13.5px] [&_p]:!leading-[2]"
                                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                    <Streamdown>{aiData.advice}</Streamdown>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Product recommendation */}
                            {selectedSignData && (
                              <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15">
                                <p className="text-[14px] tracking-[0.24em] text-[#6F5A3A] mb-3"
                                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                                  ◎ Mochi 為你挑的今日商品
                                </p>
                                <div className="mb-4 rounded-2xl border border-[#D1BE9B]/15 bg-white/35 px-4 py-3">
                                  <div className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/70 prose prose-sm max-w-none prose-strong:text-[#31353A]/90 prose-strong:font-semibold [&_p]:!my-0 [&_p]:!text-[12px] [&_p]:!leading-[1.9]"
                                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                    <Streamdown>{`根據今天的提醒：${getFortuneRecommendationMessage(selectedSignData.element, aiData)}`}</Streamdown>
                                  </div>
                                  <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/70"
                                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                    所以推薦你：
                                  </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                  {recommendForFortune(selectedSignData.element).map((product, index) => (
                                    <ProductCard
                                      key={product.slug}
                                      product={product}
                                      context={getFortuneRecommendationMessage(selectedSignData.element, aiData)}
                                      role={index === 0 ? 'primary' : 'secondary'}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                  </div>
                </div>
              )}

              {!selectedSign && (
                <div className="text-center py-8">
                  <p className="text-xs tracking-[0.2em] text-[#31353A]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    選擇你的星座，Mochi 將結合今日月相為你解讀運勢
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </PageLayout>
  );
}
