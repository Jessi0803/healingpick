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
  /** Thumbnail shape. Match the source photos so the grid stops cropping them. */
  itemAspect?: string;
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
  itemAspect = "3 / 4",
}: FeedbackGalleryDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // The photos are tall phone screenshots, so height-fitting them shrinks the
  // text past readable. Zoomed shows them at native width instead.
  const [isZoomed, setIsZoomed] = useState(false);
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
    setIsZoomed(false);
  }, [selectedIndex]);

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

  // Warm the neighbours so stepping shows the next photo immediately instead of
  // blanking out while it downloads.
  useEffect(() => {
    if (selectedIndex === null || items.length < 2) return;
    for (const dir of [1, -1]) {
      const neighbour = items[(selectedIndex + dir + items.length) % items.length];
      if (neighbour) new Image().src = neighbour.image;
    }
  }, [selectedIndex, items]);

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Escape / outside-click while the lightbox is up should only dismiss
        // the photo, keeping the gallery behind it open.
        if (!nextOpen && selectedIndex !== null) {
          setSelectedIndex(null);
          return;
        }
        onOpenChange(nextOpen);
        if (!nextOpen) setSelectedIndex(null);
      }}
    >
      <DialogContent
        id={id}
        showCloseButton={false}
        onInteractOutside={(event) => {
          // The lightbox renders outside this layer, so Radix reads clicks in it
          // as "outside". Keep the gallery mounted underneath it.
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`放大第 ${index + 1} 張${itemAltPrefix}`}
                  style={{ aspectRatio: itemAspect }}
                  className="group overflow-hidden rounded-xl border border-[#C9D5E8]/40 bg-white/60 shadow-[0_10px_24px_rgba(36,88,121,0.1)] transition-[border-color,opacity,transform] duration-200 ease-out hover:border-[#245879]/44 active:scale-[0.98]"
                >
                  <img
                    src={item.thumb ?? item.image}
                    alt={`${itemAltPrefix}，第 ${index + 1} 張`}
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={480}
                    sizes="(min-width: 1024px) 14rem, (min-width: 640px) 45vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Portalled to <body> so the photo can use the whole viewport instead of
          being boxed into the dialog. Radix sets `pointer-events: none` on
          <body> while a modal dialog is open and that inherits down here, so the
          root explicitly takes it back — without it every click below is dead. */}
      {selectedItem &&
        selectedIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="lightbox-backdrop pointer-events-auto fixed inset-0 z-[70] bg-[#171513]/92 text-[#FAF7F4] backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxTitle}
            onClick={closeLightbox}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 md:p-5">
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.7} />
              </button>
            </div>

            {/* Horizontal padding clears the arrow buttons so they stay clickable. */}
            <div
              className={
                isZoomed
                  ? "h-full overflow-y-auto overscroll-contain px-4 py-14 md:px-6 md:py-12"
                  : "flex h-full items-center justify-center px-3 py-14 md:px-24 md:py-12"
              }
            >
              <img
                src={selectedItem.image}
                alt={`${itemAltPrefix}，第 ${selectedIndex + 1} 張`}
                decoding="async"
                className={
                  isZoomed
                    ? "mx-auto w-[min(868px,100%)] max-w-none cursor-zoom-out rounded-xl shadow-2xl"
                    : "max-h-full max-w-full cursor-zoom-in rounded-xl object-contain shadow-2xl"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  setIsZoomed((current) => !current);
                }}
              />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepLightbox(-1);
              }}
              aria-label="上一張"
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:left-6"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepLightbox(1);
              }}
              aria-label="下一張"
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95 md:right-6"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <p
              className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[10px] tracking-[0.14em] text-white/68"
              onClick={(event) => event.stopPropagation()}
            >
              {isZoomed ? "再點一次縮小 · 上下捲動看內容" : "點圖片看原尺寸 · 左右鍵切換"}
            </p>
          </div>,
          document.body,
        )}
    </Dialog>
  );
}
