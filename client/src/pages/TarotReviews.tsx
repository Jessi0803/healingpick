import PageLayout from '@/components/PageLayout';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TAROT_REVIEW_PROOFS = Array.from({ length: 63 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    image: `/gooday-tarot-reviews/review-${id}.jpg`,
  };
});

export default function TarotReviews() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const selectedReview = selectedIndex === null ? null : TAROT_REVIEW_PROOFS[selectedIndex];
  const closeLightbox = () => setSelectedIndex(null);
  const stepLightbox = (dir: number) =>
    setSelectedIndex((current) =>
      current === null
        ? current
        : (current + dir + TAROT_REVIEW_PROOFS.length) % TAROT_REVIEW_PROOFS.length,
    );

  useEffect(() => {
    if (selectedIndex === null) return;
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') stepLightbox(1);
      if (event.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('keydown', onKey);
    };
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
      <div className="min-h-screen px-4 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span
              className="text-[11px] uppercase tracking-[0.34em] text-[#D1BE9B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Human Tarot Proof
            </span>
            <h1
              className="mt-3 text-2xl font-extralight tracking-[0.18em] text-[#31353A] md:text-3xl"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              真人塔羅顧客回饋
            </h1>
            <p
              className="mx-auto mt-4 max-w-2xl text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/64"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
            >
              這裡收錄的是客人後來回傳的真實截圖：有人說老師講中的狀態太像自己，也有人過一陣子才發現，當時提醒的事情真的發生了。
            </p>
          </div>

          <section>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {TAROT_REVIEW_PROOFS.map((review, index) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`放大第 ${index + 1} 張塔羅顧客回饋`}
                  className="group aspect-[3/4] overflow-hidden rounded-2xl border border-[#D1BE9B]/18 bg-white/45 shadow-[0_12px_26px_rgba(180,160,130,0.12)] transition-[border-color,opacity,transform] duration-200 ease-out hover:border-[#D1BE9B]/70 active:scale-[0.98]"
                >
                  <img
                    src={review.image}
                    alt={`塔羅顧客回饋，第 ${index + 1} 張`}
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
            <p
              className="mt-4 text-center text-[10px] tracking-[0.18em] text-[#31353A]/42"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              點擊任一張放大瀏覽 · 可用左右鍵切換
            </p>
          </section>

        </div>
      </div>

      {selectedReview && selectedIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="lightbox-backdrop fixed inset-0 z-[70] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#171513]/88 px-3 py-5 backdrop-blur-md md:px-8"
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
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                塔羅顧客真實回饋
              </p>
              <p className="mt-1 text-[10px] tracking-[0.12em] text-white/48">
                {selectedIndex + 1} / {TAROT_REVIEW_PROOFS.length}
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
              alt={`塔羅顧客回饋，第 ${selectedIndex + 1} 張`}
              decoding="async"
              className="lightbox-image max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
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
        </div>,
        document.body,
      )}
    </PageLayout>
  );
}
