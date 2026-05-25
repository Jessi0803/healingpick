/**
 * SOUL EASE | Mochi．crystal — 404 Not Found
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 */
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatConfused } from '@/components/CatElements';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-[9px] tracking-[0.4em] text-[#D1BE9B] mb-6 uppercase"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
          404 · Page Not Found
        </p>

        {/* Confused cat illustration */}
        <div className="mb-6 animate-fade-in-up">
          <CatConfused className="w-32 h-40 mx-auto opacity-75" />
        </div>

        <h2 className="text-xl tracking-[0.2em] text-[#31353A]/60 mb-3"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
          這隻貓咪也找不到你要的頁面⋯⋯
        </h2>
        <p className="text-xs text-[#31353A]/35 tracking-[0.15em] mb-2 max-w-xs leading-[2]"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
          你所尋找的頁面不存在，或許它正在宇宙的另一個角落等待你。
        </p>
        <p className="text-[10px] text-[#D1BE9B]/60 tracking-[0.1em] mb-8 italic"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          "Even the cat is confused, but the crystals know the way."
        </p>
        <Link href="/">
          <button className="text-xs tracking-[0.25em] px-8 py-3 bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            帶貓咪回到聖所
          </button>
        </Link>
      </div>
    </PageLayout>
  );
}
