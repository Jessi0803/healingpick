import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Loader2, Moon, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import PageLayout from '@/components/PageLayout';
import { getMoodPlushieOpening, MoodClawMachine, type MoodPlushie } from '@/components/MoodClawMachine';
import OracleSphere from '@/components/OracleSphere';
import CosmicMist from '@/components/CosmicMist';
import { CatPeeking } from '@/components/CatElements';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRotatingText } from '@/hooks/useRotatingText';
import { recommendForDream } from '@/data/recommend';
import { getContextualRecommendationReason, getProductImageStyle, type Product } from '@/data/products';

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

const DREAM_FOLLOW_UP_WAITING_MESSAGES = [
  'Mochi 正在接著剛剛的夢往下看。',
  'Mochi 正在把追問和夢裡的訊號對在一起。',
  'Mochi 正在補上剛剛沒說完的那一塊。',
];

const DREAM_PENDING_FOLLOW_UP_KEY = 'healingpick:dream-pending-follow-up';
const FOLLOW_UP_LOGIN_PROMPT = {
  title: '登入後繼續追問夢境',
  subtitle: 'Mochi 會接著剛剛的解夢，幫你把追問看得更完整。',
};

type FollowUpExchange = {
  question: string;
  answer: string;
};

function ProductCard({
  product,
  context,
  role = 'primary',
}: {
  product: Product;
  context?: string;
  role?: 'primary' | 'secondary';
}) {
  const meanings = product.meanings.slice(0, 3).map((m) => m.title);
  const recommendationReason = getContextualRecommendationReason(product, context, role);
  const roleLabel = role === 'primary' ? '最貼近這個夢' : '也可以一起看';

  if (role === 'secondary') {
    return (
      <Link href={`/shop/${product.slug}`}>
        <div className="group flex items-center gap-3 rounded-2xl border border-[#D1BE9B]/22 bg-white/45 p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D1BE9B]/45">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EBE3]/40">
            <img src={product.img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style={getProductImageStyle(product)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] tracking-[0.08em] text-[#31353A]/86" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              {product.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[12px] text-[#A38D6B]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                NT$ {product.price.toLocaleString()}
              </span>
              {meanings[0] && (
                <span className="truncate text-[10px] tracking-[0.12em] text-[#31353A]/55" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  #{meanings[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-[#D1BE9B]/25 bg-white/42 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D1BE9B]/50 sm:flex-row">
        <div className="h-52 w-full flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EBE3]/40 sm:h-32 sm:w-32">
          <img src={product.img} alt={product.name} className="h-full w-full object-cover" style={getProductImageStyle(product)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="mr-1.5 rounded-full border border-[#D1BE9B]/20 bg-white/70 px-1.5 py-0.5 text-[10px] tracking-[0.15em] text-[#6F5A3A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {roleLabel}
              </span>
              {product.tag && (
                <span className="rounded-full bg-[#D1BE9B]/20 px-1.5 py-0.5 text-[10px] tracking-[0.15em] text-[#A38D6B]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {product.tag}
                </span>
              )}
              <p className="mt-1 truncate text-[15px] tracking-[0.08em] text-[#31353A]/88"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.name}
              </p>
            </div>
            <p className="flex-shrink-0 text-sm font-light text-[#D1BE9B]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              NT$ {product.price.toLocaleString()}
            </p>
          </div>

          <div className="mb-2 flex flex-wrap gap-1">
            {meanings.map((meaning) => (
              <span key={meaning} className="rounded-full border border-[#D1BE9B]/15 bg-[#F0EBE3]/70 px-2 py-0.5 text-[10px] tracking-[0.1em] text-[#31353A]/62"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                {meaning}
              </span>
            ))}
          </div>

          <div className="mb-2 rounded-xl border border-[#D1BE9B]/15 bg-[#F8F4EC]/45 px-3 py-2">
            <p className="mb-1 text-[11px] tracking-[0.18em] text-[#A38D6B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              為什麼 Mochi 想到它
            </p>
            <p className="text-[12px] leading-[1.85] tracking-[0.06em] text-[#31353A]/66"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              {recommendationReason}
            </p>
          </div>

          <span className="text-[11px] tracking-[0.15em] text-[#A38D6B]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            看看這款商品 →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DreamPage() {
  const { isAuthenticated, login } = useAuth();
  const utils = trpc.useUtils();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const [dreamContent, setDreamContent] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [caughtMoodPlushie, setCaughtMoodPlushie] = useState<MoodPlushie | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpExchanges, setFollowUpExchanges] = useState<FollowUpExchange[]>([]);
  const [pendingFollowUpAfterLogin, setPendingFollowUpAfterLogin] = useState(false);
  const moodClawSectionRef = useRef<HTMLDivElement | null>(null);
  const readingResultRef = useRef<HTMLDivElement | null>(null);
  const followUpRequestInFlightRef = useRef<string | null>(null);
  const completedFollowUpRequestKeysRef = useRef(new Set<string>());

  const canSubmit = dreamContent.trim().length >= 6;
  const remainingChars = useMemo(() => 1600 - dreamContent.length, [dreamContent.length]);
  const recommendations = useMemo(
    () => interpretation ? recommendForDream(dreamContent, interpretation) : [],
    [dreamContent, interpretation],
  );

  const scrollToSection = useCallback((ref: RefObject<HTMLDivElement | null>, block: ScrollLogicalPosition = 'center') => {
    const scroll = () => ref.current?.scrollIntoView({ behavior: 'smooth', block });
    window.requestAnimationFrame(() => {
      scroll();
      window.requestAnimationFrame(scroll);
    });
    window.setTimeout(scroll, 80);
    window.setTimeout(scroll, 220);
    window.setTimeout(scroll, 420);
  }, []);

  const interpretMutation = trpc.dream.interpret.useMutation({
    onSuccess: async (data) => {
      setInterpretation(data.interpretation);
      setFollowUpQuestion('');
      setFollowUpExchanges([]);
      setPendingFollowUpAfterLogin(false);
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
  const followUpMutation = trpc.dream.followUp.useMutation({
    onSuccess: async (data, variables) => {
      const requestKey = JSON.stringify([
        variables.dreamContent,
        variables.interpretation,
        variables.followUpQuestion,
      ]);
      completedFollowUpRequestKeysRef.current.add(requestKey);
      setFollowUpExchanges((prev) => [
        ...prev,
        {
          question: variables.followUpQuestion,
          answer: data.answer,
        },
      ]);
      setFollowUpQuestion('');
      setPendingFollowUpAfterLogin(false);
      await Promise.all([
        utils.credits.state.invalidate(),
        utils.history.getReadings.invalidate(),
      ]);
    },
    onError: (error, variables) => {
      const requestKey = JSON.stringify([
        variables.dreamContent,
        variables.interpretation,
        variables.followUpQuestion,
      ]);
      completedFollowUpRequestKeysRef.current.delete(requestKey);

      if (error.message === 'NOT_SIGNED_IN') {
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return;
      }
      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast.error('可用次數不足', {
          description: '可以先購買點數，或稍後再回來問 Mochi。',
          action: {
            label: '購買點數',
            onClick: () => {
              window.location.href = '/buy';
            },
          },
          duration: 6000,
        });
        return;
      }
      toast.error('追問暫時無法送出，請稍後再試。');
    },
    onSettled: (_data, _error, variables) => {
      if (!variables) {
        followUpRequestInFlightRef.current = null;
        return;
      }
      const requestKey = JSON.stringify([
        variables.dreamContent,
        variables.interpretation,
        variables.followUpQuestion,
      ]);
      if (followUpRequestInFlightRef.current === requestKey) {
        followUpRequestInFlightRef.current = null;
      }
    },
  });
  const waitingMessage = useRotatingText(DREAM_WAITING_MESSAGES, interpretMutation.isPending, 2400);
  const followUpWaitingMessage = useRotatingText(
    DREAM_FOLLOW_UP_WAITING_MESSAGES,
    followUpMutation.isPending,
    2400
  );

  useEffect(() => {
    if (interpretMutation.isPending) {
      setCaughtMoodPlushie(null);
    }
  }, [interpretMutation.isPending]);

  useEffect(() => {
    if (!interpretMutation.isPending && interpretation) {
      scrollToSection(readingResultRef, 'start');
    }
  }, [interpretMutation.isPending, interpretation, scrollToSection]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || interpretMutation.isPending) return;
    setInterpretation('');
    setFollowUpQuestion('');
    setFollowUpExchanges([]);
    setPendingFollowUpAfterLogin(false);
    interpretMutation.mutate({
      dreamContent: dreamContent.trim(),
    });
  };

  const submitFollowUp = useCallback((trimmedQuestion: string) => {
    if (!trimmedQuestion || !interpretation || followUpMutation.isPending) return false;

    if (!isAuthenticated) {
      setPendingFollowUpAfterLogin(true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(DREAM_PENDING_FOLLOW_UP_KEY, JSON.stringify({
          dreamContent,
          interpretation,
          followUpQuestion: trimmedQuestion,
        }));
      }
      void login(FOLLOW_UP_LOGIN_PROMPT);
      return false;
    }

    const trimmedDream = dreamContent.trim();
    const requestKey = JSON.stringify([
      trimmedDream,
      interpretation,
      trimmedQuestion,
    ]);
    if (
      followUpRequestInFlightRef.current === requestKey ||
      completedFollowUpRequestKeysRef.current.has(requestKey)
    ) {
      return true;
    }
    followUpRequestInFlightRef.current = requestKey;

    followUpMutation.mutate({
      dreamContent: trimmedDream,
      interpretation,
      followUpQuestion: trimmedQuestion,
    });
    return true;
  }, [
    dreamContent,
    followUpMutation,
    interpretation,
    isAuthenticated,
    login,
  ]);

  const handleFollowUpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitFollowUp(followUpQuestion.trim());
  };

  useEffect(() => {
    if (!pendingFollowUpAfterLogin || !isAuthenticated || followUpMutation.isPending) return;
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion) {
      setPendingFollowUpAfterLogin(false);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(DREAM_PENDING_FOLLOW_UP_KEY);
    }

    void creditsQuery.refetch().then(() => {
      const submitted = submitFollowUp(trimmedQuestion);
      if (submitted || isAuthenticated) setPendingFollowUpAfterLogin(false);
    });
  }, [
    creditsQuery,
    followUpMutation.isPending,
    followUpQuestion,
    isAuthenticated,
    pendingFollowUpAfterLogin,
    submitFollowUp,
  ]);

  useEffect(() => {
    if (!isAuthenticated || followUpMutation.isPending || typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(DREAM_PENDING_FOLLOW_UP_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(DREAM_PENDING_FOLLOW_UP_KEY);

    try {
      const pending = JSON.parse(raw) as {
        dreamContent?: string;
        interpretation?: string;
        followUpQuestion?: string;
      };
      const pendingDream = pending.dreamContent?.trim();
      const pendingInterpretation = pending.interpretation?.trim();
      const pendingQuestion = pending.followUpQuestion?.trim();
      if (!pendingDream || !pendingInterpretation || !pendingQuestion) {
        window.sessionStorage.removeItem(DREAM_PENDING_FOLLOW_UP_KEY);
        return;
      }

      setDreamContent(pendingDream);
      setInterpretation(pendingInterpretation);
      setFollowUpQuestion(pendingQuestion);
      setPendingFollowUpAfterLogin(false);
      const requestKey = JSON.stringify([
        pendingDream,
        pendingInterpretation,
        pendingQuestion,
      ]);
      if (
        followUpRequestInFlightRef.current === requestKey ||
        completedFollowUpRequestKeysRef.current.has(requestKey)
      ) {
        return;
      }
      followUpRequestInFlightRef.current = requestKey;

      void creditsQuery.refetch().then(() => {
        followUpMutation.mutate({
          dreamContent: pendingDream,
          interpretation: pendingInterpretation,
          followUpQuestion: pendingQuestion,
        });
      });
    } catch {
      window.sessionStorage.removeItem(DREAM_PENDING_FOLLOW_UP_KEY);
    }
  }, [creditsQuery, isAuthenticated, followUpMutation, followUpMutation.isPending]);

  return (
    <PageLayout>
      <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 md:px-8">
        {/* Drifting oat-milk mist + glints (Stitch-inspired) */}
        <CosmicMist className="z-0" intensity={0.9} />

        <section className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
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
              把你記得的夢交給 Mochi。場景、人物、醒來後的感覺，都可以變成解讀的線索。
            </p>

            {/* Rotating Oracle crystal (Stitch-inspired) */}
            <OracleSphere className="mx-auto mt-2 aspect-square w-full max-w-[368px]" />
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
              <section className="relative overflow-hidden mt-6 rounded-2xl border border-[#D1BE9B]/22 bg-white/58 p-5 shadow-[0_18px_50px_rgba(163,141,107,0.1)] backdrop-blur-xl md:p-7">
                {!interpretMutation.isPending && interpretation && <span className="result-sweep" aria-hidden />}
                <div className="mb-4 flex items-center gap-2 text-[#8A7250]">
                  <Moon className="h-4 w-4" />
                  <h2 className="text-[13px] tracking-[0.22em]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    Mochi 讀到的訊號
                  </h2>
                </div>
                {interpretMutation.isPending ? (
                  <div ref={moodClawSectionRef} className="flex flex-col items-center gap-4">
                    <p className="text-[13px] leading-[2.2] tracking-[0.12em] text-[#31353A]/54"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {waitingMessage}
                    </p>
                    <MoodClawMachine onPrizeCaught={setCaughtMoodPlushie} />
                  </div>
                ) : (
                  <div ref={readingResultRef} className="animate-fade-in-up text-[14px] leading-[2.15] tracking-[0.08em] text-[#31353A]/76"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {caughtMoodPlushie && (
                      <p className="rounded-2xl border border-[#D1BE9B]/20 bg-[#FFFDF9]/75 px-4 py-3 text-[#6F5A3A]/82">
                        {getMoodPlushieOpening(caughtMoodPlushie, 'dream')}
                      </p>
                    )}
                    <Streamdown>{interpretation}</Streamdown>
                  </div>
                )}
              </section>
            )}

            {!interpretMutation.isPending && interpretation && (
              <section className="mt-6 rounded-2xl border border-[#D1BE9B]/22 bg-white/58 p-5 shadow-[0_18px_50px_rgba(163,141,107,0.1)] backdrop-blur-xl md:p-7">
                <div className="mb-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#8A7250]">
                    <Sparkles className="h-4 w-4" />
                    <h2 className="text-[13px] tracking-[0.22em]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      想繼續問這個夢嗎
                    </h2>
                  </div>
                  <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/62"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    Mochi 會基於剛剛的夢境與解讀，補上一段更貼近追問的回應。
                  </p>
                </div>

                <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-3">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(event) => setFollowUpQuestion(event.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="例如：這個夢是在說我還放不下他嗎？或是跟最近工作壓力有關？"
                    className="min-h-[88px] resize-none rounded-xl border-[#D1BE9B]/28 bg-white/58 px-4 py-3 text-[13px] leading-[1.9] tracking-[0.08em] text-[#31353A]/78 shadow-none placeholder:text-[#31353A]/30 focus-visible:border-[#D1BE9B]/55 focus-visible:ring-[#D1BE9B]/18"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[11px] tracking-[0.1em] text-[#31353A]/45"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {followUpQuestion.length}/300
                    </span>
                    <button
                      type="submit"
                      disabled={followUpQuestion.trim().length < 2 || followUpMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3D4144] px-6 py-2.5 text-[11px] tracking-[0.18em] text-[#FAF7F4] transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      {followUpMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {followUpWaitingMessage}
                        </>
                      ) : (
                        '請 Mochi 回應'
                      )}
                    </button>
                  </div>
                </form>

                {followUpExchanges.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3">
                    {followUpExchanges.map((item, index) => (
                      <div key={`${index}-${item.question}`} className="rounded-2xl border border-[#D1BE9B]/18 bg-white/45 px-5 py-4">
                        <div className="mb-3 flex flex-col gap-1">
                          <p className="text-[11px] tracking-[0.24em] text-[#A38D6B]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            Mochi 的補充回應
                          </p>
                          <p className="text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/55"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            你的追問：{item.question}
                          </p>
                        </div>
                        <div className="text-[13px] leading-[2.05] tracking-[0.08em] text-[#31353A]/78"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                          <Streamdown>{item.answer}</Streamdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {!interpretMutation.isPending && interpretation && recommendations.length > 0 && (
              <section className="mt-6 rounded-2xl border border-[#D1BE9B]/22 bg-[#FAF7F4]/72 p-5 shadow-[0_18px_50px_rgba(163,141,107,0.1)] backdrop-blur-xl md:p-7">
                <div className="mb-4 flex items-center gap-2 text-[#8A7250]">
                  <Sparkles className="h-4 w-4" />
                  <h2 className="text-[13px] tracking-[0.22em]"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    Mochi 為這個夢想到的能量商品
                  </h2>
                </div>
                <p className="mb-4 text-[12px] leading-[2] tracking-[0.1em] text-[#31353A]/54"
                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                  依照夢裡出現的情緒、場景與醒來後的感覺，從目前商品中挑出比較呼應的陪伴。
                </p>
                <div className="flex flex-col gap-3">
                  {recommendations[0] && (
                    <ProductCard key={recommendations[0].slug} product={recommendations[0]} context={dreamContent} role="primary" />
                  )}
                  {recommendations.length > 1 && (
                    <>
                      <div className="my-1 flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#D1BE9B]/25" />
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]/85" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>還可以看看 ✦</span>
                        <span className="h-px flex-1 bg-[#D1BE9B]/25" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {recommendations.slice(1).map((product) => (
                          <ProductCard key={product.slug} product={product} context={dreamContent} role="secondary" />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
