/**
 * CatElements.tsx
 * SOUL EASE 貓咪元素元件庫
 * 設計風格：莫蘭迪金色細線稿，極簡療癒，與水晶祭壇同語言
 * 所有 SVG 使用 stroke="#D1BE9B" 金色線稿，fill="none"
 */

import { useEffect, useState } from 'react';

// ── 1. 坐姿貓咪（Logo 旁 / Hero 裝飾用）
export function CatSitting({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="30" cy="58" rx="16" ry="18" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head */}
      <circle cx="30" cy="28" r="14" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Left ear */}
      <path d="M18 18 L14 8 L24 16" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Right ear */}
      <path d="M42 18 L46 8 L36 16" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Eyes */}
      <ellipse cx="24" cy="27" rx="2.5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="36" cy="27" rx="2.5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
      {/* Nose */}
      <path d="M28.5 33 L30 35 L31.5 33" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Mouth */}
      <path d="M27 36 Q30 38.5 33 36" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
      {/* Whiskers left */}
      <line x1="14" y1="32" x2="24" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="13" y1="35" x2="23" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Whiskers right */}
      <line x1="46" y1="32" x2="36" y2="33" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="47" y1="35" x2="37" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Tail */}
      <path d="M46 68 Q58 62 54 50 Q50 40 46 48" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Front paws */}
      <ellipse cx="22" cy="74" rx="5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="38" cy="74" rx="5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}


// ── 3. 困惑貓咪（404 頁面用）
export function CatConfused({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="40" cy="72" rx="22" ry="24" stroke="#D1BE9B" strokeWidth="1.3" />
      {/* Head */}
      <circle cx="40" cy="36" r="20" stroke="#D1BE9B" strokeWidth="1.3" />
      {/* Left ear - one tilted (confused) */}
      <path d="M24 20 L18 6 L32 18" stroke="#D1BE9B" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Right ear - normal */}
      <path d="M56 20 L62 6 L48 18" stroke="#D1BE9B" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Eyes - one squinting */}
      <ellipse cx="32" cy="34" rx="3.5" ry="4" stroke="#D1BE9B" strokeWidth="1.1" />
      <path d="M44 32 Q47.5 30 51 32 Q47.5 36 44 32Z" stroke="#D1BE9B" strokeWidth="1" fill="none" />
      {/* Question mark above head */}
      <path d="M58 10 Q62 6 60 12 Q58 16 60 18" stroke="#D1BE9B" strokeWidth="1" fill="none" />
      <circle cx="60" cy="21" r="1" fill="#D1BE9B" />
      {/* Nose */}
      <path d="M38 41 L40 43.5 L42 41" stroke="#D1BE9B" strokeWidth="0.9" strokeLinejoin="round" />
      {/* Mouth - slight frown */}
      <path d="M36 46 Q40 44 44 46" stroke="#D1BE9B" strokeWidth="0.9" fill="none" />
      {/* Whiskers */}
      <line x1="16" y1="40" x2="30" y2="41" stroke="#D1BE9B" strokeWidth="0.7" />
      <line x1="15" y1="44" x2="29" y2="44" stroke="#D1BE9B" strokeWidth="0.7" />
      <line x1="64" y1="40" x2="50" y2="41" stroke="#D1BE9B" strokeWidth="0.7" />
      <line x1="65" y1="44" x2="51" y2="44" stroke="#D1BE9B" strokeWidth="0.7" />
      {/* Tail */}
      <path d="M62 85 Q76 78 72 64 Q68 52 62 60" stroke="#D1BE9B" strokeWidth="1.3" fill="none" />
      {/* Paws */}
      <ellipse cx="30" cy="92" rx="7" ry="4" stroke="#D1BE9B" strokeWidth="1.1" />
      <ellipse cx="50" cy="92" rx="7" ry="4" stroke="#D1BE9B" strokeWidth="1.1" />
    </svg>
  );
}

// ── 4. 傾聽貓咪（心靈樹洞陪伴用）
export function CatListening({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 70 90" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="35" cy="66" rx="20" ry="22" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head - slightly tilted */}
      <circle cx="35" cy="30" r="17" stroke="#D1BE9B" strokeWidth="1.2" transform="rotate(-8 35 30)" />
      {/* Left ear */}
      <path d="M20 16 L15 4 L28 14" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Right ear - raised (attentive) */}
      <path d="M50 14 L56 2 L44 12" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Eyes - warm, attentive */}
      <ellipse cx="28" cy="29" rx="3" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="42" cy="28" rx="3" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      {/* Pupils */}
      <ellipse cx="28" cy="30" rx="1.2" ry="2" fill="#D1BE9B" fillOpacity="0.5" />
      <ellipse cx="42" cy="29" rx="1.2" ry="2" fill="#D1BE9B" fillOpacity="0.5" />
      {/* Nose */}
      <path d="M33 35 L35 37.5 L37 35" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Gentle smile */}
      <path d="M31 39 Q35 42 39 39" stroke="#D1BE9B" strokeWidth="0.9" fill="none" />
      {/* Whiskers */}
      <line x1="12" y1="34" x2="25" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="11" y1="37" x2="24" y2="37" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="58" y1="34" x2="45" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="59" y1="37" x2="46" y2="37" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Tail */}
      <path d="M55 80 Q68 72 64 58 Q60 46 55 54" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Paws */}
      <ellipse cx="25" cy="84" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="45" cy="84" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}

// ── 5. 貓咪尾巴（Footer 彩蛋用）
export function CatTail({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Tail curving up from bottom corner */}
      <path d="M5 60 Q10 40 25 30 Q40 20 50 28 Q60 36 55 48 Q50 58 42 55" stroke="#D1BE9B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Tail tip */}
      <ellipse cx="40" cy="56" rx="6" ry="4" stroke="#D1BE9B" strokeWidth="1.3" transform="rotate(-20 40 56)" />
    </svg>
  );
}

// ── 6. 貓咪玩水晶球（Loading 動畫用）
export function CatLoading({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const [paw, setPaw] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPaw(p => !p), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <svg viewBox="0 0 100 90" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Crystal ball */}
      <circle cx="50" cy="68" r="18" stroke="#D1BE9B" strokeWidth="1.2" />
      <ellipse cx="50" cy="68" rx="18" ry="8" stroke="#D1BE9B" strokeWidth="0.6" strokeDasharray="3 2" />
      <circle cx="44" cy="62" r="3" stroke="#D1BE9B" strokeWidth="0.7" opacity="0.5" />
      {/* Ball stand */}
      <path d="M36 84 Q50 80 64 84" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      <line x1="36" y1="84" x2="64" y2="84" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Body */}
      <ellipse cx="50" cy="42" rx="18" ry="16" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head */}
      <circle cx="50" cy="20" r="14" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Ears */}
      <path d="M38 10 L34 2 L44 9" stroke="#D1BE9B" strokeWidth="1" strokeLinejoin="round" />
      <path d="M62 10 L66 2 L56 9" stroke="#D1BE9B" strokeWidth="1" strokeLinejoin="round" />
      {/* Eyes - wide with wonder */}
      <circle cx="43" cy="19" r="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <circle cx="57" cy="19" r="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <circle cx="43" cy="20" r="1.5" fill="#D1BE9B" fillOpacity="0.6" />
      <circle cx="57" cy="20" r="1.5" fill="#D1BE9B" fillOpacity="0.6" />
      {/* Nose */}
      <path d="M48.5 24 L50 26 L51.5 24" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Animated paw */}
      <path
        d="M38 50 Q34 58 40 64"
        stroke="#D1BE9B"
        strokeWidth="1.3"
        fill="none"
        style={{
          transform: paw ? 'rotate(-15deg)' : 'rotate(5deg)',
          transformOrigin: '38px 50px',
          transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      <ellipse
        cx="40"
        cy="65"
        rx="5"
        ry="3"
        stroke="#D1BE9B"
        strokeWidth="1"
        style={{
          transform: paw ? 'rotate(-15deg) translate(-4px, -4px)' : 'rotate(5deg)',
          transformOrigin: '38px 50px',
          transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      {/* Static right paw */}
      <path d="M62 50 Q66 58 60 64" stroke="#D1BE9B" strokeWidth="1.3" fill="none" />
      <ellipse cx="60" cy="65" rx="5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}


// ── 9. 舉爪打招呼貓咪（新增，互動用）
export function CatWaving({ className = '', style = {}, onClick }: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const [waving, setWaving] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setWaving(p => !p), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <svg viewBox="0 0 80 100" fill="none" className={className}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="40" cy="72" rx="20" ry="22" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head */}
      <circle cx="40" cy="34" r="18" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Ears */}
      <path d="M25 20 L20 7 L32 18" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M55 20 L60 7 L48 18" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Happy eyes */}
      <path d="M30 32 Q34 29 38 32" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      <path d="M42 32 Q46 29 50 32" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Nose */}
      <path d="M38 38 L40 40.5 L42 38" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Big smile */}
      <path d="M34 43 Q40 48 46 43" stroke="#D1BE9B" strokeWidth="1" fill="none" />
      {/* Whiskers */}
      <line x1="14" y1="37" x2="27" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="13" y1="41" x2="26" y2="41" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="66" y1="37" x2="53" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="67" y1="41" x2="54" y2="41" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Waving paw (right arm raised) */}
      <path
        d="M58 58 Q68 48 66 38"
        stroke="#D1BE9B" strokeWidth="1.4" fill="none"
        style={{
          transform: waving ? 'rotate(18deg)' : 'rotate(-10deg)',
          transformOrigin: '58px 58px',
          transition: 'transform 0.8s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      <ellipse cx="66" cy="37" rx="5" ry="3.5" stroke="#D1BE9B" strokeWidth="1"
        style={{
          transform: waving ? 'rotate(18deg) translate(2px,-4px)' : 'rotate(-10deg)',
          transformOrigin: '58px 58px',
          transition: 'transform 0.8s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      {/* Left paw on ground */}
      <path d="M22 58 Q18 66 22 72" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      <ellipse cx="22" cy="73" rx="5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
      {/* Tail */}
      <path d="M58 88 Q72 80 68 66 Q64 54 58 62" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Collar */}
      <path d="M23 52 Q40 56 57 52" stroke="#D1BE9B" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

// ── 10. 偷窺貓咪（從角落探頭，新增）
export function CatPeeking({ className = '', style = {}, side = 'right' }: { className?: string; style?: React.CSSProperties; side?: 'left' | 'right' }) {
  const flip = side === 'left' ? 'scale(-1,1)' : undefined;
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} style={{ ...style, transform: flip }} xmlns="http://www.w3.org/2000/svg">
      {/* Half body peeking */}
      <ellipse cx="40" cy="60" rx="18" ry="14" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head */}
      <circle cx="30" cy="32" r="18" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Ears */}
      <path d="M16 18 L11 6 L24 16" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M44 18 L49 6 L38 16" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Wide curious eyes */}
      <circle cx="23" cy="30" r="4" stroke="#D1BE9B" strokeWidth="1.1" />
      <circle cx="37" cy="30" r="4" stroke="#D1BE9B" strokeWidth="1.1" />
      <circle cx="24" cy="31" r="1.8" fill="#D1BE9B" fillOpacity="0.5" />
      <circle cx="38" cy="31" r="1.8" fill="#D1BE9B" fillOpacity="0.5" />
      {/* Shine in eyes */}
      <circle cx="25" cy="29" r="0.8" fill="#D1BE9B" fillOpacity="0.9" />
      <circle cx="39" cy="29" r="0.8" fill="#D1BE9B" fillOpacity="0.9" />
      {/* Nose */}
      <path d="M28 36 L30 38.5 L32 36" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Whiskers */}
      <line x1="8" y1="34" x2="20" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="7" y1="38" x2="19" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="52" y1="34" x2="40" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="53" y1="38" x2="41" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* One paw on edge */}
      <path d="M14 52 Q10 58 14 64" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      <ellipse cx="14" cy="65" rx="5" ry="3" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}

// ── 11. 睡覺貓咪（新增，帶 zzz 動畫）
export function CatSleeping({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const [zzzPhase, setZzzPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setZzzPhase(p => (p + 1) % 3), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <svg viewBox="0 0 90 65" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Body lying down */}
      <ellipse cx="50" cy="48" rx="36" ry="14" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head */}
      <circle cx="18" cy="34" r="15" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Ears */}
      <path d="M8 22 L4 12 L16 20" stroke="#D1BE9B" strokeWidth="1" strokeLinejoin="round" />
      <path d="M28 22 L32 12 L22 20" stroke="#D1BE9B" strokeWidth="1" strokeLinejoin="round" />
      {/* Closed eyes */}
      <path d="M10 33 Q14 31 18 33" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      <path d="M18 33 Q22 31 26 33" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Nose */}
      <path d="M16.5 38 L18 40 L19.5 38" stroke="#D1BE9B" strokeWidth="0.7" strokeLinejoin="round" />
      {/* Whiskers */}
      <line x1="2" y1="36" x2="11" y2="37" stroke="#D1BE9B" strokeWidth="0.5" />
      <line x1="1" y1="39" x2="10" y2="39" stroke="#D1BE9B" strokeWidth="0.5" />
      <line x1="34" y1="36" x2="25" y2="37" stroke="#D1BE9B" strokeWidth="0.5" />
      {/* Paws tucked */}
      <ellipse cx="32" cy="56" rx="8" ry="4" stroke="#D1BE9B" strokeWidth="1" />
      {/* Tail curled */}
      <path d="M84 44 Q92 34 84 28 Q76 22 72 32 Q68 42 76 46" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* ZZZ animation */}
      <text
        x="38" y="22"
        fontSize="12"
        fill="none"
        stroke="#D1BE9B"
        strokeWidth="0.5"
        fontFamily="serif"
        opacity={zzzPhase >= 0 ? 0.8 : 0}
        style={{ transition: 'opacity 0.5s' }}
      >z</text>
      <text
        x="46" y="16"
        fontSize="15"
        fill="none"
        stroke="#D1BE9B"
        strokeWidth="0.5"
        fontFamily="serif"
        opacity={zzzPhase >= 1 ? 0.6 : 0}
        style={{ transition: 'opacity 0.5s' }}
      >z</text>
      <text
        x="56" y="10"
        fontSize="18"
        fill="none"
        stroke="#D1BE9B"
        strokeWidth="0.5"
        fontFamily="serif"
        opacity={zzzPhase >= 2 ? 0.4 : 0}
        style={{ transition: 'opacity 0.5s' }}
      >z</text>
    </svg>
  );
}

// ── 12. 貓咪盯著看（紫微命盤用，新增）
export function CatStaring({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 4000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return (
    <svg viewBox="0 0 70 85" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="35" cy="65" rx="20" ry="18" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Head slightly forward/down (looking at something) */}
      <circle cx="35" cy="30" r="18" stroke="#D1BE9B" strokeWidth="1.2" />
      {/* Ears perked up */}
      <path d="M20 15 L15 3 L28 13" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M50 15 L55 3 L42 13" stroke="#D1BE9B" strokeWidth="1.1" strokeLinejoin="round" />
      {/* Big focused eyes */}
      {blink ? (
        <>
          <path d="M25 29 Q30 27 35 29" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
          <path d="M35 29 Q40 27 45 29" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
        </>
      ) : (
        <>
          <circle cx="28" cy="29" r="5" stroke="#D1BE9B" strokeWidth="1.1" />
          <circle cx="42" cy="29" r="5" stroke="#D1BE9B" strokeWidth="1.1" />
          <circle cx="29" cy="30" r="2.5" fill="#D1BE9B" fillOpacity="0.55" />
          <circle cx="43" cy="30" r="2.5" fill="#D1BE9B" fillOpacity="0.55" />
          <circle cx="30" cy="28" r="1" fill="#D1BE9B" fillOpacity="0.9" />
          <circle cx="44" cy="28" r="1" fill="#D1BE9B" fillOpacity="0.9" />
        </>
      )}
      {/* Nose */}
      <path d="M33 36 L35 38.5 L37 36" stroke="#D1BE9B" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Neutral mouth */}
      <path d="M32 41 Q35 43 38 41" stroke="#D1BE9B" strokeWidth="0.8" fill="none" />
      {/* Whiskers */}
      <line x1="10" y1="34" x2="24" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="9" y1="38" x2="23" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="60" y1="34" x2="46" y2="35" stroke="#D1BE9B" strokeWidth="0.6" />
      <line x1="61" y1="38" x2="47" y2="38" stroke="#D1BE9B" strokeWidth="0.6" />
      {/* Tail */}
      <path d="M54 78 Q66 70 62 58 Q58 46 54 54" stroke="#D1BE9B" strokeWidth="1.2" fill="none" />
      {/* Paws */}
      <ellipse cx="26" cy="80" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
      <ellipse cx="44" cy="80" rx="6" ry="3.5" stroke="#D1BE9B" strokeWidth="1" />
    </svg>
  );
}
