/**
 * SOUL EASE | Mochi．crystal — Page Layout Wrapper
 * Provides: Navbar + Aurora background + Footer + Page enter animation
 */

import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  noFooter?: boolean;
}

export default function PageLayout({ children, className = '', noFooter = false }: PageLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.18;
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch {
        setIsMusicPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsMusicPlaying(false);
  };

  // Ethereal particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let shootingStars: ShootingStar[] = [];
    let w = 0, h = 0;
    const ctx = canvas.getContext('2d')!;

    // Static starfield — drawn once per frame as background layer
    interface StarPoint { x: number; y: number; r: number; alpha: number; }
    let starfield: StarPoint[] = [];

    function buildStarfield() {
      starfield = [];
      const count = Math.floor((w * h) / 1800); // higher density
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        // Most stars small (0.5-1.0px), some medium (1.0-1.6px), rare bright (1.6-2.4px)
        const r = roll < 0.65 ? Math.random() * 0.5 + 0.5
                : roll < 0.90 ? Math.random() * 0.6 + 1.0
                :               Math.random() * 0.8 + 1.6;
        const alpha = roll < 0.65 ? Math.random() * 0.30 + 0.22
                    : roll < 0.90 ? Math.random() * 0.35 + 0.35
                    :               Math.random() * 0.30 + 0.55;
        starfield.push({ x: Math.random() * w, y: Math.random() * h, r, alpha });
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class ShootingStar {
      x = 0; y = 0; len = 0; speed = 0; angle = 0; alpha = 0; active = false;
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * (w * 0.7);
        this.y = Math.random() * (h * 0.3);
        this.len = Math.random() * 130 + 80;
        this.speed = Math.random() * 4 + 3;
        this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
        this.alpha = 1;
        this.active = true;
      }
      update() {
        if (!this.active) return;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.alpha -= 0.012;
        if (this.alpha <= 0 || this.x > w || this.y > h) this.active = false;
      }
      draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const grad = ctx.createLinearGradient(
          this.x, this.y,
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len
        );
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.2, '#E5DFEE');
        grad.addColorStop(0.4, '#D1BE9B');
        grad.addColorStop(1, 'rgba(209,190,155,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── Falling particles: petal / feather / butterfly ──────────
    type FallType = 'petal' | 'feather' | 'butterfly';
    interface FallParticle {
      x: number; y: number; size: number; alpha: number;
      speedY: number; speedX: number;
      angle: number; spin: number;
      sway: number; swaySpeed: number; swayVal: number;
      type: FallType;
      color: string;
      moonPhase: number;
    }

    const FALL_COLORS = {
      petal:   ['rgba(240,192,196,{a})', 'rgba(230,180,190,{a})', 'rgba(245,210,215,{a})', 'rgba(220,170,180,{a})'],
      feather: ['rgba(180,160,130,{a})', 'rgba(165,148,118,{a})', 'rgba(200,185,155,{a})'],
      butterfly: ['rgba(209,190,155,{a})', 'rgba(225,205,170,{a})', 'rgba(195,178,145,{a})', 'rgba(235,218,185,{a})', 'rgba(200,185,210,{a})', 'rgba(185,170,200,{a})'],
    };

    // Tiny glitter dust — very small bright specks
    interface GlitterDust {
      x: number; y: number; size: number; alpha: number;
      speedY: number; speedX: number; swayVal: number; swaySpeed: number;
    }
    function mkGlitter(): GlitterDust {
      return {
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.45 + 0.30,
        speedY: Math.random() * 0.40 + 0.15,
        speedX: Math.random() * 0.10 - 0.05,
        swayVal: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.012 + 0.004,
      };
    }
    function drawGlitter(g: GlitterDust) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      // Soft glow
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size * 2.5);
      grd.addColorStop(0, `rgba(255,248,230,${g.alpha})`);
      grd.addColorStop(0.4, `rgba(235,218,185,${g.alpha * 0.5})`);
      grd.addColorStop(1, 'rgba(235,218,185,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Bright core
      ctx.globalAlpha = g.alpha * 1.0;
      ctx.fillStyle = 'rgba(255,252,240,0.95)';
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function mkFall(): FallParticle {
      const types: FallType[] = ['petal','petal','petal','feather','feather','butterfly','butterfly','butterfly','butterfly','butterfly'];
      const type = types[Math.floor(Math.random() * types.length)];
      const baseAlpha = type === 'butterfly'
        ? Math.random() * 0.35 + 0.38
        : type === 'petal'
        ? Math.random() * 0.30 + 0.32
        : Math.random() * 0.28 + 0.26;
      const cols = FALL_COLORS[type];
      const col = cols[Math.floor(Math.random() * cols.length)].replace('{a}', String(baseAlpha));
      return {
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: type === 'butterfly' ? Math.random() * 7 + 5
             : type === 'feather'  ? Math.random() * 9 + 6
             :                       Math.random() * 7 + 4,
        alpha: baseAlpha,
        speedY: type === 'butterfly' ? Math.random() * 0.25 + 0.15
               :                       Math.random() * 0.55 + 0.2,
        speedX: Math.random() * 0.12 - 0.06,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() * 0.010 - 0.005),
        sway: 0, swaySpeed: Math.random() * 0.010 + 0.003,
        swayVal: Math.random() * Math.PI * 2,
        type, color: col,
        moonPhase: 0,
      };
    }

    // Draw a butterfly silhouette — elegant thin outline with wing flap based on angle
    function drawButterfly(p: FallParticle) {
      const s = p.size;
      // Wing flap: use angle as a phase for wing opening (0=closed, 1=fully open)
      const flap = Math.abs(Math.sin(p.angle * 2.5)); // 0..1
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color.replace(/,[^,)]+\)/, `,${p.alpha * 0.18})`);
      ctx.lineWidth = 0.7;

      // Upper wings (larger)
      const uw = s * (0.9 + flap * 0.5); // width expands with flap
      const uh = s * 0.85;
      // Right upper wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(uw * 0.4, -uh * 0.2, uw, -uh * 0.9, uw * 0.7, -uh * 0.1);
      ctx.bezierCurveTo(uw * 0.5, uh * 0.25, uw * 0.15, uh * 0.1, 0, 0);
      ctx.fill(); ctx.stroke();
      // Left upper wing (mirror)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-uw * 0.4, -uh * 0.2, -uw, -uh * 0.9, -uw * 0.7, -uh * 0.1);
      ctx.bezierCurveTo(-uw * 0.5, uh * 0.25, -uw * 0.15, uh * 0.1, 0, 0);
      ctx.fill(); ctx.stroke();

      // Lower wings (smaller, rounder)
      const lw = s * (0.55 + flap * 0.3);
      const lh = s * 0.6;
      // Right lower wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(lw * 0.5, uh * 0.1, lw, lh * 0.8, lw * 0.4, lh);
      ctx.bezierCurveTo(lw * 0.1, lh * 0.9, lw * 0.05, lh * 0.4, 0, 0);
      ctx.fill(); ctx.stroke();
      // Left lower wing (mirror)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-lw * 0.5, uh * 0.1, -lw, lh * 0.8, -lw * 0.4, lh);
      ctx.bezierCurveTo(-lw * 0.1, lh * 0.9, -lw * 0.05, lh * 0.4, 0, 0);
      ctx.fill(); ctx.stroke();

      // Body (thin oval)
      ctx.globalAlpha = p.alpha * 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.08, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawPetal(p: FallParticle) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color.replace(/,[^,)]+\)/, ',0.4)');
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.8, p.size, -p.size * 1.4, 0, -p.size * 2);
      ctx.bezierCurveTo(-p.size * 0.6, -p.size * 0.8, -p.size * 0.4, -p.size * 0.3, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function drawFeather(p: FallParticle) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.5;
      // Spine
      ctx.beginPath();
      ctx.moveTo(0, p.size);
      ctx.lineTo(0, -p.size);
      ctx.stroke();
      // Barbs
      const barbs = 7;
      for (let i = 0; i < barbs; i++) {
        const t = (i / (barbs - 1)) * 2 - 1; // -1 to 1
        const yPos = t * p.size;
        const barbLen = p.size * 0.55 * (1 - Math.abs(t) * 0.35);
        ctx.globalAlpha = p.alpha * (0.5 + 0.5 * (1 - Math.abs(t)));
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.quadraticCurveTo(barbLen * 0.5, yPos - barbLen * 0.15, barbLen, yPos + barbLen * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.quadraticCurveTo(-barbLen * 0.5, yPos - barbLen * 0.15, -barbLen, yPos + barbLen * 0.1);
        ctx.stroke();
      }
      ctx.restore();
    }



    resize();
    window.addEventListener('resize', () => { resize(); buildStarfield(); });

    // Build starfield after resize so w/h are correct
    buildStarfield();

    // Initialise falling particles spread across full height (after resize so w/h are set)
    let falling: FallParticle[] = [];
    for (let i = 0; i < 55; i++) {
      const p = mkFall();
      // Distribute evenly across full screen height initially
      // Use grid-based distribution to ensure even spread
      p.y = (i / 55) * h * 1.2 - h * 0.1;
      p.x = Math.random() * w;
      falling.push(p);
    }

    // Glitter dust particles
    let glitters: GlitterDust[] = [];
    for (let i = 0; i < 60; i++) {
      const g = mkGlitter();
      g.y = Math.random() * h;
      glitters.push(g);
    }

    let lastShoot = 0;
    function anim(ts: number) {
      ctx.clearRect(0, 0, w, h);

      // ── Static starfield (bottom layer) ──
      for (const s of starfield) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,250,240,${s.alpha})`;
        ctx.fill();
      }

      // Shooting stars
      // Occasionally spawn 2 shooting stars close together for variety
      if (ts - lastShoot > 1800 + Math.random() * 1600) {
        shootingStars.push(new ShootingStar());
        if (Math.random() < 0.30) {
          // 30% chance of a second star shortly after
          setTimeout(() => shootingStars.push(new ShootingStar()), 400 + Math.random() * 600);
        }
        lastShoot = ts;
      }
      shootingStars = shootingStars.filter(s => s.active);
      shootingStars.forEach(s => { s.update(); s.draw(); });

      // Update & draw glitter dust
      for (let i = 0; i < glitters.length; i++) {
        const g = glitters[i];
        g.swayVal += g.swaySpeed;
        g.x += g.speedX + Math.sin(g.swayVal) * 0.25;
        g.y += g.speedY;
        if (g.y > h + 10) {
          glitters[i] = mkGlitter();
        }
        drawGlitter(g);
      }

      // Update & draw falling particles
      for (let i = 0; i < falling.length; i++) {
        const p = falling[i];
        p.swayVal += p.swaySpeed;
        p.sway = Math.sin(p.swayVal) * 18;
        p.x += p.speedX + Math.sin(p.swayVal) * 0.35;
        p.y += p.speedY;
        p.angle += p.spin;
        if (p.y > h + 20) {
          falling[i] = mkFall();
        }
        if      (p.type === 'petal')     drawPetal(p);
        else if (p.type === 'feather')   drawFeather(p);
        else                             drawButterfly(p);
      }

      animId = requestAnimationFrame(anim);
    }
    animId = requestAnimationFrame(anim);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-aurora relative overflow-x-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[5]"
        aria-hidden="true"
      />

      {/* Compass background ornament */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[min(90vw,600px)] h-[min(90vw,600px)] z-[6] opacity-40 pointer-events-none">
        <svg className="w-full h-full rotate-slow" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="95" stroke="#B8A898" strokeWidth="0.36" strokeDasharray="2 2" strokeOpacity="0.6" />
          <circle cx="100" cy="100" r="75" stroke="#A89888" strokeWidth="0.3" strokeOpacity="0.5" />
          <circle cx="100" cy="100" r="48" stroke="#C9B8A8" strokeWidth="0.34" strokeDasharray="8 4" strokeOpacity="0.55" />
          <line x1="100" y1="5" x2="100" y2="195" stroke="#9E8E7E" strokeWidth="0.22" strokeOpacity="0.45" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="#9E8E7E" strokeWidth="0.22" strokeOpacity="0.45" />
          <polygon points="100,25 165,138 35,138" stroke="#B8A898" strokeWidth="0.2" strokeOpacity="0.42" />
          <polygon points="100,175 165,62 35,62" stroke="#B8A898" strokeWidth="0.2" strokeOpacity="0.42" />
        </svg>
      </div>

      <Navbar />

      <audio ref={audioRef} src="/audio/music.mp3" loop preload="metadata" />

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isMusicPlaying ? '暫停背景音樂' : '播放背景音樂'}
        className={`fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_10px_28px_rgba(49,53,58,0.16)] backdrop-blur-md transition-all duration-300 active:scale-95 ${
          isMusicPlaying
            ? 'border-[#D1BE9B]/55 bg-[#D1BE9B]/20 text-[#8A7250]'
            : 'border-[#D1BE9B]/25 bg-[#FDFBF7]/70 text-[#A38D6B] hover:border-[#D1BE9B]/45 hover:bg-[#FDFBF7]/90'
        }`}
      >
        <span className="sr-only">{isMusicPlaying ? '暫停背景音樂' : '播放背景音樂'}</span>
        <span aria-hidden="true" className="text-base leading-none">
          {isMusicPlaying ? '♪' : '♫'}
        </span>
      </button>

      <main className={`relative z-10 pt-20 page-enter ${className}`}>
        {children}
      </main>

      {!noFooter && <Footer />}
    </div>
  );
}
