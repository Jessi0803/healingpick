import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type ReadingFeedbackProps = {
  source: 'tarot' | 'ziwei';
  context?: string;
};

const sourceLabels: Record<ReadingFeedbackProps['source'], string> = {
  tarot: '塔羅解讀',
  ziwei: '紫微解讀',
};

export default function ReadingFeedback({ source, context }: ReadingFeedbackProps) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setMessage('');
      setSubmitted(true);
      toast.success('謝謝你的回饋，Mochi 收到了');
    },
    onError: () => {
      toast.error('回饋暫時送不出去，請稍後再試');
    },
  });

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length >= 2 && !submitFeedback.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    submitFeedback.mutate({
      source,
      message: trimmedMessage,
      context,
    });
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#D1BE9B]/20 bg-white/35 px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] tracking-[0.18em] text-[#6F5A3A]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
              看完後想對 Mochi 說什麼？
            </p>
            <p className="mt-1 text-[11px] leading-relaxed tracking-[0.08em] text-[#31353A]/52"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              也可以留下你希望 {sourceLabels[source]} 哪裡更清楚或更貼近你。
            </p>
          </div>
          {submitted && (
            <span className="shrink-0 rounded-full border border-[#D1BE9B]/25 bg-[#F8F4EC]/70 px-3 py-1 text-[10px] tracking-[0.12em] text-[#8A7250]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              已送出
            </span>
          )}
        </div>

        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value.slice(0, 1000));
            if (submitted) setSubmitted(false);
          }}
          rows={4}
          maxLength={1000}
          placeholder="例如：哪一段最有感、哪裡看不懂，或希望下次多補充什麼..."
          className="w-full resize-none rounded-xl border border-[#D1BE9B]/25 bg-[#FFFDF9]/80 px-3 py-3 text-[13px] leading-[1.9] tracking-[0.06em] text-[#31353A]/78 outline-none transition-colors placeholder:text-[#31353A]/32 focus:border-[#D1BE9B]/55"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.08em] text-[#31353A]/38"
            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
            {message.length}/1000
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-[#3D4144] px-4 py-2 text-[11px] tracking-[0.16em] text-[#FAF7F4] transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-45"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
          >
            <Send className="h-3.5 w-3.5" />
            {submitFeedback.isPending ? '送出中' : '送出回饋'}
          </button>
        </div>
      </form>
    </div>
  );
}
