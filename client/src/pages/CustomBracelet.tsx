import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ClipboardList,
  Copy,
  Gem,
  MessageCircle,
  Package,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import ContactDialog from '@/components/ContactDialog';

const GALLERY_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/custom-bracelet/general/IMG_${4826 + i}.PNG`,
);

// 主視覺與精選好評使用不同批圖，避免同一張在同一頁重複出現。
const HERO_IMAGES = GALLERY_IMAGES.slice(0, 3);
const FEATURED_IMAGES = GALLERY_IMAGES.slice(3, 11);

const STEP_ITEMS = [
  {
    icon: ClipboardList,
    step: 'Step 1',
    title: '填寫需求表單',
    desc: '告訴我們你的近期狀態、想加強的能量，以及色系與配戴偏好。',
  },
  {
    icon: Gem,
    step: 'Step 2',
    title: '討論專屬設計圖',
    desc: '依你的方向挑選專屬水晶並繪製設計圖，提供 3 次免費修改。',
  },
  {
    icon: Package,
    step: 'Step 3',
    title: '手工串製與出貨',
    desc: '確認後細心手工串製，單條即享免運，把專屬能量送到你身邊。',
  },
];

const FEATURE_ITEMS = [
  {
    title: '依照需求搭配專屬水晶',
    desc: '依照想加強的能量、喜歡的色系、配戴習慣與預算，討論出更貼近你的水晶組合。',
  },
  {
    title: '高品質天然水晶挑選',
    desc: '水晶仔細挑選，優先使用品質穩定、少雜質、光澤乾淨的珠材與配件。',
  },
  {
    title: '購買一條即享免運',
    desc: '客製化手鍊單條即免運，讓專屬能量可以更輕鬆地到你身邊。',
  },
  {
    title: '終生免費換線',
    desc: '手鍊後續配戴需要換線時，可享終生免費換線服務。',
  },
  {
    title: '設計圖 3 次免費修改',
    desc: '設計圖提供 3 次免費修改，讓成品更接近你心裡想要的樣子。',
  },
];

const ENERGY_OPTIONS = ['招財事業', '桃花感情', '人緣貴人', '守護避邪', '穩定情緒', '自信行動'];
const FORM_INITIAL = {
  name: '',
  birthday: '',
  wristSize: '',
  fitPreference: '',
  budget: '',
  energyNeeds: '',
  colorPreference: '',
  favoriteCrystals: '',
  avoidCrystals: '',
  metalPreference: '',
  contact: '',
  notes: '',
};

type CustomForm = typeof FORM_INITIAL;

export default function CustomBraceletPage() {
  const [form, setForm] = useState<CustomForm>(FORM_INITIAL);
  const [copied, setCopied] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const formSummary = useMemo(
    () =>
      [
        '【一般客製化手鍊諮詢表單】',
        `姓名：${form.name || '未填'}`,
        `生日：${form.birthday || '未填'}`,
        `手圍尺寸：${form.wristSize || '未填'}`,
        `配戴鬆緊：${form.fitPreference || '未填'}`,
        `預算：${form.budget || '未填'}`,
        `想加強的功效/需求：${form.energyNeeds || '未填'}`,
        `喜歡的色系：${form.colorPreference || '未填'}`,
        `喜歡或指定的水晶：${form.favoriteCrystals || '無特別指定'}`,
        `不喜歡或想避開的水晶：${form.avoidCrystals || '無'}`,
        `金屬/扣具偏好：${form.metalPreference || '未填'}`,
        `Instagram / LINE：${form.contact || '未填'}`,
        `其他備註：${form.notes || '無'}`,
      ].join('\n'),
    [form],
  );

  const update = (key: keyof CustomForm, value: string) => {
    setCopied(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  // 能量快選：以 energyNeeds 文字為單一資料來源，點選即切換加入/移除。
  const energyTokens = useMemo(
    () => form.energyNeeds.split('、').map((s) => s.trim()).filter(Boolean),
    [form.energyNeeds],
  );
  const toggleEnergy = (item: string) => {
    const next = energyTokens.includes(item)
      ? energyTokens.filter((token) => token !== item)
      : [...energyTokens, item];
    update('energyNeeds', next.join('、'));
  };

  const galleryCount = showAllPhotos ? GALLERY_IMAGES.length : FEATURED_IMAGES.length;
  const shownGallery = showAllPhotos ? GALLERY_IMAGES : FEATURED_IMAGES;

  const closeLightbox = () => setLightboxIndex(null);
  const stepLightbox = (dir: number) =>
    setLightboxIndex((current) => {
      if (current === null) return current;
      const total = GALLERY_IMAGES.length;
      return (current + dir + total) % total;
    });

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.wristSize.trim() || !form.energyNeeds.trim()) {
      toast.error('請先填寫姓名、聯絡方式、手圍與主要需求');
      return;
    }

    try {
      await navigator.clipboard.writeText(formSummary);
      setCopied(true);
      toast.success('表單內容已複製');
      setShowContactModal(true);
    } catch {
      setCopied(false);
      toast.error('複製失敗，請手動確認表單內容');
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#FAF7F4] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 animate-fade-in-up">
            <Link href="/shop">
              <button
                className="inline-flex items-center gap-2 border-none bg-transparent text-xs tracking-[0.2em] text-[#31353A]/62 transition-colors duration-300 hover:text-[#31353A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                <span>←</span>
                返回能量商品
              </button>
            </Link>
          </div>

          {/* Hero：介紹＋主 CTA 在左，主視覺大圖在右 */}
          <section className="mb-16 grid items-center gap-8 md:mb-20 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
            <div className="animate-fade-in-up">
              <p
                className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#A38D6B]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                Custom Crystal Bracelet
              </p>
              <h1
                className="mb-5 text-3xl leading-[1.35] tracking-[0.12em] text-[#31353A] md:text-[2.6rem]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                一般客製化手鍊
              </h1>
              <p
                className="mb-7 max-w-xl whitespace-pre-line text-[14.5px] leading-[2] tracking-[0.04em] text-[#31353A]/78"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
老闆只嚴選高品質、雜質少的天然水晶，所以每一顆看起來都特別透亮，也蘊藏著更飽滿的能量。
                {'\n'}我們會依照你的需求與偏好，為你搭配專屬水晶，讓它不只是飾品，更是一份陪你日常前進的能量提醒。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#custom-form"
                  className="inline-flex items-center gap-2 rounded-full bg-[#3D4144] px-6 py-3 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-md shadow-[#3D4144]/10 transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <Sparkles className="h-4 w-4" />
                  開始客製我的手鍊
                </a>
                <span
                  className="text-[11px] tracking-[0.14em] text-[#31353A]/50"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  單條免運 · 設計圖 3 次免修 · 終生免費換線
                </span>
              </div>
            </div>

            <div className="animate-fade-in-up">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="group col-span-3 aspect-[16/11] overflow-hidden rounded-3xl border border-[#D1BE9B]/25 bg-white/40 shadow-[0_16px_40px_rgba(209,190,155,0.18)]"
                >
                  <img
                    src={HERO_IMAGES[0]}
                    alt="客製化手鍊實拍主視覺"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </button>
                {HERO_IMAGES.slice(1).map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLightboxIndex(idx + 1)}
                    className="group col-span-1 aspect-square overflow-hidden rounded-2xl border border-[#D1BE9B]/25 bg-white/40 shadow-sm"
                  >
                    <img
                      src={src}
                      alt="客製化手鍊實拍"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setShowAllPhotos(true);
                    setLightboxIndex(3);
                  }}
                  className="col-span-1 flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-[#D1BE9B]/30 bg-[#D1BE9B]/10 text-center transition-colors hover:bg-[#D1BE9B]/18"
                >
                  <span className="text-lg text-[#A38D6B]">＋</span>
                  <span
                    className="text-[11px] tracking-[0.1em] text-[#A38D6B]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    看更多實拍
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* 客製 3 步驟 */}
          <section className="mb-16 animate-fade-in-up md:mb-20">
            <SectionHeading eyebrow="How It Works" title="客製流程只要三步" />
            <div className="grid gap-4 md:grid-cols-3">
              {STEP_ITEMS.map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={title}
                  className="relative rounded-3xl border border-[#D1BE9B]/22 bg-white/55 px-6 py-7 shadow-[0_10px_30px_rgba(209,190,155,0.08)]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3D4144] text-[#FAF7F4]">
                      <Icon className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span
                      className="text-[11px] uppercase tracking-[0.28em] text-[#A38D6B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {step}
                    </span>
                  </div>
                  <h3
                    className="mb-2 text-[15px] tracking-[0.1em] text-[#31353A]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[12.5px] leading-[1.9] tracking-[0.04em] text-[#31353A]/70"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 服務保障：改為不落單的清單 */}
          <section className="mb-16 animate-fade-in-up md:mb-20">
            <SectionHeading eyebrow="What You Get" title="每一條客製手鍊都包含" />
            <div className="grid gap-x-8 gap-y-4 rounded-3xl border border-[#D1BE9B]/22 bg-white/45 px-6 py-7 md:grid-cols-2 md:px-9 md:py-9">
              {FEATURE_ITEMS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D1BE9B]/25 text-[10px] text-[#A38D6B]">
                    ✓
                  </span>
                  <div>
                    <p
                      className="mb-0.5 text-[13px] tracking-[0.08em] text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-[12px] leading-[1.8] tracking-[0.03em] text-[#31353A]/62"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 顧客回饋＆實拍：精選 + 燈箱 */}
          <section className="mb-16 animate-fade-in-up md:mb-20">
            <SectionHeading
              eyebrow="Real Feedback"
              title="顧客回饋＆客製化實拍"
              note="以下照片皆為顧客回饋與客製化商品實拍，點擊可放大瀏覽。"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {shownGallery.map((src) => {
                const realIndex = GALLERY_IMAGES.indexOf(src);
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLightboxIndex(realIndex)}
                    className="group aspect-[3/4] overflow-hidden rounded-2xl border border-[#D1BE9B]/20 bg-white/40"
                  >
                    <img
                      src={src}
                      alt="顧客回饋與客製化商品實拍圖"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </button>
                );
              })}
            </div>
            {!showAllPhotos && GALLERY_IMAGES.length > FEATURED_IMAGES.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllPhotos(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D1BE9B]/30 bg-white/60 px-6 py-2.5 text-[11px] tracking-[0.18em] text-[#A38D6B] transition-colors hover:bg-[#D1BE9B]/12"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  查看全部 {GALLERY_IMAGES.length} 張實拍
                </button>
              </div>
            )}
            {showAllPhotos && (
              <p className="mt-4 text-center text-[10px] tracking-[0.14em] text-[#31353A]/40">
                已顯示全部 {galleryCount} 張
              </p>
            )}
          </section>

          {/* 客製需求表單 */}
          <section id="custom-form" className="mb-16 grid scroll-mt-24 gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="animate-fade-in-up">
              <SectionHeading eyebrow="Custom Form" title="客製化需求表單" compact />
              <div className="rounded-3xl border border-[#D1BE9B]/22 bg-white/50 px-6 py-6">
                <p
                  className="mb-4 text-[12.5px] leading-[2] tracking-[0.04em] text-[#31353A]/70"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  填寫後會整理成諮詢文字，方便直接傳到 LINE 或 IG。可先點選想加強的能量，再補充細節。
                </p>
                <p
                  className="mb-2.5 text-[11px] tracking-[0.14em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  想加強的能量（可複選）
                </p>
                <div className="flex flex-wrap gap-2">
                  {ENERGY_OPTIONS.map((item) => {
                    const active = energyTokens.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEnergy(item)}
                        className={`rounded-full border px-3.5 py-1.5 text-[11.5px] tracking-[0.06em] transition-all duration-200 ${
                          active
                            ? 'border-[#A38D6B] bg-[#A38D6B] text-[#FAF7F4] shadow-sm'
                            : 'border-[#D1BE9B]/30 bg-[#FAF7F4]/70 text-[#A38D6B] hover:bg-[#D1BE9B]/12'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="animate-fade-in-up rounded-3xl border border-[#D1BE9B]/22 bg-white/55 p-5 shadow-[0_12px_36px_rgba(209,190,155,0.10)] md:p-8"
            >
              <FieldGroup label="基本資料">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="姓名" required>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="請填寫姓名" />
                  </Field>
                  <Field label="生日">
                    <input value={form.birthday} onChange={(e) => update('birthday', e.target.value)} className={inputClass} placeholder="例如 1995/08/22" />
                  </Field>
                  <Field label="手圍尺寸" required>
                    <input value={form.wristSize} onChange={(e) => update('wristSize', e.target.value)} className={inputClass} placeholder="例如 15 cm" />
                  </Field>
                  <Field label="配戴鬆緊">
                    <select value={form.fitPreference} onChange={(e) => update('fitPreference', e.target.value)} className={inputClass}>
                      <option value="">請選擇</option>
                      <option value="貼手">貼手</option>
                      <option value="剛好">剛好</option>
                      <option value="微鬆">微鬆</option>
                    </select>
                  </Field>
                  <Field label="預算">
                    <input value={form.budget} onChange={(e) => update('budget', e.target.value)} className={inputClass} placeholder="例如 1500-2500" />
                  </Field>
                  <Field label="Instagram / LINE" required>
                    <input value={form.contact} onChange={(e) => update('contact', e.target.value)} className={inputClass} placeholder="@account 或 LINE ID" />
                  </Field>
                </div>
              </FieldGroup>

              <FieldGroup label="能量需求">
                <div className="grid gap-4">
                  <Field label="想加強的功效或需求" required wide>
                    <textarea value={form.energyNeeds} onChange={(e) => update('energyNeeds', e.target.value)} className={textareaClass} placeholder="例如招財、桃花、人緣、穩定情緒，或最近遇到的狀態" />
                  </Field>
                </div>
              </FieldGroup>

              <FieldGroup label="外觀偏好" last>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="喜歡的色系" wide>
                    <input value={form.colorPreference} onChange={(e) => update('colorPreference', e.target.value)} className={inputClass} placeholder="例如粉色、綠色、清透、低調金色" />
                  </Field>
                  <Field label="喜歡或指定的水晶">
                    <textarea value={form.favoriteCrystals} onChange={(e) => update('favoriteCrystals', e.target.value)} className={textareaClass} placeholder="沒有也可以留空" />
                  </Field>
                  <Field label="不喜歡或想避開的水晶">
                    <textarea value={form.avoidCrystals} onChange={(e) => update('avoidCrystals', e.target.value)} className={textareaClass} placeholder="例如不要黑色、不要太大顆" />
                  </Field>
                  <Field label="金屬或扣具偏好">
                    <input value={form.metalPreference} onChange={(e) => update('metalPreference', e.target.value)} className={inputClass} placeholder="例如金色、銀色、彈力繩、扣頭" />
                  </Field>
                  <Field label="其他備註" wide>
                    <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className={textareaClass} placeholder="其他想補充的需求" />
                  </Field>
                </div>
              </FieldGroup>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3D4144] px-5 py-3.5 text-xs tracking-[0.2em] text-[#FAF7F4] shadow-sm transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已複製表單' : '複製表單並聯繫'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/30 bg-[#FAF7F4]/70 px-5 py-3.5 text-xs tracking-[0.2em] text-[#A38D6B] transition-all duration-300 hover:bg-[#D1BE9B]/15 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <MessageCircle className="h-4 w-4" />
                  直接聯繫
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* 燈箱 */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c1a18]/80 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white/90 transition-colors hover:bg-white/25"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(-1);
            }}
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:left-8"
            aria-label="上一張"
          >
            ‹
          </button>
          <img
            src={GALLERY_IMAGES[lightboxIndex]}
            alt="客製化手鍊實拍放大"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(1);
            }}
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl text-white/90 transition-colors hover:bg-white/25 md:right-8"
            aria-label="下一張"
          >
            ›
          </button>
          <span className="absolute bottom-6 text-[11px] tracking-[0.2em] text-white/60">
            {lightboxIndex + 1} / {GALLERY_IMAGES.length}
          </span>
        </div>
      )}

      <ContactDialog
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        productName="一般客製化手鍊"
      />
    </PageLayout>
  );
}

const inputClass =
  'w-full rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/75 px-4 py-3 text-[12.5px] tracking-[0.04em] text-[#31353A]/80 outline-none transition-colors focus:border-[#A38D6B]/55';

const textareaClass = `${inputClass} min-h-[104px] resize-y leading-[1.8]`;

function SectionHeading({
  eyebrow,
  title,
  note,
  compact,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mb-4' : 'mb-6'}>
      <p
        className="mb-2 text-[10px] uppercase tracking-[0.32em] text-[#A38D6B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-xl tracking-[0.12em] text-[#31353A] md:text-2xl"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
      >
        {title}
      </h2>
      {note && (
        <p
          className="mt-2 text-[11.5px] leading-[1.8] tracking-[0.04em] text-[#31353A]/55"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function FieldGroup({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <fieldset className={last ? '' : 'mb-6'}>
      <legend
        className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#A38D6B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
      >
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? 'md:col-span-2' : ''}>
      <span
        className="mb-1.5 flex items-center gap-1 text-[11px] tracking-[0.12em] text-[#31353A]/70"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
      >
        {label}
        {required && <span className="text-[#B88080]">*</span>}
      </span>
      {children}
    </label>
  );
}
