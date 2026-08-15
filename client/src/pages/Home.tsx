/**
 * SOUL EASE | Mochi．crystal — Home Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Sections:
 *   1. Hero + 3D Book (星夢之書)
 *   2. Crystal Altar (水晶祭壇)
 *   3. Features Overview (三大功能入口)
 *   4. Divination Previews (塔羅 / 紫微)
 *   5. Shop Preview (療癒水晶)
 */

import { useState, useRef } from "react";
import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/Reveal";
import { CatPeeking } from "@/components/CatElements";
import { useAuth } from "@/_core/hooks/useAuth";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import SalePrice from "@/components/SalePrice";
import { PRODUCTS } from "@/data/products";
import ContactDialog from "@/components/ContactDialog";
import { ChevronDown, ExternalLink, Heart, Instagram, Sparkles } from "lucide-react";

// ─── Crystal SVG Components ──────────────────────────────────────────────────
const CrystalPurple = () => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    className="w-full h-full drop-shadow-[0_4px_16px_rgba(160,142,195,0.5)]"
  >
    <path
      d="M40 5 L65 30 L70 75 L40 95 L10 75 L15 30 Z"
      fill="url(#purpleGrad)"
      stroke="#A08EC3"
      strokeWidth="0.8"
    />
    <path d="M40 5 L65 30 L40 40 L15 30 Z" fill="rgba(229,223,238,0.6)" />
    <path d="M40 40 L65 30 L70 75 L40 95 Z" fill="rgba(160,142,195,0.3)" />
    <path d="M40 40 L15 30 L10 75 L40 95 Z" fill="rgba(180,162,215,0.4)" />
    <line
      x1="40"
      y1="5"
      x2="40"
      y2="95"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E5DFEE" />
        <stop offset="50%" stopColor="#C4B8DC" />
        <stop offset="100%" stopColor="#9B8DC0" />
      </linearGradient>
    </defs>
  </svg>
);

const CrystalRose = () => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    className="w-full h-full drop-shadow-[0_4px_16px_rgba(234,168,172,0.5)]"
  >
    <path
      d="M40 8 L62 28 L68 72 L40 92 L12 72 L18 28 Z"
      fill="url(#roseGrad)"
      stroke="#EAA8AC"
      strokeWidth="0.8"
    />
    <path d="M40 8 L62 28 L40 38 L18 28 Z" fill="rgba(255,235,235,0.6)" />
    <path d="M40 38 L62 28 L68 72 L40 92 Z" fill="rgba(234,168,172,0.3)" />
    <path d="M40 38 L18 28 L12 72 L40 92 Z" fill="rgba(244,188,192,0.4)" />
    <defs>
      <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDEAEA" />
        <stop offset="50%" stopColor="#F0C0C4" />
        <stop offset="100%" stopColor="#D89098" />
      </linearGradient>
    </defs>
  </svg>
);

const CrystalCitrine = () => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    className="w-full h-full drop-shadow-[0_4px_16px_rgba(222,193,128,0.5)]"
  >
    <path
      d="M40 6 L58 22 L72 65 L55 90 L25 90 L8 65 L22 22 Z"
      fill="url(#citrineGrad)"
      stroke="#DEC180"
      strokeWidth="0.8"
    />
    <path d="M40 6 L58 22 L40 35 L22 22 Z" fill="rgba(255,245,210,0.6)" />
    <path
      d="M40 35 L58 22 L72 65 L55 90 L40 70 Z"
      fill="rgba(222,193,128,0.3)"
    />
    <path
      d="M40 35 L22 22 L8 65 L25 90 L40 70 Z"
      fill="rgba(238,210,148,0.4)"
    />
    <defs>
      <linearGradient id="citrineGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFF5D0" />
        <stop offset="50%" stopColor="#EDD080" />
        <stop offset="100%" stopColor="#C8A040" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const mochiReadingOptions = [
  {
    title: "看今日運勢",
    desc: "想知道今天怎麼走比較順",
    href: "/fortune/daily",
  },
  {
    title: "排紫微命盤",
    desc: "想看自己的命盤與人生節奏",
    href: "/ziwei",
  },
  {
    title: "解一個夢",
    desc: "想理解夢裡反覆出現的訊號",
    href: "/dream",
  },
];

const features = [
  {
    icon: "🔮",
    title: "塔羅牌占卜",
    subtitle: "Tarot Reading",
    desc: "抽一組牌，看清現在的關係、選擇與心裡真正卡住的地方。",
    href: "/tarot",
    color: "#D8CEEA", // 薰衣草紫，比背景深一階
  },
  {
    icon: "✦",
    title: "客製化能量手鍊",
    subtitle: "Custom Healing Bracelet",
    desc: "依照你的願望、狀態與喜歡的色系，搭配一條專屬能量手鍊。",
    href: "/shop/custom-bracelet",
    color: "#E6DDD2",
  },
  {
    icon: "✧",
    title: "Mochi 靈感解讀",
    subtitle: "Daily · Zi Wei · Dream",
    desc: "每日運勢、紫微命盤、夢境訊息，讓 Mochi 依照你的狀態陪你看一看。",
    options: mochiReadingOptions,
    color: "#E8E4EE",
  },
];

const altarData: Record<
  string,
  {
    tag: string;
    hz: string;
    title: string;
    description: string;
    bgGradient: string;
    glowColor: string;
  }
> = {
  purple: {
    tag: "薰衣草紫水晶簇",
    hz: "432Hz ｜ 思緒留白",
    title: "靜心小角落：整理思緒與安放心緒",
    description:
      "紫水晶常被視為智慧與專注的代表晶石，帶來理性與清晰的能量，陪伴整理思緒與專注內在。若你近期覺得腦中聲音太多，這份紫色光芒會像一個安靜界線，提醒你把注意力慢慢收回自己身上。",
    bgGradient:
      "linear-gradient(135deg, #F2EDE8 0%, #EDE8E2 45%, #E6E0ED 100%)",
    glowColor: "rgba(160, 142, 195, 0.45)",
  },
  rose: {
    tag: "馬達加斯加粉晶",
    hz: "528Hz ｜ 溫柔連結",
    title: "溫柔的擁抱：招桃花與好人緣",
    description:
      "粉晶常被視為招桃花、人緣與溫柔魅力的代表晶石。它不是要你討好誰，而是提醒你把自己的柔軟與吸引力自然展現出來，讓關係互動多一點親和與舒服的距離。",
    bgGradient:
      "linear-gradient(135deg, #F2EDE8 0%, #EDE0D8 42%, #EDE8E2 100%)",
    glowColor: "rgba(234, 168, 172, 0.5)",
  },
  citrine: {
    tag: "天然黃水晶原礦",
    hz: "396Hz ｜ 太陽神經叢能量",
    title: "豐盛顯化：招財與自信光芒",
    description:
      "黃水晶常被視為招財、聚財與自我價值的代表晶石。如果你正在累積工作成果、整理金錢目標或需要行動亮度，它會提醒你相信自己的努力值得被看見，也值得被好好累積。",
    bgGradient:
      "linear-gradient(135deg, #F2EDE8 0%, #EDE5D4 40%, #EDE8E2 100%)",
    glowColor: "rgba(222, 193, 128, 0.45)",
  },
};

// ─── Products Preview ─────────────────────────────────────────────────────────
// Real products are loaded dynamically from PRODUCTS data.

// ─── Daily Energy Data ───────────────────────────────────────────────────────
const dailyEnergyPool = [
  {
    moon: "盈凸月",
    crystal: "紫水晶",
    keyword: "靜心･釋放",
    color: "#C4B8DC",
    quote: "深呼吸一口，今天也會沒事的！",
  },
  {
    moon: "滿月",
    crystal: "白水晶",
    keyword: "顯化･豐盛",
    color: "#D1BE9B",
    quote: "你想要的，宇宙正在幫你準備中！",
  },
  {
    moon: "眉月",
    crystal: "粉晶",
    keyword: "開始･愛",
    color: "#F0C0C4",
    quote: "新的開始就是現在，勇敢踏出第一步！",
  },
  {
    moon: "殘月",
    crystal: "黑碧璧",
    keyword: "清理･防護",
    color: "#8E8E8E",
    quote: "放下包裱，輕裝上陣，你可以的！",
  },
  {
    moon: "上弦月",
    crystal: "黃水晶",
    keyword: "行動･自信",
    color: "#EDD080",
    quote: "朝著目標前進吧！今天是你的日子！",
  },
];
const todayEnergy =
  dailyEnergyPool[new Date().getDay() % dailyEnergyPool.length];

function getDailyMochiVisitorCount(date = new Date()) {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;

  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }

  return 10 + (hash % 11);
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call login() or logout().
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [activeCrystal, setActiveCrystal] = useState<string | null>(null);
  const [bodyBg, setBodyBg] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMochiMenuOpen, setIsMochiMenuOpen] = useState(false);

  const handleBuyProduct = (productName: string) => {
    setSelectedProduct(productName);
    setIsContactOpen(true);
  };

  const audioCtxRef = useRef<AudioContext | null>(null);

  const crystalFrequencies: Record<
    string,
    { f1: number; f2: number; label: string }
  > = {
    purple: { f1: 432, f2: 648, label: "432Hz · 思緒留白" },
    rose: { f1: 528, f2: 792, label: "528Hz · 溫柔連結" },
    citrine: { f1: 396, f2: 594, label: "396Hz · 豐盛顯化" },
  };

  function playHarmonicBowl(type: string) {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const freq = crystalFrequencies[type] || { f1: 432, f2: 648 };
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq.f1, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq.f2, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
      }, 5600);
    } catch {}
  }

  function handleCrystalClick(type: string) {
    if (activeCrystal === type) {
      setActiveCrystal(null);
      setBodyBg("");
      return;
    }
    setActiveCrystal(type);
    setBodyBg(altarData[type].bgGradient);
    playHarmonicBowl(type);
  }

  const activeData = activeCrystal ? altarData[activeCrystal] : null;

  function scrollToTestimonials() {
    document
      .getElementById("testimonials-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  const dailyMochiVisitorCount = getDailyMochiVisitorCount();

  return (
    <PageLayout>
      {/* Dynamic background overlay */}
      {bodyBg && (
        <div
          className="fixed inset-0 z-[1] pointer-events-none transition-all duration-1000"
          style={{ background: bodyBg, opacity: 0.6 }}
        />
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="min-h-[100vh] flex flex-col justify-center items-center text-center px-6 relative pt-10 pb-16 overflow-hidden">
        {/* ── Large watermark text ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="text-[18vw] md:text-[14vw] font-light tracking-[0.3em] text-[#31353A]/[0.028] whitespace-nowrap"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 200 }}
          >
            SOUL EASE
          </span>
        </div>

        {/* ── Sacred geometry SVG ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-[min(80vw,520px)] h-[min(80vw,520px)] opacity-[0.045]"
            viewBox="0 0 400 400"
            fill="none"
          >
            {/* Outer circle */}
            <circle
              cx="200"
              cy="200"
              r="190"
              stroke="#D1BE9B"
              strokeWidth="0.6"
            />
            {/* Middle circle */}
            <circle
              cx="200"
              cy="200"
              r="140"
              stroke="#D1BE9B"
              strokeWidth="0.4"
              strokeDasharray="4 3"
            />
            {/* Inner circle */}
            <circle
              cx="200"
              cy="200"
              r="90"
              stroke="#D1BE9B"
              strokeWidth="0.5"
            />
            {/* Innermost circle */}
            <circle
              cx="200"
              cy="200"
              r="45"
              stroke="#D1BE9B"
              strokeWidth="0.4"
            />
            {/* Six-pointed star */}
            <polygon
              points="200,30 345,115 345,285 200,370 55,285 55,115"
              stroke="#D1BE9B"
              strokeWidth="0.5"
              fill="none"
            />
            <polygon
              points="200,370 55,285 55,115 200,30 345,115 345,285"
              stroke="#D1BE9B"
              strokeWidth="0.3"
              fill="none"
              transform="rotate(30 200 200)"
            />
            {/* Cross lines */}
            <line
              x1="200"
              y1="10"
              x2="200"
              y2="390"
              stroke="#D1BE9B"
              strokeWidth="0.3"
            />
            <line
              x1="10"
              y1="200"
              x2="390"
              y2="200"
              stroke="#D1BE9B"
              strokeWidth="0.3"
            />
            <line
              x1="55"
              y1="55"
              x2="345"
              y2="345"
              stroke="#D1BE9B"
              strokeWidth="0.25"
            />
            <line
              x1="345"
              y1="55"
              x2="55"
              y2="345"
              stroke="#D1BE9B"
              strokeWidth="0.25"
            />
            {/* Center dot */}
            <circle cx="200" cy="200" r="3" fill="#D1BE9B" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Multi-layer background glows */}
        <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] max-w-[500px] rounded-full bg-[#E6E0ED]/40 mix-blend-multiply blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[15%] right-[8%] w-[35vw] h-[35vw] max-w-[380px] rounded-full bg-[#F0C0C4]/30 mix-blend-multiply blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-[40%] right-[15%] w-[25vw] h-[25vw] max-w-[260px] rounded-full bg-[#EDD080]/20 mix-blend-multiply blur-2xl opacity-40 pointer-events-none" />

        {/* Floating crystal SVGs – 2 only for subtle effect */}
        <div
          className="absolute top-[14%] left-[6%] w-14 h-18 opacity-[0.14] pointer-events-none animate-float"
          style={{ animationDelay: "0s" }}
        >
          <CrystalPurple />
        </div>
        <div
          className="absolute bottom-[22%] right-[6%] w-11 h-[3.5rem] opacity-[0.11] pointer-events-none animate-float"
          style={{ animationDelay: "1.8s" }}
        >
          <CrystalCitrine />
        </div>
        {/* Cat – visible near top so users see it on load, clickable */}

        {/* Decorative gold vertical lines — fewer gold accents, each one stronger */}
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-[#D1BE9B]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-[#D1BE9B]/60 to-transparent pointer-events-none" />

        {/* ── 給正在思考的你 · floating note (left side) ── */}
        <div
          className="hidden lg:flex absolute left-8 top-28 flex-col items-start gap-1 pointer-events-none animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="glass-panel rounded-2xl px-5 py-4 border border-[#D1BE9B]/20 shadow-[0_4px_20px_rgba(209,190,155,0.1)] w-48 text-left">
            <p
              className="text-center text-[11.5px] tracking-[0.2em] text-[#A38D6B] mb-3"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              ♡ 給正在思考的你 ♡
            </p>
            <div className="w-full h-px bg-[#D1BE9B]/25 mb-3" />
            <ul
              className="space-y-2.5 text-[11.5px] leading-[1.6] text-[#31353A]/76 tracking-wider"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              <li>
                <span className="text-[#A38D6B] mr-1.5">☁︎</span>
                愛情該往哪裡走？
              </li>
              <li>
                <span className="text-[#A38D6B] mr-1.5">♡</span>工作該不該繼續？
              </li>
              <li>
                <span className="text-[#A38D6B] mr-1.5">𓇢𓆸</span>
                心裡的煩惱該跟誰說？
              </li>
              <li>
                <span className="text-[#A38D6B] mr-1.5">⟡</span>
                來找找屬於你的方向
              </li>
            </ul>
            <p
              className="text-center text-[12px] text-[#A38D6B]/70 mt-3"
              style={{ fontFamily: "Noto Serif TC, serif" }}
            >
              ♡
            </p>
          </div>
        </div>

        <div className="max-w-3xl z-10 animate-fade-in-up -mt-16 md:-mt-24">
          {/* Mochi portrait */}
          <div className="mb-4 flex translate-y-4 justify-center">
            <div className="mochi-portrait-wrap relative inline-flex">
              <span className="mochi-star mochi-star--one" aria-hidden="true">
                ✦
              </span>
              <span className="mochi-star mochi-star--two" aria-hidden="true">
                ✧
              </span>
              <span className="mochi-star mochi-star--three" aria-hidden="true">
                ✦
              </span>
              <img
                src="/cat.png"
                alt="Mochi"
                className="mochi-portrait-float h-32 w-auto object-contain drop-shadow-[0_14px_28px_rgba(163,141,107,0.22)] md:h-36"
              />
            </div>
          </div>

          {/* Main title */}
          <h1
            className="text-xl md:text-3xl leading-[1.6] md:leading-[1.8] mb-5 tracking-[0.2em] font-extralight text-[#31353A]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
          >
            Mochi 小宇宙
          </h1>

          <p
            className="text-xs md:text-sm text-[#31353A]/54 tracking-[0.15em] max-w-lg mx-auto mb-8"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            免費占卜完，自動推薦適合你的專屬手鍊 𓆩♡𓆪
          </p>

          <p
            className="mx-auto mb-8 inline-flex items-center justify-center rounded-full border border-[#D1BE9B]/28 bg-white/34 px-5 py-2 text-[11px] leading-[1.8] tracking-[0.18em] text-[#8A7250] shadow-[0_8px_28px_rgba(209,190,155,0.12)] backdrop-blur-sm"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            今日有 {dailyMochiVisitorCount} 人來找 Mochi 占卜
          </p>

          <div className="mx-auto grid w-full max-w-[17rem] grid-cols-1 gap-3 sm:max-w-4xl sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/tarot">
              <button
                className="group flex min-h-[3.5rem] w-full items-center justify-center gap-2.5 rounded-full border border-[#9B8DC0]/25 bg-[#E5DFEE]/28 px-4 py-2.5 text-[#6F6688] transition-all duration-500 hover:border-[#3D4144] hover:bg-[#3D4144] hover:text-white active:scale-95"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-[#D1BE9B]/45 bg-white/75 shadow-[0_5px_18px_rgba(209,190,155,0.14)] transition-colors duration-500 group-hover:border-white/25 group-hover:bg-white/90"
                  aria-hidden="true"
                >
                  <img
                    src="/gooday-logo.png"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="flex min-w-0 flex-col items-start leading-none">
                  <span className="text-[11px] tracking-[0.14em] sm:text-xs">
                    塔羅占卜
                  </span>
                  <span className="mt-1 text-[10px] tracking-[0.08em] text-[#6F6688]/68 transition-colors duration-500 group-hover:text-white/62 sm:tracking-[0.14em]">
                    日日好日
                    <span
                      className="ml-1.5 text-[12px] italic tracking-[0.08em] sm:text-[13px]"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      gooday
                    </span>
                  </span>
                </span>
              </button>
            </Link>
            <Link href="/shop/custom-bracelet">
              <button
                className="flex min-h-[3.5rem] w-full items-center justify-center rounded-full bg-[#D1BE9B] px-4 py-3 text-xs tracking-[0.14em] text-[#31353A] transition-all duration-500 hover:bg-[#3D4144] hover:text-[#FAF7F4] active:scale-95"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                客製化能量手鍊
              </button>
            </Link>
            <Link href="/wish-ritual">
              <button
                className="group flex min-h-[3.5rem] w-full items-center justify-center gap-2.5 rounded-full border border-[#D1BE9B]/34 bg-white/38 px-4 py-3 text-xs tracking-[0.14em] text-[#8A7250] shadow-[0_10px_28px_rgba(209,190,155,0.12)] backdrop-blur-sm transition-all duration-500 hover:border-[#A38D6B]/55 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>許願魔法儀式</span>
              </button>
            </Link>
            <button
              type="button"
              aria-expanded={isMochiMenuOpen}
              aria-controls="mochi-reading-menu"
              onClick={() => setIsMochiMenuOpen((open) => !open)}
              className="group flex min-h-[3.5rem] w-full items-center justify-center gap-2.5 rounded-full bg-[#3D4144] px-4 py-3 text-xs tracking-[0.14em] text-[#FAF7F4] transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Mochi 靈感解讀</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                  isMochiMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {isMochiMenuOpen && (
            <div
              id="mochi-reading-menu"
              className="mx-auto mt-3 grid w-full max-w-[17rem] grid-cols-1 gap-2 rounded-2xl border border-[#D1BE9B]/22 bg-white/48 p-3 shadow-[0_16px_38px_rgba(209,190,155,0.14)] backdrop-blur-sm animate-fade-in-up sm:max-w-3xl sm:grid-cols-3"
            >
              {mochiReadingOptions.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  className="group rounded-xl border border-[#D1BE9B]/18 bg-[#FAF7F4]/62 px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D1BE9B]/45 hover:bg-white"
                >
                  <span
                    className="block text-[12px] tracking-[0.14em] text-[#31353A]/86"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {option.title}
                  </span>
                  <span
                    className="mt-1 block text-[11px] leading-[1.7] tracking-[0.08em] text-[#31353A]/56"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {option.desc}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={scrollToTestimonials}
            className="group mt-6 inline-flex min-h-[3.75rem] items-center justify-center gap-3 rounded-full border border-[#D1BE9B]/45 bg-white/68 py-2.5 pl-2.5 pr-6 text-[12px] tracking-[0.16em] text-[#8A7250] shadow-[0_18px_46px_rgba(163,141,107,0.18)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[#A38D6B]/60 hover:bg-white/88 hover:text-[#31353A] hover:shadow-[0_22px_56px_rgba(163,141,107,0.24)] active:scale-95 sm:text-[13px] sm:tracking-[0.18em]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F8ECEE] text-[#C98990] shadow-[inset_0_0_0_1px_rgba(201,137,144,0.18),0_8px_20px_rgba(201,137,144,0.16)] transition-all duration-500 group-hover:bg-[#F4DCE0] group-hover:text-[#B8747C]"
              aria-hidden="true"
            >
              <Heart className="h-5 w-5 fill-current" strokeWidth={1.5} />
            </span>
            <span>看看大家怎麼被療癒</span>
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
          <span
            className="text-[10px] tracking-[0.3em] text-[#31353A]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
          >
            SCROLL
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[#D1BE9B] to-transparent" />
        </div>
      </section>

      {/* ── GOODAY PARTNER ───────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-10 md:py-16">
        <Reveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 border-y border-[#D1BE9B]/22 py-10 md:grid-cols-[0.85fr_1.15fr] md:py-12">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-[#D1BE9B]/35 bg-white/70 shadow-[0_16px_42px_rgba(209,190,155,0.18)] md:h-28 md:w-28">
              <img
                src="/gooday-logo.png"
                alt="日日好日塔羅牌占卜"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span
                className="text-[15px] italic tracking-[0.06em] text-[#A38D6B]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 400,
                }}
              >
                Gooday Tarot
              </span>
              <h2
                className="mt-2 text-lg font-extralight tracking-[0.18em] text-[#31353A] md:text-xl"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
              >
                真人塔羅師，一對一陪你看清問題
              </h2>
            </div>
          </div>

          <div>
            <p
              className="max-w-2xl text-[13px] leading-[2.1] tracking-[0.08em] text-[#31353A]/68 md:text-sm"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
              }}
            >
              HealingPick
              與「日日好日塔羅牌占卜」合作，提供真人塔羅師一對一諮詢，陪你看懂感情、事業、財運與人生方向。
            </p>
            <p
              className="mt-3 max-w-2xl text-[12px] leading-[2] tracking-[0.08em] text-[#8A7250]/82"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
              }}
            >
              多則顧客後續回饋，保留真實對話截圖感，讓你先看見解讀後如何被驗證。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/tarot">
                <button
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#3D4144] px-6 py-3 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-[0_10px_28px_rgba(49,53,58,0.16)] transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 sm:w-auto"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  立即預約占卜
                </button>
              </Link>
              <Link href="/tarot/reviews">
                <button
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#D1BE9B]/45 bg-white/42 px-6 py-3 text-xs tracking-[0.18em] text-[#8A7250] transition-all duration-500 hover:border-[#A38D6B]/55 hover:bg-white/70 hover:text-[#31353A] active:scale-95 sm:w-auto"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  查看顧客真實回饋
                </button>
              </Link>
              <a
                href="https://www.instagram.com/gooday_tarot_/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/45 bg-white/42 px-6 py-3 text-xs tracking-[0.18em] text-[#8A7250] transition-all duration-500 hover:border-[#A38D6B]/55 hover:bg-white/70 hover:text-[#31353A] active:scale-95 sm:w-auto"
                style={{
                  fontFamily: "Noto Serif TC, serif",
                  fontWeight: 300,
                }}
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                查看日日好日 IG
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <Reveal className="text-center mb-14">
            <span
              className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 400,
              }}
            >
              Our Services
            </span>
            <h2
              className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-3"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              靈性療癒的三種方式
            </h2>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3" viewBox="0 0 100 100" fill="none">
                <path
                  d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="reveal-child"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div
                  className="group relative flex h-full flex-col rounded-xl border border-[#D1BE9B]/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(209,190,155,0.18)]"
                  style={{
                    background: `linear-gradient(145deg, ${f.color}, #FAF7F4)`,
                  }}
                >
                  <div className="text-3xl mb-4 opacity-80">{f.icon}</div>
                  <h3
                    className="text-sm tracking-[0.15em] text-[#31353A]/90 mb-1"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[11px] tracking-[0.1em] text-[#D1BE9B] mb-3 italic"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {f.subtitle}
                  </p>
                  <p
                    className="text-[12px] leading-[1.8] text-[#31353A]/68 tracking-wider"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {f.desc}
                  </p>
                  {f.options?.length ? (
                    <div className="mt-5 grid gap-2">
                      {f.options.map((option) => (
                        <Link
                          key={option.href}
                          href={option.href}
                          className="rounded-full border border-white/48 bg-white/44 px-4 py-2.5 text-[11px] tracking-[0.13em] text-[#6F6688] transition-all duration-300 hover:bg-[#3D4144] hover:text-white"
                          style={{
                            fontFamily: "Noto Serif TC, serif",
                            fontWeight: 300,
                          }}
                        >
                          {option.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={f.href!}
                      className="mt-auto inline-flex items-center gap-1 pt-5 text-[#A38D6B] transition-colors duration-300 hover:text-[#31353A]"
                    >
                      <span
                        className="text-[11px] tracking-[0.2em]"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        前往
                      </span>
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── CRYSTAL ALTAR ─────────────────────────────────────────────────── */}
      <section
        id="altar-section"
        className="py-20 px-6 md:px-10 relative overflow-hidden"
      >
        {/* Mandala background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-[min(90vw,600px)] h-[min(90vw,600px)] opacity-[0.035]"
            viewBox="0 0 500 500"
            fill="none"
          >
            {[180, 150, 120, 90, 60, 30].map((r, i) => (
              <circle
                key={i}
                cx="250"
                cy="250"
                r={r}
                stroke="#D1BE9B"
                strokeWidth="0.5"
                strokeDasharray={i % 2 === 0 ? "6 4" : undefined}
              />
            ))}
            {[0, 30, 60, 90, 120, 150].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={250 + 30 * Math.cos(rad)}
                  y1={250 + 30 * Math.sin(rad)}
                  x2={250 + 185 * Math.cos(rad)}
                  y2={250 + 185 * Math.sin(rad)}
                  stroke="#D1BE9B"
                  strokeWidth="0.4"
                />
              );
            })}
            {[0, 45, 90, 135].map((deg, i) => (
              <ellipse
                key={i}
                cx="250"
                cy="250"
                rx="80"
                ry="30"
                stroke="#D1BE9B"
                strokeWidth="0.35"
                fill="none"
                transform={`rotate(${deg} 250 250)`}
              />
            ))}
            <circle
              cx="250"
              cy="250"
              r="8"
              stroke="#D1BE9B"
              strokeWidth="0.6"
              fill="none"
            />
            <circle cx="250" cy="250" r="3" fill="#D1BE9B" fillOpacity="0.4" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 400,
              }}
            >
              Crystal Altar
            </span>
            <h2
              className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-3"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              能量水晶
            </h2>
            <p
              className="mt-3 text-xs tracking-[0.15em] text-[#31353A]/58 max-w-sm mx-auto leading-[1.9]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              點擊水晶，感受它的頻率與能量
            </p>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3" viewBox="0 0 100 100" fill="none">
                <path
                  d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Crystals */}
            <div className="flex gap-8 md:gap-12 justify-center">
              {[
                { id: "purple", label: "紫水晶", Component: CrystalPurple },
                { id: "rose", label: "粉晶", Component: CrystalRose },
                { id: "citrine", label: "黃水晶", Component: CrystalCitrine },
              ].map(({ id, label, Component }) => (
                <div
                  key={id}
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-500 ${
                    activeCrystal === id ? "scale-125" : "hover:scale-110"
                  } ${activeCrystal === id ? "animate-float-1" : ""}`}
                  onClick={() => handleCrystalClick(id)}
                >
                  <div className="relative">
                    <div className="w-14 h-[72px] md:w-16 md:h-20">
                      <Component />
                    </div>
                    {/* Glow shadow reflection */}
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 rounded-full blur-md transition-all duration-500"
                      style={{
                        width: activeCrystal === id ? "3rem" : "2rem",
                        background:
                          id === "purple"
                            ? "rgba(160,142,195,0.5)"
                            : id === "rose"
                              ? "rgba(234,168,172,0.5)"
                              : "rgba(222,193,128,0.5)",
                        opacity: activeCrystal === id ? 0.8 : 0.3,
                      }}
                    />
                  </div>
                  <span
                    className={`text-[11px] tracking-[0.2em] transition-colors duration-300 mt-1 ${
                      activeCrystal === id
                        ? "text-[#D1BE9B]"
                        : "text-[#31353A]/62"
                    }`}
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Info panel */}
            <div className="flex-1 min-h-[160px]">
              {activeData ? (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/25 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[11px] tracking-[0.25em] px-2.5 py-1 rounded-full border border-[#D1BE9B]/40 text-[#A38D6B]"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 300,
                      }}
                    >
                      {activeData.tag}
                    </span>
                    <span
                      className="text-[11px] tracking-[0.2em] text-[#D1BE9B]"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 300,
                      }}
                    >
                      {activeData.hz}
                    </span>
                  </div>
                  <h3
                    className="text-sm tracking-[0.15em] text-[#31353A]/90 mb-3"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {activeData.title}
                  </h3>
                  <p
                    className="text-[12px] leading-[2] text-[#31353A]/72 tracking-wider"
                    style={{
                      fontFamily: "Noto Sans TC, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {activeData.description}
                  </p>
                  <Link href="/shop">
                    <button
                      className="mt-4 text-[11px] tracking-[0.2em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 300,
                      }}
                    >
                      查看相關商品 →
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 flex flex-col items-center justify-center min-h-[160px]">
                  <div className="text-2xl mb-3 opacity-30">✦</div>
                  <p
                    className="text-xs tracking-[0.2em] text-[#31353A]/50 text-center"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    點擊水晶
                    <br />
                    感受它的能量頻率
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col">
        {/* ── ZIWEI PREVIEW ─────────────────────────────────────────────────── */}
        <section className="order-2 py-20 px-6 md:px-10 bg-[#F2EDE8]/60">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Ziwei image */}
              <div className="order-2 lg:order-1 flex justify-center animate-fade-in-up delay-100">
                <div className="relative w-64 h-64 md:w-72 md:h-72">
                  {/* Peeking cat at top-right corner of chart */}
                  <div className="absolute -top-8 -right-6 z-10">
                    <CatPeeking className="w-14 h-16" side="left" />
                  </div>
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663525376407/gAsTZ8KCRUAuJ8Jah3ZYFq/ziwei-chart-jyKEJJhPyoHRbNoBt5L4ZH.webp"
                    alt="紫微斗數命盤"
                    className="w-full h-full object-cover rounded-xl shadow-[0_8px_32px_rgba(61,65,68,0.12)] border border-[#D1BE9B]/20"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#D1BE9B]/10 to-transparent pointer-events-none" />
                </div>
              </div>
              {/* Ziwei text */}
              <div className="order-1 lg:order-2 animate-fade-in-up delay-200">
                <span
                  className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontWeight: 400,
                  }}
                >
                  Zi Wei Dou Shu
                </span>
                <h2
                  className="text-lg md:text-xl tracking-[0.18em] font-extralight text-[#31353A] mt-2 mb-4"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 200,
                  }}
                >
                  紫微斗數命盤
                </h2>
                <p
                  className="text-[12px] leading-[2.1] text-[#31353A]/68 tracking-wider mb-6 max-w-sm"
                  style={{
                    fontFamily: "Noto Sans TC, sans-serif",
                    fontWeight: 300,
                  }}
                >
                  輸入出生年月日時，系統自動排出傳統十二宮位命盤。
                  從命宮、財帛宮到夫妻宮，全面解析你的人生格局、
                  個性特質與流年運勢。
                </p>
                <Link href="/ziwei">
                  <button
                    className="px-7 py-2.5 text-xs tracking-[0.25em] border border-[#3D4144]/15 bg-transparent rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    排出我的命盤
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── TAROT PREVIEW · Night Sky ─────────────────────────────────────── */}
        <section className="night-sky-section order-1 relative overflow-hidden py-24 px-6 md:px-10">
          {/* Stardust + moonlight */}
          <div className="night-stardust" aria-hidden="true" />
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-[#D1BE9B]/[0.08] blur-3xl pointer-events-none" />
          {/* Twinkling stars */}
          <span
            className="night-star text-[10px]"
            style={{ top: "14%", left: "8%" }}
          >
            ✦
          </span>
          <span
            className="night-star text-[8px]"
            style={{ top: "70%", left: "14%", animationDelay: "-2s" }}
          >
            ✦
          </span>
          <span
            className="night-star text-[9px]"
            style={{ top: "22%", right: "10%", animationDelay: "-3.5s" }}
          >
            ✦
          </span>
          <span
            className="night-star text-[8px]"
            style={{ bottom: "16%", right: "20%", animationDelay: "-1.2s" }}
          >
            ✦
          </span>

          <div className="max-w-6xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Tarot */}
              <div className="animate-fade-in-up">
                <span
                  className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontWeight: 400,
                  }}
                >
                  Tarot Reading
                </span>
                <h2
                  className="text-lg md:text-xl tracking-[0.18em] font-extralight text-[#F2EDE6] mt-2 mb-4"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 200,
                  }}
                >
                  塔羅牌占卜
                </h2>
                <p
                  className="text-[12px] leading-[2.1] text-[#F2EDE6]/64 tracking-wider mb-6 max-w-sm"
                  style={{
                    fontFamily: "Noto Sans TC, sans-serif",
                    fontWeight: 300,
                    fontSize: "12px",
                  }}
                >
                  採用凱爾特十字完整牌陣，十張牌從不同維度解析你的問題——
                  過去的根源、現在的阻礙、潛意識的渴望，以及最終的可能結果。
                </p>
                <div className="flex gap-3 mb-8">
                  {["過去", "現在", "未來", "潛意識", "建議"].map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] tracking-[0.15em] px-2.5 py-1 rounded-full bg-white/[0.06] text-[#EFE9DC]/75 border border-[#D1BE9B]/30 backdrop-blur-sm"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 300,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href="/tarot">
                  <button
                    className="px-7 py-2.5 text-xs tracking-[0.25em] bg-[#D1BE9B] text-[#23263A] rounded-full shadow-[0_8px_28px_rgba(209,190,155,0.25)] hover:bg-[#E3D3AF] transition-all duration-500 active:scale-95"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    開始占卜
                  </button>
                </Link>
              </div>

              {/* Tarot cards visual – floating SVG cards */}
              <div
                className="mx-auto flex items-end justify-center animate-fade-in-up delay-200"
                style={{
                  height: "240px",
                  position: "relative",
                  width: "260px",
                }}
              >
                {/* Constellation line-art behind the cards */}
                <svg
                  className="absolute -inset-10 w-[calc(100%+5rem)] h-[calc(100%+5rem)] pointer-events-none opacity-30"
                  viewBox="0 0 340 320"
                  fill="none"
                  aria-hidden="true"
                >
                  <polyline
                    points="20,250 70,180 130,210 200,90 260,130 315,60"
                    stroke="#D1BE9B"
                    strokeWidth="0.6"
                  />
                  {[
                    { x: 20, y: 250, r: 1.6 },
                    { x: 70, y: 180, r: 2.2 },
                    { x: 130, y: 210, r: 1.4 },
                    { x: 200, y: 90, r: 2.6 },
                    { x: 260, y: 130, r: 1.5 },
                    { x: 315, y: 60, r: 2 },
                  ].map((s, i) => (
                    <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#D1BE9B" />
                  ))}
                  <path
                    d="M200 78 L202 88 L212 90 L202 92 L200 102 L198 92 L188 90 L198 88 Z"
                    fill="#E8DCC0"
                  />
                </svg>
                {/* Card 1 – left, tilted – THE MOON RWS */}
                <div
                  style={{
                    position: "absolute",
                    left: "0px",
                    bottom: "0px",
                    transform: "rotate(-12deg)",
                    animation: "floatCard1 4s ease-in-out infinite",
                    filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.45))",
                  }}
                >
                  <img
                    src="/tarot/18.jpg"
                    alt="THE MOON"
                    style={{
                      width: "80px",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1.5px solid rgba(209,190,155,0.65)",
                    }}
                  />
                </div>
                {/* Card 2 – center, upright – THE STAR RWS */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "10px",
                    transform: "translateX(-50%)",
                    animation: "floatCard2 4.5s ease-in-out infinite",
                    filter:
                      "drop-shadow(0 18px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(209,190,155,0.22))",
                    zIndex: 2,
                  }}
                >
                  <img
                    src="/tarot/17.jpg"
                    alt="THE STAR"
                    style={{
                      width: "90px",
                      height: "148px",
                      objectFit: "cover",
                      borderRadius: "9px",
                      border: "1.5px solid rgba(209,190,155,0.8)",
                    }}
                  />
                </div>
                {/* Card 3 – right, tilted – THE SUN RWS */}
                <div
                  style={{
                    position: "absolute",
                    right: "0px",
                    bottom: "0px",
                    transform: "rotate(10deg)",
                    animation: "floatCard3 5s ease-in-out infinite",
                    filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.45))",
                  }}
                >
                  <img
                    src="/tarot/19.jpg"
                    alt="THE SUN"
                    style={{
                      width: "80px",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1.5px solid rgba(209,190,155,0.65)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── SHOP PREVIEW ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 bg-[#F2EDE8]/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span
                className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 400,
                }}
              >
                Energy Crystals
              </span>
              <h2
                className="text-lg md:text-xl tracking-[0.18em] font-extralight text-[#31353A] mt-2"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
              >
                能量水晶精選
              </h2>
            </div>
            <Link href="/shop">
              <button
                className="mt-4 md:mt-0 text-xs tracking-[0.2em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                查看全部商品 →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
            {PRODUCTS.slice(0, 4).map((p, i) => (
              <div
                key={p.slug}
                className="group flex flex-col justify-between h-full animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Link href={`/shop/${p.slug}`}>
                  <div className="cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl mb-3 aspect-square bg-[#F0E8DC]">
                      <ProductImageWatermark
                        product={p}
                        alt={p.name}
                        imageClassName="w-full h-full object-cover transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3D4144]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {p.tag && (
                        <span
                          className="absolute top-3 left-3 text-[10px] tracking-[0.15em] px-2 py-0.5 rounded-full bg-[#D1BE9B]/90 text-[#31353A]"
                          style={{
                            fontFamily: "Noto Serif TC, serif",
                            fontWeight: 300,
                          }}
                        >
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 200,
                        }}
                      >
                        {p.material}
                      </p>
                      <h3
                        className="text-xs tracking-[0.12em] text-[#31353A]/86 mb-0.5"
                        style={{
                          fontFamily: "Noto Serif TC, serif",
                          fontWeight: 300,
                        }}
                      >
                        {p.name}
                      </h3>
                      <SalePrice
                        price={p.price}
                        originalPrice={p.originalPrice}
                        className="mb-2.5 flex flex-wrap items-baseline gap-2"
                        originalClassName="text-[10px] tracking-[0.1em] text-[#31353A]/38 line-through"
                        saleClassName="text-[11px] tracking-[0.1em] text-[#A38D6B]"
                      />
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handleBuyProduct(p.name)}
                  className="w-full py-2 text-[10px] tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-300 active:scale-95 shadow-sm font-light mt-auto"
                  style={{ fontFamily: "Noto Serif TC, serif" }}
                >
                  問問適不適合我 ♡
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section
        id="testimonials-section"
        className="py-20 px-6 md:px-10 bg-[#F2EDE8]/30 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <span
              className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 400,
              }}
            >
              Gentle Echoes
            </span>
            <h2
              className="text-xl md:text-2xl tracking-[0.18em] font-extralight text-[#31353A] mt-2"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              大家看完的感覺
            </h2>
            <p
              className="mt-3 text-[12px] leading-[1.9] tracking-[0.14em] text-[#31353A]/52 max-w-xl mx-auto"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
            >
              不一定會立刻有答案，但有時候光是看清楚一點，心情就差很多。
            </p>
          </div>
        </div>
      </section>

      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productName={selectedProduct}
      />
    </PageLayout>
  );
}
