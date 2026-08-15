import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type FeedbackGalleryItem = {
  id: string | number;
  image: string;
  thumb?: string;
};

type FeedbackGalleryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  lightboxTitle: string;
  itemAltPrefix: string;
  items: FeedbackGalleryItem[];
};

export default function FeedbackGalleryDialog({
  open,
  onOpenChange,
  id,
  eyebrow,
  title,
  description,
  lightboxTitle,
  itemAltPrefix,
  items,
}: FeedbackGalleryDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const selectedItem = selectedIndex === null ? null : items[selectedIndex];

  const closeLightbox = () => setSelectedIndex(null);
  const stepLightbox = (dir: number) =>
    setSelectedIndex((current) =>
      current === null ? current : (current + dir + items.length) % items.length,
    );

  useEffect(() => {
    if (!open) setSelectedIndex(null);
  }, [open]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") stepLightbox(1);
      if (event.key === "ArrowLeft") stepLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) stepLightbox(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) setSelectedIndex(null);
        }}
      >
        <DialogContent
          id={id}
          showCloseButton={false}
          onInteractOutside={(event) => {
            if (selectedIndex !== null) event.preventDefault();
          }}
          className="h-[min(88vh,46rem)] max-w-[min(58rem,calc(100vw-1.5rem))] overflow-hidden border-white/55 bg-[#F8FBFF]/96 p-0 text-[#245879] shadow-[0_28px_80px_rgba(36,88,121,0.22)] backdrop-blur-xl sm:rounded-2xl"
          aria-describedby={`${id}-description`}
        >
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr]">
            <div className="flex items-start justify-between gap-4 border-b border-[#C9D5E8]/40 px-5 pb-4 pt-6 md:px-7">
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.34em] text-[#246188]/68"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {eyebrow}
                </p>
                <DialogTitle
                  className="mt-2 text-lg font-light tracking-[0.18em] text-[#245879] md:text-xl"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {title}
                </DialogTitle>
                <DialogDescription
                  id={`${id}-description`}
                  className="mt-2 max-w-2xl text-[12px] leading-[1.9] tracking-[0.08em] text-[#245879]/62"
                  style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 400 }}
                >
                  {description}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="關閉回饋視窗"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C9D5E8]/48 bg-white/64 text-[#245879] shadow-[0_8px_20px_rgba(36,88,121,0.1)] transition-colors hover:bg-white active:scale-95"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.7} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 md:px-7">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`放大第 ${index + 1} 張${itemAltPrefix}`}
                    className="group aspect-[3/4] overflow-hidden rounded-xl border border-[#C9D5E8]/40 bg-white/60 shadow-[0_10px_24px_rgba(36,88,121,0.1)] transition-[border-color,opacity,transform] duration-200 ease-out hover:border-[#245879]/44 active:scale-[0.98]"
                  >
                    <img
                      src={item.thumb ?? item.image}
                      alt={`${itemAltPrefix}，第 ${index + 1} 張`}
                      loading="lazy"
                      decoding="async"
                      width={360}
                      height={480}
                      sizes="(min-width: 1024px) 11rem, (min-width: 640px) 33vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedItem &&
        selectedIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="lightbox-backdrop fixed inset-0 z-[1000] bg-[#171513]/88 px-3 py-5 backdrop-blur-md md:px-8"
            role="dialog"
            aria-modal="true"
            onClick={closeLightbox}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative z-10 flex items-start justify-between gap-4 text-[#FAF7F4]">
              <div>
                <p
                  className="text-[12px] tracking-[0.18em]"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {lightboxTitle}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.12em] text-white/48">
                  {selectedIndex + 1} / {items.length}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
                aria-label="關閉"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.7} />
              </button>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepLightbox(-1);
              }}
              aria-label="上一張"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:left-8"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <img
              key={selectedItem.id}
              src={selectedItem.image}
              alt={`${itemAltPrefix}，第 ${selectedIndex + 1} 張`}
              decoding="async"
              className="lightbox-image fixed left-1/2 top-1/2 z-[1001] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-6rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl object-contain shadow-2xl sm:max-w-[calc(100vw-8rem)]"
              onClick={(event) => event.stopPropagation()}
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepLightbox(1);
              }}
              aria-label="下一張"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:right-8"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[10px] tracking-[0.14em] text-white/68 transition-colors hover:bg-white/16"
              onClick={(event) => event.stopPropagation()}
            >
              左右滑動或按方向鍵切換
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
