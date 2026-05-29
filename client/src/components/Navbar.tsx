/**
 * SOUL EASE | Mochi．crystal — Navbar Component
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * - Glass morphism top nav with gold accents
 * - Flat navigation: all items at top level
 * - Mobile hamburger menu with slide-in drawer
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { CatSitting } from './CatElements';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

// Navbar links – flat structure, all items at top level
const navLinks = [
  { label: '塔羅占卜', href: '/tarot' },
  { label: '紫微斗數', href: '/ziwei' },
  { label: '每日運勢', href: '/fortune/daily' },
  { label: '心靈樹洞', href: '/treehole' },
  { label: '能量測驗', href: '/quiz' },
  { label: '能量商品', href: '/shop' },
];

export default function Navbar() {
  const { isAuthenticated, login, logout } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const credits = creditsQuery.data;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();

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
      : `text-xs tracking-[0.2em] transition-colors duration-300 whitespace-nowrap ${
          isActive(link.href) ? 'text-[#D1BE9B]' : 'text-[#31353A]/82 hover:text-[#D1BE9B]'
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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-white/70 backdrop-blur-xl border-b border-[#D1BE9B]/20 shadow-[0_2px_24px_rgba(209,190,155,0.08)]'
            : 'py-5 bg-white/10 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-4 relative">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <CatSitting className="w-7 h-9 opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span
                className="font-en-serif text-xl md:text-2xl tracking-[0.25em] font-light text-[#31353A]/92 group-hover:text-[#D1BE9B] transition-colors duration-300"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Healing Pick
              </span>
              <span
                className="text-[11px] tracking-[0.3em] text-[#31353A]/58 mt-0.5"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '12px' }}
              >
                癒見好物
              </span>
            </div>
          </Link>

          {/* Desktop Nav – centred, flat */}
          <div className="hidden lg:flex items-center justify-center gap-6 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => renderNavLink(link))}
          </div>


          {/* Right slot – auth + hamburger */}
          <div className="flex items-center justify-end gap-3">
            {/* Desktop auth */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-3">
                {credits?.enabled && (
                  <Link
                    href="/buy"
                    className="text-xs tracking-[0.15em] text-[#A38D6B] hover:text-[#D1BE9B] transition-colors duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    🐾 {credits.credits} 點
                    {credits.freeRemaining > 0 ? ` · 今日免費 ${credits.freeRemaining}` : ''}
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
                <button
                  onClick={() => logout()}
                  className="text-xs tracking-[0.2em] text-[#31353A]/62 hover:text-[#D1BE9B] transition-colors duration-300"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                {credits?.enabled && credits.freeRemaining > 0 && (
                  <span className="text-xs tracking-[0.15em] text-[#A38D6B]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    🐾 今日免費 {credits.freeRemaining}
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
              className="lg:hidden p-2 text-[#31353A]/80 hover:text-[#D1BE9B] transition-colors"
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
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-[#3D4144]/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-[#FAF7F4] shadow-2xl flex flex-col pt-20 pb-8 px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => renderNavLink(link, true))}
              {/* Mobile auth links */}
              <div className="mt-4 pt-4 border-t border-[#D1BE9B]/20 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {credits?.enabled && (
                      <Link
                        href="/buy"
                        className="text-xs tracking-[0.2em] text-[#A38D6B] hover:text-[#D1BE9B] transition-colors py-2"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        🐾 {credits.credits} 點
                        {credits.freeRemaining > 0 ? ` · 今日免費 ${credits.freeRemaining}` : ''}
                      </Link>
                    )}
                    <Link
                      href="/history"
                      className="text-xs tracking-[0.25em] text-[#31353A]/82 hover:text-[#D1BE9B] transition-colors py-2"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      ✦ 我的紀錄
                    </Link>
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
