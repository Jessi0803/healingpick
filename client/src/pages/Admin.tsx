import { useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const tabs = [
  { id: 'users', label: '會員管理' },
  { id: 'orders', label: '訂單管理' },
  { id: 'inputs', label: '顧客輸入' },
  { id: 'transactions', label: '點數紀錄' },
] as const;

type TabId = typeof tabs[number]['id'];

const typeLabels: Record<string, string> = {
  tarot: '塔羅',
  ziwei: '紫微',
  fortune: '每日運勢',
};

type AdminUserRow = {
  id: number;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  loginMethod: string | null;
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
  email: string | null;
  name: string | null;
  type: string;
  question: string | null;
  inputData: string | null;
  interpretation: string | null;
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

function reasonLabel(reason: string) {
  if (reason === 'signup_bonus') return '註冊贈點';
  if (reason === 'admin_topup') return '管理員加值';
  if (reason.startsWith('gumroad:')) return 'Gumroad 訂單';
  if (reason === 'tarot') return '塔羅扣點';
  if (reason === 'ziwei') return '紫微扣點';
  if (reason === 'fortune') return '每日運勢扣點';
  return reason;
}

export default function AdminPage() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [query, setQuery] = useState('');

  const dashboardQuery = trpc.admin.dashboard.useQuery(
    { limit: 150 },
    { enabled: user?.role === 'admin', refetchOnWindowFocus: true }
  );

  const normalizedQuery = query.trim().toLowerCase();
  const data = dashboardQuery.data;

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
      [row.email, row.name, row.type, row.question, row.inputData].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.readings, normalizedQuery]);

  const filteredTransactions = useMemo(() => {
    const rows = data?.transactions ?? [];
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.email, row.name, row.reason, String(row.userId)].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data?.transactions, normalizedQuery]);

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

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
            <Metric label="會員數" value={data?.stats.users ?? 0} />
            <Metric label="占卜紀錄" value={data?.stats.readings ?? 0} />
            <Metric label="Gumroad 訂單" value={data?.stats.purchases ?? 0} />
            <Metric label="售出點數" value={data?.stats.creditsSold ?? 0} />
          </div>

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
              {activeTab === 'users' && <UsersTable rows={filteredUsers} />}
              {activeTab === 'orders' && <OrdersTable rows={filteredOrders} />}
              {activeTab === 'inputs' && <ReadingsTable rows={filteredReadings} />}
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

function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead className="bg-[#D1BE9B]/10 text-[11px] tracking-[0.14em] text-[#A38D6B]">
          <tr>
            <th className="px-4 py-3 font-normal">ID</th>
            <th className="px-4 py-3 font-normal">會員</th>
            <th className="px-4 py-3 font-normal">角色</th>
            <th className="px-4 py-3 font-normal">點數</th>
            <th className="px-4 py-3 font-normal">今日免費已用</th>
            <th className="px-4 py-3 font-normal">註冊時間</th>
            <th className="px-4 py-3 font-normal">最後登入</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D1BE9B]/12 text-xs text-[#31353A]/72">
          {rows.length === 0 ? <EmptyRow colSpan={7} /> : rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{row.id}</td>
              <td className="px-4 py-3">
                <div>{row.email ?? '—'}</div>
                <div className="mt-1 text-[11px] text-[#31353A]/42">{row.name ?? row.loginMethod ?? '—'}</div>
              </td>
              <td className="px-4 py-3">{row.role}</td>
              <td className="px-4 py-3">{row.credits}</td>
              <td className="px-4 py-3">{row.freeUsedToday}</td>
              <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
              <td className="px-4 py-3">{formatDate(row.lastSignedIn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      ) : rows.map((row) => (
        <details key={row.id} className="group px-4 py-4">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs tracking-[0.14em] text-[#31353A]/78">
                  {typeLabels[row.type] ?? row.type} · {row.email ?? `User #${row.userId ?? '—'}`}
                </div>
                <div className="mt-1 text-[12px] leading-[1.7] text-[#31353A]/52">
                  {shortText(row.question || row.inputData, 120)}
                </div>
              </div>
              <div className="shrink-0 text-[11px] tracking-[0.1em] text-[#A38D6B]">
                {formatDate(row.createdAt)}
              </div>
            </div>
          </summary>
          <div className="mt-4 grid gap-3 text-[12px] leading-[1.8] text-[#31353A]/68 md:grid-cols-2">
            <RecordBlock title="顧客問題" value={row.question} />
            <RecordBlock title="輸入資料" value={row.inputData} />
            <div className="md:col-span-2">
              <RecordBlock title="AI 解讀" value={row.interpretation} maxHeight />
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

function RecordBlock({ title, value, maxHeight = false }: { title: string; value: string | null; maxHeight?: boolean }) {
  return (
    <div className="rounded-lg border border-[#D1BE9B]/15 bg-white/45 p-3">
      <div className="mb-2 text-[11px] tracking-[0.16em] text-[#A38D6B]">{title}</div>
      <pre className={`whitespace-pre-wrap break-words font-sans text-[12px] leading-[1.8] text-[#31353A]/68 ${maxHeight ? 'max-h-64 overflow-auto' : ''}`}>
        {value || '—'}
      </pre>
    </div>
  );
}
