/**
 * SOUL EASE | Mochi．crystal — 我的紀錄
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Shows user's past readings (tarot, ziwei, fortune) and treehole sessions.
 * Requires login.
 */

import { useState } from 'react';
import { Link } from 'wouter';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Streamdown } from 'streamdown';

type TabType = 'readings' | 'treehole';

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

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('readings');

  const readingsQuery = trpc.history.getReadings.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  const treeholeQuery = trpc.history.getTreeholeSessions.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

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
            登入後即可查看你的占卜紀錄與心靈樹洞對話歷史。
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
  const treeholeSessions = treeholeQuery.data ?? [];

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

          {/* Tabs */}
          <div className="flex gap-2 justify-center mb-8">
            {[
              { id: 'readings' as TabType, label: '占卜紀錄', count: readings.length },
              { id: 'treehole' as TabType, label: '心靈樹洞', count: treeholeSessions.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-xs tracking-[0.15em] border transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#3D4144] text-[#FAF7F4] border-[#3D4144]'
                    : 'border-[#D1BE9B]/25 text-[#31353A]/72 hover:border-[#D1BE9B]/50 bg-white/30'
                }`}
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {tab.label}
                <span className={`ml-1.5 text-[11px] ${activeTab === tab.id ? 'opacity-60' : 'text-[#D1BE9B]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Readings Tab */}
          {activeTab === 'readings' && (
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
          )}

          {/* Treehole Tab */}
          {activeTab === 'treehole' && (
            <div>
              {treeholeQuery.isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#D1BE9B]/40 border-t-[#D1BE9B] animate-spin" />
                </div>
              ) : treeholeQuery.isError ? (
                <div className="text-center py-16">
                  <div className="text-3xl mb-4 opacity-25">⚠️</div>
                  <p className="text-xs tracking-[0.2em] text-[#31353A]/62"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    載入失敗，請稍後再試
                  </p>
                  <button
                    onClick={() => treeholeQuery.refetch()}
                    className="mt-4 px-5 py-2 text-xs tracking-[0.15em] border border-[#D1BE9B]/30 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-300"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    重試
                  </button>
                </div>
              ) : treeholeSessions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-3xl mb-4 opacity-25">🌿</div>
                  <p className="text-xs tracking-[0.2em] text-[#31353A]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    還沒有心靈樹洞紀錄
                  </p>
                  <p className="text-[11px] tracking-[0.15em] text-[#31353A]/42 mt-2 mb-6"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    有話想說嗎？跟 Mochi 說說吧。
                  </p>
                  <Link href="/treehole">
                    <button
                      className="px-6 py-2 text-xs tracking-[0.2em] border border-[#D1BE9B]/30 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-300"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      前往心靈樹洞
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {treeholeSessions.map(s => (
                    <div
                      key={s.id}
                      className="glass-panel rounded-2xl p-5 border border-[#D1BE9B]/20 animate-fade-in-up"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌿</span>
                          <div>
                            {s.mood && (
                              <p className="text-[11px] tracking-[0.15em] text-[#D1BE9B]"
                                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                                心情：{s.mood}
                              </p>
                            )}
                            <p className="text-[11px] tracking-[0.1em] text-[#31353A]/72 mt-0.5 italic line-clamp-1"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                              「{s.userText.slice(0, 50)}{s.userText.length > 50 ? '⋯' : ''}」
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] tracking-[0.1em] text-[#31353A]/46 flex-shrink-0 ml-2"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                          {new Date(s.createdAt).toLocaleDateString('zh-TW', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>

                      {s.crystalName && (
                        <p className="text-[11px] tracking-[0.1em] text-[#D1BE9B]/70 mb-2"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                          推薦水晶：{s.crystalName}
                        </p>
                      )}

                      {s.aiResponse && (
                        <details className="group">
                          <summary className="cursor-pointer text-[11px] tracking-[0.15em] text-[#D1BE9B] hover:text-[#A38D6B] transition-colors list-none flex items-center gap-1"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            <span className="group-open:rotate-90 transition-transform duration-200 inline-block">▶</span>
                            查看 Mochi 的回應
                          </summary>
                          <div className="mt-3 pt-3 border-t border-[#D1BE9B]/15">
                            <div className="text-[12px] leading-[2] text-[#31353A]/72 tracking-wider prose-sm max-w-none"
                              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                              <Streamdown>{s.aiResponse}</Streamdown>
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
