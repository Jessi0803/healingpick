import { createPortal } from "react-dom";

type FeedbackCompanionProps = {
  onOpen: () => void;
  controlsId?: string;
};

export default function FeedbackCompanion({
  onOpen,
  controlsId,
}: FeedbackCompanionProps) {
  if (typeof document === "undefined") return null;

  const ariaProps = controlsId
    ? {
        "aria-controls": controlsId,
      }
    : {};

  return createPortal(
    <div className="fixed bottom-5 right-4 z-40 flex max-w-[calc(100vw-1.5rem)] items-end gap-2 sm:bottom-7 sm:right-6">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        {...ariaProps}
        className="group relative order-2 grid h-[5.4rem] w-[5.4rem] shrink-0 place-items-center rounded-full border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(232,225,240,0.7))] shadow-[0_16px_38px_rgba(36,88,121,0.2)] backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(36,88,121,0.24)] active:scale-[0.96] sm:h-24 sm:w-24"
      >
        <span className="pointer-events-none absolute inset-2 rounded-full bg-[radial-gradient(circle_at_42%_36%,rgba(255,247,221,0.82),transparent_48%)]" />
        <span
          className="pointer-events-none absolute right-3 top-3 text-[13px] text-[#D1BE9B] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          aria-hidden="true"
        >
          ✦
        </span>
        <img
          src="/cat.png"
          alt=""
          draggable={false}
          className="relative z-10 h-[4.6rem] w-[4.6rem] object-contain drop-shadow-[0_8px_12px_rgba(36,88,121,0.16)] sm:h-20 sm:w-20"
        />
        <span className="sr-only">想看看顧客回饋嗎</span>
      </button>

      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        {...ariaProps}
        className="order-1 mb-5 max-w-[9.4rem] rounded-[1.05rem] rounded-br-sm border border-white/65 bg-white/86 px-3 py-2 text-left text-[12px] leading-[1.55] tracking-[0.08em] text-[#245879] shadow-[0_12px_30px_rgba(36,88,121,0.16)] backdrop-blur-md transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] sm:max-w-[10.8rem] sm:px-4"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 500 }}
      >
        想看看顧客回饋嗎
      </button>
    </div>,
    document.body,
  );
}
