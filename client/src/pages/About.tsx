import PageLayout from '@/components/PageLayout';
import { Link } from 'wouter';
import { CatSitting, CatSleeping, CatListening, CatWaving, CatPeeking } from '@/components/CatElements';

// Luxury sparkle icon component
const DreamySparkle = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`text-[#D1BE9B] fill-[#D1BE9B]/10 ${className}`} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

// Small decorative star component
const DreamyStar = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`text-[#D1BE9B]/70 fill-[#D1BE9B]/5 ${className}`} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="min-h-screen py-24 px-4 md:px-8 bg-[#FAF7F4] flex flex-col justify-center relative overflow-hidden">
        
        {/* ── DREAMY NEBULA BACKGROUND BLOBS ────────────────────────────────── */}
        <div className="absolute top-[10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-[#E8E4EE] via-[#F8ECEE]/70 to-[#F8F2E8]/40 opacity-60 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#E6EEE4] via-[#F8F2E8]/60 to-[#FAF7F4]/30 opacity-60 blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-[45%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-[#FAF0EC]/40 opacity-40 blur-[85px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />

        {/* ── FLOATING SPARKS & DECORATIONS ──────────────────────────────────── */}
        <DreamySparkle className="absolute top-[15%] left-[12%] w-6 h-6 opacity-30 animate-bounce pointer-events-none" style={{ animationDuration: '5s' }} />
        <DreamySparkle className="absolute bottom-[25%] right-[10%] w-8 h-8 opacity-25 animate-bounce pointer-events-none" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
        <DreamyStar className="absolute top-[40%] right-[12%] w-4 h-4 opacity-40 animate-pulse pointer-events-none" />
        <DreamyStar className="absolute bottom-[45%] left-[8%] w-5 h-5 opacity-35 animate-pulse pointer-events-none" style={{ animationDelay: '2.5s' }} />

        {/* ── EDITORIAL SIDE WATERMARKS ──────────────────────────────────────── */}
        <div className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 font-light text-[10px] tracking-[0.6em] text-[#A38D6B]/35 pointer-events-none select-none uppercase"
          style={{ writingMode: 'vertical-rl', textTransform: 'uppercase', fontFamily: 'Cormorant Garamond, serif' }}>
          Healing Pick — Your Spiritual Sanctuary
        </div>
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 font-light text-[10px] tracking-[0.6em] text-[#A38D6B]/35 pointer-events-none select-none uppercase"
          style={{ writingMode: 'vertical-rl', textTransform: 'uppercase', fontFamily: 'Cormorant Garamond, serif' }}>
          Tarot · Daily Fortune · Warm Treehole · Crystal Energy
        </div>

        {/* Brand large backdrop watermark */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.022] text-[18vw] tracking-[0.2em] font-light text-[#31353A] whitespace-nowrap"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          HEALING COMPANION
        </div>

        {/* ── MASCOT PEEKING DECORATIONS ────────────────────────────────────── */}
        <div className="absolute left-[-16px] top-[22%] opacity-[0.35] hover:opacity-80 transition-opacity duration-500 hidden md:block">
          <CatPeeking className="w-16 h-20" side="left" />
        </div>
        <div className="absolute right-[-16px] top-[58%] opacity-[0.35] hover:opacity-80 transition-opacity duration-500 hidden md:block">
          <CatPeeking className="w-16 h-20" side="right" />
        </div>

        {/* ── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto z-10 w-full animate-fade-in">
          
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="relative inline-block mt-2">
              <h1 className="text-3xl md:text-4xl tracking-[0.25em] font-extralight bg-gradient-to-r from-[#8C7A5F] via-[#D1BE9B] to-[#B08968] bg-clip-text text-transparent py-1 px-6 drop-shadow-[0_2px_4px_rgba(209,190,155,0.06)]"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                About HealingPick
              </h1>
              <DreamySparkle className="absolute -top-3 -right-2 w-4 h-4 opacity-75 animate-pulse" />
              <DreamySparkle className="absolute -bottom-1 -left-2 w-3 h-3 opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6 max-w-sm mx-auto">
              <div className="h-[0.5px] bg-[#D1BE9B]/30 flex-1" />
              <DreamySparkle className="w-3.5 h-3.5 text-[#D1BE9B]/60" />
              <div className="h-[0.5px] bg-[#D1BE9B]/30 flex-1" />
            </div>
          </div>

          {/* Poetry story block - Premium Floating Glass panel */}
          <div className="backdrop-blur-md bg-white/35 rounded-[32px] p-8 md:p-12 border border-white/60 shadow-[0_12px_40px_rgba(209,190,155,0.04)] mb-16 text-center space-y-12 transition-all duration-700 hover:shadow-[0_16px_48px_rgba(209,190,155,0.08)]">
            
            <div className="space-y-6 max-w-xl mx-auto">
              <p className="text-xs md:text-sm tracking-[0.25em] text-[#A38D6B] font-light italic"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                有時候，
              </p>
              <p className="text-[15px] md:text-[16px] leading-[2.4] text-[#31353A]/90 tracking-widest font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                我們不是想知道未來會發生什麼。
              </p>
              <p className="text-[15px] md:text-[16px] leading-[2.4] text-[#31353A]/90 tracking-widest font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                只是想有人告訴我們：
              </p>
              
              {/* Highlight sentence banner */}
              <div className="py-5 px-6 rounded-2xl bg-gradient-to-r from-white/10 via-[#FDF2F4]/60 to-white/10 border-y border-[#D1BE9B]/20 my-6 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF7F4]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <p className="text-lg md:text-xl leading-[2.3] text-[#A38D6B] tracking-[0.2em] font-light"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}>
                  「沒關係，你已經很努力了。」
                </p>
              </div>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#D1BE9B]/40 mx-auto animate-pulse" />

            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-[13px] md:text-[14px] leading-[2.4] text-[#31353A]/78 tracking-widest font-light"
                style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
                HealingPick 就是在這樣的想法下誕生的。<br />
                我們打造了一個結合 AI 塔羅、運勢解析、療癒陪伴與療癒選物的平台。
              </p>
              <p className="text-[13px] md:text-[14px] leading-[2.4] text-[#31353A]/78 tracking-widest font-light"
                style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
                當你感到迷惘的時候，可以來抽張牌。<br />
                當你心情不好的時候，可以來聊聊天。<br />
                當你想送自己一份鼓勵的時候，也可以來挑選屬於自己的療癒小物。
              </p>
            </div>

            {/* Sacred Belief Scroll Card */}
            <div className="relative max-w-lg mx-auto mt-10">
              {/* Double border styling */}
              <div className="absolute inset-0 border border-[#D1BE9B]/20 rounded-3xl -m-1 pointer-events-none" />
              
              {/* Sleepy cat ornament */}
              <div className="absolute -top-7 right-4 z-20">
                <CatSleeping className="w-12 h-10 opacity-70 hover:opacity-100 transition-opacity" />
              </div>

              <div className="bg-gradient-to-br from-white/80 to-[#FAF0EC]/60 p-8 rounded-3xl border border-[#D1BE9B]/25 shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-[#F8ECEE]/40 to-transparent rounded-full blur-xl" />
                <p className="text-xs md:text-sm tracking-[0.25em] text-[#A38D6B] mb-5 font-light"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}>
                  ✦ 我們的信念 ✦
                </p>
                <p className="text-[13px] md:text-[14px] leading-[2.6] text-[#31353A]/85 tracking-[0.2em] font-light"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}>
                  我們相信，<br />
                  療癒不是要你變成更厲害的人。<br />
                  而是讓你在忙碌的生活裡，<br />
                  偶爾停下來，<br />
                  好好照顧自己。
                </p>
                
                {/* Decorative corners */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#D1BE9B]/40" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#D1BE9B]/40" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#D1BE9B]/40" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#D1BE9B]/40" />
              </div>
            </div>

          </div>

          {/* Interactive oracle-card features list */}
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-10">
              <DreamyStar className="w-3.5 h-3.5 opacity-60" />
              <h3 className="text-xs tracking-[0.3em] text-[#A38D6B] text-center"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                ❖ 在 HealingPick，你可以 ❖
              </h3>
              <DreamyStar className="w-3.5 h-3.5 opacity-60" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { emoji: '🤍', title: '抽塔羅牌', desc: '傾聽星空下潛意識的指引', color: '#E8E4EE', gradient: 'from-[#E8E4EE]/35 via-white/50 to-white/40' },
                { emoji: '🌷', title: '看每日運勢', desc: '領受宇宙今日贈與你的祝福', color: '#F8F2E8', gradient: 'from-[#F8F2E8]/35 via-white/50 to-white/40' },
                { emoji: '🦋', title: '找人傾訴心事', desc: '在溫柔樹洞中安全地釋放情緒', color: '#E6EEE4', gradient: 'from-[#E6EEE4]/35 via-white/50 to-white/40' },
                { emoji: '✨', title: '挑選適合自己的療癒選物', desc: '為日常注入一份美好的儀式感', color: '#F8ECEE', gradient: 'from-[#F8ECEE]/35 via-white/50 to-white/40' },
              ].map((card) => (
                <div key={card.title} 
                  className={`backdrop-blur-md bg-gradient-to-tr ${card.gradient} p-7 rounded-[24px] border border-white/70 shadow-[0_8px_30px_rgba(209,190,155,0.03)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(209,190,155,0.12)] hover:border-[#D1BE9B]/40 flex flex-col justify-between group`}>
                  
                  <div className="flex items-start gap-4">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white/80 shadow-sm border border-white/60 group-hover:scale-110 transition-transform duration-500">{card.emoji}</span>
                    <div className="text-left flex-1">
                      <h4 className="text-xs md:text-sm tracking-[0.18em] text-[#31353A]/90 font-medium mt-1"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        {card.title}
                      </h4>
                      {/* Decorative thin divider line under title */}
                      <div className="w-8 h-[1px] bg-[#D1BE9B]/30 my-2 group-hover:w-16 transition-all duration-500" />
                      <p className="text-[11px] md:text-[12px] leading-[1.9] text-[#31353A]/65 tracking-wider font-light"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

          {/* Heartwarming Closing */}
          <div className="text-center max-w-xl mx-auto space-y-8 border-t border-[#D1BE9B]/15 pt-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#FAF7F4]">
              <DreamySparkle className="w-4 h-4 text-[#D1BE9B]/40" />
            </div>

            <p className="text-[13px] md:text-[14px] leading-[2.4] text-[#31353A]/75 tracking-widest font-light"
              style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
              不管你是因為愛情、工作、人際關係，<br />
              還是單純今天過得有點累，<br />
              都希望你能在這裡找到一點安慰。
            </p>
            <p className="text-[13px] md:text-[14px] leading-[2.4] text-[#31353A]/75 tracking-widest font-light"
              style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
              HealingPick 不一定能幫你解決所有問題。<br />
              但希望能陪你一起面對。
            </p>
            
            <div className="text-xl animate-pulse py-2">🤍</div>
            
            <div className="space-y-2">
              <p className="text-sm md:text-base tracking-[0.25em] text-[#A38D6B] font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                歡迎來到 HealingPick。
              </p>
              <p className="text-xs md:text-sm tracking-[0.2em] text-[#31353A]/55 font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                一個讓你好好照顧自己的地方。
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-6 pt-6">
              <CatWaving className="w-14 h-16 opacity-50 hover:opacity-100 transition-opacity" />
              
              <Link href="/">
                <button
                  className="mt-2 px-8 py-3 text-[11px] tracking-[0.3em] font-light border border-[#D1BE9B]/55 text-[#8C7A5F] hover:bg-[#3D4144] hover:text-[#FAF7F4] hover:border-[#3D4144] transition-all duration-500 rounded-full cursor-pointer active:scale-95 shadow-sm"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}
                >
                  回到溫馨首頁
                </button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
