/**
 * SOUL EASE | Mochi．crystal — Shop Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Luxury E-commerce
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatSitting, CatPeeking } from '@/components/CatElements';
import {
  PRODUCTS,
  CATEGORY_OPTIONS,
  getProductCategories,
  getProductFitSummary,
  getProductImageStyle,
  type Product,
} from '@/data/products';
import ContactDialog from '@/components/ContactDialog';

// 精選輪播選品，使用獨立圖片避免輪播文案遮到手鍊本身。
type FeaturedProduct = Product & { featuredImage: string };

const FEATURED_SLIDES: Array<{ slug: string; image: string }> = [
  { slug: 'guang-yu-zhi-jing', image: '/products/guang-yu-zhi-jing/3.jpg' },
  { slug: 'xing-yao-zhi-xing', image: '/products/xing-yao-zhi-xing/2.jpg' },
  { slug: 'nuan-yu', image: '/products/nuan-yu/2.jpg' },
];
const STATS = [
  { value: '5000+', label: '滿意顧客' },
  { value: '100%', label: '天然水晶' },
];

// 顧客回饋＆實拍照（沿用客製頁那批真實顧客照）。
const FEEDBACK_PHOTOS = Array.from(
  { length: 24 },
  (_, i) => `/custom-bracelet/general/IMG_${4826 + i}.PNG`,
);

const SORT_OPTIONS = [
  { id: 'sales_desc', label: '熱銷商品排序' },
  { id: 'default', label: '商品上架順序' },
  { id: 'price_asc', label: '價格由低到高' },
  { id: 'price_desc', label: '價格由高到低' },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]['id'];

const PRODUCT_SALES_COUNTS: Record<string, number> = {
  'misty-starlight': 486,
  'guang-yu-zhi-jing': 452,
  'xing-yao-zhi-xing': 431,
  'wen-rou-yue-guang': 407,
  'nuan-yu': 392,
  'wish-fox': 365,
  'forest-bloom': 342,
  'starwish-fox-bracelet': 318,
  'jiao-tang-ma-qi-duo': 296,
  'liu-jin-zhi-yao': 274,
  'glimmer-fox': 251,
  'yue-ying-rou-guang': 236,
  'wealth-stone': 219,
  'hu-yu-wei-tian': 204,
  'courage-cat': 188,
  'calm-light': 172,
  'moonlight-wings': 161,
  'lan-jing-zhi-yao': 148,
  'mei-yu-xin-yuan': 137,
  'wei-lan-wei-guang': 126,
  'wish-bunny': 119,
  'xue-jing-wen-rou': 108,
  'xin-yu-ni-nan': 96,
  'xi-guang-zhi-yong': 88,
  'cheng-guang': 76,
  'yue-ying-zhi-hua': 64,
  'xi-guang': 53,
  'nuan-ying': 47,
  'jing-lan': 41,
};

const CUSTOM_BRACELET_CATEGORY = 'custom-bracelet';

const CUSTOM_BRACELETS = [
  {
    title: '一般客製化手鍊',
    subtitle: '依照需求搭配專屬水晶',
    description: '從功效、色系、手圍與配戴習慣開始，討論出最貼近你的水晶手鍊。',
    image: '/products/misty-starlight/1.jpg',
    href: '/shop/custom-bracelet/general',
    cta: '填寫客製化表單',
  },
  {
    title: '生命靈數客製化手鍊',
    subtitle: '以生日數字整理能量方向',
    description: '結合生命靈數與近期需求，協助梳理適合加強的能量與水晶搭配。',
    image: '/products/forest-bloom/1.jpg',
    href: '/shop/custom-bracelet/numerology',
    cta: '先諮詢生命靈數款',
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('sales_desc');
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleBuyProduct = (productName: string) => {
    setSelectedProduct(productName);
    setIsContactOpen(true);
  };

  const filtered = PRODUCTS
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => activeCategory === 'all' || getProductCategories(product).includes(activeCategory))
    .sort((a, b) => {
      if (sortBy === 'sales_desc') {
        return (PRODUCT_SALES_COUNTS[b.product.slug] ?? 0) - (PRODUCT_SALES_COUNTS[a.product.slug] ?? 0) || a.index - b.index;
      }
      if (sortBy === 'price_asc') return a.product.price - b.product.price || a.index - b.index;
      if (sortBy === 'price_desc') return b.product.price - a.product.price || a.index - b.index;
      return a.index - b.index;
    })
    .map(({ product }) => product);

  const isCustomCategory = activeCategory === CUSTOM_BRACELET_CATEGORY;

  const featured = FEATURED_SLIDES
    .map((slide) => {
      const product = PRODUCTS.find((p) => p.slug === slide.slug);
      return product ? { ...product, featuredImage: slide.image } : null;
    })
    .filter((p): p is FeaturedProduct => Boolean(p));

  const countFor = (id: string) => {
    if (id === CUSTOM_BRACELET_CATEGORY) return CUSTOM_BRACELETS.length;
    return id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => getProductCategories(p).includes(id)).length;
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Animated opening tagline */}
          <div className="mb-9 pt-1 text-center md:mb-11">
            <p className="mb-3 animate-fade-in-up text-[15px] italic tracking-[0.14em] text-[#A38D6B]"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
              Find Your Crystal
            </p>
            <h1 className="text-2xl leading-[1.5] tracking-[0.14em] text-[#31353A] md:text-[2.1rem]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              {'找到屬於你的能量水晶'.split('').map((ch, i) => (
                <span
                  key={i}
                  className="tagline-char"
                  style={{ animationDelay: `${0.15 + i * 0.06}s`, color: i >= 6 ? '#A38D6B' : undefined }}
                >
                  {ch}
                </span>
              ))}
            </h1>
            <p className="mx-auto mt-3 max-w-md animate-fade-in-up text-[12.5px] leading-[1.9] tracking-[0.08em] text-[#31353A]/56"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300, animationDelay: '0.9s' }}>
              每一顆水晶，都是為某個時刻的你而來。
            </p>
          </div>

          {/* Featured carousel + social proof */}
          {!isCustomCategory && (
            <FeaturedBand
              products={featured}
              isCustomCategory={isCustomCategory}
              onModeChange={(custom) => setActiveCategory(custom ? CUSTOM_BRACELET_CATEGORY : 'all')}
            />
          )}

          {/* Filters */}
          {!isCustomCategory && (
          <div className="mb-8 animate-fade-in-up">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {CATEGORY_OPTIONS.filter((cat) => cat.id !== CUSTOM_BRACELET_CATEGORY).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs tracking-[0.15em] border transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-[#3D4144] text-[#FAF7F4] border-[#3D4144]'
                      : 'border-[#D1BE9B]/25 text-[#31353A]/72 hover:border-[#D1BE9B]/50 bg-white/30'
                  }`}
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {cat.label}
                  <span className={`ml-1.5 text-[11px] ${activeCategory === cat.id ? 'opacity-60' : 'text-[#D1BE9B]'}`}>
                    {countFor(cat.id)}
                  </span>
                </button>
              ))}
            </div>

            {!isCustomCategory && (
              <div className="flex justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-white/40 border border-[#D1BE9B]/20 rounded-full px-4 py-1.5 text-[11px] text-[#31353A]/72 tracking-wider focus:outline-none appearance-none"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          )}

          {isCustomCategory && (
            <section className="mb-12 animate-fade-in-up">
              <div className="mb-8 flex justify-center px-1">
                <ShopModeSwitch
                  isCustomCategory={isCustomCategory}
                  onChange={(custom) => setActiveCategory(custom ? CUSTOM_BRACELET_CATEGORY : 'all')}
                />
              </div>

              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.32em] text-[#D1BE9B] uppercase mb-2"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    Custom Crystal Bracelet
                  </p>
                  <h2 className="text-base md:text-lg tracking-[0.2em] text-[#31353A]/85"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    客製化水晶手鍊
                  </h2>
                </div>
                <p className="text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/58 max-w-md"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  依照你的狀態、需求與喜歡的風格，製作更貼近日常的專屬水晶手鍊。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {CUSTOM_BRACELETS.map((item) => {
                  const content = (
                    <div className="group grid h-full overflow-hidden rounded-3xl border border-[#D1BE9B]/20 bg-white/45 shadow-[0_12px_32px_rgba(209,190,155,0.10)] transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[0.82fr_1fr]">
                      <div className="aspect-[4/3] overflow-hidden bg-[#F0E8DC] md:aspect-auto">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-between p-5">
                        <div>
                          <p className="mb-1 text-[10px] tracking-[0.22em] text-[#D1BE9B]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {item.subtitle}
                          </p>
                          <h3 className="mb-2 text-sm tracking-[0.16em] text-[#31353A]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {item.title}
                          </h3>
                          <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/66"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            {item.description}
                          </p>
                        </div>
                        <span className="mt-5 inline-flex w-fit items-center rounded-full bg-[#3D4144] px-4 py-2 text-[10px] tracking-[0.18em] text-[#FAF7F4] transition-colors duration-300 group-hover:bg-[#D1BE9B] group-hover:text-[#31353A]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {item.cta}
                        </span>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <Link key={item.title} href={item.href}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleBuyProduct(item.title)}
                      className="border-none bg-transparent p-0 text-left"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Product grid */}
          {!isCustomCategory && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 mb-12">
              {filtered.map((product, i) => (
                <div
                  key={product.slug}
                  className="group flex flex-col justify-between h-full"
                >
                  <Link href={`/shop/${product.slug}`}>
                    <div className="cursor-pointer">
                      <div className="relative overflow-hidden rounded-2xl mb-3 aspect-square bg-[#F0E8DC]">
                        <img
                          src={product.img}
                          alt={product.name}
                          loading={i < 8 ? 'eager' : 'lazy'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={getProductImageStyle(product)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3D4144]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[11px] tracking-[0.2em] text-white/95 bg-[#3D4144]/55 backdrop-blur-sm px-3 py-1.5 rounded-full"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            查看詳情
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-0.5 flex min-h-5 flex-wrap items-center gap-1.5">
                          <p className="text-[10px] tracking-[0.2em] text-[#8F7957]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                            {product.material}
                          </p>
                          {product.tag && (
                            <span
                              className="rounded-full bg-[#D1BE9B]/28 px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-[#A38D6B]"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs tracking-[0.12em] text-[#31353A]/86 mb-0.5"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {product.name}
                        </h3>
                        <p className="text-[11px] leading-relaxed tracking-[0.08em] text-[#31353A]/62 mb-2 min-h-[2.75em]"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                          {getProductFitSummary(product)}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#A38D6B]"
                            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            {product.priceLabel ?? `NT$ ${product.price.toLocaleString()}`}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-[#31353A]/46 line-through"
                              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleBuyProduct(product.name)}
                    className="w-full py-2 text-[10px] tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-300 active:scale-95 shadow-sm font-light mt-auto"
                    style={{ fontFamily: 'Noto Serif TC, serif' }}
                  >
                    問問適不適合我 ♡
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <CatPeeking className="w-12 h-14" side="right" />
              <p className="text-[11px] text-[#31353A]/54 tracking-wider italic"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                每顆水晶都經過 Mochi 的篩選 ✦
              </p>
              <CatSitting className="w-10 h-14" />
            </div>
          </div>

        </div>
      </div>

      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productName={selectedProduct}
      />
    </PageLayout>
  );
}

function ShopModeSwitch({
  isCustomCategory,
  onChange,
}: {
  isCustomCategory: boolean;
  onChange: (custom: boolean) => void;
}) {
  return (
    <div className="grid w-full max-w-[560px] grid-cols-2 rounded-full border border-[#D1BE9B]/30 bg-[#FBF8F3]/78 p-1.5 shadow-[0_10px_26px_rgba(61,65,68,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-md">
      {[
        { custom: false, zh: '設計款', en: 'Ready-made' },
        { custom: true, zh: '客製款', en: 'Custom' },
      ].map((mode) => {
        const active = mode.custom ? isCustomCategory : !isCustomCategory;
        return (
          <button
            key={mode.zh}
            type="button"
            onClick={() => onChange(mode.custom)}
            className={`flex min-h-[48px] items-center justify-center rounded-full px-3 py-2 transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] md:min-h-[58px] md:px-6 ${
              active
                ? 'bg-[#3D4144] text-[#FAF7F4] shadow-[0_8px_18px_rgba(49,53,58,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]'
                : 'text-[#31353A]/62 hover:bg-white/38 hover:text-[#31353A]'
            }`}
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            <span className="whitespace-nowrap text-[0.88rem] tracking-[0.18em] md:text-[1.05rem]">
              {mode.zh}
            </span>
            <span className="ml-1.5 whitespace-nowrap text-[0.66rem] italic tracking-normal opacity-58 md:ml-3 md:text-[0.82rem]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {mode.en}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FeaturedBand({
  products,
  isCustomCategory,
  onModeChange,
}: {
  products: FeaturedProduct[];
  isCustomCategory: boolean;
  onModeChange: (custom: boolean) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [fbIndex, setFbIndex] = useState<number | null>(null);
  const count = products.length;
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => count && setCurrent((i + count) % count);

  const closeFb = () => setFbIndex(null);
  const stepFb = (dir: number) =>
    setFbIndex((c) => (c === null ? c : (c + dir + FEEDBACK_PHOTOS.length) % FEEDBACK_PHOTOS.length));

  useEffect(() => {
    if (fbIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFb();
      if (e.key === 'ArrowRight') stepFb(1);
      if (e.key === 'ArrowLeft') stepFb(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fbIndex]);

  useEffect(() => {
    if (count <= 1) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      if (!paused.current) setCurrent((c) => (c + 1) % count);
    }, 3000);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section className="mb-12 animate-fade-in-up">
      <div className="grid items-stretch gap-6 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
        {/* Carousel */}
        <div
          className="relative overflow-hidden rounded-3xl border border-[#D1BE9B]/20 bg-[#F0E8DC] shadow-[0_16px_40px_rgba(209,190,155,0.16)]"
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {products.map((p) => (
              <Link key={p.slug} href={`/shop/${p.slug}`} className="relative flex w-full flex-shrink-0 flex-col">
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F7F1E8] p-3 md:aspect-[16/11] md:p-4">
                  <img
                    src={p.featuredImage}
                    alt={p.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
            ))}
          </div>

          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] italic tracking-[0.12em] text-[#A38D6B]"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Featured
          </span>

          {count > 1 && (
            <div className="absolute bottom-4 right-5 flex gap-1.5">
              {products.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  aria-label={`切換至第 ${i + 1} 張`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Social proof panel */}
        <div className="flex flex-col justify-center gap-6 rounded-3xl border border-[#D1BE9B]/20 bg-white/45 px-7 py-8">
          <div>
            <p className="text-[14px] italic tracking-[0.04em] text-[#A38D6B]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Why Mochi
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.95] tracking-[0.05em] text-[#31353A]/70"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              老闆只嚴選高品質、雜質少的天然水晶，所以每一顆看起來都特別透亮，也蘊藏著更飽滿的能量。
            </p>
            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[#D1BE9B]/35 bg-[#FAF7F4]/65 px-4 py-2 text-[11px] tracking-[0.16em] text-[#8F7957] shadow-[0_10px_30px_rgba(163,141,107,0.08)]">
              <span className="h-px w-5 shrink-0 bg-[#D1BE9B]/60" />
              <span className="leading-relaxed">買一條即享免運｜每單贈天然水晶碎石</span>
              <span className="h-px w-5 shrink-0 bg-[#D1BE9B]/60" />
            </div>
          </div>
          <ShopModeSwitch isCustomCategory={isCustomCategory} onChange={onModeChange} />
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-[#FAF7F4]/70 px-4 py-6 text-center">
                <p className="text-[2.6rem] leading-none text-[#A38D6B]"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
                  {s.value}
                </p>
                <p className="mt-2.5 text-[11px] tracking-[0.16em] text-[#31353A]/64"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFbIndex(0)}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#3D4144] px-5 py-2.5 text-[11.5px] tracking-[0.18em] text-[#FAF7F4] shadow-sm transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-[0.98]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            看顧客真實回饋
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>

      {fbIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="lightbox-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-[#1c1a18]/80 p-4 backdrop-blur-sm"
          onClick={closeFb}
        >
          <button
            type="button"
            onClick={closeFb}
            aria-label="關閉"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-lg text-white/90 transition-colors hover:bg-white/25"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); stepFb(-1); }}
            aria-label="上一張"
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:left-8"
          >
            ‹
          </button>
          <img
            key={fbIndex}
            src={FEEDBACK_PHOTOS[fbIndex]}
            alt="顧客回饋與實拍"
            onClick={(e) => e.stopPropagation()}
            className="lightbox-image max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); stepFb(1); }}
            aria-label="下一張"
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:right-8"
          >
            ›
          </button>
          <span className="absolute bottom-6 text-[11px] tracking-[0.2em] text-white/60">
            {fbIndex + 1} / {FEEDBACK_PHOTOS.length}
          </span>
        </div>,
        document.body,
      )}
    </section>
  );
}
