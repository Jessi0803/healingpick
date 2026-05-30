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

const ARCHIVE_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

type ResultHealingImage = {
  title: string;
  symbol: string;
  accentSymbol: string;
  palette: [string, string, string, string];
  alt: string;
  caption: string;
};

const RESULT_HEALING_IMAGES: Record<string, ResultHealingImage> = {
  'scent:A': { title: '白桃烏龍', symbol: '🍑', accentSymbol: '🍵', palette: ['#F9DCCB', '#F8EEE2', '#B7C7A5', '#8A6F55'], alt: '白桃烏龍香氣的清甜療癒插畫', caption: '白桃烏龍｜清甜、乾淨、讓人放鬆' },
  'scent:B': { title: '白麝香', symbol: '☁️', accentSymbol: '☀️', palette: ['#F7F2E8', '#E9E4DA', '#C9D2C4', '#837468'], alt: '白麝香香氣的乾淨棉被療癒插畫', caption: '白麝香｜乾淨、可靠、像曬過太陽的棉被' },
  'scent:C': { title: '雨後森林', symbol: '🌧️', accentSymbol: '🌲', palette: ['#DDE9E1', '#C8D8C8', '#78927B', '#496152'], alt: '雨後森林香氣的濕潤森林療癒插畫', caption: '雨後森林｜濕潤木頭、青苔和安靜空氣' },
  'scent:D': { title: '玫瑰花園', symbol: '🌹', accentSymbol: '✨', palette: ['#F2D7D9', '#F8ECE8', '#B98A8F', '#6F555D'], alt: '玫瑰花園香氣的浪漫療癒插畫', caption: '玫瑰花園｜有品味、有氛圍，也很真誠' },
  'soul-home:A': { title: '靜謐月球', symbol: '🌙', accentSymbol: '⭐', palette: ['#DDE4F2', '#F3F1F7', '#8B97B5', '#565C78'], alt: '靜謐月球的深夜療癒插畫', caption: '靜謐月球｜留一點空白，聽見自己的聲音' },
  'soul-home:B': { title: '溫柔海邊', symbol: '🌊', accentSymbol: '🌅', palette: ['#D9EEF0', '#F8E3CF', '#7FB2B5', '#5B747A'], alt: '溫柔海邊的夕陽海浪療癒插畫', caption: '溫柔海邊｜有陪伴，也有可以呼吸的自由' },
  'soul-home:C': { title: '巨木森林', symbol: '🌳', accentSymbol: '🍃', palette: ['#DDEAD8', '#F2E7D6', '#7C966D', '#4F6147'], alt: '巨木森林的穩定療癒插畫', caption: '巨木森林｜穩定、踏實，也需要被支持' },
  'soul-home:D': { title: '童話小鎮', symbol: '🏡', accentSymbol: '🌼', palette: ['#F7E3C8', '#FDF3E8', '#C79772', '#7C5E4F'], alt: '童話小鎮的溫暖生活療癒插畫', caption: '童話小鎮｜被日常小事重新充滿電' },
  'past-life:A': { title: '王室顧問', symbol: '📚', accentSymbol: '👑', palette: ['#E9DDC8', '#F7F0E4', '#A48962', '#5E4D3F'], alt: '王室顧問的古老圖書館療癒插畫', caption: '王室顧問｜冷靜看局，也記得照顧感受' },
  'past-life:B': { title: '神祕草藥師', symbol: '🌿', accentSymbol: '🧪', palette: ['#DDEBD7', '#F4EFE0', '#7EA071', '#4F6B4D'], alt: '神祕草藥師的花草療癒插畫', caption: '神祕草藥師｜懂得照顧傷口，也要保留力氣' },
  'past-life:C': { title: '皇家占星師', symbol: '🔭', accentSymbol: '🌌', palette: ['#DCE3F4', '#EFE9F6', '#7D86B2', '#4C5271'], alt: '皇家占星師的星空觀測療癒插畫', caption: '皇家占星師｜看懂規律，也給答案一點時間' },
  'past-life:D': { title: '自由藝術家', symbol: '🎨', accentSymbol: '🌸', palette: ['#F4D9D2', '#F8EEDC', '#BE8580', '#69525A'], alt: '自由藝術家的畫室療癒插畫', caption: '自由藝術家｜把敏感變成創作和魅力' },
  'past-life:E': { title: '流浪冒險家', symbol: '🧭', accentSymbol: '🗺️', palette: ['#DCE8E7', '#F5E4CA', '#7A9A9B', '#5A6152'], alt: '流浪冒險家的地圖旅行療癒插畫', caption: '流浪冒險家｜想去遠方，也要帶著穩定感' },
  'love-magnet:A': { title: '成熟治癒型', symbol: '⚓', accentSymbol: '🕯️', palette: ['#E8DDD1', '#F8EFE6', '#9E8977', '#655548'], alt: '成熟治癒型的安心港灣療癒插畫', caption: '成熟治癒型｜慢慢靠近，穩穩接住' },
  'love-magnet:B': { title: '熱烈直球型', symbol: '☀️', accentSymbol: '🧺', palette: ['#F8DC9F', '#FDEED5', '#D2925F', '#75594A'], alt: '熱烈直球型的陽光療癒插畫', caption: '熱烈直球型｜喜歡就靠近，明亮又直接' },
  'love-magnet:C': { title: '浪漫靈性型', symbol: '💌', accentSymbol: '✨', palette: ['#EAD8EF', '#F7EAF0', '#A88AB2', '#63536F'], alt: '浪漫靈性型的星光花束療癒插畫', caption: '浪漫靈性型｜不只心動，也想懂你' },
  'love-magnet:D': { title: '專注事業型', symbol: '☕', accentSymbol: '🪴', palette: ['#DED8C9', '#F3EFE5', '#8F9279', '#585B4D'], alt: '專注事業型的咖啡桌面療癒插畫', caption: '專注事業型｜一起努力，也一起好好相待' },
  'stress-style:A': { title: '安靜充電', symbol: '🛏️', accentSymbol: '🌙', palette: ['#E4E8EF', '#F7F3EA', '#98A0B1', '#606673'], alt: '安靜充電的房間窗光療癒插畫', caption: '安靜充電｜把不被打擾的時間還給自己' },
  'stress-style:B': { title: '被好好理解', symbol: '🍵', accentSymbol: '💬', palette: ['#E8E0CF', '#F8F1E5', '#9F9276', '#675B4C'], alt: '被好好理解的茶與陪伴療癒插畫', caption: '被好好理解｜不用先整理好，才值得被聽見' },
  'stress-style:C': { title: '重新整理生活', symbol: '🪴', accentSymbol: '🧺', palette: ['#DDE8DC', '#F5F1E7', '#7E9B7E', '#536553'], alt: '重新整理生活的清爽桌面療癒插畫', caption: '重新整理生活｜先整理一小塊，心也會跟著穩' },
  'stress-style:D': { title: '一點行動感', symbol: '👟', accentSymbol: '🌤️', palette: ['#DCEBDE', '#FBE9C8', '#82A882', '#586E5B'], alt: '需要行動感的陽光散步療癒插畫', caption: '一點行動感｜讓悶住的能量先流動起來' },
  'decision-style:A': { title: '怕讓人失望', symbol: '📝', accentSymbol: '🤍', palette: ['#F1DAD8', '#F8EEE6', '#B68483', '#68565A'], alt: '怕讓人失望時寫下真心的療癒插畫', caption: '怕讓人失望｜先聽見自己真正想選什麼' },
  'decision-style:B': { title: '想找到最好答案', symbol: '☕', accentSymbol: '❔', palette: ['#E7DCCB', '#F8EFE5', '#A68F72', '#62564C'], alt: '想找到最好答案時的筆記咖啡療癒插畫', caption: '想找到最好答案｜先選一個能往前走的版本' },
  'decision-style:C': { title: '需要安全感', symbol: '🏠', accentSymbol: '🧸', palette: ['#F0DFC9', '#FBF1E4', '#B88B67', '#6B5749'], alt: '需要安全感時的溫暖居家療癒插畫', caption: '需要安全感｜有退路，才更敢往前' },
  'decision-style:D': { title: '等自己準備好', symbol: '👣', accentSymbol: '🌱', palette: ['#DDE9D8', '#F5EAD4', '#82A071', '#53644A'], alt: '等待準備好時踏出小步的療癒插畫', caption: '等自己準備好｜先做很小的一步就算開始' },
  'heart-weather:A': { title: '微霧早晨', symbol: '🌫️', accentSymbol: '🌤️', palette: ['#DDE7E8', '#F7EEDC', '#91A7A8', '#5C6F70'], alt: '微霧早晨的柔光療癒插畫', caption: '微霧早晨｜不用急，霧會慢慢散' },
  'heart-weather:B': { title: '安靜小雨', symbol: '🌧️', accentSymbol: '🫖', palette: ['#DCE5ED', '#F0EADF', '#8298AA', '#536371'], alt: '安靜小雨的窗邊療癒插畫', caption: '安靜小雨｜允許自己低落，也給自己一點暖' },
  'heart-weather:C': { title: '雲後放晴', symbol: '🌤️', accentSymbol: '🌷', palette: ['#DCEBF1', '#F9E4D1', '#7FA9B9', '#5E7077'], alt: '雲後放晴的花與天空療癒插畫', caption: '雲後放晴｜抓住那一點想變好的念頭' },
  'heart-weather:D': { title: '深夜月光', symbol: '🌙', accentSymbol: '🪟', palette: ['#DDE1F0', '#F0ECF7', '#858EB0', '#515875'], alt: '深夜月光的安靜療癒插畫', caption: '深夜月光｜安靜下來，答案會慢慢浮上來' },
};

const escapeSvgText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const createHealingSvg = (image: ResultHealingImage) => {
  const [soft, base, accent, ink] = image.palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${soft}"/>
          <stop offset="100%" stop-color="${base}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="${ink}" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="800" height="600" rx="64" fill="url(#bg)"/>
      <circle cx="140" cy="105" r="118" fill="#fff" opacity="0.28"/>
      <circle cx="690" cy="520" r="160" fill="${accent}" opacity="0.18"/>
      <circle cx="400" cy="270" r="230" fill="url(#glow)"/>
      <path d="M88 438 C210 388 290 468 408 420 C524 374 610 406 716 354 L716 600 L88 600 Z" fill="#ffffff" opacity="0.28"/>
      <path d="M105 456 C224 412 302 488 412 444 C526 398 616 430 704 388" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.32"/>
      <g filter="url(#softShadow)">
        <circle cx="400" cy="270" r="118" fill="#fff" opacity="0.72"/>
        <circle cx="400" cy="270" r="92" fill="${base}" opacity="0.7"/>
        <text x="400" y="310" text-anchor="middle" font-size="96" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${image.symbol}</text>
      </g>
      <text x="280" y="210" text-anchor="middle" font-size="46" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" opacity="0.9">${image.accentSymbol}</text>
      <text x="522" y="222" text-anchor="middle" font-size="34" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" opacity="0.72">✦</text>
      <text x="240" y="366" text-anchor="middle" font-size="30" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" opacity="0.72">♡</text>
      <text x="560" y="376" text-anchor="middle" font-size="32" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" opacity="0.68">✧</text>
      <text x="400" y="500" text-anchor="middle" fill="${ink}" font-size="34" font-weight="500" letter-spacing="5" font-family="'Noto Serif TC','PingFang TC','Microsoft JhengHei',serif">${escapeSvgText(image.title)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getResultHealingImage = (quizSlug?: string, resultKey?: string) => {
  if (!quizSlug || !resultKey) return undefined;
  const image = RESULT_HEALING_IMAGES[`${quizSlug}:${resultKey}`];
  if (!image) return undefined;
  return {
    src: createHealingSvg(image),
    alt: image.alt,
    caption: image.caption,
  };
};

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
        bg: 'bg-[#FBFAF6]',
        blob1: 'bg-[#DED3C4]/28',
        blob2: 'bg-[#C8D3D2]/20',
        particles: ['✧', '✦', '⋆', '☽', '✷', '𓆸'],
      };
    }

    switch (activeQuiz.slug) {
      case 'scent':
        return {
          bg: 'bg-[#FBFAF7]',
          blob1: 'bg-[#FBECE6]/30', // warm peach
          blob2: 'bg-[#DCE8E4]/20', // airy sage
          particles: ['✿', '❀', '🌷', '✦', '𓂃', '🍃'],
        };
      case 'soul-home':
        return {
          bg: 'bg-[#FAFAFC]',
          blob1: 'bg-[#E2DCEE]/30', // misty violet
          blob2: 'bg-[#DCE7EC]/22', // soft blue
          particles: ['☁︎', '☾', '⋆', '✧', '𓆩♡𓆪', '🌌'],
        };
      case 'past-life':
        return {
          bg: 'bg-[#FAFBF7]',
          blob1: 'bg-[#DFEAD9]/30', // sage green
          blob2: 'bg-[#DCE7EC]/20', // pale blue
          particles: ['🔮', '📜', '🧭', '✦', '𓇢𓆸', '⚜'],
        };
      case 'love-magnet':
        return {
          bg: 'bg-[#FBFAF6]',
          blob1: 'bg-[#EFE7D8]/30', // champagne
          blob2: 'bg-[#E4ECE8]/20', // soft green
          particles: ['🦋', '🌸', '♡', '୨୧', '✦', '✨'],
        };
      case 'stress-style':
        return {
          bg: 'bg-[#FAFBF7]',
          blob1: 'bg-[#DFEADC]/30',
          blob2: 'bg-[#DCE7EC]/20',
          particles: ['🕯️', '☁︎', '✧', '𓂃', '♡', '⋆'],
        };
      case 'decision-style':
        return {
          bg: 'bg-[#FBFAF6]',
          blob1: 'bg-[#EFE2CC]/28',
          blob2: 'bg-[#DCE7EC]/22',
          particles: ['🗝️', '✦', '⋆', '☽', '𓇢', '♡'],
        };
      case 'heart-weather':
        return {
          bg: 'bg-[#FAFCFC]',
          blob1: 'bg-[#DDE9EE]/30',
          blob2: 'bg-[#F0DDD8]/20',
          particles: ['🌦️', '☁︎', '☾', '✧', '⋆', '♡'],
        };
      default:
        return {
          bg: 'bg-[#FBFAF6]',
          blob1: 'bg-[#DED3C4]/28',
          blob2: 'bg-[#C8D3D2]/20',
          particles: ['✧', '✦', '⋆', '☽', '✷', '𓆸'],
        };
    }
  };

  const theme = getQuizTheme();
  const recommendedProduct = quizResult ? findProduct(quizResult.crystalSlug) : undefined;
  const resultHealingImage = getResultHealingImage(activeQuiz?.slug, quizResult?.key);

  return (
    <PageLayout>
      <div className={`quiz-archive-shell min-h-screen py-12 px-4 md:px-8 ${theme.bg} relative overflow-hidden transition-colors duration-1000`}>
        
        {/* Grain Noise Texture for high-end luxury feel */}
        <div className="absolute inset-0 bg-noise opacity-[0.4] pointer-events-none mix-blend-overlay z-10" />
        <div className="absolute inset-0 quiz-archive-vignette pointer-events-none z-[1]" />
        <div className="quiz-archive-stardust pointer-events-none z-[2]" />
        <div className="quiz-archive-orbits pointer-events-none z-[2]">
          <span />
          <span />
          <span />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B89D68]/40 to-transparent z-[2]" />

        {/* Dynamic moving Morandi blobs */}
        <div className={`absolute top-1/6 left-1/6 w-[450px] h-[450px] rounded-full ${theme.blob1} blur-[120px] pointer-events-none animate-blob-1 z-0 transition-colors duration-1000`} />
        <div className={`absolute bottom-[24%] right-[24%] w-[440px] h-[440px] rounded-full ${theme.blob2} blur-[120px] pointer-events-none animate-blob-2 z-0 transition-colors duration-1000`} />

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
                <span className="inline-flex items-center gap-3 rounded-full border border-[#B89D68]/25 bg-[#F8F1E7]/55 px-5 py-2 text-[10px] tracking-[0.42em] text-[#9A7C52] uppercase shadow-[0_10px_30px_rgba(86,66,42,0.06)]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  <span className="text-[#B89D68]">✦</span>
                  Soul Archive
                  <span className="text-[#B89D68]">✦</span>
                </span>
                <h1 className="text-3xl md:text-5xl tracking-[0.24em] font-extralight text-[#2F3336] mt-5 mb-4"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  宇宙心理測驗
                </h1>
                <p className="max-w-xl mx-auto text-[12px] md:text-[13px] leading-[2.1] text-[#31353A]/62 tracking-[0.16em] mb-5"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  先憑感覺選一份吧，你現在最需要看的，常常就是最先吸引你的那個。
                </p>
                
                <div className="flex justify-center items-center gap-2 mt-5">
                  <CatSitting className="w-10 h-12" />
                  <span className="text-[10px] text-[#9A7C52]/75 font-light select-none tracking-widest">
                    Mochi 會在旁邊替你守著這盞小燈 ⊹ ࣪ ˖
                  </span>
                </div>
              </div>

              {/* Lobby Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {QUIZZES.map((quiz, index) => (
                  <button
                    type="button"
                    key={quiz.slug}
                    onClick={() => handleStartQuiz(quiz)}
                    className="group quiz-lobby-card quiz-archive-card cursor-pointer rounded-[30px] p-7 shadow-sm relative overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89D68]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F4EFE7]"
                  >
                    <div className="absolute inset-[10px] rounded-[22px] border border-[#B89D68]/18 pointer-events-none" />
                    <div className="absolute -top-16 -right-14 w-36 h-36 rounded-full bg-[#D1BE9B]/12 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-40" />
                    <div className="quiz-card-glint pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start justify-between gap-4 mb-8">
                      <div>
                        <span className="text-[10px] tracking-[0.35em] text-[#9A7C52]/70 uppercase"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          Archive {ARCHIVE_NUMERALS[index] ?? index + 1}
                        </span>
                        <div className="mt-2 h-px w-16 bg-gradient-to-r from-[#B89D68]/50 to-transparent" />
                      </div>
                      <span className="quiz-archive-seal text-3xl rounded-full border border-[#B89D68]/25 bg-[#FBF6EC]/70 shadow-inner select-none">
                        {quiz.emoji}
                      </span>
                    </div>
                    
                    <div className="relative z-10">
                      <span className="text-[9px] tracking-[0.26em] text-[#9A7C52] uppercase font-light"
                          style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        {quiz.subtitle}
                      </span>
                      <h3 className="text-[17px] md:text-lg tracking-[0.13em] text-[#2F3336] mt-2 mb-3 font-medium"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        {quiz.name}
                      </h3>
                      <p className="text-[12px] leading-[1.95] text-[#31353A]/62 font-light"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        {quiz.desc}
                      </p>
                    </div>

                    <div className="relative z-10 flex justify-between items-center mt-7 pt-4 border-t border-[#B89D68]/15">
                      <span className="text-[9px] tracking-[0.24em] text-[#31353A]/38 uppercase"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        Sealed Reading
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-[#8A6D45] transition-colors flex items-center gap-1"
                        style={{ fontFamily: 'Noto Serif TC, serif' }}>
                        開啟檔案 ✦
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
                    先不要急著分析，讓直覺替你翻開第一頁 𓆩♡𓆪
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
                <span className="text-[10px] tracking-[0.35em] text-[#9A7C52] uppercase font-light">
                  Archive in progress · {activeQuiz.subtitle}
                </span>
                <h2 className="text-xl md:text-2xl tracking-[0.15em] text-[#31353A] mt-1.5 mb-3"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {activeQuiz.name}
                </h2>
                
                {/* Custom Unicode Star Progress bar */}
                <div className="flex flex-col items-center gap-1.5 mt-4 select-none">
                  <span className="text-[10px] text-[#9A7C52]/60 tracking-[0.2em] font-light">
                    ✦ ── soul scan ── ✦
                  </span>
                  
                  {/* Progress Line */}
                  <div className="quiz-progress-track w-52 h-px bg-[#B89D68]/20 rounded-full relative overflow-hidden">
                    <div 
                      className="quiz-progress-fill absolute top-0 left-0 h-full bg-[#8A6D45] transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full"
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
                className="quiz-question-card quiz-archive-panel rounded-[32px] p-8 shadow-[0_18px_50px_rgba(86,66,42,0.10)] mb-8"
              >
                <div className="mb-5 flex items-center justify-between gap-4 text-[9px] tracking-[0.26em] text-[#9A7C52]/70 uppercase"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  <span>Entry {String(currentQuestionIdx + 1).padStart(2, '0')}</span>
                  <span>Listen first</span>
                </div>
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
                      className={`quiz-option-button relative overflow-hidden w-full text-left px-6 py-4 text-xs md:text-sm tracking-wide border rounded-2xl font-light disabled:opacity-70 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1BE9B]/70 ${
                        selectedOptionKey === opt.scoreKey
                          ? 'bg-[#2F3336] text-[#FAF7F4] border-[#2F3336] shadow-md'
                          : 'bg-[#FFF9EF]/55 border-[#B89D68]/20 text-[#31353A]/80'
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
              <div className="quiz-result-card glass-panel bg-white/45 backdrop-blur-md border border-[#D1BE9B]/25 rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_rgba(209,190,155,0.12)] relative overflow-hidden mb-8">
                <div className="quiz-result-reveal pointer-events-none" />
                
                {/* Elegant decorative corners */}
                <div className="absolute top-4 left-6 opacity-30 select-none text-xs">𓆩♡𓆪</div>
                <div className="absolute top-4 right-6 opacity-30 select-none text-xs">𓆩♡𓆪</div>
                
                <span className="text-[10px] tracking-[0.4em] text-[#9A7C52] uppercase font-light">
                  Archive Revealed
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

                {resultHealingImage && (
                  <div className="mx-auto mb-7 w-full max-w-sm overflow-hidden rounded-[28px] border border-[#D1BE9B]/20 bg-white/45 p-2 shadow-[0_14px_40px_rgba(209,190,155,0.14)]">
                    <img
                      src={resultHealingImage.src}
                      alt={resultHealingImage.alt}
                      className="aspect-[4/3] w-full rounded-[22px] object-cover"
                    />
                    <p className="px-3 py-3 text-center text-[11px] leading-relaxed tracking-[0.12em] text-[#6F6256]/70 font-light"
                      style={{ fontFamily: 'Noto Serif TC, serif' }}>
                      {resultHealingImage.caption}
                    </p>
                  </div>
                )}

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
