import { useMemo, useState } from 'react';
import { Loader2, Moon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import PageLayout from '@/components/PageLayout';
import { CatPeeking } from '@/components/CatElements';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRotatingText } from '@/hooks/useRotatingText';

const sampleDreams = [
  '夢到自己一直在找出口，可是每扇門打開都不是我要去的地方。',
  '夢到以前很重要的人突然出現，我們好像很熟，又好像很陌生。',
  '夢到牙齒掉了，醒來之後心裡很慌，但說不上來在怕什麼。',
];

const DREAM_WAITING_MESSAGES = [
  'Mochi 正在整理線索，但看起來像在發呆。',
  'Mochi 正在用貓掌把混亂拍成重點。',
  'Mochi 正在分析中，眼神很空，腦袋很忙。',
  'Mochi 正在把腦內毛線球慢慢解開。',
  'Mochi 正在看起來沒在想，其實很有想法。',
  'Mochi 正在慢慢靠近重點，像靠近一個紙箱。',
];

export default function DreamPage() {
  const { login } = useAuth();
  const utils = trpc.useUtils();
  const [dreamContent, setDreamContent] = useState('');
  const [interpretation, setInterpretation] = useState('');

  const canSubmit = dreamContent.trim().length >= 6;
  const remainingChars = useMemo(() => 1600 - dreamContent.length, [dreamContent.length]);

  const interpretMutation = trpc.dream.interpret.useMutation({
    onSuccess: async (data) => {
      setInterpretation(data.interpretation);
      await Promise.all([
        utils.credits.state.invalidate(),
        utils.history.getReadings.invalidate(),
      ]);
    },
    onError: (error) => {
      if (error.message === 'NOT_SIGNED_IN' || error.message === 'ANON_QUOTA_EXHAUSTED') {
        toast.error('今日免費額度已用完 🐾', {
          description: '登入後可以繼續讓 Mochi 幫你解夢。',
          action: {
            label: '登入',
            onClick: () => login({ title: '登入後繼續解夢', subtitle: 'Mochi 會幫你把夢境紀錄收好。' }),
          },
        });
        return;
      }
      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast.error('可用次數不足', { description: '可以先購買點數，再回來找 Mochi 解夢。' });
        return;
      }
      toast.error('Mochi 暫時讀不到這個夢，請稍後再試');
    },
  });
  const waitingMessage = useRotatingText(DREAM_WAITING_MESSAGES, interpretMutation.isPending, 2400);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || interpretMutation.isPending) return;
    setInterpretation('');
    interpretMutation.mutate({
      dreamContent: dreamContent.trim(),
    });
  };

  return (
    <PageLayout>
      <main className="min-h-screen overflow-hidden px-4 pb-20 pt-28 md:px-8">
        <section className="relative mx-auto flex max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="pointer-events-none absolute -left-16 top-12 h-64 w-64 rounded-full bg-[#E5DFEE]/45 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-44 h-72 w-72 rounded-full bg-[#D1BE9B]/25 blur-3xl" />

          <div className="relative z-10 pt-6 lg:sticky lg:top-32">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D1BE9B]/25 bg-white/40 px-4 py-2 text-[11px] tracking-[0.18em] text-[#8A7250] shadow-[0_8px_28px_rgba(209,190,155,0.12)] backdrop-blur-sm"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              <Moon className="h-3.5 w-3.5" />
              Dream Reading
            </div>

            <div className="relative mb-7 flex items-end gap-4">
              <div>
                <p className="mb-3 text-[11px] tracking-[0.35em] text-[#D1BE9B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  MOCHI DREAM
                </p>
                <h1 className="text-2xl font-extralight leading-[1.65] tracking-[0.16em] text-[#31353A] md:text-4xl"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Mochi 解夢
                </h1>
              </div>
              <CatPeeking className="mb-1 h-20 w-20 opacity-60 md:h-24 md:w-24" />
            </div>

            <p className="max-w-md text-[13px] leading-[2.2] tracking-[0.12em] text-[#31353A]/62"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              把你記得的夢交給 Mochi。不用寫得很完整，場景、人物、醒來後的感覺，都可以變成解讀的線索。
            </p>
          </div>

          <div className="relative z-10">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/72 p-5 shadow-[0_18px_60px_rgba(163,141,107,0.14)] backdrop-blur-xl md:p-7"
            >
              <label className="block">
                <span className="mb-2 block text-[12px] tracking-[0.22em] text-[#8A7250]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  你夢到什麼？
                </span>
                <Textarea
                  value={dreamContent}
                  onChange={(event) => setDreamContent(event.target.value.slice(0, 1600))}
                  placeholder="例如：我夢到自己在一棟很大的房子裡找出口，走廊一直變長，後面好像有人在追我..."
                  className="min-h-[190px] resize-none rounded-xl border-[#D1BE9B]/28 bg-white/58 px-4 py-4 text-[13px] leading-[2] tracking-[0.08em] text-[#31353A]/78 shadow-none placeholder:text-[#31353A]/30 focus-visible:border-[#D1BE9B]/55 focus-visible:ring-[#D1BE9B]/18"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                />
                <span className={`mt-2 block text-right text-[10px] tracking-[0.12em] ${remainingChars < 80 ? 'text-[#C9837A]' : 'text-[#31353A]/35'}`}
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  {remainingChars} 字
                </span>
              </label>

              <div className="mt-5 flex flex-wrap gap-2">
                {sampleDreams.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setDreamContent(sample)}
                    className="rounded-full border border-[#D1BE9B]/18 bg-white/32 px-3.5 py-2 text-[10px] tracking-[0.1em] text-[#31353A]/45 transition-colors hover:border-[#D1BE9B]/42 hover:text-[#8A7250]"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  >
                    試填範例
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!canSubmit || interpretMutation.isPending}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3D4144] px-6 py-3.5 text-[12px] tracking-[0.24em] text-[#FAF7F4] transition-all duration-500 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
              >
                {interpretMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {waitingMessage}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    開始解夢
                  </>
                )}
              </button>
            </form>

            {(interpretMutation.isPending || interpretation) && (
              <section className="mt-6 rounded-2xl border border-[#D1BE9B]/22 bg-white/58 p-5 shadow-[0_18px_50px_rgba(163,141,107,0.1)] backdrop-blur-xl md:p-7">
                <div className="mb-4 flex items-center gap-2 text-[#8A7250]">
                  <Moon className="h-4 w-4" />
                  <h2 className="text-[13px] tracking-[0.22em]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    Mochi 讀到的訊號
                  </h2>
                </div>
                {interpretMutation.isPending ? (
                  <p className="text-[13px] leading-[2.2] tracking-[0.12em] text-[#31353A]/54"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {waitingMessage}
                  </p>
                ) : (
                  <div className="text-[14px] leading-[2.15] tracking-[0.08em] text-[#31353A]/76"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    <Streamdown>{interpretation}</Streamdown>
                  </div>
                )}
              </section>
            )}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
