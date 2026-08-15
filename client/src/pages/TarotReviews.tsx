import PageLayout from '@/components/PageLayout';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';

const REVIEW_CATEGORIES = ['全部', '感情關係', '後續驗證', '升學考試', '人生方向'] as const;

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
  const [activeCategory, setActiveCategory] = useState<(typeof REVIEW_CATEGORIES)[number]>('全部');
  const [selectedReview, setSelectedReview] = useState<(typeof TAROT_REVIEW_PROOFS)[number] | null>(null);

  const filteredReviews = useMemo(() => {
    if (activeCategory === '全部') return TAROT_REVIEW_PROOFS;
    return TAROT_REVIEW_PROOFS.filter((review) => review.category === activeCategory);
  }, [activeCategory]);

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
              不是只聽完就結束，很多人後來都回來告訴我們：當時的提醒，真的和後續發展對上了。
            </p>
          </div>

          <section className="mb-10 grid grid-cols-1 gap-4 border-y border-[#D1BE9B]/22 py-6 md:grid-cols-3">
            {[
              ['18', '精選真實截圖'],
              ['5', '回饋主題分類'],
              ['1 對 1', '真人老師解讀'],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <div
                  className="text-2xl tracking-[0.08em] text-[#8A7250]"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
                >
                  {value}
                </div>
                <div
                  className="mt-1 text-[11px] tracking-[0.2em] text-[#31353A]/58"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {label}
                </div>
              </div>
            ))}
          </section>

          <div className="mb-7 flex flex-wrap justify-center gap-2">
            {REVIEW_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-[11px] tracking-[0.14em] transition-all duration-300 active:scale-95 ${
                  activeCategory === category
                    ? 'border-[#3D4144] bg-[#3D4144] text-[#FAF7F4]'
                    : 'border-[#D1BE9B]/32 bg-white/48 text-[#8A7250] hover:border-[#A38D6B]/50 hover:bg-white/76'
                }`}
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filteredReviews.map((review) => (
              <article
                key={review.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-[#D1BE9B]/20 bg-white/58 shadow-[0_16px_44px_rgba(180,160,130,0.12)] backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  className="group block w-full text-left"
                  aria-label={`放大查看${review.title}`}
                >
                  <div className="relative bg-[#F7F1EA]">
                    <img
                      src={review.image}
                      alt={review.title}
                      className="w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full border border-white/55 bg-white/78 px-3 py-1 text-[10px] tracking-[0.16em] text-[#8A7250] shadow-[0_8px_20px_rgba(49,53,58,0.12)] backdrop-blur-sm"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {review.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h2
                      className="text-[14px] leading-[1.8] tracking-[0.1em] text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {review.title}
                    </h2>
                    <p
                      className="mt-2 text-[12px] leading-[1.9] tracking-[0.07em] text-[#31353A]/62"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {review.note}
                    </p>
                  </div>
                </button>
              </article>
            ))}
          </div>

          <section className="mt-10 grid grid-cols-1 gap-4 border-t border-[#D1BE9B]/22 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h2
                className="text-lg font-extralight leading-[1.8] tracking-[0.16em] text-[#31353A] md:text-xl"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
              >
                想問自己的狀況，也可以先從一題開始
              </h2>
              <p
                className="mt-3 max-w-2xl text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/64"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                占卜不是替你保證結果，而是幫你看清目前的能量、關係狀態與可以選擇的方向。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link href="/tarot">
                <button
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#3D4144] px-7 py-3 text-xs tracking-[0.2em] text-[#FAF7F4] transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 sm:w-auto"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  查看真人塔羅方案
                </button>
              </Link>
              <Link href="/tarot/teacher">
                <button
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#3D4144]/16 bg-white/52 px-7 py-3 text-xs tracking-[0.18em] text-[#31353A] transition-all duration-500 hover:bg-white active:scale-95 sm:w-auto"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  看塔羅師資歷
                </button>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#1F2224]/76 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedReview(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[11px] tracking-[0.18em] text-white transition hover:bg-white/20"
            onClick={() => setSelectedReview(null)}
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            關閉
          </button>
          <figure
            className="max-h-[88vh] w-full max-w-[28rem] overflow-auto rounded-lg bg-[#F7F1EA] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={selectedReview.image} alt={selectedReview.title} className="w-full" />
            <figcaption
              className="border-t border-[#D1BE9B]/22 bg-white px-5 py-4 text-[13px] leading-[1.8] tracking-[0.08em] text-[#31353A]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              {selectedReview.title}
            </figcaption>
          </figure>
        </div>
      )}
    </PageLayout>
  );
}
