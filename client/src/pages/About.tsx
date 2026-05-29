import PageLayout from '@/components/PageLayout';
import { CatSitting } from '@/components/CatElements';

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="min-h-screen py-16 px-4 md:px-8 bg-[#FAF7F4] flex flex-col justify-center relative overflow-hidden">
        {/* Sparkles / decorations */}
        <div className="absolute top-[20%] left-[8%] w-2 h-2 rounded-full bg-[#D1BE9B]/20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[30%] right-[8%] w-3 h-3 rounded-full bg-[#D1BE9B]/15 animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Brand watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.015] text-[16vw] tracking-[0.25em] font-light text-[#31353A] whitespace-nowrap"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          HEALING PICK
        </div>

        <div className="max-w-2xl mx-auto z-10 w-full animate-fade-in-up">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              About HealingPick
            </span>
            <h1 className="text-2xl md:text-3xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-2"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              關於 HealingPick
            </h1>
            <div className="divider-gold mt-4 max-w-xs mx-auto">
              <svg className="w-3 h-3 text-[#D1BE9B]/60" viewBox="0 0 100 100" fill="none">
                <path d="M50 10 L53 43 L86 46 L53 49 L50 82 L47 49 L14 46 L47 43 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Poetry story block */}
          <div className="space-y-10 text-center mb-16">
            <div className="space-y-4 max-w-xl mx-auto">
              <p className="text-xs md:text-sm tracking-[0.2em] text-[#A38D6B] font-light italic"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                有時候，
              </p>
              <p className="text-[15px] md:text-[16px] leading-[2.3] text-[#31353A]/86 tracking-wider font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                我們不是想知道未來會發生什麼。
              </p>
              <p className="text-[15px] md:text-[16px] leading-[2.3] text-[#31353A]/86 tracking-wider font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                只是想有人告訴我們：
              </p>
              <p className="text-lg md:text-xl leading-[2.3] text-[#A38D6B] tracking-[0.18em] font-light py-2"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                「沒關係，你已經很努力了。」
              </p>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#D1BE9B]/40 mx-auto" />

            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-[13px] md:text-[14px] leading-[2.3] text-[#31353A]/75 tracking-wider font-light"
                style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
                HealingPick 就是在這樣的想法下誕生的。<br />
                我們打造了一個結合 AI 塔羅、運勢解析、療癒陪伴與療癒選物的平台。
              </p>
              <p className="text-[13px] md:text-[14px] leading-[2.3] text-[#31353A]/75 tracking-wider font-light"
                style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
                當你感到迷惘的時候，可以來抽張牌。<br />
                當你心情不好的時候，可以來聊聊天。<br />
                當你想送自己一份鼓勵的時候，也可以來挑選屬於自己的療癒小物。
              </p>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#D1BE9B]/40 mx-auto" />

            <div className="max-w-xl mx-auto bg-[#D1BE9B]/8 p-8 rounded-3xl border border-[#D1BE9B]/15 shadow-[0_8px_32px_rgba(209,190,155,0.04)]">
              <p className="text-xs md:text-sm tracking-[0.2em] text-[#A38D6B] mb-4 font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                ✦ 我們的信念 ✦
              </p>
              <p className="text-[13px] md:text-[14px] leading-[2.4] text-[#31353A]/82 tracking-widest font-light"
                style={{ fontFamily: 'Noto Serif TC, serif' }}>
                我們相信，<br />
                療癒不是要你變成更厲害的人。<br />
                而是讓你在忙碌的生活裡，<br />
                偶爾停下來，<br />
                好好照顧自己。
              </p>
            </div>
          </div>

          {/* Interactive oracle-card features list */}
          <div className="mb-16">
            <h3 className="text-xs tracking-[0.25em] text-[#A38D6B] mb-8 text-center"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              ❖ 在 HealingPick，你可以 ❖
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { emoji: '🤍', title: '抽塔羅牌', desc: '傾聽星空下潛意識的指引', color: '#E8E4EE' },
                { emoji: '🌷', title: '看每日運勢', desc: '領受宇宙今日贈與你的祝福', color: '#F8F2E8' },
                { emoji: '🦋', title: '找人傾訴心事', desc: '在溫柔樹洞中安全地釋放情緒', color: '#E6EEE4' },
                { emoji: '✨', title: '挑選適合自己的療癒小物', desc: '為日常注入一份美好的儀式感', color: '#F8ECEE' },
              ].map((card) => (
                <div key={card.title} 
                  className="glass-panel p-6 rounded-2xl border border-[#D1BE9B]/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(209,190,155,0.12)] flex items-start gap-4"
                  style={{ background: `linear-gradient(135deg, ${card.color}, #FAF7F4)` }}>
                  <span className="text-2xl mt-1">{card.emoji}</span>
                  <div className="text-left">
                    <h4 className="text-xs md:text-sm tracking-[0.15em] text-[#31353A]/90 font-medium mb-1.5"
                      style={{ fontFamily: 'Noto Serif TC, serif' }}>
                      {card.title}
                    </h4>
                    <p className="text-[11px] md:text-[12px] leading-[1.8] text-[#31353A]/62 tracking-wider"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heartwarming Closing */}
          <div className="text-center max-w-xl mx-auto space-y-6 border-t border-[#D1BE9B]/15 pt-12">
            <p className="text-[13px] md:text-[14px] leading-[2.3] text-[#31353A]/72 tracking-wider font-light"
              style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
              不管你是因為愛情、工作、人際關係，<br />
              還是單純今天過得有點累，<br />
              都希望你能在這裡找到一點安慰。
            </p>
            <p className="text-[13px] md:text-[14px] leading-[2.3] text-[#31353A]/72 tracking-wider font-light"
              style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
              HealingPick 不一定能幫你解決所有問題。<br />
              但希望能陪你一起面對。
            </p>
            
            <div className="text-lg py-2">🤍</div>
            
            <p className="text-sm md:text-base tracking-[0.2em] text-[#A38D6B] font-light"
              style={{ fontFamily: 'Noto Serif TC, serif' }}>
              歡迎來到 HealingPick。
            </p>
            <p className="text-xs md:text-sm tracking-[0.15em] text-[#31353A]/60 font-light"
              style={{ fontFamily: 'Noto Serif TC, serif' }}>
              一個讓你好好照顧自己的地方。
            </p>
          </div>

          <div className="flex justify-center mt-12">
            <CatSitting className="w-12 h-16 opacity-40 animate-pulse" />
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
