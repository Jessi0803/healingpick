/**
 * SOUL EASE — Soul Treehole Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - Mood selection
 *   - Free-form text input
 *   - Keyword-based comforting response
 *   - Product recommendation based on mood + keywords
 *   - Breathing exercise prompt
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { CatListening, CatLoading } from '@/components/CatElements';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';

// ─── Mood categories ──────────────────────────────────────────────────────────
const MOODS = [
  { id: 'anxious',     label: '焦慮不安',  icon: '🌀', color: '#B8A8C8', crystal: '紫水晶',  hz: '432Hz' },
  { id: 'sad',         label: '難過低落',  icon: '🌧', color: '#A8B8C8', crystal: '月光石',  hz: '528Hz' },
  { id: 'lonely',      label: '孤獨寂寞',  icon: '🍂', color: '#C0A8A0', crystal: '粉晶',    hz: '528Hz' },
  { id: 'angry',       label: '憤怒委屈',  icon: '🔥', color: '#C09898', crystal: '黑碧璽',  hz: '396Hz' },
  { id: 'confused',    label: '迷茫困惑',  icon: '🌫', color: '#A8A8B8', crystal: '白水晶',  hz: '432Hz' },
  { id: 'stressed',    label: '壓力過大',  icon: '⚡', color: '#B8C0A0', crystal: '綠幽靈',  hz: '396Hz' },
  { id: 'heartbroken', label: '感情受傷',  icon: '💔', color: '#D0A8B8', crystal: '粉晶',    hz: '528Hz' },
  { id: 'lost',        label: '失去方向',  icon: '🧭', color: '#A8B8A8', crystal: '青金石',  hz: '432Hz' },
];

// ─── Product catalog (mirrors Shop.tsx) ──────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: '薰衣草紫水晶簇', subtitle: 'Amethyst Cluster', price: 1280,
    category: 'amethyst', tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['淨化空間能量', '改善睡眠品質', '增強直覺力', '緩解焦慮'],
    keywords: ['焦慮', '睡不著', '睡眠', '緊張', '不安', '壓力', '煩躁', '靜不下來'],
    moods: ['anxious', 'stressed'],
  },
  {
    id: 2, name: '馬達加斯加粉晶球', subtitle: 'Rose Quartz Sphere', price: 980,
    category: 'rose', tag: '新品',
    img: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=80',
    properties: ['開啟心輪', '吸引愛情', '療癒情傷', '增進人際關係'],
    keywords: ['感情', '失戀', '分手', '愛情', '孤單', '寂寞', '被拋棄', '不被愛', '渴望愛'],
    moods: ['lonely', 'heartbroken', 'sad'],
  },
  {
    id: 3, name: '天然黃水晶原礦', subtitle: 'Citrine Raw Crystal', price: 760,
    category: 'citrine', tag: null,
    img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    properties: ['顯化豐盛', '提升自信', '增強行動力', '財富磁場'],
    keywords: ['工作', '事業', '錢', '財富', '自信', '目標', '行動', '機會', '升職', '創業'],
    moods: ['lost', 'confused', 'stressed'],
  },
  {
    id: 4, name: '白水晶能量棒', subtitle: 'Clear Quartz Wand', price: 1580,
    category: 'clear', tag: '精選',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    properties: ['淨化全脈輪', '放大意圖', '增強冥想效果', '萬用療癒'],
    keywords: ['迷茫', '不知道', '方向', '冥想', '淨化', '清理', '重新開始'],
    moods: ['confused', 'lost', 'general'],
  },
  {
    id: 5, name: '黑碧璽原礦', subtitle: 'Black Tourmaline Raw', price: 680,
    category: 'tourmaline', tag: null,
    img: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=80',
    properties: ['防護負能量', '接地氣', '消除電磁波', '穩定情緒'],
    keywords: ['憤怒', '委屈', '被傷害', '負能量', '防護', '保護', '情緒不穩', '暴躁'],
    moods: ['angry', 'stressed', 'anxious'],
  },
  {
    id: 6, name: '月光石橢圓裸石', subtitle: 'Moonstone Cabochon', price: 1180,
    category: 'moonstone', tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    properties: ['增強直覺', '平衡情緒', '促進轉變', '女性能量'],
    keywords: ['難過', '低落', '憂鬱', '情緒', '轉變', '改變', '直覺', '女性'],
    moods: ['sad', 'confused', 'heartbroken'],
  },
  {
    id: 7, name: '青金石圓珠手串', subtitle: 'Lapis Lazuli Bracelet', price: 880,
    category: 'lapis', tag: '特價',
    img: 'https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?w=600&q=80',
    properties: ['增強溝通力', '提升智慧', '開啟第三眼', '真誠表達'],
    keywords: ['說不出口', '溝通', '表達', '誤解', '被誤會', '找不到方向', '智慧'],
    moods: ['lost', 'confused', 'angry'],
  },
  {
    id: 8, name: '綠幽靈水晶球', subtitle: 'Phantom Quartz Sphere', price: 2280,
    category: 'phantom', tag: '限量',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['財富顯化', '事業助力', '心輪療癒', '豐盛能量'],
    keywords: ['壓力', '工作壓力', '事業', '財富', '豐盛', '心輪', '療癒'],
    moods: ['stressed', 'lost'],
  },
];

// ─── Smart product recommendation ────────────────────────────────────────────
function recommendProducts(mood: string, text: string) {
  const scores: Record<number, number> = {};

  PRODUCTS.forEach(p => {
    let score = 0;
    // Mood match
    if (p.moods.includes(mood)) score += 3;
    if (p.moods.includes('general')) score += 1;
    // Keyword match in text
    p.keywords.forEach(kw => {
      if (text.includes(kw)) score += 2;
    });
    scores[p.id] = score;
  });

  return PRODUCTS
    .filter(p => scores[p.id] > 0)
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, 2);
}

// ─── AI response templates ────────────────────────────────────────────────────
const AI_RESPONSES: Record<string, string[]> = {
  anxious: [
    '我感受到你現在承受著很多。那種心跳加速、思緒停不下來的感覺，真的很累。',
    '你不需要立刻解決所有事情。有時候，允許自己「暫時不知道答案」，反而是一種勇氣。',
    '試著把手放在心口，感受它穩定的跳動。你比你想像的更有力量。',
  ],
  sad: [
    '難過的時候，不需要假裝沒事。眼淚是心靈在清洗傷口，讓它流吧。',
    '你願意說出來，這本身就是一種療癒的開始。我在這裡，陪著你。',
    '黑暗的夜晚之後，總會有光。你現在感受到的沉重，不會是永遠的。',
  ],
  lonely: [
    '孤獨感有時候比任何痛苦都更難承受。謝謝你願意把這份感受告訴我。',
    '你不是真的孤單。有很多人，在不同的地方，也正在感受著相似的心情。',
    '你值得被愛、被理解、被珍惜。這不是空話，而是真實的。',
  ],
  angry: [
    '你有權利憤怒。那些讓你委屈的事，是真實存在的，你的感受是完全合理的。',
    '憤怒的背後，往往藏著一個受傷的心。能告訴我，是什麼讓你這麼痛嗎？',
    '先讓自己的情緒流動，不要壓抑它。等你準備好了，我們再一起看看怎麼面對。',
  ],
  confused: [
    '迷茫的時候，不需要急著找答案。有時候，停下來本身就是一種智慧。',
    '你不需要把所有事情都想清楚才能繼續前進。一小步，就夠了。',
    '霧裡看花，有時候反而能看見平時忽略的美。你現在的迷茫，也許正在孕育新的方向。',
  ],
  stressed: [
    '你已經很努力了。那些壓在肩上的重量，我都看見了。',
    '先深呼吸一次。把所有待辦事項放下三分鐘，只是三分鐘。你值得這份喘息。',
    '不是所有事情都需要你一個人扛。試著問問自己：哪些事情，其實可以放下？',
  ],
  heartbroken: [
    '感情的傷，是所有傷裡最難說清楚的一種。你不需要解釋，我都懂。',
    '失去一段感情，就像失去了一個版本的自己。給自己時間悼念，這是必要的。',
    '你現在感受到的痛，說明你曾經真心愛過。這份勇氣，是值得被珍惜的。',
  ],
  lost: [
    '不知道方向的時候，先停下來。不是每一刻都需要知道下一步。',
    '你願意承認自己迷失了，這需要很大的誠實。這份誠實，正是找到方向的第一步。',
    '有時候，「不知道」本身就是一個答案。它告訴你，現在需要的是休息，而不是行動。',
  ],
  general: [
    '謝謝你願意把心事說出來。每一個字，我都認真讀了。',
    '你的感受是真實的，你的困擾是值得被重視的。',
    '不管發生了什麼，你都值得被溫柔對待——包括被自己溫柔對待。',
  ],
};

function generateResponse(mood: string, text: string): string {
  const responses = AI_RESPONSES[mood] || AI_RESPONSES.general;
  const base = responses.join('\n\n');
  const extra = text.length > 50
    ? '\n\n你說了很多，我感受到這件事對你來說有多重要。謝謝你願意信任我，把這些都說出來。'
    : '';
  return base + extra;
}

// ─── Breathing exercise ───────────────────────────────────────────────────────
function BreathingExercise() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startBreathing() {
    setPhase('inhale');
    setCount(4);
    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let currentCount = 4;
    intervalRef.current = setInterval(() => {
      currentCount--;
      if (currentCount <= 0) {
        if (currentPhase === 'inhale') { currentPhase = 'hold'; currentCount = 7; }
        else if (currentPhase === 'hold') { currentPhase = 'exhale'; currentCount = 8; }
        else { currentPhase = 'inhale'; currentCount = 4; }
      }
      setPhase(currentPhase);
      setCount(currentCount);
    }, 1000);
  }

  function stopBreathing() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('idle');
    setCount(0);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const phaseLabels = { idle: '開始呼吸練習', inhale: '吸氣', hold: '屏息', exhale: '呼氣' };
  const phaseColors = { idle: '#D1BE9B', inhale: '#A8C0A8', hold: '#B8A8C8', exhale: '#A8B8C8' };
  const scaleMap = { idle: 1, inhale: 1.3, hold: 1.3, exhale: 0.9 };

  return (
    <div className="text-center">
      <div
        className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer transition-all duration-1000"
        style={{
          background: phaseColors[phase] + '30',
          border: `2px solid ${phaseColors[phase]}40`,
          transform: `scale(${scaleMap[phase]})`,
          boxShadow: phase !== 'idle' ? `0 0 30px ${phaseColors[phase]}30` : 'none',
        }}
        onClick={phase === 'idle' ? startBreathing : stopBreathing}
      >
        <div className="text-center">
          {phase !== 'idle' && (
            <p className="text-2xl font-light" style={{ color: phaseColors[phase], fontFamily: 'Cormorant Garamond, serif' }}>
              {count}
            </p>
          )}
          <p className="text-[9px] tracking-[0.15em]"
            style={{ color: phaseColors[phase], fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            {phaseLabels[phase]}
          </p>
        </div>
      </div>
      <p className="text-[9px] tracking-[0.15em] text-[#3D4144]/35"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
        4-7-8 呼吸法 · 點擊開始/停止
      </p>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-[#D1BE9B]/25 bg-white/40 hover:border-[#D1BE9B]/50 transition-all duration-300 hover:-translate-y-0.5">
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            {product.tag && (
              <span className="text-[8px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-[#D1BE9B]/20 text-[#A38D6B] mr-1.5"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.tag}
              </span>
            )}
            <p className="text-[11px] tracking-[0.12em] text-[#3D4144]/80 mt-0.5"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              {product.name}
            </p>
            <p className="text-[9px] text-[#3D4144]/35 tracking-wider italic"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {product.subtitle}
            </p>
          </div>
          <p className="text-sm font-light text-[#D1BE9B] flex-shrink-0"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            NT$ {product.price.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {product.properties.slice(0, 3).map(p => (
            <span key={p} className="text-[8px] tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#F0EBE3]/70 text-[#3D4144]/50 border border-[#D1BE9B]/15"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              {p}
            </span>
          ))}
        </div>
        <Link href="/shop">
          <button className="text-[9px] tracking-[0.15em] px-3 py-1.5 border border-[#D1BE9B]/40 rounded-full text-[#A38D6B] hover:bg-[#D1BE9B]/15 transition-colors duration-200"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            查看商品 →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TreeholePage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState('');
  const [llmCrystal, setLlmCrystal] = useState<{ name: string; reason: string; hz: string } | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<typeof PRODUCTS>([]);
  const [loading, setLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();
  const saveSessionMutation = trpc.history.saveTreeholeSession.useMutation();

  const comfortMutation = trpc.treehole.comfort.useMutation({
    onSuccess: (data) => {
      setResponse(data.comfort);
      setLlmCrystal(data.crystal);
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      // 自動儲存心靈樹洞對話紀錄（僅登入後）
      if (!isAuthenticated) return;
      saveSessionMutation.mutate({
        mood: selectedMood || undefined,
        userText: text,
        aiResponse: data.comfort,
        crystalName: data.crystal.name,
      });
    },
    onError: () => {
      // Fallback to local response
      const mood = selectedMood || 'general';
      setResponse(generateResponse(mood, text));
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },
  });

  function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    const mood = selectedMood || 'general';
    const moodInfo = MOODS.find(m => m.id === mood);
    setRecommendedProducts(recommendProducts(mood, text));
    comfortMutation.mutate({
      mood,
      moodLabel: moodInfo?.label || '一般',
      text,
    });
  }

  function handleReset() {
    setSelectedMood(null);
    setText('');
    setSubmitted(false);
    setResponse('');
    setLlmCrystal(null);
    setRecommendedProducts([]);
  }

  const moodData = MOODS.find(m => m.id === selectedMood);

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-[9px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              Soul Comfort
            </span>
            <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#3D4144] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              心靈樹洞
            </h1>
            <p className="text-sm italic text-[#3D4144]/40 tracking-[0.15em] max-w-sm mx-auto leading-[1.9]"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: '#797272' }}>
              "Some feelings only need a gentle place to rest."<br />
              有些話，說出來就輕了，Mochi會回應你的煩惱。
            </p>
          </div>

          {!submitted ? (
            <div className="animate-fade-in-up">
              {/* Mood selection */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-5">
                <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-4"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  你現在的心情是？（選填）
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                        selectedMood === mood.id
                          ? 'border-[#D1BE9B] shadow-[0_2px_12px_rgba(209,190,155,0.2)]'
                          : 'border-[#D1BE9B]/15 hover:border-[#D1BE9B]/30'
                      }`}
                      style={{ background: selectedMood === mood.id ? mood.color + '20' : 'rgba(250,247,244,0.5)' }}>
                      <span className="text-lg">{mood.icon}</span>
                      <span className="text-[9px] tracking-[0.1em] text-[#3D4144]/65"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cat companion — reacts to typing */}
              <div className="flex items-center gap-4 mb-4 px-2">
                {text.length > 0 ? (
                  <CatListening className="w-14 h-16 flex-shrink-0" style={{ opacity: 0.85 }} />
                ) : (
                  <CatListening className="w-20 h-14 flex-shrink-0" style={{ opacity: 0.6 }} />
                )}
                <p className="text-[10px] leading-[1.9] text-[#3D4144]/45 tracking-wider italic"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '14px' }}>
                  {text.length > 0
                    ? 'Mochi 正在認真聽你說… ♡'
                    : '有什麼想說的，都可以跟 Mochi 說。這裡只有你和我。'}
                </p>
              </div>

              {/* Text input */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-5">
                <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  說說你的心事
                </p>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="跟 Mochi 說說吧，不管什麼都可以。可以是最近發生的事、一直壓在心裡的感受，或者只是一句「我好累」… Mochi 都會認真聽。"
                  rows={6}
                  className="w-full bg-white/40 border border-[#D1BE9B]/20 rounded-xl px-4 py-3 text-xs text-[#3D4144]/70 tracking-wider leading-[2] resize-none focus:outline-none focus:border-[#D1BE9B]/40 placeholder:text-[#3D4144]/25"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] text-[#3D4144]/30 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, borderColor: '#5f4949', fontSize: '14px' }}>
                    ✦ 你的心事只有你和這個空間知道
                  </p>
                  <span className="text-[9px] text-[#3D4144]/30"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {text.length} 字
                  </span>
                </div>
              </div>

              {/* Breathing exercise */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 mb-5">
                <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-4 text-center"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  先讓自己靜下來
                </p>
                <BreathingExercise />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                className="w-full py-3.5 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#3D4144] transition-all duration-500 active:scale-95 disabled:opacity-50"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <CatLoading className="w-8 h-8" />
                    正在傾聽你的心聲...
                  </span>
                ) : '送出心事'}
              </button>
            </div>
          ) : (
            /* ── RESPONSE ──────────────────────────────────────────────── */
            <div ref={responseRef} className="animate-fade-in-up">

              {/* User message */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {moodData && <span className="text-base">{moodData.icon}</span>}
                  <p className="text-[9px] tracking-[0.2em] text-[#3D4144]/40"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    你說的話
                  </p>
                </div>
                <p className="text-[11px] leading-[2] text-[#3D4144]/55 tracking-wider italic"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  「{text}」
                </p>
              </div>

              {/* AI response */}
              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/25 mb-5"
                style={{ background: 'linear-gradient(145deg, rgba(250,247,244,0.9), rgba(237,232,226,0.7))' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#D1BE9B]/20 flex items-center justify-center">
                    <span className="text-sm text-[#D1BE9B]">✦</span>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] text-[#3D4144]/70"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      SOUL EASE 回應你
                    </p>
                    <p className="text-[8px] text-[#D1BE9B] tracking-wider"
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                      with love & crystal energy
                    </p>
                  </div>
                </div>
                <div className="text-[12px] leading-[2.1] text-[#3D4144]/65 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  <Streamdown>{response}</Streamdown>
                </div>
              </div>

              {/* ── Product Recommendation ── */}
              {recommendedProducts.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/25 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#D1BE9B] text-sm">◆</span>
                    <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      為你推薦的療癒商品
                    </p>
                    <span className="text-[8px] tracking-[0.1em] text-[#3D4144]/30 ml-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      根據你的心情與心事挑選
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recommendedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/shop">
                      <button className="text-[10px] tracking-[0.2em] text-[#3D4144]/50 hover:text-[#D1BE9B] transition-colors duration-200 underline underline-offset-4"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        查看全部療癒商品
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Crystal recommendation (LLM-based or mood-based fallback) */}
              {(llmCrystal || moodData) && (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: (moodData?.color || '#D1BE9B') + '20' }}>
                      <span className="text-xl opacity-60">◆</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.25em] text-[#D1BE9B] mb-1"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        為你推薦的能量水晶
                      </p>
                      <p className="text-sm tracking-[0.15em] text-[#3D4144]/75 mb-1"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        {llmCrystal?.name || moodData?.crystal}
                      </p>
                      <p className="text-[10px] text-[#D1BE9B]/70 italic"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {llmCrystal?.hz || moodData?.hz} · 對應能量頻率
                      </p>
                      {llmCrystal?.reason && (
                        <p className="text-[10px] leading-[1.8] text-[#3D4144]/55 tracking-wider mt-2"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                          {llmCrystal.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional suggestions */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 mb-6">
                <p className="text-[10px] tracking-[0.25em] text-[#D1BE9B] mb-4"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  也許你也需要
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: '塔羅牌指引', desc: '讓牌陣為你解答困惑', href: '/tarot', icon: '🔮' },
                    { label: '每日運勢', desc: '了解今日的能量走向', href: '/fortune/daily', icon: '☀' },
                    { label: '能量水晶', desc: '找到適合你的療癒石', href: '/shop', icon: '◆' },
                  ].map(item => (
                    <Link key={item.label} href={item.href}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#D1BE9B]/15 hover:border-[#D1BE9B]/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                        <span className="text-base opacity-60">{item.icon}</span>
                        <div>
                          <p className="text-[10px] tracking-[0.1em] text-[#3D4144]/70"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {item.label}
                          </p>
                          <p className="text-[9px] text-[#3D4144]/40 tracking-wider"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 text-xs tracking-[0.25em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  再說一次心事
                </button>
                <Link href="/shop" className="flex-1">
                  <button className="w-full py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#3D4144] transition-all duration-500 active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    前往能量商品
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
