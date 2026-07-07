import {
  CSSProperties,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  CalendarDays,
  Camera,
  ClipboardList,
  Gem,
  ImageUp,
  MessageCircle,
  Package,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import ContactDialog from '@/components/ContactDialog';
import ProductCareNotice from '@/components/ProductCareNotice';
import { useCart } from '@/contexts/CartContext';
import { CUSTOMER_FEEDBACK_PHOTO_ITEMS } from '@/data/customerFeedbackPhotos';

const GALLERY_PHOTOS = CUSTOMER_FEEDBACK_PHOTO_ITEMS;
const GALLERY_IMAGES = GALLERY_PHOTOS.map(photo => photo.full);

// 主視覺使用商品照示範客製風格，圖片以完整顯示避免裁切到手鍊。
const HERO_IMAGES = [
  '/products/misty-starlight/1.jpg',
  '/products/jiao-tang-ma-qi-duo/2.jpg',
  '/products/wen-rou-yue-guang/1.jpg',
];
const CHARM_REFERENCE_IMAGES = [
  {
    src: '/custom-bracelet/fox-pixiu-reference.png',
    title: '狐仙／貔貅示意',
    note: '狐仙或貔貅加購款式 +400',
  },
  {
    src: '/custom-bracelet/pixiu-reference.png',
    title: '貔貅示意',
    note: '貔貅加購款式 +400',
  },
  {
    src: '/custom-bracelet/cat-head-reference.png',
    title: '貓貓頭示意',
    note: '貓貓頭加購款式 +300',
  },
];
const CUSTOM_BRACELET_IMAGE = '/custom-bracelet/charms-reference.png';
const FEATURED_IMAGES = GALLERY_IMAGES.slice(3, 11);
// 顧客回饋跑馬牆：兩排照片反向捲動。
const MARQUEE_ROW_1 = GALLERY_PHOTOS.slice(0, 12);
const MARQUEE_ROW_2 = GALLERY_PHOTOS.slice(12);
const LIGHTBOX_IMAGES = [
  ...HERO_IMAGES,
  ...GALLERY_IMAGES,
  CUSTOM_BRACELET_IMAGE,
  ...CHARM_REFERENCE_IMAGES.map(image => image.src),
];

// Hero 背景飄浮的微光星點位置。
const SPARKLES = [
  { top: '12%', left: '7%', size: 7, delay: '0s' },
  { top: '24%', left: '84%', size: 4, delay: '1.3s' },
  { top: '58%', left: '14%', size: 5, delay: '2.2s' },
  { top: '46%', left: '70%', size: 4, delay: '0.7s' },
  { top: '78%', left: '40%', size: 6, delay: '1.8s' },
  { top: '16%', left: '50%', size: 3, delay: '2.7s' },
];

const STEP_ITEMS = [
  {
    icon: ClipboardList,
    no: '01',
    title: '填寫需求表單',
    desc: '告訴我們你的近期狀態、想加強的能量，以及色系與配戴偏好。',
  },
  {
    icon: Gem,
    no: '02',
    title: '討論專屬設計圖',
    desc: '依你的方向挑選專屬水晶並繪製設計圖，提供 3 次免費修改。',
  },
  {
    icon: Package,
    no: '03',
    title: '手工串製與出貨',
    desc: '確認後細心手工串製，單條即享免運，把專屬能量送到你身邊。',
  },
];

const FEATURE_ITEMS = [
  {
    title: '依照需求搭配專屬水晶',
    desc: '依照想加強的能量、喜歡的色系與配戴習慣，討論出更貼近你的水晶組合。',
  },
  {
    title: '高品質天然水晶挑選',
    desc: '水晶仔細挑選，優先使用品質穩定、少雜質、光澤乾淨的珠材與配件。',
  },
  {
    title: '購買一條即享免運',
    desc: '客製化手鍊單條即免運，讓專屬能量可以更輕鬆地到你身邊。',
  },
  {
    title: '終生免費換線',
    desc: '手鍊後續配戴需要換線時，可享終生免費換線服務。',
  },
  {
    title: '設計圖 3 次免費修改',
    desc: '設計圖提供 3 次免費修改，讓成品更接近你心裡想要的樣子。',
  },
];

// 金/銀示意圖：以實際商品照示範金屬光澤，選用完整手鍊照避免裁切。
const METAL_OPTIONS = [
  { key: '金飾', en: 'Gold', image: '/products/jiao-tang-ma-qi-duo/2.jpg' },
  { key: '銀飾', en: 'Silver', image: '/products/wei-lan-wei-guang/1.jpg' },
  { key: '都可以，依款式造型設計', en: 'Designer’s Choice', image: '/products/misty-starlight/1.jpg' },
];

const CLASP_OPTIONS = [
  { key: '彈力繩', en: 'Elastic Cord', image: '/products/cheng-guang/1.jpg', imageClassName: 'object-cover' },
  { key: 'OT扣', en: 'Toggle Clasp', image: '/custom-bracelet/clasps/ot-toggle.png', imageClassName: 'object-contain p-1 group-hover:scale-[1.02]' },
  {
    key: '延長鏈',
    en: 'Extension Chain',
    image: '/custom-bracelet/clasps/extension-chain.png',
    imageClassName: 'object-cover object-[62%_58%] scale-[1.12] group-hover:scale-[1.15]',
  },
  {
    key: '都可以，依款式造型設計',
    en: 'Designer’s Choice',
    image: '/products/misty-starlight/1.jpg',
    imageClassName: 'object-contain',
  },
];

const CUSTOM_BASE_PRICE = 1580;

const CHARM_NEED_OPTIONS = [
  '需要加吊飾',
  '不需要加吊飾',
];

const CHARM_STYLE_OPTIONS = [
  '狐仙 +400',
  '貔貅 +400',
  '貓貓頭 +300',
  '都可以，依款式造型設計',
];

const CHARM_PRICE_MAP: Record<string, number> = {
  '狐仙 +400': 400,
  '貔貅 +400': 400,
  '貓貓頭 +300': 300,
};

const getCharmLabel = (need: string, preference: string) => {
  if (need !== '需要加吊飾') return '不加吊飾';
  if (preference.startsWith('狐仙')) return '加狐仙';
  if (preference.startsWith('貔貅')) return '加貔貅';
  if (preference.startsWith('貓貓頭')) return '加貓貓頭';
  if (preference.startsWith('都可以')) return '吊飾由設計師搭配';
  return '加吊飾，款式待確認';
};

const getCustomPrice = (need: string, preference: string) =>
  CUSTOM_BASE_PRICE + (need === '需要加吊飾' ? (CHARM_PRICE_MAP[preference] ?? 0) : 0);

const FORM_INITIAL = {
  name: '',
  birthDate: '',
  wristSize: '',
  fitPreference: '',
  energyNeeds: '',
  colorPreference: '',
  favoriteCrystals: '',
  avoidCrystals: '',
  metalPreference: '',
  claspPreference: '',
  charmNeed: '',
  charmPreference: '',
  contact: '',
  notes: '',
};

type CustomForm = typeof FORM_INITIAL;
type BraceletMode = 'general' | 'numerology';

const PAGE_COPY: Record<
  BraceletMode,
  {
    title: string;
    heroEyebrow: string;
    titleAccent: number;
    formTitle: string;
    contactProductName: string;
    heroIntro: string;
    heroLead: string;
  }
> = {
  general: {
    title: '一般客製化手鍊',
    heroEyebrow: 'Custom Crystal Bracelet',
    titleAccent: 0,
    formTitle: '一般客製化手鍊諮詢表單',
    contactProductName: '一般客製化手鍊',
    heroIntro: '',
    heroLead: '老闆只嚴選高品質、雜質少的天然水晶，所以每一顆看起來都特別透亮，也蘊藏著更飽滿的能量。',
  },
  numerology: {
    title: '生命靈數客製化手鍊',
    heroEyebrow: 'Life Path Number',
    titleAccent: 4,
    formTitle: '生命靈數客製化手鍊諮詢表單',
    contactProductName: '生命靈數客製化手鍊',
    heroIntro:
      '生命靈數會從你的出生年月日整理出天生特質、行動節奏與現階段適合補強的能量方向。客製時會把生日數字與你近期的需求一起參考，讓水晶搭配更貼近你的個人狀態。',
    heroLead: '老闆只嚴選高品質、雜質少的天然水晶，所以每一顆看起來都特別透亮，也蘊藏著更飽滿的能量。',
  },
};

export default function CustomBraceletPage() {
  const [location] = useLocation();
  const mode: BraceletMode = location.includes('/numerology') ? 'numerology' : 'general';
  const copy = PAGE_COPY[mode];
  const { addItem } = useCart();
  const [form, setForm] = useState<CustomForm>(FORM_INITIAL);
  const [showContactModal, setShowContactModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState('');
  const referenceImageInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCharmLabel = getCharmLabel(form.charmNeed, form.charmPreference);
  const selectedCustomPrice = getCustomPrice(form.charmNeed, form.charmPreference);

  const update = (key: keyof CustomForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  // 金/銀互斥（一條通常一種金屬），保留使用者補充的其他文字。
  const toggleMetal = (key: string) => {
    const parts = form.metalPreference.split('、').map((s) => s.trim()).filter(Boolean);
    const metalKeys = METAL_OPTIONS.map((option) => option.key);
    const withoutMetals = parts.filter((p) => !metalKeys.includes(p));
    const next = parts.includes(key) ? withoutMetals : [key, ...withoutMetals];
    update('metalPreference', next.join('、'));
  };

  const toggleClasp = (key: string) => {
    update('claspPreference', form.claspPreference === key ? '' : key);
  };

  const selectCharmNeed = (value: string) => {
    setForm((current) => ({
      ...current,
      charmNeed: value,
      charmPreference: value === '需要加吊飾' ? current.charmPreference : '',
    }));
  };

  const selectCharmPreference = (value: string) => {
    setForm((current) => ({
      ...current,
      charmNeed: '需要加吊飾',
      charmPreference: value,
    }));
  };

  const handleReferenceImageChange = (file?: File) => {
    if (!file) {
      setReferenceImage(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('請上傳圖片檔案');
      if (referenceImageInputRef.current) referenceImageInputRef.current.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('圖片檔案請小於 8MB');
      if (referenceImageInputRef.current) referenceImageInputRef.current.value = '';
      return;
    }
    setReferenceImage(file);
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (referenceImageInputRef.current) referenceImageInputRef.current.value = '';
  };

  const galleryCount = showAllPhotos ? GALLERY_IMAGES.length : FEATURED_IMAGES.length;
  const shownGallery = showAllPhotos ? GALLERY_IMAGES : FEATURED_IMAGES;

  const openLightbox = (src: string) => {
    const index = LIGHTBOX_IMAGES.indexOf(src);
    setLightboxIndex(index >= 0 ? index : 0);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const stepLightbox = (dir: number) =>
    setLightboxIndex((current) => {
      if (current === null) return current;
      const total = LIGHTBOX_IMAGES.length;
      return (current + dir + total) % total;
    });

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex]);

  useEffect(() => {
    if (!referenceImage) {
      setReferenceImagePreview('');
      return;
    }
    const nextPreview = URL.createObjectURL(referenceImage);
    setReferenceImagePreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [referenceImage]);

  const handleAddToCart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.wristSize.trim() || !form.energyNeeds.trim()) {
      toast.error('請先填寫姓名、聯絡方式、手圍與主要需求');
      return;
    }
    if (!form.charmNeed.trim()) {
      toast.error('請先選擇是否需要加吊飾');
      return;
    }
    if (form.charmNeed === '需要加吊飾' && !form.charmPreference.trim()) {
      toast.error('請先選擇想加強的能量吊飾');
      return;
    }
    if (mode === 'numerology' && !form.birthDate.trim()) {
      toast.error('請先填寫出生年月日');
      return;
    }

    addItem(
      {
        slug: `custom-bracelet-${mode}-${form.charmNeed === '需要加吊飾' ? form.charmPreference : 'no-charm'}`,
        name: `${copy.contactProductName}（${selectedCharmLabel}）`,
        price: selectedCustomPrice,
        img: CUSTOM_BRACELET_IMAGE,
      },
      { open: true },
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#FAF7F4] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 animate-fade-in-up">
            <Link href="/shop">
              <button
                className="inline-flex items-center gap-2 border-none bg-transparent text-xs tracking-[0.2em] text-[#31353A]/62 transition-colors duration-300 hover:text-[#31353A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                <span>←</span>
                返回療癒水晶
              </button>
            </Link>
          </div>

          {/* Hero：介紹＋主 CTA 在左，主視覺大圖在右 */}
          <section className="relative mb-16 md:mb-20">
            {/* 夢幻氛圍層：緩慢流動的柔光暈 + 飄浮微光星點 */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <div className="animate-blob-drift absolute -left-16 -top-12 h-64 w-64 rounded-full bg-[#D1BE9B]/30 blur-3xl" />
              <div className="animate-blob-drift-slow absolute right-0 top-16 h-72 w-72 rounded-full bg-[#E9C9C9]/25 blur-3xl" />
              <div className="animate-blob-drift absolute bottom-[-2rem] left-1/3 h-56 w-56 rounded-full bg-[#CBD6C4]/22 blur-3xl" />
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="animate-twinkle absolute select-none text-[#D1BE9B]"
                  style={{ top: s.top, left: s.left, fontSize: `${s.size}px`, animationDelay: s.delay }}
                >
                  ✦
                </span>
              ))}
            </div>

            <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
            <div className="relative">
              <p
                className="mb-3 animate-fade-in-up text-[19px] italic tracking-[0.02em] text-[#A38D6B]"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
              >
                {copy.heroEyebrow}
              </p>
              <h1
                className="mb-5 text-3xl leading-[1.35] tracking-[0.12em] text-[#31353A] md:text-[2.6rem]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                {copy.title.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="tagline-char"
                    style={{ animationDelay: `${0.12 + i * 0.06}s`, color: i < copy.titleAccent ? '#A38D6B' : undefined }}
                  >
                    {ch}
                  </span>
                ))}
              </h1>
              {copy.heroIntro && (
                <div
                  className="animate-fade-in-up mb-5 overflow-hidden rounded-3xl border border-[#C9B7E0]/35 bg-gradient-to-br from-white/62 to-[#F1EAFA]/48 px-5 py-4 shadow-[0_12px_30px_rgba(150,130,190,0.10)]"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="mb-2 flex items-center gap-2 text-[#8E79A8]">
                    <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                    <span
                      className="text-[11px] tracking-[0.16em]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      生日 · 能量方向
                    </span>
                    <span aria-hidden className="animate-twinkle ml-auto text-[11px] text-[#C9B7E0]">✦</span>
                  </div>
                  <p
                    className="text-[13px] leading-[1.9] tracking-[0.04em] text-[#31353A]/74"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    {copy.heroIntro}
                  </p>
                </div>
              )}
              <p
                className="animate-fade-in-up mb-7 max-w-xl whitespace-pre-line text-[14.5px] leading-[2] tracking-[0.04em] text-[#31353A]/78"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300, animationDelay: '0.7s' }}
              >
                {copy.heroLead}
              </p>
              <div className="animate-fade-in-up flex flex-wrap items-center gap-3" style={{ animationDelay: '0.85s' }}>
                <a
                  href="#custom-form"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#3D4144] px-6 py-3 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-md shadow-[#3D4144]/10 transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <Sparkles className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[18deg]" />
                  開始客製我的手鍊
                </a>
                <a
                  href="#real-feedback"
                  className="group inline-flex items-center gap-2 rounded-full border border-[#D1BE9B]/30 bg-white/54 px-5 py-3 text-xs tracking-[0.18em] text-[#8F7957] shadow-[0_10px_24px_rgba(163,141,107,0.07)] transition-all duration-300 hover:border-[#A38D6B]/42 hover:bg-white/78 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <Camera className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.55} />
                  <span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>
                      Real Feedback
                    </span>
                    <span className="mx-2 text-[#D1BE9B]">｜</span>
                    顧客回饋
                  </span>
                </a>
                <span
                  className="text-[11px] tracking-[0.14em] text-[#31353A]/50"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  單條免運 · 設計圖 3 次免修 · 終生免費換線
                </span>
              </div>
            </div>

            <div className="animate-fade-in-up">
              <div className="grid grid-cols-3 gap-3">
                <TiltImage
                  src={HERO_IMAGES[0]}
                  alt="客製化手鍊實拍主視覺"
                  onClick={() => openLightbox(HERO_IMAGES[0])}
                  className="group col-span-3 aspect-[16/11] overflow-hidden rounded-3xl border border-[#D1BE9B]/25 bg-[#F7F1E8] shadow-[0_16px_40px_rgba(209,190,155,0.18)] will-change-transform"
                  imgClassName="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
                {HERO_IMAGES.slice(1).map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => openLightbox(src)}
                    className={`group col-span-1 aspect-square overflow-hidden rounded-2xl border border-[#D1BE9B]/25 bg-[#F7F1E8] shadow-sm ${
                      idx === 0 ? 'animate-float-soft-delay-1' : 'animate-float-soft-delay-2'
                    }`}
                  >
                    <img
                      src={src}
                      alt="客製化手鍊實拍"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => openLightbox(GALLERY_IMAGES[3])}
                  className="animate-float-soft col-span-1 flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-[#D1BE9B]/30 bg-[#D1BE9B]/10 text-center transition-colors hover:bg-[#D1BE9B]/18"
                >
                  <span className="text-lg text-[#A38D6B]">＋</span>
                  <span
                    className="text-[11px] tracking-[0.1em] text-[#A38D6B]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    看更多實拍
                  </span>
                </button>
              </div>
            </div>
            </div>
          </section>

          {/* 客製 3 步驟 */}
          <Reveal className="mb-16 md:mb-20">
            <SectionHeading eyebrow="How It Works" title="客製流程只要三步" />
            <div className="relative">
              {/* 連接三步驟的細線，區塊浮現時由左至右畫入（桌機） */}
              <svg
                aria-hidden
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-[14%] right-[14%] top-[50px] z-0 hidden h-[2px] md:block"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100"
                  y2="1"
                  pathLength={1}
                  className="step-connector"
                  stroke="#D1BE9B"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10 grid gap-4 md:grid-cols-3">
              {STEP_ITEMS.map(({ icon: Icon, no, title, desc }, i) => (
                <div
                  key={title}
                  className="reveal-child relative overflow-hidden rounded-3xl border border-[#D1BE9B]/22 bg-white/55 px-6 py-7 shadow-[0_10px_30px_rgba(209,190,155,0.08)]"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* 大編號當作結構水印 */}
                  <span
                    className="pointer-events-none absolute -right-1 -top-3 select-none text-[76px] leading-none text-[#D1BE9B]/15"
                    style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontStyle: 'italic' }}
                  >
                    {no}
                  </span>
                  <div className="relative mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3D4144] text-[#FAF7F4]">
                      <Icon className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span
                      className="text-[22px] leading-none text-[#A38D6B]"
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontStyle: 'italic' }}
                    >
                      {no}
                    </span>
                  </div>
                  <h3
                    className="mb-2 text-[15px] tracking-[0.1em] text-[#31353A]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[12.5px] leading-[1.9] tracking-[0.04em] text-[#31353A]/70"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
              </div>
            </div>
          </Reveal>

          {/* 服務保障：改為不落單的清單 */}
          <Reveal className="mb-16 md:mb-20">
            <SectionHeading eyebrow="What You Get" title="每一條客製手鍊都包含" />
            <div className="grid gap-x-8 gap-y-4 rounded-3xl border border-[#D1BE9B]/22 bg-white/45 px-6 py-7 md:grid-cols-2 md:px-9 md:py-9">
              {FEATURE_ITEMS.map((item, i) => (
                <div
                  key={item.title}
                  className="reveal-child flex items-start gap-3"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D1BE9B]/25 text-[10px] text-[#A38D6B]">
                    ✓
                  </span>
                  <div>
                    <p
                      className="mb-0.5 text-[13px] tracking-[0.08em] text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-[12px] leading-[1.8] tracking-[0.03em] text-[#31353A]/62"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* 顧客回饋＆實拍：精選 + 燈箱 */}
          <Reveal id="real-feedback" className="mb-16 scroll-mt-24 md:mb-20">
            <SectionHeading
              eyebrow="Real Feedback"
              title="顧客回饋＆客製化實拍"
              note="以下照片皆為顧客回饋與客製化商品實拍，點擊可放大瀏覽。"
            />
            <div className="space-y-3">
              {[
                { photos: MARQUEE_ROW_1, dir: 'left' as const },
                { photos: MARQUEE_ROW_2, dir: 'right' as const },
              ].map((row) => (
                <div key={row.dir} className="gallery-marquee overflow-hidden">
                  <div className={`gallery-row ${row.dir === 'left' ? 'gallery-row-left' : 'gallery-row-right'}`}>
                    {[...row.photos, ...row.photos].map((photo, i) => (
                      <button
                        key={`${photo.full}-${i}`}
                        type="button"
                        aria-label="放大顧客實拍"
                        onClick={() => openLightbox(photo.full)}
                        className="group relative mr-3 aspect-[3/4] w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-[#D1BE9B]/20 bg-white/40 md:w-48"
                      >
                        <img
                          src={photo.thumb}
                          alt="顧客回饋與客製化商品實拍圖"
                          loading="lazy"
                          decoding="async"
                          width={360}
                          height={480}
                          sizes="(min-width: 768px) 12rem, 10rem"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-[#2b2622]/72 to-transparent px-3 pb-2 pt-9 text-[10px] tracking-[0.14em] text-white/90 transition-transform duration-300 group-hover:translate-y-0"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                        >
                          顧客實拍 ✦
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[10px] tracking-[0.18em] text-[#31353A]/42"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              滑過暫停 · 點擊任一張放大瀏覽
            </p>
          </Reveal>

          {/* 客製需求表單 */}
          <Reveal id="custom-form" className="mb-16 grid scroll-mt-24 gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="reveal-child">
              <SectionHeading eyebrow="Custom Form" title="客製化需求表單" compact />
            </div>

            <form
              onSubmit={handleAddToCart}
              className="reveal-child rounded-3xl border border-[#D1BE9B]/22 bg-white/55 p-5 shadow-[0_12px_36px_rgba(209,190,155,0.10)] md:p-8"
              style={{ transitionDelay: '90ms' }}
            >
              <FieldGroup label="基本資料">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="姓名" required>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="請填寫姓名" />
                  </Field>
                  {mode === 'numerology' && (
                    <Field label="出生年月日" required hint="請填寫陽曆生日，作為生命靈數客製搭配參考。">
                      <input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) => update('birthDate', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  )}
                  <Field label="手圍尺寸" required hint="拿軟尺平貼手腕繞一圈量測。沒有軟尺時，可以用棉線或紙條繞手圍，用筆做記號後，再用一般直尺量那段長度。">
                    <input value={form.wristSize} onChange={(e) => update('wristSize', e.target.value)} className={inputClass} placeholder="例如 15 cm" />
                  </Field>
                  <Field label="配戴鬆緊">
                    <select value={form.fitPreference} onChange={(e) => update('fitPreference', e.target.value)} className={inputClass}>
                      <option value="">請選擇</option>
                      <option value="貼手">貼手</option>
                      <option value="剛好">剛好</option>
                      <option value="微鬆">微鬆</option>
                    </select>
                  </Field>
                  <Field label="Instagram / LINE（以便私訊客製設計完成的手鍊圖）" required>
                    <input value={form.contact} onChange={(e) => update('contact', e.target.value)} className={inputClass} placeholder="@account 或 LINE ID" />
                  </Field>
                </div>
              </FieldGroup>

              <FieldGroup label="能量需求">
                <div className="grid gap-4">
                  <Field label="想加強的功效或需求" required wide>
                    <textarea value={form.energyNeeds} onChange={(e) => update('energyNeeds', e.target.value)} className={textareaClass} placeholder="例如招財、桃花、人緣、穩定情緒，或最近遇到的狀態" />
                  </Field>
                </div>
              </FieldGroup>

              <FieldGroup label="外觀偏好" last>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="喜歡的色系" wide>
                    <input value={form.colorPreference} onChange={(e) => update('colorPreference', e.target.value)} className={inputClass} placeholder="例如粉色、綠色、清透、低調金色" />
                  </Field>
                  <Field
                    label="理想手鍊款式參考圖"
                    group
                    hint="選填。可以上傳喜歡的手鍊款式、配色或排列照片供我們參考；我們會依照參考方向設計，成品不一定會與參考圖完全相同。"
                    wide
                  >
                    <div className="rounded-2xl border border-dashed border-[#D1BE9B]/38 bg-[#FAF7F4]/62 p-3">
                      <input
                        ref={referenceImageInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleReferenceImageChange(e.target.files?.[0])}
                      />
                      {referenceImage && referenceImagePreview ? (
                        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                          <div className="aspect-square overflow-hidden rounded-2xl border border-[#D1BE9B]/24 bg-white/70">
                            <img
                              src={referenceImagePreview}
                              alt="理想手鍊款式參考圖預覽"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-col justify-center gap-3">
                            <div>
                              <p
                                className="truncate text-[12px] tracking-[0.06em] text-[#31353A]/82"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                              >
                                {referenceImage.name}
                              </p>
                              <p
                                className="mt-1 text-[11px] tracking-[0.04em] text-[#31353A]/54"
                                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                              >
                                已加入參考圖，送出表單時會提醒你私訊一併附上。
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => referenceImageInputRef.current?.click()}
                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#D1BE9B]/30 bg-white/65 px-4 py-2 text-[11px] tracking-[0.12em] text-[#8F7957] transition-colors hover:bg-white"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                              >
                                <ImageUp className="h-3.5 w-3.5" />
                                更換圖片
                              </button>
                              <button
                                type="button"
                                onClick={clearReferenceImage}
                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#B58D8D]/25 bg-white/45 px-4 py-2 text-[11px] tracking-[0.12em] text-[#9B6767] transition-colors hover:bg-[#F8EEEE]"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                移除
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => referenceImageInputRef.current?.click()}
                          className="flex min-h-[132px] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-white/45 px-4 py-5 text-center transition-colors hover:bg-white/70"
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D1BE9B]/18 text-[#A38D6B]">
                            <ImageUp className="h-5 w-5" strokeWidth={1.6} />
                          </span>
                          <span
                            className="text-[12px] tracking-[0.14em] text-[#31353A]/72"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                          >
                            上傳理想款式圖片
                          </span>
                          <span
                            className="text-[11px] leading-[1.7] tracking-[0.04em] text-[#31353A]/48"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                          >
                            支援手機相簿圖片，檔案請小於 8MB。
                          </span>
                        </button>
                      )}
                    </div>
                  </Field>
                  <Field label="喜歡或指定的水晶">
                    <textarea value={form.favoriteCrystals} onChange={(e) => update('favoriteCrystals', e.target.value)} className={textareaClass} placeholder="沒有也可以留空" />
                  </Field>
                  <Field label="不喜歡或想避開的水晶">
                    <textarea value={form.avoidCrystals} onChange={(e) => update('avoidCrystals', e.target.value)} className={textareaClass} placeholder="例如不要黑色、不要太大顆" />
                  </Field>
                  <Field label="喜歡金飾還是銀飾？" group wide>
                    <div className="mb-2.5 grid gap-2.5 sm:grid-cols-3">
                      {METAL_OPTIONS.map((m) => {
                        const active = form.metalPreference.split('、').map((s) => s.trim()).includes(m.key);
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => toggleMetal(m.key)}
                            className={`group overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                              active
                                ? 'border-[#A38D6B] ring-1 ring-[#A38D6B]/30'
                                : 'border-[#D1BE9B]/25 hover:border-[#A38D6B]/45'
                            }`}
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-[#F0E8DC]">
                              <img
                                src={m.image}
                                alt={`${m.key}示意`}
                                loading="lazy"
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <span className="flex items-center justify-between px-3 py-2">
                              <span className="text-[12px] tracking-[0.1em] text-[#31353A]/80" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                                {m.key}
                                <span className="ml-1.5 text-[10px] italic tracking-normal text-[#A38D6B]/70" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                  {m.en}
                                </span>
                              </span>
                              {active && <span className="text-[11px] text-[#A38D6B]">✓</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p
                      className="mb-3 rounded-2xl border border-[#D1BE9B]/20 bg-white/45 px-3.5 py-2.5 text-[11px] leading-[1.8] tracking-[0.06em] text-[#31353A]/68"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      銀飾款式依設計不同，可能使用 14K 包金、純銀或鍍銀材質。若日常配戴會頻繁碰水，建議優先選擇金飾款，保養上會更安心。
                    </p>
                  </Field>
                  <Field label="扣件類型選擇" group wide>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {CLASP_OPTIONS.map((option) => {
                        const active = form.claspPreference === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => toggleClasp(option.key)}
                            className={`group overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                              active
                                ? 'border-[#A38D6B] ring-1 ring-[#A38D6B]/30'
                                : 'border-[#D1BE9B]/25 hover:border-[#A38D6B]/45'
                            }`}
                            aria-pressed={active}
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-[#F0E8DC]">
                              <img
                                src={option.image}
                                alt={`${option.key}示意圖`}
                                loading="lazy"
                                className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${option.imageClassName}`}
                              />
                            </div>
                            <span className="flex min-h-[44px] items-center justify-between px-3 py-2">
                              <span className="text-[12px] tracking-[0.1em] text-[#31353A]/80" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                                {option.key}
                                <span className="mt-0.5 block text-[10px] italic tracking-normal text-[#A38D6B]/70" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                  {option.en}
                                </span>
                              </span>
                              {active && <span className="text-[11px] text-[#A38D6B]">✓</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field
                    label="需要加吊飾嗎？"
                    group
                    required
                    wide
                  >
                    <button
                      type="button"
                      onClick={() => openLightbox(CUSTOM_BRACELET_IMAGE)}
                      className="group mb-3 block w-full overflow-hidden rounded-2xl border border-[#D1BE9B]/22 bg-[#F0E8DC] text-left transition-all duration-200 hover:border-[#A38D6B]/45"
                    >
                      <img
                        src={CUSTOM_BRACELET_IMAGE}
                        alt="吊飾總覽參考"
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <span className="block bg-white/72 px-3 py-2">
                        <span className="block text-[12px] tracking-[0.1em] text-[#31353A]/80" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                          吊飾款式總覽
                        </span>
                        <span className="mt-0.5 block text-[10px] tracking-[0.08em] text-[#A38D6B]/75" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                          可先看整體款式，再選擇是否加強能量。
                        </span>
                      </span>
                    </button>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {CHARM_NEED_OPTIONS.map((option) => {
                        const active = form.charmNeed === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => selectCharmNeed(option)}
                            className={`rounded-full border px-4 py-3 text-center text-[12px] tracking-[0.12em] transition-all duration-200 ${
                              active
                                ? 'border-[#A38D6B] bg-[#3D4144] text-[#FAF7F4]'
                                : 'border-[#D1BE9B]/28 bg-white/55 text-[#31353A]/68 hover:border-[#A38D6B]/50'
                            }`}
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                            aria-pressed={active}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field
                    label="想加強能量嗎？"
                    group
                    required={form.charmNeed === '需要加吊飾'}
                    wide
                  >
                    <div className="overflow-hidden rounded-2xl border border-[#D1BE9B]/24 bg-white/55">
                      <div className="grid gap-2.5 p-2.5 sm:grid-cols-3">
                        {CHARM_REFERENCE_IMAGES.map((image) => (
                          <button
                            key={image.src}
                            type="button"
                            onClick={() => openLightbox(image.src)}
                            className="group overflow-hidden rounded-xl border border-[#D1BE9B]/18 bg-[#F0E8DC] text-left transition-all duration-200 hover:border-[#A38D6B]/45"
                          >
                            <img
                              src={image.src}
                              alt={image.title}
                              loading="lazy"
                              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <span className="block bg-white/72 px-3 py-2">
                              <span className="block text-[12px] tracking-[0.1em] text-[#31353A]/80" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                                {image.title}
                              </span>
                              <span className="mt-0.5 block text-[10px] tracking-[0.08em] text-[#A38D6B]/75" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                {image.note}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                        {CHARM_STYLE_OPTIONS.map((option) => {
                          const active = form.charmPreference === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => selectCharmPreference(option)}
                              className={`rounded-full border px-3 py-2.5 text-center text-[11px] tracking-[0.1em] transition-all duration-200 ${
                                active
                                  ? 'border-[#A38D6B] bg-[#3D4144] text-[#FAF7F4]'
                                  : 'border-[#D1BE9B]/28 bg-[#FAF7F4]/70 text-[#31353A]/68 hover:border-[#A38D6B]/50'
                              }`}
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                              aria-pressed={active}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Field>
                  <Field label="其他備註" wide>
                    <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className={textareaClass} placeholder="其他想補充的需求" />
                  </Field>
                </div>
              </FieldGroup>

              <div className="mt-7 rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/68 px-4 py-3">
                <span
                  className="text-[18px] tracking-[0.04em] text-[#A38D6B]"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
                >
                  NT$ {selectedCustomPrice.toLocaleString('zh-TW')}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3D4144] px-5 py-3.5 text-xs tracking-[0.2em] text-[#FAF7F4] shadow-sm transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    加入購物車
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/30 bg-[#FAF7F4]/70 px-5 py-3.5 text-xs tracking-[0.2em] text-[#A38D6B] transition-all duration-300 hover:bg-[#D1BE9B]/15 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <MessageCircle className="h-4 w-4" />
                  有問題可私訊
                </button>
              </div>
            </form>
          </Reveal>

          <ProductCareNotice variant="custom" />
        </div>
      </div>

      {/* 燈箱 */}
      {lightboxIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="lightbox-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-[#1c1a18]/80 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white/90 transition-colors hover:bg-white/25"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(-1);
            }}
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:left-8"
            aria-label="上一張"
          >
            ‹
          </button>
          <img
            key={lightboxIndex}
            src={LIGHTBOX_IMAGES[lightboxIndex]}
            alt="客製化手鍊實拍放大"
            onClick={(e) => e.stopPropagation()}
            className="lightbox-image max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(1);
            }}
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:right-8"
            aria-label="下一張"
          >
            ›
          </button>
          <span className="absolute bottom-6 text-[11px] tracking-[0.2em] text-white/60">
            {lightboxIndex + 1} / {LIGHTBOX_IMAGES.length}
          </span>
        </div>,
        document.body,
      )}

      <ContactDialog
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        productName={copy.contactProductName}
      />
    </PageLayout>
  );
}

const inputClass =
  'w-full rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/75 px-4 py-3 text-[12.5px] tracking-[0.04em] text-[#31353A]/80 outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-[#A38D6B]/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(209,190,155,0.18)]';

const textareaClass = `${inputClass} min-h-[104px] resize-y leading-[1.8]`;

// 捲動進入視窗才浮現（只觸發一次），delay 供同區塊卡片交錯。
function Reveal({
  children,
  className = '',
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// 主視覺大圖：滑鼠移動時以彈簧做細微 3D 傾斜（純裝飾，reduced-motion 時停用）。
function TiltImage({
  src,
  alt,
  onClick,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  onClick: () => void;
  className?: string;
  imgClassName?: string;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 14 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 14 });

  const handleMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      <img src={src} alt={alt} className={imgClassName} />
    </motion.button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  note,
  compact,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mb-4' : 'mb-6'}>
      <p
        className="mb-1.5 text-[16px] italic tracking-[0.04em] text-[#A38D6B]"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-xl tracking-[0.12em] text-[#31353A] md:text-2xl"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
      >
        {title}
      </h2>
      {note && (
        <p
          className="mt-2 text-[11.5px] leading-[1.8] tracking-[0.04em] text-[#31353A]/55"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function FieldGroup({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <fieldset className={last ? '' : 'mb-6'}>
      <legend
        className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#A38D6B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
      >
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  group,
  required,
  wide,
  hint,
  children,
}: {
  label: string;
  group?: boolean;
  required?: boolean;
  wide?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      <span
        className="mb-1.5 flex items-center gap-1 text-[11px] tracking-[0.12em] text-[#31353A]/70"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
      >
        {label}
        {required && <span className="text-[#B88080]">*</span>}
      </span>
      {children}
      {hint && (
        <span
          className="mt-2 block text-[11px] leading-[1.75] tracking-[0.03em] text-[#31353A]/52"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
        >
          {hint}
        </span>
      )}
    </>
  );

  if (group) {
    return <div className={wide ? 'md:col-span-2' : ''}>{content}</div>;
  }

  return (
    <label className={wide ? 'md:col-span-2' : ''}>
      {content}
    </label>
  );
}
