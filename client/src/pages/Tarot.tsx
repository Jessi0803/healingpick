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

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { CatWaving, CatListening } from '@/components/CatElements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReadingFeedback from '@/components/ReadingFeedback';
import { Mail } from 'lucide-react';
import { recommendForCategory, recommendForTarot, type RecommendationCategory } from '@/data/recommend';
import { getContextualRecommendationReason, getProductImageStyle, type Product } from '@/data/products';
import { useRotatingText } from '@/hooks/useRotatingText';

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
  {
    id: 0,
    label: '第 1 張',
    readingLabel: '核心訊息',
    desc: '這次問題最主要的牌面重點',
  },
  {
    id: 1,
    label: '第 2 張',
    readingLabel: '情緒狀態',
    desc: '你或對方在這件事裡的真實感受',
  },
  {
    id: 2,
    label: '第 3 張',
    readingLabel: '需要看清的盲點',
    desc: '容易誤判、忽略或反覆卡住的地方',
  },
  {
    id: 3,
    label: '第 4 張',
    readingLabel: '可能走向',
    desc: '如果照目前狀態發展，較可能出現的方向',
  },
  {
    id: 4,
    label: '第 5 張',
    readingLabel: '行動提醒',
    desc: '接下來可以觀察或實際採取的一小步',
  },
];

const TAROT_WAITING_MESSAGES = [
  'Mochi 正在整理線索，但看起來像在發呆。',
  'Mochi 正在用貓掌把混亂拍成重點。',
  'Mochi 正在分析中，眼神很空，腦袋很忙。',
  'Mochi 正在把腦內毛線球慢慢解開。',
  'Mochi 正在看起來沒在想，其實很有想法。',
  'Mochi 正在慢慢靠近重點，像靠近一個紙箱。',
];

const TAROT_FOLLOW_UP_WAITING_MESSAGES = [
  'Mochi 正在整理線索，但看起來像在發呆。',
  'Mochi 正在用貓掌把混亂拍成重點。',
  'Mochi 正在分析中，眼神很空，腦袋很忙。',
  'Mochi 正在把腦內毛線球慢慢解開。',
  'Mochi 正在看起來沒在想，其實很有想法。',
  'Mochi 正在慢慢靠近重點，像靠近一個紙箱。',
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

const TAROT_CARD_IMAGE_URLS = Object.values(CARD_IMAGES);
const preloadedTarotImages = new Set<string>();

function preloadTarotCardImages(urls: string[]) {
  if (typeof window === 'undefined') return Promise.resolve();

  return Promise.all(urls.map((url) => {
    if (preloadedTarotImages.has(url)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        preloadedTarotImages.add(url);
        resolve();
      };
      image.onerror = () => resolve();
      image.src = url;
    });
  })).then(() => undefined);
}

function preloadTarotCardImagesWithTimeout(urls: string[], timeoutMs = 1200) {
  return Promise.race([
    preloadTarotCardImages(urls),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}

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
          loading="eager"
          decoding="async"
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

// Card back — branded moon seal with layered frame
const CardBack = () => (
  <svg viewBox="0 0 120 200" fill="none" className="w-full h-full drop-shadow-[0_12px_24px_rgba(49,53,58,0.18)]">
    {/* Solid fills only — no gradient/defs, which can render transparent
        inside the 3D flip container (preserve-3d + backface-visibility). */}
    <rect width="120" height="200" rx="11" fill="#31353A" />
    <rect x="4" y="4" width="112" height="192" rx="9" fill="#3D4144" />
    <rect x="8" y="8" width="104" height="184" rx="7" fill="#4A4641" fillOpacity="0.32" />
    {/* Soft centre halo, layered translucent discs instead of a gradient */}
    <circle cx="60" cy="100" r="50" fill="#D1BE9B" fillOpacity="0.10" />
    <circle cx="60" cy="100" r="36" fill="#F3E7CC" fillOpacity="0.12" />
    {/* Frames */}
    <rect x="6" y="6" width="108" height="188" rx="8" stroke="#F3E7CC" strokeWidth="1.2" opacity="0.88" />
    <rect x="12" y="12" width="96" height="176" rx="5" stroke="#D1BE9B" strokeWidth="0.7" strokeDasharray="2.4 3" opacity="0.75" />
    <path d="M26 25 H94 M26 175 H94" stroke="#F3E7CC" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
    <path d="M25 26 V66 M95 26 V66 M25 134 V174 M95 134 V174" stroke="#F3E7CC" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />
    {/* Corner moons */}
    {[[24, 25], [96, 25], [24, 175], [96, 175]].map(([x, y], i) => (
      <g key={`moon-${i}`} opacity="0.78">
        <circle cx={x} cy={y} r="3.6" fill="#F8F0DC" />
        <circle cx={x + (i % 2 === 0 ? 1.6 : -1.6)} cy={y - 0.4} r="3.5" fill="#3D4144" />
      </g>
    ))}
    {/* Sunburst rays */}
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i * 15 * Math.PI) / 180;
      return (
        <line key={`r${i}`}
          x1={60 + 18 * Math.cos(a)} y1={100 + 18 * Math.sin(a)}
          x2={60 + 43 * Math.cos(a)} y2={100 + 43 * Math.sin(a)}
          stroke="#F3E7CC" strokeWidth={i % 2 ? 0.35 : 0.72} strokeOpacity="0.62" />
      );
    })}
    {/* Concentric rings */}
    <circle cx="60" cy="100" r="44" stroke="#D1BE9B" strokeWidth="0.9" opacity="0.85" fill="none" />
    <circle cx="60" cy="100" r="33" stroke="#F3E7CC" strokeWidth="0.55" opacity="0.68" fill="none" />
    <circle cx="60" cy="100" r="20" stroke="#F5EAD5" strokeWidth="0.9" fill="#F8F0DC" fillOpacity="0.12" />
    {/* Inner petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <line key={`p${i}`}
          x1={60 + 7 * Math.cos(rad)} y1={100 + 7 * Math.sin(rad)}
          x2={60 + 20 * Math.cos(rad)} y2={100 + 20 * Math.sin(rad)}
          stroke="#F8F0DC" strokeWidth="0.75" strokeOpacity="0.84" />
      );
    })}
    {/* Centre moon disc */}
    <circle cx="60" cy="100" r="8.5" fill="#F8F0DC" fillOpacity="0.88" />
    <circle cx="63.2" cy="98" r="8.2" fill="#3D4144" fillOpacity="0.95" />
    <circle cx="60" cy="100" r="2.2" fill="#D1BE9B" fillOpacity="0.85" />
    {/* Scattered stars */}
    {[[60, 60], [60, 140], [34, 100], [86, 100], [43, 76], [77, 124], [77, 76], [43, 124], [36, 52], [84, 148]].map(([x, y], i) => (
      <path key={`s${i}`}
        d={`M${x} ${y - 2.4} L${x + 0.7} ${y - 0.7} L${x + 2.4} ${y} L${x + 0.7} ${y + 0.7} L${x} ${y + 2.4} L${x - 0.7} ${y + 0.7} L${x - 2.4} ${y} L${x - 0.7} ${y - 0.7} Z`}
        fill="#F8F1DE" fillOpacity="0.9" />
    ))}
    {/* Brand text */}
    <text x="60" y="184" textAnchor="middle" fontSize="7.68" fill="#F3E7CC" fillOpacity="0.72"
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
              <p className="text-[15px] tracking-[0.08em] text-[#31353A]/88 mt-1 truncate"
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
            <p className="text-[12px] tracking-[0.14em] text-[#A38D6B] mb-1"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              為什麼 Mochi 想到它
            </p>
            <p className="text-[13px] leading-[1.85] tracking-[0.05em] text-[#31353A]/68"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              {recommendationReason}
            </p>
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

type Step = 'intro' | 'question' | 'shuffle' | 'pick' | 'spread' | 'reading';
type FollowUpExchange = {
  question: string;
  answer: string;
};

type ReadingRecommendation = {
  category: RecommendationCategory;
  message: string;
  reason: string;
};

const QUESTION_PROMPTS: Record<string, string[]> = {
  love: [
    '我和他的關係接下來會怎麼發展？',
    '最近感情裡我最需要看清楚什麼？',
    '我該繼續等，還是慢慢放下？',
    '他現在對我的真實想法是什麼？',
    '這段曖昧關係有機會更進一步嗎？',
    '我們之間最大的阻礙是什麼？',
    '我該主動聯絡他，還是先保持距離？',
    '這段關係還有復合的可能嗎？',
    '我近期會遇到適合的新對象嗎？',
    '我在愛裡需要調整的課題是什麼？',
    '他還會再主動找我嗎？',
    '這段關係現在最真實的狀態是什麼？',
    '我對這個人是不是想太多了？',
    '我們之間還有沒有值得努力的空間？',
    '我該怎麼讓自己在感情裡更穩定？',
    '這個人適合進入我的生活嗎？',
    '我和他的緣分目前走到哪裡了？',
    '我該放慢腳步，還是勇敢表達？',
    '這段感情接下來三個月會有變化嗎？',
    '我真正想從這段關係裡得到什麼？',
  ],
  career: [
    '我現在適合換工作或調整方向嗎？',
    '工作卡住時，我下一步可以怎麼走？',
    '接下來事業上該衝刺，還是先穩住？',
    '目前這份工作還值得我繼續投入嗎？',
    '我適合接受眼前這個工作機會嗎？',
    '我和主管或同事之間該注意什麼？',
    '我的職涯方向哪裡需要重新整理？',
    '我適合創業、接案，還是穩定上班？',
    '近期工作上會出現新的轉機嗎？',
    '我該怎麼提升自己在工作中的價值？',
    '我現在的工作壓力真正來自哪裡？',
    '我該不該向主管提出自己的想法？',
    '這個合作或邀約對我有幫助嗎？',
    '我適合轉換跑道或學新技能嗎？',
    '我目前的努力會被看見嗎？',
    '我在職場裡最需要補強的是什麼？',
    '接下來面試或求職運勢如何？',
    '我該怎麼面對職場上的不安感？',
    '現在適合主動爭取更好的待遇嗎？',
    '我未來三個月工作重點是什麼？',
  ],
  wealth: [
    '最近財務和安全感該注意什麼？',
    '這個收入機會值得我投入嗎？',
    '我該怎麼面對目前的金錢壓力？',
    '我近期的財運走勢如何？',
    '我適合開始副業或增加收入來源嗎？',
    '現在適合投資、存錢，還是先觀望？',
    '我在金錢上最容易忽略的盲點是什麼？',
    '這筆花費或合作值得我投入嗎？',
    '我該如何改善自己的金錢安全感？',
    '接下來三個月財務上要注意什麼？',
    '我最近適合做比較大的金錢決定嗎？',
    '這個投資方向目前對我有利嗎？',
    '我該怎麼讓收入更穩定？',
    '我現在的財務盲點是什麼？',
    '我適合和別人談金錢合作嗎？',
    '我該先增加收入，還是先整理支出？',
    '近期有沒有需要避免的破財點？',
    '我對金錢的焦慮真正來自哪裡？',
    '這個副業方向值得我長期經營嗎？',
    '我該如何提升自己吸引資源的能力？',
  ],
  growth: [
    '我現在真正卡住的原因是什麼？',
    '我該怎麼整理現在的情緒？',
    '今天我最需要好好照顧自己的哪一部分？',
    '我現在最需要學會的課題是什麼？',
    '我該如何找回自己的自信和力量？',
    '我一直重複的內在模式是什麼？',
    '我該怎麼停止過度消耗自己？',
    '我近期適合培養哪一種能力？',
    '我該如何面對目前的迷惘感？',
    '我下一步最適合做的小改變是什麼？',
    '我現在最需要放下的是什麼？',
    '我該怎麼和過去的自己和解？',
    '我最近反覆焦慮的核心原因是什麼？',
    '我該如何重新建立生活節奏？',
    '我目前最需要相信自己的哪一點？',
    '我該怎麼讓內心更安定？',
    '我適合開始一個新的生活習慣嗎？',
    '我現在最需要被提醒的一句話是什麼？',
    '我該如何停止被別人的期待影響？',
    '接下來我適合把能量放在哪裡？',
  ],
  other: [
    '我現在最需要看清楚什麼？',
    '這件事接下來可能會怎麼發展？',
    '我可以用什麼心態面對目前的狀況？',
    '這個選擇對我來說比較適合嗎？',
    '我該相信直覺，還是再多觀察？',
    '目前影響這件事的關鍵因素是什麼？',
    '我需要注意身邊哪一種人際能量？',
    '這件事背後真正想提醒我什麼？',
    '我近期最容易忽略的訊息是什麼？',
    '如果我往前一步，可能會遇到什麼？',
    '這件事現在最好的處理方式是什麼？',
    '我該繼續觀察，還是做出決定？',
    '目前這個狀況對我最大的提醒是什麼？',
    '我是不是該換一個角度看這件事？',
    '這個人或這件事值得我投入心力嗎？',
    '我現在最該保護自己的哪一部分？',
    '我近期會遇到什麼新的機會嗎？',
    '這個選擇可能帶我走向哪裡？',
    '我該如何讓事情慢慢回到正軌？',
    '今天牌想給我的核心訊息是什麼？',
  ],
};

const QUESTION_CATEGORIES = [
  { id: 'love',   label: '感情', icon: '♥', questions: QUESTION_PROMPTS.love },
  { id: 'career', label: '工作', icon: '✦', questions: QUESTION_PROMPTS.career },
  { id: 'wealth', label: '財運', icon: '◇', questions: QUESTION_PROMPTS.wealth },
  { id: 'growth', label: '自我提升', icon: '☽', questions: QUESTION_PROMPTS.growth },
  { id: 'other', label: '其他', icon: '○', questions: QUESTION_PROMPTS.other },
];

const TAROT_RECOMMENDATION_MESSAGES: Record<string, string> = {
  love: '先看清關係裡真正讓你不安的地方。',
  career: '先整理方向，再決定下一步要不要衝。',
  wealth: '先穩住金錢節奏，再評估新的機會。',
  growth: '先把情緒照顧好，再要求自己前進。',
  other: '先看清真正困住你的核心，再決定下一步。',
};

const TAROT_PENDING_FOLLOW_UP_KEY = 'healingpick:tarot-pending-follow-up';
const TAROT_PENDING_START_KEY = 'healingpick:tarot-pending-start';
const FOLLOW_UP_LOGIN_PROMPT = {
  title: '登入會員，獲得更準確的個人解析',
  subtitle: '加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。',
};
const REPEAT_READING_LOGIN_PROMPT = {
  title: '登入會員，獲得更準確的個人解析',
  subtitle: '加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。',
};

export default function TarotPage() {
  const { isAuthenticated, login } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Pre-check the user's remaining quota before letting them start. Saves them
  // from walking through the whole flow only to be blocked at the last step.
  const handleStart = () => {
    const c = creditsQuery.data;
    if (
      c?.enabled &&
      !isAuthenticated &&
      c.dailyFreeQuota > 0 &&
      c.freeRemaining <= 0
    ) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(TAROT_PENDING_START_KEY, '1');
      }
      setPendingStartAfterLogin(true);
      void login(REPEAT_READING_LOGIN_PROMPT);
      return;
    }
    if (c?.enabled && (isAuthenticated || c.dailyFreeQuota > 0) && c.freeRemaining <= 0 && c.credits <= 0) {
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
    setStep('shuffle');
  };

  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('love');
  const [activeQuestionCategory, setActiveQuestionCategory] = useState('love');
  const [drawnCards, setDrawnCards] = useState<ReturnType<typeof drawCards>>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [isShufflingActive, setIsShufflingActive] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<typeof MAJOR_ARCANA>([]);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [llmInterpretation, setLlmInterpretation] = useState<string>('');
  const [readingRecommendation, setReadingRecommendation] = useState<ReadingRecommendation | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpExchanges, setFollowUpExchanges] = useState<FollowUpExchange[]>([]);
  const [pendingStartAfterLogin, setPendingStartAfterLogin] = useState(false);
  const [pendingFollowUpAfterLogin, setPendingFollowUpAfterLogin] = useState(false);
  const followUpRequestInFlightRef = useRef<string | null>(null);
  const completedFollowUpRequestKeysRef = useRef(new Set<string>());

  useEffect(() => {
    void preloadTarotCardImages(TAROT_CARD_IMAGE_URLS);
  }, []);

  const interpretMutation = trpc.tarot.interpret.useMutation({
    onSuccess: (data) => {
      setLlmInterpretation(data.interpretation);
      setReadingRecommendation(data.recommendation ?? null);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
    },
    onError: (error) => {
      if (error.message === 'NOT_SIGNED_IN') {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(TAROT_PENDING_START_KEY, '1');
        }
        setPendingStartAfterLogin(true);
        void login(REPEAT_READING_LOGIN_PROMPT);
      }
    },
  });
  const followUpMutation = trpc.tarot.followUp.useMutation({
    onSuccess: (data, variables) => {
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      completedFollowUpRequestKeysRef.current.add(requestKey);
      setFollowUpExchanges(prev => [
        ...prev,
        {
          question: variables.followUpQuestion,
          answer: data.answer,
        },
      ]);
      setFollowUpQuestion('');
      void creditsQuery.refetch();
    },
    onError: (error, variables) => {
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      completedFollowUpRequestKeysRef.current.delete(requestKey);

      if (error.message === 'NOT_SIGNED_IN') {
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return;
      }

      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast.error('可用次數不足', {
          description: '可以先購買點數，或稍後再回來問 Mochi。',
          action: {
            label: '購買點數',
            onClick: () => {
              window.location.href = '/buy';
            },
          },
          duration: 6000,
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      if (!variables) {
        followUpRequestInFlightRef.current = null;
        return;
      }
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      if (followUpRequestInFlightRef.current === requestKey) {
        followUpRequestInFlightRef.current = null;
      }
    },
  });
  const tarotWaitingMessage = useRotatingText(TAROT_WAITING_MESSAGES, interpretMutation.isPending);
  const tarotFollowUpWaitingMessage = useRotatingText(
    TAROT_FOLLOW_UP_WAITING_MESSAGES,
    followUpMutation.isPending
  );

  const getReadingCardsPayload = (cards = drawnCards) =>
    cards.map((d, i) => ({
      name: d.card.name,
      en: d.card.en,
      symbol: d.card.symbol,
      meaning: d.reversed ? d.card.reversed : d.card.meaning,
      reversed: d.reversed,
      position: SPREAD_POSITIONS[i].readingLabel,
      positionDesc: SPREAD_POSITIONS[i].desc,
    }));

  const submitFollowUp = useCallback((trimmedQuestion: string, creditState = creditsQuery.data) => {
    if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending) return false;

    if (creditState?.enabled) {
      if (!isAuthenticated) {
        setPendingFollowUpAfterLogin(true);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(TAROT_PENDING_FOLLOW_UP_KEY, JSON.stringify({
            question,
            questionType,
            cards: getReadingCardsPayload(),
            drawnCards,
            interpretation: llmInterpretation,
            followUpQuestion: trimmedQuestion,
            readingRecommendation,
          }));
        }
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return false;
      }

      // Auth may have just changed, so the credits query can briefly still
      // reflect the previous visitor/session. Let the server be the source of
      // truth for available quota and surface INSUFFICIENT_CREDITS there.
    }

    const cards = getReadingCardsPayload();
    const requestKey = JSON.stringify([
      question,
      questionType,
      trimmedQuestion,
      llmInterpretation,
      cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
    ]);
    if (
      followUpRequestInFlightRef.current === requestKey ||
      completedFollowUpRequestKeysRef.current.has(requestKey)
    ) {
      return true;
    }
    followUpRequestInFlightRef.current = requestKey;

    followUpMutation.mutate({
      question,
      questionType,
      cards,
      interpretation: llmInterpretation,
      followUpQuestion: trimmedQuestion,
    });
    return true;
  }, [
    creditsQuery.data,
    followUpMutation,
    getReadingCardsPayload,
    isAuthenticated,
    llmInterpretation,
    login,
    question,
    questionType,
  ]);

  const startReading = (cards = drawnCards) => {
    setStep('reading');
    setLlmInterpretation('');
    setReadingRecommendation(null);
    setFollowUpQuestion('');
    setFollowUpExchanges([]);
    setPendingFollowUpAfterLogin(false);
    interpretMutation.mutate({
      question,
      questionType,
      cards: getReadingCardsPayload(cards),
    });
  };

  const handleFollowUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending) return;

    submitFollowUp(trimmedQuestion);
  };

  useEffect(() => {
    if (!pendingFollowUpAfterLogin || !isAuthenticated || followUpMutation.isPending) return;
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion) {
      setPendingFollowUpAfterLogin(false);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);
    }

    void creditsQuery.refetch().then((result) => {
      const submitted = submitFollowUp(trimmedQuestion, result.data);
      if (submitted || isAuthenticated) setPendingFollowUpAfterLogin(false);
    });
  }, [
    creditsQuery,
    followUpMutation.isPending,
    followUpQuestion,
    isAuthenticated,
    pendingFollowUpAfterLogin,
    submitFollowUp,
  ]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const hasPendingStart = pendingStartAfterLogin || window.sessionStorage.getItem(TAROT_PENDING_START_KEY) === '1';
    if (!hasPendingStart) return;

    window.sessionStorage.removeItem(TAROT_PENDING_START_KEY);
    setPendingStartAfterLogin(false);
    setStep('shuffle');
  }, [isAuthenticated, pendingStartAfterLogin]);

  useEffect(() => {
    if (!isAuthenticated || followUpMutation.isPending || typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(TAROT_PENDING_FOLLOW_UP_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);

    try {
      const pending = JSON.parse(raw) as {
        question?: string;
        questionType?: string;
        cards?: ReturnType<typeof getReadingCardsPayload>;
        drawnCards?: ReturnType<typeof drawCards>;
        interpretation?: string;
        followUpQuestion?: string;
        readingRecommendation?: ReadingRecommendation | null;
      };
      const trimmedQuestion = pending.followUpQuestion?.trim();
      if (!trimmedQuestion || !pending.interpretation || !pending.cards?.length) return;

      setStep('reading');
      setQuestion(pending.question ?? '');
      setQuestionType(pending.questionType ?? 'love');
      setDrawnCards(pending.drawnCards ?? []);
      setLlmInterpretation(pending.interpretation);
      setReadingRecommendation(pending.readingRecommendation ?? null);
      setFollowUpQuestion(trimmedQuestion);

      void creditsQuery.refetch().then((result) => {
        const cards = pending.cards ?? [];
        const requestKey = JSON.stringify([
          pending.question ?? '',
          pending.questionType ?? 'love',
          trimmedQuestion,
          pending.interpretation ?? '',
          cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
        ]);
        if (
          followUpRequestInFlightRef.current === requestKey ||
          completedFollowUpRequestKeysRef.current.has(requestKey)
        ) {
          return;
        }
        followUpRequestInFlightRef.current = requestKey;

        followUpMutation.mutate({
          question: pending.question ?? '',
          questionType: pending.questionType ?? 'love',
          cards,
          interpretation: pending.interpretation ?? '',
          followUpQuestion: trimmedQuestion,
        });
      });
    } catch {
      window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);
    }
  }, [creditsQuery, followUpMutation, isAuthenticated]);

  // 開始持續洗牌動畫
  const handleStartShuffle = useCallback(() => {
    setIsShufflingActive(true);
  }, []);

  // 停止洗牌，展開牌組讓使用者選牌
  const handleStopShuffle = useCallback(() => {
    setIsShufflingActive(false);
    // 最終洗牌結果
    const finalDeck = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    setShuffledDeck(finalDeck);
    setPickedIndices([]);
    setStep('pick');
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
      const selectedImageUrls = cards
        .map(({ card }) => CARD_IMAGES[card.id])
        .filter(Boolean);
      setDrawnCards(cards);
      setRevealedCards(new Set([0, 1, 2, 3, 4]));
      setSelectedCard(0);
      void preloadTarotCardImagesWithTimeout(selectedImageUrls).then(() => {
        startReading(cards);
      });
    }
  }

  // 舊的 handleShuffle 保留相容性（不再使用）
  function handleShuffle() {
    setShuffling(true);
    setTimeout(() => {
      setDrawnCards(drawCards());
      setRevealedCards(new Set([0, 1, 2, 3, 4]));
      setSelectedCard(0);
      setShuffling(false);
      setStep('spread');
    }, 2000);
  }

  function handleRevealCard(idx: number) {
    setRevealedCards(prev => new Set(Array.from(prev).concat(idx)));
    setSelectedCard(idx);
  }

  const recommendedProducts = step === 'reading'
    ? readingRecommendation
      ? recommendForCategory(readingRecommendation.category)
      : recommendForTarot(questionType, question)
    : [];
  const tarotRecommendationMessage =
    readingRecommendation?.message ??
    TAROT_RECOMMENDATION_MESSAGES[questionType] ??
    TAROT_RECOMMENDATION_MESSAGES.growth;
  const handleQuestionTypeSelect = (type: string) => {
    setQuestionType(type);
    setActiveQuestionCategory(type);
  };

  const handlePopularQuestionClick = (prompt: string, type: string, nextStep?: Step) => {
    setQuestion(prompt.slice(0, 300));
    setQuestionType(type);
    setActiveQuestionCategory(type);
    if (nextStep) setStep(nextStep);
  };

  const renderPopularQuestions = (nextStep?: Step) => {
    const activeCategory =
      QUESTION_CATEGORIES.find(category => category.id === activeQuestionCategory) ??
      QUESTION_CATEGORIES[0];

    return (
      <div className="border-t border-[#D1BE9B]/14 pt-5 text-left">
        <div className="mb-4 text-center">
          <p className="text-[11px] tracking-[0.34em] text-[#D1BE9B] uppercase"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            Popular Questions
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#D1BE9B]/12 bg-[#FAF7F4]/42 p-1.5 sm:grid-cols-5">
          {QUESTION_CATEGORIES.map((category) => {
            const isActive = activeCategory.id === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveQuestionCategory(category.id)}
                className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-center transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'border-[#D1BE9B]/60 bg-white/78 text-[#8A7250] shadow-sm'
                    : 'border-transparent bg-transparent text-[#31353A]/58 hover:bg-white/50 hover:text-[#8A7250]'
                }`}
                aria-pressed={isActive}
              >
                <span className={`text-[13px] leading-none ${isActive ? 'text-[#A38D6B]' : 'text-[#D1BE9B]/70'}`}>
                  {category.icon}
                </span>
                <span className="text-[10.5px] tracking-[0.12em]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: isActive ? 500 : 300 }}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#D1BE9B]/14 bg-[#FFFDF8]/58 p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] tracking-[0.22em] text-[#8A7250]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
              {activeCategory.icon} {activeCategory.label}
            </p>
            <span className="text-[10px] tracking-[0.16em] text-[#A38D6B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
              向下滑看更多 ↓
            </span>
          </div>
          <div className="relative">
            <div className="animate-fade-in-up grid max-h-[318px] gap-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#D1BE9B66_transparent]">
              {activeCategory.questions.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePopularQuestionClick(prompt, activeCategory.id, nextStep)}
                  className="min-h-[54px] w-full rounded-xl border border-[#D1BE9B]/14 bg-white/62 px-3 py-2.5 text-left text-[11.5px] leading-[1.65] tracking-[0.06em] text-[#31353A]/72 transition-all duration-200 hover:border-[#D1BE9B]/55 hover:bg-[#D1BE9B]/10 hover:text-[#8A7250] active:scale-[0.99]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-1 h-10 rounded-b-xl bg-gradient-to-t from-[#FFFDF8] to-transparent" />
          </div>
        </div>
      </div>
    );
  };

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
                  <h1 className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] m-0"
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
                          ✦ 為什麼 AI 算的也可以很準？ ✦
                        </DialogTitle>
                      </DialogHeader>
                      <div className="text-[13px] text-[#31353A]/80 leading-[2.2] tracking-wider space-y-6 mt-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        <p>
                          很多人一開始會覺得：「算命不是要真人老師看才準嗎？AI 真的懂嗎？」<br/><br/>
                          其實塔羅不是隨便感覺一下而已。它會看牌義、牌陣位置、正逆位，也會搭配你的問題背景一起整理。
                        </p>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>✦ AI 厲害在哪裡？</h4>
                          <p>
                            AI 最強的地方，就是很會把大量規則和細節快速整理出來。它可以在很短時間內，把牌面、位置、組合關係和你的問題放在一起看。<br/><br/>
                            它不會因為累了就少看一點，也不會因為心情不同，讓前後解讀差太多。
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>✦ 不是亂給答案，而是照規則分析</h4>
                          <p>AI 算命不是隨便丟一段話給你，而是依照牌義、牌陣邏輯和你的問題去整理分析。</p>
                          <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong className="font-medium">穩定：</strong>每次都照同一套邏輯整理，不會忽略基本規則。</li>
                            <li><strong className="font-medium">細心：</strong>可以同時檢查很多細節，減少漏看的機會。</li>
                            <li><strong className="font-medium">完整：</strong>會把明顯的線索、需要注意的地方和可能性一起整理出來。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>✦ 為什麼有時候反而更不容易出錯？</h4>
                          <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>真人老師狀態不好時，可能講得比較少。</li>
                            <li>問題太多時，有些細節可能沒說到。</li>
                            <li>牌面太複雜時，可能漏掉某些組合。</li>
                            <li>不同老師經驗不同，解讀角度也可能差很多。</li>
                          </ul>
                        </div>

                        <div className="bg-[#D1BE9B]/10 p-5 rounded-2xl border border-[#D1BE9B]/20 text-[#31353A]/80 mt-8 shadow-sm">
                          <div className="font-medium text-[#A38D6B] mb-2 flex items-center gap-2 text-[14px]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                            <CatListening className="w-7 h-7" /> Mochi 的悄悄話：
                          </div>
                          <p className="text-[13px] leading-[2.2] tracking-wider italic" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            「在整理資料、比對規則、避免漏看這件事上，AI 真的很有優勢。<br/>
                            如果你想要的是穩定、完整、有依據的分析，AI 其實不是比較不準，反而可能比單純靠人工更不容易出錯。」
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

              <div className="max-w-3xl mx-auto mb-10 rounded-[30px] border border-[#D1BE9B]/18 bg-white/45 p-5 text-left shadow-[0_14px_42px_rgba(209,190,155,0.12)] md:p-7">
                <div className="mb-5 text-center">
                  <h2 className="text-lg md:text-xl tracking-[0.18em] text-[#31353A]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    你最近想問哪一件事？
                  </h2>
                </div>

                {renderPopularQuestions()}

                <div className="mt-5 mb-5 border-t border-[#D1BE9B]/14 pt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[13px] tracking-[0.18em] text-[#6F5A3A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                      你的問題
                    </p>
                    <span className="rounded-full border border-[#D1BE9B]/40 bg-[#D1BE9B]/16 px-2.5 py-1 text-[10.5px] tracking-[0.12em] text-[#8A7250]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                      可自行修改
                    </span>
                  </div>
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="例如：我跟他還有機會嗎？&#10;例如：我現在適合換工作嗎？"
                    rows={3}
                    className="w-full bg-[#FFFDF8]/70 border border-[#D1BE9B]/25 rounded-2xl px-4 py-3 text-[12px] text-[#31353A]/80 tracking-wider leading-[1.9] resize-none focus:outline-none focus:border-[#D1BE9B]/55 placeholder:text-[#31353A]/42"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <div className="mt-1 text-right text-[10px] tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: question.length >= 300 ? '#C9837A' : question.length >= 250 ? '#A38D6B' : '#31353A66' }}>
                    {question.length} / 300
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full py-3 text-xs tracking-[0.24em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  帶著這個問題抽牌
                </button>

                {creditsQuery.data?.enabled && (
                  <p className="mt-4 text-center text-[11px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    每天免費 2 次，00:00 重置；用完後完整解讀消耗 1 點。
                  </p>
                )}
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
                  如果你最近一直反覆想同一件事，卻怎麼想都想不出答案，很適合抽一次塔羅。<br/><br/>
                  它會幫你看見現在卡住的原因、你忽略的盲點，以及這件事接下來可以怎麼面對。
                </p>
              </div>

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
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[
                      { id: 'love',   label: '感情', icon: '♥' },
                      { id: 'career', label: '工作', icon: '✦' },
                      { id: 'wealth', label: '財運', icon: '◇' },
                      { id: 'growth', label: '自我提升', icon: '☽' },
                      { id: 'other', label: '其他', icon: '○' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleQuestionTypeSelect(t.id)}
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
                    onChange={e => setQuestion(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="例如：我與他的感情未來會如何發展？"
                    rows={3}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-3 text-xs text-[#31353A]/80 tracking-wider leading-[1.9] resize-none focus:outline-none focus:border-[#D1BE9B]/50 placeholder:text-[#31353A]/46"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <div className="mt-1 text-right text-[10px] tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: question.length >= 300 ? '#C9837A' : question.length >= 250 ? '#A38D6B' : '#31353A66' }}>
                    {question.length} / 300
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
                <p className="mt-2 text-[15px] text-[#31353A]/58 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '15px' }}>
                  {isShufflingActive ? '牌正在流動中，心裡默念你的問題；感覺到了就停下' : '深呼吸三次，把問題放在心裡，準備好後開始洗牌'}
                </p>
              </div>

              {/* Shuffling card animation */}
              <div className="relative flex justify-center items-center mb-12" style={{ height: '220px' }}>
                <div className={`absolute w-52 h-52 rounded-full border border-[#D1BE9B]/18 transition-all duration-700 ${
                  isShufflingActive ? 'scale-110 opacity-100 shadow-[0_0_42px_rgba(209,190,155,0.20)]' : 'scale-95 opacity-50'
                }`} />
                <div className="absolute w-32 h-32 rounded-full bg-[#D1BE9B]/8 blur-2xl" />
                {Array.from({ length: 9 }).map((_, i) => {
                  return (
                    <div
                      key={i}
                      className={`tarot-shuffle-card absolute w-[66px] h-[110px] md:w-[74px] md:h-[123px] drop-shadow-[0_12px_18px_rgba(49,53,58,0.24)] ${
                        isShufflingActive ? 'tarot-shuffle-card--active' : ''
                      }`}
                      style={{
                        '--tarot-idle-x': `${(i - 4) * 18}px`,
                        '--tarot-idle-y': `${Math.abs(i - 4) * 5}px`,
                        '--tarot-idle-rot': `${(i - 4) * 6}deg`,
                        '--tarot-shuffle-delay': `${i * -0.13}s`,
                        zIndex: i,
                        opacity: isShufflingActive ? 0.72 + (i % 3) * 0.1 : 1,
                      } as CSSProperties}
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
                  憑直覺選 5 張，不用想太久
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
                      className={`group relative cursor-pointer transition-all duration-300 ${
                        isPicked
                          ? 'opacity-95 scale-95 pointer-events-none'
                          : 'hover:scale-110 hover:-translate-y-2 hover:drop-shadow-[0_12px_26px_rgba(209,190,155,0.52)]'
                      }`}
                    >
                      <div
                        className="relative w-full aspect-[3/5] tarot-pick-float rounded-[11px]"
                        style={{ animationDelay: `${(deckIdx % 11) * 0.18}s` }}
                      >
                        <CardBack />
                        {!isPicked && (
                          <div className="pointer-events-none absolute inset-0 rounded-[11px] border border-[#F3E7CC]/0 transition-all duration-300 group-hover:border-[#F3E7CC]/80 group-hover:shadow-[0_0_0_3px_rgba(209,190,155,0.16)]" />
                        )}
                        {!isPicked && (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8F0DC]/92 px-2.5 py-1 text-[10px] tracking-[0.16em] text-[#3D4144] opacity-0 shadow-[0_8px_18px_rgba(49,53,58,0.22)] transition-all duration-300 group-hover:opacity-100"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                            選這張
                          </div>
                        )}
                      </div>
                      {isPicked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[11px] border border-[#F3E7CC]/70 bg-[#31353A]/72 shadow-[0_0_0_3px_rgba(209,190,155,0.12)] backdrop-blur-[1px] animate-fade-in-up">
                          <span className="w-6 h-6 rounded-full bg-[#D1BE9B] text-white text-[11px] flex items-center justify-center shadow-[0_4px_12px_rgba(209,190,155,0.45)]">
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
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  你抽到的牌
                </h2>
                {question && (
                  <p className="mt-2 text-xs italic text-[#31353A]/62 tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    「{question}」
                  </p>
                )}
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
                      {/* Top centre */}
                      <div className="col-start-2 row-start-1 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[1].label}</span>
                        <CardSlot idx={1} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Left */}
                      <div className="col-start-1 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[4].label}</span>
                        <CardSlot idx={4} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Centre */}
                      <div className="col-start-2 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#D1BE9B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>{SPREAD_POSITIONS[0].label}</span>
                        <CardSlot idx={0} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Right */}
                      <div className="col-start-3 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[2].label}</span>
                        <CardSlot idx={2} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Bottom centre */}
                      <div className="col-start-2 row-start-3 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[3].label}</span>
                        <CardSlot idx={3} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                    </div>
                  </div>

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
                      onClick={() => startReading()}
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
                    <div className="text-[9px] tracking-[0.14em] text-[#D1BE9B] mb-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {SPREAD_POSITIONS[idx].label}
                    </div>
                    <div className="mx-auto mb-2 w-20 sm:w-24 aspect-[2/3]">
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
                {question.trim() && (
                  <div className="mb-5 rounded-2xl border border-[#D1BE9B]/35 bg-[#FFFDF9] px-4 py-3 shadow-[0_8px_24px_rgba(209,190,155,0.12)]">
                    <p className="mb-1.5 text-[11px] tracking-[0.22em] text-[#8A7250]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                      你剛剛問的是：
                    </p>
                    <p className="text-[13px] leading-[1.9] tracking-[0.08em] text-[#31353A]/86"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 350 }}>
                      「{question.trim()}」
                    </p>
                  </div>
                )}
                {interpretMutation.isPending && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="text-[#D1BE9B] text-3xl animate-spin">✦</div>
                    <p className="text-xs tracking-[0.2em] text-[#31353A]/58"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {tarotWaitingMessage}
                    </p>
                  </div>
                )}
                {interpretMutation.isError && (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#EAA8AC] tracking-wider">解讀暫時無法取得，請稍後再試。</p>
                  </div>
                )}
                {llmInterpretation && (
                  <div>
                    <div className="prose prose-sm max-w-none text-[14.5px] leading-[2.1] text-[#31353A]/80 tracking-wider
                      prose-headings:font-normal prose-headings:tracking-[0.08em] prose-headings:text-[#A38D6B]
                      prose-h1:text-[16px] prose-h1:font-medium prose-h1:mt-8 prose-h1:mb-2 prose-h1:pb-1 prose-h1:border-b prose-h1:border-[#D1BE9B]/25
                      prose-h2:text-[16px] prose-h2:font-medium prose-h2:mt-8 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-[#D1BE9B]/25
                      prose-h3:text-[15px] prose-h3:font-medium prose-h3:mt-8 prose-h3:mb-2 prose-h3:pb-1 prose-h3:border-b prose-h3:border-[#D1BE9B]/25
                      [&_h1]:!text-[16px] [&_h1]:!leading-[2.1] [&_h1]:!font-medium [&_h1]:!tracking-[0.08em] [&_h1]:!text-[#A38D6B] [&_h1]:!mt-8 [&_h1]:!mb-2 [&_h1]:!pb-1 [&_h1]:!border-b [&_h1]:!border-[#D1BE9B]/25
                      [&_h2]:!text-[16px] [&_h2]:!leading-[2.1] [&_h2]:!font-medium [&_h2]:!tracking-[0.08em] [&_h2]:!text-[#A38D6B] [&_h2]:!mt-8 [&_h2]:!mb-2 [&_h2]:!pb-1 [&_h2]:!border-b [&_h2]:!border-[#D1BE9B]/25
                      [&_h3]:!text-[15px] [&_h3]:!leading-[2.1] [&_h3]:!font-medium [&_h3]:!tracking-[0.08em] [&_h3]:!text-[#A38D6B] [&_h3]:!mt-8 [&_h3]:!mb-2 [&_h3]:!pb-1 [&_h3]:!border-b [&_h3]:!border-[#D1BE9B]/25
                      prose-p:my-3 prose-p:text-[#31353A]/80
                      [&_p]:!text-[14.5px]
                      prose-strong:text-[#31353A]/90 prose-strong:font-medium
                      prose-ul:my-1.5 prose-li:my-0.5 prose-li:marker:text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      <Streamdown>{llmInterpretation}</Streamdown>
                    </div>

                    {recommendedProducts.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15">
                        <p className="text-[14px] tracking-[0.24em] text-[#6F5A3A] mb-3"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                          ◎ Mochi 為你挑的今日商品
                        </p>
                        <div className="mb-4 rounded-2xl border border-[#D1BE9B]/15 bg-white/35 px-4 py-3">
                          <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/70"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            根據你的牌面：{tarotRecommendationMessage}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          {recommendedProducts.map((product, index) => (
                            <ProductCard
                              key={product.slug}
                              product={product}
                              context={tarotRecommendationMessage}
                              role={index === 0 ? 'primary' : 'secondary'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Paid follow-up */}
              {llmInterpretation && (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-8">
                  <div className="flex flex-col gap-2 mb-4">
                    <p className="text-[13px] tracking-[0.2em] text-[#8A7250]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                      ◎ 想繼續問下去嗎
                    </p>
                    <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/62"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      Mochi 會基於剛剛的牌面，給你一段更貼近問題的補充回應。
                    </p>
                  </div>

                  <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-3">
                    <textarea
                      value={followUpQuestion}
                      onChange={(event) => setFollowUpQuestion(event.target.value.slice(0, 300))}
                      maxLength={300}
                      placeholder="例如：他現在還喜歡我嗎？我接下來該主動嗎？"
                      className="min-h-[72px] resize-none rounded-xl border border-[#D1BE9B]/20 bg-white/55 px-3.5 py-2.5 text-[12px] leading-[1.7] tracking-[0.06em] text-[#31353A]/80 outline-none transition-all duration-300 placeholder:text-[#31353A]/35 focus:border-[#D1BE9B]/55 focus:bg-white/75"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    />
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <span className="text-[11px] tracking-[0.1em] text-[#31353A]/45"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        {followUpQuestion.length}/300
                      </span>
                      <button
                        type="submit"
                        disabled={!followUpQuestion.trim() || followUpMutation.isPending}
                        className="px-6 py-2.5 text-[11px] tracking-[0.18em] bg-[#3D4144] text-[#FAF7F4] rounded-full transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#D1BE9B] hover:text-[#31353A]"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        {followUpMutation.isPending
                          ? tarotFollowUpWaitingMessage
                          : '請 Mochi 回應'}
                      </button>
                    </div>
                  </form>

                  {followUpMutation.isError && (
                    <p className="mt-3 text-[12px] tracking-[0.08em] text-[#EAA8AC]"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      追問暫時無法送出，請稍後再試。
                    </p>
                  )}

                  {followUpExchanges.length > 0 && (
                    <div className="mt-5 flex flex-col gap-3">
                      {followUpExchanges.map((item, index) => (
                        <div key={`${index}-${item.question}`} className="rounded-2xl border border-[#D1BE9B]/18 bg-white/45 px-5 py-4">
                          <div className="mb-3 flex flex-col gap-1">
                            <p className="text-[11px] tracking-[0.24em] text-[#A38D6B]"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              Mochi 的補充回應
                            </p>
                            <p className="text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/55"
                              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                              你的追問：{item.question}
                            </p>
                          </div>
                          <p className="text-[13px] leading-[2.05] tracking-[0.08em] text-[#31353A]/78 whitespace-pre-wrap"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {llmInterpretation && (
                <ReadingFeedback
                  source="tarot"
                  context={question.trim() ? `問題：${question.trim()}` : '未填寫具體問題'}
                />
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
                    setFollowUpQuestion('');
                    setFollowUpExchanges([]);
                  }}
                  className="w-full sm:w-44 px-8 py-3 text-xs tracking-[0.25em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  重新占卜
                </button>
                <Link href="/quiz" className="w-full sm:w-44">
                  <button className="w-full px-8 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
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
      className={`group relative w-28 h-40 cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-110 drop-shadow-[0_10px_28px_rgba(209,190,155,0.48)]' : 'hover:scale-105 hover:-translate-y-1'
      }`}
      onClick={() => onReveal(idx)}
      style={{ perspective: '600px' }}
    >
      <div className={`pointer-events-none absolute -inset-1 rounded-[14px] border transition-all duration-300 ${
        isSelected
          ? 'border-[#D1BE9B]/70 bg-[#D1BE9B]/10'
          : 'border-transparent group-hover:border-[#D1BE9B]/35'
      }`} />
      <div
        className="relative w-full h-full transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back */}
        <div className="absolute inset-0 rounded-[11px]" style={{ backfaceVisibility: 'hidden' }}>
          <CardBack />
        </div>
        {/* Front */}
        <div className="absolute inset-0 rounded-[11px] drop-shadow-[0_10px_24px_rgba(49,53,58,0.16)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
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
