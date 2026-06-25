import PageLayout from '@/components/PageLayout';
import { Link } from 'wouter';

const OFFICIAL_LINE_URL = 'https://lin.ee/6PBHLFX';

export default function TarotKnowledge() {
  return (
    <PageLayout>
      <div className="tarot-knowledge-page min-h-screen px-4 py-24 md:px-8">
        <style>{`
          .tarot-knowledge-page {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(720px 480px at 12% 12%, rgba(216, 195, 139, 0.2), transparent 64%),
              radial-gradient(700px 520px at 88% 22%, rgba(18, 63, 74, 0.1), transparent 66%),
              linear-gradient(180deg, rgba(255, 253, 248, 0.56), rgba(246, 241, 226, 0.28));
          }
          .tarot-knowledge-page::before {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image:
              linear-gradient(rgba(184, 145, 79, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(184, 145, 79, 0.05) 1px, transparent 1px);
            background-size: 46px 46px;
            mask-image: radial-gradient(circle at 50% 16%, black, transparent 74%);
          }
          .knowledge-shell {
            position: relative;
            z-index: 1;
          }
          .knowledge-panel {
            border: 1px solid rgba(184, 145, 79, 0.24);
            background:
              linear-gradient(135deg, rgba(255, 253, 248, 0.82), rgba(255, 255, 255, 0.54));
            box-shadow: 0 20px 60px rgba(80, 72, 45, 0.1);
          }
          .knowledge-card {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(184, 145, 79, 0.22);
            background:
              linear-gradient(180deg, rgba(255, 253, 248, 0.72), rgba(255, 255, 255, 0.48));
            box-shadow: 0 16px 44px rgba(80, 72, 45, 0.08);
          }
          .knowledge-card::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 3px;
            background: linear-gradient(90deg, #b8914f, rgba(18, 63, 74, 0.42), #b8914f);
            opacity: 0.58;
          }
        `}</style>

        <div className="knowledge-shell mx-auto max-w-4xl">
          <section className="knowledge-panel mb-8 rounded-3xl p-7 text-center backdrop-blur-sm md:p-10">
            <span
              className="text-[11px] uppercase tracking-[0.4em] text-[#B8914F]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Tarot Knowledge
            </span>
            <h1
              className="mt-4 text-2xl font-extralight leading-[1.8] tracking-[0.18em] text-[#303842] md:text-3xl"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              塔羅知識小百科
            </h1>
            <p
              className="mx-auto mt-4 max-w-2xl text-[13px] leading-[2.1] tracking-[0.08em] text-[#303842]/64"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
            >
              這裡用比較白話的方式，簡單介紹白中道博士與《古埃及神圖塔羅牌》。它不是要把塔羅講得很遙遠，而是讓你知道老師使用的系統從哪裡來。
            </p>
          </section>

          <div className="grid grid-cols-1 gap-5">
            <article className="knowledge-card rounded-2xl p-6 backdrop-blur-sm md:p-7">
              <h2
                className="text-[17px] leading-[1.9] tracking-[0.14em] text-[#8A6F3D]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                白中道博士是誰？
              </h2>
              <p
                className="mt-4 text-[13px] leading-[2.1] tracking-[0.08em] text-[#303842]/68"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                白中道博士 Dr. Douglass A. White（1941–2021）是一位長期研究古埃及文化、符號、靈性系統與塔羅牌的學者與作者。他將古埃及神祇、象徵圖像與塔羅牌義結合，發展出《古埃及神圖塔羅牌》的解讀系統。
              </p>
              <p
                className="mt-3 text-[13px] leading-[2.1] tracking-[0.08em] text-[#303842]/62"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                你可以把他理解成：不是單純的算命老師，而是把古埃及符號學、神秘學與塔羅系統整理成一套牌卡語言的人。
              </p>
            </article>

            <article className="knowledge-card rounded-2xl p-6 backdrop-blur-sm md:p-7">
              <h2
                className="text-[17px] leading-[1.9] tracking-[0.14em] text-[#8A6F3D]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                古埃及神圖塔羅牌是什麼？
              </h2>
              <p
                className="mt-4 text-[13px] leading-[2.1] tracking-[0.08em] text-[#303842]/68"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                《古埃及神圖塔羅牌》是一套以古埃及神祇、圖像與象徵為核心的塔羅系統。它不只看傳統塔羅牌義，也會透過神祇角色、顏色、姿勢與圖像符號，理解問題背後的狀態。
              </p>
              <p
                className="mt-3 text-[13px] leading-[2.1] tracking-[0.08em] text-[#303842]/62"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
              >
                簡單來說，它像是一套用古埃及神話與符號說故事的塔羅牌。每張牌不只是答案，而是一個提醒：你現在卡在哪裡、內在真正擔心什麼，以及下一步可以怎麼看待這件事。
              </p>
            </article>
          </div>

          <section className="mt-8 rounded-2xl border border-[#D1BE9B]/22 bg-[#FFFDF8]/64 p-6 shadow-[0_14px_42px_rgba(180,160,130,0.08)] backdrop-blur-sm md:p-7">
            <p
              className="text-center text-[14px] leading-[2] tracking-[0.12em] text-[#303842]/74"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              看完小百科後，想請真人塔羅師用這套系統為你解讀嗎？
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/tarot/teacher">
                <button
                  className="w-full rounded-full border border-[#123F4A]/18 bg-white/60 px-7 py-3 text-xs tracking-[0.2em] text-[#123F4A] transition-all duration-500 hover:bg-white active:scale-95 sm:w-auto"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  回到塔羅師介紹
                </button>
              </Link>
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer">
                <button
                  className="w-full rounded-full bg-[#06C755] px-7 py-3 text-xs tracking-[0.2em] text-white transition-all duration-500 hover:bg-[#05B84F] active:scale-95 sm:w-auto"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  LINE 預約真人塔羅
                </button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
