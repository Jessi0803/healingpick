/**
 * SOUL EASE | Mochi．crystal — Footer Component
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 */

import { Link } from 'wouter';
import { CatTail } from './CatElements';

export default function Footer() {
  return (
    <footer className="relative bg-[#F2EDE8] border-t border-[#D1BE9B]/20 py-14 px-6 md:px-10 overflow-hidden">
      {/* Background ornament */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cat tail easter egg – bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-20 h-16 opacity-30 hover:opacity-60 transition-opacity duration-700 pointer-events-auto cursor-default" title="喵～">
          <CatTail className="w-full h-full" />
        </div>
        <svg className="absolute bottom-0 right-0 w-64 h-64 text-[#D1BE9B]/8 rotate-slow-counter" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.4" strokeDasharray="8 4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span
                className="text-2xl tracking-[0.25em] font-light text-[#31353A]/90"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Healing pick
              </span>
              <div
                className="text-[11px] tracking-[0.3em] text-[#31353A]/54 mt-1"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                癒見好物
              </div>
            </div>
            <p
              className="text-[12px] leading-[2] text-[#31353A]/68 max-w-xs tracking-wider"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              有些心事，可以先放進 Mochi 小宇宙。<br />
              在這裡，讓星象與水晶陪伴你，<br />
              找到屬於自己的安定與方向。
            </p>
            <p
              className="mt-4 text-[11px] tracking-[0.15em] text-[#D1BE9B]/80"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              把心事揉一揉，慢慢變成答案。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-[11px] tracking-[0.35em] text-[#D1BE9B] mb-5 uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              探索
            </h4>
            <ul className="space-y-3">
              {[
                { label: '塔羅牌占卜', href: '/tarot' },
                { label: '紫微斗數', href: '/ziwei' },
                { label: 'Mochi 解夢', href: '/dream' },
                { label: '每日運勢', href: '/fortune/daily' },
                { label: '心理測驗', href: '/quiz' },
                { label: '能量商品', href: '/shop' },
                { label: '關於我們', href: '/about' },
                { label: '購物須知與退費政策', href: '/policy' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[12px] tracking-[0.15em] text-[#31353A]/68 hover:text-[#D1BE9B] transition-colors duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-[11px] tracking-[0.35em] text-[#D1BE9B] mb-5 uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              聯繫我們
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/healing.pick_?igsh=MWQwOWViNXB2MTg5cA%3D%3D&utm_source=qr' },
                { label: 'LINE 官方帳號', href: 'https://lin.ee/6PBHLFX' },
                { label: 'Email：baby90522@gmail.com', href: 'mailto:baby90522@gmail.com' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] tracking-[0.15em] text-[#31353A]/68 hover:text-[#D1BE9B] transition-colors duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-gold mb-6">
          <svg className="w-4 h-4 text-[#D1BE9B]/60" viewBox="0 0 100 100" fill="none">
            <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p
            className="text-[11px] tracking-[0.15em] text-[#31353A]/50"
            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
          >
            © 2025 HealingPick All rights reserved.
          </p>
          <p
            className="text-[11px] tracking-[0.15em] text-[#31353A]/46 italic"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Made with love & crystal energy ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
