/**
 * SOUL EASE | Mochi．crystal — Tarot Reading Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - Celtic Cross 10-card spread (凱爾特十字牌陣)
 *   - Morandi-style card faces with gold line art
 *   - Step-by-step reveal with flip animation
 *   - AI-style interpretation (static demo)
 *   - Crystal recommendation based on reading
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { CatWaving, CatListening } from '@/components/CatElements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { recommendForTarot } from '@/data/recommend';
import type { Product } from '@/data/products';

// ─── Tarot Card Data ──────────────────────────────────────────────────────────
const MAJOR_ARCANA = [
  { id: 0,  name: '愚者',     en: 'The Fool',         symbol: '☽', meaning: '新的開始、純真、冒險、自由精神', reversed: '魯莽、缺乏計畫、天真過頭' },
  { id: 1,  name: '魔術師',   en: 'The Magician',     symbol: '✦', meaning: '意志力、技巧、資源豐富、顯化能力', reversed: '操縱、技巧不足、資源浪費' },
  { id: 2,  name: '女祭司',   en: 'The High Priestess',symbol: '◈', meaning: '直覺、神秘、內在智慧、潛意識', reversed: '壓抑直覺、秘密、表面化' },
  { id: 3,  name: '女皇',     en: 'The Empress',      symbol: '♡', meaning: '豐盛、母性、創造力、自然之美', reversed: '依賴、創意阻塞、過度保護' },
  { id: 4,  name: '皇帝',     en: 'The Emperor',      symbol: '♔', meaning: '權威、穩定、結構、父性保護', reversed: '獨裁、缺乏彈性、控制欲強' },
  { id: 5,  name: '教皇',     en: 'The Hierophant',   symbol: '✙', meaning: '傳統、信仰、精神指引、社會規範', reversed: '反傳統、個人信念、打破規則' },
  { id: 6,  name: '戀人',     en: 'The Lovers',       symbol: '♥', meaning: '愛情、選擇、和諧、價值觀一致', reversed: '不和諧、錯誤選擇、價值觀衝突' },
  { id: 7,  name: '戰車',     en: 'The Chariot',      symbol: '⚔', meaning: '意志力、勝利、自律、克服障礙', reversed: '失控、侵略性、缺乏方向' },
  { id: 8,  name: '力量',     en: 'Strength',         symbol: '∞', meaning: '內在力量、勇氣、耐心、溫柔的控制', reversed: '懷疑自我、缺乏信心、情緒失控' },
  { id: 9,  name: '隱士',     en: 'The Hermit',       symbol: '☆', meaning: '內省、孤獨、智慧、靈性探索', reversed: '孤立、拒絕幫助、過度內省' },
  { id: 10, name: '命運之輪', en: 'Wheel of Fortune',  symbol: '⊕', meaning: '命運、轉折點、循環、好運', reversed: '壞運、抗拒改變、命運失控' },
  { id: 11, name: '正義',     en: 'Justice',          symbol: '⚖', meaning: '公平、真理、因果、法律', reversed: '不公正、逃避責任、不誠實' },
  { id: 12, name: '倒吊人',   en: 'The Hanged Man',   symbol: '⊗', meaning: '暫停、犧牲、新視角、等待', reversed: '拖延、無謂犧牲、固執' },
  { id: 13, name: '死神',     en: 'Death',            symbol: '☩', meaning: '結束、轉變、放下、新生', reversed: '抗拒改變、停滯、無法放手' },
  { id: 14, name: '節制',     en: 'Temperance',       symbol: '△', meaning: '平衡、耐心、調和、中庸之道', reversed: '不平衡、過度、缺乏耐心' },
  { id: 15, name: '惡魔',     en: 'The Devil',        symbol: '◆', meaning: '束縛、物質主義、陰暗面、上癮', reversed: '解脫、覺醒、打破束縛' },
  { id: 16, name: '高塔',     en: 'The Tower',        symbol: '⚡', meaning: '突然改變、混亂、啟示、重建', reversed: '避免災難、延遲崩潰、內部動盪' },
  { id: 17, name: '星星',     en: 'The Star',         symbol: '✧', meaning: '希望、靈感、平靜、信念', reversed: '絕望、失去信念、不切實際' },
  { id: 18, name: '月亮',     en: 'The Moon',         symbol: '☾', meaning: '幻象、恐懼、潛意識、不確定', reversed: '困惑消散、恐懼面對、清晰浮現' },
  { id: 19, name: '太陽',     en: 'The Sun',          symbol: '☀', meaning: '喜悅、成功、活力、清晰', reversed: '悲觀、缺乏活力、過度自信' },
  { id: 20, name: '審判',     en: 'Judgement',        symbol: '♦', meaning: '覺醒、重生、召喚、反思', reversed: '自我懷疑、拒絕覺醒、過去的包袱' },
  { id: 21, name: '世界',     en: 'The World',        symbol: '○', meaning: '完成、整合、成就、旅程終點', reversed: '未完成、缺乏閉合、停滯' },
];

// Star spread positions (5 cards)
const SPREAD_POSITIONS = [
  { id: 0, label: '中心能量', desc: '代表你目前的核心狀態與問題所在' },
  { id: 1, label: '過去',     desc: '影響現況的過去事件或根源能量' },
  { id: 2, label: '現在',     desc: '目前正在發生的事件與你的實際狀態' },
  { id: 3, label: '未來',     desc: '即將展開的能量走向與可能的結果' },
  { id: 4, label: '建議',     desc: '塔羅給予你的行動指引與內在智慧' },
];

// Rider-Waite-Smith Tarot card images (public domain), self-hosted in
// client/public/tarot to avoid Wikimedia hotlink rate-limiting (HTTP 429).
const CARD_IMAGES: Record<number, string> = {
  0:  '/tarot/00.jpg',
  1:  '/tarot/01.jpg',
  2:  '/tarot/02.jpg',
  3:  '/tarot/03.jpg',
  4:  '/tarot/04.jpg',
  5:  '/tarot/05.jpg',
  6:  '/tarot/06.jpg',
  7:  '/tarot/07.jpg',
  8:  '/tarot/08.jpg',
  9:  '/tarot/09.jpg',
  10: '/tarot/10.jpg',
  11: '/tarot/11.jpg',
  12: '/tarot/12.jpg',
  13: '/tarot/13.jpg',
  14: '/tarot/14.jpg',
  15: '/tarot/15.jpg',
  16: '/tarot/16.jpg',
  17: '/tarot/17.jpg',
  18: '/tarot/18.jpg',
  19: '/tarot/19.jpg',
  20: '/tarot/20.jpg',
  21: '/tarot/21.jpg',
};

// Card face using real Rider-Waite-Smith images
const CardFace = ({ card, reversed = false }: { card: typeof MAJOR_ARCANA[0]; reversed?: boolean }) => {
  const imgUrl = CARD_IMAGES[card.id];
  return (
    <div
      className={`w-full h-full relative overflow-hidden rounded-lg border border-[#D1BE9B]/30 ${reversed ? 'rotate-180' : ''}`}
      style={{ transition: 'transform 0.3s ease', background: '#F5EFE8' }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={card.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        // Fallback SVG if image fails
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0E8DC]">
          <span className="text-2xl opacity-50" style={{ fontFamily: 'serif' }}>{card.symbol}</span>
          <span className="text-[10px] tracking-widest text-[#31353A]/72 mt-1" style={{ fontFamily: 'Noto Serif TC, serif' }}>{card.name}</span>
        </div>
      )}
      {reversed && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <span className="text-[9px] tracking-wider text-[#EAA8AC] bg-black/30 px-1.5 py-0.5 rounded-full"
            style={{ fontFamily: 'Noto Serif TC, serif' }}>逆位</span>
        </div>
      )}
    </div>
  );
};

// Card back — soft linen texture with golden mandala
const CardBack = () => (
  <svg viewBox="0 0 120 200" fill="none" className="w-full h-full">
    {/* Solid fills only — no gradient/defs, which can render transparent
        inside the 3D flip container (preserve-3d + backface-visibility). */}
    <rect width="120" height="200" rx="8" fill="#C1AD89" />
    {/* Soft centre halo, layered translucent discs instead of a gradient */}
    <circle cx="60" cy="100" r="46" fill="#EFE3C6" fillOpacity="0.16" />
    <circle cx="60" cy="100" r="34" fill="#F3E9CF" fillOpacity="0.18" />
    {/* Frames */}
    <rect x="5" y="5" width="110" height="190" rx="6" stroke="#F3E7CC" strokeWidth="1" opacity="0.9" />
    <rect x="9" y="9" width="102" height="182" rx="4" stroke="#F3E7CC" strokeWidth="0.5" strokeDasharray="2 2.5" opacity="0.65" />
    {/* Sunburst rays */}
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i * 15 * Math.PI) / 180;
      return (
        <line key={`r${i}`}
          x1={60 + 19 * Math.cos(a)} y1={100 + 19 * Math.sin(a)}
          x2={60 + 41 * Math.cos(a)} y2={100 + 41 * Math.sin(a)}
          stroke="#F3E7CC" strokeWidth={i % 2 ? 0.3 : 0.6} strokeOpacity="0.5" />
      );
    })}
    {/* Concentric rings */}
    <circle cx="60" cy="100" r="41" stroke="#F3E7CC" strokeWidth="0.8" opacity="0.8" fill="none" />
    <circle cx="60" cy="100" r="31" stroke="#F3E7CC" strokeWidth="0.5" opacity="0.65" fill="none" />
    <circle cx="60" cy="100" r="17" stroke="#F5EAD5" strokeWidth="0.8" fill="#F8F0DC" fillOpacity="0.18" />
    {/* Inner petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <line key={`p${i}`}
          x1={60 + 6 * Math.cos(rad)} y1={100 + 6 * Math.sin(rad)}
          x2={60 + 17 * Math.cos(rad)} y2={100 + 17 * Math.sin(rad)}
          stroke="#F8F0DC" strokeWidth="0.7" strokeOpacity="0.8" />
      );
    })}
    {/* Centre moon disc */}
    <circle cx="60" cy="100" r="5.5" fill="#F8F0DC" fillOpacity="0.85" />
    {/* Scattered stars */}
    {[[60, 64], [60, 136], [37, 100], [83, 100], [44, 78], [76, 122], [76, 78], [44, 122]].map(([x, y], i) => (
      <path key={`s${i}`}
        d={`M${x} ${y - 2.4} L${x + 0.7} ${y - 0.7} L${x + 2.4} ${y} L${x + 0.7} ${y + 0.7} L${x} ${y + 2.4} L${x - 0.7} ${y + 0.7} L${x - 2.4} ${y} L${x - 0.7} ${y - 0.7} Z`}
        fill="#F8F1DE" fillOpacity="0.9" />
    ))}
    {/* Brand text */}
    <text x="60" y="187" textAnchor="middle" fontSize="6" fill="#F3E7CC" fillOpacity="0.7"
      fontFamily="Cormorant Garamond, serif" letterSpacing="2.5" fontStyle="italic">
      Healing Pick
    </text>
  </svg>
);

// Shuffle and draw cards
function drawCards(): Array<{ card: typeof MAJOR_ARCANA[0]; reversed: boolean }> {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map(card => ({
    card,
    reversed: Math.random() > 0.7,
  }));
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const meanings = product.meanings.slice(0, 3).map((m) => m.title);
  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="flex gap-4 p-4 rounded-2xl border border-[#D1BE9B]/25 bg-white/40 hover:border-[#D1BE9B]/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0EBE3]/40">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
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
          <span className="text-[11px] tracking-[0.15em] text-[#A38D6B]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            查看商品 →
          </span>
        </div>
      </div>
    </Link>
  );
}

type Step = 'intro' | 'question' | 'shuffle' | 'pick' | 'spread' | 'reading';

export default function TarotPage() {
  const { isAuthenticated, login } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Pre-check the user's remaining quota before letting them start. Saves them
  // from walking through the whole flow only to be blocked at the last step.
  const handleStart = () => {
    const c = creditsQuery.data;
    if (c?.enabled && c.freeRemaining <= 0 && c.credits <= 0) {
      toast.error('今日免費額度已用完 🐾', {
        description: isAuthenticated
          ? '可購買點數繼續算,或等每日 00:00 免費額度重置'
          : '註冊登入就能購買點數繼續算,或等每日 00:00 免費額度重置',
        action: {
          label: isAuthenticated ? '購買點數' : '註冊登入',
          onClick: () => {
            if (isAuthenticated) {
              window.location.href = '/buy';
            } else {
              void login();
            }
          },
        },
        duration: 6000,
      });
      return;
    }
    setStep('question');
  };

  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('romance');
  const [drawnCards, setDrawnCards] = useState<ReturnType<typeof drawCards>>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [isShufflingActive, setIsShufflingActive] = useState(false);
  const [shuffleFrame, setShuffleFrame] = useState(0);
  const [shuffledDeck, setShuffledDeck] = useState<typeof MAJOR_ARCANA>([]);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [llmInterpretation, setLlmInterpretation] = useState<string>('');

  const saveReadingMutation = trpc.history.saveReading.useMutation();

  const interpretMutation = trpc.tarot.interpret.useMutation({
    onSuccess: (data) => {
      setLlmInterpretation(data.interpretation);
      if (!isAuthenticated) return;
      saveReadingMutation.mutate({
        type: 'tarot',
        question: question || undefined,
        inputData: JSON.stringify({ questionType, cards: drawnCards.map(c => ({ name: c.card.name, position: c.card.en, reversed: c.reversed })) }),
        interpretation: data.interpretation,
      });
    },
  });

  // 開始持續洗牌動畫
  const handleStartShuffle = useCallback(() => {
    setIsShufflingActive(true);
    setShuffleFrame(0);
    shuffleIntervalRef.current = setInterval(() => {
      setShuffleFrame(f => f + 1);
    }, 120);
  }, []);

  // 停止洗牌，展開牌組讓使用者選牌
  const handleStopShuffle = useCallback(() => {
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    setIsShufflingActive(false);
    // 最終洗牌結果
    const finalDeck = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    setShuffledDeck(finalDeck);
    setPickedIndices([]);
    setStep('pick');
  }, []);

  // 清理 interval
  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);

  // 使用者選牌
  function handlePickCard(deckIdx: number) {
    if (pickedIndices.includes(deckIdx)) return;
    if (pickedIndices.length >= 5) return;
    const newPicked = [...pickedIndices, deckIdx];
    setPickedIndices(newPicked);
    if (newPicked.length === 5) {
      // 將選出的牌轉換為 drawnCards 格式
      const cards = newPicked.map(i => ({
        card: shuffledDeck[i],
        reversed: Math.random() > 0.7,
      }));
      setDrawnCards(cards);
      setRevealedCards(new Set());
      setSelectedCard(null);
      setTimeout(() => setStep('spread'), 400);
    }
  }

  // 舊的 handleShuffle 保留相容性（不再使用）
  function handleShuffle() {
    setShuffling(true);
    setTimeout(() => {
      setDrawnCards(drawCards());
      setShuffling(false);
      setStep('spread');
    }, 2000);
  }

  function handleRevealCard(idx: number) {
    setRevealedCards(prev => new Set(Array.from(prev).concat(idx)));
    setSelectedCard(idx);
  }

  function handleRevealAll() {
    setRevealedCards(new Set([0, 1, 2, 3, 4]));
  }

  const recommendedProducts = step === 'reading' ? recommendForTarot(questionType, question) : [];

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* ── INTRO ──────────────────────────────────────────────────────── */}
          {step === 'intro' && (
            <div className="text-center animate-fade-in-up">
              {/* Header */}
              <div className="mb-10 text-center w-full">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase block"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Tarot Reading
                </span>
                
                {/* flex justify-center keeps h1 perfectly centred; envelope is absolute so it never shifts the title */}
                <div className="relative mt-3 mb-10 md:mb-8 flex justify-center items-center">
                  <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#31353A] m-0"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    塔羅牌占卜
                  </h1>

                  {/* Envelope anchored at a fixed distance from centre — absolute so h1 centering is never disturbed */}
                  {/* Float lives on the outer div so hover:scale / active:scale on the button don't fight the animation */}
                  <div className="absolute right-4 md:right-12 top-[calc(50%+0.5rem)] -translate-y-1/2 animate-float-envelope">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="relative flex flex-col items-center justify-center group bg-transparent focus:outline-none border-none hover:scale-105 active:scale-[0.92] transition-transform duration-150 ease-out">
                          <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#FDFBF7] to-[#F0E8DC] border border-[#D1BE9B]/60 shadow-[0_4px_16px_rgba(209,190,155,0.25)] hover:shadow-[0_8px_24px_rgba(163,141,107,0.35)] transition-shadow duration-500 overflow-visible">
                            {/* Ping ripple — plays once on page load */}
                            <div className="absolute inset-0 rounded-full border border-[#D1BE9B]/50 animate-envelope-ping pointer-events-none" />
                            {/* Decorative spinning inner ring */}
                            <div className="absolute inset-0.5 md:inset-1 rounded-full border border-[#D1BE9B]/40 border-dashed animate-[spin_30s_linear_infinite] pointer-events-none" />
                            {/* Glint — clips to the circle, sweeps every 8 s */}
                            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
                              <div className="absolute top-0 left-0 h-full w-1/2 animate-wax-glint"
                                style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)' }} />
                            </div>
                            {/* Wax seal style envelope icon */}
                            <div className="relative z-10 flex items-center justify-center text-[#A38D6B] group-hover:text-[#8A7250] transition-colors drop-shadow-sm scale-75 md:scale-90">
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                                {/* Gold wax seal */}
                                <circle cx="12" cy="13.2" r="3" fill="#D1BE9B" className="group-hover:fill-[#C9A86A] transition-colors" />
                                <path d="M11 13.2H13M12 12.2V14.2" stroke="#FDFBF7" strokeWidth="0.8" strokeLinecap="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Always visible tooltip positioned absolutely to avoid layout shift */}
                          <span className="absolute top-[110%] bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#D1BE9B]/20 text-[#8A7250] text-[9px] md:text-[10px] tracking-[0.1em] px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            塔羅小教室
                          </span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#FDFBF7] border-[#D1BE9B]/30" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                      <DialogHeader>
                        <DialogTitle className="text-center text-lg tracking-[0.2em] font-extralight text-[#31353A] mb-2 mt-2">
                          ✦ Mochi 的塔羅小秘密 ✦
                        </DialogTitle>
                      </DialogHeader>
                      <div className="text-[13px] text-[#31353A]/80 leading-[2.2] tracking-wider space-y-6 mt-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        <p>
                          你有沒有過這種感覺？有時候遇到煩惱，其實心裡隱約已經有答案了，只是腦袋一團亂，需要有人幫你理清楚。<br/><br/>
                          塔羅牌，其實就是一面<strong className="font-medium text-[#A38D6B]">「照出你內心真實模樣的鏡子」</strong>。
                        </p>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>🃏 為什麼 Mochi 只用這 22 張牌？</h4>
                          <p>
                            塔羅牌裡有 22 張最重要的牌，我們叫它「大阿爾卡納」。<br/>
                            想像這 22 張牌，是一部名為<strong className="font-medium">「愚者的旅行」</strong>的電影，主角就是你。<br/><br/>
                            從第 0 張牌《愚者》（代表天真無畏的開始），一路經歷《戀人》（面臨選擇）、《高塔》（突如其來的改變），最後走到第 21 張牌《世界》（達成圓滿）。<br/><br/>
                            <strong className="font-medium">這 22 張牌，包含了我們這一生中「所有可能遇到的重大關卡與情緒」</strong>。因為它涵蓋了人生的所有縮影，所以當你遇到困惑時，這 22 個故事裡，總有一個能完美對應你此刻的處境。這就是為什麼它總是那麼準確。
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>🤔 所以，抽出來的牌為什麼會準？</h4>
                          <p>其實，這是一種很奇妙的「直覺共鳴」，背後有兩個簡單的邏輯：</p>
                          <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong className="font-medium">你的心，會引導你選牌：</strong>當你閉上眼睛、專心想著問題洗牌時，你當下的情緒和直覺，會不自覺地牽引你，選出那張最能反映你目前狀態的牌。</li>
                            <li><strong className="font-medium">看圖，找出藏在心裡的答案：</strong>當你看到牌面的那一刻，腦海中第一個浮現的感覺，往往就是你潛意識裡「最真實的聲音」。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>🧭 塔羅牌不是「算命」，而是「導航」</h4>
                          <p>
                            如果人生是一趟旅行，塔羅牌<strong className="font-medium">不是寫好的劇本</strong>，不會告訴你「明天一定會發生什麼壞事」。<br/><br/>
                            它比較像是一台<strong className="font-medium">導航儀</strong>，溫柔地提醒你：「嘿，前面這條路好像有點塞車喔，要不要換個心態走走看？」<br/><br/>
                            真正握著方向盤、決定要怎麼走的，永遠都是你自己。
                          </p>
                        </div>

                        <div className="bg-[#D1BE9B]/10 p-5 rounded-2xl border border-[#D1BE9B]/20 text-[#31353A]/80 mt-8 shadow-sm">
                          <div className="font-medium text-[#A38D6B] mb-2 flex items-center gap-2 text-[14px]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                            <CatListening className="w-7 h-7" /> Mochi 的悄悄話：
                          </div>
                          <p className="text-[13px] leading-[2.2] tracking-wider italic" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            「不用害怕抽到看起來黑黑暗暗的牌，每一張牌，都是來提醒你、保護你的小提示。<br/>
                            深呼吸，把心靜下來，讓我陪你一起聽聽你心底的聲音吧 🐾」
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
                <p className="text-sm italic text-[#31353A]/54 tracking-[0.15em]"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  "The cards don't predict the future — they illuminate the present."
                </p>
              </div>

              {/* Spread image — showcase a few RWS cards */}
              <div className="flex justify-center items-end gap-3 mb-10">
                {[
                  { id: 17, label: '星星' },
                  { id: 2,  label: '女祭司' },
                  { id: 0,  label: '愚者' },
                  { id: 19, label: '太陽' },
                  { id: 21, label: '世界' },
                ].map((card, i) => {
                  const offsets = [-18, -8, 0, -8, -18];
                  const rotations = [-12, -6, 0, 6, 12];
                  return (
                    <div
                      key={card.id}
                      className="relative flex-shrink-0"
                      style={{
                        transform: `rotate(${rotations[i]}deg) translateY(${offsets[i]}px)`,
                        zIndex: i === 2 ? 10 : 5 - Math.abs(i - 2),
                      }}
                    >
                      <img
                        src={CARD_IMAGES[card.id]}
                        alt={card.label}
                        className="w-20 md:w-24 rounded-lg shadow-[0_8px_24px_rgba(61,65,68,0.18)] border border-[#D1BE9B]/20"
                        style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Spread info */}
              <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto border border-[#D1BE9B]/20 mb-8">
                <h3 className="text-sm tracking-[0.2em] text-[#31353A]/86 mb-4"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  五牌陣星形牌陣
                </h3>
                <p className="text-[12px] leading-[2.1] text-[#31353A]/68 tracking-wider mb-6"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  這次會抽出 5 張牌，幫你從不同角度看清楚現在的狀況。
                  中間那張牌代表這件事的核心；四周的牌會分別看見：過去怎麼影響你、現在正在發生什麼、接下來可能往哪裡走，以及你可以怎麼做。
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {SPREAD_POSITIONS.map(p => (
                    <div key={p.id} className="text-center p-2 rounded-lg bg-[#D1BE9B]/8">
                      <div className="text-[10px] tracking-[0.15em] text-[#D1BE9B] mb-0.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        {p.id + 1}
                      </div>
                      <div className="text-[11px] tracking-[0.1em] text-[#31353A]/80"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        {p.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="max-w-2xl mx-auto mb-8 px-5 py-4 rounded-2xl border border-[#D1BE9B]/15 bg-[#D1BE9B]/5">
                <p className="text-[11px] tracking-[0.3em] text-[#8A7250] mb-3 text-center"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                  ◎ 占卜如何進行
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-start">
                  {[
                    { icon: '🎴', label: '隨機洗牌', desc: '從 22 張大阿爾卡納中隨機抽出 5 張，並隨機決定正逆位' },
                    { icon: '✦', label: '布陣解讀', desc: '五張牌分別代表中心、過去、現在、未來與建議' },
                    { icon: '◈', label: 'Mochi解讀', desc: '將你的問題與牌面一同交給 Mochi，生成整體的能量解讀' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex sm:flex-col sm:flex-1 items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
                      {i > 0 && (
                        <div className="hidden sm:flex items-center justify-center w-8 mt-4 flex-shrink-0">
                          <div className="h-px w-full bg-[#D1BE9B]/25" />
                        </div>
                      )}
                      <div className="flex sm:flex-col sm:items-center gap-3 sm:gap-2 flex-1">
                        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#D1BE9B]/12 flex items-center justify-center text-base">
                          {step.icon}
                        </div>
                        <div>
                          <p className="text-[11px] tracking-[0.2em] text-[#8A7250] mb-0.5"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                            {step.label}
                          </p>
                          <p className="text-[12px] leading-[1.7] text-[#31353A]/62 tracking-wide"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                className="px-10 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                開始占卜
              </button>
              {creditsQuery.data?.enabled && (
                <p className="mt-3 text-[11px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  每天免費 2 次，00:00 重置；用完後完整解讀消耗 1 點。
                </p>
              )}
            </div>
          )}

          {/* ── QUESTION ───────────────────────────────────────────────────── */}
          {step === 'question' && (
            <div className="max-w-xl mx-auto animate-fade-in-up">
              <div className="text-center mb-10">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 1
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  設定你的問題
                </h2>
                <p className="mt-2 text-[12px] text-[#31353A]/58 tracking-wider leading-[1.9]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  心中帶著問題，讓宇宙為你指引
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20">
                {/* Question type */}
                <div className="mb-6">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    占卜主題
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'romance',          label: '感情曖昧', icon: '♥' },
                      { id: 'reconciliation',   label: '復合關係', icon: '♡' },
                      { id: 'careerChoice',     label: '職涯選擇', icon: '✦' },
                      { id: 'moneyOpportunity', label: '財務機會', icon: '◇' },
                      { id: 'stuck',            label: '卡住迷惘', icon: '☆' },
                      { id: 'decision',         label: '做決定', icon: '○' },
                      { id: 'boundaries',       label: '人際界線', icon: '◈' },
                      { id: 'emotions',         label: '情緒整理', icon: '☽' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setQuestionType(t.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 text-xs tracking-[0.15em] ${
                          questionType === t.id
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]'
                            : 'border-[#D1BE9B]/20 hover:border-[#D1BE9B]/40 text-[#31353A]/72'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        <span className="text-lg opacity-70">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question input */}
                <div className="mb-6">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    你的問題（選填）
                  </label>
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value.slice(0, 120))}
                    maxLength={120}
                    placeholder="例如：我與他的感情未來會如何發展？"
                    rows={3}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-3 text-xs text-[#31353A]/80 tracking-wider leading-[1.9] resize-none focus:outline-none focus:border-[#D1BE9B]/50 placeholder:text-[#31353A]/46"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <div className="mt-1 text-right text-[10px] tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: question.length >= 120 ? '#C9837A' : question.length >= 100 ? '#A38D6B' : '#31353A66' }}>
                    {question.length} / 120
                  </div>
                  <p className="mt-2 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    ✦ 問題越具體，解讀越精準。也可以不填，讓牌自由說話。
                  </p>
                </div>

                <button
                  onClick={() => setStep('shuffle')}
                  className="w-full py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  繼續洗牌
                </button>
              </div>
            </div>
          )}

          {/* ── SHUFFLE ────────────────────────────────────────────────────── */}
          {step === 'shuffle' && (
            <div className="text-center animate-fade-in-up">
              <div className="mb-8">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 2
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  洗牌
                </h2>
                <p className="mt-2 text-[12px] text-[#31353A]/58 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '15px' }}>
                  {isShufflingActive ? '牌正在洗動中⋯⋯心中默想問題，按下停止' : '深呼吸，讓心靜下來，準備好後按下開始洗牌'}
                </p>
              </div>

              {/* Shuffling card animation */}
              <div className="relative flex justify-center items-center mb-12" style={{ height: '200px' }}>
                {Array.from({ length: 9 }).map((_, i) => {
                  const angle = isShufflingActive
                    ? ((shuffleFrame * 18 + i * 40) % 360)
                    : (i - 4) * 8;
                  const radius = isShufflingActive ? 80 : 0;
                  const tx = isShufflingActive ? Math.sin((angle * Math.PI) / 180) * radius * 0.6 : (i - 4) * 18;
                  const ty = isShufflingActive ? -Math.abs(Math.cos((angle * Math.PI) / 180)) * 30 : Math.abs(i - 4) * 5;
                  const rot = isShufflingActive ? angle * 0.5 : (i - 4) * 6;
                  return (
                    <div
                      key={i}
                      className="absolute w-16 h-24"
                      style={{
                        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
                        transition: isShufflingActive ? 'transform 0.12s linear' : 'transform 0.5s cubic-bezier(0.23,1,0.32,1)',
                        zIndex: i,
                      }}
                    >
                      <CardBack />
                    </div>
                  );
                })}
              </div>

              {/* Shuffle cat */}
              <div className="flex justify-center mt-6 mb-4">
                {isShufflingActive ? (
                  <div className="flex flex-col items-center gap-1">
                    <CatWaving className="w-16 h-20" />
                    <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Mochi 在幫你洗牌 ♡</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <CatListening className="w-14 h-18" />
                    <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Mochi 在等你 ✦</span>
                  </div>
                )}
              </div>

              {!isShufflingActive ? (
                <button
                  onClick={handleStartShuffle}
                  className="px-10 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  開始洗牌
                </button>
              ) : (
                <button
                  onClick={handleStopShuffle}
                  className="px-10 py-3 text-xs tracking-[0.25em] bg-[#D1BE9B] text-[#31353A] rounded-full hover:bg-[#3D4144] hover:text-[#FAF7F4] transition-all duration-500 active:scale-95 animate-pulse"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  停止洗牌，選牌
                </button>
              )}
            </div>
          )}

          {/* ── PICK ───────────────────────────────────────────────────────── */}
          {step === 'pick' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 3
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  選出你的五張牌
                </h2>
                <p className="mt-3 text-[12px] text-[#31353A]/58 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  跟隨直覺，點選讓你感應到的牌
                </p>

                {/* 位置進度：讓使用者知道每一張代表哪個位置 */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {SPREAD_POSITIONS.map((p, i) => {
                    const done = i < pickedIndices.length;
                    const current = i === pickedIndices.length;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] tracking-[0.15em] transition-all duration-300 ${
                          done
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]'
                            : current
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/10 text-[#A38D6B] scale-110 shadow-[0_4px_14px_rgba(209,190,155,0.35)]'
                            : 'border-[#D1BE9B]/20 text-[#31353A]/50'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          done ? 'bg-[#D1BE9B] text-white' : current ? 'bg-[#D1BE9B]/50 text-white' : 'bg-[#D1BE9B]/15 text-[#31353A]/54'
                        }`}>
                          {done ? '✓' : i + 1}
                        </span>
                        {p.label}
                      </div>
                    );
                  })}
                </div>

                {/* 目前要選的牌代表什麼 */}
                {pickedIndices.length < 5 ? (
                  <div className="mt-4 inline-block px-5 py-2.5 rounded-2xl bg-[#D1BE9B]/8 border border-[#D1BE9B]/20">
                    <p className="text-[12px] tracking-[0.15em] text-[#A38D6B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      🐾 第 {pickedIndices.length + 1} 張 · <span className="text-[#31353A]/86">{SPREAD_POSITIONS[pickedIndices.length].label}</span>
                    </p>
                    <p className="mt-1 text-[11px] leading-[1.7] text-[#31353A]/58 tracking-wider"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {SPREAD_POSITIONS[pickedIndices.length].desc}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-[12px] tracking-[0.2em] text-[#A38D6B] animate-pulse"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    🐾 五張牌都選好了，正在為你攤開牌陣…
                  </p>
                )}
              </div>

              {/* Card grid — 22 cards face down */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3 max-w-4xl mx-auto px-4">
                {shuffledDeck.map((_, deckIdx) => {
                  const pickOrder = pickedIndices.indexOf(deckIdx);
                  const isPicked = pickOrder !== -1;
                  return (
                    <div
                      key={deckIdx}
                      onClick={() => handlePickCard(deckIdx)}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        isPicked
                          ? 'opacity-95 scale-95 pointer-events-none'
                          : 'hover:scale-110 hover:-translate-y-2 hover:drop-shadow-[0_8px_20px_rgba(209,190,155,0.5)]'
                      }`}
                    >
                      <div
                        className="w-full aspect-[3/5] tarot-pick-float"
                        style={{ animationDelay: `${(deckIdx % 11) * 0.18}s` }}
                      >
                        <CardBack />
                      </div>
                      {isPicked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-[#3D4144]/55 backdrop-blur-[1px] animate-fade-in-up">
                          <span className="w-5 h-5 rounded-full bg-[#D1BE9B] text-white text-[11px] flex items-center justify-center">
                            {pickOrder + 1}
                          </span>
                          <span className="text-[11px] tracking-[0.1em] text-white/95 px-1 text-center leading-tight"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {SPREAD_POSITIONS[pickOrder]?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cat reaction during pick */}
              <div className="flex justify-center mt-6 mb-2">
                <div className="flex flex-col items-center gap-1">
                  <CatWaving className="w-14 h-18" />
                  <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    {pickedIndices.length === 0
                      ? '跟著直覺，選出第一張牌吧 🐾'
                      : pickedIndices.length < 5
                      ? `已選 ${pickedIndices.length} 張，接下來選「${SPREAD_POSITIONS[pickedIndices.length].label}」🐾`
                      : '五張都選好了，我很期待 ♡'}
                  </span>
                </div>
              </div>

              {pickedIndices.length > 0 && pickedIndices.length < 5 && (
                <p className="text-center mt-2 text-[11px] text-[#31353A]/50 tracking-wider animate-pulse"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  還需選 {5 - pickedIndices.length} 張牌
                </p>
              )}
            </div>
          )}

          {/* ── SPREAD ─────────────────────────────────────────────────────── */}
          {step === 'spread' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 4
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  點擊牌面，逐一揭示
                </h2>
                {question && (
                  <p className="mt-2 text-xs italic text-[#31353A]/62 tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    「{question}」
                  </p>
                )}
                <p className="mt-2 text-[11px] text-[#31353A]/54 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  已揭示 {revealedCards.size} / 5
                </p>
              </div>

              {/* Mobile + Desktop responsive layout */}
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">

                {/* ── Cards area ── */}
                <div className="w-full xl:flex-1 min-w-0">

                  {/* Mobile (< xl): horizontal scroll row */}
                  <div className="xl:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {drawnCards.map((_, idx) => (
                        <div key={idx} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                          <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B] whitespace-nowrap"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                            {SPREAD_POSITIONS[idx].label}
                          </span>
                          <CardSlot idx={idx} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                        </div>
                      ))}
                    </div>
                    <p className="text-center mt-1 text-[11px] text-[#31353A]/46 tracking-wider"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      ← 左右滑動查看全部牌面 →
                    </p>
                  </div>

                  {/* Desktop (≥ xl): tidy diamond layout — centre + 上下左右 */}
                  <div className="hidden xl:block">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-fit mx-auto place-items-center">
                      {/* 過去 — top centre */}
                      <div className="col-start-2 row-start-1 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[1].label}</span>
                        <CardSlot idx={1} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* 建議 — left */}
                      <div className="col-start-1 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[4].label}</span>
                        <CardSlot idx={4} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* 中心能量 — centre */}
                      <div className="col-start-2 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#D1BE9B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>{SPREAD_POSITIONS[0].label}</span>
                        <CardSlot idx={0} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* 現在 — right */}
                      <div className="col-start-3 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[2].label}</span>
                        <CardSlot idx={2} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* 未來 — bottom centre */}
                      <div className="col-start-2 row-start-3 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[3].label}</span>
                        <CardSlot idx={3} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                    </div>
                  </div>

                  {/* Reveal all button */}
                  {revealedCards.size < 5 && (
                    <div className="text-center mt-7">
                      <button
                        onClick={handleRevealAll}
                        className="group inline-flex items-center gap-2 text-[15px] tracking-[0.28em] text-[#8A7250] hover:text-[#5C4A2E] transition-colors duration-300 border-b border-[#A38D6B]/50 hover:border-[#8A7250]/80 pb-1.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                        <span className="text-[#C9A86A] group-hover:text-[#A38D6B] transition-colors">✦</span>
                        一次揭示全部牌面
                        <span className="text-[#C9A86A] group-hover:text-[#A38D6B] transition-colors">✦</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Card detail panel ── */}
                <div className="w-full xl:w-72 2xl:w-80 flex-shrink-0">
                  {selectedCard !== null && revealedCards.has(selectedCard) ? (
                    <CardDetailPanel
                      position={SPREAD_POSITIONS[selectedCard]}
                      drawn={drawnCards[selectedCard]}
                    />
                  ) : (
                    <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 text-center">
                      <div className="text-2xl mb-3 opacity-30">✦</div>
                      <p className="text-xs tracking-[0.15em] text-[#31353A]/50"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        點擊牌面<br />查看解讀
                      </p>
                    </div>
                  )}

                  {/* Reading button */}
                  {revealedCards.size >= 5 && (
                    <button
                      onClick={() => {
                        setStep('reading');
                        setLlmInterpretation('');
                        interpretMutation.mutate({
                          question,
                          questionType,
                          cards: drawnCards.map((d, i) => ({
                            name: d.card.name,
                            en: d.card.en,
                            symbol: d.card.symbol,
                            meaning: d.reversed ? d.card.reversed : d.card.meaning,
                            reversed: d.reversed,
                            position: SPREAD_POSITIONS[i].label,
                            positionDesc: SPREAD_POSITIONS[i].desc,
                          })),
                        });
                      }}
                      className="w-full mt-4 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      查看完整解讀
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

                    {/* ── READING ────────────────────────────────────────────────────── */}
          {step === 'reading' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Your Reading
                </span>
                <h2 className="text-[15px] tracking-[0.14em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  完整解讀
                </h2>
              </div>

              {/* Cards summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                {drawnCards.map((drawn, idx) => (
                  <div key={idx} className="glass-panel rounded-xl p-3 border border-[#D1BE9B]/15 text-center">
                    <div className="text-[10px] tracking-[0.15em] text-[#D1BE9B] mb-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {SPREAD_POSITIONS[idx].label}
                    </div>
                    <div className="mx-auto mb-2 w-14 sm:w-16 aspect-[2/3]">
                      <CardFace card={drawn.card} reversed={drawn.reversed} />
                    </div>
                    <div className="text-[11px] tracking-[0.1em] text-[#31353A]/82"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {drawn.card.name}
                    </div>
                    {drawn.reversed && (
                      <div className="text-[10px] text-[#EAA8AC] mt-0.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        逆位
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI interpretation */}
              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[#D1BE9B]">✦</span>
                  <h3 className="text-[14px] tracking-[0.14em] text-[#31353A]/86"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    五牌陣星形解讀
                  </h3>
                </div>
                {interpretMutation.isPending && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="text-[#D1BE9B] text-3xl animate-spin">✦</div>
                    <p className="text-xs tracking-[0.2em] text-[#31353A]/58"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      Mochi 正在為你解讀牌陣能量...
                    </p>
                  </div>
                )}
                {interpretMutation.isError && (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#EAA8AC] tracking-wider">解讀暫時無法取得，請稍後再試。</p>
                  </div>
                )}
                {llmInterpretation && (
                  <div className="prose prose-sm max-w-none text-[13px] leading-[2.1] text-[#31353A]/80 tracking-wider
                    prose-headings:font-normal prose-headings:tracking-[0.08em] prose-headings:text-[#A38D6B]
                    prose-h3:text-[13px] prose-h3:font-medium prose-h3:mt-5 prose-h3:mb-1.5 prose-h3:pb-1 prose-h3:border-b prose-h3:border-[#D1BE9B]/25
                    prose-p:my-1.5 prose-p:text-[#31353A]/80
                    prose-strong:text-[#31353A]/90 prose-strong:font-medium
                    prose-ul:my-1.5 prose-li:my-0.5 prose-li:marker:text-[#D1BE9B]"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    <Streamdown>{llmInterpretation}</Streamdown>
                  </div>
                )}
              </div>

              {/* Product recommendation */}
              {recommendedProducts.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-8">
                  <p className="text-[11px] tracking-[0.3em] text-[#D1BE9B] mb-4 text-center"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    ◎ 根據牌陣能量，為你推薦
                  </p>
                  <div className="flex flex-col gap-3">
                    {recommendedProducts.map(product => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setStep('intro');
                    setDrawnCards([]);
                    setRevealedCards(new Set());
                    setSelectedCard(null);
                    setQuestion('');
                  }}
                  className="px-8 py-3 text-xs tracking-[0.25em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  重新占卜
                </button>
                <Link href="/quiz">
                  <button className="px-8 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    進行心理測驗 ✦
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CardSlot({
  idx, drawnCards, revealedCards, onReveal, selectedCard
}: {
  idx: number;
  drawnCards: ReturnType<typeof drawCards>;
  revealedCards: Set<number>;
  onReveal: (idx: number) => void;
  selectedCard: number | null;
}) {
  const revealed = revealedCards.has(idx);
  const isSelected = selectedCard === idx;
  const drawn = drawnCards[idx];

  return (
    <div
      className={`w-28 h-40 cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-110 drop-shadow-[0_4px_16px_rgba(209,190,155,0.5)]' : 'hover:scale-105'
      }`}
      onClick={() => onReveal(idx)}
      style={{ perspective: '600px' }}
    >
      <div
        className="w-full h-full transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <CardBack />
        </div>
        {/* Front */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {drawn && <CardFace card={drawn.card} reversed={drawn.reversed} />}
        </div>
      </div>
    </div>
  );
}

function CardDetailPanel({
  position, drawn
}: {
  position: typeof SPREAD_POSITIONS[0];
  drawn: ReturnType<typeof drawCards>[0];
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#D1BE9B]/20 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] tracking-[0.2em] px-2.5 py-1 rounded-full border border-[#D1BE9B]/30 text-[#D1BE9B]"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          {position.label}
        </span>
        {drawn.reversed && (
          <span className="text-[11px] tracking-[0.1em] text-[#EAA8AC]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            逆位
          </span>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <div className="w-32 flex-shrink-0">
          <CardFace card={drawn.card} reversed={drawn.reversed} />
        </div>
        <div>
          <div className="text-xl mb-1 opacity-60">{drawn.card.symbol}</div>
          <h4 className="text-sm tracking-[0.15em] text-[#31353A]/86 mb-0.5"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            {drawn.card.name}
          </h4>
          <p className="text-[11px] italic text-[#D1BE9B] tracking-wider"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {drawn.card.en}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-[#31353A]/58 tracking-wider mb-3 leading-[1.8]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
        {position.desc}
      </p>

      <div className="border-t border-[#D1BE9B]/15 pt-3">
        <p className="text-[12px] leading-[1.9] text-[#31353A]/72 tracking-wider"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
          {drawn.reversed ? drawn.card.reversed : drawn.card.meaning}
        </p>
      </div>
    </div>
  );
}
