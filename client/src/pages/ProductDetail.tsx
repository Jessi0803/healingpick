/**
 * SOUL EASE | Mochi．crystal — Product Detail Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Premium Independent Product Detail
 */

import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { findProduct } from '@/data/products';
import { CatSitting, CatPeeking } from '@/components/CatElements';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = findProduct(id ?? '');
  const [activeImage, setActiveImage] = useState(0);

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
            抱歉,您所尋找的能量商品可能已下架或網址不正確。
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
    toast.success(`已收到您對「${product.name}」的結緣意願 ♡`, {
      description: '結帳功能即將開放,目前請加入官方 LINE 或私訊 Instagram 訂購',
      duration: 6000,
    });
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8 bg-[#FAF7F4]">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <div className="mb-8 animate-fade-in-up">
            <Link href="/shop">
              <button className="inline-flex items-center gap-2 group text-xs tracking-[0.2em] text-[#31353A]/62 hover:text-[#31353A] transition-all duration-300 bg-transparent border-none focus:outline-none"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">←</span>
                返回能量商店
              </button>
            </Link>
          </div>

          {/* Hero: gallery + summary */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-12 animate-fade-in-up">

            {/* Left: image gallery */}
            <div className="w-full md:w-1/2">
              <div className="aspect-square relative overflow-hidden rounded-3xl border border-[#D1BE9B]/20 shadow-[0_8px_32px_rgba(209,190,155,0.15)] bg-white/40">
                <img
                  src={product.images[activeImage] ?? product.img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                {product.tag && (
                  <span className="absolute top-4 left-4 text-[10px] tracking-[0.15em] px-3 py-1 rounded-full bg-[#D1BE9B]/90 text-[#31353A] shadow-sm"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {product.tag}
                  </span>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {product.images.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square overflow-hidden rounded-xl border transition-all ${
                        activeImage === i
                          ? 'border-[#A38D6B] ring-1 ring-[#A38D6B]/30'
                          : 'border-[#D1BE9B]/25 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: summary */}
            <div className="w-full md:w-1/2">
              <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-2 uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.material}
              </p>

              <h1 className="text-2xl md:text-3xl tracking-[0.18em] text-[#31353A] font-extralight mb-1"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                {product.name}
              </h1>
              <p className="text-xs md:text-sm italic text-[#A38D6B] mb-5"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {product.subtitle}
              </p>

              <p className="text-[13px] leading-[2] text-[#31353A]/72 tracking-wider whitespace-pre-line mb-6"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.tagline}
              </p>

              <div className="flex items-baseline gap-4 mb-6 border-b border-[#D1BE9B]/15 pb-5">
                <span className="text-3xl text-[#A38D6B]"
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

              <button
                onClick={handleBuy}
                className="w-full py-3.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95 shadow-md shadow-[#3D4144]/10 hover:shadow-[#D1BE9B]/20"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                立即諮詢購買 ♡
              </button>

              {/* Quick feature highlights — keeps the right column visually
                  balanced with the tall hero image on the left. */}
              <div className="mt-6 pt-5 border-t border-[#D1BE9B]/15">
                <p className="text-[10px] tracking-[0.3em] text-[#D1BE9B] uppercase mb-3"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  𓂃 ࣪˖ ִֶָ𐀔 商品特色快覽
                </p>
                <ul className="space-y-2">
                  {product.features.map((f, idx) => {
                    const cuteIcons = ['♡', '𓇢𓆸', '☁︎', '⟡', '𓂃 ࣪˖', 'ִֶָ𐀔'];
                    const icon = cuteIcons[idx % cuteIcons.length];
                    return (
                      <li key={f.title} className="flex items-start gap-2.5 text-left">
                        <span className="flex-shrink-0 text-[13px] text-[#A38D6B] leading-none mt-0.5">{icon}</span>
                        <span className="leading-[1.7]">
                          <span className="text-[12.5px] tracking-[0.06em] text-[#A38D6B]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                            {f.title}
                          </span>
                          <span className="text-[11.5px] tracking-wider text-[#31353A]/68 ml-1.5"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {f.desc}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Section: 能量寓意 */}
          <Section title="能量寓意" subtitle="Meanings" icon="𓇢𓆸">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.meanings.map((m, idx) => {
                const cuteIcons = ['⟡', '♡', '𓇢𓆸', '☁︎', '𓂃 ࣪˖', 'ִֶָ𐀔'];
                const icon = cuteIcons[idx % cuteIcons.length];
                return (
                  <BulletCard key={m.title} emoji={icon} title={m.title} desc={m.desc} />
                );
              })}
            </div>
          </Section>

          {/* Section: 適合這樣的你 */}
          <Section title="適合這樣的你" subtitle="Suited For" icon="☁︎">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {product.suitedFor.map((s, idx) => {
                const cuteIcons = ['♡', '☁︎', '𓇢𓆸', '⟡', '𓂃 ࣪˖', 'ִֶָ𐀔'];
                const icon = cuteIcons[idx % cuteIcons.length];
                return (
                  <div key={s}
                    className="flex items-start gap-3 px-4 py-2.5 rounded-2xl bg-[#D1BE9B]/10 border border-[#D1BE9B]/20 shadow-sm">
                    <span className="text-[#A38D6B] text-[13px] leading-none mt-0.5">{icon}</span>
                    <span className="text-[12px] tracking-[0.08em] text-[#31353A]/85 leading-[1.9]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* HealingPick 想對你說 */}
          <div className="w-full max-w-3xl mx-auto mt-8 mb-16 animate-fade-in-up">
            <div className="glass-panel bg-white/45 backdrop-blur-sm border border-[#D1BE9B]/20 p-8 md:p-12 rounded-3xl shadow-[0_12px_40px_rgba(209,190,155,0.08)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D1BE9B]/8 to-transparent pointer-events-none rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D1BE9B]/8 to-transparent pointer-events-none rounded-bl-3xl" />

              <p className="text-[10px] tracking-[0.35em] text-[#D1BE9B] text-center mb-2 uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                Healing Pick 想對你說
              </p>
              <div className="mx-auto w-12 h-px bg-[#D1BE9B]/40 mb-6" />

              <p className="text-[13.5px] md:text-[14px] leading-[2.2] text-[#31353A]/80 tracking-wider whitespace-pre-line text-center"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.closing}
              </p>
            </div>
          </div>

          <div className="flex justify-center mb-6 py-6 border-t border-[#D1BE9B]/15">
            <div className="flex items-center gap-4 animate-fade-in-up">
              <CatPeeking className="w-12 h-14" side="right" />
              <p className="text-[11px] text-[#31353A]/54 tracking-wider italic"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                Mochi 說:每一份相遇的能量,都是宇宙最美好的安排。
              </p>
              <CatSitting className="w-10 h-14" />
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

function Section({ title, subtitle, icon = '♡', children }: { title: string; subtitle: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-5">
        <span className="text-[10px] tracking-[0.3em] text-[#D1BE9B] uppercase"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          {icon} {subtitle}
        </span>
        <h2 className="text-base md:text-lg tracking-[0.2em] text-[#31353A]/85"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          {title}
        </h2>
        <div className="flex-1 h-px bg-[#D1BE9B]/20" />
      </div>
      {children}
    </div>
  );
}

function BulletCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/40 border border-[#D1BE9B]/15 shadow-[0_2px_8px_rgba(209,190,155,0.05)]">
      <span className="flex-shrink-0 text-[13px] text-[#A38D6B] leading-none mt-1">{emoji}</span>
      <div>
        <p className="text-[12.5px] tracking-[0.08em] text-[#A38D6B] mb-1"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
          {title}
        </p>
        <p className="text-[12px] leading-[1.95] text-[#31353A]/72 tracking-wider"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}
