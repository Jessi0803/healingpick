/**
 * SOUL EASE | Healing Pick — Zi Wei Dou Shu Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - Real iztro-powered astrolabe calculation
 *   - Traditional 12-palace grid chart
 *   - Morandi color-coded palaces
 *   - Real star placement from iztro
 *   - AI interpretation
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { CatListening, CatPeeking } from "@/components/CatElements";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReadingFeedback from "@/components/ReadingFeedback";
import {
  getMoodPlushieOpening,
  MoodClawMachine,
  type MoodPlushie,
} from "@/components/MoodClawMachine";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import {
  recommendForCategory,
  recommendForZiwei,
  type RecommendationCategory,
} from "@/data/recommend";
import {
  getContextualRecommendationReason,
  type Product,
} from "@/data/products";
import { useRotatingText } from "@/hooks/useRotatingText";
import { normalizeDateInput, toDateInputValue } from "@/lib/dateInput";

const ZIWEI_WAITING_MESSAGES = [
  "Mochi 正在整理線索，但看起來像在發呆。",
  "Mochi 正在用貓掌把混亂拍成重點。",
  "Mochi 正在分析中，眼神很空，腦袋很忙。",
  "Mochi 正在把腦內毛線球慢慢解開。",
  "Mochi 正在看起來沒在想，其實很有想法。",
  "Mochi 正在慢慢靠近重點，像靠近一個紙箱。",
];

const ZIWEI_FOLLOW_UP_WAITING_MESSAGES = [
  "Mochi 正在整理線索，但看起來像在發呆。",
  "Mochi 正在用貓掌把混亂拍成重點。",
  "Mochi 正在分析中，眼神很空，腦袋很忙。",
  "Mochi 正在把腦內毛線球慢慢解開。",
  "Mochi 正在看起來沒在想，其實很有想法。",
  "Mochi 正在慢慢靠近重點，像靠近一個紙箱。",
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  context,
  recommendationContext,
  role = "primary",
}: {
  product: Product;
  context?: string;
  recommendationContext?: string;
  role?: "primary" | "secondary";
}) {
  const meanings = product.meanings.slice(0, 3).map(m => m.title);
  const recommendationReason = getContextualRecommendationReason(
    product,
    recommendationContext ?? context,
    role,
    Boolean(recommendationContext)
  );
  const roleLabel = role === "primary" ? "最呼應此刻" : "想加強也可看";
  const productHref = product.href ?? `/shop/${product.slug}`;

  if (role === "secondary") {
    return (
      <Link href={productHref}>
        <div className="group flex items-center gap-3 rounded-2xl border border-[#D1BE9B]/22 bg-white/45 p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D1BE9B]/45">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EBE3]/40">
            <ProductImageWatermark
              product={product}
              alt={product.name}
              loading="lazy"
              imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              watermarkClassName="bottom-1 right-1 max-w-[calc(100%-0.5rem)] px-1.5 py-0.5 text-[7px]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[12.5px] tracking-[0.08em] text-[#31353A]/86"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              {product.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="text-[12px] text-[#A38D6B]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                NT$ {product.price.toLocaleString()}
              </span>
              {meanings[0] && (
                <span
                  className="truncate text-[10px] tracking-[0.12em] text-[#31353A]/55"
                  style={{
                    fontFamily: "Noto Sans TC, sans-serif",
                    fontWeight: 300,
                  }}
                >
                  #{meanings[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link href={productHref}>
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-[#D1BE9B]/25 bg-white/40 hover:border-[#D1BE9B]/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
        <div className="w-full h-48 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-[#F0EBE3]/40">
          <ProductImageWatermark
            product={product}
            alt={product.name}
            imageClassName="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="min-w-0">
              <span
                className="text-[9px] tracking-[0.12em] px-1.5 py-0.5 rounded-full bg-white/70 text-[#6F5A3A] border border-[#D1BE9B]/20"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                {roleLabel}
              </span>
              <p
                className="text-[14px] tracking-[0.08em] text-[#31353A]/88 truncate mt-1"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                {product.name}
              </p>
            </div>
            <p
              className="text-[11px] font-light text-[#D1BE9B] flex-shrink-0"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              NT$ {product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {meanings.map(m => (
              <span
                key={m}
                className="text-[9px] tracking-[0.08em] px-1.5 py-0.5 rounded-full bg-[#F0EBE3]/70 text-[#31353A]/62 border border-[#D1BE9B]/15"
                style={{
                  fontFamily: "Noto Sans TC, sans-serif",
                  fontWeight: 300,
                }}
              >
                {m}
              </span>
            ))}
          </div>
          <div className="mb-1.5 rounded-lg border border-[#D1BE9B]/15 bg-[#F8F4EC]/45 px-2.5 py-2">
            <p
              className="text-[12px] tracking-[0.14em] text-[#A38D6B] mb-1"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              為什麼 Mochi 想到它
            </p>
            <p
              className="whitespace-pre-line text-[13px] leading-[1.85] tracking-[0.05em] text-[#31353A]/68"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
              }}
            >
              {recommendationReason}
            </p>
          </div>
          <span
            className="text-[10px] tracking-[0.12em] text-[#A38D6B]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            看看這款商品 →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Time options ──────────────────────────────────────────────────────────────
const HOURS = [
  { label: "子時 (23:00–01:00)", value: 0 },
  { label: "丑時 (01:00–03:00)", value: 1 },
  { label: "寅時 (03:00–05:00)", value: 2 },
  { label: "卯時 (05:00–07:00)", value: 3 },
  { label: "辰時 (07:00–09:00)", value: 4 },
  { label: "巳時 (09:00–11:00)", value: 5 },
  { label: "午時 (11:00–13:00)", value: 6 },
  { label: "未時 (13:00–15:00)", value: 7 },
  { label: "申時 (15:00–17:00)", value: 8 },
  { label: "酉時 (17:00–19:00)", value: 9 },
  { label: "戌時 (19:00–21:00)", value: 10 },
  { label: "亥時 (21:00–23:00)", value: 11 },
];

const QUESTION_CATEGORIES = [
  {
    label: "感情",
    icon: "♡",
    questions: [
      "我的感情模式是什麼？",
      "我容易吸引什麼類型的人？",
      "我適合早婚還是晚婚？",
      "我目前感情運勢如何？",
      "我和對方適合長久嗎？",
      "這段關係的課題是什麼？",
      "我在感情裡最容易卡住哪裡？",
      "我今年有機會遇到正緣嗎？",
      "我該怎麼改善感情關係？",
      "我目前的桃花品質如何？",
      "這段關係還適合繼續嗎？",
      "我適合怎樣的人，才比較能走得長久？",
      "我的正緣通常會有什麼特質？",
      "這段關係對我的人生功課是什麼？",
      "我在婚姻或長期伴侶關係裡要注意什麼？",
      "我在感情裡是不是太容易委屈自己？",
      "我該如何判斷對方是不是真的適合我？",
      "我容易因為什麼原因錯過好緣分？",
      "我該如何讓自己在關係裡更有安全感？",
      "這段關係會帶給我成長還是消耗？",
    ],
  },
  {
    label: "工作",
    icon: "◈",
    questions: [
      "我適合發展哪一類型的職涯？",
      "我適合創業嗎？",
      "我今年工作運勢如何？",
      "我最近適合換工作嗎？",
      "我的命盤裡最明顯的事業優勢是什麼？",
      "我適合管理職、專業職，還是自由接案？",
      "我工作上容易卡在哪裡？",
      "我今年有沒有升遷或轉換機會？",
      "我現在的工作方向適合我嗎？",
      "我適合穩定上班、轉職，還是自己接案？",
      "為什麼我工作上常常很努力卻卡住？",
      "我近期適合換工作或等待時機嗎？",
      "我在職場上最容易被看見的優勢是什麼？",
      "我工作上的貴人通常會從哪裡出現？",
      "我現在事業上最需要補強的是什麼？",
      "我接下來幾年工作運勢的重點是什麼？",
      "我適合創業或經營個人品牌嗎？",
      "我現在工作上的壓力來源主要是什麼？",
      "我該繼續累積經驗，還是準備轉換跑道？",
      "我命盤裡適合發揮的專長是什麼？",
    ],
  },
  {
    label: "財運",
    icon: "✦",
    questions: [
      "我的財運強嗎？",
      "我適合靠什麼方式賺錢？",
      "我容易在哪方面破財？",
      "我今年有沒有貴人運？",
      "我適合投資、副業，還是穩定累積？",
      "我的財帛宮透露什麼金錢模式？",
      "我該如何讓財務更穩定？",
      "我接下來一年財運重點是什麼？",
      "我最近財務和安全感該注意什麼？",
      "我適合靠什麼方式累積收入？",
      "現在適合投資、副業，還是先整理金錢習慣？",
      "我的財運是適合穩定累積還是主動開創？",
      "我容易在哪些地方漏財或花太多？",
      "我適合透過什麼能力增加收入？",
      "我近期有沒有偏財或額外收入機會？",
      "我在金錢安全感上的盲點是什麼？",
      "我適合和別人合作賺錢嗎？",
      "我未來財務規劃最該注意哪個方向？",
      "我現在適合增加收入，還是先降低支出？",
      "我命盤裡的財運優勢是什麼？",
    ],
  },
  {
    label: "命盤性格",
    icon: "☽",
    questions: [
      "我的個性優勢是什麼？",
      "我的命盤裡最明顯的天賦是什麼？",
      "我命盤裡最容易被低估的能力是什麼？",
      "我容易在哪些地方消耗自己？",
      "我最需要修正的慣性是什麼？",
      "我適合往哪個方向發展？",
      "我目前最需要突破的內在限制是什麼？",
      "我該如何活得更像真正的自己？",
      "我現在最需要看見自己的哪個優勢？",
      "我接下來最適合怎麼調整生活節奏？",
      "我的命盤裡最值得培養的天賦是什麼？",
      "我適合用什麼方式讓自己更穩定？",
      "我該如何建立更清楚的界線？",
      "我近期最需要學會的課題是什麼？",
      "我該如何把壓力轉成前進的力量？",
      "我接下來適合培養哪一種生活習慣？",
      "我內在真正渴望的是什麼？",
      "我該如何停止一直懷疑自己？",
      "我目前最需要放下哪種舊模式？",
      "我適合用什麼方式整理情緒？",
    ],
  },
  {
    label: "家庭",
    icon: "⌂",
    questions: [
      "我的命盤裡家庭關係的課題是什麼？",
      "我和家人相處最需要注意什麼？",
      "我該如何面對家人的期待或壓力？",
      "我和父母之間的互動模式是什麼？",
      "我在家庭裡容易承擔什麼角色？",
      "我今年家裡會有需要特別處理的事嗎？",
      "我適合和家人同住，還是保持距離比較好？",
      "我的原生家庭對現在的我有什麼影響？",
      "我該如何建立和家人的界線？",
      "目前家庭狀態裡最需要我看懂什麼？",
    ],
  },
  {
    label: "人際",
    icon: "✧",
    questions: [
      "我在人際關係裡最容易遇到什麼課題？",
      "我容易吸引什麼類型的朋友或合作對象？",
      "我今年人際運勢如何？",
      "我命盤裡的貴人通常會從哪裡出現？",
      "我該如何分辨誰是真正支持我的人？",
      "我在團體裡適合扮演什麼角色？",
      "我目前這段人際關係值得繼續投入嗎？",
      "我在人際裡是不是太容易委屈自己？",
      "我該如何改善和朋友或同事的相處？",
      "我近期需要注意哪一種人際能量？",
    ],
  },
  {
    label: "學業",
    icon: "□",
    questions: [
      "我的學習能力和讀書優勢是什麼？",
      "我適合讀哪一類科系或領域？",
      "我今年考試或升學運勢如何？",
      "我適合繼續進修或考證照嗎？",
      "我讀書容易卡住的原因是什麼？",
      "我該如何提升專注力和學習效率？",
      "目前這個學習方向適合我嗎？",
      "我適合留在原本學校或環境，還是轉換方向？",
      "我近期最需要補強哪一種能力？",
      "我接下來學業上最需要注意什麼？",
    ],
  },
  {
    label: "健康",
    icon: "△",
    questions: [
      "我的命盤裡身心狀態需要注意什麼？",
      "我最近健康和作息最需要調整哪裡？",
      "我目前的壓力主要影響哪一部分？",
      "我容易因為什麼習慣消耗身體？",
      "我今年身心狀態的重點是什麼？",
      "我該如何讓生活節奏更穩定？",
      "我近期適合用什麼方式照顧自己？",
      "我現在的疲憊比較像身體累，還是心理壓力？",
      "我最容易忽略的健康提醒是什麼？",
      "接下來一段時間身心狀態會慢慢好轉嗎？",
    ],
  },
  {
    label: "流年方向",
    icon: "○",
    questions: [
      "我最近整體運勢如何？",
      "我現在的大限／流年重點是什麼？",
      "我今年最需要注意什麼？",
      "我接下來適合主動衝，還是先穩住？",
      "我的人生目前走到什麼階段？",
      "我現在做這個決定合適嗎？",
      "我今年有沒有搬家、轉換環境的機會？",
      "我近期最值得把力氣放在哪裡？",
      "我現在最需要看清楚的人生方向是什麼？",
      "這個選擇對我長期來說適合嗎？",
      "我近期運勢裡最需要注意什麼？",
      "我適合搬家、出國，或改變生活環境嗎？",
      "我最近身心狀態最需要照顧哪裡？",
      "我人生下一個重要轉折可能在哪裡？",
      "我現在最該先處理哪一件事？",
      "我接下來一年整體運勢的主題是什麼？",
      "我適合留在原本環境，還是往外發展？",
      "我最近反覆遇到的問題代表什麼功課？",
      "我命盤裡哪個宮位現在最值得注意？",
      "我目前適合主動改變，還是先觀察？",
    ],
  },
];

const PALACE_RECOMMENDATION_MESSAGES: Record<string, string> = {
  命宮: "先理解自己，再做選擇。",
  福德宮: "先照顧內在狀態，再安排生活節奏。",
  財帛宮: "先看懂你的金錢安全感，再談豐盛。",
  田宅宮: "先穩住生活根基，再慢慢累積資源。",
  官祿宮: "先整理事業定位，再決定要衝還是穩。",
  事業宮: "先整理事業定位，再決定要衝還是穩。",
  夫妻宮: "先看清關係模式，再回應對方。",
  子女宮: "先照顧心裡柔軟的期待，再做安排。",
  兄弟宮: "先看清互動裡的界線，再決定要給多少。",
  遷移宮: "先確認外在機會是否適合你，再往前走。",
  疾厄宮: "先把身心狀態穩住，再處理其他壓力。",
  父母宮: "先釐清責任與期待，再回到自己的步調。",
  交友宮: "先看清誰讓你舒服，再投入關係。",
  僕役宮: "先看清誰讓你舒服，再投入關係。",
};

function getZiweiRecommendationMessage(palaceName: string | null) {
  return palaceName
    ? (PALACE_RECOMMENDATION_MESSAGES[palaceName] ??
        "先看清目前最需要調整的地方，再做下一步。")
    : "先理解自己的整體節奏，再做選擇。";
}

// ─── Palace grid layout (traditional 4×4) ─────────────────────────────────────
// Row 0: P3  P4  P5  P6
// Row 1: P2  [center]   P7
// Row 2: P1  [center]   P8
// Row 3: P0  P11 P10 P9
const GRID_POSITIONS: Array<{ palaceIdx: number; row: number; col: number }> = [
  { palaceIdx: 3, row: 0, col: 0 },
  { palaceIdx: 4, row: 0, col: 1 },
  { palaceIdx: 5, row: 0, col: 2 },
  { palaceIdx: 6, row: 0, col: 3 },
  { palaceIdx: 2, row: 1, col: 0 },
  { palaceIdx: 7, row: 1, col: 3 },
  { palaceIdx: 1, row: 2, col: 0 },
  { palaceIdx: 8, row: 2, col: 3 },
  { palaceIdx: 0, row: 3, col: 0 },
  { palaceIdx: 11, row: 3, col: 1 },
  { palaceIdx: 10, row: 3, col: 2 },
  { palaceIdx: 9, row: 3, col: 3 },
];

// Palace colors (Morandi)
const PALACE_COLORS = [
  "#E5DFEE", // 命宮 - lavender
  "#EDE8E2", // 兄弟 - oat
  "#EDE0D8", // 夫妻 - rose
  "#E8EDE5", // 子女 - sage
  "#F5EDD8", // 財帛 - gold
  "#EDE8E2", // 疾厄
  "#E8EDE5", // 遷移
  "#EDE0D8", // 仆役
  "#E5DFEE", // 官祿
  "#F5EDD8", // 田宅
  "#EDE8E2", // 福德
  "#E8EDE5", // 父母
];

// Star color map (for major stars)
const STAR_COLORS: Record<string, string> = {
  紫微: "#9B8DC0",
  天機: "#8BA8C0",
  太陽: "#DEC180",
  武曲: "#A0B8A0",
  天同: "#C0A8B0",
  廉貞: "#C0988A",
  天府: "#B8C0A0",
  太陰: "#C0B8D0",
  貪狼: "#D0A8A0",
  巨門: "#A8A8C0",
  天相: "#A8C0B8",
  天梁: "#C0C0A0",
  七殺: "#C09898",
  破軍: "#A8B8C0",
};

// Brightness display
const BRIGHTNESS_STYLE: Record<string, { color: string; weight: string }> = {
  廟: { color: "#B8860B", weight: "700" },
  旺: { color: "#CC6600", weight: "700" },
  得: { color: "#4A7C59", weight: "400" },
  利: { color: "#3A6EA5", weight: "400" },
  平: { color: "#888888", weight: "300" },
  不: { color: "#AAAAAA", weight: "300" },
  陷: { color: "#CC4444", weight: "400" },
};

// Palace descriptions
const PALACE_DESCS: Record<string, { en: string; desc: string }> = {
  命宮: { en: "Life", desc: "代表個人性格、外貌、人生方向與整體命運格局" },
  兄弟: { en: "Siblings", desc: "手足關係、朋友緣分、合夥運勢" },
  夫妻: { en: "Marriage", desc: "感情婚姻、伴侶特質、桃花運" },
  子女: { en: "Children", desc: "子女緣分、創意能力、部屬關係" },
  財帛: { en: "Wealth", desc: "財富格局、理財方式、正財偏財" },
  疾厄: { en: "Health", desc: "身體健康、疾病傾向、心理狀態" },
  遷移: { en: "Travel", desc: "出行運勢、異鄉發展、貴人緣" },
  仆役: { en: "Friends", desc: "人際關係、社交圈、小人防範" },
  官祿: { en: "Career", desc: "事業格局、職場運勢、名聲地位" },
  田宅: { en: "Property", desc: "不動產、家庭環境、祖業繼承" },
  福德: { en: "Fortune", desc: "精神享受、福氣深淺、晚年生活" },
  父母: { en: "Parents", desc: "父母緣分、長輩關係、文書運" },
};

type Palace = {
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Array<{ name: string; brightness: string; type: string }>;
  minorStars: Array<{ name: string; brightness: string; type: string }>;
  adjectiveStars: Array<{ name: string; type: string }>;
  changsheng12: string;
  stage: { range: number[]; heavenlyStem: string };
};

type AstrolabeData = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  palaces: Palace[];
};

type ReadingRecommendation = {
  category: RecommendationCategory;
  message: string;
  reason: string;
};

type FollowUpExchange = {
  question: string;
  answer: string;
};

const ZIWEI_PENDING_FOLLOW_UP_KEY = "healingpick:ziwei-pending-follow-up";
const ZIWEI_PENDING_GENERATE_KEY = "healingpick:ziwei-pending-generate";
const MIN_BIRTH_DATE = "1900-01-01";
const FOLLOW_UP_LOGIN_PROMPT = {
  title: "登入會員，獲得更準確的個人解析",
  subtitle:
    "加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。",
};
const REPEAT_READING_LOGIN_PROMPT = {
  title: "登入會員，獲得更準確的個人解析",
  subtitle:
    "加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。",
};

export default function ZiweiPage() {
  const { user, isAuthenticated, login } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const [birthDate, setBirthDate] = useState("1998-08-03");
  const [hourValue, setHourValue] = useState("0");
  const [gender, setGender] = useState<"男" | "女">("女");
  const [focusArea, setFocusArea] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [activeQuestionCategory, setActiveQuestionCategory] = useState<
    string | null
  >(null);
  const [astrolabe, setAstrolabe] = useState<AstrolabeData | null>(null);
  const [selectedPalaceName, setSelectedPalaceName] = useState<string | null>(
    null
  );
  const [llmInterpretation, setLlmInterpretation] = useState("");
  const [caughtMoodPlushie, setCaughtMoodPlushie] =
    useState<MoodPlushie | null>(null);
  const [readingRecommendation, setReadingRecommendation] =
    useState<ReadingRecommendation | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpExchanges, setFollowUpExchanges] = useState<
    FollowUpExchange[]
  >([]);
  const [pendingFollowUpAfterLogin, setPendingFollowUpAfterLogin] =
    useState(false);
  const moodClawSectionRef = useRef<HTMLDivElement | null>(null);
  const readingResultRef = useRef<HTMLDivElement | null>(null);
  const followUpRequestInFlightRef = useRef<string | null>(null);
  const completedFollowUpRequestKeysRef = useRef(new Set<string>());
  const appliedProfileDefaultsRef = useRef(false);
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const focusAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (appliedProfileDefaultsRef.current || !user) return;
    appliedProfileDefaultsRef.current = true;
    if (user.birthDate) setBirthDate(user.birthDate);
    if (user.birthTime) setHourValue(user.birthTime);
    if (user.gender === "男" || user.gender === "女") setGender(user.gender);
  }, [user]);

  const handlePopularQuestionClick = (prompt: string) => {
    setFocusArea(prompt.slice(0, 300));
    const matchedCategory = QUESTION_CATEGORIES.find(category =>
      category.questions.includes(prompt)
    );
    if (matchedCategory) setActiveQuestionCategory(matchedCategory.label);
    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        focusAreaRef.current?.focus({ preventScroll: true });
      }, 450);
    });
  };

  const renderPopularQuestions = () => {
    const activeCategory =
      QUESTION_CATEGORIES.find(
        category => category.label === activeQuestionCategory
      ) ?? QUESTION_CATEGORIES[0];

    return (
      <div className="text-left">
        <div className="mb-4 text-center">
          <p
            className="text-[11px] tracking-[0.34em] text-[#D1BE9B] uppercase"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            Popular Questions
          </p>
          <p
            className="mt-2 text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/52"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          >
            可以先點選常見問題，也可以往下自己輸入想問的內容。
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-[#D1BE9B]/12 bg-[#FAF7F4]/42 p-1 sm:grid-cols-3 sm:gap-1.5 sm:p-1.5 lg:grid-cols-5">
          {QUESTION_CATEGORIES.map(category => {
            const isActive = activeCategory.label === category.label;

            return (
              <button
                key={category.label}
                type="button"
                onClick={() => setActiveQuestionCategory(category.label)}
                className={`flex min-h-[34px] items-center justify-center gap-1 rounded-xl border px-1 py-1.5 text-center transition-all duration-200 active:scale-[0.98] sm:min-h-[38px] sm:gap-1.5 sm:px-2 ${
                  isActive
                    ? "border-[#D1BE9B]/60 bg-white/78 text-[#8A7250] shadow-sm"
                    : "border-transparent bg-transparent text-[#31353A]/58 hover:bg-white/50 hover:text-[#8A7250]"
                }`}
                aria-pressed={isActive}
              >
                <span
                  className={`text-[13px] leading-none ${isActive ? "text-[#A38D6B]" : "text-[#D1BE9B]/70"}`}
                >
                  {category.icon}
                </span>
                <span
                  className="text-[10px] tracking-[0.08em] sm:text-[10.5px] sm:tracking-[0.12em]"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: isActive ? 500 : 300,
                  }}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#D1BE9B]/14 bg-[#FFFDF8]/58 p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p
              className="text-[12px] tracking-[0.22em] text-[#8A7250]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 500 }}
            >
              {activeCategory.icon} {activeCategory.label}
            </p>
            <span
              className="text-[10px] tracking-[0.16em] text-[#A38D6B]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 400 }}
            >
              向下滑看更多 ↓
            </span>
          </div>
          <div className="relative">
            <div className="animate-fade-in-up grid max-h-[318px] gap-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#D1BE9B66_transparent]">
              {activeCategory.questions.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePopularQuestionClick(prompt)}
                  className="min-h-[54px] w-full rounded-xl border border-[#D1BE9B]/14 bg-white/62 px-3 py-2.5 text-left text-[11.5px] leading-[1.65] tracking-[0.06em] text-[#31353A]/72 transition-all duration-200 hover:border-[#D1BE9B]/55 hover:bg-[#D1BE9B]/10 hover:text-[#8A7250] active:scale-[0.99]"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
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

  const savePendingGenerate = useCallback(() => {
    if (typeof window === "undefined") return;
    const today = toDateInputValue();
    window.sessionStorage.setItem(
      ZIWEI_PENDING_GENERATE_KEY,
      JSON.stringify({
        birthDate:
          normalizeDateInput(birthDate, { min: MIN_BIRTH_DATE, max: today }) ??
          birthDate,
        hourValue,
        gender,
        focusArea,
        partnerBirthDate: partnerBirthDate
          ? (normalizeDateInput(partnerBirthDate, {
              min: MIN_BIRTH_DATE,
              max: today,
            }) ?? partnerBirthDate)
          : "",
      })
    );
  }, [birthDate, focusArea, gender, hourValue, partnerBirthDate]);

  const scrollToSection = useCallback(
    (
      ref: RefObject<HTMLDivElement | null>,
      block: ScrollLogicalPosition = "center"
    ) => {
      const scroll = () =>
        ref.current?.scrollIntoView({ behavior: "smooth", block });
      window.requestAnimationFrame(() => {
        scroll();
        window.requestAnimationFrame(scroll);
      });
      window.setTimeout(scroll, 80);
      window.setTimeout(scroll, 220);
      window.setTimeout(scroll, 420);
    },
    []
  );

  const interpretMutation = trpc.ziwei.interpret.useMutation({
    onSuccess: data => {
      setAstrolabe(data.astrolabe as AstrolabeData);
      setLlmInterpretation(data.interpretation);
      setReadingRecommendation(data.recommendation ?? null);
    },
    onError: error => {
      if (error.message === "NOT_SIGNED_IN") {
        savePendingGenerate();
        void login(REPEAT_READING_LOGIN_PROMPT);
        return;
      }
      toast.error("命盤排列失敗，請稍後再試");
    },
  });
  const followUpMutation = trpc.ziwei.followUp.useMutation({
    onSuccess: (data, variables) => {
      const requestKey = JSON.stringify([
        variables.solarDate,
        variables.timeIndex,
        variables.gender,
        variables.focusArea ?? "",
        variables.followUpQuestion,
        variables.interpretation,
      ]);
      completedFollowUpRequestKeysRef.current.add(requestKey);
      setFollowUpExchanges(prev => [
        ...prev,
        {
          question: variables.followUpQuestion,
          answer: data.answer,
        },
      ]);
      setFollowUpQuestion("");
      void creditsQuery.refetch();
    },
    onError: (error, variables) => {
      const requestKey = JSON.stringify([
        variables.solarDate,
        variables.timeIndex,
        variables.gender,
        variables.focusArea ?? "",
        variables.followUpQuestion,
        variables.interpretation,
      ]);
      completedFollowUpRequestKeysRef.current.delete(requestKey);

      if (error.message === "NOT_SIGNED_IN") {
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return;
      }

      if (error.message === "INSUFFICIENT_CREDITS") {
        toast.error("可用次數不足", {
          description: "可以先購買點數，或稍後再回來問 Mochi。",
          action: {
            label: "購買點數",
            onClick: () => {
              window.location.href = "/buy";
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
        variables.solarDate,
        variables.timeIndex,
        variables.gender,
        variables.focusArea ?? "",
        variables.followUpQuestion,
        variables.interpretation,
      ]);
      if (followUpRequestInFlightRef.current === requestKey) {
        followUpRequestInFlightRef.current = null;
      }
    },
  });
  const ziweiWaitingMessage = useRotatingText(
    ZIWEI_WAITING_MESSAGES,
    interpretMutation.isPending
  );
  const ziweiFollowUpWaitingMessage = useRotatingText(
    ZIWEI_FOLLOW_UP_WAITING_MESSAGES,
    followUpMutation.isPending
  );

  useEffect(() => {
    if (interpretMutation.isPending) {
      setCaughtMoodPlushie(null);
    }
  }, [interpretMutation.isPending]);

  useEffect(() => {
    if (!interpretMutation.isPending && llmInterpretation) {
      scrollToSection(readingResultRef, "start");
    }
  }, [interpretMutation.isPending, llmInterpretation, scrollToSection]);

  function handleGenerate() {
    const today = toDateInputValue();
    const normalizedBirthDate = normalizeDateInput(birthDate, {
      min: MIN_BIRTH_DATE,
      max: today,
    });
    const normalizedPartnerBirthDate = partnerBirthDate
      ? normalizeDateInput(partnerBirthDate, {
          min: MIN_BIRTH_DATE,
          max: today,
        })
      : null;

    if (!normalizedBirthDate) {
      toast.error("請輸入有效的出生日期", {
        description: "可輸入 1998-08-03、1998/8/3 或 19980803",
      });
      return;
    }
    if (partnerBirthDate && !normalizedPartnerBirthDate) {
      toast.error("請輸入有效的對方生日", {
        description: "可輸入 1998-08-03、1998/8/3 或 19980803",
      });
      return;
    }
    setBirthDate(normalizedBirthDate);
    setPartnerBirthDate(normalizedPartnerBirthDate ?? "");

    const c = creditsQuery.data;
    if (
      c?.enabled &&
      !isAuthenticated &&
      c.dailyFreeQuota > 0 &&
      c.freeRemaining <= 0
    ) {
      savePendingGenerate();
      void login(REPEAT_READING_LOGIN_PROMPT);
      return;
    }
    if (
      c?.enabled &&
      (isAuthenticated || c.dailyFreeQuota > 0) &&
      c.freeRemaining <= 0 &&
      c.credits <= 0
    ) {
      toast.error("今日免費額度已用完 🐾", {
        description: isAuthenticated
          ? "可購買點數繼續看,或等每日 00:00 免費額度重置"
          : "註冊登入就能購買點數繼續看,或等每日 00:00 免費額度重置",
        action: {
          label: isAuthenticated ? "購買點數" : "註冊登入",
          onClick: () => {
            if (isAuthenticated) {
              window.location.href = "/buy";
            } else {
              void login();
            }
          },
        },
        duration: 6000,
      });
      return;
    }
    setAstrolabe(null);
    setLlmInterpretation("");
    setReadingRecommendation(null);
    setFollowUpQuestion("");
    setFollowUpExchanges([]);
    setPendingFollowUpAfterLogin(false);
    setSelectedPalaceName(null);
    interpretMutation.mutate({
      solarDate: normalizedBirthDate,
      timeIndex: parseInt(hourValue),
      gender,
      focusArea: focusArea || undefined,
      partnerSolarDate: normalizedPartnerBirthDate || undefined,
    });
  }

  const submitFollowUp = useCallback(
    (trimmedQuestion: string, creditState = creditsQuery.data) => {
      if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending)
        return false;

      if (creditState?.enabled) {
        if (!isAuthenticated) {
          setPendingFollowUpAfterLogin(true);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              ZIWEI_PENDING_FOLLOW_UP_KEY,
              JSON.stringify({
                birthDate,
                hourValue,
                gender,
                focusArea,
                astrolabe,
                interpretation: llmInterpretation,
                followUpQuestion: trimmedQuestion,
                readingRecommendation,
              })
            );
          }
          void login(FOLLOW_UP_LOGIN_PROMPT);
          return false;
        }

        // Auth may have just changed, so the credits query can briefly still
        // reflect the previous visitor/session. Let the server be the source of
        // truth for available quota and surface INSUFFICIENT_CREDITS there.
      }

      const timeIndex = parseInt(hourValue);
      const nextFocusArea = focusArea || undefined;
      const requestKey = JSON.stringify([
        birthDate,
        timeIndex,
        gender,
        nextFocusArea ?? "",
        trimmedQuestion,
        llmInterpretation,
      ]);
      if (
        followUpRequestInFlightRef.current === requestKey ||
        completedFollowUpRequestKeysRef.current.has(requestKey)
      ) {
        return true;
      }
      followUpRequestInFlightRef.current = requestKey;

      followUpMutation.mutate({
        solarDate: birthDate,
        timeIndex,
        gender,
        focusArea: nextFocusArea,
        interpretation: llmInterpretation,
        followUpQuestion: trimmedQuestion,
      });
      return true;
    },
    [
      birthDate,
      creditsQuery.data,
      focusArea,
      followUpMutation,
      gender,
      hourValue,
      isAuthenticated,
      llmInterpretation,
      login,
    ]
  );

  const handleFollowUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending)
      return;

    submitFollowUp(trimmedQuestion);
  };

  useEffect(() => {
    if (
      !isAuthenticated ||
      interpretMutation.isPending ||
      typeof window === "undefined"
    )
      return;

    const raw = window.sessionStorage.getItem(ZIWEI_PENDING_GENERATE_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(ZIWEI_PENDING_GENERATE_KEY);

    try {
      const pending = JSON.parse(raw) as {
        birthDate?: string;
        hourValue?: string;
        gender?: "男" | "女";
        focusArea?: string;
        partnerBirthDate?: string;
      };
      const today = toDateInputValue();
      const nextBirthDate =
        normalizeDateInput(pending.birthDate ?? "", {
          min: MIN_BIRTH_DATE,
          max: today,
        }) ?? birthDate;
      const nextHourValue = pending.hourValue || hourValue;
      const nextGender = pending.gender || gender;
      const nextFocusArea = pending.focusArea ?? "";
      const nextPartnerBirthDate = pending.partnerBirthDate
        ? (normalizeDateInput(pending.partnerBirthDate, {
            min: MIN_BIRTH_DATE,
            max: today,
          }) ?? "")
        : "";

      setBirthDate(nextBirthDate);
      setHourValue(nextHourValue);
      setGender(nextGender);
      setFocusArea(nextFocusArea);
      setPartnerBirthDate(nextPartnerBirthDate);
      setAstrolabe(null);
      setLlmInterpretation("");
      setReadingRecommendation(null);
      setFollowUpQuestion("");
      setFollowUpExchanges([]);
      setPendingFollowUpAfterLogin(false);
      setSelectedPalaceName(null);

      interpretMutation.mutate({
        solarDate: nextBirthDate,
        timeIndex: parseInt(nextHourValue),
        gender: nextGender,
        focusArea: nextFocusArea || undefined,
        partnerSolarDate: nextPartnerBirthDate || undefined,
      });
    } catch {
      window.sessionStorage.removeItem(ZIWEI_PENDING_GENERATE_KEY);
    }
  }, [
    birthDate,
    gender,
    hourValue,
    interpretMutation,
    interpretMutation.isPending,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (
      !pendingFollowUpAfterLogin ||
      !isAuthenticated ||
      followUpMutation.isPending
    )
      return;
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion) {
      setPendingFollowUpAfterLogin(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ZIWEI_PENDING_FOLLOW_UP_KEY);
    }

    void creditsQuery.refetch().then(result => {
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
    if (
      !isAuthenticated ||
      followUpMutation.isPending ||
      typeof window === "undefined"
    )
      return;

    const raw = window.sessionStorage.getItem(ZIWEI_PENDING_FOLLOW_UP_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(ZIWEI_PENDING_FOLLOW_UP_KEY);

    try {
      const pending = JSON.parse(raw) as {
        birthDate?: string;
        hourValue?: string;
        gender?: "男" | "女";
        focusArea?: string;
        astrolabe?: AstrolabeData | null;
        interpretation?: string;
        followUpQuestion?: string;
        readingRecommendation?: ReadingRecommendation | null;
      };
      const trimmedQuestion = pending.followUpQuestion?.trim();
      if (!trimmedQuestion || !pending.interpretation) return;

      const nextBirthDate =
        normalizeDateInput(pending.birthDate ?? "", {
          min: MIN_BIRTH_DATE,
          max: toDateInputValue(),
        }) ?? birthDate;
      const nextHourValue = pending.hourValue ?? hourValue;
      const nextGender = pending.gender ?? gender;
      const nextFocusArea = pending.focusArea ?? "";
      setBirthDate(nextBirthDate);
      setHourValue(nextHourValue);
      setGender(nextGender);
      setFocusArea(nextFocusArea);
      setAstrolabe(pending.astrolabe ?? null);
      setLlmInterpretation(pending.interpretation);
      setReadingRecommendation(pending.readingRecommendation ?? null);
      setFollowUpQuestion(trimmedQuestion);

      void creditsQuery.refetch().then(result => {
        const timeIndex = parseInt(nextHourValue);
        const nextFocusAreaValue = nextFocusArea || undefined;
        const requestKey = JSON.stringify([
          nextBirthDate,
          timeIndex,
          nextGender,
          nextFocusAreaValue ?? "",
          trimmedQuestion,
          pending.interpretation ?? "",
        ]);
        if (
          followUpRequestInFlightRef.current === requestKey ||
          completedFollowUpRequestKeysRef.current.has(requestKey)
        ) {
          return;
        }
        followUpRequestInFlightRef.current = requestKey;

        followUpMutation.mutate({
          solarDate: nextBirthDate,
          timeIndex,
          gender: nextGender,
          focusArea: nextFocusAreaValue,
          interpretation: pending.interpretation ?? "",
          followUpQuestion: trimmedQuestion,
        });
      });
    } catch {
      window.sessionStorage.removeItem(ZIWEI_PENDING_FOLLOW_UP_KEY);
    }
  }, [
    birthDate,
    creditsQuery,
    followUpMutation,
    gender,
    hourValue,
    isAuthenticated,
  ]);

  const selectedPalace =
    astrolabe?.palaces.find(p => p.name === selectedPalaceName) ?? null;
  const soulPalaceName =
    astrolabe?.palaces.find(p => p.name === "命宮")?.name ?? "命宮";
  const ziweiRecommendationMessage =
    readingRecommendation?.message ??
    getZiweiRecommendationMessage(selectedPalaceName);
  const ziweiRecommendedProducts = readingRecommendation
    ? recommendForCategory(readingRecommendation.category)
    : recommendForZiwei(selectedPalaceName, gender);
  const renderFollowUpSection = () => {
    if (!llmInterpretation) return null;

    return (
      <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20">
        <div className="flex flex-col gap-2 mb-4">
          <p
            className="text-[13px] tracking-[0.2em] text-[#8A7250]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 400 }}
          >
            ◎ 想繼續問下去嗎
          </p>
          <p
            className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/62"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          >
            Mochi 會基於同一份命盤，回答你更具體的延伸問題。
          </p>
        </div>

        <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-3">
          <textarea
            value={followUpQuestion}
            onChange={event =>
              setFollowUpQuestion(event.target.value.slice(0, 300))
            }
            maxLength={300}
            placeholder="例如：這段關係還有機會嗎？我近期工作該注意什麼？"
            className="min-h-[78px] resize-none rounded-xl border border-[#D1BE9B]/20 bg-white/55 px-3.5 py-2.5 text-[12px] leading-[1.7] tracking-[0.06em] text-[#31353A]/80 outline-none transition-all duration-300 placeholder:text-[#31353A]/35 focus:border-[#D1BE9B]/55 focus:bg-white/75"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span
              className="text-[11px] tracking-[0.1em] text-[#31353A]/45"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
              }}
            >
              {followUpQuestion.length}/300
            </span>
            <button
              type="submit"
              disabled={!followUpQuestion.trim() || followUpMutation.isPending}
              className="px-6 py-2.5 text-[11px] tracking-[0.18em] bg-[#3D4144] text-[#FAF7F4] rounded-full transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#D1BE9B] hover:text-[#31353A]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              {followUpMutation.isPending
                ? ziweiFollowUpWaitingMessage
                : "請 Mochi 回應"}
            </button>
          </div>
        </form>

        {followUpMutation.isError && (
          <p
            className="mt-3 text-[12px] tracking-[0.08em] text-[#EAA8AC]"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          >
            追問暫時無法送出，請稍後再試。
          </p>
        )}

        {followUpExchanges.length > 0 && (
          <div className="mt-5 flex flex-col gap-3">
            {followUpExchanges.map((item, index) => (
              <div
                key={`${index}-${item.question}`}
                className="rounded-2xl border border-[#D1BE9B]/18 bg-white/45 px-5 py-4"
              >
                <div className="mb-3 flex flex-col gap-1">
                  <p
                    className="text-[11px] tracking-[0.24em] text-[#A38D6B]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    Mochi 的深入回答
                  </p>
                  <p
                    className="text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/55"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    你的追問：{item.question}
                  </p>
                </div>
                <p
                  className="text-[13px] leading-[2.05] tracking-[0.08em] text-[#31353A]/78 whitespace-pre-wrap"
                  style={{
                    fontFamily: "Noto Sans TC, sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const renderInterpretationSection = (className = "") => (
    <div className={className}>
      <div className="flex items-center gap-3 mb-2 px-1">
        <CatListening className="w-12 h-14 flex-shrink-0" />
        <p
          className="text-[12px] tracking-[0.15em] text-[#D1BE9B]/50 italic"
          style={{
            fontFamily: "Noto Serif TC, serif",
            fontWeight: 200,
            color: "#766060",
            fontSize: "12px",
          }}
        >
          Mochi 認真地看著你的命盤… ✦
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[18px] text-[#D1BE9B]">☯</span>
          <h4
            className="text-[13px] tracking-[0.2em] text-[#31353A]/86"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            命盤整體解讀
          </h4>
        </div>
        {focusArea.trim() && (
          <div className="mb-5 rounded-2xl border border-[#D1BE9B]/35 bg-[#FFFDF9] px-4 py-3 shadow-[0_8px_24px_rgba(209,190,155,0.12)]">
            <p
              className="mb-1.5 text-[11px] tracking-[0.22em] text-[#8A7250]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 500 }}
            >
              這次想問的問題：
            </p>
            <p
              className="text-[13px] leading-[1.9] tracking-[0.08em] text-[#31353A]/86"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 350,
              }}
            >
              「{focusArea.trim()}」
            </p>
          </div>
        )}
        {interpretMutation.isPending && (
          <div
            ref={moodClawSectionRef}
            className="flex flex-col items-center py-6 gap-4"
          >
            <p
              className="text-[11px] tracking-[0.15em] text-[#31353A]/54"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              {ziweiWaitingMessage}
            </p>
            <MoodClawMachine onPrizeCaught={setCaughtMoodPlushie} />
          </div>
        )}
        {interpretMutation.isError && (
          <p className="text-[11px] text-[#EAA8AC] tracking-wider">
            解讀暫時無法取得，請稍後再試。
          </p>
        )}
        {!interpretMutation.isPending &&
          !interpretMutation.isError &&
          !llmInterpretation && (
            <p
              className="text-[12px] text-[#31353A]/50 tracking-wider text-center py-4"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              排盤完成後將自動生成 mochi 命盤解讀
            </p>
          )}
        {llmInterpretation && (
          <div ref={readingResultRef} className="animate-fade-in-up">
            <div
              className="ziwei-interpretation relative overflow-hidden text-[12.5px] leading-[2.2] text-[#31353A]/75 tracking-wider [&_p]:my-3"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
              }}
            >
              <span className="result-sweep" aria-hidden />
              {caughtMoodPlushie && (
                <p className="rounded-2xl border border-[#D1BE9B]/20 bg-[#FFFDF9]/75 px-4 py-3 text-[#6F5A3A]/82">
                  {getMoodPlushieOpening(caughtMoodPlushie, "ziwei")}
                </p>
              )}
              <Streamdown>{llmInterpretation}</Streamdown>
            </div>

            {ziweiRecommendedProducts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15">
                <p
                  className="text-[14px] tracking-[0.24em] text-[#6F5A3A] mb-3"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 500,
                  }}
                >
                  ◎ Mochi 為你挑的今日商品
                </p>
                <div className="mb-4 rounded-2xl border border-[#D1BE9B]/15 bg-white/35 px-4 py-3">
                  <p
                    className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/70"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    根據你的命盤：{ziweiRecommendationMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {ziweiRecommendedProducts[0] && (
                    <ProductCard
                      key={ziweiRecommendedProducts[0].slug}
                      product={ziweiRecommendedProducts[0]}
                      context={ziweiRecommendationMessage}
                      recommendationContext={readingRecommendation?.reason}
                      role="primary"
                    />
                  )}
                  {ziweiRecommendedProducts.length > 1 && (
                    <>
                      <div className="my-1 flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#D1BE9B]/25" />
                        <span
                          className="whitespace-nowrap text-[11px] tracking-[0.2em] text-[#A38D6B]/85"
                          style={{
                            fontFamily: "Noto Serif TC, serif",
                            fontWeight: 300,
                          }}
                        >
                          以下商品也呼應您的需求 ✦
                        </span>
                        <span className="h-px flex-1 bg-[#D1BE9B]/25" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {ziweiRecommendedProducts.slice(1).map(product => (
                          <ProductCard
                            key={product.slug}
                            product={product}
                            context={ziweiRecommendationMessage}
                            recommendationContext={readingRecommendation?.reason}
                            role="secondary"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedbackSection = () => {
    if (!llmInterpretation) return null;

    return (
      <ReadingFeedback
        source="ziwei"
        context={[
          `生日：${birthDate}`,
          `時辰索引：${hourValue}`,
          `性別：${gender}`,
          focusArea.trim() ? `問題：${focusArea.trim()}` : null,
        ]
          .filter(Boolean)
          .join("；")}
      />
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up w-full">
            <span
              className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase block"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              中國命理學
            </span>

            {/* flex justify-center keeps h1 perfectly centred; envelope is absolute so it never shifts the title */}
            <div className="relative mt-3 mb-3 flex justify-center items-center">
              <h1
                className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] m-0"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
              >
                紫微斗數命盤
              </h1>

              {/* Envelope next to title, referencing Tarot layout */}
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
                          <div
                            className="absolute top-0 left-0 h-full w-1/2 animate-wax-glint"
                            style={{
                              background:
                                "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)",
                            }}
                          />
                        </div>
                        {/* Wax seal style envelope icon */}
                        <div className="relative z-10 flex items-center justify-center text-[#A38D6B] group-hover:text-[#8A7250] transition-colors drop-shadow-sm scale-75 md:scale-90">
                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="3"
                              y="6"
                              width="18"
                              height="12"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            {/* Gold wax seal */}
                            <circle
                              cx="12"
                              cy="13.2"
                              r="3"
                              fill="#D1BE9B"
                              className="group-hover:fill-[#C9A86A] transition-colors"
                            />
                            {/* Elegant Star in the seal */}
                            <path
                              d="M12 11.2 L12.4 12.8 L14 13.2 L12.4 13.6 L12 15.2 L11.6 13.6 L10 13.2 L11.6 12.8 Z"
                              fill="#FDFBF7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <span
                        className="absolute top-[110%] bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#D1BE9B]/20 text-[#8A7250] text-[9px] md:text-[10px] tracking-[0.1em] px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        紫微小教室
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#FDFBF7] border-[#D1BE9B]/30"
                    style={{ fontFamily: "Noto Serif TC, serif" }}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-center text-lg tracking-[0.2em] font-extralight text-[#31353A] mb-2 mt-2">
                        ✦ 為什麼 AI 算的也可以很準？ ✦
                      </DialogTitle>
                    </DialogHeader>
                    <div
                      className="text-[13px] text-[#31353A]/80 leading-[2.2] tracking-wider space-y-6 mt-2"
                      style={{
                        fontFamily: "Noto Sans TC, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      <p>
                        很多人一開始會覺得：「算命不是要真人老師看才準嗎？AI
                        真的懂嗎？」
                        <br />
                        <br />
                        其實紫微不是隨便感覺一下而已。它會看命宮、十二宮、主星、副星、四化、流年和大限，這些都需要很多規則和細節一起比對。
                      </p>

                      <div>
                        <h4
                          className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2"
                          style={{ fontFamily: "Noto Serif TC, serif" }}
                        >
                          ✦ AI 厲害在哪裡？
                        </h4>
                        <p>
                          AI
                          最強的地方，就是很會把大量命盤資料快速整理出來。它可以在很短時間內，把星曜、宮位、四化和流年變化放在一起看。
                          <br />
                          <br />
                          它不會因為累了就少看一點，也不會因為心情不同，讓前後解讀差太多。
                        </p>
                      </div>

                      <div>
                        <h4
                          className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2"
                          style={{ fontFamily: "Noto Serif TC, serif" }}
                        >
                          ✦ 不是亂給答案，而是照規則分析
                        </h4>
                        <p>
                          AI
                          算命不是隨便丟一段話給你，而是依照命盤規則和你的問題去整理分析。
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                          <li>
                            <strong className="font-medium">穩定：</strong>
                            每次都照同一套邏輯整理，不會忽略基本規則。
                          </li>
                          <li>
                            <strong className="font-medium">細心：</strong>
                            可以同時檢查很多細節，減少漏看的機會。
                          </li>
                          <li>
                            <strong className="font-medium">完整：</strong>
                            會把明顯的線索、需要注意的地方和可能性一起整理出來。
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4
                          className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2"
                          style={{ fontFamily: "Noto Serif TC, serif" }}
                        >
                          ✦ 為什麼有時候反而更不容易出錯？
                        </h4>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                          <li>真人老師狀態不好時，可能講得比較少。</li>
                          <li>問題太多時，有些細節可能沒說到。</li>
                          <li>命盤太複雜時，可能漏掉某些組合。</li>
                          <li>不同老師經驗不同，解讀角度也可能差很多。</li>
                        </ul>
                      </div>

                      <div className="bg-[#D1BE9B]/10 p-5 rounded-2xl border border-[#D1BE9B]/20 text-[#31353A]/80 mt-8 shadow-sm">
                        <div
                          className="font-medium text-[#A38D6B] mb-2 flex items-center gap-2 text-[14px]"
                          style={{ fontFamily: "Noto Serif TC, serif" }}
                        >
                          Mochi 的悄悄話：
                        </div>
                        <p
                          className="text-[13px] leading-[2.2] tracking-wider italic"
                          style={{
                            fontFamily: "Noto Serif TC, serif",
                            fontWeight: 300,
                          }}
                        >
                          「在整理資料、比對規則、避免漏看這件事上，AI
                          真的很有優勢。
                          <br />
                          如果你想要的是穩定、完整、有依據的分析，AI
                          其實不是比較不準，反而可能比單純靠人工更不容易出錯。」
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {!astrolabe ? (
            /* ── FORM ──────────────────────────────────────────────────────── */
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <div className="mb-5 rounded-[28px] border border-[#D1BE9B]/18 bg-white/45 p-5 text-left shadow-[0_14px_42px_rgba(209,190,155,0.12)] md:p-6">
                <div className="mb-5 text-center">
                  <h2
                    className="text-lg md:text-xl tracking-[0.18em] text-[#31353A]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    你想先看哪一件事？
                  </h2>
                  <p
                    className="mt-2 text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/62"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    選一題最接近的狀態，下面可以再改成自己的問題。
                  </p>
                </div>

                {renderPopularQuestions()}
              </div>

              <div
                ref={formSectionRef}
                className="glass-panel scroll-mt-24 rounded-2xl p-6 md:p-8 border border-[#D1BE9B]/20"
              >
                <h2
                  className="text-sm tracking-[0.2em] text-[#31353A]/82 mb-6 text-center"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  輸入生辰資料
                </h2>

                {/* Gender */}
                <div className="mb-5">
                  <label
                    className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    性別
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: "女" as const, label: "女命", icon: "☽" },
                      { id: "男" as const, label: "男命", icon: "☀" },
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGender(g.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs tracking-[0.15em] transition-all duration-200 ${
                          gender === g.id
                            ? "border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]"
                            : "border-[#D1BE9B]/20 text-[#31353A]/68 hover:border-[#D1BE9B]/40"
                        }`}
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        <span className="opacity-70">{g.icon}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Birth date (solar) */}
                <div className="mb-4">
                  <label
                    className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-2"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    陽曆生日
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    placeholder="例如 1998-08-03 或 19980803"
                    value={birthDate}
                    onChange={e => {
                      const value = e.target.value;
                      setBirthDate(
                        normalizeDateInput(value, {
                          min: MIN_BIRTH_DATE,
                          max: toDateInputValue(),
                        }) ?? value
                      );
                    }}
                    onBlur={e => {
                      const normalized = normalizeDateInput(
                        e.currentTarget.value,
                        {
                          min: MIN_BIRTH_DATE,
                          max: toDateInputValue(),
                        }
                      );
                      if (normalized) setBirthDate(normalized);
                    }}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  />
                  <p
                    className="mt-1.5 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    ✦ 請輸入陽曆（國曆）生日，可打 1998-08-03 或 19980803
                  </p>
                </div>

                {/* Hour */}
                <div className="mb-5">
                  <label
                    className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-2"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    出生時辰
                  </label>
                  <select
                    value={hourValue}
                    onChange={e => setHourValue(e.target.value)}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50 appearance-none"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {HOURS.map(h => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                  <p
                    className="mt-1.5 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    ✦ 出生時辰影響命宮位置，請盡量精確填寫
                  </p>
                </div>

                {/* Focus area (optional) */}
                <div className="mb-6">
                  <label
                    className="mb-2 flex items-center justify-between gap-3"
                    style={{ fontFamily: "Noto Serif TC, serif" }}
                  >
                    <span className="text-[13px] tracking-[0.2em] text-[#8A7250] font-normal">
                      你的問題
                    </span>
                    <span className="rounded-full border border-[#D1BE9B]/30 bg-[#D1BE9B]/12 px-2.5 py-1 text-[11px] tracking-[0.12em] text-[#8A7250]">
                      可自行修改
                    </span>
                  </label>
                  <textarea
                    ref={focusAreaRef}
                    value={focusArea}
                    onChange={e => setFocusArea(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="例如：我現在適合換工作嗎？這段感情接下來該怎麼走？"
                    rows={3}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-3 text-xs leading-[1.9] text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50 resize-none placeholder:text-[#31353A]/42"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  />
                  <div
                    className="mt-1 text-right text-[10px] tracking-wider"
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      color:
                        focusArea.length >= 300
                          ? "#C9837A"
                          : focusArea.length >= 250
                            ? "#A38D6B"
                            : "#31353A66",
                    }}
                  >
                    {focusArea.length} / 300
                  </div>
                </div>

                {/* Partner birth date (optional, for relationship questions) */}
                <div className="mb-6">
                  <label
                    className="block text-[11px] tracking-[0.25em] text-[#8A7250] mb-2"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    對方生日（選填，問感情用）
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="例如 1998-08-03 或 19980803"
                    value={partnerBirthDate}
                    onChange={e => {
                      const value = e.target.value;
                      setPartnerBirthDate(
                        normalizeDateInput(value, {
                          min: MIN_BIRTH_DATE,
                          max: toDateInputValue(),
                        }) ?? value
                      );
                    }}
                    onBlur={e => {
                      if (!e.currentTarget.value) return;
                      const normalized = normalizeDateInput(
                        e.currentTarget.value,
                        {
                          min: MIN_BIRTH_DATE,
                          max: toDateInputValue(),
                        }
                      );
                      if (normalized) setPartnerBirthDate(normalized);
                    }}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  />
                  <p
                    className="mt-1.5 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    ✦ 只需年月日，不用時辰；填了問感情時會參考對方的個性方向
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={interpretMutation.isPending || !birthDate.trim()}
                  className="w-full py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95 disabled:opacity-60"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  {interpretMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">✦</span>
                      {ziweiWaitingMessage}
                    </span>
                  ) : (
                    "排出我的命盤"
                  )}
                </button>
                {interpretMutation.isPending && (
                  <div className="mt-5 flex justify-center">
                    <MoodClawMachine onPrizeCaught={setCaughtMoodPlushie} />
                  </div>
                )}
                {creditsQuery.data?.enabled && (
                  <p
                    className="mt-3 text-center text-[11px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    每天免費 2 次，00:00 重置；用完後命盤解讀消耗 1 點。
                  </p>
                )}
              </div>

              {/* Cat peeking at the form */}
              <div className="flex justify-end mt-4 mb-2 pr-2">
                <div className="flex flex-col items-center gap-1">
                  <CatPeeking className="w-14 h-16" side="left" />
                  <span
                    className="text-[10px] tracking-[0.15em] text-[#D1BE9B]/40"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    我也想看你的命盤 ✦
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ── CHART ─────────────────────────────────────────────────────── */
            <div className="animate-fade-in-up">
              <div className="flex flex-col gap-8">
                {renderInterpretationSection()}
                {renderFollowUpSection()}
                {renderFeedbackSection()}

                {/* Birth info banner */}
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { label: "農曆生日", value: astrolabe.lunarDate },
                    { label: "四柱", value: astrolabe.chineseDate },
                    {
                      label: "出生時辰",
                      value: `${astrolabe.time}（${astrolabe.timeRange}）`,
                    },
                    { label: "五行局", value: astrolabe.fiveElementsClass },
                    { label: "命主", value: astrolabe.soul },
                    { label: "身主", value: astrolabe.body },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="glass-panel rounded-xl px-4 py-2.5 border border-[#D1BE9B]/20 text-center"
                    >
                      <p
                        className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 200,
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs tracking-[0.1em] text-[#31353A]/82"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart + sidebar row */}
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                  {/* Chart grid */}
                  <div className="flex-1">
                    <p
                      className="mb-3 text-center text-[13px] tracking-[0.24em] text-[#8A7250]"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 400,
                      }}
                    >
                      ◎ 你的命盤
                    </p>
                    <div
                      className="grid gap-1.5"
                      style={{
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gridTemplateRows: "repeat(4, auto)",
                      }}
                    >
                      {GRID_POSITIONS.map(({ palaceIdx, row, col }) => {
                        const palace = astrolabe.palaces[palaceIdx];
                        if (!palace) return null;
                        const isLife = palace.name === "命宮";
                        const isSelected = selectedPalaceName === palace.name;

                        return (
                          <div
                            key={palace.name}
                            onClick={() =>
                              setSelectedPalaceName(
                                isSelected ? null : palace.name
                              )
                            }
                            className={`relative rounded-xl p-3 cursor-pointer border transition-all duration-300 ${
                              isSelected
                                ? "border-[#D1BE9B] shadow-[0_4px_20px_rgba(209,190,155,0.3)] scale-[1.02]"
                                : "border-[#D1BE9B]/20 hover:border-[#D1BE9B]/40 hover:scale-[1.01]"
                            }`}
                            style={{
                              background: PALACE_COLORS[palaceIdx] ?? "#EDE8E2",
                              gridColumn: col + 1,
                              gridRow: row + 1,
                              minHeight: "100px",
                            }}
                          >
                            {/* Life palace indicator */}
                            {isLife && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D1BE9B]/60 flex items-center justify-center">
                                <span className="text-[9px] text-[#31353A]">
                                  命
                                </span>
                              </div>
                            )}
                            {/* Body palace indicator */}
                            {palace.isBodyPalace && (
                              <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-rose-300/60 flex items-center justify-center">
                                <span className="text-[9px] text-rose-800">
                                  身
                                </span>
                              </div>
                            )}

                            {/* Palace name + stem/branch */}
                            <div className="mb-1.5">
                              <p
                                className="text-[11px] tracking-[0.15em] text-[#31353A]/86"
                                style={{
                                  fontFamily: "Noto Serif TC, serif",
                                  fontWeight: 300,
                                }}
                              >
                                {palace.name}
                              </p>
                              <p
                                className="text-[10px] tracking-wider text-[#31353A]/50"
                                style={{
                                  fontFamily: "Cormorant Garamond, serif",
                                }}
                              >
                                {palace.heavenlyStem}
                                {palace.earthlyBranch}
                              </p>
                            </div>

                            {/* Major stars */}
                            <div className="flex flex-wrap gap-1">
                              {palace.majorStars.map(star => {
                                const color =
                                  STAR_COLORS[star.name] ?? "#D1BE9B";
                                const bs = BRIGHTNESS_STYLE[star.brightness];
                                return (
                                  <span
                                    key={star.name}
                                    className="text-[10px] tracking-[0.05em] px-1.5 py-0.5 rounded-full"
                                    style={{
                                      background: color + "30",
                                      color: bs ? bs.color : color,
                                      border: `1px solid ${color}50`,
                                      fontFamily: "Noto Serif TC, serif",
                                      fontWeight: bs ? bs.weight : "300",
                                    }}
                                  >
                                    {star.name}
                                    {star.brightness
                                      ? `·${star.brightness}`
                                      : ""}
                                  </span>
                                );
                              })}
                              {palace.majorStars.length === 0 && (
                                <span
                                  className="text-[10px] text-[#31353A]/42 tracking-wider"
                                  style={{
                                    fontFamily: "Noto Serif TC, serif",
                                    fontWeight: 200,
                                  }}
                                >
                                  空宮
                                </span>
                              )}
                            </div>

                            {/* Minor stars (small) */}
                            {palace.minorStars.slice(0, 2).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-0.5">
                                {palace.minorStars.slice(0, 2).map(s => (
                                  <span
                                    key={s.name}
                                    className="text-[9px] text-[#31353A]/50"
                                    style={{
                                      fontFamily: "Noto Serif TC, serif",
                                      fontWeight: 200,
                                    }}
                                  >
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Stage */}
                            <div className="absolute bottom-1.5 right-2">
                              <span
                                className="text-[9px] text-[#31353A]/46"
                                style={{
                                  fontFamily: "Noto Serif TC, serif",
                                  fontWeight: 200,
                                }}
                              >
                                {palace.stage?.range?.[0]}–
                                {palace.stage?.range?.[1]}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Center cells */}
                      <div
                        className="rounded-xl border border-[#D1BE9B]/20 flex flex-col items-center justify-center"
                        style={{
                          gridColumn: "2 / 4",
                          gridRow: "2 / 4",
                          background: "rgba(250,247,244,0.8)",
                        }}
                      >
                        <div className="text-center p-4">
                          <p className="text-lg text-[#D1BE9B]/50 mb-2">✦</p>
                          <p
                            className="text-[11px] tracking-[0.2em] text-[#31353A]/62"
                            style={{
                              fontFamily: "Noto Serif TC, serif",
                              fontWeight: 200,
                            }}
                          >
                            {astrolabe.solarDate}
                          </p>
                          <p
                            className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/70 mt-1"
                            style={{
                              fontFamily: "Cormorant Garamond, serif",
                              fontStyle: "italic",
                            }}
                          >
                            {astrolabe.zodiac} · {astrolabe.sign}
                          </p>
                          <p
                            className="text-[10px] tracking-[0.1em] text-[#31353A]/50 mt-2"
                            style={{
                              fontFamily: "Noto Serif TC, serif",
                              fontWeight: 200,
                            }}
                          >
                            {gender}命
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Palace detail */}
                  <div className="xl:w-72">
                    {selectedPalace ? (
                      <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                PALACE_COLORS[
                                  astrolabe.palaces.findIndex(
                                    p => p.name === selectedPalace.name
                                  )
                                ] ?? "#EDE8E2",
                            }}
                          >
                            <span
                              className="text-[11px] text-[#31353A]/80"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 300,
                              }}
                            >
                              {selectedPalace.name.slice(0, 1)}
                            </span>
                          </div>
                          <div>
                            <p
                              className="text-sm tracking-[0.15em] text-[#31353A]/86"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 300,
                              }}
                            >
                              {selectedPalace.name}
                            </p>
                          </div>
                        </div>

                        <p
                          className="text-[12px] leading-[1.9] text-[#31353A]/68 tracking-wider mb-4"
                          style={{
                            fontFamily: "Noto Sans TC, sans-serif",
                            fontWeight: 300,
                          }}
                        >
                          {PALACE_DESCS[selectedPalace.name]?.desc ?? ""}
                        </p>

                        {/* Stem/Branch + Stage */}
                        <div className="flex gap-2 mb-3">
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                            style={{
                              fontFamily: "Noto Serif TC, serif",
                              fontWeight: 300,
                            }}
                          >
                            {selectedPalace.heavenlyStem}
                            {selectedPalace.earthlyBranch}
                          </span>
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                            style={{
                              fontFamily: "Noto Serif TC, serif",
                              fontWeight: 300,
                            }}
                          >
                            大限 {selectedPalace.stage?.range?.[0]}–
                            {selectedPalace.stage?.range?.[1]}
                          </span>
                          {selectedPalace.changsheng12 && (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 300,
                              }}
                            >
                              {selectedPalace.changsheng12}
                            </span>
                          )}
                        </div>

                        {selectedPalace.majorStars.length > 0 && (
                          <div className="border-t border-[#D1BE9B]/15 pt-4">
                            <p
                              className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-3"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 300,
                              }}
                            >
                              本宮主星
                            </p>
                            <div className="space-y-2">
                              {selectedPalace.majorStars.map(star => {
                                const color =
                                  STAR_COLORS[star.name] ?? "#D1BE9B";
                                return (
                                  <div
                                    key={star.name}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      className="text-[11px] px-2 py-0.5 rounded-full"
                                      style={{
                                        background: color + "25",
                                        color,
                                        border: `1px solid ${color}50`,
                                        fontFamily: "Noto Serif TC, serif",
                                        fontWeight: 300,
                                      }}
                                    >
                                      {star.name}
                                    </span>
                                    {star.brightness && (
                                      <span
                                        className="text-[11px]"
                                        style={{
                                          color:
                                            BRIGHTNESS_STYLE[star.brightness]
                                              ?.color ?? "#888",
                                          fontWeight:
                                            BRIGHTNESS_STYLE[star.brightness]
                                              ?.weight ?? "300",
                                        }}
                                      >
                                        {star.brightness}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedPalace.minorStars.length > 0 && (
                          <div className="border-t border-[#D1BE9B]/15 pt-3 mt-3">
                            <p
                              className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-2"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 300,
                              }}
                            >
                              輔星
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedPalace.minorStars.map(s => (
                                <span
                                  key={s.name}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D1BE9B]/10 text-[#31353A]/62 border border-[#D1BE9B]/20"
                                  style={{
                                    fontFamily: "Noto Serif TC, serif",
                                    fontWeight: 200,
                                  }}
                                >
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedPalace.majorStars.length === 0 && (
                          <div className="border-t border-[#D1BE9B]/15 pt-4">
                            <p
                              className="text-[12px] leading-[1.9] text-[#31353A]/58 tracking-wider italic"
                              style={{
                                fontFamily: "Noto Serif TC, serif",
                                fontWeight: 200,
                              }}
                            >
                              此宮為空宮，代表此方面的事務較為自由，
                              不受特定星曜的強烈影響，走向較為中性平和。
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setAstrolabe(null);
                          setSelectedPalaceName(null);
                          setLlmInterpretation("");
                          setReadingRecommendation(null);
                        }}
                        className="w-full px-5 py-3.5 text-xs leading-none tracking-[0.2em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        重新排盤
                      </button>
                      <Link href="/quiz">
                        <button
                          className="w-full px-5 py-3.5 text-xs leading-none tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                          style={{
                            fontFamily: "Noto Serif TC, serif",
                            fontWeight: 300,
                          }}
                        >
                          進行心理測驗 ✦
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
