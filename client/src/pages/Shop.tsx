/**
 * SOUL EASE | Mochi．crystal — Shop Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Luxury E-commerce
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatSitting, CatPeeking } from '@/components/CatElements';
import { PRODUCTS, CATEGORY_OPTIONS, getProductFitSummary, getProductImageStyle, type Product } from '@/data/products';
import ContactDialog from '@/components/ContactDialog';

// 精選輪播選品（招財／桃花／守護各一），與社會證明數字。
const FEATURED_SLUGS = ['wealth-stone', 'mei-yu-xin-yuan', 'glimmer-fox'];
const STATS = [
  { value: '99%', label: '滿意顧客' },
  { value: '100%', label: '天然水晶' },
];

const SORT_OPTIONS = [
  { id: 'default',    label: '預設排序' },
  { id: 'price_asc',  label: '價格由低到高' },
  { id: 'price_desc', label: '價格由高到低' },
];

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
    cta: '先諮詢生命靈數款',
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleBuyProduct = (productName: string) => {
    setSelectedProduct(productName);
    setIsContactOpen(true);
  };

  const filtered = PRODUCTS
    .filter((p) => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  const isCustomCategory = activeCategory === CUSTOM_BRACELET_CATEGORY;

  const featured = FEATURED_SLUGS
    .map((slug) => PRODUCTS.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  const countFor = (id: string) => {
    if (id === CUSTOM_BRACELET_CATEGORY) return CUSTOM_BRACELETS.length;
    return id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length;
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              Energy Crystals
            </span>
            <h1 className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              能量商品
            </h1>
            <p className="text-sm italic text-[#31353A]/54 tracking-[0.15em]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Each crystal carries a story, a frequency, a healing."
            </p>
            <div className="flex justify-center mt-4 gap-6">
              <div className="flex flex-col items-center gap-1">
                <CatSitting className="w-10 h-14" />
                <span className="text-[10px] tracking-[0.15em] text-[#D1BE9B]/40"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>我幫你篩選 ✦</span>
              </div>
            </div>
          </div>

          {/* Featured carousel + social proof */}
          <FeaturedBand products={featured} />

          {/* Filters */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {CATEGORY_OPTIONS.map((cat) => (
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/40 border border-[#D1BE9B]/20 rounded-full px-4 py-1.5 text-[11px] text-[#31353A]/72 tracking-wider focus:outline-none appearance-none"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isCustomCategory && (
            <section className="mb-12 animate-fade-in-up">
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
                  className="group flex flex-col justify-between h-full animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <Link href={`/shop/${product.slug}`}>
                    <div className="cursor-pointer">
                      <div className="relative overflow-hidden rounded-2xl mb-3 aspect-square bg-[#F0E8DC]">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700"
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
                          <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B]"
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
                        <p className="text-[11px] italic text-[#31353A]/54 mb-2"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {product.subtitle}
                        </p>
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

function FeaturedBand({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const count = products.length;
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => count && setCurrent((i + count) % count);

  useEffect(() => {
    if (count <= 1) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      if (!paused.current) setCurrent((c) => (c + 1) % count);
    }, 4500);
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
              <Link key={p.slug} href={`/shop/${p.slug}`} className="relative w-full flex-shrink-0">
                <div className="aspect-[4/3] w-full overflow-hidden md:aspect-[16/11]">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    style={getProductImageStyle(p)}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2b2622]/78 via-[#2b2622]/22 to-transparent p-5 pt-14">
                  <p className="text-[11px] italic tracking-[0.08em] text-[#F0E8DC]/85"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {p.subtitle}
                  </p>
                  <h3 className="text-base tracking-[0.14em] text-white md:text-lg"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {p.name}
                  </h3>
                  <span className="mt-1 inline-block text-sm text-[#E9D9B8]"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {p.priceLabel ?? `NT$ ${p.price.toLocaleString()}`}
                  </span>
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
              每顆水晶都經 Mochi 親自挑選，只留下乾淨透亮、少雜質的天然水晶，讓能量與質感都值得信任。
            </p>
          </div>
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
        </div>
      </div>
    </section>
  );
}
