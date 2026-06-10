/**
 * SOUL EASE | Mochi．crystal — 我的紀錄
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Shows user's past readings (tarot, ziwei, fortune).
 * Requires login.
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Streamdown } from 'streamdown';

const TYPE_LABELS: Record<string, string> = {
  tarot: '塔羅牌占卜',
  ziwei: '紫微斗數',
  fortune: '每日運勢',
};

const TYPE_ICONS: Record<string, string> = {
  tarot: '🔮',
  ziwei: '☯',
  fortune: '☀',
};

const HOURS = [
  { label: '子時 (23:00-01:00)', value: '0' },
  { label: '丑時 (01:00-03:00)', value: '1' },
  { label: '寅時 (03:00-05:00)', value: '2' },
  { label: '卯時 (05:00-07:00)', value: '3' },
  { label: '辰時 (07:00-09:00)', value: '4' },
  { label: '巳時 (09:00-11:00)', value: '5' },
  { label: '午時 (11:00-13:00)', value: '6' },
  { label: '未時 (13:00-15:00)', value: '7' },
  { label: '申時 (15:00-17:00)', value: '8' },
  { label: '酉時 (17:00-19:00)', value: '9' },
  { label: '戌時 (19:00-21:00)', value: '10' },
  { label: '亥時 (21:00-23:00)', value: '11' },
] as const;

type HourValue = typeof HOURS[number]['value'];

function isHourValue(value: string | null | undefined): value is HourValue {
  return HOURS.some((hour) => hour.value === value);
}

export default function HistoryPage() {
  const { user, isAuthenticated, loading: authLoading, refresh } = useAuth();
  const utils = trpc.useUtils();
  const [profileName, setProfileName] = useState('');
  const [profileBirthDate, setProfileBirthDate] = useState('');
  const [profileBirthTime, setProfileBirthTime] = useState<HourValue | ''>('');
  const [profileGender, setProfileGender] = useState<'男' | '女' | ''>('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const readingsQuery = trpc.history.getReadings.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async (updatedUser) => {
      utils.auth.me.setData(undefined, updatedUser);
      await refresh();
      setProfileMessage('已儲存會員資料');
    },
    onError: () => {
      setProfileMessage('暫時無法儲存，請稍後再試');
    },
  });

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name ?? '');
    setProfileBirthDate(user.birthDate ?? '');
    setProfileBirthTime(isHourValue(user.birthTime) ? user.birthTime : '');
    setProfileGender(user.gender === '男' || user.gender === '女' ? user.gender : '');
  }, [user]);

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);
    updateProfileMutation.mutate({
      name: profileName.trim() || null,
      birthDate: profileBirthDate || null,
      birthTime: profileBirthTime || null,
      gender: profileGender || null,
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#D1BE9B]/40 border-t-[#D1BE9B] animate-spin" />
            <p className="text-xs tracking-[0.2em] text-[#31353A]/54"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              載入中⋯
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="text-4xl mb-6 opacity-40">✦</div>
          <h2 className="text-xl tracking-[0.2em] text-[#31353A]/75 mb-3"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
            請先登入
          </h2>
          <p className="text-xs tracking-[0.15em] text-[#31353A]/54 mb-8 max-w-xs leading-[2]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
            登入後即可查看你的占卜與運勢紀錄。
          </p>
          <a href={getLoginUrl()}>
            <button
              className="px-8 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              登入 Manus
            </button>
          </a>
        </div>
      </PageLayout>
    );
  }

  const readings = readingsQuery.data ?? [];

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              My Records
            </span>
            <h1 className="text-3xl tracking-[0.2em] font-extralight text-[#31353A] mt-3 mb-3"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
              我的紀錄
            </h1>
            <p className="text-xs italic text-[#31353A]/54 tracking-[0.15em]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Every reading is a conversation with the universe."
            </p>
          </div>

          {/* Profile */}
          <form
            onSubmit={handleProfileSubmit}
            className="glass-panel rounded-2xl border border-[#D1BE9B]/20 p-5 mb-8 animate-fade-in-up"
          >
            <div className="flex flex-col gap-1 mb-5">
              <p className="text-[12px] tracking-[0.22em] text-[#8A7250]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                會員資料
              </p>
              <p className="text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/48"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                這些資料會作為紫微排盤的預設值，之後可以少填一點。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] tracking-[0.18em] text-[#31353A]/54"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  暱稱
                </span>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value.slice(0, 60))}
                  placeholder="想讓 Mochi 怎麼稱呼你"
                  className="rounded-xl border border-[#D1BE9B]/22 bg-white/50 px-3.5 py-2.5 text-[12px] tracking-[0.08em] text-[#31353A]/78 outline-none transition-colors placeholder:text-[#31353A]/30 focus:border-[#D1BE9B]/55"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] tracking-[0.18em] text-[#31353A]/54"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  陽曆生日
                </span>
                <input
                  type="date"
                  value={profileBirthDate}
                  onChange={(event) => setProfileBirthDate(event.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="rounded-xl border border-[#D1BE9B]/22 bg-white/50 px-3.5 py-2.5 text-[12px] tracking-[0.08em] text-[#31353A]/78 outline-none transition-colors focus:border-[#D1BE9B]/55"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] tracking-[0.18em] text-[#31353A]/54"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  出生時辰
                </span>
                <select
                  value={profileBirthTime}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setProfileBirthTime(isHourValue(nextValue) ? nextValue : '');
                  }}
                  className="rounded-xl border border-[#D1BE9B]/22 bg-white/50 px-3.5 py-2.5 text-[12px] tracking-[0.08em] text-[#31353A]/78 outline-none transition-colors focus:border-[#D1BE9B]/55"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  <option value="">尚未填寫</option>
                  {HOURS.map((hour) => (
                    <option key={hour.value} value={hour.value}>{hour.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] tracking-[0.18em] text-[#31353A]/54"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  性別
                </span>
                <select
                  value={profileGender}
                  onChange={(event) => setProfileGender(event.target.value as '男' | '女' | '')}
                  className="rounded-xl border border-[#D1BE9B]/22 bg-white/50 px-3.5 py-2.5 text-[12px] tracking-[0.08em] text-[#31353A]/78 outline-none transition-colors focus:border-[#D1BE9B]/55"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                >
                  <option value="">尚未填寫</option>
                  <option value="女">女命</option>
                  <option value="男">男命</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={`min-h-4 text-[11px] tracking-[0.1em] ${
                profileMessage?.includes('無法') ? 'text-[#C9837A]' : 'text-[#31353A]/45'
              }`}
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                {profileMessage ?? ''}
              </p>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-full bg-[#3D4144] px-6 py-2.5 text-[11px] tracking-[0.18em] text-[#FAF7F4] transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-45"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                {updateProfileMutation.isPending ? '儲存中' : '儲存資料'}
              </button>
            </div>
          </form>

          {/* Readings Content */}
          <div>
            {readingsQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-[#D1BE9B]/40 border-t-[#D1BE9B] animate-spin" />
              </div>
            ) : readingsQuery.isError ? (
              <div className="text-center py-16">
                <div className="text-3xl mb-4 opacity-25">⚠️</div>
                <p className="text-xs tracking-[0.2em] text-[#31353A]/62"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  載入失敗，請稍後再試
                </p>
                <button
                  onClick={() => readingsQuery.refetch()}
                  className="mt-4 px-5 py-2 text-xs tracking-[0.15em] border border-[#D1BE9B]/30 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-300"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  重試
                </button>
              </div>
            ) : readings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-3xl mb-4 opacity-25">🔮</div>
                <p className="text-xs tracking-[0.2em] text-[#31353A]/50"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  還沒有占卜紀錄
                </p>
                <p className="text-[11px] tracking-[0.15em] text-[#31353A]/42 mt-2 mb-6"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  開始你的第一次占卜吧！
                </p>
                <Link href="/tarot">
                  <button
                    className="px-6 py-2 text-xs tracking-[0.2em] border border-[#D1BE9B]/30 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    前往塔羅占卜
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {readings.map(r => (
                  <div
                    key={r.id}
                    className="glass-panel rounded-2xl p-5 border border-[#D1BE9B]/20 animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_ICONS[r.type] ?? '✦'}</span>
                        <div>
                          <p className="text-xs tracking-[0.15em] text-[#31353A]/82"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {TYPE_LABELS[r.type] ?? r.type}
                          </p>
                          {r.question && (
                            <p className="text-[11px] tracking-[0.1em] text-[#D1BE9B] mt-0.5 italic"
                              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              「{r.question}」
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] tracking-[0.1em] text-[#31353A]/46 flex-shrink-0 ml-2"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        {new Date(r.createdAt).toLocaleDateString('zh-TW', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>

                    {r.interpretation && (
                      <details className="group">
                        <summary className="cursor-pointer text-[11px] tracking-[0.15em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors list-none flex items-center gap-1"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          <span className="group-open:rotate-90 transition-transform duration-200 inline-block">▶</span>
                          查看解讀內容
                        </summary>
                        <div className="mt-3 pt-3 border-t border-[#D1BE9B]/15">
                          <div className="text-[12px] leading-[2] text-[#31353A]/72 tracking-wider prose-sm max-w-none"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            <Streamdown>{r.interpretation}</Streamdown>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
