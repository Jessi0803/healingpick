/**
 * SOUL EASE | Mochi．crystal — Home Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Sections:
 *   1. Hero + 3D Book (星夢之書)
 *   2. Crystal Altar (水晶祭壇)
 *   3. Features Overview (四大功能入口)
 *   4. Divination Preview (占卜聖殿入口)
 *   5. Treehole Teaser (心靈樹洞)
 *   6. Shop Preview (能量商品)
 *   7. Testimonials (使用者心聲)
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatPeeking } from '@/components/CatElements';
import { useAuth } from '@/_core/hooks/useAuth';

// ─── Tarot Card Back SVG ────────────────────────────────────────────────────
const TarotCardBack = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="200" rx="8" fill="#EDE8E2" />
    <rect x="6" y="6" width="108" height="188" rx="6" stroke="#D1BE9B" strokeWidth="0.8" />
    <rect x="12" y="12" width="96" height="176" rx="4" stroke="#D1BE9B" strokeWidth="0.4" strokeDasharray="3 2" />
    {/* Center diamond */}
    <path d="M60 50 L90 100 L60 150 L30 100 Z" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
    {/* Sun circle */}
    <circle cx="60" cy="100" r="18" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
    <circle cx="60" cy="100" r="8" fill="#D1BE9B" fillOpacity="0.25" stroke="#D1BE9B" strokeWidth="0.6" />
    {/* Rays */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 60 + 20 * Math.cos(rad);
      const y1 = 100 + 20 * Math.sin(rad);
      const x2 = 60 + 26 * Math.cos(rad);
      const y2 = 100 + 26 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D1BE9B" strokeWidth="0.6" strokeOpacity="0.7" />;
    })}
    {/* Corner stars */}
    {[[22,28],[98,28],[22,172],[98,172]].map(([cx,cy], i) => (
      <path key={i} d={`M${cx} ${cy-5} L${cx+1.5} ${cy-1.5} L${cx+5} ${cy} L${cx+1.5} ${cy+1.5} L${cx} ${cy+5} L${cx-1.5} ${cy+1.5} L${cx-5} ${cy} L${cx-1.5} ${cy-1.5} Z`}
        fill="#D1BE9B" fillOpacity="0.6" />
    ))}
    {/* Top/bottom small moons */}
    <path d="M60 22 C56 22 54 26 56 29 C58 26 62 26 60 22 Z" fill="#D1BE9B" fillOpacity="0.5" />
    <path d="M60 178 C64 178 66 174 64 171 C62 174 58 174 60 178 Z" fill="#D1BE9B" fillOpacity="0.5" />
  </svg>
);

// ─── Crystal SVG Components ──────────────────────────────────────────────────
const CrystalPurple = () => (
  <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-[0_4px_16px_rgba(160,142,195,0.5)]">
    <path d="M40 5 L65 30 L70 75 L40 95 L10 75 L15 30 Z" fill="url(#purpleGrad)" stroke="#A08EC3" strokeWidth="0.8" />
    <path d="M40 5 L65 30 L40 40 L15 30 Z" fill="rgba(229,223,238,0.6)" />
    <path d="M40 40 L65 30 L70 75 L40 95 Z" fill="rgba(160,142,195,0.3)" />
    <path d="M40 40 L15 30 L10 75 L40 95 Z" fill="rgba(180,162,215,0.4)" />
    <line x1="40" y1="5" x2="40" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
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
  <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-[0_4px_16px_rgba(234,168,172,0.5)]">
    <path d="M40 8 L62 28 L68 72 L40 92 L12 72 L18 28 Z" fill="url(#roseGrad)" stroke="#EAA8AC" strokeWidth="0.8" />
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
  <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-[0_4px_16px_rgba(222,193,128,0.5)]">
    <path d="M40 6 L58 22 L72 65 L55 90 L25 90 L8 65 L22 22 Z" fill="url(#citrineGrad)" stroke="#DEC180" strokeWidth="0.8" />
    <path d="M40 6 L58 22 L40 35 L22 22 Z" fill="rgba(255,245,210,0.6)" />
    <path d="M40 35 L58 22 L72 65 L55 90 L40 70 Z" fill="rgba(222,193,128,0.3)" />
    <path d="M40 35 L22 22 L8 65 L25 90 L40 70 Z" fill="rgba(238,210,148,0.4)" />
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
const features = [
  {
    icon: '🔮',
    title: '塔羅牌占卜',
    subtitle: 'Tarot Reading',
    desc: '凱爾特十字完整牌陣，深度解析過去、現在與未來的能量流動。',
    href: '/tarot',
    color: '#D8CEEA',  // 薰衣草紫，比背景深一階
  },
  {
    icon: '☯',
    title: '紫微斗數',
    subtitle: 'Zi Wei Dou Shu',
    desc: '輸入生辰八字，排出專屬命盤，洞悉人生格局與流年運勢。',
    href: '/ziwei',
    color: '#DDD5C8',  // 暖米棕，比背景深一階
  },
  {
    icon: '☀',
    title: '每日運勢',
    subtitle: 'Daily Fortune',
    desc: '結合星象與塔羅能量，為你解析今日的機遇、挑戰與行動指引。',
    href: '/fortune/daily',
    color: '#EAD9B0',  // 金黃奶茶，比背景深一階
  },
  {
    icon: '🌿',
    title: '心靈樹洞',
    subtitle: 'Soul Comfort',
    desc: '有話想說卻無處傾訴？這裡是你最安全的出口，AI 溫柔傾聽。',
    href: '/treehole',
    color: '#D4E0CE',  // 鼠尾草綠，比背景深一階
  },
];

const altarData: Record<string, {
  tag: string; hz: string; title: string; description: string;
  bgGradient: string; glowColor: string;
}> = {
  purple: {
    tag: '薰衣草紫水晶簇',
    hz: '432Hz ｜ 頂輪淨化',
    title: '靜心避難所：撫平焦慮與失眠',
    description: '紫水晶擁有極高的振動頻率，能溫和、快速地沉澱過載的思緒。若你近期常感到緊繃、疲憊或夜晚難以入眠，這份紫色光芒將為你構築一個溫和的心靈保護界限，讓你安然呼吸、重拾深層睡眠。',
    bgGradient: 'linear-gradient(135deg, #F2EDE8 0%, #EDE8E2 45%, #E6E0ED 100%)',
    glowColor: 'rgba(160, 142, 195, 0.45)',
  },
  rose: {
    tag: '馬達加斯加粉晶',
    hz: '528Hz ｜ 心輪復甦',
    title: '溫柔的擁抱：撫平遺憾，接納脆弱',
    description: '粉晶帶來無條件的愛與療癒。它輕柔地觸碰那些在拉扯感情中留下的微小傷口，陪伴你接納生活中的不完美與脆弱。當心輪重新開啟，你會發現本屬於你的安全感與溫暖人緣，正慢慢流回身邊。',
    bgGradient: 'linear-gradient(135deg, #F2EDE8 0%, #EDE0D8 42%, #EDE8E2 100%)',
    glowColor: 'rgba(234, 168, 172, 0.5)',
  },
  citrine: {
    tag: '天然黃水晶原礦',
    hz: '396Hz ｜ 太陽神經叢能量',
    title: '豐盛顯化：提振自信與財富磁場',
    description: '黃水晶對應你的意志力與財富中心。如果你正面臨轉職卡關、專案瓶頸或缺乏行動力，黃水晶的璀璨光芒能點燃你內心的熱情、驅散猶豫不決的雜音，在清明理智中顯化你本應獲得的豐盛回饋。',
    bgGradient: 'linear-gradient(135deg, #F2EDE8 0%, #EDE5D4 40%, #EDE8E2 100%)',
    glowColor: 'rgba(222, 193, 128, 0.45)',
  },
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    text: '塔羅牌的解讀非常準確，讓我在迷茫的時候找到了方向。心靈樹洞的 AI 回應也很溫柔，感覺真的被理解了。',
    name: '小雨',
    tag: '塔羅 × 心靈樹洞',
    crystal: '紫水晶',
  },
  {
    text: '紫微斗數命盤讓我對自己的性格有了全新的認識，原來很多困擾都跟命盤的特質有關。粉晶也真的很有療癒感！',
    name: 'Mia',
    tag: '紫微斗數 × 能量商品',
    crystal: '粉晶',
  },
  {
    text: '每天早上看每日運勢已經變成我的習慣了，感覺像是有一個溫柔的朋友在提醒我今天要注意什麼。',
    name: '阿哲',
    tag: '每日運勢',
    crystal: '黃水晶',
  },
];

// ─── Products Preview ─────────────────────────────────────────────────────────
const products = [
  {
    name: '薰衣草紫水晶簇',
    subtitle: 'Amethyst Cluster',
    price: 'NT$ 1,280',
    tag: '頂輪淨化 · 432Hz',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
    badge: '自營',
  },
  {
    name: '馬達加斯加粉晶球',
    subtitle: 'Rose Quartz Sphere',
    price: 'NT$ 980',
    tag: '心輪療癒 · 528Hz',
    img: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400&q=80',
    badge: '合作',
  },
  {
    name: '天然黃水晶原礦',
    subtitle: 'Citrine Raw Crystal',
    price: 'NT$ 760',
    tag: '豐盛顯化 · 396Hz',
    img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80',
    badge: '合作',
  },
  {
    name: '白水晶能量棒',
    subtitle: 'Clear Quartz Wand',
    price: 'NT$ 1,580',
    tag: '全脈輪淨化',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    badge: '自營',
  },
];

// ─── Daily Energy Data ───────────────────────────────────────────────────────
const dailyEnergyPool = [
  { moon: '盈凸月', crystal: '紫水晶', keyword: '靜心･釋放', color: '#C4B8DC', quote: '深呼吸一口，今天也會沒事的！' },
  { moon: '滿月', crystal: '白水晶', keyword: '顯化･豐盛', color: '#D1BE9B', quote: '你想要的，宇宙正在幫你準備中！' },
  { moon: '眉月', crystal: '粉晶', keyword: '開始･愛', color: '#F0C0C4', quote: '新的開始就是現在，勇敢踏出第一步！' },
  { moon: '殘月', crystal: '黑碧璧', keyword: '清理･防護', color: '#8E8E8E', quote: '放下包裱，輕裝上陣，你可以的！' },
  { moon: '上弦月', crystal: '黃水晶', keyword: '行動･自信', color: '#EDD080', quote: '朝著目標前進吧！今天是你的日子！' },
];
const todayEnergy = dailyEnergyPool[new Date().getDay() % dailyEnergyPool.length];

// ─── Today's Tarot Card ───────────────────────────────────────────────────────
const dailyTarotPool = [
  { name: '愚者', en: 'The Fool', symbol: '☽', meaning: '新旅程的開始，帶著純真與勇氣踏出第一步。' },
  { name: '女祭司', en: 'The High Priestess', symbol: '✦', meaning: '傾聽內心深處的聲音，智慧藏於靜默之中。' },
  { name: '星星', en: 'The Star', symbol: '★', meaning: '希望正在前方閃爍，相信宇宙的安排。' },
  { name: '月亮', en: 'The Moon', symbol: '☾', meaning: '潛意識在說話，留意夢境與直覺的訊息。' },
  { name: '太陽', en: 'The Sun', symbol: '☀', meaning: '光明與喜悅充滿今日，盡情展現你的光芒。' },
  { name: '世界', en: 'The World', symbol: '◎', meaning: '一個循環圓滿完成，新的篇章即將展開。' },
  { name: '命運之輪', en: 'Wheel of Fortune', symbol: '⊕', meaning: '轉機正在到來，保持開放的心迎接變化。' },
];
const todayTarot = dailyTarotPool[new Date().getDate() % dailyTarotPool.length];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [activeCrystal, setActiveCrystal] = useState<string | null>(null);
  const [bodyBg, setBodyBg] = useState('');
  const [tarotFlipped, setTarotFlipped] = useState(false);
  const [testimonialsIdx, setTestimonialsIdx] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialsIdx(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const crystalFrequencies: Record<string, { f1: number; f2: number; label: string }> = {
    purple: { f1: 432, f2: 648, label: '432Hz · 頂輪淨化' },
    rose:   { f1: 528, f2: 792, label: '528Hz · 心輪復甦' },
    citrine:{ f1: 396, f2: 594, label: '396Hz · 豐盛顯化' },
  };

  function playHarmonicBowl(type: string) {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const freq = crystalFrequencies[type] || { f1: 432, f2: 648 };
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine'; osc1.frequency.setValueAtTime(freq.f1, ctx.currentTime);
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq.f2, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.5);
      osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      osc1.start(); osc2.start();
      setTimeout(() => { osc1.stop(); osc2.stop(); }, 5600);
    } catch {}
  }

  function handleCrystalClick(type: string) {
    if (activeCrystal === type) {
      setActiveCrystal(null);
      setBodyBg('');
      return;
    }
    setActiveCrystal(type);
    setBodyBg(altarData[type].bgGradient);
    playHarmonicBowl(type);
  }

  const activeData = activeCrystal ? altarData[activeCrystal] : null;

  const crystalIconMap: Record<string, React.ReactNode> = {
    '紫水晶': <div className="w-5 h-6"><CrystalPurple /></div>,
    '粉晶': <div className="w-5 h-6"><CrystalRose /></div>,
    '黃水晶': <div className="w-5 h-6"><CrystalCitrine /></div>,
  };

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
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 200 }}
          >
            SOUL EASE
          </span>
        </div>

        {/* ── Sacred geometry SVG ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-[min(80vw,520px)] h-[min(80vw,520px)] opacity-[0.045]" viewBox="0 0 400 400" fill="none">
            {/* Outer circle */}
            <circle cx="200" cy="200" r="190" stroke="#D1BE9B" strokeWidth="0.6" />
            {/* Middle circle */}
            <circle cx="200" cy="200" r="140" stroke="#D1BE9B" strokeWidth="0.4" strokeDasharray="4 3" />
            {/* Inner circle */}
            <circle cx="200" cy="200" r="90" stroke="#D1BE9B" strokeWidth="0.5" />
            {/* Innermost circle */}
            <circle cx="200" cy="200" r="45" stroke="#D1BE9B" strokeWidth="0.4" />
            {/* Six-pointed star */}
            <polygon points="200,30 345,115 345,285 200,370 55,285 55,115" stroke="#D1BE9B" strokeWidth="0.5" fill="none" />
            <polygon points="200,370 55,285 55,115 200,30 345,115 345,285" stroke="#D1BE9B" strokeWidth="0.3" fill="none" transform="rotate(30 200 200)" />
            {/* Cross lines */}
            <line x1="200" y1="10" x2="200" y2="390" stroke="#D1BE9B" strokeWidth="0.3" />
            <line x1="10" y1="200" x2="390" y2="200" stroke="#D1BE9B" strokeWidth="0.3" />
            <line x1="55" y1="55" x2="345" y2="345" stroke="#D1BE9B" strokeWidth="0.25" />
            <line x1="345" y1="55" x2="55" y2="345" stroke="#D1BE9B" strokeWidth="0.25" />
            {/* Center dot */}
            <circle cx="200" cy="200" r="3" fill="#D1BE9B" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Multi-layer background glows */}
        <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] max-w-[500px] rounded-full bg-[#E6E0ED]/40 mix-blend-multiply blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[15%] right-[8%] w-[35vw] h-[35vw] max-w-[380px] rounded-full bg-[#F0C0C4]/30 mix-blend-multiply blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-[40%] right-[15%] w-[25vw] h-[25vw] max-w-[260px] rounded-full bg-[#EDD080]/20 mix-blend-multiply blur-2xl opacity-40 pointer-events-none" />

        {/* Floating crystal SVGs – 2 only for subtle effect */}
        <div className="absolute top-[14%] left-[6%] w-14 h-18 opacity-[0.14] pointer-events-none animate-float" style={{ animationDelay: '0s' }}><CrystalPurple /></div>
        <div className="absolute bottom-[22%] right-[6%] w-11 h-[3.5rem] opacity-[0.11] pointer-events-none animate-float" style={{ animationDelay: '1.8s' }}><CrystalCitrine /></div>
        {/* Cat – visible near top so users see it on load, clickable */}


        {/* Decorative gold vertical lines */}
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-[#D1BE9B]/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-[#D1BE9B]/40 to-transparent pointer-events-none" />
        {/* Horizontal accent lines */}
        <div className="absolute top-[22%] left-[5%] w-16 h-px bg-gradient-to-r from-transparent to-[#D1BE9B]/25 pointer-events-none" />
        <div className="absolute top-[22%] right-[5%] w-16 h-px bg-gradient-to-l from-transparent to-[#D1BE9B]/25 pointer-events-none" />
        <div className="absolute bottom-[22%] left-[5%] w-16 h-px bg-gradient-to-r from-transparent to-[#D1BE9B]/25 pointer-events-none" />
        <div className="absolute bottom-[22%] right-[5%] w-16 h-px bg-gradient-to-l from-transparent to-[#D1BE9B]/25 pointer-events-none" />

        {/* Scattered star dots – reduced to 4 */}
        {[{t:'10%',l:'22%'},{t:'68%',l:'85%'},{t:'80%',l:'28%'},{t:'28%',l:'90%'}].map((pos, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-[#D1BE9B]/30 pointer-events-none" style={{ top: pos.t, left: pos.l }} />
        ))}

        {/* ── 給正在思考的你 · floating note (left side) ── */}
        <div className="hidden lg:flex absolute left-8 top-28 flex-col items-start gap-1 pointer-events-none animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass-panel rounded-2xl px-5 py-4 border border-[#D1BE9B]/20 shadow-[0_4px_20px_rgba(209,190,155,0.1)] w-48 text-left">
            <p className="text-center text-[11.5px] tracking-[0.2em] text-[#A38D6B] mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              ♡ 給正在思考的你 ♡
            </p>
            <div className="w-full h-px bg-[#D1BE9B]/25 mb-3" />
            <ul className="space-y-2.5 text-[11.5px] leading-[1.6] text-[#31353A]/76 tracking-wider"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              <li><span className="text-[#A38D6B] mr-1.5">☁︎</span>愛情該往哪裡走？</li>
              <li><span className="text-[#A38D6B] mr-1.5">♡</span>工作該不該繼續？</li>
              <li><span className="text-[#A38D6B] mr-1.5">𓇢𓆸</span>心裡的煩惱該跟誰說？</li>
              <li><span className="text-[#A38D6B] mr-1.5">⟡</span>來找找屬於你的方向</li>
            </ul>
            <p className="text-center text-[12px] text-[#A38D6B]/70 mt-3"
              style={{ fontFamily: 'Noto Serif TC, serif' }}>
              ♡
            </p>
          </div>
        </div>

        <div className="max-w-3xl z-10 animate-fade-in-up -mt-16 md:-mt-24">
          {/* Badge */}
          <div className="mb-5 flex justify-center items-center gap-2 text-[#D1BE9B]/80">
            <svg className="w-4 h-4" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
            </svg>
            <span className="text-[11px] tracking-[0.4em] text-[#31353A]/54 font-light"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              SACRED CRYSTAL ALTAR
            </span>
            <svg className="w-4 h-4" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Main title */}
          <h1
            className="text-3xl md:text-5xl leading-[1.6] md:leading-[1.8] mb-3 tracking-[0.2em] font-extralight text-[#31353A]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
          >
            有些心事
            <span className="block text-2xl md:text-3xl font-light text-[#31353A]/62 mt-2 tracking-[0.25em]">
              只需要一個溫柔的出口
            </span>
          </h1>

          <p
            className="text-base md:text-lg text-[#31353A]/54 tracking-[0.15em] max-w-lg mx-auto mb-8 italic"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}
          >
            "Some feelings only need a gentle place to rest."
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/tarot">
              <button
                className="px-8 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                開始占卜
              </button>
            </Link>
            <Link href="/treehole">
              <button
                className="px-8 py-3 text-xs tracking-[0.25em] border border-[#3D4144]/15 bg-white/30 backdrop-blur-sm rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                傾訴心事
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
          <span className="text-[10px] tracking-[0.3em] text-[#31353A]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#D1BE9B] to-transparent" />
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14 animate-fade-in-up">
            <span
              className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Our Services
            </span>
            <h2
              className="text-2xl md:text-3xl tracking-[0.2em] font-extralight text-[#31353A] mt-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              靈性療癒的四種方式
            </h2>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3" viewBox="0 0 100 100" fill="none">
                <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Link key={f.href} href={f.href}>
                <div
                  className="group relative p-6 rounded-xl border border-[#D1BE9B]/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(209,190,155,0.18)] animate-fade-in-up"
                  style={{
                    background: `linear-gradient(145deg, ${f.color}, #FAF7F4)`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="text-3xl mb-4 opacity-80">{f.icon}</div>
                  <h3
                    className="text-sm tracking-[0.15em] text-[#31353A]/90 mb-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[11px] tracking-[0.1em] text-[#D1BE9B] mb-3 italic"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {f.subtitle}
                  </p>
                  <p
                    className="text-[12px] leading-[1.8] text-[#31353A]/68 tracking-wider"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    {f.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[#D1BE9B] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] tracking-[0.2em]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      前往
                    </span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRYSTAL ALTAR ─────────────────────────────────────────────────── */}
      <section id="altar-section" className="py-20 px-6 md:px-10 relative overflow-hidden">
        {/* Mandala background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-[min(90vw,600px)] h-[min(90vw,600px)] opacity-[0.035]" viewBox="0 0 500 500" fill="none">
            {[180,150,120,90,60,30].map((r, i) => (
              <circle key={i} cx="250" cy="250" r={r} stroke="#D1BE9B" strokeWidth="0.5" strokeDasharray={i % 2 === 0 ? '6 4' : undefined} />
            ))}
            {[0,30,60,90,120,150].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={i} x1={250 + 30 * Math.cos(rad)} y1={250 + 30 * Math.sin(rad)} x2={250 + 185 * Math.cos(rad)} y2={250 + 185 * Math.sin(rad)} stroke="#D1BE9B" strokeWidth="0.4" />;
            })}
            {[0,45,90,135].map((deg, i) => (
              <ellipse key={i} cx="250" cy="250" rx="80" ry="30" stroke="#D1BE9B" strokeWidth="0.35" fill="none" transform={`rotate(${deg} 250 250)`} />
            ))}
            <circle cx="250" cy="250" r="8" stroke="#D1BE9B" strokeWidth="0.6" fill="none" />
            <circle cx="250" cy="250" r="3" fill="#D1BE9B" fillOpacity="0.4" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Crystal Altar
            </span>
            <h2
              className="text-2xl md:text-3xl tracking-[0.2em] font-extralight text-[#31353A] mt-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              能量水晶
            </h2>
            <p
              className="mt-3 text-xs tracking-[0.15em] text-[#31353A]/58 max-w-sm mx-auto leading-[1.9]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              點擊水晶，感受它的頻率與能量
            </p>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3" viewBox="0 0 100 100" fill="none">
                <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Crystals */}
            <div className="flex gap-8 md:gap-12 justify-center">
              {[
                { id: 'purple', label: '紫水晶', Component: CrystalPurple },
                { id: 'rose',   label: '粉晶',   Component: CrystalRose },
                { id: 'citrine',label: '黃水晶', Component: CrystalCitrine },
              ].map(({ id, label, Component }) => (
                <div
                  key={id}
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-500 ${
                    activeCrystal === id ? 'scale-125' : 'hover:scale-110'
                  } ${activeCrystal === id ? 'animate-float-1' : ''}`}
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
                        width: activeCrystal === id ? '3rem' : '2rem',
                        background: id === 'purple' ? 'rgba(160,142,195,0.5)' : id === 'rose' ? 'rgba(234,168,172,0.5)' : 'rgba(222,193,128,0.5)',
                        opacity: activeCrystal === id ? 0.8 : 0.3,
                      }}
                    />
                  </div>
                  <span
                    className={`text-[11px] tracking-[0.2em] transition-colors duration-300 mt-1 ${
                      activeCrystal === id ? 'text-[#D1BE9B]' : 'text-[#31353A]/62'
                    }`}
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
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
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {activeData.tag}
                    </span>
                    <span
                      className="text-[11px] tracking-[0.2em] text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {activeData.hz}
                    </span>
                  </div>
                  <h3
                    className="text-sm tracking-[0.15em] text-[#31353A]/90 mb-3"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {activeData.title}
                  </h3>
                  <p
                    className="text-[12px] leading-[2] text-[#31353A]/72 tracking-wider"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    {activeData.description}
                  </p>
                  <Link href="/shop">
                    <button
                      className="mt-4 text-[11px] tracking-[0.2em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
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
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
                  >
                    點擊水晶<br />感受它的能量頻率
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── DIVINATION PREVIEW ────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 bg-[#F2EDE8]/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Tarot */}
            <div className="animate-fade-in-up">
              <span
                className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                Tarot Reading
              </span>
              <h2
                className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2 mb-4"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                塔羅牌占卜
              </h2>
              <p
                className="text-[12px] leading-[2.1] text-[#31353A]/68 tracking-wider mb-6 max-w-sm"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300, fontSize: '12px' }}
              >
                採用凱爾特十字完整牌陣，十張牌從不同維度解析你的問題——
                過去的根源、現在的阻礙、潛意識的渴望，以及最終的可能結果。
              </p>
              <div className="flex gap-3 mb-8">
                {['過去', '現在', '未來', '潛意識', '建議'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] tracking-[0.15em] px-2.5 py-1 rounded-full bg-[#E5DFEE]/60 text-[#31353A]/72 border border-[#D1BE9B]/20"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link href="/tarot">
                <button
                  className="px-7 py-2.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  開始占卜
                </button>
              </Link>
            </div>

            {/* Tarot cards visual – floating SVG cards */}
            <div className="flex items-end justify-center gap-[-20px] animate-fade-in-up delay-200" style={{ height: '240px', position: 'relative', width: '260px' }}>
              {/* Card 1 – left, tilted – THE MOON RWS */}
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  bottom: '0px',
                  transform: 'rotate(-12deg)',
                  animation: 'floatCard1 4s ease-in-out infinite',
                  filter: 'drop-shadow(0 12px 24px rgba(61,65,68,0.22))',
                }}
              >
                <img
                  src="/tarot/18.jpg"
                  alt="THE MOON"
                  style={{ width: '80px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid rgba(209,190,155,0.5)' }}
                />
              </div>
              {/* Card 2 – center, upright – THE STAR RWS */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '10px',
                  transform: 'translateX(-50%)',
                  animation: 'floatCard2 4.5s ease-in-out infinite',
                  filter: 'drop-shadow(0 16px 32px rgba(61,65,68,0.28))',
                  zIndex: 2,
                }}
              >
                <img
                  src="/tarot/17.jpg"
                  alt="THE STAR"
                  style={{ width: '90px', height: '148px', objectFit: 'cover', borderRadius: '9px', border: '1.5px solid rgba(209,190,155,0.6)' }}
                />
              </div>
              {/* Card 3 – right, tilted – THE SUN RWS */}
              <div
                style={{
                  position: 'absolute',
                  right: '0px',
                  bottom: '0px',
                  transform: 'rotate(10deg)',
                  animation: 'floatCard3 5s ease-in-out infinite',
                  filter: 'drop-shadow(0 12px 24px rgba(61,65,68,0.22))',
                }}
              >
                <img
                  src="/tarot/19.jpg"
                  alt="THE SUN"
                  style={{ width: '80px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid rgba(209,190,155,0.5)' }}
                />
              </div>
            </div>
          </div>

          {/* Ziwei */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
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
                className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                Zi Wei Dou Shu
              </span>
              <h2
                className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2 mb-4"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                紫微斗數命盤
              </h2>
              <p
                className="text-[12px] leading-[2.1] text-[#31353A]/68 tracking-wider mb-6 max-w-sm"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                輸入出生年月日時，系統自動排出傳統十二宮位命盤。
                從命宮、財帛宮到夫妻宮，全面解析你的人生格局、
                個性特質與流年運勢。
              </p>
              <Link href="/ziwei">
                <button
                  className="px-7 py-2.5 text-xs tracking-[0.25em] border border-[#3D4144]/15 bg-transparent rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  排出我的命盤
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TREEHOLE TEASER ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-10 md:p-14 border border-[#D1BE9B]/30 overflow-hidden" style={{ background: 'rgba(235,228,218,0.55)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(180,160,130,0.12)' }}>
            {/* BG image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663525376407/gAsTZ8KCRUAuJ8Jah3ZYFq/soul-comfort-LcBLcAob9NkTKDhetNopqA.webp"
                alt="心靈療癒"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EDE4D8]/85 via-[#EDE4D8]/65 to-[#EDE4D8]/40" />
            </div>

            <div className="relative z-10 max-w-lg">
              <span
                className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                Soul Comfort
              </span>
              <h2
                className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2 mb-4"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                心靈樹洞
              </h2>
              <p
                className="text-[12px] leading-[2.2] text-[#31353A]/72 tracking-wider mb-6"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300, fontSize: '12px' }}
              >
                有些話，說出來就輕了。<br />
                不需要完美的措辭，不需要擔心被評判——<br />
                只要把你的心事告訴我，<br />
                我會用最溫柔的方式陪你一起看見它。
              </p>
              <Link href="/treehole">
                <button
                  className="px-7 py-2.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  說說你的心事
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP PREVIEW ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 bg-[#F2EDE8]/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span
                className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                Energy Crystals
              </span>
              <h2
                className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                能量商品精選
              </h2>
            </div>
            <Link href="/shop">
              <button
                className="mt-4 md:mt-0 text-xs tracking-[0.2em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                查看全部商品 →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <Link key={p.name} href="/shop">
                <div
                  className="group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl mb-3 aspect-square">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3D4144]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span
                      className={`absolute top-3 left-3 text-[10px] tracking-[0.15em] px-2 py-0.5 rounded-full ${
                        p.badge === '自營'
                          ? 'bg-[#D1BE9B]/90 text-[#31353A]'
                          : 'bg-white/80 text-[#31353A]/80'
                      }`}
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
                    >
                      {p.tag}
                    </p>
                    <h3
                      className="text-xs tracking-[0.12em] text-[#31353A]/86 mb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="text-[11px] tracking-[0.1em] text-[#D1BE9B]"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {p.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TODAY'S TAROT CARD ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Daily Guidance</span>
            <h2 className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>今日塔羅指引</h2>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3" viewBox="0 0 100 100" fill="none"><path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" /></svg>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Flip card */}
            <div className="flex-shrink-0" style={{ perspective: '800px' }}>
              <div
                className="relative w-36 h-56 cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
                  transform: tarotFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
                onClick={() => setTarotFlipped(f => !f)}
              >
                {/* Card back – RWS card back image */}
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    animation: 'floatCard2 4.5s ease-in-out infinite',
                    border: '1.5px solid rgba(209,190,155,0.4)',
                  }}
                >
                  <svg viewBox="0 0 120 200" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                    <rect width="120" height="200" fill="#C8B89A" />
                    <rect x="5" y="5" width="110" height="190" rx="6" stroke="#F0E4CC" strokeWidth="1" />
                    <rect x="10" y="10" width="100" height="180" rx="4" stroke="#F0E4CC" strokeWidth="0.5" strokeDasharray="3 2" />
                    <circle cx="60" cy="100" r="30" stroke="#F5EAD5" strokeWidth="0.8" fill="none" />
                    <circle cx="60" cy="100" r="22" stroke="#F5EAD5" strokeWidth="0.5" fill="none" />
                    <circle cx="60" cy="100" r="12" stroke="#F5EAD5" strokeWidth="0.8" fill="#F5EAD5" fillOpacity="0.15" />
                    <circle cx="60" cy="100" r="4" fill="#F5EAD5" fillOpacity="0.5" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                      const rad = (deg * Math.PI) / 180;
                      const x1 = 60 + 12 * Math.cos(rad);
                      const y1 = 100 + 12 * Math.sin(rad);
                      const x2 = 60 + 30 * Math.cos(rad);
                      const y2 = 100 + 30 * Math.sin(rad);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F5EAD5" strokeWidth="0.6" strokeOpacity="0.7" />;
                    })}
                    {[[20, 25], [100, 25], [20, 175], [100, 175]].map(([cx, cy], i) => (
                      <path key={i}
                        d={`M${cx} ${cy - 4} L${cx + 1} ${cy - 1} L${cx + 4} ${cy} L${cx + 1} ${cy + 1} L${cx} ${cy + 4} L${cx - 1} ${cy + 1} L${cx - 4} ${cy} L${cx - 1} ${cy - 1} Z`}
                        fill="#F5EAD5" fillOpacity="0.6"
                      />
                    ))}
                    <text x="60" y="160" textAnchor="middle" fontSize="6" fill="#F5EAD5" fillOpacity="0.5"
                      fontFamily="Cormorant Garamond, serif" letterSpacing="2" fontStyle="italic">
                      Healing Pick
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-3" style={{ background: 'linear-gradient(to top, rgba(44,36,32,0.5) 0%, transparent 50%)' }}>
                    <span
                      className="text-[9px] tracking-[0.3em] text-white/80"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      點擊翻牌
                    </span>
                  </div>
                </div>
                {/* Card front */}
                <div
                  className="absolute inset-0 rounded-lg flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(145deg, #EDE8E2, #F5F0EB)',
                    border: '1px solid rgba(209,190,155,0.4)',
                  }}
                >
                  <div className="absolute inset-[6px] rounded border border-[#D1BE9B]/25" />
                  <div className="text-4xl mb-2 text-[#D1BE9B]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{todayTarot.symbol}</div>
                  <p className="text-[11px] tracking-[0.2em] text-[#31353A]/80 mb-0.5" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{todayTarot.name}</p>
                  <p className="text-[10px] tracking-[0.15em] text-[#D1BE9B] italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{todayTarot.en}</p>
                </div>
              </div>
            </div>

            {/* Card meaning */}
            <div className="flex-1 text-left">
              <div style={{ opacity: tarotFlipped ? 1 : 0, transform: tarotFlipped ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.5s ease' }}>
                <p className="text-[11px] tracking-[0.3em] text-[#D1BE9B] mb-2" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>TODAY · {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}</p>
                <h3 className="text-xl md:text-2xl tracking-[0.2em] text-[#31353A]/90 mb-4" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>{todayTarot.name}</h3>
                <div className="w-8 h-px bg-[#D1BE9B]/40 mb-4" />
                <p className="text-[13px] leading-[2.2] text-[#31353A]/72 tracking-wider" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>{todayTarot.meaning}</p>
                <Link href="/tarot">
                  <button className="mt-6 px-6 py-2 text-[11px] tracking-[0.25em] border border-[#D1BE9B]/40 text-[#D1BE9B] rounded-full hover:bg-[#D1BE9B]/10 transition-all duration-300 active:scale-95" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    進行完整占卜
                  </button>
                </Link>
              </div>
              {!tarotFlipped && (
                <p className="text-[12px] leading-[2] text-[#31353A]/54 tracking-wider" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>宇宙正在為你準備一張屬於今日的塔羅。<br />當你準備好了，點擊牌面接收它的訊息。</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 bg-[#F2EDE8]/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Voices from the Soul</span>
            <h2 className="text-2xl md:text-3xl tracking-[0.18em] font-extralight text-[#31353A] mt-2" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>使用者心聲</h2>
          </div>

          {/* Auto-carousel testimonial */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700"
              style={{ transform: `translateX(-${testimonialsIdx * 100}%)`, transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-2">
                  <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/15 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-10 opacity-60">
                        {crystalIconMap[t.crystal] ?? <div className="w-8 h-10 rounded-full bg-[#D1BE9B]/20" />}
                      </div>
                    </div>
                    <p className="text-[13px] leading-[2.2] text-[#31353A]/72 tracking-wider mb-6 italic" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>「{t.text}」</p>
                    <p className="text-xs tracking-[0.15em] text-[#31353A]/82" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{t.name}</p>
                    <p className="text-[11px] tracking-[0.15em] text-[#D1BE9B] mt-0.5" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>{t.tag}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialsIdx(i)}
                  className="transition-all duration-300"
                  style={{
                    width: testimonialsIdx === i ? '1.5rem' : '0.4rem',
                    height: '0.4rem',
                    borderRadius: '9999px',
                    background: testimonialsIdx === i ? '#D1BE9B' : 'rgba(209,190,155,0.3)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
