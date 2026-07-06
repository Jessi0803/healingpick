import { AlertCircle, Check, Clock, Gem, Palette, RefreshCw, Ruler, Sparkles } from 'lucide-react';

const crystalTraits = ['冰裂', '棉絮', '礦缺', '雲霧感', '色澤深淺不同', '紋路差異'];

const noticeGroups = [
  {
    title: '手圍與尺寸',
    eyebrow: 'Wrist Size',
    icon: Ruler,
    items: [
      '請提供正確手圍（建議貼手測量）。',
      '因個人測量誤差造成尺寸不合，如需修改，需自行負擔來回運費。',
    ],
  },
  {
    title: '成品差異',
    eyebrow: 'Finished Piece',
    icon: Sparkles,
    items: [
      '客製商品無法做到與示意圖 100% 相同。',
      '若指定水晶缺貨，會先與您討論替代方案。',
    ],
  },
  {
    title: '售後服務',
    eyebrow: 'Aftercare',
    icon: RefreshCw,
    items: [
      '購買享永久免費換線服務（需自行負擔來回運費）。',
      '更換金(銀)飾 $100，水晶遺失將依材料另行報價。',
    ],
  },
  {
    title: '商品保養',
    eyebrow: 'Care',
    icon: Gem,
    items: [
      '避免碰撞、拉扯。',
      '洗澡、泡溫泉、游泳時建議取下。',
      '化妝品、香水、酒精等請避免長時間接觸。',
    ],
  },
  {
    title: '客製商品恕不接受',
    eyebrow: 'Returns',
    icon: AlertCircle,
    items: ['因個人喜好、顏色不符想像、臨時改變心意等因素退換貨。'],
  },
  {
    title: '出貨時間',
    eyebrow: 'Lead Time',
    icon: Clock,
    items: ['客製商品製作約 7-14 個工作天。', '如遇特殊節日或訂單較多，出貨時間將依公告為準。'],
  },
];

const designNotes = [
  '客製化商品需先完成付款才會開始製作。',
  '設計圖提供 3 次免費修改，第四次起每次酌收設計修改費 $100。',
  '保留作品拍攝與分享權利（若不希望公開，可提前告知）。',
  '銀飾、神獸雕件、特殊等級水晶（例如：高品鈦晶、綠幽靈）需另外加價。',
  '天然水晶的色澤、紋理及大小會有些微差異，品牌會盡力維持整體設計平衡。',
];

export default function ProductCareNotice() {
  return (
    <section className="mx-auto mb-10 mt-14 max-w-5xl animate-fade-in-up">
      <div className="mb-6 flex flex-col gap-3 border-t border-[#D1BE9B]/20 pt-9 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="mb-2 text-[16px] italic tracking-[0.04em] text-[#A38D6B]"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
          >
            Before Ordering
          </p>
          <h2
            className="text-xl tracking-[0.14em] text-[#31353A] md:text-2xl"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            購買與客製注意事項
          </h2>
        </div>
        <p
          className="max-w-md text-[11.5px] leading-[1.8] tracking-[0.06em] text-[#31353A]/58"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
        >
          下單前請先閱讀，讓尺寸、天然水晶特性與後續服務都能被清楚確認。
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#D1BE9B]/24 bg-white/50 shadow-[0_14px_42px_rgba(209,190,155,0.10)]">
        <div className="grid gap-px bg-[#D1BE9B]/18 md:grid-cols-2">
          <div className="bg-[#FAF7F4]/92 p-5 md:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3D4144] text-[#FAF7F4]">
                <Gem className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.24em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  Natural Crystal
                </p>
                <h3
                  className="text-[15px] tracking-[0.12em] text-[#31353A]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                >
                  天然水晶特性
                </h3>
              </div>
            </div>
            <p
              className="mb-4 text-[12.5px] leading-[1.9] tracking-[0.04em] text-[#31353A]/70"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
            >
              每顆天然水晶皆獨一無二，可能有以下自然狀態：
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {crystalTraits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border border-[#D1BE9B]/28 bg-white/55 px-3 py-1.5 text-[11px] tracking-[0.08em] text-[#31353A]/72"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {trait}
                </span>
              ))}
            </div>
            <p
              className="rounded-2xl bg-[#D1BE9B]/13 px-4 py-3 text-[12px] leading-[1.8] tracking-[0.06em] text-[#7B674B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
            >
              以上皆屬天然現象，非瑕疵。
            </p>
          </div>

          {noticeGroups.map(({ title, eyebrow, icon: Icon, items }) => (
            <div key={title} className="bg-[#FAF7F4]/92 p-5 md:p-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#D1BE9B]/20 text-[#A38D6B]">
                  <Icon className="h-4 w-4" strokeWidth={1.55} />
                </span>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] text-[#A38D6B]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                  >
                    {eyebrow}
                  </p>
                  <h3
                    className="text-[14px] tracking-[0.12em] text-[#31353A]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
                  >
                    {title}
                  </h3>
                </div>
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D1BE9B]" />
                    <span
                      className="text-[12px] leading-[1.85] tracking-[0.04em] text-[#31353A]/68"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#D1BE9B]/20 bg-[#F2EDE8]/58 p-5 md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#A38D6B] text-[#FAF7F4]">
              <Palette className="h-4.5 w-4.5" strokeWidth={1.5} />
            </span>
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.24em] text-[#A38D6B]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                Design
              </p>
              <h3
                className="text-[15px] tracking-[0.12em] text-[#31353A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}
              >
                關於設計
              </h3>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {designNotes.map((note) => (
              <div key={note} className="flex items-start gap-3 rounded-2xl bg-white/48 px-4 py-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D1BE9B]/24 text-[#A38D6B]">
                  <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <span
                  className="text-[12px] leading-[1.85] tracking-[0.04em] text-[#31353A]/70"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
