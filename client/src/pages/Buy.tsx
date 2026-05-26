import { useState } from 'react';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const PACKAGES = [
  { credits: 30, price: 'NT$60', tag: '輕巧' },
  { credits: 100, price: 'NT$180', tag: '最受歡迎' },
  { credits: 300, price: 'NT$480', tag: '超值' },
];

export default function BuyPage() {
  const { user, isAuthenticated, login } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, { enabled: isAuthenticated });
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
              每日有免費次數，用完後每次占卜消耗 1 點
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
                使用 Google 登入
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {PACKAGES.map((p) => (
                  <div key={p.credits}
                    className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/20 text-center flex flex-col items-center gap-3">
                    <span className="text-[10px] tracking-[0.2em] text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{p.tag}</span>
                    <div className="text-2xl font-extralight text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>{p.credits} 點</div>
                    <div className="text-[13px] text-[#31353A]/70" style={{ fontFamily: 'Noto Serif TC, serif' }}>{p.price}</div>
                    <button
                      disabled
                      className="mt-2 px-6 py-2 text-[11px] tracking-[0.2em] border border-[#D1BE9B]/40 text-[#31353A]/40 rounded-full cursor-not-allowed"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      金流整合中
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-center text-[11px] text-[#31353A]/45 tracking-wider"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                線上付款功能即將開放，敬請期待 🐾
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
