/**
 * SOUL EASE | Mochi．crystal — Contact Dialog Component
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Premium Contact Portal
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function ContactDialog({ isOpen, onClose, productName }: ContactDialogProps) {
  const [copied, setCopied] = useState(false);
  const inquiryMessage = productName
    ? `我想詢問「${productName}」，想知道它適不適合我最近的狀態。`
    : '我想請 Mochi 幫我看看，哪一款商品比較適合我最近的狀態。';

  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(inquiryMessage);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Frosted backdrop */}
      <div 
        className="absolute inset-0 bg-[#3D4144]/35 backdrop-blur-md transition-opacity duration-300 z-0"
        onClick={onClose} 
      />
      
      {/* Dialog Container */}
      <div className="bg-[#FAF7F4] border border-[#D1BE9B]/25 rounded-[32px] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(209,190,155,0.22)] z-10 text-center relative overflow-hidden animate-fade-in-up">
        {/* Cute decorative elements */}
        <div className="absolute -top-1 -right-1 opacity-20 pointer-events-none text-[60px] select-none">☁︎</div>
        <div className="absolute -bottom-6 -left-6 opacity-20 pointer-events-none text-[80px] select-none">♡</div>
        
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 text-xs text-[#31353A]/50 hover:text-[#31353A] transition-colors border-none bg-transparent cursor-pointer p-1 z-20"
          onClick={onClose}
        >
          ✕
        </button>

        <span className="text-[10px] tracking-[0.3em] text-[#D1BE9B] uppercase font-light">Contact Us</span>
        
        <h3 className="text-base md:text-lg tracking-[0.18em] text-[#31353A] mt-2 mb-1.5"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          先問問這款適不適合你
        </h3>
        
        <p className="text-[11.5px] text-[#31353A]/62 tracking-wider mb-4"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
          不確定也沒關係，可以先把最近的狀態告訴我們 ⊹ ࣪ ˖
        </p>

        {/* Dynamic Product Indicator */}
        {productName && (
          <div className="mb-6 px-4 py-2 rounded-2xl bg-[#D1BE9B]/10 border border-[#D1BE9B]/20 inline-block">
            <span className="text-[11.5px] tracking-[0.12em] text-[#A38D6B] font-light flex items-center justify-center gap-1.5"
              style={{ fontFamily: 'Noto Serif TC, serif' }}>
              <span>𓇢𓆸</span> 諮詢商品：{productName}
            </span>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-[#D1BE9B]/18 bg-white/45 px-4 py-3 text-left">
          <p className="text-[10px] tracking-[0.18em] text-[#A38D6B] mb-1.5"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            可以直接傳這句
          </p>
          <p className="text-[11.5px] leading-[1.8] tracking-[0.06em] text-[#31353A]/72 mb-3"
            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
            {inquiryMessage}
          </p>
          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full py-2 text-[10px] tracking-[0.18em] rounded-full border border-[#D1BE9B]/30 bg-[#FAF7F4]/80 text-[#A38D6B] hover:bg-[#D1BE9B]/12 transition-all duration-300 active:scale-95 cursor-pointer"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            {copied ? '已複製訊息' : '複製詢問訊息'}
          </button>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <a
            href="https://line.me/R/ti/p/%40180itfru"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] hover:bg-[#D1BE9B] hover:text-[#31353A] rounded-full transition-all duration-500 flex items-center justify-center gap-2 shadow-sm font-light active:scale-95 cursor-pointer text-center"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            <span>💚</span> LINE 問問適不適合我
          </a>
          
          <a
            href="https://www.instagram.com/healing.pick_?igsh=MWQwOWViNXB2MTg5cA%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 text-xs tracking-[0.25em] border border-[#3D4144]/15 bg-white/40 hover:bg-[#3D4144] hover:text-[#FAF7F4] hover:border-[#3D4144] rounded-full transition-all duration-500 flex items-center justify-center gap-2 shadow-sm font-light active:scale-95 text-[#31353A] cursor-pointer text-center"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            <span>📸</span> IG 私訊詢問 ⟡
          </a>

          <a
            href="mailto:baby90522@gmail.com"
            onClick={onClose}
            className="w-full py-3.5 text-xs tracking-[0.18em] border border-[#D1BE9B]/28 bg-white/35 hover:bg-[#D1BE9B]/12 hover:text-[#8A7250] rounded-full transition-all duration-500 flex items-center justify-center gap-2 shadow-sm font-light active:scale-95 text-[#31353A] cursor-pointer text-center"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            <span>✉</span> Email 聯繫
          </a>
        </div>
        
        <div className="text-center text-[9px] text-[#D1BE9B]/80 tracking-widest mt-6 select-none">
          ୨୧ ───────── ୨୧
        </div>
      </div>
    </div>,
    document.body
  );
}
