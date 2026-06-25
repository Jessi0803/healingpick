import PageLayout from '@/components/PageLayout';
import { Link } from 'wouter';

const OFFICIAL_LINE_URL = 'https://lin.ee/6PBHLFX';

const TEACHER_HIGHLIGHTS = [
  {
    title: '師承白中道博士',
    body: '曾向白中道博士 Dr. Douglass A. White（1941–2021）學習《古埃及神圖塔羅牌》系統，重視牌面象徵、神圖意涵與靈性訊息。',
  },
  {
    title: '30 年真人占卜經驗',
    body: '累積多年真人諮詢與實占經驗，長期協助個案整理感情、復合、曖昧關係、人生方向與重要選擇。',
  },
  {
    title: '靈性直覺解讀',
    body: '不只看牌義，也結合直覺感應與能量觀察，從當下狀態中找出更貼近個人處境的提醒。',
  },
];

const QUESTION_AREAS = [
  '感情復合',
  '對方想法',
  '曖昧關係',
  '是否該主動',
  '關係未來發展',
  '工作選擇',
  '人生方向',
];

export default function TarotTeacher() {
  return (
    <PageLayout>
      <div className="tarot-teacher-page min-h-screen px-4 py-24 md:px-8">
        <style>{`
          .tarot-teacher-page {
            --teacher-ink: #303842;
            --teacher-ink-soft: rgba(48, 56, 66, 0.68);
            --teacher-gold: #b8914f;
            --teacher-gold-soft: rgba(216, 195, 139, 0.34);
            --teacher-blue: #123f4a;
            --teacher-blue-soft: rgba(18, 63, 74, 0.08);
            --teacher-sage: #6f8a6a;
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(620px 420px at 14% 14%, rgba(216, 195, 139, 0.2), transparent 64%),
              radial-gradient(680px 520px at 88% 18%, rgba(18, 63, 74, 0.11), transparent 66%),
              linear-gradient(180deg, rgba(255, 253, 248, 0.54), rgba(246, 241, 226, 0.26));
          }
          .tarot-teacher-page::before {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image:
              linear-gradient(rgba(184, 145, 79, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(184, 145, 79, 0.06) 1px, transparent 1px);
            background-size: 46px 46px;
            mask-image: radial-gradient(circle at 50% 20%, black, transparent 72%);
          }
          .tarot-teacher-shell {
            position: relative;
            z-index: 1;
          }
          .teacher-hero {
            position: relative;
            overflow: hidden;
            border-radius: 30px;
            border: 1px solid rgba(184, 145, 79, 0.28);
            background:
              linear-gradient(135deg, rgba(255, 253, 248, 0.88), rgba(245, 239, 223, 0.78)),
              radial-gradient(520px 320px at 78% 20%, rgba(18, 63, 74, 0.1), transparent 70%);
            box-shadow:
              0 24px 70px rgba(80, 72, 45, 0.14),
              inset 0 1px 0 rgba(255, 255, 255, 0.78);
          }
          .teacher-hero::before {
            content: '';
            position: absolute;
            inset: 18px;
            border: 1px solid rgba(184, 145, 79, 0.22);
            border-radius: 23px;
            pointer-events: none;
          }
          .teacher-hero::after {
            content: '';
            position: absolute;
            right: -120px;
            top: -160px;
            width: 360px;
            height: 360px;
            border-radius: 999px;
            border: 1px solid rgba(184, 145, 79, 0.26);
            box-shadow:
              0 0 0 28px rgba(184, 145, 79, 0.04),
              0 0 0 58px rgba(18, 63, 74, 0.04);
            pointer-events: none;
          }
          .teacher-eyebrow {
            color: var(--teacher-gold);
          }
          .teacher-title {
            color: var(--teacher-ink);
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.68);
          }
          .teacher-copy {
            color: var(--teacher-ink-soft);
          }
          .teacher-knowledge-link {
            color: #8a6f3d;
            border-bottom: 1px solid rgba(184, 145, 79, 0.46);
            font-size: 0.92em;
            text-decoration: none;
            transition: color 180ms ease, border-color 180ms ease;
          }
          .teacher-knowledge-link:hover {
            color: var(--teacher-blue);
            border-color: rgba(18, 63, 74, 0.46);
          }
          .teacher-service-panel {
            position: relative;
            background:
              linear-gradient(180deg, rgba(18, 63, 74, 0.08), rgba(247, 255, 249, 0.52));
          }
          .teacher-service-panel::before {
            content: '☉';
            position: absolute;
            right: 34px;
            top: 28px;
            color: rgba(184, 145, 79, 0.22);
            font-family: 'Noto Serif TC', serif;
            font-size: 42px;
            line-height: 1;
          }
          .teacher-price-card {
            border: 1px solid rgba(184, 145, 79, 0.22);
            background:
              linear-gradient(135deg, rgba(255, 255, 255, 0.68), rgba(255, 253, 248, 0.5));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
          }
          .teacher-price {
            color: var(--teacher-blue);
          }
          .teacher-line-button {
            background: linear-gradient(135deg, #06c755, #4f7750);
            box-shadow: 0 14px 34px rgba(6, 199, 85, 0.22);
          }
          .teacher-highlight-card {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(184, 145, 79, 0.22);
            background:
              linear-gradient(180deg, rgba(255, 253, 248, 0.72), rgba(255, 255, 255, 0.46));
            box-shadow: 0 16px 44px rgba(80, 72, 45, 0.09);
          }
          .teacher-highlight-card::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--teacher-gold), rgba(18, 63, 74, 0.38), var(--teacher-gold));
            opacity: 0.56;
          }
          .teacher-highlight-card::after {
            content: '✦';
            position: absolute;
            right: 20px;
            top: 18px;
            color: rgba(184, 145, 79, 0.2);
            font-size: 20px;
          }
          .teacher-highlight-title,
          .teacher-section-title {
            color: #8a6f3d;
          }
          .teacher-bottom-panel {
            border: 1px solid rgba(184, 145, 79, 0.22);
            background:
              linear-gradient(135deg, rgba(255, 253, 248, 0.68), rgba(18, 63, 74, 0.045));
            box-shadow: 0 16px 44px rgba(80, 72, 45, 0.08);
          }
          .teacher-chip {
            border: 1px solid rgba(184, 145, 79, 0.24);
            background: rgba(255, 253, 248, 0.72);
            color: rgba(48, 56, 66, 0.7);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
          }
          .teacher-secondary-button {
            border: 1px solid rgba(18, 63, 74, 0.18);
            background: rgba(255, 255, 255, 0.6);
            color: var(--teacher-blue);
          }
          .teacher-gold-button {
            border: 1px solid rgba(184, 145, 79, 0.28);
            background: rgba(216, 195, 139, 0.14);
            color: #8a6f3d;
          }
        `}</style>
        <div className="tarot-teacher-shell mx-auto max-w-5xl">
          <section className="teacher-hero mb-12">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative z-10 p-7 md:p-10">
                <span
                  className="teacher-eyebrow text-[11px] uppercase tracking-[0.4em]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
                >
                  Human Tarot Teacher
                </span>
                <h1
                  className="teacher-title mt-4 text-2xl font-extralight leading-[1.8] tracking-[0.18em] md:text-3xl"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
                >
                  塔羅師介紹
                </h1>
                <p
                  className="teacher-copy mt-5 max-w-2xl text-[14px] leading-[2.2] tracking-[0.08em]"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  我們合作的真人塔羅師，擁有超過 30 年塔羅占卜與個案解讀經驗，曾向
                  <Link href="/tarot/knowledge" className="teacher-knowledge-link mx-1">
                    白中道博士
                  </Link>
                  Dr. Douglass A. White（1941–2021）學習
                  <Link href="/tarot/knowledge" className="teacher-knowledge-link mx-1">
                    《古埃及神圖塔羅牌》
                  </Link>
                  系統。
                </p>
                <p
                  className="teacher-copy mt-4 max-w-2xl text-[13px] leading-[2.1] tracking-[0.08em]"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  老師承襲這套系統的牌義邏輯與靈性視角，並結合多年實占經驗，協助來訪者釐清感情關係、對方想法、復合可能、人生選擇與內在狀態。
                </p>
              </div>

              <div className="teacher-service-panel relative z-10 border-t border-[#D1BE9B]/16 p-7 lg:border-l lg:border-t-0 md:p-10">
                <p
                  className="text-[12px] tracking-[0.24em] text-[#123F4A]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  真人塔羅服務
                </p>
                <div className="mt-5 space-y-3">
                  <div className="teacher-price-card rounded-2xl px-5 py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className="text-[13px] tracking-[0.12em] text-[#31353A]/72"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        30 分鐘問到飽
                      </span>
                      <strong
                        className="teacher-price text-[20px] tracking-[0.08em]"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}
                      >
                        NT$500
                      </strong>
                    </div>
                  </div>
                  <div className="teacher-price-card rounded-2xl px-5 py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className="text-[13px] tracking-[0.12em] text-[#31353A]/72"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        單題解讀
                      </span>
                      <strong
                        className="teacher-price text-[20px] tracking-[0.08em]"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}
                      >
                        NT$300
                      </strong>
                    </div>
                  </div>
                </div>
                <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer">
                  <button
                    className="teacher-line-button mt-6 w-full rounded-full px-7 py-3 text-xs tracking-[0.2em] text-white transition-all duration-500 hover:brightness-105 active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    LINE 預約真人塔羅
                  </button>
                </a>
              </div>
            </div>
          </section>

          <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TEACHER_HIGHLIGHTS.map((item) => (
              <article
                key={item.title}
                className="teacher-highlight-card rounded-2xl p-6 backdrop-blur-sm"
              >
                <h2
                  className="teacher-highlight-title text-[15px] leading-[1.9] tracking-[0.14em]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  {item.title}
                </h2>
                <p
                  className="mt-3 text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/66"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  {item.body}
                </p>
              </article>
            ))}
          </section>

          <section className="teacher-bottom-panel rounded-2xl p-6 backdrop-blur-sm md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p
                  className="teacher-section-title text-[13px] tracking-[0.22em]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  適合深入詢問
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUESTION_AREAS.map((area) => (
                    <span
                      key={area}
                      className="teacher-chip rounded-full px-3 py-1.5 text-[11px] leading-[1.5] tracking-[0.08em]"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link href="/tarot">
                  <button
                    className="teacher-secondary-button w-full rounded-full px-7 py-3 text-xs tracking-[0.2em] transition-all duration-500 hover:bg-white active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    回到塔羅占卜
                  </button>
                </Link>
                <Link href="/tarot/reviews">
                  <button
                    className="teacher-gold-button w-full rounded-full px-7 py-3 text-xs tracking-[0.2em] transition-all duration-500 hover:bg-[#D1BE9B]/20 active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    查看顧客好評
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
