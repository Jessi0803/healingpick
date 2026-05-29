/**
 * SOUL EASE | Mochi．crystal — Shop Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Luxury E-commerce
 * Features:
 *   - Category filter (水晶類型)
 *   - Product grid with large images
 *   - Product detail modal
 *   - Crystal properties & chakra info
 *   - Self-owned vs. partner badges
 */

import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { toast } from 'sonner';
import { CatSitting, CatPeeking } from '@/components/CatElements';

// ─── Product data ─────────────────────────────────────────────────────────────
export const PRODUCTS = [
  {
    id: 1,
    name: '薰衣草紫水晶簇',
    subtitle: 'Amethyst Cluster',
    price: 1280,
    originalPrice: 1580,
    category: 'amethyst',
    type: 'self',
    chakra: '頂輪',
    hz: '432Hz',
    element: '風',
    origin: '烏拉圭',
    size: '約 8–12cm',
    weight: '約 200–350g',
    tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['淨化空間能量', '改善睡眠品質', '增強直覺力', '緩解焦慮'],
    description: '烏拉圭天然紫水晶簇，色澤飽滿，晶體清透。紫水晶對應頂輪，能有效淨化空間中的負面能量，同時幫助使用者沉澱思緒、提升靈性感知。適合放置於臥室或冥想空間。',
  },
  {
    id: 2,
    name: '馬達加斯加粉晶球',
    subtitle: 'Rose Quartz Sphere',
    price: 980,
    originalPrice: null,
    category: 'rose',
    type: 'partner',
    chakra: '心輪',
    hz: '528Hz',
    element: '水',
    origin: '馬達加斯加',
    size: '直徑約 5–6cm',
    weight: '約 150–200g',
    tag: '新品',
    img: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=80',
    properties: ['開啟心輪', '吸引愛情', '療癒情傷', '增進人際關係'],
    description: '來自馬達加斯加的天然粉晶球，色澤柔和如玫瑰晨光。粉晶是愛之石，對應心輪，能溫柔地開啟你接受愛的能力，同時療癒過去感情留下的傷痕。',
  },
  {
    id: 3,
    name: '天然黃水晶原礦',
    subtitle: 'Citrine Raw Crystal',
    price: 760,
    originalPrice: null,
    category: 'citrine',
    type: 'partner',
    chakra: '太陽神經叢輪',
    hz: '396Hz',
    element: '火',
    origin: '巴西',
    size: '約 6–10cm',
    weight: '約 100–180g',
    tag: null,
    img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    properties: ['顯化豐盛', '提升自信', '增強行動力', '財富磁場'],
    description: '巴西天然黃水晶原礦，保留最原始的晶體形態。黃水晶被稱為「商人之石」，對應太陽神經叢輪，能激活你的意志力與行動力，幫助顯化財富與成功。',
  },
  {
    id: 4,
    name: '白水晶能量棒',
    subtitle: 'Clear Quartz Wand',
    price: 1580,
    originalPrice: 1980,
    category: 'clear',
    type: 'self',
    chakra: '全脈輪',
    hz: '全頻段',
    element: '光',
    origin: '巴西',
    size: '長約 10–14cm',
    weight: '約 80–120g',
    tag: '精選',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    properties: ['淨化全脈輪', '放大意圖', '增強冥想效果', '萬用療癒'],
    description: '天然白水晶能量棒，晶體清澈透明，內含天然冰裂紋。白水晶是所有水晶中最萬用的療癒石，能放大使用者的意圖，並與任何其他水晶搭配使用，增強整體能量效果。',
  },
  {
    id: 5,
    name: '黑碧璽原礦',
    subtitle: 'Black Tourmaline Raw',
    price: 680,
    originalPrice: null,
    category: 'tourmaline',
    type: 'partner',
    chakra: '根輪',
    hz: '396Hz',
    element: '土',
    origin: '巴西',
    size: '約 5–8cm',
    weight: '約 80–150g',
    tag: null,
    img: 'https://images.unsplash.com/photo-1583341612423-c52b5c4c8d4e?w=600&q=80',
    properties: ['防護負能量', '接地氣', '消除電磁波', '穩定情緒'],
    description: '黑碧璽是最強力的防護石之一，對應根輪，能在你周圍形成能量保護場，阻擋負面能量與電磁波干擾。特別適合情緒敏感、容易受環境影響的人。',
  },
  {
    id: 6,
    name: '月光石橢圓裸石',
    subtitle: 'Moonstone Cabochon',
    price: 1180,
    originalPrice: null,
    category: 'moonstone',
    type: 'partner',
    chakra: '冠輪',
    hz: '528Hz',
    element: '水',
    origin: '斯里蘭卡',
    size: '約 2–3cm',
    weight: '約 10–20g',
    tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    properties: ['增強直覺', '平衡情緒', '促進轉變', '女性能量'],
    description: '斯里蘭卡頂級月光石，呈現迷人的藍色螢光（adularescence）。月光石與月亮能量共鳴，能增強直覺力，幫助你在人生轉折點找到方向，特別適合女性佩戴。',
  },
  {
    id: 7,
    name: '青金石圓珠手串',
    subtitle: 'Lapis Lazuli Bracelet',
    price: 880,
    originalPrice: 1080,
    category: 'lapis',
    type: 'self',
    chakra: '喉輪',
    hz: '741Hz',
    element: '風',
    origin: '阿富汗',
    size: '8mm 珠徑',
    weight: '約 20–25g',
    tag: '特價',
    img: 'https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?w=600&q=80',
    properties: ['增強溝通力', '提升智慧', '開啟第三眼', '真誠表達'],
    description: '阿富汗天然青金石手串，深邃的藍色中點綴著金色黃鐵礦，如同夜空繁星。青金石對應喉輪，能幫助你更清晰、真誠地表達自我，同時增強智慧與洞察力。',
  },
  {
    id: 8,
    name: '綠幽靈水晶球',
    subtitle: 'Phantom Quartz Sphere',
    price: 2280,
    originalPrice: null,
    category: 'phantom',
    type: 'self',
    chakra: '心輪',
    hz: '528Hz',
    element: '木',
    origin: '巴西',
    size: '直徑約 6–7cm',
    weight: '約 200–280g',
    tag: '限量',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['財富顯化', '事業助力', '心輪療癒', '豐盛能量'],
    description: '巴西天然綠幽靈水晶球，內含天然綠色幻影，每一顆都是獨一無二的藝術品。綠幽靈被稱為「財富之石」，能強力吸引財富與事業機遇，同時療癒心輪，帶來豐盛感。',
  },
  {
    id: 9,
    name: '心願九尾狐',
    subtitle: '幻彩靈狐・九尾守護琉璃',
    price: 980,
    originalPrice: 1280,
    category: 'glass',
    type: 'self',
    chakra: '全脈輪',
    hz: '528Hz',
    element: '光',
    origin: '幻彩琉璃工藝',
    size: '高約 5–6cm',
    weight: '約 90–120g',
    tag: '熱銷',
    img: '/shop-3258.jpg',
    properties: ['桃花能量', '愛自己', '好人緣', '願願顯化'],
    description: `在光影流轉之間，收藏一份屬於自己的溫柔能量。

九尾狐自古象徵智慧、魅力、幸運與守護。這款《幻彩靈狐・九尾守護琉璃》以夢幻彩虹琉璃打造，隨著光線變化折射出不同色彩，彷彿將美好的祝福悄悄封存其中。

九條尾巴象徵圓滿與豐盛，也提醒著我們：真正吸引美好事物的開始，不是追逐，而是先看見自己的光。

無論擺放在書桌、床頭櫃、工作空間或療癒角落，都能為日常增添一份溫柔而療癒的儀式感。

─── ♡ 商品特色 ♡ ───
🌈 幻彩琉璃工藝：不同角度呈現迷人的彩虹光澤，每一眼都能發現新的細節與美感。
🦊 九尾狐守護意象：象徵智慧、自信、魅力、好運與願望顯化。
🌷 療癒空間擺飾：為生活空間注入柔和氛圍，成為陪伴日常的小小能量夥伴。
🎀 精緻送禮首選：適合作為生日禮物、紀念禮物，或送給努力生活的自己。

─── ♡ 能量寓意 ♡ ───
🤍 愛自己：把溫柔留給自己，也把愛留給自己。
♡ 桃花能量：願你遇見喜歡的人，也願你成為自己喜歡的樣子。
🌸 好人緣：吸引讓你感到舒服、自在的人事物。
🦋 幸運陪伴：在重要時刻提醒你相信自己、勇敢前進。
☁️ 自我療癒：在忙碌與壓力之中，找回內心的平靜與力量。
🫧 願望顯化：陪伴你專注於想完成的目標與夢想。

─── ♡ 適合這樣的你 ♡ ───
🌷 希望提升自信與個人魅力
🌷 正在期待新的緣分與人際關係
🌷 喜歡療癒系居家擺飾
🌷 想為自己準備一份充滿儀式感的小禮禮物
🌷 相信美好能量與內在成長

─── ♡ HealingPick 想對你說 ♡ ───
「你不需要變成別人喜歡的樣子。九尾狐的能量，不是追逐愛，而是找回自己的光。當你開始喜歡自己，適合的人、關係與機會，也會慢慢被吸引而來。願這隻幻彩靈狐陪伴你，在每一次迷惘與期待之間，依然相信自己的美好。」`,
  },
];

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

          {/* Partner CTA */}
          <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20 text-center">
            <p className="text-[11px] tracking-[0.3em] text-[#D1BE9B] mb-2"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              合作商家
            </p>
            <h3 className="text-lg tracking-[0.15em] text-[#31353A]/82 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              你有水晶或靈性商品想上架嗎？
            </h3>
            <p className="text-[12px] leading-[2] text-[#31353A]/62 tracking-wider mb-5 max-w-md mx-auto"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              我們歡迎與優質的水晶商家合作，共同為使用者提供最好的療癒商品。
              合作採抽成制，無需庫存壓力。
            </p>
            <button
              className="px-8 py-2.5 text-xs tracking-[0.2em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              onClick={() => {
                toast.info('合作洽詢功能即將開放！', {
                  description: '請透過 Instagram 或 LINE 官方帳號聯繫我們，感謝您的支持。',
                  duration: 5000,
                });
              }}>
              申請合作上架
            </button>
          </div>
        </div>
      </div>

    </PageLayout>
  );
}
