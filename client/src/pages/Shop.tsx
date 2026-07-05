/**
 * SOUL EASE | Mochi．crystal — Shop Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Luxury E-commerce
 */
import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatSitting, CatPeeking } from '@/components/CatElements';
import { PRODUCTS, CATEGORY_OPTIONS, getProductFitSummary, getProductImageStyle } from '@/data/products';
import ContactDialog from '@/components/ContactDialog';

const SORT_OPTIONS = [
  { id: 'default',    label: '預設排序' },
  { id: 'price_asc',  label: '價格由低到高' },
  { id: 'price_desc', label: '價格由高到低' },
];

const CUSTOM_BRACELETS = [
  {
    title: '一般客製化手鍊',
    subtitle: '依照需求搭配專屬水晶',
    description: '從功效、色系、手圍與配戴習慣開始，討論出最貼近你的水晶手鍊。',
    image: '/custom-bracelet/general/IMG_4848.PNG',
    href: '/shop/custom-bracelet/general',
    cta: '填寫客製化表單',
  },
  {
    title: '生命靈數客製化手鍊',
    subtitle: '以生日數字整理能量方向',
    description: '結合生命靈數與近期需求，協助梳理適合加強的能量與水晶搭配。',
    image: '/custom-bracelet/general/IMG_4836.PNG',
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

  const countFor = (id: string) =>
    id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length;

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

          {/* Custom bracelets */}
          <section className="mb-10 animate-fade-in-up">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.32em] text-[#D1BE9B] uppercase mb-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  Custom Bracelet
                </p>
                <h2 className="text-base md:text-lg tracking-[0.2em] text-[#31353A]/85"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  客製化手鍊
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
          </div>

          {/* Product grid */}
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
                      {product.tag && (
                        <div className="absolute top-3 left-3">
                          <span
                            className="text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#D1BE9B]/90 text-[#31353A]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {product.tag}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[11px] tracking-[0.2em] text-white/95 bg-[#3D4144]/55 backdrop-blur-sm px-3 py-1.5 rounded-full"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          查看詳情
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        {product.material}
                      </p>
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
                          NT$ {product.price.toLocaleString()}
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
