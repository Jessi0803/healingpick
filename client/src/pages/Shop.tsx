/**
 * SOUL EASE | Mochi．crystal — Shop Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Luxury E-commerce
 * Features:
 *   - Category filter (水晶類型)
 *   - Product grid with large images
 *   - Product detail modal
 *   - Crystal properties & chakra info
 */
import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { toast } from 'sonner';
import { CatSitting, CatPeeking } from '@/components/CatElements';
import { PRODUCTS } from '@/data/products';



const CATEGORIES = [
  { id: 'all',       label: '全部商品', count: PRODUCTS.length },
  { id: 'amethyst',  label: '紫水晶',   count: PRODUCTS.filter(p => p.category === 'amethyst').length },
  { id: 'rose',      label: '粉晶',     count: PRODUCTS.filter(p => p.category === 'rose').length },
  { id: 'citrine',   label: '黃水晶',   count: PRODUCTS.filter(p => p.category === 'citrine').length },
  { id: 'clear',     label: '白水晶',   count: PRODUCTS.filter(p => p.category === 'clear').length },
  { id: 'tourmaline',label: '碧璽',     count: PRODUCTS.filter(p => p.category === 'tourmaline').length },
  { id: 'moonstone', label: '月光石',   count: PRODUCTS.filter(p => p.category === 'moonstone').length },
  { id: 'lapis',     label: '青金石',   count: PRODUCTS.filter(p => p.category === 'lapis').length },
  { id: 'phantom',   label: '幽靈水晶', count: PRODUCTS.filter(p => p.category === 'phantom').length },
  { id: 'glass',     label: '幻彩琉璃', count: PRODUCTS.filter(p => p.category === 'glass').length },
];

const SORT_OPTIONS = [
  { id: 'default',    label: '預設排序' },
  { id: 'price_asc',  label: '價格由低到高' },
  { id: 'price_desc', label: '價格由高到低' },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [typeFilter, setTypeFilter] = useState<'all' | 'self' | 'partner'>('all');

  const filtered = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => typeFilter === 'all' || p.type === typeFilter)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

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
            <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              能量商品
            </h1>
            <p className="text-sm italic text-[#31353A]/54 tracking-[0.15em]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Each crystal carries a story, a frequency, a healing."
            </p>
            {/* Shop cat */}
            <div className="flex justify-center mt-4 gap-6">
              <div className="flex flex-col items-center gap-1">
                <CatSitting className="w-10 h-14" />
                <span className="text-[10px] tracking-[0.15em] text-[#D1BE9B]/40"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>我幫你振選 ✦</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 animate-fade-in-up">
            {/* Category scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {CATEGORIES.map(cat => (
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
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Type + Sort */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'all',     label: '全部' },
                  { id: 'self',    label: '自營商品' },
                  { id: 'partner', label: '合作商品' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id as typeof typeFilter)}
                    className={`px-3 py-1.5 rounded-full text-[11px] tracking-[0.15em] border transition-all duration-200 ${
                      typeFilter === t.id
                        ? 'border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]'
                        : 'border-[#D1BE9B]/20 text-[#31353A]/62 hover:border-[#D1BE9B]/35'
                    }`}
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white/40 border border-[#D1BE9B]/20 rounded-full px-4 py-1.5 text-[11px] text-[#31353A]/72 tracking-wider focus:outline-none appearance-none"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
            {filtered.map((product, i) => (
              <Link href={`/shop/${product.id}`} key={product.id}>
                <div
                  className="group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-2xl mb-3 aspect-square">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3D4144]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span
                        className={`text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full ${
                          product.type === 'self'
                            ? 'bg-[#D1BE9B]/90 text-[#31353A]'
                            : 'bg-white/80 text-[#31353A]/80'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        {product.type === 'self' ? '自營' : '合作'}
                      </span>
                      {product.tag && (
                        <span
                          className="text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#3D4144]/70 text-white"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {product.tag}
                        </span>
                      )}
                    </div>
                    {/* Quick view */}
                    <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[11px] tracking-[0.2em] text-white/90 bg-[#3D4144]/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        查看詳情
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {product.chakra} · {product.hz}
                    </p>
                    <h3 className="text-xs tracking-[0.12em] text-[#31353A]/86 mb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {product.name}
                    </h3>
                    <p className="text-[11px] italic text-[#31353A]/54 mb-1.5"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {product.subtitle}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#D1BE9B]"
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
            ))}
          </div>

          {/* Cat between grid and CTA */}
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

    </PageLayout>
  );
}
