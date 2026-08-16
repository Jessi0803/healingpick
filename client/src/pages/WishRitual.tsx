import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/Reveal";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";
import FeedbackCompanion from "@/components/FeedbackCompanion";
import FeedbackGalleryDialog from "@/components/FeedbackGalleryDialog";

const ritualOptions = [
  {
    title: "邱比特之吻",
    desc: "修補感情裂痕、療癒彼此關係，讓他心裡有你，讓感情更緊密與順利",
  },
  {
    title: "桃花朵朵開",
    desc: "增加個人魅力與吸引力、招好桃花、識別爛桃花，讓你身邊只能容納對的人",
  },
  {
    title: "財神爺來臨",
    desc: "正財、偏財通通來，提升貴人運、事業飛黃騰達，使事業順利且有意外收穫",
  },
  {
    title: "療癒知我心",
    desc: "釐清思緒、平靜心情、消除體內負能量，讓身體健康，保持身心靈的放鬆",
  },
  {
    title: "幸福敲敲門",
    desc: "增強感知幸福的能力、強化靈性與能良連結，讓你幸福到能夠常常微笑",
  },
  {
    title: "客製化儀式",
    desc: "有特別的需求都可以與日日好日聊聊，如金榜題名、友誼修補等",
  },
];

const tenWishItems = [
  "感情順遂",
  "財運旺盛",
  "身體健康",
  "人緣提升",
  "招貴人助",
  "家庭和諧",
  "自我魅力",
  "事業順利",
  "好運循環",
  "負能量淨化",
];

const tenWishNotes = [
  "效果維持一個月左右",
  "每月固定做一次效果會一直維持甚至疊增",
  "特殊儀式不開放個別許願，已涵蓋 10 種面向祝福",
];

const ritualFees = [
  {
    title: "888$ / 儀式",
    desc: "天使數字 888 意指儀式能帶領你，重整與提高自我能量，實現願望獲得成功。",
  },
  {
    title: "2888$ / 4 儀式",
    note: "可以 1 次使用 4 儀式或每週 1 次",
    desc: "天使數字 2888 意指你發送的能量將以你有意願接收的方式返回給你。",
  },
];

const HEALING_PICK_LINE_URL = "https://lin.ee/6PBHLFX";
const RITUAL_REVIEW_PROOFS = Array.from({ length: 56 }, (_, index) => ({
  id: index + 1,
  image: `/gooday-ritual-reviews/review-${index + 1}.jpg`,
}));

const SERIF = { fontFamily: "Noto Serif TC, serif" } as const;
const SANS = { fontFamily: "Noto Sans TC, sans-serif" } as const;
const DISPLAY = { fontFamily: "Cormorant Garamond, serif" } as const;

/** Hairline four-point star — replaces the ✦ / ✨ glyphs with a drawn ornament. */
function StarGlyph({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 1.5c.6 6 3.9 9.3 9.9 10.5-6 1.2-9.3 4.5-9.9 10.5-.6-6-3.9-9.3-9.9-10.5C8.1 10.8 11.4 7.5 12 1.5Z"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The ritual's own light source: a candle flame with a breathing halo and rising sparks. */
function CandleFlame() {
  return (
    <div className="pointer-events-none relative mx-auto h-24 w-24" aria-hidden="true">
      <div className="animate-glow-pulse absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,236,196,0.95)_0%,rgba(209,190,155,0.45)_38%,rgba(209,190,155,0)_70%)]" />
      <div className="absolute inset-0 grid place-items-center">
        <svg width="30" height="52" viewBox="0 0 30 52" fill="none" className="animate-flame">
          <defs>
            <radialGradient id="ritualFlameOuter" cx="50%" cy="72%" r="62%">
              <stop offset="0%" stopColor="#FFF6E2" />
              <stop offset="52%" stopColor="#E8CD9B" />
              <stop offset="100%" stopColor="#D1BE9B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ritualFlameCore" cx="50%" cy="70%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FFF3D8" />
              <stop offset="100%" stopColor="#FFE9BC" stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <path
            d="M15 2c6.2 8.4 9.4 14.6 9.4 20.4 0 6.9-4.2 11.6-9.4 11.6S5.6 29.3 5.6 22.4C5.6 16.6 8.8 10.4 15 2Z"
            fill="url(#ritualFlameOuter)"
          />
          <path
            d="M15 12c3 4.6 4.5 8 4.5 10.9 0 3.6-2 6-4.5 6s-4.5-2.4-4.5-6C10.5 20 12 16.6 15 12Z"
            fill="url(#ritualFlameCore)"
          />
        </svg>
      </div>
      {[
        { left: "38%", top: "52%", delay: "0s" },
        { left: "56%", top: "60%", delay: "1.7s" },
        { left: "46%", top: "46%", delay: "3.4s" },
      ].map((spark) => (
        <span
          key={spark.delay}
          className="animate-spark absolute h-[3px] w-[3px] rounded-full bg-[#E8CD9B]"
          style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
        />
      ))}
    </div>
  );
}

/** Section heading: hairline rule, latin eyebrow, serif title. */
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <span
        className="mx-auto block h-8 w-px bg-gradient-to-b from-transparent to-[#D1BE9B]/55"
        aria-hidden="true"
      />
      <p
        className="mt-5 text-[11px] uppercase tracking-[0.42em] text-[#A08A62]"
        style={{ ...DISPLAY, fontWeight: 500 }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-3 text-[19px] tracking-[0.24em] text-[#4A3F35] md:text-[22px]"
        style={{ ...SERIF, fontWeight: 300 }}
      >
        {title}
      </h2>
    </div>
  );
}

/** Ten wishes arranged as a slowly turning star chart (desktop) — the labels stay upright. */
function WishRing() {
  const radius = 41;

  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-[460px] md:block">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="rotate-slow absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="72" stroke="#D1BE9B" strokeWidth="0.4" strokeOpacity="0.5" />
        <circle
          cx="100"
          cy="100"
          r="58"
          stroke="#D1BE9B"
          strokeWidth="0.35"
          strokeOpacity="0.35"
          strokeDasharray="3 5"
        />
        <circle cx="100" cy="100" r="20" stroke="#D1BE9B" strokeWidth="0.35" strokeOpacity="0.45" />
        {tenWishItems.map((item, index) => {
          const angle = (index / tenWishItems.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={item}
              x1={100 + Math.cos(angle) * 20}
              y1={100 + Math.sin(angle) * 20}
              x2={100 + Math.cos(angle) * 58}
              y2={100 + Math.sin(angle) * 58}
              stroke="#D1BE9B"
              strokeWidth="0.3"
              strokeOpacity="0.4"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <div className="animate-glow-pulse absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,240,208,0.9)_0%,rgba(209,190,155,0.35)_45%,rgba(209,190,155,0)_72%)]" />
          <span
            className="relative text-2xl tracking-[0.1em] text-[#8A7350]"
            style={{ ...SERIF, fontWeight: 300 }}
          >
            願
          </span>
        </div>
      </div>

      {tenWishItems.map((item, index) => {
        const angle = (index / tenWishItems.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={item}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] tracking-[0.12em] text-[#4A3F35]"
            style={{
              ...SERIF,
              fontWeight: 500,
              left: `${50 + Math.cos(angle) * radius}%`,
              top: `${50 + Math.sin(angle) * radius}%`,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

export default function WishRitual() {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <PageLayout>
      <div className="wish-ritual px-5 pb-24 md:px-10">
        {/* Hero — no panel, so the site's starfield and drifting particles show through */}
        <section className="relative mx-auto max-w-3xl pt-4 text-center">
          <div className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-[420px] max-w-2xl bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,244,224,0.75)_0%,rgba(245,235,215,0.28)_45%,transparent_72%)]" />

          <div className="relative">
            <CandleFlame />
            <p
              className="mt-4 text-[11px] uppercase tracking-[0.46em] text-[#A08A62]"
              style={{ ...DISPLAY, fontWeight: 500 }}
            >
              Magic Ritual
            </p>
            <h1
              className="mt-5 text-[26px] font-light leading-[1.85] tracking-[0.2em] text-[#4A3F35] md:text-[34px] md:leading-[1.7] md:tracking-[0.28em]"
              style={{ ...SERIF, fontWeight: 300 }}
            >
              <span className="block">日日好日</span>
              <span className="block">許願魔法儀式</span>
            </h1>
            <div className="mx-auto mt-7 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D1BE9B]/60" />
              <StarGlyph className="text-[#D1BE9B]" size={16} />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D1BE9B]/60" />
            </div>
            <p
              className="mx-auto mt-7 max-w-xl text-[14px] leading-[2.1] tracking-[0.1em] text-[#4A3F35]/78"
              style={{ ...SANS, fontWeight: 400 }}
            >
              告訴我們你的願望，日日好日會依照感情、財運、事業或療癒等需求，替你安排適合的許願儀式。
            </p>

            <div className="mx-auto mt-9 flex max-w-md items-center justify-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[#D1BE9B]/40 bg-[#FDFBF7]/85">
                <img
                  src="/gooday-logo.png"
                  alt="日日好日塔羅"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-left">
                <span
                  className="block text-[12px] tracking-[0.18em] text-[#4A3F35]"
                  style={{ ...SERIF, fontWeight: 500 }}
                >
                  日日好日 Gooday Tarot
                </span>
                <span
                  className="mt-1 block text-[11px] leading-[1.9] tracking-[0.08em] text-[#4A3F35]/68"
                  style={{ ...SANS, fontWeight: 400 }}
                >
                  讓日日好日替你的願望點亮儀式火光。
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Six rituals — a vertical scroll of offerings, hairline-separated */}
        <Reveal as="section" className="mx-auto mt-24 max-w-3xl">
          <SectionHeading eyebrow="The Offerings" title="日日好日儀式" />
          <div className="mt-12">
            {ritualOptions.map((ritual, index) => (
              <div
                key={ritual.title}
                className="reveal-child grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-[#D1BE9B]/22 py-7 first:border-t-0 first:pt-0 md:grid-cols-[3.5rem_1fr] md:gap-x-6"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span
                  className="text-[30px] leading-none text-[#D1BE9B] md:text-[38px]"
                  style={{ ...DISPLAY, fontWeight: 400 }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <div>
                  <p
                    className="text-[15px] tracking-[0.2em] text-[#4A3F35] md:text-base"
                    style={{ ...SERIF, fontWeight: 500 }}
                  >
                    {ritual.title}
                  </p>
                  <p
                    className="mt-3 text-[13px] leading-[2.1] tracking-[0.07em] text-[#4A3F35]/72"
                    style={{ ...SANS, fontWeight: 400 }}
                  >
                    {ritual.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Ten wishes — star chart on desktop, a plain two-column list on phones */}
        <Reveal as="section" className="mx-auto mt-28 max-w-3xl">
          <SectionHeading eyebrow="Ten Wishes" title="日日好日十願儀式" />
          <p
            className="mt-5 text-center text-[12px] tracking-[0.2em] text-[#4A3F35]/62"
            style={{ ...SERIF, fontWeight: 300 }}
          >
            內容包含十大願望
          </p>

          <div className="mt-10">
            <WishRing />
            <div className="mx-auto grid max-w-xs grid-cols-2 gap-x-6 gap-y-4 md:hidden">
              {tenWishItems.map((item) => (
                <span
                  key={item}
                  className="text-[13px] tracking-[0.1em] text-[#4A3F35]"
                  style={{ ...SERIF, fontWeight: 500 }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 w-fit max-w-lg space-y-3">
            {tenWishNotes.map((note) => (
              <p
                key={note}
                className="flex items-start gap-3 text-left text-[12px] leading-[1.95] tracking-[0.08em] text-[#4A3F35]/68"
                style={{ ...SANS, fontWeight: 400 }}
              >
                <span
                  className="mt-[0.7em] h-px w-4 shrink-0 bg-[#D1BE9B]/70"
                  aria-hidden="true"
                />
                <span>{note}</span>
              </p>
            ))}
          </div>
        </Reveal>

        {/* Fees — the one place cards belong, because they are meant to be compared */}
        <Reveal as="section" className="mx-auto mt-28 max-w-3xl">
          <SectionHeading eyebrow="Ritual Fee" title="儀式費用" />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {ritualFees.map((fee, index) => (
              <div
                key={fee.title}
                className="reveal-child rounded-2xl border border-[#D1BE9B]/28 bg-[#FDFBF7]/52 px-6 py-8 text-center backdrop-blur-md"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <span
                  className="block text-[13px] tracking-[0.3em] text-[#D1BE9B]"
                  style={{ ...DISPLAY, fontWeight: 500 }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <p
                  className="mt-3 text-[17px] tracking-[0.14em] text-[#4A3F35]"
                  style={{ ...SERIF, fontWeight: 500 }}
                >
                  {fee.title}
                </p>
                {fee.note && (
                  <p
                    className="mt-2 text-[11px] tracking-[0.1em] text-[#4A3F35]/62"
                    style={{ ...SANS, fontWeight: 400 }}
                  >
                    {fee.note}
                  </p>
                )}
                <span
                  className="mx-auto mt-5 block h-px w-10 bg-[#D1BE9B]/45"
                  aria-hidden="true"
                />
                <p
                  className="mt-5 text-[13px] leading-[2.1] tracking-[0.07em] text-[#4A3F35]/72"
                  style={{ ...SANS, fontWeight: 400 }}
                >
                  {fee.desc}
                </p>
              </div>
            ))}
          </div>
          <p
            className="mx-auto mt-8 max-w-xl text-center text-[12px] leading-[2.1] tracking-[0.08em] text-[#4A3F35]/68"
            style={{ ...SERIF, fontWeight: 400 }}
          >
            一個方案會包含 1-3 顆許願蠟燭，蠟燭顆數會依照您的需求與燭火訊息做搭配。
            <br />
            *1 儀式最多容納一個願望*
          </p>
        </Reveal>

        {/* Gift blessing — a ribbon between hairlines, no longer a competing panel */}
        <Reveal as="section" className="mx-auto mt-28 max-w-3xl">
          <div className="border-y border-[#D1BE9B]/25 py-9">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="text-center md:text-left">
                <p
                  className="text-[11px] uppercase tracking-[0.4em] text-[#A08A62]"
                  style={{ ...DISPLAY, fontWeight: 500 }}
                >
                  Gift Blessing
                </p>
                <h2
                  className="mt-3 text-[17px] leading-[1.8] tracking-[0.2em] text-[#4A3F35] md:text-[19px]"
                  style={{ ...SERIF, fontWeight: 300 }}
                >
                  購買即贈送神輿卡祝福
                </h2>
                <p
                  className="mt-4 text-[13px] leading-[2.1] tracking-[0.08em] text-[#4A3F35]/70"
                  style={{ ...SANS, fontWeight: 400 }}
                >
                  願迷惘的你，能獲得穩定的力量；願內心痛楚的你，能開始療癒。
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 md:flex-col md:gap-1">
                <span
                  className="text-[12px] tracking-[0.18em] text-[#4A3F35]/50 line-through"
                  style={{ ...SERIF, fontWeight: 300 }}
                >
                  市價 $200
                </span>
                <span
                  className="text-[26px] lowercase tracking-[0.16em] text-[#8A7350]"
                  style={{ ...DISPLAY, fontWeight: 500 }}
                >
                  free
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Customer proof */}
        <Reveal as="section" className="mx-auto mt-24 max-w-3xl text-center">
          <SectionHeading eyebrow="Ritual Proof" title="魔法儀式顧客回饋" />
          <p
            className="mx-auto mt-6 max-w-lg text-[13px] leading-[2.1] tracking-[0.08em] text-[#4A3F35]/70"
            style={{ ...SANS, fontWeight: 400 }}
          >
            收錄客人儀式後回傳的真實截圖，可一次瀏覽全部回饋。
          </p>
          <button
            type="button"
            onClick={() => setIsReviewsOpen(true)}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/45 bg-[#FDFBF7]/55 px-7 py-3 text-xs tracking-[0.18em] text-[#4A3F35] backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:border-[#D1BE9B]/70 hover:bg-[#FDFBF7]/85 hover:shadow-[0_14px_30px_rgba(209,190,155,0.22)] active:scale-[0.97]"
            style={{ ...SERIF, fontWeight: 300 }}
          >
            <StarGlyph className="text-[#D1BE9B]" size={15} />
            查看全部回饋（{RITUAL_REVIEW_PROOFS.length}）
          </button>
        </Reveal>

        {/* Closing call to action */}
        <Reveal as="section" className="mx-auto mt-24 max-w-3xl text-center">
          <span
            className="mx-auto block h-10 w-px bg-gradient-to-b from-transparent to-[#D1BE9B]/55"
            aria-hidden="true"
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={HEALING_PICK_LINE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D1BE9B] px-8 py-3.5 text-xs tracking-[0.2em] text-[#3E3427] shadow-[0_14px_32px_rgba(209,190,155,0.35)] transition-all duration-300 hover:bg-[#C4AE87] hover:shadow-[0_18px_38px_rgba(209,190,155,0.45)] active:scale-95 sm:w-auto"
              style={{ ...SERIF, fontWeight: 500 }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              官方 LINE 預約儀式
            </a>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1BE9B]/40 bg-[#FDFBF7]/40 px-8 py-3.5 text-xs tracking-[0.18em] text-[#4A3F35] backdrop-blur-md transition-all duration-300 hover:border-[#D1BE9B]/65 hover:bg-[#FDFBF7]/75 active:scale-95 sm:w-auto"
              style={{ ...SERIF, fontWeight: 300 }}
            >
              <StarGlyph className="text-[#D1BE9B]" size={15} />
              回到首頁
            </Link>
          </div>
          <p
            className="mt-6 text-[11px] tracking-[0.2em] text-[#4A3F35]/58"
            style={{ ...DISPLAY, fontWeight: 500 }}
          >
            HealingPick 官方 LINE
          </p>
        </Reveal>
      </div>

      {!isReviewsOpen && (
        <FeedbackCompanion
          controlsId="ritual-feedback-dialog"
          onOpen={() => setIsReviewsOpen(true)}
        />
      )}

      <FeedbackGalleryDialog
        id="ritual-feedback-dialog"
        open={isReviewsOpen}
        onOpenChange={setIsReviewsOpen}
        eyebrow="Ritual Proof"
        title="魔法儀式顧客回饋"
        description="等了好久的訊息、遲遲沒動靜的緣分——看看儀式之後，他們的生活起了什麼變化。"
        lightboxTitle="魔法儀式顧客真實回饋"
        itemAltPrefix="魔法儀式顧客回饋"
        items={RITUAL_REVIEW_PROOFS}
        itemAspect="868 / 1543"
      />
    </PageLayout>
  );
}
