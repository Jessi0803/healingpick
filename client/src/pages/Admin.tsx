import { Fragment, FormEvent, useEffect, useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const tabs = [
  { id: 'users', label: '會員管理' },
  { id: 'email', label: '寄會員 Email' },
  { id: 'orders', label: '訂單管理' },
  { id: 'inputs', label: '會員問答' },
  { id: 'visitors', label: '訪客問答' },
  { id: 'feedbacks', label: '顧客回饋' },
  { id: 'transactions', label: '點數紀錄' },
] as const;

type TabId = typeof tabs[number]['id'];
const DAILY_FREE_QUOTA_MAX = 100;

const typeLabels: Record<string, string> = {
  tarot: '塔羅',
  ziwei: '紫微',
  fortune: '每日運勢',
  dream: 'Mochi 解夢',
};

function getReadingKind(row: Pick<AdminReadingRow, 'type' | 'inputData'>) {
  if (row.inputData) {
    try {
      const parsed = JSON.parse(row.inputData) as { recordKind?: string };
      if (parsed.recordKind === 'tarot_followup') return '塔羅追問';
      if (parsed.recordKind === 'ziwei_followup') return '紫微追問';
    } catch {
      // Older records may store plain text instead of JSON.
    }
  }
  return typeLabels[row.type] ?? row.type;
}

type AdminUserRow = {
  id: number;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  loginMethod: string | null;
  adminNote: string | null;
  credits: number;
  freeUsedToday: number;
  createdAt: Date;
  lastSignedIn: Date;
};

type AdminTransactionRow = {
  id: number;
  userId: number;
  email: string | null;
  name: string | null;
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: Date;
};

type AdminReadingRow = {
  id: number;
  userId: number | null;
  anonId: string | null;
  ipHash: string | null;
  email: string | null;
  name: string | null;
  type: string;
  question: string | null;
  inputData: string | null;
  interpretation: string | null;
  createdAt: Date;
};

type ParsedReadingInput = {
  recordKind?: string;
  dreamContent?: string;
  wakeEmotion?: string | null;
  recentStatus?: string | null;
};

type AdminFeedbackRow = {
  id: number;
  userId: number | null;
  email: string | null;
  name: string | null;
  source: 'tarot' | 'ziwei';
  message: string;
  context: string | null;
  createdAt: Date;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortText(value: string | null | undefined, max = 90) {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function parseReadingInputData(inputData: string | null | undefined): ParsedReadingInput | null {
  if (!inputData) return null;
  try {
    const parsed = JSON.parse(inputData);
    return parsed && typeof parsed === 'object' ? parsed as ParsedReadingInput : null;
  } catch {
    return null;
  }
}

function getReadingPreview(row: AdminReadingRow) {
  const parsed = parseReadingInputData(row.inputData);
  if (row.type === 'dream' && parsed?.dreamContent) {
    return parsed.dreamContent;
  }
  return row.question || row.inputData;
}

function isVisitor(row: Pick<AdminReadingRow, 'userId'>) {
  return row.userId == null;
}

function readerLabel(row: Pick<AdminReadingRow, 'userId' | 'email' | 'name' | 'anonId' | 'ipHash'>) {
  if (row.userId != null) return row.email ?? row.name ?? `會員 #${row.userId}`;
  if (row.anonId) return `訪客 ${row.anonId.slice(0, 8)}`;
  if (row.ipHash) return `訪客 IP ${row.ipHash.slice(0, 8)}`;
  return '訪客';
}

function feedbackReaderLabel(row: Pick<AdminFeedbackRow, 'userId' | 'email' | 'name'>) {
  if (row.userId != null) return row.email ?? row.name ?? `會員 #${row.userId}`;
  return '未登入使用者';
}

function reasonLabel(reason: string) {
  if (reason === 'signup_bonus') return '註冊贈點';
  if (reason === 'admin_topup') return '管理員加值';
  if (reason === 'admin_adjustment') return '管理員調整';
  if (reason.startsWith('gumroad:')) return '金流訂單';
  if (reason === 'tarot') return '塔羅扣點';
  if (reason === 'ziwei') return '紫微扣點';
  if (reason === 'fortune') return '每日運勢扣點';
  if (reason === 'dream') return 'Mochi 解夢扣點';
  return reason;
}

export default function AdminPage() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [query, setQuery] = useState('');
  const [dailyFreeQuotaInput, setDailyFreeQuotaInput] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [userActionMessage, setUserActionMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const dashboardQuery = trpc.admin.dashboard.useQuery(
    { limit: 150, tab: activeTab },
    { enabled: user?.role === 'admin', refetchOnWindowFocus: true }
  );
  const updateDailyFreeQuotaMutation = trpc.admin.updateDailyFreeQuota.useMutation({
    onSuccess: async (result) => {
      setDailyFreeQuotaInput(String(result.dailyFreeQuota));
      setSettingsMessage('已更新今日免費點數');
      await Promise.all([
        dashboardQuery.refetch(),
        utils.credits.state.invalidate(),
      ]);
    },
    onError: () => {
      setSettingsMessage('更新失敗，請稍後再試');
    },
  });
  const updateUserCreditsMutation = trpc.admin.updateUserCredits.useMutation({
    onSuccess: async (result) => {
      setUserActionMessage(`已更新會員 #${result.userId} 點數為 ${result.credits}`);
      await Promise.all([
        dashboardQuery.refetch(),
        utils.credits.state.invalidate(),
      ]);
    },
    onError: (error) => {
      setUserActionMessage(error.message || '點數更新失敗，請稍後再試');
    },
  });
  const updateUserNoteMutation = trpc.admin.updateUserNote.useMutation({
    onSuccess: async (result) => {
      setUserActionMessage(`已更新會員 #${result.userId} 備註`);
      await dashboardQuery.refetch();
    },
    onError: (error) => {
      setUserActionMessage(error.message || '備註更新失敗，請稍後再試');
    },
  });
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: async (result) => {
      const label = result.email ?? result.name ?? `會員 #${result.id}`;
      setUserActionMessage(`已刪除 ${label}`);
      await dashboardQuery.refetch();
    },
    onError: (error) => {
      setUserActionMessage(error.message || '刪除會員失敗，請稍後再試');
    },
  });
  const sendMemberEmailMutation = trpc.admin.sendMemberEmail.useMutation({
    onSuccess: (result) => {
      setEmailMessage(`已送出 ${result.sent}/${result.attempted} 封${result.failed > 0 ? `，失敗 ${result.failed} 封` : ''}`);
      if (result.failed === 0) {
        setEmailSubject('');
        setEmailContent('');
      }
    },
    onError: (error) => {
      setEmailMessage(error.message || 'Email 寄送失敗，請稍後再試');
    },
  });

  const normalizedQuery = query.trim().toLowerCase();
  const data = dashboardQuery.data;

  useEffect(() => {
    if (data?.settings.dailyFreeQuota != null && !updateDailyFreeQuotaMutation.isPending) {
      setDailyFreeQuotaInput(String(data.settings.dailyFreeQuota));
    }
  }, [data?.settings.dailyFreeQuota, updateDailyFreeQuotaMutation.isPending]);

  const handleDailyFreeQuotaSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(dailyFreeQuotaInput.trim());
    if (!dailyFreeQuotaInput.trim()) {
      setSettingsMessage(`每日免費額度請輸入 1-${DAILY_FREE_QUOTA_MAX} 次`);
      return;
    }
    if (!Number.isInteger(value) || value < 1 || value > DAILY_FREE_QUOTA_MAX) {
      setSettingsMessage(`每日免費額度請輸入 1-${DAILY_FREE_QUOTA_MAX} 次`);
      return;
    }
    setSettingsMessage('');
    updateDailyFreeQuotaMutation.mutate({ dailyFreeQuota: value });
  };

  const handleMemberEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = emailSubject.trim();
    const content = emailContent.trim();
    if (!subject || !content) {
      setEmailMessage('請輸入主旨與內容');
      return;
    }

    const confirmed = window.confirm(
      `確定要寄出這封 email 給所有有 email 的會員嗎？\n\n主旨：${subject}`
    );
    if (!confirmed) return;

    setEmailMessage('');
    sendMemberEmailMutation.mutate({ subject, content });
  };

  const handleUpdateUserCredits = (row: AdminUserRow, credits: number) => {
    const label = row.email ?? row.name ?? `會員 #${row.id}`;
    const confirmed = window.confirm(`確定要將 ${label} 的點數調整為 ${credits} 嗎？`);
    if (!confirmed) return;

    setUserActionMessage('');
    updateUserCreditsMutation.mutate({ userId: row.id, credits });
  };

  const handleUpdateUserNote = (row: AdminUserRow, adminNote: string) => {
    setUserActionMessage('');
    updateUserNoteMutation.mutate({ userId: row.id, adminNote });
  };

  const handleDeleteUser = (row: AdminUserRow) => {
    const label = row.email ?? row.name ?? `會員 #${row.id}`;
    const confirmed = window.confirm(
      `確定要刪除 ${label} 嗎？\n\n這會移除會員帳號，但既有訂單、點數紀錄與問答紀錄會保留在後台。`
    );
    if (!confirmed) return;

    setUserActionMessage('');
    deleteUserMutation.mutate({ userId: row.id });
  };

  const filteredUsers = useMemo(() => {
    const rows = data?.users ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, String(row.id)].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.users, normalizedQuery]);

  const filteredOrders = useMemo(() => {
    const rows = data?.orders ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, row.reason, String(row.userId)].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.orders, normalizedQuery]);

  const filteredReadings = useMemo(() => {
    const rows = data?.readings ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, row.type, row.question, row.inputData, row.anonId].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.readings, normalizedQuery]);

  const memberReadings = useMemo(
    () => filteredReadings.filter((row) => !isVisitor(row)),
    [filteredReadings]
  );
  const visitorReadings = useMemo(
    () => filteredReadings.filter((row) => isVisitor(row)),
    [filteredReadings]
  );

  const filteredTransactions = useMemo(() => {
    const rows = data?.transactions ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, row.reason, String(row.userId)].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.transactions, normalizedQuery]);

  const filteredFeedbacks = useMemo(() => {
    const rows = data?.feedbacks ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, row.source, typeLabels[row.source], row.message, row.context, String(row.userId)].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.feedbacks, normalizedQuery]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#D1BE9B]/40 border-t-[#D1BE9B] animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <PageLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl tracking-[0.2em] text-[#31353A]/80 mb-4"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
            後台權限不足
          </h1>
          <p className="text-xs leading-[2] tracking-[0.15em] text-[#31353A]/54 max-w-sm"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
            這個頁面只開放管理員帳號查看。
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen px-4 py-12 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[11px] tracking-[0.35em] text-[#D1BE9B] uppercase"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                Admin
              </span>
              <h1 className="mt-3 text-3xl tracking-[0.18em] text-[#31353A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                管理後台
              </h1>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋 email、姓名、訂單、輸入內容"
                className="min-w-0 rounded-lg border border-[#D1BE9B]/25 bg-white/65 px-4 py-2.5 text-xs tracking-[0.12em] text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60 sm:w-80"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              />
              <button
                onClick={() => dashboardQuery.refetch()}
                className="rounded-lg border border-[#D1BE9B]/30 px-4 py-2.5 text-xs tracking-[0.16em] text-[#A38D6B] transition hover:bg-[#D1BE9B]/15"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                重新整理
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 mb-6">
            <Metric label="會員數" value={data?.stats.users ?? 0} />
            <Metric label="占卜紀錄" value={data?.stats.readings ?? 0} />
            <Metric label="訪客數" value={data?.stats.visitors ?? 0} />
            <Metric label="訪客問答" value={data?.stats.visitorReadings ?? 0} />
            <Metric label="金流訂單" value={data?.stats.purchases ?? 0} />
            <Metric label="售出點數" value={data?.stats.creditsSold ?? 0} />
          </div>

          <form
            onSubmit={handleDailyFreeQuotaSubmit}
            className="mb-6 rounded-lg border border-[#D1BE9B]/20 bg-white/55 p-4 shadow-[0_12px_40px_rgba(49,53,58,0.05)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] tracking-[0.2em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  免費點數設定
                </p>
                <p className="mt-2 text-xs leading-[1.8] tracking-[0.08em] text-[#31353A]/58">
                  每位顧客每天共可免費使用 {data?.settings.dailyFreeQuota ?? 2} 次；訪客可匿名使用第 1 次，第 2 次起需登入。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min={1}
                  max={DAILY_FREE_QUOTA_MAX}
                  step={1}
                  value={dailyFreeQuotaInput}
                  onChange={(event) => {
                    setDailyFreeQuotaInput(event.target.value);
                    setSettingsMessage('');
                  }}
                  className="w-full rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-2.5 text-xs tracking-[0.12em] text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60 sm:w-32"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                />
                <button
                  type="submit"
                  disabled={updateDailyFreeQuotaMutation.isPending}
                  className="rounded-lg border border-[#D1BE9B]/30 bg-[#31353A] px-4 py-2.5 text-xs tracking-[0.16em] text-[#FAF7F4] transition hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {updateDailyFreeQuotaMutation.isPending ? '儲存中' : '儲存'}
                </button>
              </div>
            </div>
            {settingsMessage && (
              <p className={`mt-3 text-[11px] tracking-[0.12em] ${
                updateDailyFreeQuotaMutation.isError ? 'text-[#C9837A]' : 'text-[#A38D6B]'
              }`}>
                {settingsMessage}
              </p>
            )}
          </form>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg border px-4 py-2 text-xs tracking-[0.16em] transition ${
                  activeTab === tab.id
                    ? 'border-[#D1BE9B]/60 bg-[#31353A] text-[#FAF7F4]'
                    : 'border-[#D1BE9B]/25 bg-white/45 text-[#31353A]/62 hover:text-[#A38D6B]'
                }`}
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {dashboardQuery.isLoading ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-[#D1BE9B]/40 border-t-[#D1BE9B] animate-spin" />
            </div>
          ) : dashboardQuery.isError ? (
            <div className="rounded-lg border border-[#C9837A]/25 bg-white/55 p-6 text-center text-sm text-[#C9837A]">
              後台資料載入失敗，請稍後再試。
            </div>
          ) : (
            <div className="rounded-lg border border-[#D1BE9B]/20 bg-white/55 shadow-[0_12px_40px_rgba(49,53,58,0.06)] overflow-hidden">
              {activeTab === 'users' && (
                <UsersTable
                  rows={filteredUsers}
                  dailyFreeQuota={data?.settings.dailyFreeQuota ?? 2}
                  adjustingUserId={updateUserCreditsMutation.variables?.userId ?? null}
                  isAdjusting={updateUserCreditsMutation.isPending}
                  deletingUserId={deleteUserMutation.variables?.userId ?? null}
                  isDeleting={deleteUserMutation.isPending}
                  savingNoteUserId={updateUserNoteMutation.variables?.userId ?? null}
                  isSavingNote={updateUserNoteMutation.isPending}
                  message={userActionMessage}
                  currentUserId={user.id}
                  onUpdateCredits={handleUpdateUserCredits}
                  onUpdateNote={handleUpdateUserNote}
                  onDeleteUser={handleDeleteUser}
                />
              )}
              {activeTab === 'email' && (
                <form onSubmit={handleMemberEmailSubmit} className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[11px] tracking-[0.2em] text-[#A38D6B]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          會員 Email
                        </p>
                        <p className="mt-2 text-xs leading-[1.8] tracking-[0.08em] text-[#31353A]/58">
                          寄給所有有 email 的會員；送出前會再次確認。
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={sendMemberEmailMutation.isPending}
                        className="rounded-lg border border-[#D1BE9B]/30 bg-[#31353A] px-4 py-2.5 text-xs tracking-[0.16em] text-[#FAF7F4] transition hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-55"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        {sendMemberEmailMutation.isPending ? '寄送中' : '寄給會員'}
                      </button>
                    </div>
                    <input
                      value={emailSubject}
                      onChange={(event) => {
                        setEmailSubject(event.target.value);
                        setEmailMessage('');
                      }}
                      maxLength={160}
                      placeholder="Email 主旨"
                      className="rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-2.5 text-xs tracking-[0.08em] text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    />
                    <textarea
                      value={emailContent}
                      onChange={(event) => {
                        setEmailContent(event.target.value);
                        setEmailMessage('');
                      }}
                      maxLength={12000}
                      rows={8}
                      placeholder="Email 內容。空一行會變成下一段。"
                      className="min-h-44 resize-y rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-3 text-xs leading-[1.8] tracking-[0.06em] text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    />
                    <div className="flex flex-col gap-2 text-[11px] tracking-[0.1em] text-[#31353A]/42 sm:flex-row sm:items-center sm:justify-between">
                      <span>{emailContent.length}/12000</span>
                      {emailMessage && (
                        <span className={sendMemberEmailMutation.isError ? 'text-[#C9837A]' : 'text-[#A38D6B]'}>
                          {emailMessage}
                        </span>
                      )}
                    </div>
                  </div>
                </form>
              )}
              {activeTab === 'orders' && <OrdersTable rows={filteredOrders} />}
              {activeTab === 'inputs' && <ReadingsTable rows={memberReadings} />}
              {activeTab === 'visitors' && <ReadingsTable rows={visitorReadings} />}
              {activeTab === 'feedbacks' && <FeedbacksTable rows={filteredFeedbacks} />}
              {activeTab === 'transactions' && <TransactionsTable rows={filteredTransactions} />}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#D1BE9B]/20 bg-white/55 px-4 py-4">
      <p className="text-[11px] tracking-[0.18em] text-[#31353A]/45"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
        {label}
      </p>
      <p className="mt-2 text-2xl text-[#31353A]/85"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {value.toLocaleString('zh-TW')}
      </p>
    </div>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-xs tracking-[0.16em] text-[#31353A]/42">
        沒有資料
      </td>
    </tr>
  );
}

function UsersTable({
  rows,
  dailyFreeQuota,
  adjustingUserId,
  isAdjusting,
  deletingUserId,
  isDeleting,
  savingNoteUserId,
  isSavingNote,
  message,
  currentUserId,
  onUpdateCredits,
  onUpdateNote,
  onDeleteUser,
}: {
  rows: AdminUserRow[];
  dailyFreeQuota: number;
  adjustingUserId: number | null;
  isAdjusting: boolean;
  deletingUserId: number | null;
  isDeleting: boolean;
  savingNoteUserId: number | null;
  isSavingNote: boolean;
  message: string;
  currentUserId: number;
  onUpdateCredits: (row: AdminUserRow, credits: number) => void;
  onUpdateNote: (row: AdminUserRow, adminNote: string) => void;
  onDeleteUser: (row: AdminUserRow) => void;
}) {
  const [creditInputs, setCreditInputs] = useState<Record<number, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const selectedUser = rows.find((row) => row.id === expandedUserId) ?? null;
  const userReadingsQuery = trpc.admin.userReadings.useQuery(
    { userId: expandedUserId ?? 0, limit: 100 },
    { enabled: expandedUserId != null }
  );

  useEffect(() => {
    setCreditInputs((current) => {
      const next: Record<number, string> = {};
      for (const row of rows) {
        next[row.id] = current[row.id] ?? String(row.credits);
      }
      return next;
    });
  }, [rows]);

  useEffect(() => {
    setNoteInputs((current) => {
      const next: Record<number, string> = {};
      for (const row of rows) {
        next[row.id] = current[row.id] ?? row.adminNote ?? '';
      }
      return next;
    });
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1320px] text-left">
        <thead className="bg-[#D1BE9B]/10 text-[11px] tracking-[0.14em] text-[#A38D6B]">
          <tr>
            <th className="px-4 py-3 font-normal">ID</th>
            <th className="px-4 py-3 font-normal">會員</th>
            <th className="px-4 py-3 font-normal">角色</th>
            <th className="px-4 py-3 font-normal">點數</th>
            <th className="px-4 py-3 font-normal">今日免費剩餘</th>
            <th className="px-4 py-3 font-normal">註冊時間</th>
            <th className="px-4 py-3 font-normal">最後登入</th>
            <th className="px-4 py-3 font-normal">備註</th>
            <th className="px-4 py-3 font-normal">歷史</th>
            <th className="px-4 py-3 font-normal">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D1BE9B]/12 text-xs text-[#31353A]/72">
          {message && (
            <tr>
              <td colSpan={10} className="px-4 py-3 text-[11px] tracking-[0.12em] text-[#A38D6B]">
                {message}
              </td>
            </tr>
          )}
          {rows.length === 0 ? <EmptyRow colSpan={10} /> : rows.map((row) => {
            const inputValue = creditInputs[row.id] ?? String(row.credits);
            const noteValue = noteInputs[row.id] ?? row.adminNote ?? '';
            const parsedCredits = Number(inputValue.trim());
            const canSaveCredits =
              inputValue.trim() !== '' &&
              Number.isInteger(parsedCredits) &&
              parsedCredits >= 0 &&
              parsedCredits <= 100000 &&
              parsedCredits !== row.credits &&
              !isAdjusting;
            const canSaveNote =
              noteValue.trim() !== (row.adminNote ?? '') &&
              noteValue.length <= 2000 &&
              !isSavingNote;
            const isRowAdjusting = isAdjusting && adjustingUserId === row.id;
            const isRowSavingNote = isSavingNote && savingNoteUserId === row.id;
            const isCurrentUser = row.id === currentUserId;
            const isRowDeleting = isDeleting && deletingUserId === row.id;
            const isExpanded = expandedUserId === row.id;
            const freeRemaining = Math.max(0, dailyFreeQuota - row.freeUsedToday);
            return (
            <Fragment key={row.id}>
              <tr key={row.id} className={isExpanded ? 'bg-[#D1BE9B]/5' : undefined}>
                <td className="px-4 py-3">{row.id}</td>
                <td className="px-4 py-3">
                  <div>{row.email ?? '—'}</div>
                  <div className="mt-1 text-[11px] text-[#31353A]/42">{row.name ?? row.loginMethod ?? '—'}</div>
                </td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      step={1}
                      value={inputValue}
                      onChange={(event) => {
                        setCreditInputs((current) => ({
                          ...current,
                          [row.id]: event.target.value,
                        }));
                      }}
                      className="w-24 rounded-md border border-[#D1BE9B]/25 bg-white/70 px-3 py-1.5 text-xs text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    />
                    <button
                      type="button"
                      disabled={!canSaveCredits}
                      onClick={() => onUpdateCredits(row, parsedCredits)}
                      className="rounded-md border border-[#D1BE9B]/30 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#A38D6B] transition hover:bg-[#D1BE9B]/12 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {isRowAdjusting ? '儲存中' : '儲存'}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{freeRemaining}/{dailyFreeQuota}</td>
                <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">{formatDate(row.lastSignedIn)}</td>
                <td className="px-4 py-3">
                  <div className="flex min-w-64 flex-col gap-2">
                    <textarea
                      value={noteValue}
                      maxLength={2000}
                      rows={3}
                      onChange={(event) => {
                        setNoteInputs((current) => ({
                          ...current,
                          [row.id]: event.target.value,
                        }));
                      }}
                      placeholder="寫給自己的會員小筆記"
                      className="min-h-20 resize-y rounded-md border border-[#D1BE9B]/25 bg-white/70 px-3 py-2 text-xs leading-[1.7] text-[#31353A]/75 outline-none focus:border-[#D1BE9B]/60"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] tracking-[0.08em] text-[#31353A]/38">
                        {noteValue.length}/2000
                      </span>
                      <button
                        type="button"
                        disabled={!canSaveNote}
                        onClick={() => onUpdateNote(row, noteValue)}
                        className="rounded-md border border-[#D1BE9B]/30 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#A38D6B] transition hover:bg-[#D1BE9B]/12 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        {isRowSavingNote ? '儲存中' : '儲存備註'}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedUserId(isExpanded ? null : row.id)}
                    className="rounded-md border border-[#D1BE9B]/30 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#A38D6B] transition hover:bg-[#D1BE9B]/12"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {isExpanded ? '收合' : '歷史問答'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={isCurrentUser || isDeleting}
                    onClick={() => onDeleteUser(row)}
                    className="rounded-md border border-[#C9837A]/30 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#C9837A] transition hover:bg-[#C9837A]/10 disabled:cursor-not-allowed disabled:opacity-40"
                    title={isCurrentUser ? '不能刪除目前登入中的管理員帳號' : '刪除會員'}
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  >
                    {isRowDeleting ? '刪除中' : '刪除'}
                  </button>
                </td>
              </tr>
              {isExpanded && (
                <tr key={`${row.id}-readings`}>
                  <td colSpan={10} className="bg-[#FAF7F4]/70 px-4 py-4">
                    <UserReadingHistory
                      user={selectedUser}
                      rows={userReadingsQuery.data ?? []}
                      isLoading={userReadingsQuery.isLoading || userReadingsQuery.isFetching}
                      isError={userReadingsQuery.isError}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          )})}
        </tbody>
      </table>
    </div>
  );
}

function UserReadingHistory({
  user,
  rows,
  isLoading,
  isError,
}: {
  user: AdminUserRow | null;
  rows: AdminReadingRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  const label = user?.email ?? user?.name ?? (user ? `會員 #${user.id}` : '會員');

  return (
    <div className="rounded-lg border border-[#D1BE9B]/18 bg-white/60">
      <div className="flex flex-col gap-1 border-b border-[#D1BE9B]/12 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#A38D6B]">歷史問答</p>
          <p className="mt-1 text-xs tracking-[0.08em] text-[#31353A]/55">{label}</p>
        </div>
        <p className="text-[11px] tracking-[0.1em] text-[#31353A]/42">
          最新 {rows.length.toLocaleString('zh-TW')} 筆
        </p>
      </div>
      {isLoading ? (
        <div className="px-4 py-8 text-center text-xs tracking-[0.16em] text-[#31353A]/42">載入中</div>
      ) : isError ? (
        <div className="px-4 py-8 text-center text-xs tracking-[0.16em] text-[#C9837A]">歷史問答載入失敗</div>
      ) : (
        <ReadingsTable rows={rows} />
      )}
    </div>
  );
}

function OrdersTable({ rows }: { rows: AdminTransactionRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left">
        <thead className="bg-[#D1BE9B]/10 text-[11px] tracking-[0.14em] text-[#A38D6B]">
          <tr>
            <th className="px-4 py-3 font-normal">訂單</th>
            <th className="px-4 py-3 font-normal">會員</th>
            <th className="px-4 py-3 font-normal">加值點數</th>
            <th className="px-4 py-3 font-normal">加值後餘額</th>
            <th className="px-4 py-3 font-normal">時間</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D1BE9B]/12 text-xs text-[#31353A]/72">
          {rows.length === 0 ? <EmptyRow colSpan={5} /> : rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{row.reason.replace('gumroad:', '')}</td>
              <td className="px-4 py-3">
                <div>{row.email ?? '—'}</div>
                <div className="mt-1 text-[11px] text-[#31353A]/42">User #{row.userId}</div>
              </td>
              <td className="px-4 py-3 text-[#A38D6B]">+{row.amount}</td>
              <td className="px-4 py-3">{row.balanceAfter}</td>
              <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReadingsTable({ rows }: { rows: AdminReadingRow[] }) {
  return (
    <div className="divide-y divide-[#D1BE9B]/12">
      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs tracking-[0.16em] text-[#31353A]/42">沒有資料</div>
      ) : rows.map((row) => {
        const parsedInput = parseReadingInputData(row.inputData);
        const isDreamRecord = row.type === 'dream' || parsedInput?.recordKind === 'dream';
        return (
          <details key={row.id} className="group px-4 py-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-[#31353A]/78">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.1em] ${isVisitor(row) ? 'bg-[#C9837A]/12 text-[#C9837A]' : 'bg-[#A38D6B]/14 text-[#A38D6B]'}`}>
                      {isVisitor(row) ? '訪客' : '會員'}
                    </span>
                    <span>{getReadingKind(row)} · {readerLabel(row)}</span>
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.7] text-[#31353A]/52">
                    {shortText(getReadingPreview(row), 120)}
                  </div>
                </div>
                <div className="shrink-0 text-[11px] tracking-[0.1em] text-[#A38D6B]">
                  {formatDate(row.createdAt)}
                </div>
              </div>
            </summary>
            <div className="mt-4 grid gap-3 text-[12px] leading-[1.8] text-[#31353A]/68 md:grid-cols-2">
              <RecordBlock title="顧客身分" value={readerLabel(row)} />
              {isDreamRecord ? (
                <>
                  <RecordBlock title="夢境紀錄" value={parsedInput?.dreamContent ?? row.question} />
                </>
              ) : (
                <>
                  <RecordBlock title="顧客問題" value={row.question} />
                  <RecordBlock title="輸入資料" value={row.inputData} />
                </>
              )}
              <div className="md:col-span-2">
                <RecordBlock title="mochi解讀" value={row.interpretation} maxHeight />
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function FeedbacksTable({ rows }: { rows: AdminFeedbackRow[] }) {
  return (
    <div className="divide-y divide-[#D1BE9B]/12">
      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs tracking-[0.16em] text-[#31353A]/42">沒有資料</div>
      ) : rows.map((row) => (
        <details key={row.id} className="group px-4 py-4">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-[#31353A]/78">
                  <span className="rounded-full bg-[#A38D6B]/14 px-2 py-0.5 text-[10px] tracking-[0.1em] text-[#A38D6B]">
                    {typeLabels[row.source] ?? row.source}
                  </span>
                  <span>{feedbackReaderLabel(row)}</span>
                </div>
                <div className="mt-1 text-[12px] leading-[1.7] text-[#31353A]/52">
                  {shortText(row.message, 120)}
                </div>
              </div>
              <div className="shrink-0 text-[11px] tracking-[0.1em] text-[#A38D6B]">
                {formatDate(row.createdAt)}
              </div>
            </div>
          </summary>
          <div className="mt-4 grid gap-3 text-[12px] leading-[1.8] text-[#31353A]/68 md:grid-cols-2">
            <RecordBlock title="顧客身分" value={feedbackReaderLabel(row)} />
            <RecordBlock title="來源" value={typeLabels[row.source] ?? row.source} />
            <RecordBlock title="情境" value={row.context} />
            <div className="md:col-span-2">
              <RecordBlock title="回饋內容" value={row.message} maxHeight />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function TransactionsTable({ rows }: { rows: AdminTransactionRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead className="bg-[#D1BE9B]/10 text-[11px] tracking-[0.14em] text-[#A38D6B]">
          <tr>
            <th className="px-4 py-3 font-normal">類型</th>
            <th className="px-4 py-3 font-normal">會員</th>
            <th className="px-4 py-3 font-normal">異動</th>
            <th className="px-4 py-3 font-normal">異動後餘額</th>
            <th className="px-4 py-3 font-normal">時間</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D1BE9B]/12 text-xs text-[#31353A]/72">
          {rows.length === 0 ? <EmptyRow colSpan={5} /> : rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{reasonLabel(row.reason)}</td>
              <td className="px-4 py-3">
                <div>{row.email ?? '—'}</div>
                <div className="mt-1 text-[11px] text-[#31353A]/42">User #{row.userId}</div>
              </td>
              <td className={`px-4 py-3 ${row.amount >= 0 ? 'text-[#A38D6B]' : 'text-[#C9837A]'}`}>
                {row.amount >= 0 ? '+' : ''}{row.amount}
              </td>
              <td className="px-4 py-3">{row.balanceAfter}</td>
              <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordBlock({ title, value, maxHeight = false }: { title: string; value: string | null | undefined; maxHeight?: boolean }) {
  return (
    <div className="rounded-lg border border-[#D1BE9B]/15 bg-white/45 p-3">
      <div className="mb-2 text-[11px] tracking-[0.16em] text-[#A38D6B]">{title}</div>
      <pre className={`whitespace-pre-wrap break-words font-sans text-[12px] leading-[1.8] text-[#31353A]/68 ${maxHeight ? 'max-h-64 overflow-auto' : ''}`}>
        {value || '—'}
      </pre>
    </div>
  );
}
