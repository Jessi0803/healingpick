import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Copy, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import ContactDialog from '@/components/ContactDialog';

const GALLERY_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/custom-bracelet/general/IMG_${4826 + i}.PNG`,
);

const FEATURE_ITEMS = [
  {
    title: '依照需求搭配專屬水晶',
    desc: '可以依照想加強的能量、喜歡的色系、配戴習慣與預算，討論出更貼近你的水晶組合。',
  },
  {
    title: '高品質天然水晶挑選',
    desc: '水晶會仔細挑選，優先使用品質穩定、少雜質、光澤乾淨的珠材與配件。',
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

          <section className="mb-14 grid items-start gap-8 md:grid-cols-[0.95fr_1.05fr]">
            <div className="animate-fade-in-up">
              <p
                className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#D1BE9B]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                Custom Crystal Bracelet
              </p>
              <h1
                className="mb-4 text-2xl font-extralight tracking-[0.18em] text-[#31353A] md:text-4xl"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                一般客製化手鍊
              </h1>
              <p
                className="mb-6 whitespace-pre-line text-[13px] leading-[2.1] tracking-[0.08em] text-[#31353A]/72"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                想要一條真正貼近自己的水晶手鍊，可以從你的需求、近期狀態、喜歡的顏色與配戴習慣開始。
                {'\n'}我們會依照你的方向挑選專屬水晶，讓它不只是飾品，也是一份陪你日常前進的能量提醒。
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURE_ITEMS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#D1BE9B]/20 bg-white/45 px-4 py-4 shadow-sm">
                    <p
                      className="mb-1 text-[12px] tracking-[0.12em] text-[#A38D6B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-[11.5px] leading-[1.8] tracking-[0.06em] text-[#31353A]/68"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up">
              <div className="grid grid-cols-2 gap-3">
                {GALLERY_IMAGES.slice(0, 4).map((src, idx) => (
                  <div
                    key={src}
                    className={`overflow-hidden rounded-2xl border border-[#D1BE9B]/20 bg-white/40 ${
                      idx === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'
                    }`}
                  >
                    <img src={src} alt="客製化手鍊顧客回饋與實拍圖" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-14 animate-fade-in-up">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="mb-2 text-[10px] uppercase tracking-[0.32em] text-[#D1BE9B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  Real Feedback
                </p>
                <h2
                  className="text-lg tracking-[0.18em] text-[#31353A]/85"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  顧客回饋＆客製化商品實拍圖
                </h2>
              </div>
              <p
                className="max-w-md text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/58"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                以上照片都是顧客回饋＆客製化商品實拍圖。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {GALLERY_IMAGES.map((src) => (
                <div key={src} className="aspect-[3/4] overflow-hidden rounded-2xl border border-[#D1BE9B]/20 bg-white/40">
                  <img src={src} alt="顧客回饋與客製化商品實拍圖" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="animate-fade-in-up">
              <p
                className="mb-2 text-[10px] uppercase tracking-[0.32em] text-[#D1BE9B]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                Custom Form
              </p>
              <h2
                className="mb-4 text-lg tracking-[0.18em] text-[#31353A]/85"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                客製化需求表單
              </h2>
              <div className="rounded-2xl border border-[#D1BE9B]/20 bg-white/45 px-5 py-5">
                <p
                  className="mb-3 text-[12px] leading-[2] tracking-[0.08em] text-[#31353A]/70"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  填寫後會整理成諮詢文字，方便直接傳到 LINE 或 IG。
                </p>
                <div className="flex flex-wrap gap-2">
                  {ENERGY_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => update('energyNeeds', form.energyNeeds ? `${form.energyNeeds}、${item}` : item)}
                      className="rounded-full border border-[#D1BE9B]/25 bg-[#FAF7F4]/70 px-3 py-1.5 text-[11px] tracking-[0.08em] text-[#A38D6B] transition-colors hover:bg-[#D1BE9B]/15"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="animate-fade-in-up rounded-3xl border border-[#D1BE9B]/20 bg-white/50 p-5 shadow-[0_12px_36px_rgba(209,190,155,0.10)] md:p-7">
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
                <Field label="想加強的功效或需求" required wide>
                  <textarea value={form.energyNeeds} onChange={(e) => update('energyNeeds', e.target.value)} className={textareaClass} placeholder="例如招財、桃花、人緣、穩定情緒，或最近遇到的狀態" />
                </Field>
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
                <Field label="其他備註">
                  <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className={textareaClass} placeholder="其他想補充的需求" />
                </Field>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3D4144] px-5 py-3 text-xs tracking-[0.2em] text-[#FAF7F4] shadow-sm transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已複製表單' : '複製表單並聯繫'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/30 bg-[#FAF7F4]/70 px-5 py-3 text-xs tracking-[0.2em] text-[#A38D6B] transition-all duration-300 hover:bg-[#D1BE9B]/15 active:scale-95"
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

      <ContactDialog
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        productName="一般客製化手鍊"
      />
    </PageLayout>
  );
}

const inputClass =
  'w-full rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/75 px-4 py-3 text-[12px] tracking-[0.06em] text-[#31353A]/78 outline-none transition-colors focus:border-[#A38D6B]/55';

const textareaClass = `${inputClass} min-h-[104px] resize-y leading-[1.8]`;

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
        className="mb-1.5 flex items-center gap-1 text-[11px] tracking-[0.16em] text-[#A38D6B]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
      >
        <Sparkles className="h-3 w-3" />
        {label}
        {required && <span className="text-[#B88080]">*</span>}
      </span>
      {children}
    </label>
  );
}
