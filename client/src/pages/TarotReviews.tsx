import PageLayout from '@/components/PageLayout';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TAROT_REVIEW_PROOFS = [
  {
    id: 1,
    category: '後續驗證',
    title: '後來真的有考上，也跟當時解讀講的一樣',
    note: '適合想看「事情後續有沒有對上」的人先感受老師的解讀方式。',
    image: '/gooday-tarot-reviews/review-1.jpg',
  },
  {
    id: 2,
    category: '感情關係',
    title: '不是只問會不會復合，而是把關係狀態拆開看',
    note: '對方想法、彼此互動、自己真正卡住的點，會一起整理。',
    image: '/gooday-tarot-reviews/review-2.jpg',
  },
  {
    id: 3,
    category: '感情關係',
    title: '曖昧、分開、等待回應，都能看得更清楚',
    note: '不是替你做決定，而是讓你知道下一步可以怎麼看。',
    image: '/gooday-tarot-reviews/review-3.jpg',
  },
  {
    id: 4,
    category: '人生方向',
    title: '問完之後，心裡比較不會一直懸著',
    note: '適合最近迷惘、想有人陪你把混亂感整理成重點。',
    image: '/gooday-tarot-reviews/review-4.jpg',
  },
  {
    id: 5,
    category: '後續驗證',
    title: '當時聽起來只是提醒，後來才發現真的有對上',
    note: '保留真實對話感，讓你看到諮詢後的回饋脈絡。',
    image: '/gooday-tarot-reviews/review-5.jpg',
  },
  {
    id: 8,
    category: '感情關係',
    title: '關係裡說不出口的感覺，被講得很貼近',
    note: '適合想問對方想法、關係走向、自己該不該主動的人。',
    image: '/gooday-tarot-reviews/review-8.jpg',
  },
  {
    id: 10,
    category: '後續驗證',
    title: '回來補充後續，才知道牌面提醒有多準',
    note: '不是單一句「很準」，而是有事件發展後的回饋。',
    image: '/gooday-tarot-reviews/review-10.jpg',
  },
  {
    id: 14,
    category: '升學考試',
    title: '面對重要考試時，先把擔心和可能走向看清楚',
    note: '占卜不取代努力，但可以幫你整理焦慮和準備方向。',
    image: '/gooday-tarot-reviews/review-14.jpg',
  },
  {
    id: 19,
    category: '感情關係',
    title: '感情問題不只看結果，也看自己在消耗什麼',
    note: '有些答案不是追問對方，而是先看見自己真正不安的地方。',
    image: '/gooday-tarot-reviews/review-19.jpg',
  },
  {
    id: 22,
    category: '人生方向',
    title: '把很散的狀態，整理成比較能往前的提醒',
    note: '適合卡在選擇、工作、人際或人生節點的人。',
    image: '/gooday-tarot-reviews/review-22.jpg',
  },
  {
    id: 25,
    category: '後續驗證',
    title: '後續發展回來對照，會更知道當時牌面在說什麼',
    note: '保留匿名截圖證據，比漂亮文案更有說服力。',
    image: '/gooday-tarot-reviews/review-25.jpg',
  },
  {
    id: 31,
    category: '感情關係',
    title: '看見對方，也看見自己在關係裡的位置',
    note: '適合想問曖昧、復合、冷淡、已讀不回與關係未來的人。',
    image: '/gooday-tarot-reviews/review-31.jpg',
  },
  {
    id: 37,
    category: '後續驗證',
    title: '真實客人回傳的後續，是最有力量的信任感',
    note: '頁面保留原始 IG / LINE 截圖感，個資已由原素材處理。',
    image: '/gooday-tarot-reviews/review-37.jpg',
  },
  {
    id: 40,
    category: '人生方向',
    title: '不是叫你立刻改變，而是先知道自己在哪裡',
    note: '老師會用比較白話的方式，把牌面變成你聽得懂的提醒。',
    image: '/gooday-tarot-reviews/review-40.jpg',
  },
  {
    id: 46,
    category: '感情關係',
    title: '關係裡的猶豫、拉扯和期待，都可以被好好攤開',
    note: '如果你一直想問同一件事，可能是心裡還沒被接住。',
    image: '/gooday-tarot-reviews/review-46.jpg',
  },
  {
    id: 52,
    category: '後續驗證',
    title: '從當下解讀，到後來事件發生，有完整回饋脈絡',
    note: '這類案例比單純五星評價更能看出服務的穩定度。',
    image: '/gooday-tarot-reviews/review-52.jpg',
  },
  {
    id: 58,
    category: '感情關係',
    title: '想知道對方怎麼想，也想知道自己該怎麼穩住',
    note: '感情占卜最重要的不是催答案，而是先看清楚互動模式。',
    image: '/gooday-tarot-reviews/review-58.jpg',
  },
  {
    id: 63,
    category: '後續驗證',
    title: '聊完不是結束，很多人會回來說後來真的對上',
    note: '真人塔羅的價值，在於把當下狀態和後續提醒連起來。',
    image: '/gooday-tarot-reviews/review-63.jpg',
  },
];

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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') stepLightbox(1);
      if (event.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
