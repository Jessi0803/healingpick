/**
 * SOUL EASE | Mochi．crystal — Product Detail Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Premium Independent Product Detail
 */

import { useParams, Link } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { PRODUCTS } from '@/data/products';
import { CatSitting, CatPeeking } from '@/components/CatElements';

export default function ProductDetailPage() {
  const { id } = useParams();
  
  // Find product by ID
  const product = PRODUCTS.find(p => p.id === Number(id));

  // Handle case where product is not found
  if (!product) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="text-3xl mb-4 opacity-30">✦</div>
          <h2 className="text-xl tracking-[0.2em] font-light text-[#31353A] mb-4"
            style={{ fontFamily: 'Noto Serif TC, serif' }}>
            找不到該商品
          </h2>
          <p className="text-sm text-[#31353A]/60 mb-6" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
            抱歉，您所尋找的能量商品可能已下架或網址不正確。
          </p>
          <Link href="/shop">
            <button className="px-6 py-2.5 text-xs tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500"
              style={{ fontFamily: 'Noto Serif TC, serif' }}>
              返回能量商店
            </button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const handleBuy = () => {
    toast.success(`已收到您對「${product.name}」的結緣意願！`, {
      description: '結帳與購物車功能即將開放，目前請加入官方 LINE 或私訊 Instagram 訂購 🐾',
      duration: 6000,
    });
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8 bg-[#FAF7F4]">
        <div className="max-w-4xl mx-auto">
          
          {/* Back button */}
          <div className="mb-8 animate-fade-in-up">
            <Link href="/shop">
              <button className="inline-flex items-center gap-2 group text-xs tracking-[0.2em] text-[#31353A]/62 hover:text-[#31353A] transition-all duration-300 bg-transparent border-none focus:outline-none"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">←</span>
                返回能量商店
              </button>
            </Link>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-12 animate-fade-in-up">
            
            {/* Left Column: Product Image with Premium Frame */}
            <div className="w-full md:w-1/2 aspect-square relative group overflow-hidden rounded-3xl border border-[#D1BE9B]/20 shadow-[0_8px_32px_rgba(209,190,155,0.15)] bg-white/40">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105"
              />
              {/* Soft gold gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D4144]/10 to-transparent pointer-events-none" />
              {/* Self-owned / Partner Badge */}
              <span className={`absolute top-4 left-4 text-[10px] tracking-[0.15em] px-3 py-1 rounded-full shadow-sm ${
                product.type === 'self' ? 'bg-[#D1BE9B]/90 text-[#31353A]' : 'bg-[#FAF7F4]/90 backdrop-blur-sm text-[#31353A]/70'
              }`} style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.type === 'self' ? '自營能量商品' : '合作工坊商品'}
              </span>
              {product.tag && (
                <span className="absolute top-4 right-4 text-[10px] tracking-[0.15em] px-3 py-1 rounded-full bg-[#3D4144]/80 backdrop-blur-sm text-[#FAF7F4] shadow-sm"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {product.tag}
                </span>
              )}
            </div>

            {/* Right Column: Detailed info & specifications */}
            <div className="w-full md:w-1/2">
              
              {/* Energy Tag */}
              <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-2 uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.chakra} · {product.hz} · {product.element}能量
              </p>

              {/* Title & Subtitle */}
              <h1 className="text-2xl md:text-3xl tracking-[0.18em] text-[#31353A] font-extralight mb-1"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                {product.name}
              </h1>
              <p className="text-xs md:text-sm italic text-[#D1BE9B] mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {product.subtitle}
              </p>

              {/* Pricing Panel */}
              <div className="flex items-baseline gap-4 mb-6 border-b border-[#D1BE9B]/15 pb-5">
                <span className="text-3xl text-[#D1BE9B]"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  NT$ {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-[#31353A]/38 line-through"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    NT$ {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Properties Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.properties.map(prop => (
                  <span key={prop}
                    className="text-[11px] tracking-[0.15em] px-3 py-1 rounded-full bg-[#D1BE9B]/12 text-[#A38D6B] border border-[#D1BE9B]/20"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    ✦ {prop}
                  </span>
                ))}
              </div>
              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: '產地來源', value: product.origin },
                  { label: '規格尺寸', value: product.size },
                  { label: '商品重量', value: product.weight },
                  { label: '對應脈輪', value: product.chakra },
                ].map(spec => (
                  <div key={spec.label} className="bg-[#D1BE9B]/8 rounded-xl p-3 border border-[#D1BE9B]/15 text-left">
                    <p className="text-[10px] tracking-[0.15em] text-[#D1BE9B] mb-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {spec.label}
                    </p>
                    <p className="text-[11px] tracking-[0.08em] text-[#31353A]/80 font-normal"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Purchase Button CTA */}
              <button
                onClick={handleBuy}
                className="w-full py-3.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95 shadow-md shadow-[#3D4144]/10 hover:shadow-[#D1BE9B]/20"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                立即諮詢購買 🐾
              </button>
              <p className="text-center mt-3 text-[10px] text-[#31353A]/46 tracking-wider"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                ✦ 天然水晶琉璃皆附能量淨化指南與專屬淨化包
              </p>

            </div>
          </div>

          {/* Elegant Divider */}
          <div className="flex items-center justify-center gap-4 my-12 animate-fade-in-up">
            <div className="h-[1px] w-16 bg-[#D1BE9B]/20" />
            <span className="text-[#D1BE9B]/60 text-xs tracking-[0.3em]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
              ✦ 能量故事 ✦
            </span>
            <div className="h-[1px] w-16 bg-[#D1BE9B]/20" />
          </div>

          {/* Expanded Bottom Story Panel (Spacious Reading Layout) */}
          <div className="w-full max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <div className="glass-panel bg-white/40 backdrop-blur-sm border border-[#D1BE9B]/15 p-8 md:p-12 rounded-3xl shadow-[0_12px_40px_rgba(209,190,155,0.06)] relative overflow-hidden">
              {/* Corner soft gold decorations */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D1BE9B]/5 to-transparent pointer-events-none rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D1BE9B]/5 to-transparent pointer-events-none rounded-bl-3xl" />
              
              <h2 className="text-base tracking-[0.25em] text-[#A38D6B] mb-8 text-center"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                ❖ 能量故事與意象 ❖
              </h2>

              <p className="text-xs md:text-[14px] leading-[2.3] text-[#31353A]/80 tracking-wider whitespace-pre-line"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                {product.description}
              </p>
            </div>
          </div>


          {/* Mochi cozy companions bottom section */}
          <div className="flex justify-center mb-6 py-6 border-t border-[#D1BE9B]/15">
            <div className="flex items-center gap-4 animate-fade-in-up">
              <CatPeeking className="w-12 h-14" side="right" />
              <p className="text-[11px] text-[#31353A]/54 tracking-wider italic"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                Mochi 說：每一份相遇的能量，都是宇宙最美好的安排。
              </p>
              <CatSitting className="w-10 h-14" />
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
