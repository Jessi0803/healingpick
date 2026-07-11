/**
 * SOUL EASE | Mochi．crystal — Navbar Component
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * - Glass morphism top nav with gold accents
 * - Flat navigation: all items at top level
 * - Mobile hamburger menu with slide-in drawer
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { CatSitting } from './CatElements';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useCart } from '@/contexts/CartContext';

// Navbar links – flat structure, all items at top level
const navLinks = [
  { label: '塔羅占卜', href: '/tarot' },
  { label: '紫微斗數', href: '/ziwei' },
  { label: 'Mochi 解夢', href: '/dream' },
  { label: '每日運勢', href: '/fortune/daily' },
  { label: '心理測驗', href: '/quiz' },
  { label: '療癒水晶', href: '/shop' },
  { label: '購買點數', href: '/buy' },
];

const creditsHint = '每日免費額度於台灣時間 00:00 重置，已購買點數不會被清空。塔羅、紫微、Mochi 解夢、每日運勢用完免費額度後，每次解讀消耗 1 點。';
const marqueeMessage = '🎀 客製化手鍊全館9折 · 一條免運 ✨';
const marqueeItems = Array.from({ length: 6 }, (_, index) => index);

export default function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const credits = creditsQuery.data;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const freeQuotaLabel =
    credits?.enabled && credits.dailyFreeQuota > 0
      ? `今日剩 ${credits.freeRemaining}/${credits.dailyFreeQuota}`
      : '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return location === '/' && window.location.hash === href.substring(1);
    }
    return location === href;
  };

  const renderNavLink = (link: { label: string; href: string }, isMobile = false) => {
    const isHash = link.href.startsWith('/#') || link.href.startsWith('#');
    const baseClass = isMobile 
      ? `text-xs tracking-[0.25em] py-3 border-b border-[#D1BE9B]/15 transition-colors whitespace-nowrap ${
          isActive(link.href) ? 'text-[#D1BE9B]' : 'text-[#31353A]/82 hover:text-[#D1BE9B]'
        }`
      : `relative text-xs tracking-[0.2em] transition-colors duration-300 whitespace-nowrap after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-[#D1BE9B] after:transition-transform after:duration-300 after:ease-out ${
          isActive(link.href)
            ? 'text-[#D1BE9B] after:scale-x-100'
            : 'text-[#31353A]/82 hover:text-[#D1BE9B] after:scale-x-0 hover:after:scale-x-100'
        }`;

    const style = { fontFamily: 'Noto Serif TC, serif', fontWeight: 300 };

    if (isHash) {
      const hashId = link.href.split('#')[1];
      return (
        <a
          key={link.label}
          href={link.href}
          onClick={(e) => {
            if (isMobile) setMobileOpen(false);
            if (location === '/') {
              e.preventDefault();
              document.getElementById(hashId)?.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, '', link.href);
            } else {
              e.preventDefault();
              setLocation('/');
              setTimeout(() => {
                document.getElementById(hashId)?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', link.href);
              }, 300);
            }
          }}
          className={baseClass}
          style={style}
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link
        key={link.label}
        href={link.href}
        className={baseClass}
        style={style}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] h-8 overflow-hidden border-b border-[#D1BE9B]/20 bg-[#FDFBF7]/88 backdrop-blur-md">
        <div className="marquee-track h-full whitespace-nowrap" aria-label={marqueeMessage}>
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="marquee-content"
              aria-hidden={groupIndex === 1}
            >
              {marqueeItems.map((index) => (
                <span
                  key={`${groupIndex}-${index}`}
                  className="text-[11px] tracking-[0.18em] text-[#8A7250]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  {marqueeMessage}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <nav
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-white/70 backdrop-blur-xl border-b border-[#D1BE9B]/20 shadow-[0_2px_24px_rgba(209,190,155,0.08)]'
            : 'py-5 bg-white/10 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-4 px-6 md:px-10">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <CatSitting className="w-7 h-9 opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span
                className="font-en-serif hidden md:block text-xl md:text-2xl tracking-[0.25em] font-light text-[#31353A]/92 group-hover:text-[#D1BE9B] transition-colors duration-300"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Healing Pick
              </span>
              <span
                className="text-[12px] tracking-[0.3em] text-[#31353A]/82 md:text-[#31353A]/58 md:mt-0.5"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '12px' }}
              >
                癒見好物
              </span>
            </div>
          </Link>

          {/* Desktop Nav – centred, flat */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 px-4 2xl:flex">
            {navLinks.map((link) => renderNavLink(link))}
          </div>


          {/* Right slot – auth + hamburger */}
          <div className="flex shrink-0 items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={openCart}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-[#D1BE9B]/25 bg-white/35 text-[#31353A]/78 transition hover:border-[#D1BE9B]/55 hover:text-[#A38D6B]"
              aria-label="開啟購物車"
            >
              <ShoppingBag size={17} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#C9837A] px-1 text-[10px] leading-none text-white">
                  {itemCount}
                </span>
              )}
            </button>
            {/* Desktop auth */}
            {isAuthenticated ? (
              <div className="hidden items-center gap-2.5 2xl:flex">
                {credits?.enabled && (
                  <Link
                    href="/buy"
                    title={creditsHint}
                    className="text-xs tracking-[0.15em] text-[#A38D6B] hover:text-[#D1BE9B] transition-colors duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    🐾 {credits.credits} 點
                    {freeQuotaLabel ? ` · ${freeQuotaLabel}` : ''}
                  </Link>
                )}
                <Link
                  href="/history"
                  className={`text-xs tracking-[0.2em] transition-colors duration-300 ${
                    isActive('/history')
                      ? 'text-[#D1BE9B]'
                      : 'text-[#31353A]/82 hover:text-[#D1BE9B]'
                  }`}
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  ✦ 我的紀錄
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`text-xs tracking-[0.2em] transition-colors duration-300 ${
                      isActive('/admin')
                        ? 'text-[#D1BE9B]'
                        : 'text-[#31353A]/82 hover:text-[#D1BE9B]'
                    }`}
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    後台
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="text-xs tracking-[0.2em] text-[#31353A]/62 hover:text-[#D1BE9B] transition-colors duration-300"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2.5 2xl:flex">
                {freeQuotaLabel && (
                  <span className="text-xs tracking-[0.15em] text-[#A38D6B]"
                    title={creditsHint}
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    🐾 {freeQuotaLabel}
                  </span>
                )}
                <button
                  onClick={() => login()}
                  className="text-xs tracking-[0.2em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors duration-300"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  登入
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="2xl:hidden p-2 text-[#31353A]/80 hover:text-[#D1BE9B] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-36 bottom-0 z-40 2xl:hidden">
          <div
            className="absolute inset-0 bg-[#3D4144]/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-[#FAF7F4] shadow-2xl flex flex-col pt-6 pb-8 px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => renderNavLink(link, true))}
              {/* Mobile auth links */}
              <div className="mt-4 pt-4 border-t border-[#D1BE9B]/20 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openCart();
                  }}
                  className="flex items-center gap-2 py-2 text-left text-xs tracking-[0.25em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <ShoppingBag size={15} />
                  購物車{itemCount > 0 ? `（${itemCount}）` : ''}
                </button>
                {isAuthenticated ? (
                  <>
                    {credits?.enabled && (
                      <Link
                        href="/buy"
                        title={creditsHint}
                        className="text-xs tracking-[0.2em] text-[#A38D6B] hover:text-[#D1BE9B] transition-colors py-2"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        🐾 {credits.credits} 點
                        {freeQuotaLabel ? ` · ${freeQuotaLabel}` : ''}
                      </Link>
                    )}
                    {credits?.enabled && (
                      <p className="text-[10px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        免費額度每日 00:00 重置；用完後每次解讀消耗 1 點
                      </p>
                    )}
                    <Link
                      href="/history"
                      className="text-xs tracking-[0.25em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors py-2"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      ✦ 我的紀錄
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="text-xs tracking-[0.25em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors py-2"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        後台
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="text-left text-xs tracking-[0.25em] text-[#31353A]/62 hover:text-[#D1BE9B] transition-colors py-2"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => login()}
                    className="text-left text-xs tracking-[0.25em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors py-2"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    登入
                  </button>
                )}
              </div>
            </div>

            {/* Cat decoration in mobile drawer */}
            <div className="mt-auto flex justify-center opacity-30">
              <CatSitting className="w-12 h-16" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
