import PageLayout from "@/components/PageLayout";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles, X } from "lucide-react";
import { Link } from "wouter";

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
const INITIAL_REVIEW_COUNT = 4;
const REVIEW_LOAD_STEP = 12;

export default function WishRitual() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(INITIAL_REVIEW_COUNT);
  const touchX = useRef<number | null>(null);

  const selectedReview = selectedIndex === null ? null : RITUAL_REVIEW_PROOFS[selectedIndex];
  const visibleReviews = RITUAL_REVIEW_PROOFS.slice(0, visibleReviewCount);
  const hasMoreReviews = visibleReviewCount < RITUAL_REVIEW_PROOFS.length;
  const closeLightbox = () => setSelectedIndex(null);
  const stepLightbox = (dir: number) =>
    setSelectedIndex((current) =>
      current === null
        ? current
        : (current + dir + RITUAL_REVIEW_PROOFS.length) % RITUAL_REVIEW_PROOFS.length,
    );

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") stepLightbox(1);
      if (event.key === "ArrowLeft") stepLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) stepLightbox(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <PageLayout>
      <main className="min-h-screen px-5 pb-20 pt-32 md:px-10">
        <section className="relative mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#C9D5E8]/55 bg-[linear-gradient(135deg,#dce6f6_0%,#e8e1f0_44%,#f3dfd2_100%)] px-5 py-12 text-[#245879] shadow-[0_24px_70px_rgba(36,88,121,0.16)] md:px-10 md:py-16">
          <div className="absolute left-8 top-8 text-3xl text-white/90" aria-hidden="true">
            ✦
          </div>
          <div className="absolute bottom-8 right-8 text-3xl text-white/90" aria-hidden="true">
            ✦
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_84%,rgba(255,244,224,0.66),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(210,232,246,0.62),transparent_34%)]" />

          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <p
                className="text-[11px] tracking-[0.42em] text-[#246188]/82"
                style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 500 }}
              >
                MAGIC RITUAL
              </p>
              <h1
                className="mt-4 text-[22px] font-light leading-[1.75] tracking-[0.12em] text-[#245879] md:text-3xl md:leading-[1.55] md:tracking-[0.22em]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                <span className="block">日日好日</span>
                <span className="block">許願魔法儀式</span>
              </h1>
              <p
                className="mx-auto mt-5 max-w-2xl text-[13px] leading-[2] tracking-[0.1em] text-[#245879]/76"
                style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
              >
                告訴我們你的願望，日日好日會依照感情、財運、事業或療癒等需求，替你安排適合的許願儀式。
              </p>
              <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3 rounded-lg border border-white/48 bg-white/34 px-4 py-4 shadow-[0_12px_34px_rgba(255,255,255,0.2)] backdrop-blur-md sm:flex-row sm:text-left">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#D1BE9B]/38 bg-white/76 shadow-[0_10px_26px_rgba(36,88,121,0.12)]">
                  <img
                    src="/gooday-logo.png"
                    alt="日日好日塔羅"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className="text-[12px] tracking-[0.18em] text-[#245879]"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 600 }}
                  >
                    日日好日 Gooday Tarot
                  </p>
                  <p
                    className="mt-1 text-[11px] leading-[1.8] tracking-[0.08em] text-[#245879]/74"
                    style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                  >
                    讓日日好日替你的願望點亮儀式火光。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 rounded-xl border border-white/45 bg-white/36 p-5 shadow-[0_16px_46px_rgba(255,255,255,0.24)] backdrop-blur-md md:p-7">
              <h2
                className="text-center text-[15px] tracking-[0.2em] text-[#245879] md:text-base"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                日日好日儀式
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {ritualOptions.map((ritual, index) => (
                  <div
                    key={ritual.title}
                    className="rounded-lg border border-white/48 bg-[#F8FBFF]/42 px-4 py-4"
                  >
                    <p
                      className="text-[12px] tracking-[0.16em] text-[#245879]"
                      style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 600 }}
                    >
                      {String.fromCharCode(65 + index)}. {ritual.title}
                    </p>
                    <p
                      className="mt-2 text-[12px] leading-[1.9] tracking-[0.07em] text-[#245879]/82"
                      style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                    >
                      {ritual.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-xl border border-white/45 bg-white/36 p-5 shadow-[0_16px_46px_rgba(255,255,255,0.2)] backdrop-blur-md md:p-7">
                <h2
                  className="text-center text-[15px] tracking-[0.2em] text-[#245879] md:text-base"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  日日好日十願儀式
                </h2>
                <p
                  className="mt-4 text-center text-[12px] tracking-[0.14em] text-[#245879]/78"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  內容包含十大願望
                </p>
                <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3">
                  {tenWishItems.map((item) => (
                    <span
                      key={item}
                      className="text-[13px] tracking-[0.1em] text-[#245879]"
                      style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 600 }}
                    >
                      ✨ {item}
                    </span>
                  ))}
                </div>
                <div
                  className="mt-6 space-y-2 text-center text-[11px] leading-[1.8] tracking-[0.08em] text-[#245879]/78"
                  style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                >
                  <p>✨ 效果維持一個月左右</p>
                  <p>✨ 每月固定做一次效果會一直維持甚至疊增</p>
                  <p>✨ 特殊儀式不開放個別許願，已涵蓋 10 種面向祝福</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/45 bg-white/36 p-5 shadow-[0_16px_46px_rgba(255,255,255,0.2)] backdrop-blur-md md:p-7">
                <h2
                  className="text-center text-[15px] tracking-[0.2em] text-[#245879] md:text-base"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  儀式費用
                </h2>
                <div className="mt-5 grid gap-4">
                  {ritualFees.map((fee, index) => (
                    <div
                      key={fee.title}
                      className="rounded-lg border border-white/48 bg-[#F8FBFF]/42 px-4 py-4"
                    >
                      <p
                        className="text-center text-[13px] tracking-[0.16em] text-[#245879]"
                        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 600 }}
                      >
                        {String.fromCharCode(65 + index)}. {fee.title}
                      </p>
                      {fee.note && (
                        <p
                          className="mt-2 text-center text-[11px] tracking-[0.1em] text-[#245879]/72"
                          style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                        >
                          {fee.note}
                        </p>
                      )}
                      <p
                        className="mt-2 text-center text-[12px] leading-[1.9] tracking-[0.07em] text-[#245879]/82"
                        style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                      >
                        {fee.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <p
                  className="mt-5 text-center text-[12px] leading-[1.9] tracking-[0.08em] text-[#245879]/78"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 400 }}
                >
                  一個方案會包含 1-3 顆許願蠟燭，蠟燭顆數會依照您的需求與燭火訊息做搭配。
                  <br />
                  *1 儀式最多容納一個願望*
                </p>
              </div>
            </div>

            <section className="mt-5 rounded-xl border border-white/45 bg-white/36 p-5 shadow-[0_16px_46px_rgba(255,255,255,0.2)] backdrop-blur-md md:p-7">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.34em] text-[#246188]/68"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    Gift Blessing
                  </p>
                  <h2
                    className="mt-3 text-[15px] leading-[1.8] tracking-[0.2em] text-[#245879] md:text-base"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    購買真人塔羅或魔法儀式，贈送神輿卡祝福
                  </h2>
                  <p
                    className="mt-3 max-w-2xl text-[12px] leading-[2] tracking-[0.08em] text-[#245879]/72"
                    style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                  >
                    願迷惘的你，能獲得穩定的力量；願內心痛楚的你，能開始療癒。
                  </p>
                </div>
                <div className="rounded-lg border border-white/55 bg-[#F8FBFF]/46 px-5 py-4 text-center shadow-[0_10px_24px_rgba(36,88,121,0.08)]">
                  <p
                    className="text-[11px] tracking-[0.2em] text-[#245879]/62 line-through"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    市價 $200
                  </p>
                  <p
                    className="mt-1 text-lg tracking-[0.18em] text-[#245879]"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 600 }}
                  >
                    1 day 免費贈送
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-9 rounded-xl border border-white/45 bg-white/36 p-5 shadow-[0_16px_46px_rgba(255,255,255,0.2)] backdrop-blur-md md:p-7">
              <div className="text-center">
                <p
                  className="text-[11px] uppercase tracking-[0.34em] text-[#246188]/68"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  Ritual Proof
                </p>
                <h2
                  className="mt-3 text-[15px] tracking-[0.2em] text-[#245879] md:text-base"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  魔法儀式顧客回饋
                </h2>
                <p
                  className="mx-auto mt-3 max-w-2xl text-[12px] leading-[2] tracking-[0.08em] text-[#245879]/70"
                  style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                >
                  收錄客人儀式後回傳的真實截圖，點開可以放大查看每一則回饋。
                </p>
              </div>

              <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {visibleReviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`放大第 ${index + 1} 張魔法儀式顧客回饋`}
                    className="group aspect-[3/4] overflow-hidden rounded-2xl border border-white/50 bg-white/45 shadow-[0_12px_26px_rgba(36,88,121,0.12)] transition-[border-color,opacity,transform] duration-200 ease-out hover:border-[#245879]/44 active:scale-[0.98]"
                  >
                    <img
                      src={review.image}
                      alt={`魔法儀式顧客回饋，第 ${index + 1} 張`}
                      loading="lazy"
                      decoding="async"
                      width={360}
                      height={480}
                      sizes="(min-width: 1024px) 10rem, (min-width: 640px) 33vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                  </button>
                ))}
              </div>
              {hasMoreReviews && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleReviewCount((count) =>
                        Math.min(count + REVIEW_LOAD_STEP, RITUAL_REVIEW_PROOFS.length),
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/36 px-6 py-3 text-xs tracking-[0.18em] text-[#245879] shadow-[0_10px_24px_rgba(36,88,121,0.1)] transition-all duration-300 hover:bg-white/62 active:scale-95"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    查看更多回饋（{visibleReviewCount} / {RITUAL_REVIEW_PROOFS.length}）
                  </button>
                </div>
              )}
              <p
                className="mt-4 text-center text-[10px] tracking-[0.18em] text-[#245879]/48"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                點擊任一張放大瀏覽 · 可用左右鍵切換
              </p>
            </section>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={HEALING_PICK_LINE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#245879] px-6 py-3 text-xs tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(36,88,121,0.2)] transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 sm:w-auto"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                官方 LINE 預約儀式
              </a>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/55 bg-white/32 px-6 py-3 text-xs tracking-[0.18em] text-[#245879] transition-all duration-300 hover:bg-white/62 active:scale-95 sm:w-auto"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                回到首頁
              </Link>
              <span
                className="text-[11px] tracking-[0.14em] text-[#245879]/72"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                HealingPick 官方 LINE
              </span>
            </div>
          </div>
        </section>
      </main>

      {selectedReview && selectedIndex !== null && (
        <div
          className="lightbox-backdrop fixed inset-0 z-[70] flex flex-col bg-[#171513]/88 px-3 py-5 backdrop-blur-md md:px-8"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 pb-4 text-[#FAF7F4] md:pb-5">
            <div>
              <p
                className="text-[12px] tracking-[0.18em]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                魔法儀式顧客真實回饋
              </p>
              <p className="mt-1 text-[10px] tracking-[0.12em] text-white/48">
                {selectedIndex + 1} / {RITUAL_REVIEW_PROOFS.length}
              </p>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="關閉"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <X className="h-4.5 w-4.5" strokeWidth={1.7} />
            </button>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              stepLightbox(-1);
            }}
            aria-label="上一張"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:left-8"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <img
              key={selectedReview.id}
              src={selectedReview.image}
              alt={`魔法儀式顧客回饋，第 ${selectedIndex + 1} 張`}
              decoding="async"
              className="lightbox-image max-h-[calc(100vh-13.5rem)] max-w-full rounded-2xl object-contain shadow-2xl md:max-h-[calc(100vh-11rem)]"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              stepLightbox(1);
            }}
            aria-label="下一張"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:right-8"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="mx-auto mt-4 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[10px] tracking-[0.14em] text-white/68 transition-colors hover:bg-white/16"
            onClick={(event) => event.stopPropagation()}
          >
            左右滑動或按方向鍵切換
          </button>
        </div>
      )}
    </PageLayout>
  );
}
