import PageLayout from '@/components/PageLayout';
import { Link } from 'wouter';

const creditPlans = [
  { name: 'Starter Pack', credits: '30 點', price: 'NT$70' },
  { name: 'Standard Pack', credits: '100 點', price: 'NT$180' },
  { name: 'Premium Pack', credits: '300 點', price: 'NT$450' },
];

const sections = [
  {
    title: '購買與付款方式',
    items: [
      'HealingPick 目前提供站內點數加值服務，付款將透過合作金流服務完成；可用付款方式、實際交易金額與付款狀態，皆以結帳頁面顯示為準。',
      '請在結帳時確認 email 與 HealingPick 會員帳號 email 相同，以利付款完成後自動入帳。',
      '若付款成功後點數未入帳，請提供付款 email、付款時間與訂單資訊，聯繫客服協助查核。',
    ],
  },
  {
    title: '點數使用規則',
    items: [
      '每日免費額度會於台灣時間 00:00 重置，已購買點數不會因每日重置而清空。',
      '塔羅、紫微斗數、每日運勢等站內解讀服務，會優先消耗免費額度；免費額度用完後，每次解讀消耗 1 點。',
      '點數僅限使用於 HealingPick 站內服務，不得轉讓、折換現金或移轉至其他平台。',
    ],
  },
  {
    title: '退費政策',
    items: [
      '未使用之點數，可於購買後 7 日內聯繫客服申請退費。',
      '已使用點數、已產生之占卜解讀、AI 回覆或其他已完成提供之數位服務，恕無法退費。',
      '若發生重複付款、付款成功但點數未入帳、系統異常等情形，請聯繫客服協助查核與處理。',
      '退費將依第三方金流或付款平台規則辦理，實際退款時間依付款機構作業為準。',
    ],
  },
  {
    title: '療癒選物購買須知',
    items: [
      '網站上的能量商品與療癒選物，可透過 LINE、Instagram 或 Email 先行詢問適合度、庫存與付款方式。',
      '實體商品的付款、寄送、退換貨方式，會依客服確認之訂單內容與商品狀態辦理。',
      '若商品有瑕疵、寄送錯誤或運送異常，請保留商品與包裝照片，並盡快聯繫客服協助處理。',
    ],
  },
  {
    title: '服務性質說明',
    items: [
      'HealingPick 的塔羅、紫微、運勢、AI 解讀與療癒內容，屬於心靈陪伴、娛樂與個人參考性質。',
      '站內內容不應取代醫療、心理治療、法律、財務、投資或其他專業意見。',
      '完成付款並開始使用點數後，視為同意相關數位服務已開始提供。',
    ],
  },
  {
    title: '客服與申訴方式',
    items: [
      'Email：baby90522@gmail.com',
      'LINE 官方帳號：https://line.me/R/ti/p/%40180itfru',
      'Instagram：https://www.instagram.com/healing.pick_',
    ],
  },
];

export default function PolicyPage() {
  return (
    <PageLayout>
      <main className="min-h-screen bg-[#FAF7F4] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12 text-center">
            <span
              className="text-[11px] uppercase tracking-[0.4em] text-[#D1BE9B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              Purchase Policy
            </span>
            <h1
              className="mt-3 text-3xl font-extralight tracking-[0.22em] text-[#31353A] md:text-4xl"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              購物須知與退費政策
            </h1>
            <p
              className="mx-auto mt-5 max-w-2xl text-[13px] leading-[2] tracking-[0.12em] text-[#31353A]/62"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
            >
              為了讓每一次購買都清楚安心，以下整理 HealingPick 的點數方案、使用規則、退費方式與客服聯繫資訊。
            </p>
          </header>

          <section className="mb-10">
            <h2
              className="mb-5 text-center text-[12px] tracking-[0.28em] text-[#A38D6B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              點數方案
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {creditPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl border border-[#D1BE9B]/20 bg-white/48 px-5 py-6 text-center shadow-[0_10px_30px_rgba(209,190,155,0.05)]"
                >
                  <p
                    className="text-[10px] tracking-[0.18em] text-[#D1BE9B]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {plan.name}
                  </p>
                  <p
                    className="mt-3 text-2xl font-extralight tracking-[0.08em] text-[#31353A]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}
                  >
                    {plan.credits}
                  </p>
                  <p
                    className="mt-2 text-[13px] tracking-[0.12em] text-[#31353A]/66"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {plan.price}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-[#D1BE9B]/18 bg-white/42 p-6 shadow-[0_10px_30px_rgba(209,190,155,0.04)] md:p-7"
              >
                <h2
                  className="mb-4 text-[14px] tracking-[0.18em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-[13px] leading-[1.9] tracking-[0.08em] text-[#31353A]/72"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/buy"
              className="inline-flex items-center justify-center rounded-full bg-[#31353A] px-8 py-3 text-[12px] tracking-[0.22em] text-[#FAF7F4] transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
            >
              查看點數方案
            </Link>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
