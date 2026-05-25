/**
 * SOUL EASE | Healing Pick — Zi Wei Dou Shu Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - Real iztro-powered astrolabe calculation
 *   - Traditional 12-palace grid chart
 *   - Morandi color-coded palaces
 *   - Real star placement from iztro
 *   - AI interpretation
 */

import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';
import { CatListening, CatPeeking } from '@/components/CatElements';

// ─── Time options ──────────────────────────────────────────────────────────────
const HOURS = [
  { label: '子時 (23:00–01:00)', value: 0 },
  { label: '丑時 (01:00–03:00)', value: 1 },
  { label: '寅時 (03:00–05:00)', value: 2 },
  { label: '卯時 (05:00–07:00)', value: 3 },
  { label: '辰時 (07:00–09:00)', value: 4 },
  { label: '巳時 (09:00–11:00)', value: 5 },
  { label: '午時 (11:00–13:00)', value: 6 },
  { label: '未時 (13:00–15:00)', value: 7 },
  { label: '申時 (15:00–17:00)', value: 8 },
  { label: '酉時 (17:00–19:00)', value: 9 },
  { label: '戌時 (19:00–21:00)', value: 10 },
  { label: '亥時 (21:00–23:00)', value: 11 },
];

// ─── Palace grid layout (traditional 4×4) ─────────────────────────────────────
// Row 0: P3  P4  P5  P6
// Row 1: P2  [center]   P7
// Row 2: P1  [center]   P8
// Row 3: P0  P11 P10 P9
const GRID_POSITIONS: Array<{ palaceIdx: number; row: number; col: number }> = [
  { palaceIdx: 3,  row: 0, col: 0 },
  { palaceIdx: 4,  row: 0, col: 1 },
  { palaceIdx: 5,  row: 0, col: 2 },
  { palaceIdx: 6,  row: 0, col: 3 },
  { palaceIdx: 2,  row: 1, col: 0 },
  { palaceIdx: 7,  row: 1, col: 3 },
  { palaceIdx: 1,  row: 2, col: 0 },
  { palaceIdx: 8,  row: 2, col: 3 },
  { palaceIdx: 0,  row: 3, col: 0 },
  { palaceIdx: 11, row: 3, col: 1 },
  { palaceIdx: 10, row: 3, col: 2 },
  { palaceIdx: 9,  row: 3, col: 3 },
];

// Palace colors (Morandi)
const PALACE_COLORS = [
  '#E5DFEE', // 命宮 - lavender
  '#EDE8E2', // 兄弟 - oat
  '#EDE0D8', // 夫妻 - rose
  '#E8EDE5', // 子女 - sage
  '#F5EDD8', // 財帛 - gold
  '#EDE8E2', // 疾厄
  '#E8EDE5', // 遷移
  '#EDE0D8', // 仆役
  '#E5DFEE', // 官祿
  '#F5EDD8', // 田宅
  '#EDE8E2', // 福德
  '#E8EDE5', // 父母
];

// Star color map (for major stars)
const STAR_COLORS: Record<string, string> = {
  '紫微': '#9B8DC0',
  '天機': '#8BA8C0',
  '太陽': '#DEC180',
  '武曲': '#A0B8A0',
  '天同': '#C0A8B0',
  '廉貞': '#C0988A',
  '天府': '#B8C0A0',
  '太陰': '#C0B8D0',
  '貪狼': '#D0A8A0',
  '巨門': '#A8A8C0',
  '天相': '#A8C0B8',
  '天梁': '#C0C0A0',
  '七殺': '#C09898',
  '破軍': '#A8B8C0',
};

// Brightness display
const BRIGHTNESS_STYLE: Record<string, { color: string; weight: string }> = {
  '廟': { color: '#B8860B', weight: '700' },
  '旺': { color: '#CC6600', weight: '700' },
  '得': { color: '#4A7C59', weight: '400' },
  '利': { color: '#3A6EA5', weight: '400' },
  '平': { color: '#888888', weight: '300' },
  '不': { color: '#AAAAAA', weight: '300' },
  '陷': { color: '#CC4444', weight: '400' },
};

// Palace descriptions
const PALACE_DESCS: Record<string, { en: string; desc: string }> = {
  '命宮': { en: 'Life', desc: '代表個人性格、外貌、人生方向與整體命運格局' },
  '兄弟': { en: 'Siblings', desc: '手足關係、朋友緣分、合夥運勢' },
  '夫妻': { en: 'Marriage', desc: '感情婚姻、伴侶特質、桃花運' },
  '子女': { en: 'Children', desc: '子女緣分、創意能力、部屬關係' },
  '財帛': { en: 'Wealth', desc: '財富格局、理財方式、正財偏財' },
  '疾厄': { en: 'Health', desc: '身體健康、疾病傾向、心理狀態' },
  '遷移': { en: 'Travel', desc: '出行運勢、異鄉發展、貴人緣' },
  '仆役': { en: 'Friends', desc: '人際關係、社交圈、小人防範' },
  '官祿': { en: 'Career', desc: '事業格局、職場運勢、名聲地位' },
  '田宅': { en: 'Property', desc: '不動產、家庭環境、祖業繼承' },
  '福德': { en: 'Fortune', desc: '精神享受、福氣深淺、晚年生活' },
  '父母': { en: 'Parents', desc: '父母緣分、長輩關係、文書運' },
};

type Palace = {
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Array<{ name: string; brightness: string; type: string }>;
  minorStars: Array<{ name: string; brightness: string; type: string }>;
  adjectiveStars: Array<{ name: string; type: string }>;
  changsheng12: string;
  stage: { range: number[]; heavenlyStem: string };
};

type AstrolabeData = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  palaces: Palace[];
};

export default function ZiweiPage() {
  const { isAuthenticated } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [hourValue, setHourValue] = useState('0');
  const [gender, setGender] = useState<'男' | '女'>('女');
  const [focusArea, setFocusArea] = useState('');
  const [astrolabe, setAstrolabe] = useState<AstrolabeData | null>(null);
  const [selectedPalaceName, setSelectedPalaceName] = useState<string | null>(null);
  const [llmInterpretation, setLlmInterpretation] = useState('');

  const saveReadingMutation = trpc.history.saveReading.useMutation();

  const interpretMutation = trpc.ziwei.interpret.useMutation({
    onSuccess: (data) => {
      setAstrolabe(data.astrolabe as AstrolabeData);
      setLlmInterpretation(data.interpretation);
      if (isAuthenticated) {
        saveReadingMutation.mutate({
          type: 'ziwei',
          inputData: JSON.stringify({ solarDate: birthDate, timeIndex: parseInt(hourValue), gender }),
          interpretation: data.interpretation,
        });
      }
    },
    onError: () => {
      toast.error('命盤排列失敗，請稍後再試');
    },
  });

  function handleGenerate() {
    if (!birthDate) {
      toast.error('請輸入出生日期');
      return;
    }
    setAstrolabe(null);
    setLlmInterpretation('');
    setSelectedPalaceName(null);
    interpretMutation.mutate({
      solarDate: birthDate,
      timeIndex: parseInt(hourValue),
      gender,
      focusArea: focusArea || undefined,
    });
  }

  const selectedPalace = astrolabe?.palaces.find((p) => p.name === selectedPalaceName) ?? null;
  const soulPalaceName = astrolabe?.palaces.find((p) => p.name === '命宮')?.name ?? '命宮';

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              中國命理學
            </span>
            <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              紫微斗數命盤
            </h1>
            <p className="text-sm italic text-[#31353A]/54 tracking-[0.15em]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              「星曜落在哪一宮，便訴說人生的故事。」
            </p>
          </div>

          {!astrolabe ? (
            /* ── FORM ──────────────────────────────────────────────────────── */
            <div className="max-w-lg mx-auto animate-fade-in-up">
              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20">
                <h2 className="text-sm tracking-[0.2em] text-[#31353A]/82 mb-6 text-center"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  輸入生辰資料
                </h2>

                {/* Gender */}
                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    性別
                  </label>
                  <div className="flex gap-3">
                    {([{ id: '女' as const, label: '女命', icon: '☽' }, { id: '男' as const, label: '男命', icon: '☀' }]).map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGender(g.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs tracking-[0.15em] transition-all duration-200 ${
                          gender === g.id
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]'
                            : 'border-[#D1BE9B]/20 text-[#31353A]/68 hover:border-[#D1BE9B]/40'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        <span className="opacity-70">{g.icon}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Birth date (solar) */}
                <div className="mb-4">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-2"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    陽曆生日
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <p className="mt-1.5 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    ✦ 請輸入陽曆（國曆）生日，系統會自動換算農曆
                  </p>
                </div>

                {/* Hour */}
                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-2"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    出生時辰
                  </label>
                  <select
                    value={hourValue}
                    onChange={e => setHourValue(e.target.value)}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50 appearance-none"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    {HOURS.map(h => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    ✦ 出生時辰影響命宮位置，請盡量精確填寫
                  </p>
                </div>

                {/* Focus area (optional) */}
                <div className="mb-6">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-2"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    想了解的面向（選填）
                  </label>
                  <textarea
                    value={focusArea}
                    onChange={e => setFocusArea(e.target.value)}
                    placeholder="例如：事業發展、感情婚姻、財富運勢…"
                    rows={2}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-2.5 text-xs text-[#31353A]/80 tracking-wider focus:outline-none focus:border-[#D1BE9B]/50 resize-none placeholder:text-[#31353A]/42"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={interpretMutation.isPending || !birthDate}
                  className="w-full py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95 disabled:opacity-60"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {interpretMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">✦</span>
                      命盤排列中...
                    </span>
                  ) : '排出我的命盤'}
                </button>
              </div>

              {/* Cat peeking at the form */}
              <div className="flex justify-end mt-4 mb-2 pr-2">
                <div className="flex flex-col items-center gap-1">
                  <CatPeeking className="w-14 h-16" side="left" />
                  <span className="text-[10px] tracking-[0.15em] text-[#D1BE9B]/40"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>我也想看你的命盤 ✦</span>
                </div>
              </div>

              {/* How It Works */}
              <div className="mt-4 px-5 py-4 rounded-2xl border border-[#D1BE9B]/15 bg-[#D1BE9B]/5">
                <p className="text-[11px] tracking-[0.3em] text-[#D1BE9B] mb-3 text-center"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  ◎ 命盤如何排列
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-start">
                  {[
                    { icon: '📊', label: '生辰排盤', desc: '以 iztro 紫微斗數演算法，依生年月日時排出十二宮位' },
                    { icon: '✦', label: '星曜落點', desc: '計算主星、輔星在各宮位的座落與亮度' },
                    { icon: '◈', label: 'Mochi解讀', desc: '將命盤資料與你關注的領域交給 Mochi，生成深度命盤解讀' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex sm:flex-col sm:flex-1 items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
                      {i > 0 && (
                        <div className="hidden sm:flex items-center justify-center w-8 mt-4 flex-shrink-0">
                          <div className="h-px w-full bg-[#D1BE9B]/25" />
                        </div>
                      )}
                      <div className="flex sm:flex-col sm:items-center gap-3 sm:gap-2 flex-1">
                        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#D1BE9B]/12 flex items-center justify-center text-base">
                          {s.icon}
                        </div>
                        <div>
                          <p className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {s.label}
                          </p>
                          <p className="text-[12px] leading-[1.7] text-[#31353A]/62 tracking-wide"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── CHART ─────────────────────────────────────────────────────── */
            <div className="animate-fade-in-up">
              {/* Birth info banner */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: '農曆生日', value: astrolabe.lunarDate },
                  { label: '四柱', value: astrolabe.chineseDate },
                  { label: '出生時辰', value: `${astrolabe.time}（${astrolabe.timeRange}）` },
                  { label: '五行局', value: astrolabe.fiveElementsClass },
                  { label: '命主', value: astrolabe.soul },
                  { label: '身主', value: astrolabe.body },
                ].map(item => (
                  <div key={item.label} className="glass-panel rounded-xl px-4 py-2.5 border border-[#D1BE9B]/20 text-center">
                    <p className="text-[10px] tracking-[0.2em] text-[#D1BE9B] mb-0.5"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {item.label}
                    </p>
                    <p className="text-xs tracking-[0.1em] text-[#31353A]/82"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-8">
              {/* Chart + sidebar row */}
              <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* Chart grid */}
                <div className="flex-1">
                  <div
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, auto)' }}
                  >
                    {GRID_POSITIONS.map(({ palaceIdx, row, col }) => {
                      const palace = astrolabe.palaces[palaceIdx];
                      if (!palace) return null;
                      const isLife = palace.name === '命宮';
                      const isSelected = selectedPalaceName === palace.name;

                      return (
                        <div
                          key={palace.name}
                          onClick={() => setSelectedPalaceName(isSelected ? null : palace.name)}
                          className={`relative rounded-xl p-3 cursor-pointer border transition-all duration-300 ${
                            isSelected
                              ? 'border-[#D1BE9B] shadow-[0_4px_20px_rgba(209,190,155,0.3)] scale-[1.02]'
                              : 'border-[#D1BE9B]/20 hover:border-[#D1BE9B]/40 hover:scale-[1.01]'
                          }`}
                          style={{
                            background: PALACE_COLORS[palaceIdx] ?? '#EDE8E2',
                            gridColumn: col + 1,
                            gridRow: row + 1,
                            minHeight: '100px',
                          }}
                        >
                          {/* Life palace indicator */}
                          {isLife && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D1BE9B]/60 flex items-center justify-center">
                              <span className="text-[9px] text-[#31353A]">命</span>
                            </div>
                          )}
                          {/* Body palace indicator */}
                          {palace.isBodyPalace && (
                            <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-rose-300/60 flex items-center justify-center">
                              <span className="text-[9px] text-rose-800">身</span>
                            </div>
                          )}

                          {/* Palace name + stem/branch */}
                          <div className="mb-1.5">
                            <p className="text-[11px] tracking-[0.15em] text-[#31353A]/86"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                              {palace.name}
                            </p>
                            <p className="text-[10px] tracking-wider text-[#31353A]/50"
                              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {palace.heavenlyStem}{palace.earthlyBranch}
                            </p>
                          </div>

                          {/* Major stars */}
                          <div className="flex flex-wrap gap-1">
                            {palace.majorStars.map(star => {
                              const color = STAR_COLORS[star.name] ?? '#D1BE9B';
                              const bs = BRIGHTNESS_STYLE[star.brightness];
                              return (
                                <span
                                  key={star.name}
                                  className="text-[10px] tracking-[0.05em] px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: color + '30',
                                    color: bs ? bs.color : color,
                                    border: `1px solid ${color}50`,
                                    fontFamily: 'Noto Serif TC, serif',
                                    fontWeight: bs ? bs.weight : '300',
                                  }}>
                                  {star.name}{star.brightness ? `·${star.brightness}` : ''}
                                </span>
                              );
                            })}
                            {palace.majorStars.length === 0 && (
                              <span className="text-[10px] text-[#31353A]/42 tracking-wider"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                空宮
                              </span>
                            )}
                          </div>

                          {/* Minor stars (small) */}
                          {palace.minorStars.slice(0, 2).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-0.5">
                              {palace.minorStars.slice(0, 2).map(s => (
                                <span key={s.name} className="text-[9px] text-[#31353A]/50"
                                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Stage */}
                          <div className="absolute bottom-1.5 right-2">
                            <span className="text-[9px] text-[#31353A]/46"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                              {palace.stage?.range?.[0]}–{palace.stage?.range?.[1]}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Center cells */}
                    <div
                      className="rounded-xl border border-[#D1BE9B]/20 flex flex-col items-center justify-center"
                      style={{ gridColumn: '2 / 4', gridRow: '2 / 4', background: 'rgba(250,247,244,0.8)' }}
                    >
                      <div className="text-center p-4">
                        <p className="text-lg text-[#D1BE9B]/50 mb-2">✦</p>
                        <p className="text-[11px] tracking-[0.2em] text-[#31353A]/62"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                          {astrolabe.solarDate}
                        </p>
                        <p className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/70 mt-1"
                          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                          {astrolabe.zodiac} · {astrolabe.sign}
                        </p>
                        <p className="text-[10px] tracking-[0.1em] text-[#31353A]/50 mt-2"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                          {gender}命
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center mt-3 text-[11px] tracking-[0.15em] text-[#31353A]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    點擊宮位查看詳細解讀
                  </p>
                </div>

                {/* Palace detail */}
                <div className="xl:w-72">
                  {selectedPalace ? (
                    <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: PALACE_COLORS[astrolabe.palaces.findIndex(p => p.name === selectedPalace.name)] ?? '#EDE8E2' }}>
                          <span className="text-[11px] text-[#31353A]/80"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {selectedPalace.name.slice(0, 1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm tracking-[0.15em] text-[#31353A]/86"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {selectedPalace.name}
                          </p>

                        </div>
                      </div>

                      <p className="text-[12px] leading-[1.9] text-[#31353A]/68 tracking-wider mb-4"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        {PALACE_DESCS[selectedPalace.name]?.desc ?? ''}
                      </p>

                      {/* Stem/Branch + Stage */}
                      <div className="flex gap-2 mb-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          {selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          大限 {selectedPalace.stage?.range?.[0]}–{selectedPalace.stage?.range?.[1]}
                        </span>
                        {selectedPalace.changsheng12 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D1BE9B]/15 text-[#A38D6B]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {selectedPalace.changsheng12}
                          </span>
                        )}
                      </div>

                      {selectedPalace.majorStars.length > 0 && (
                        <div className="border-t border-[#D1BE9B]/15 pt-4">
                          <p className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-3"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            本宮主星
                          </p>
                          <div className="space-y-2">
                            {selectedPalace.majorStars.map(star => {
                              const color = STAR_COLORS[star.name] ?? '#D1BE9B';
                              return (
                                <div key={star.name} className="flex items-center gap-2">
                                  <span
                                    className="text-[11px] px-2 py-0.5 rounded-full"
                                    style={{
                                      background: color + '25',
                                      color,
                                      border: `1px solid ${color}50`,
                                      fontFamily: 'Noto Serif TC, serif',
                                      fontWeight: 300,
                                    }}>
                                    {star.name}
                                  </span>
                                  {star.brightness && (
                                    <span className="text-[11px]"
                                      style={{ color: BRIGHTNESS_STYLE[star.brightness]?.color ?? '#888', fontWeight: BRIGHTNESS_STYLE[star.brightness]?.weight ?? '300' }}>
                                      {star.brightness}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedPalace.minorStars.length > 0 && (
                        <div className="border-t border-[#D1BE9B]/15 pt-3 mt-3">
                          <p className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-2"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            輔星
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPalace.minorStars.map(s => (
                              <span key={s.name} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D1BE9B]/10 text-[#31353A]/62 border border-[#D1BE9B]/20"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPalace.majorStars.length === 0 && (
                        <div className="border-t border-[#D1BE9B]/15 pt-4">
                          <p className="text-[12px] leading-[1.9] text-[#31353A]/58 tracking-wider italic"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                            此宮為空宮，代表此方面的事務較為自由，
                            不受特定星曜的強烈影響，走向較為中性平和。
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 text-center">
                      <div className="text-2xl mb-3 opacity-30">☯</div>
                      <p className="text-xs tracking-[0.15em] text-[#31353A]/50"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        點擊宮位<br />查看詳細解讀
                      </p>
                    </div>
                  )}

                  {/* Crystal recommendation */}
                  <div className="mt-4 glass-panel rounded-xl p-4 border border-[#D1BE9B]/15">
                    <p className="text-[11px] tracking-[0.2em] text-[#D1BE9B] mb-2"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      命盤推薦水晶
                    </p>
                    <p className="text-xs tracking-[0.1em] text-[#31353A]/80 mb-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {gender === '女' ? '紫水晶 × 月光石' : '黃水晶 × 黑碧璽'}
                    </p>
                    <p className="text-[11px] leading-[1.8] text-[#31353A]/62 tracking-wider mb-3"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {gender === '女'
                        ? '增強直覺力，平衡陰性能量，提升靈性感知'
                        : '強化行動力，穩定根輪能量，防護負面磁場'}
                    </p>
                    <Link href="/shop">
                      <button className="text-[11px] tracking-[0.15em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors border-b border-[#D1BE9B]/40 pb-0.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        查看推薦商品 →
                      </button>
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => { setAstrolabe(null); setSelectedPalaceName(null); setLlmInterpretation(''); }}
                      className="w-full py-2.5 text-xs tracking-[0.2em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      重新排盤
                    </button>
                    <Link href="/treehole">
                      <button className="w-full py-2.5 text-xs tracking-[0.2em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                        與 AI 深入探討命盤
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Cat staring at the chart */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <CatListening className="w-12 h-14 flex-shrink-0" />
                <p className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50 italic"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, color: '#766060', fontSize: '12px' }}>
                  Mochi 認真地看著你的命盤… ✦
                </p>
              </div>

              {/* LLM interpretation — full width below chart */}
              <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#D1BE9B]" style={{ fontSize: '18px' }}>☯</span>
                  <h4 className="text-[13px] tracking-[0.2em] text-[#31353A]/86"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    命盤整體解讀
                  </h4>
                </div>
                {interpretMutation.isPending && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="text-[#D1BE9B] text-2xl animate-spin">☯</div>
                    <p className="text-[11px] tracking-[0.15em] text-[#31353A]/54"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      正在解讀你的命盤...
                    </p>
                  </div>
                )}
                {interpretMutation.isError && (
                  <p className="text-[11px] text-[#EAA8AC] tracking-wider">解讀暫時無法取得，請稍後再試。</p>
                )}
                {!interpretMutation.isPending && !interpretMutation.isError && !llmInterpretation && (
                  <p className="text-[12px] text-[#31353A]/50 tracking-wider text-center py-4"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    排盤完成後將自動生成 AI 命盤解讀
                  </p>
                )}
                {llmInterpretation && (
                  <div className="text-[13px] leading-[2.2] text-[#31353A]/75 tracking-wider"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    <Streamdown>{llmInterpretation}</Streamdown>
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
