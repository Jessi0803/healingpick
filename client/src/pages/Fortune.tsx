/**
 * SOUL EASE | Mochi．crystal — Fortune Page (Daily)
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - 12 zodiac signs + AI fortune with moon phase
 *   - Crystal of the day recommendation
 *   - Lucky colors, numbers, directions
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

// ─── Zodiac Signs ─────────────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
  { id: 'aries',       name: '牡羊座', en: 'Aries',       symbol: '♈', dates: '3/21–4/19',  element: '火', color: '#C09898' },
  { id: 'taurus',      name: '金牛座', en: 'Taurus',      symbol: '♉', dates: '4/20–5/20',  element: '土', color: '#A0B898' },
  { id: 'gemini',      name: '雙子座', en: 'Gemini',      symbol: '♊', dates: '5/21–6/20',  element: '風', color: '#A8C0C8' },
  { id: 'cancer',      name: '巨蟹座', en: 'Cancer',      symbol: '♋', dates: '6/21–7/22',  element: '水', color: '#B8B0C8' },
  { id: 'leo',         name: '獅子座', en: 'Leo',         symbol: '♌', dates: '7/23–8/22',  element: '火', color: '#DEC180' },
  { id: 'virgo',       name: '處女座', en: 'Virgo',       symbol: '♍', dates: '8/23–9/22',  element: '土', color: '#A8C0A8' },
  { id: 'libra',       name: '天秤座', en: 'Libra',       symbol: '♎', dates: '9/23–10/22', element: '風', color: '#D0A8B8' },
  { id: 'scorpio',     name: '天蠍座', en: 'Scorpio',     symbol: '♏', dates: '10/23–11/21',element: '水', color: '#9898C0' },
  { id: 'sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐', dates: '11/22–12/21',element: '火', color: '#C0A880' },
  { id: 'capricorn',   name: '摩羯座', en: 'Capricorn',   symbol: '♑', dates: '12/22–1/19', element: '土', color: '#A0A8A0' },
  { id: 'aquarius',    name: '水瓶座', en: 'Aquarius',    symbol: '♒', dates: '1/20–2/18',  element: '風', color: '#98B8C8' },
  { id: 'pisces',      name: '雙魚座', en: 'Pisces',      symbol: '♓', dates: '2/19–3/20',  element: '水', color: '#B8A8C8' },
];

// ─── How It Works Panel ─────────────────────────────────────────────────────
function HowItWorksPanel() {
  const steps = [
    { icon: '🌙', label: '月相計算', desc: '以天文公式精確計算今日月相，共分 8 個階段' },
    { icon: '✦', label: '星座特性', desc: '讀取你星座的元素、守護星、優勢與課題' },
    { icon: '◈', label: 'Mochi 生成', desc: '將月相與星座特性交給 Mochi，生成個性化運勢' },
  ];

  return (
    <div className="mb-8 px-5 py-4 rounded-2xl border border-[#D1BE9B]/15 bg-[#D1BE9B]/5">
      <p className="text-[9px] tracking-[0.3em] text-[#D1BE9B] mb-3 text-center"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
        ◎ 運勢如何計算
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-start">
        {steps.map((step, i) => (
          <div key={step.label} className="flex sm:flex-col sm:flex-1 items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
            {i > 0 && (
              <div className="hidden sm:flex items-center justify-center w-8 mt-4 flex-shrink-0">
                <div className="h-px w-full bg-[#D1BE9B]/25" />
              </div>
            )}
            <div className="flex sm:flex-col sm:items-center gap-3 sm:gap-2 flex-1">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#D1BE9B]/12 flex items-center justify-center text-base">
                {step.icon}
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {step.label}
                </p>
                <p className="text-[11px] leading-[1.7] text-[#31353A]/50 tracking-wide"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Score Bar Component ──────────────────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.min(100, Math.max(0, score * 10)); // score 1-10 → 10-100%
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] tracking-[0.15em] text-[#31353A]/60 w-12 flex-shrink-0"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-[#D1BE9B]/15 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] tracking-wider text-[#31353A]/50 w-6 text-right"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {score}
      </span>
    </div>
  );
}

// ─── Moon Phase Badge ─────────────────────────────────────────────────────────
function MoonPhaseBadge({ symbol, name }: { symbol: string; name: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1BE9B]/10 border border-[#D1BE9B]/20">
      <span className="text-base leading-none">{symbol}</span>
      <span className="text-[9px] tracking-[0.2em] text-[#D1BE9B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
        {name}
      </span>
    </div>
  );
}

export default function FortunePage() {
  const { isAuthenticated } = useAuth();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [today] = useState(new Date());
  const savedFortuneRef = useRef<string>('');

  function handleSignSelect(signId: string) {
    if (selectedSign === signId) {
      setSelectedSign(null);
      return;
    }
    setSelectedSign(signId);
  }

  const selectedSignData = ZODIAC_SIGNS.find(s => s.id === selectedSign);

  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const apiDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const saveReadingMutation = trpc.history.saveReading.useMutation();

  // ── AI 每日運勢查詢（含月相 + 星座特性）──────────────────────────────
  const dailyFortuneQuery = trpc.fortune.daily.useQuery(
    {
      sign: selectedSign || '',
      signName: selectedSignData?.name || '',
      date: apiDateStr,
    },
    {
      enabled: !!selectedSign,
      staleTime: 1000 * 60 * 60 * 6, // 6 小時快取，同一天同一星座只呼叫一次
      retry: 1,
    }
  );

  // 儲存每日運勢紀錄（僅登入後，且同一星座同一天只儲一次）
  useEffect(() => {
    if (!dailyFortuneQuery.data || !isAuthenticated) return;
    const key = `${selectedSign}-${apiDateStr}`;
    if (savedFortuneRef.current === key) return;
    savedFortuneRef.current = key;
    const d = dailyFortuneQuery.data;
    saveReadingMutation.mutate({
      type: 'fortune',
      inputData: JSON.stringify({ sign: selectedSign, signName: selectedSignData?.name, date: apiDateStr }),
      interpretation: `整體運勢：${d.overall}\n\n感情愛情：${d.love}\n\n事業財運：${d.career}\n\n行動建議：${d.advice}`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyFortuneQuery.data, isAuthenticated]);

  const aiData = dailyFortuneQuery.data;

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="text-[9px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              Celestial Guidance
            </span>
            <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              每日運勢
            </h1>
            <p className="text-xs text-[#31353A]/40 tracking-[0.2em]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              {dateStr}
            </p>
          </div>

          {/* How It Works */}
          <HowItWorksPanel />

          {/* ── DAILY ──────────────────────────────────────────────────────── */}
          <div>
              {/* AI 今日水晶推薦（有 AI 資料時顯示 AI 推薦，否則顯示預設） */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 mb-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#D1BE9B]/15 flex items-center justify-center">
                  <span className="text-2xl opacity-60">◆</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] tracking-[0.3em] text-[#D1BE9B] mb-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    今日能量水晶
                  </p>
                  <p className="text-lg tracking-[0.15em] text-[#31353A]/80 mb-1"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {aiData?.crystal || '選擇星座以獲取推薦'}
                  </p>
                  <p className="text-[11px] leading-[1.9] text-[#31353A]/50 tracking-wider"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {aiData?.crystalReason || '選擇你的星座，Mochi 將根據今日月相為你推薦最適合的能量水晶。'}
                  </p>
                </div>
                {aiData && (
                  <Link href="/shop" className="flex-shrink-0">
                    <button className="text-xs tracking-[0.15em] px-4 py-2 border border-[#D1BE9B]/30 rounded-full text-[#D1BE9B] hover:bg-[#D1BE9B]/10 transition-colors"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      選購
                    </button>
                  </Link>
                )}
              </div>

              {/* Zodiac grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
                {ZODIAC_SIGNS.map(sign => (
                  <button
                    key={sign.id}
                    onClick={() => handleSignSelect(sign.id)}
                    className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                      selectedSign === sign.id
                        ? 'border-[#D1BE9B] shadow-[0_4px_16px_rgba(209,190,155,0.25)] scale-105'
                        : 'border-[#D1BE9B]/15 hover:border-[#D1BE9B]/35 hover:scale-[1.02]'
                    }`}
                    style={{
                      background: selectedSign === sign.id ? sign.color + '25' : 'rgba(250,247,244,0.6)',
                    }}>
                    <span className="text-xl" style={{ color: sign.color }}>{sign.symbol}</span>
                    <span className="text-[9px] tracking-[0.1em] text-[#31353A]/70"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {sign.name}
                    </span>
                    <span className="text-[7px] text-[#31353A]/35 tracking-wider"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {sign.dates}
                    </span>
                  </button>
                ))}
              </div>

              {/* Fortune detail */}
              {selectedSign && selectedSignData && (
                <div className="animate-fade-in-up">
                  <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20">

                    {/* Sign header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#D1BE9B]/15">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: selectedSignData.color + '20' }}>
                        <span className="text-2xl" style={{ color: selectedSignData.color }}>
                          {selectedSignData.symbol}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg tracking-[0.15em] text-[#31353A]/80"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {selectedSignData.name}
                        </h3>
                        <p className="text-[10px] italic text-[#D1BE9B]"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {selectedSignData.en} · {selectedSignData.element}象星座
                        </p>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-2">
                        {/* 月相徽章 */}
                        {aiData?.moonPhase && aiData?.moonSymbol && (
                          <MoonPhaseBadge symbol={aiData.moonSymbol} name={aiData.moonPhase} />
                        )}
                        {dailyFortuneQuery.isLoading && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1BE9B]/10 border border-[#D1BE9B]/20">
                            <span className="text-[#D1BE9B] animate-spin text-xs">✦</span>
                            <span className="text-[9px] tracking-[0.15em] text-[#31353A]/40"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              計算月相中...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loading state */}
                    {dailyFortuneQuery.isLoading && (
                      <div className="flex flex-col items-center gap-4 py-12">
                        <div className="text-3xl animate-pulse">🌙</div>
                        <p className="text-[11px] tracking-[0.2em] text-[#31353A]/40"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          Mochi 正在觀察今日月相與星象能量...
                        </p>
                      </div>
                    )}

                    {/* Error state */}
                    {dailyFortuneQuery.isError && (
                      <div className="text-center py-8">
                        <p className="text-[11px] text-[#31353A]/40 tracking-wider mb-3"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          運勢解讀暫時無法取得，請稍後再試
                        </p>
                        <button
                          onClick={() => dailyFortuneQuery.refetch()}
                          className="text-[10px] tracking-[0.15em] text-[#D1BE9B] border-b border-[#D1BE9B]/40 pb-0.5"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          重新嘗試
                        </button>
                      </div>
                    )}

                    {/* AI Fortune content */}
                    {aiData && (
                      <>
                        {/* Scores */}
                        <div className="space-y-3 mb-6">
                          <ScoreBar label="整體" score={aiData.overallScore}  color={selectedSignData.color} />
                          <ScoreBar label="感情" score={aiData.loveScore}     color="#EAA8AC" />
                          <ScoreBar label="事業" score={aiData.careerScore}   color="#A0B898" />
                          <ScoreBar label="健康" score={aiData.healthScore}   color="#A8C0A8" />
                        </div>

                        {/* Lucky info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                          {[
                            { label: '幸運顏色', value: aiData.luckyColor },
                            { label: '幸運數字', value: aiData.luckyNumber.toString() },
                            { label: '能量水晶', value: aiData.crystal },
                          ].map(item => (
                            <div key={item.label} className="text-center p-3 rounded-xl bg-[#D1BE9B]/8">
                              <p className="text-[8px] tracking-[0.2em] text-[#D1BE9B] mb-1"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                {item.label}
                              </p>
                              <p className="text-xs tracking-[0.1em] text-[#31353A]/70"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Fortune messages */}
                        <div className="space-y-4 mb-6">
                          {[
                            { icon: '✦', label: '整體運勢', text: aiData.overall },
                            { icon: '♥', label: '感情運勢', text: aiData.love },
                            { icon: '◈', label: '事業財運', text: aiData.career },
                            { icon: '◉', label: '健康提醒', text: aiData.health },
                          ].map(item => (
                            <div key={item.label} className="flex gap-3">
                              <span className="text-[#D1BE9B] flex-shrink-0 mt-0.5 text-sm">{item.icon}</span>
                              <div>
                                <p className="text-[9px] tracking-[0.2em] text-[#D1BE9B] mb-1"
                                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                  {item.label}
                                </p>
                                <p className="text-[11px] leading-[2] text-[#31353A]/60 tracking-wider"
                                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                  {item.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Today's advice */}
                        <div className="pt-4 border-t border-[#D1BE9B]/15">
                          <div className="flex gap-3">
                            <span className="text-[#D1BE9B] flex-shrink-0 mt-0.5 text-sm">☽</span>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] text-[#D1BE9B] mb-1"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                今日月相指引
                              </p>
                              <p className="text-[11px] leading-[2] text-[#31353A]/60 tracking-wider italic"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                {aiData.advice}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Crystal CTA */}
                        <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15 flex items-center justify-between">
                          <p className="text-[11px] text-[#31353A]/50 tracking-wider"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                            今日推薦攜帶：<span className="text-[#D1BE9B]">{aiData.crystal}</span>
                          </p>
                          <Link href="/shop">
                            <button className="text-[10px] tracking-[0.15em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              選購水晶 →
                            </button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!selectedSign && (
                <div className="text-center py-8">
                  <p className="text-xs tracking-[0.2em] text-[#31353A]/35"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    選擇你的星座，Mochi 將結合今日月相為你解讀運勢
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </PageLayout>
  );
}
