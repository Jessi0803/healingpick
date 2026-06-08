import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const GUMROAD_PRODUCT_URL = 'https://bubbly572.gumroad.com/l/healingpick-credits';

const PACKAGES = [
  { variant: 'Starter Pack', credits: 30, price: 'NT$70', tag: '輕巧' },
  { variant: 'Standard Pack', credits: 100, price: 'NT$180', tag: '最受歡迎' },
  { variant: 'Premium Pack', credits: 300, price: 'NT$450', tag: '超值' },
];

export default function BuyPage() {
  const { user, isAuthenticated, login } = useAuth();
  // Refetch credits whenever the user comes back to the page (e.g. after
  // the Gumroad overlay closes), so newly-bought points show up automatically.
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });
  const credits = creditsQuery.data;
  const isAdmin = user?.role === 'admin';

  const [topupEmail, setTopupEmail] = useState('');
  const [topupAmount, setTopupAmount] = useState(30);
  const topup = trpc.credits.adminTopup.useMutation({
    onSuccess: (d) => {
      toast.success(`已為 ${d.email} 加值，目前 ${d.credits} 點`);
      creditsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  // Load Gumroad's overlay script once when this page mounts.
  useEffect(() => {
    if (document.querySelector('script[src*="gumroad.com/js/gumroad.js"]')) return;
    const s = document.createElement('script');
    s.src = 'https://gumroad.com/js/gumroad.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Build the Gumroad checkout URL — prefill the buyer's email so the
  // webhook can match the purchase back to this account.
  const checkoutUrl = (() => {
    const params = new URLSearchParams({ wanted: 'true' });
    if (user?.email) params.set('email', user.email);
    return `${GUMROAD_PRODUCT_URL}?${params.toString()}`;
  })();

  return (
    <PageLayout>
      <div className="min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              Credits
            </span>
            <h1 className="text-3xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              購買點數
            </h1>
            <p className="text-[12px] text-[#31353A]/54 tracking-wider"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              每天可免費占卜 2 次，用完後每次解讀消耗 1 點
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20 text-center">
              <p className="text-[13px] text-[#31353A]/70 tracking-wider mb-5"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                請先登入，才能查看與購買點數 🐾
              </p>
              <button
                onClick={() => login()}
                className="px-8 py-3 text-[12px] tracking-[0.25em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                登入
              </button>
            </div>
          ) : (
            <>
              <div className="glass-panel rounded-2xl p-5 border border-[#D1BE9B]/20 mb-8 text-center">
                <p className="text-[12px] tracking-[0.2em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  目前餘額 <span className="text-[#31353A]/85 text-base">{credits?.credits ?? 0}</span> 點
                  {credits && credits.freeRemaining > 0 && ` · 今日還有 ${credits.freeRemaining} 次免費`}
                </p>
                <p className="mt-3 text-[11px] leading-[1.9] tracking-[0.12em] text-[#31353A]/48"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  免費額度每日 00:00 重置，已購買點數不會被清空；塔羅、紫微、每日運勢會先消耗免費額度，用完後每次扣 1 點。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PACKAGES.map((p) => (
                  <a
                    key={p.credits}
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 text-center flex flex-col items-center gap-3 hover:border-[#D1BE9B]/60 hover:scale-[1.02] transition-all duration-300 cursor-pointer no-underline"
                  >
                    <span className="text-[10px] tracking-[0.2em] text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{p.tag}</span>
                    <div className="text-2xl font-extralight text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>{p.credits} 點</div>
                    <div className="text-[13px] text-[#31353A]/70" style={{ fontFamily: 'Noto Serif TC, serif' }}>{p.price}</div>
                    <span className="mt-2 px-6 py-2 text-[11px] tracking-[0.2em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      購買
                    </span>
                  </a>
                ))}
              </div>

              <p className="text-center text-[11px] text-[#31353A]/45 tracking-wider mb-2"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                結帳會在 Gumroad 安全頁面進行，付款完成後點數會自動加到你的帳號 🐾
              </p>
              <p className="text-center text-[10px] text-[#31353A]/35 tracking-wider"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                請在結帳頁面選擇上面對應的方案
              </p>

              {isAdmin && (
                <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/30 mt-10">
                  <p className="text-[12px] tracking-[0.2em] text-[#A38D6B] mb-4"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    管理員手動加值（測試用）
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={topupEmail}
                      onChange={(e) => setTopupEmail(e.target.value)}
                      placeholder="顧客 email"
                      className="flex-1 bg-white/60 border border-[#D1BE9B]/30 rounded-lg px-3 py-2 text-[13px] text-[#31353A]/80"
                    />
                    <input
                      type="number"
                      value={topupAmount}
                      min={1}
                      onChange={(e) => setTopupAmount(Number(e.target.value))}
                      className="w-24 bg-white/60 border border-[#D1BE9B]/30 rounded-lg px-3 py-2 text-[13px] text-[#31353A]/80"
                    />
                    <button
                      onClick={() => topup.mutate({ email: topupEmail, amount: topupAmount })}
                      disabled={topup.isPending || !topupEmail}
                      className="px-6 py-2 text-[12px] tracking-[0.2em] bg-[#31353A] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all disabled:opacity-40"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      加值
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
