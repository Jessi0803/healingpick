/**
 * SOUL EASE | Mochi．crystal — Home Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Sections:
 *   1. Hero + 3D Book (星夢之書)
 *   2. Divination Previews (塔羅 / 紫微)
 *   3. Shop Preview (療癒水晶)
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/Reveal";
import { useAuth } from "@/_core/hooks/useAuth";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import SalePrice from "@/components/SalePrice";
import { PRODUCTS } from "@/data/products";
import { CUSTOMER_FEEDBACK_PHOTO_ITEMS } from "@/data/customerFeedbackPhotos";
import ContactDialog from "@/components/ContactDialog";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home as HomeIcon,
  Instagram,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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
    title: "排紫微命盤",
    desc: "想看自己的命盤與人生節奏",
    href: "/ziwei",
  },
  {
    title: "解一個夢",
    desc: "想理解夢裡反覆出現的訊號",
    href: "/dream",
  },
  {
    title: "看今日運勢",
    desc: "想知道今天怎麼走比較順",
    href: "/fortune/daily",
  },
];

type HomeFeedbackCategoryId = "tarot" | "bracelet" | "ritual";

type HomeFeedbackItem = {
  src: string;
  thumb?: string;
  alt: string;
};

const HUMAN_TAROT_FEEDBACK_IDS = Array.from(
  { length: 63 },
  (_, index) => index + 1
);

const homeFeedbackCategories: Array<{
  id: HomeFeedbackCategoryId;
  label: string;
  eyebrow: string;
  title: string;
  note: string;
  items: HomeFeedbackItem[];
}> = [
  {
    id: "tarot",
    label: "真人占卜回饋",
    eyebrow: "Human Tarot",
    title: "真人占卜回饋",
    note: "客人後續回傳的占卜截圖，適合先感受真人老師的解讀方式與驗證感。",
    items: HUMAN_TAROT_FEEDBACK_IDS.map(id => ({
      src: `/gooday-tarot-reviews/review-${id}.jpg`,
      alt: `真人占卜顧客回饋，第 ${id} 張`,
    })),
  },
  {
    id: "bracelet",
    label: "手鍊回饋",
    eyebrow: "Crystal Bracelet",
    title: "手鍊回饋",
    note: "包含水晶手鍊顧客回饋與客製化實拍，點開可以看更完整的作品與回饋細節。",
    items: CUSTOMER_FEEDBACK_PHOTO_ITEMS.map((photo, index) => ({
      src: photo.full,
      thumb: photo.thumb,
      alt: `手鍊顧客回饋，第 ${index + 1} 張`,
    })),
  },
  {
    id: "ritual",
    label: "魔法儀式回饋",
    eyebrow: "Wish Ritual",
    title: "魔法儀式回饋",
    note: "許願魔法儀式相關的真實回饋截圖，讓你先看看大家完成儀式後的感受。",
    items: Array.from({ length: 56 }, (_, i) => ({
      src: `/gooday-ritual-reviews/review-${i + 1}.jpg`,
      alt: `魔法儀式顧客回饋，第 ${i + 1} 張`,
    })),
  },
];

// ─── Products Preview ─────────────────────────────────────────────────────────
// Real products are loaded dynamically from PRODUCTS data.

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call login() or logout().
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMochiMenuOpen, setIsMochiMenuOpen] = useState(false);
  const [isTestimonialsOpen, setIsTestimonialsOpen] = useState(false);
  const [activeFeedbackCategory, setActiveFeedbackCategory] =
    useState<HomeFeedbackCategoryId>("tarot");
  const [selectedFeedbackIndex, setSelectedFeedbackIndex] = useState<
    number | null
  >(null);

  const handleBuyProduct = (productName: string) => {
    setSelectedProduct(productName);
    setIsContactOpen(true);
  };

  const activeFeedback =
    homeFeedbackCategories.find(
      category => category.id === activeFeedbackCategory
    ) ?? homeFeedbackCategories[0];
  const selectedFeedback =
    selectedFeedbackIndex === null
      ? null
      : activeFeedback.items[selectedFeedbackIndex];

  function openTestimonials(categoryId: HomeFeedbackCategoryId) {
    setActiveFeedbackCategory(categoryId);
    setIsTestimonialsOpen(true);
    setSelectedFeedbackIndex(null);
  }

  function scrollToTestimonials() {
    document
      .getElementById("testimonials-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToHomeChoices() {
    document
      .getElementById("home-main-choices")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToFeedbackCategory(categoryId: HomeFeedbackCategoryId) {
    const target = document.getElementById(`home-feedback-card-${categoryId}`);
    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    if (target instanceof HTMLElement) {
      window.setTimeout(() => target.focus({ preventScroll: true }), 360);
    }
  }

  function stepSelectedFeedback(direction: number) {
    setSelectedFeedbackIndex(current => {
      if (current === null) return current;
      return (
        (current + direction + activeFeedback.items.length) %
        activeFeedback.items.length
      );
    });
  }

  useEffect(() => {
    if (!isTestimonialsOpen || selectedFeedbackIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepSelectedFeedback(1);
      if (event.key === "ArrowLeft") stepSelectedFeedback(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFeedback.items.length, isTestimonialsOpen, selectedFeedbackIndex]);

  return (
    <PageLayout>
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

        <div
          id="home-main-choices"
          className="max-w-3xl z-10 animate-fade-in-up -mt-16 scroll-mt-24 md:-mt-24"
        >
          {/* Mochi portrait */}
          <div className="mb-1 flex justify-center">
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
            className="text-xl md:text-3xl leading-[1.6] md:leading-[1.8] mb-1 tracking-[0.2em] font-extralight text-[#31353A]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
          >
            Mochi 小宇宙
          </h1>

          <p
            className="mb-3 whitespace-nowrap text-[10px] leading-none tracking-[0.1em] text-[#31353A]/42 sm:text-[11px] sm:tracking-[0.15em]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            ✦ 免費占卜完，自動推薦適合你的專屬手鍊 ✦
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
            <div className="flex flex-col items-center">
              <button
                type="button"
                aria-expanded={isMochiMenuOpen}
                aria-controls="mochi-reading-menu"
                onClick={() => setIsMochiMenuOpen(open => !open)}
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
              {isMochiMenuOpen && (
                <div
                  id="mochi-reading-menu"
                  className="mx-auto mt-3 grid w-full max-w-[17rem] grid-cols-1 gap-2 rounded-2xl border border-[#D1BE9B]/22 bg-white/48 p-3 shadow-[0_16px_38px_rgba(209,190,155,0.14)] backdrop-blur-sm animate-fade-in-up sm:max-w-3xl sm:grid-cols-3"
                >
                  {mochiReadingOptions.map(option => (
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
                type="button"
                onClick={scrollToTestimonials}
                className="home-testimonial-heart-button group mt-3"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                aria-label="客人寶寶們回饋"
              >
                <svg
                  className="home-testimonial-heart-shape"
                  viewBox="0 0 160 145"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="home-testimonial-heart-gradient"
                      x1="35"
                      y1="16"
                      x2="124"
                      y2="132"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFFDFB" />
                      <stop offset="0.48" stopColor="#F7D5DB" />
                      <stop offset="1" stopColor="#E8AEB8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M80 130C69 117 45 101 29 83C13 65 10 40 25 25C39 11 61 14 72 31C75 35 78 41 80 45C82 41 85 35 88 31C99 14 121 11 135 25C150 40 147 65 131 83C115 101 91 117 80 130Z"
                    fill="url(#home-testimonial-heart-gradient)"
                    stroke="rgba(201, 137, 144, 0.38)"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M40 31C50 24 62 27 69 39"
                    fill="none"
                    stroke="rgba(255,255,255,0.62)"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                </svg>
                <span className="home-testimonial-heart-text">
                  <span>客人寶寶們</span>
                  <span>回饋</span>
                </span>
              </button>
            </div>
          </div>
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

      <div className="flex flex-col">
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
            <div
              className="mx-auto mt-7 flex max-w-2xl flex-col gap-2 sm:flex-row sm:justify-center"
              aria-label="快速前往回饋分類"
            >
              {homeFeedbackCategories.map(category => (
                <button
                  key={`jump-${category.id}`}
                  type="button"
                  onClick={() => scrollToFeedbackCategory(category.id)}
                  className="rounded-full border border-[#D1BE9B]/28 bg-white/48 px-4 py-2.5 text-[11px] tracking-[0.13em] text-[#8A7250] shadow-[0_8px_20px_rgba(163,141,107,0.06)] transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#A38D6B]/45 hover:bg-white/72 hover:text-[#31353A] active:scale-[0.98]"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {homeFeedbackCategories.map(category => (
              <button
                key={category.id}
                id={`home-feedback-card-${category.id}`}
                type="button"
                onClick={() => openTestimonials(category.id)}
                className="group scroll-mt-32 overflow-hidden rounded-2xl border border-[#D1BE9B]/22 bg-white/48 p-4 text-left shadow-[0_16px_40px_rgba(163,141,107,0.08)] backdrop-blur-sm transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#A38D6B]/45 hover:bg-white/70 hover:shadow-[0_18px_46px_rgba(163,141,107,0.12)] focus-visible:border-[#3D4144]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1BE9B]/45 active:scale-[0.985]"
                aria-label={`開啟${category.title}`}
              >
                <div className="grid grid-cols-3 gap-2">
                  {category.items.slice(0, 3).map((item, index) => (
                    <span
                      key={`${category.id}-preview-${item.src}`}
                      className={`block aspect-[3/4] overflow-hidden rounded-xl border border-[#D1BE9B]/14 bg-[#FAF7F4]/70 ${
                        index === 1 ? "translate-y-3" : ""
                      }`}
                    >
                      <img
                        src={item.thumb ?? item.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <span
                      className="text-[12px] italic tracking-[0.08em] text-[#A38D6B]"
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontWeight: 400,
                      }}
                    >
                      {category.eyebrow}
                    </span>
                    <h3
                      className="mt-1 text-sm font-extralight tracking-[0.16em] text-[#31353A]"
                      style={{
                        fontFamily: "Noto Serif TC, serif",
                        fontWeight: 200,
                      }}
                    >
                      {category.title}
                    </h3>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-[#D1BE9B]/28 bg-[#FAF7F4]/72 px-3 py-1.5 text-[10px] tracking-[0.12em] text-[#8A7250] transition-colors duration-300 group-hover:border-[#3D4144]/18 group-hover:bg-[#3D4144] group-hover:text-[#FAF7F4]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {category.items.length} 則
                  </span>
                </div>
                <p
                  className="mt-3 line-clamp-2 text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/52"
                  style={{
                    fontFamily: "Noto Sans TC, sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {category.note}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={scrollToHomeChoices}
              className="group inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 rounded-full border border-[#D1BE9B]/34 bg-white/54 px-6 py-3 text-xs tracking-[0.14em] text-[#8A7250] shadow-[0_12px_30px_rgba(163,141,107,0.1)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-[#3D4144]/25 hover:bg-[#3D4144] hover:text-[#FAF7F4] active:scale-95"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              <HomeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>回到主頁</span>
            </button>
          </div>
        </div>
      </section>

      <Dialog
        open={isTestimonialsOpen}
        onOpenChange={open => {
          setIsTestimonialsOpen(open);
          if (!open) setSelectedFeedbackIndex(null);
        }}
      >
        <DialogContent
          className="h-[min(88vh,46rem)] max-w-[min(58rem,calc(100vw-1.5rem))] overflow-hidden border-[#D1BE9B]/28 bg-[#FAF7F4]/96 p-0 shadow-[0_28px_80px_rgba(49,53,58,0.22)] backdrop-blur-xl sm:rounded-2xl"
          aria-describedby="home-feedback-description"
        >
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr]">
            <div className="border-b border-[#D1BE9B]/18 px-5 pb-4 pt-6 md:px-7">
              <span
                className="text-[12px] italic tracking-[0.08em] text-[#A38D6B]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 400,
                }}
              >
                Gentle Echoes
              </span>
              <DialogTitle
                className="mt-2 text-lg font-extralight tracking-[0.18em] text-[#31353A] md:text-xl"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
              >
                {activeFeedback.title}
              </DialogTitle>
              <DialogDescription
                id="home-feedback-description"
                className="mt-2 max-w-2xl text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/58"
                style={{
                  fontFamily: "Noto Sans TC, sans-serif",
                  fontWeight: 300,
                }}
              >
                {activeFeedback.note}
              </DialogDescription>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 md:px-7">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <span
                    className="text-[12px] italic tracking-[0.08em] text-[#A38D6B]"
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontWeight: 400,
                    }}
                  >
                    {activeFeedback.eyebrow}
                  </span>
                  <h3
                    className="mt-1 text-sm font-extralight tracking-[0.16em] text-[#31353A]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 200,
                    }}
                  >
                    {activeFeedback.items.length} 則真實回饋
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {activeFeedback.items.map((item, index) => (
                  <button
                    key={`${activeFeedback.id}-${item.src}`}
                    type="button"
                    onClick={() => setSelectedFeedbackIndex(index)}
                    aria-label={`放大${activeFeedback.title}第 ${index + 1} 張`}
                    style={{
                      aspectRatio:
                        activeFeedback.id === "bracelet" ? "3 / 4" : "868 / 1543",
                    }}
                    className="group overflow-hidden rounded-xl border border-[#D1BE9B]/18 bg-white/56 shadow-[0_10px_24px_rgba(180,160,130,0.1)] transition-[border-color,opacity,transform] duration-200 hover:border-[#A38D6B]/55 active:scale-[0.98]"
                  >
                    <img
                      src={item.thumb ?? item.src}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedFeedback && selectedFeedbackIndex !== null && (
            <div
              className="absolute inset-0 z-20 grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-[#171513]/88 p-4 text-[#FAF7F4] backdrop-blur-md md:p-6"
              onClick={() => setSelectedFeedbackIndex(null)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-[12px] tracking-[0.18em]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {activeFeedback.title}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.12em] text-white/50">
                    {selectedFeedbackIndex + 1} / {activeFeedback.items.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    setSelectedFeedbackIndex(null);
                  }}
                  aria-label="關閉圖片"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <X className="h-4.5 w-4.5" strokeWidth={1.7} />
                </button>
              </div>

              <div className="relative flex min-h-0 items-center justify-center px-11 py-4">
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    stepSelectedFeedback(-1);
                  }}
                  aria-label="上一張"
                  className="absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
                </button>
                <img
                  key={selectedFeedback.src}
                  src={selectedFeedback.src}
                  alt={selectedFeedback.alt}
                  decoding="async"
                  className="lightbox-image max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                  onClick={event => event.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    stepSelectedFeedback(1);
                  }}
                  aria-label="下一張"
                  className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>

              <p
                className="text-center text-[10px] tracking-[0.14em] text-white/52"
                style={{
                  fontFamily: "Noto Serif TC, serif",
                  fontWeight: 300,
                }}
              >
                點擊空白處關閉 · 可用左右鍵切換
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productName={selectedProduct}
      />
    </PageLayout>
  );
}
