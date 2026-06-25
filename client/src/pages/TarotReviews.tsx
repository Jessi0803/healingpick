import PageLayout from '@/components/PageLayout';
import { Link } from 'wouter';

const TAROT_REVIEWS = [
  {
    theme: '感情關係',
    title: '原本一直卡在要不要主動，聊完後比較知道怎麼做',
    body: '老師不是只說會不會復合，而是幫我把對方目前的狀態、我自己的不安，還有我可以先做的事拆開看。看完後心裡比較穩，也沒有那麼想一直追問對方。',
  },
  {
    theme: '曖昧與對方想法',
    title: '有講到我一直不敢承認的地方',
    body: '一開始只是想知道他到底喜不喜歡我，但老師有提醒我，其實我更在意的是自己一直等不到明確回應。那段真的有被說中，也比較知道要怎麼保護自己。',
  },
  {
    theme: '工作選擇',
    title: '不是叫我立刻換工作，而是幫我看清楚卡住的原因',
    body: '我本來以為占卜會直接給答案，但老師有把目前工作的壓力、我擔心的現實問題、接下來可以觀察的時間點講清楚。感覺比較像有人陪我整理。',
  },
  {
    theme: '人生方向',
    title: '問完之後沒有那麼慌了',
    body: '最近很迷惘，不知道自己是不是走錯路。解讀裡有講到我其實不是沒有方向，是太怕選錯。聽完後覺得比較能先往前一步，不用一次決定全部。',
  },
];

export default function TarotReviews() {
  return (
    <PageLayout>
      <div className="min-h-screen px-4 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span
              className="text-[11px] uppercase tracking-[0.4em] text-[#D1BE9B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Human Tarot Reviews
            </span>
            <h1
              className="mt-3 text-2xl font-extralight tracking-[0.2em] text-[#31353A] md:text-3xl"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              顧客好評
            </h1>
            <p
              className="mx-auto mt-4 max-w-xl text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/62"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
            >
              這裡整理一些真人塔羅諮詢後的匿名回顧，讓你先感受解讀的方式與陪伴感。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TAROT_REVIEWS.map((review) => (
              <article
                key={review.title}
                className="rounded-2xl border border-[#D1BE9B]/20 bg-white/50 p-6 shadow-[0_14px_42px_rgba(180,160,130,0.1)] backdrop-blur-sm"
              >
                <span
                  className="inline-flex rounded-full border border-[#D1BE9B]/24 bg-[#D1BE9B]/12 px-3 py-1 text-[11px] tracking-[0.16em] text-[#8A7250]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  {review.theme}
                </span>
                <h2
                  className="mt-4 text-[15px] leading-[1.9] tracking-[0.12em] text-[#31353A]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {review.title}
                </h2>
                <p
                  className="mt-3 text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/68"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  {review.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/tarot">
              <button
                className="rounded-full border border-[#3D4144]/16 bg-white/50 px-7 py-3 text-xs tracking-[0.2em] text-[#31353A] transition-all duration-500 hover:bg-white active:scale-95"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                回到塔羅占卜
              </button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
