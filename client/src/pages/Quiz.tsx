/**
 * SOUL EASE | Mochi．crystal — Energy Quiz System
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk — Premium 4-in-1 Interaction Portal
 */
import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatSitting, CatPeeking } from '@/components/CatElements';
import { QUIZZES, Quiz, QuizQuestion } from '@/data/quizzes';
import { findProduct } from '@/data/products';
import ContactDialog from '@/components/ContactDialog';

export default function QuizPage() {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [isAnimatingNext, setIsAnimatingNext] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);
  
  // Dialog state
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [contactProduct, setContactProduct] = useState<string | undefined>(undefined);

  // Start a quiz
  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setSelectedOptionKey(null);
    setQuizResult(null);
    setIsAnimatingNext(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Click option handler
  const handleSelectOption = (scoreKey: string) => {
    if (isAnimatingNext) return;
    
    setIsAnimatingNext(true);
    setSelectedOptionKey(scoreKey);
    const updatedAnswers = [...selectedAnswers, scoreKey];
    setSelectedAnswers(updatedAnswers);

    setTimeout(() => {
      if (activeQuiz && currentQuestionIdx < activeQuiz.questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        setSelectedOptionKey(null);
        setIsAnimatingNext(false);
      } else {
        // Compute Results
        calculateResult(updatedAnswers);
      }
    }, 300); // Gentle 300ms transition flash
  };

  // Calculate majority score key
  const calculateResult = (answers: string[]) => {
    if (!activeQuiz) return;
    
    // Count frequencies
    const counts: Record<string, number> = {};
    let maxKey = 'A';
    let maxCount = 0;

    answers.forEach((key) => {
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        maxKey = key;
      }
    });

    // Fallback to the first available if not mapped
    const finalResult = activeQuiz.results[maxKey] || Object.values(activeQuiz.results)[0];
    setQuizResult(finalResult);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Restart active quiz
  const handleRestart = () => {
    if (activeQuiz) {
      handleStartQuiz(activeQuiz);
    }
  };

  // Quit back to lobby
  const handleQuit = () => {
    setActiveQuiz(null);
    setQuizResult(null);
    setSelectedAnswers([]);
    setSelectedOptionKey(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Handle purchase click
  const handleBuy = (productName: string) => {
    setContactProduct(productName);
    setIsContactOpen(true);
  };

  // Retrieve recommended product details
  // Dynamic background themes based on active quiz for premium visual texture & animations
  const getQuizTheme = () => {
    if (!activeQuiz) {
      return {
        bg: 'bg-[#FAF7F4]',
        blob1: 'bg-[#E5DFEE]/35',
        blob2: 'bg-[#FAF0EC]/40',
        particles: ['✧', '✦', '⋆', '☁︎', '✨', '🐾'],
      };
    }

    switch (activeQuiz.slug) {
      case 'scent':
        return {
          bg: 'bg-[#FAF6F4]',
          blob1: 'bg-[#FBECE6]/45', // warm peach
          blob2: 'bg-[#EADED6]/40', // Morandi taupe
          particles: ['✿', '❀', '🌷', '✦', '𓂃', '🍃'],
        };
      case 'soul-home':
        return {
          bg: 'bg-[#F6F5F8]',
          blob1: 'bg-[#E2DCEE]/45', // misty violet
          blob2: 'bg-[#D3C7E4]/35', // soft purple
          particles: ['☁︎', '☾', '⋆', '✧', '𓆩♡𓆪', '🌌'],
        };
      case 'past-life':
        return {
          bg: 'bg-[#F4F6F2]',
          blob1: 'bg-[#DFEAD9]/45', // sage green
          blob2: 'bg-[#EAE0CD]/35', // antique bronze
          particles: ['🔮', '📜', '🧭', '✦', '𓇢𓆸', '⚜'],
        };
      case 'love-magnet':
        return {
          bg: 'bg-[#F8F5F0]',
          blob1: 'bg-[#EFE7D8]/50', // champagne
          blob2: 'bg-[#F5DEC9]/40', // warm apricot
          particles: ['🦋', '🌸', '♡', '୨୧', '✦', '✨'],
        };
      default:
        return {
          bg: 'bg-[#FAF7F4]',
          blob1: 'bg-[#E5DFEE]/35',
          blob2: 'bg-[#FAF0EC]/40',
          particles: ['✧', '✦', '⋆', '☁︎', '✨', '🐾'],
        };
    }
  };

  const theme = getQuizTheme();
  const recommendedProduct = quizResult ? findProduct(quizResult.crystalSlug) : undefined;

  return (
    <PageLayout>
      <div className={`min-h-screen py-12 px-4 md:px-8 ${theme.bg} relative overflow-hidden transition-colors duration-1000`}>
        
        {/* Grain Noise Texture for high-end luxury feel */}
        <div className="absolute inset-0 bg-noise opacity-[0.4] pointer-events-none mix-blend-overlay z-10" />

        {/* Dynamic moving Morandi blobs */}
        <div className={`absolute top-1/6 left-1/6 w-[450px] h-[450px] rounded-full ${theme.blob1} blur-[120px] pointer-events-none animate-blob-1 z-0 transition-colors duration-1000`} />
        <div className={`absolute bottom-1/6 right-1/6 w-[500px] h-[500px] rounded-full ${theme.blob2} blur-[130px] pointer-events-none animate-blob-2 z-0 transition-colors duration-1000`} />

        {/* Shifting floating background particles */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {theme.particles.map((char, index) => {
            const delay = index * 2.5;
            const left = 5 + (index * 15) + (index % 2 === 0 ? 5 : -5);
            return (
              <span
                key={index}
                className="absolute text-[#A38D6B]/20 font-light animate-drift-particle text-sm md:text-base"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${16 + (index * 2)}s`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* ─── STATE 1: LOBBY VIEW ───────────────────────────────────────── */}
          {!activeQuiz && (
            <div className="animate-fade-in-up">
              {/* Header */}
              <div className="text-center mb-12">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Psychological Resonance Quizzes
                </span>
                <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  宇宙心理測驗
                </h1>
                <p className="text-xs md:text-sm italic text-[#31353A]/54 tracking-[0.15em] mb-4"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  "Answer with your heart and discover your soul's matching frequency."
                </p>
                
                <div className="flex justify-center items-center gap-2 mt-4">
                  <CatSitting className="w-10 h-12" />
                  <span className="text-[10px] text-[#D1BE9B]/80 font-light select-none tracking-widest">
                    Mochi 陪伴你的內在探索 ⊹ ࣪ ˖
                  </span>
                </div>
              </div>

              {/* Lobby Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {QUIZZES.map((quiz) => (
                  <button
                    type="button"
                    key={quiz.slug}
                    onClick={() => handleStartQuiz(quiz)}
                    className="group quiz-lobby-card cursor-pointer glass-panel bg-white/40 border border-[#D1BE9B]/15 rounded-3xl p-7 shadow-sm relative overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1BE9B]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF7F4]"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D1BE9B]/5 to-transparent pointer-events-none rounded-tr-3xl" />
                    
                    <div className="flex items-start gap-4">
                      <span className="text-3xl p-3 rounded-2xl bg-white/60 shadow-inner border border-[#D1BE9B]/10 select-none">
                        {quiz.emoji}
                      </span>
                      
                      <div className="flex-1 text-left">
                        <span className="text-[9px] tracking-[0.2em] text-[#D1BE9B] uppercase font-light"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                          {quiz.subtitle}
                        </span>
                        <h3 className="text-[15px] md:text-base tracking-[0.1em] text-[#31353A] mt-1 mb-2 font-medium"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                          {quiz.name}
                        </h3>
                        <p className="text-[12px] leading-[1.8] text-[#31353A]/60 font-light"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                          {quiz.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 pt-3 border-t border-[#D1BE9B]/10">
                      <span className="text-[10px] tracking-[0.15em] text-[#A38D6B] hover:text-[#31353A] transition-colors flex items-center gap-1"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        開啟測驗 ✦
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Lobby Footer decorations */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-4">
                  <CatPeeking className="w-12 h-14" side="right" />
                  <p className="text-[11px] text-[#31353A]/50 tracking-wider italic"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    選一個你當下最被吸引的圖案，靜下心來測驗吧 𓆩♡𓆪
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── STATE 2: ACTIVE GAMEPLAY ─────────────────────────────────── */}
          {activeQuiz && !quizResult && (
            <div className="animate-fade-in-up max-w-xl mx-auto text-center">
              
              {/* Back to lobby */}
              <div className="text-left mb-6">
                <button
                  onClick={handleQuit}
                  className="inline-flex items-center gap-1.5 text-xs text-[#31353A]/60 hover:text-[#31353A] transition-colors border-none bg-transparent"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}
                >
                  ← 返回測驗大廳
                </button>
              </div>

              {/* Quiz card header */}
              <div className="mb-8">
                <span className="text-[10px] tracking-[0.35em] text-[#D1BE9B] uppercase font-light">
                  {activeQuiz.subtitle}
                </span>
                <h2 className="text-xl md:text-2xl tracking-[0.15em] text-[#31353A] mt-1.5 mb-3"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {activeQuiz.name}
                </h2>
                
                {/* Custom Unicode Star Progress bar */}
                <div className="flex flex-col items-center gap-1.5 mt-4 select-none">
                  <span className="text-[10px] text-[#D1BE9B]/60 tracking-[0.2em] font-light">
                    ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆
                  </span>
                  
                  {/* Progress Line */}
                  <div className="w-48 h-0.5 bg-[#D1BE9B]/20 rounded-full relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#A38D6B] transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full"
                      style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#A38D6B] font-light mt-1">
                    第 {currentQuestionIdx + 1} 題 ｜ 共 {activeQuiz.questions.length} 題
                  </span>
                </div>
              </div>

              {/* Active Question Box */}
              <div
                key={`${activeQuiz.slug}-${currentQuestionIdx}`}
                className="quiz-question-card glass-panel bg-white/45 backdrop-blur-md border border-[#D1BE9B]/25 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(209,190,155,0.08)] mb-8"
              >
                <p className="text-[14px] md:text-[15.5px] leading-[2.1] text-[#31353A] tracking-wider mb-8 font-light"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}>
                  {activeQuiz.questions[currentQuestionIdx].question}
                </p>

                {/* Options List */}
                <div className="flex flex-col gap-3.5">
                  {activeQuiz.questions[currentQuestionIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.scoreKey)}
                      disabled={isAnimatingNext}
                      className={`quiz-option-button w-full text-left px-6 py-4 text-xs md:text-sm tracking-wide border rounded-2xl font-light disabled:opacity-70 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1BE9B]/70 ${
                        selectedOptionKey === opt.scoreKey
                          ? 'bg-[#3D4144] text-[#FAF7F4] border-[#3D4144] shadow-md'
                          : 'bg-white/40 border-[#D1BE9B]/20 text-[#31353A]/80'
                      }`}
                      style={{ fontFamily: 'Noto Serif TC, serif', lineHeight: '1.7' }}
                    >
                      <span className={`inline-block mr-2.5 text-[10px] font-serif transition-colors duration-150 ${
                        selectedOptionKey === opt.scoreKey ? 'text-[#D1BE9B]' : 'text-[#A38D6B]'
                      }`}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gameplay footer character decoration */}
              <div className="flex items-center justify-center gap-2 select-none opacity-40">
                <span className="text-xs">𓇢𓆸</span>
                <span className="text-[10px] tracking-widest">聆聽直覺的呼吸...</span>
                <span className="text-xs">𓇢𓆸</span>
              </div>
            </div>
          )}

          {/* ─── STATE 3: RESULT PRESENTATION ─────────────────────────────── */}
          {activeQuiz && quizResult && (
            <div className="animate-fade-in-up max-w-2xl mx-auto text-center">
              
              {/* Outer results board */}
              <div className="glass-panel bg-white/45 backdrop-blur-md border border-[#D1BE9B]/25 rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_rgba(209,190,155,0.12)] relative overflow-hidden mb-8">
                
                {/* Elegant decorative corners */}
                <div className="absolute top-4 left-6 opacity-30 select-none text-xs">𓆩♡𓆪</div>
                <div className="absolute top-4 right-6 opacity-30 select-none text-xs">𓆩♡𓆪</div>
                
                <span className="text-[10px] tracking-[0.4em] text-[#D1BE9B] uppercase font-light">
                  Resonance Result
                </span>
                
                <h3 className="text-base italic text-[#A38D6B] mt-2 mb-2 font-serif"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {activeQuiz.name}
                </h3>
                
                {/* Result Title Badge */}
                <div className="inline-block px-8 py-2.5 bg-[#3D4144] text-[#FAF7F4] rounded-full shadow-md mt-2 mb-6">
                  <span className="text-sm md:text-base tracking-[0.3em] font-light flex items-center justify-center gap-1.5"
                    style={{ fontFamily: 'Noto Serif TC, serif' }}>
                    <span>✦</span> {quizResult.title} <span>✦</span>
                  </span>
                </div>
                
                {quizResult.subtitle && (
                  <p className="text-[11px] tracking-[0.25em] text-[#A38D6B] uppercase italic mb-6 font-light"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {quizResult.subtitle}
                  </p>
                )}

                <div className="text-center text-[10px] text-[#D1BE9B]/60 tracking-[0.25em] mb-6 py-1 select-none">
                  ୨୧ ───────── ୨୧
                </div>

                {/* Poetic description */}
                <p className="text-[13px] md:text-[14px] leading-[2.1] text-[#31353A]/82 tracking-wider whitespace-pre-line text-left px-2 mb-8 font-light"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}>
                  {quizResult.description}
                </p>

                {/* Recommended Product Section */}
                {recommendedProduct && (
                  <div className="mt-8 pt-8 border-t border-[#D1BE9B]/15 text-left animate-fade-in-up">
                    <p className="text-[10px] tracking-[0.3em] text-[#D1BE9B] uppercase mb-4 text-center sm:text-left"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      𓂃 ࣪˖ ִֶָ𐀔 專屬能量水晶推薦
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-white/40 border border-[#D1BE9B]/20 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
                      {/* Product Image preview */}
                      <Link href={`/shop/${recommendedProduct.slug}`}>
                        <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-2xl border border-[#D1BE9B]/15 cursor-pointer">
                          <img
                            src={recommendedProduct.img}
                            alt={recommendedProduct.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>

                      {/* Product Details info */}
                      <div className="flex-1 text-center sm:text-left">
                        <span className="text-[10px] tracking-[0.2em] text-[#D1BE9B] font-light"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                          {recommendedProduct.material}
                        </span>
                        <h4 className="text-sm md:text-base tracking-[0.12em] text-[#31353A] font-medium mt-0.5"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                          {recommendedProduct.name}
                        </h4>
                        <p className="text-[11px] italic text-[#31353A]/50 font-serif mb-3"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {recommendedProduct.subtitle}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <span className="text-sm text-[#A38D6B]"
                            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            NT$ {recommendedProduct.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Direct purchase trigger */}
                      <button
                        onClick={() => handleBuy(recommendedProduct.name)}
                        className="py-2.5 px-6 text-[10.5px] tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-300 active:scale-95 shadow-sm font-light select-none cursor-pointer"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}
                      >
                        立即諮詢購買 ♡
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="text-center text-[10px] text-[#D1BE9B]/50 tracking-[0.25em] mt-8 select-none">
                  ☁︎ ─────── ☁︎
                </div>
              </div>

              {/* Navigation Options */}
              <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2.5 text-[11px] tracking-[0.2em] border border-[#3D4144]/15 bg-white/40 hover:bg-[#3D4144] hover:text-[#FAF7F4] hover:border-[#3D4144] rounded-full transition-all duration-500 font-light active:scale-95 text-[#31353A] cursor-pointer shadow-sm"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}
                >
                  ↺ 重新測驗
                </button>
                
                <button
                  onClick={handleQuit}
                  className="px-6 py-2.5 text-[11px] tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] hover:bg-[#D1BE9B] hover:text-[#31353A] rounded-full transition-all duration-500 font-light active:scale-95 cursor-pointer shadow-sm"
                  style={{ fontFamily: 'Noto Serif TC, serif' }}
                >
                  ← 返回測驗大廳
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Global purchase portal dialog */}
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productName={contactProduct}
      />
    </PageLayout>
  );
}
