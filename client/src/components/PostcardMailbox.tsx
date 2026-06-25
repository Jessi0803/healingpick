import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Mail, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const recordedUsers = new Set<number>();
const sessionRecordedPrefix = "healingpick-postcard-open:";
const floatingLetterStyles = `
@keyframes hp-letter-float {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
  50% { transform: translate3d(0, -7px, 0) rotate(2deg); }
}
@keyframes hp-letter-glow {
  0%, 100% { opacity: 0.58; transform: scale(0.92); }
  50% { opacity: 0.95; transform: scale(1.08); }
}
@keyframes hp-letter-wing {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(-2deg); }
}
@media (prefers-reduced-motion: reduce) {
  .hp-floating-letter { animation: none !important; }
  .hp-floating-letter-glow, .hp-floating-letter-icon { animation: none !important; }
}
`;

function driveFileId(url: string) {
  const match = url.match(/[?&]id=([^&]+)/) ?? url.match(/\/d\/([^/]+)/);
  return match?.[1] ?? null;
}

function drivePreviewUrl(url: string) {
  const id = driveFileId(url);
  return id ? `/api/postcards/image/${encodeURIComponent(id)}` : url;
}

function driveViewUrl(url: string) {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/view` : url;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  const sourceWidth = imageRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
  const sourceHeight = imageRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    const nextLine = `${line}${char}`;
    if (line && ctx.measureText(nextLine).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = nextLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function createPostcardImageUrl(imageSrc: string, message: string) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const width = 1600;
  const imageHeight = 1000;
  const textHeight = 190;
  canvas.width = width;
  canvas.height = imageHeight + textHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCoverImage(ctx, image, 0, 0, width, imageHeight);

  ctx.fillStyle = "#FFF9F1";
  ctx.fillRect(0, imageHeight, width, textHeight);
  ctx.strokeStyle = "#E8DCCB";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, imageHeight);
  ctx.lineTo(width, imageHeight);
  ctx.stroke();

  ctx.fillStyle = "#6F5648";
  ctx.font = '300 42px "Noto Serif TC", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(ctx, message, 1280).slice(0, 2);
  const lineHeight = 66;
  const firstLineY = imageHeight + textHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, firstLineY + index * lineHeight);
  });

  return canvas.toDataURL("image/png");
}

export default function PostcardMailbox() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [activePostcard, setActivePostcard] = useState<typeof pendingQuery.data>(null);
  const [compositedImageUrl, setCompositedImageUrl] = useState("");
  const [compositedImageStatus, setCompositedImageStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const openedRef = useRef<number | null>(null);

  const pendingQuery = trpc.postcards.pending.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const authenticatedOpenMutation = trpc.postcards.onAuthenticatedOpen.useMutation({
    onSuccess: async () => {
      await utils.postcards.pending.invalidate();
    },
  });

  const openMutation = trpc.postcards.open.useMutation({
    onSuccess: async () => {
      await utils.postcards.pending.invalidate();
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const sessionKey = `${sessionRecordedPrefix}${user.id}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey)) return;
    if (recordedUsers.has(user.id)) return;
    recordedUsers.add(user.id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(sessionKey, "1");
    }
    authenticatedOpenMutation.mutate();
  }, [authenticatedOpenMutation, user?.id]);

  const postcard = pendingQuery.data;
  const visiblePostcard = activePostcard ?? postcard;
  const imageUrl = useMemo(
    () => (visiblePostcard?.imageUrl ? drivePreviewUrl(visiblePostcard.imageUrl) : ""),
    [visiblePostcard?.imageUrl],
  );
  const originalUrl = useMemo(
    () => (visiblePostcard?.imageUrl ? driveViewUrl(visiblePostcard.imageUrl) : ""),
    [visiblePostcard?.imageUrl],
  );

  useEffect(() => {
    let cancelled = false;
    setCompositedImageUrl("");
    setCompositedImageStatus("idle");
    if (!imageUrl || !visiblePostcard?.message) return;
    setCompositedImageStatus("loading");

    createPostcardImageUrl(imageUrl, visiblePostcard.message)
      .then((url) => {
        if (!cancelled) {
          setCompositedImageUrl(url);
          setCompositedImageStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompositedImageUrl("");
          setCompositedImageStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, visiblePostcard?.message]);

  if (!isAuthenticated || !visiblePostcard) return null;

  const openPostcard = () => {
    if (!postcard) return;
    setActivePostcard(postcard);
    setIsOpen(true);
  };

  const closePostcard = () => {
    setIsOpen(false);
    if (!activePostcard || openedRef.current === activePostcard.id) return;
    openedRef.current = activePostcard.id;
    openMutation.mutate({ id: activePostcard.id });
  };

  return (
    <>
      {postcard && !isOpen && (
        <>
          <style>{floatingLetterStyles}</style>
          <button
            type="button"
            onClick={openPostcard}
            className="hp-floating-letter group fixed right-5 top-[118px] z-[70] flex items-center gap-2 rounded-full px-1 py-1 outline-none transition duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#D1BE9B] focus-visible:ring-offset-4 md:right-8 md:top-[128px]"
            style={{ animation: "hp-letter-float 3.6s ease-in-out infinite" }}
            aria-label="Mochi 給你的信，打開明信片"
            title="Mochi 給你的信"
          >
            <span
              className="hp-floating-letter-glow absolute inset-0 rounded-full bg-[#F7D991]/45 blur-xl"
              style={{ animation: "hp-letter-glow 2.6s ease-in-out infinite" }}
            />
            <span className="absolute inset-1 rounded-full bg-[#FFF8E8]/65 blur-md" />
            <span className="relative grid h-14 w-14 place-items-center rounded-[18px] border border-[#D1BE9B]/55 bg-[#FFFDF8]/95 text-[#8A7250] shadow-[0_12px_34px_rgba(138,114,80,0.22),0_0_24px_rgba(247,217,145,0.5)] backdrop-blur-md transition group-hover:border-[#C8A96A]/80 group-hover:text-[#A38D6B]">
              <Mail
                className="hp-floating-letter-icon"
                size={28}
                strokeWidth={1.65}
                style={{ animation: "hp-letter-wing 1.8s ease-in-out infinite" }}
              />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border border-white bg-[#E9A6A0] shadow-[0_0_14px_rgba(233,166,160,0.8)]" />
            </span>
            <span
              className="relative max-w-[7.5rem] whitespace-nowrap rounded-full border border-[#D1BE9B]/45 bg-[#FFFDF8]/94 px-3 py-2 text-[11px] leading-none tracking-[0.13em] text-[#6F5648] shadow-[0_8px_24px_rgba(138,114,80,0.14)] backdrop-blur-md transition group-hover:border-[#C8A96A]/70 group-hover:text-[#A38D6B] sm:max-w-none sm:text-xs"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              Mochi 給你的信
            </span>
          </button>
        </>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#31353A]/35 px-4 py-8 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closePostcard}
            aria-hidden="true"
          />
          <section className="relative w-full max-w-3xl overflow-hidden rounded-[8px] border border-white/70 bg-[#FFFDF8] shadow-[0_24px_70px_rgba(49,53,58,0.24)]">
            <div className="absolute left-3 top-3 z-10 flex gap-2">
              <a
                href={originalUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/82 text-[#6F5648] shadow-sm transition hover:bg-white"
                aria-label="在 Google Drive 開啟原圖"
                title="開啟原圖"
              >
                <ExternalLink size={17} />
              </a>
            </div>
            <button
              type="button"
              onClick={closePostcard}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/82 text-[#6F5648] shadow-sm transition hover:bg-white"
              aria-label="關閉明信片"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[160/119] w-full bg-[#F8EFE5]">
              {compositedImageUrl ? (
                <img
                  src={compositedImageUrl}
                  alt="會員明信片"
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full flex-col">
                  <div
                    className="min-h-0 flex-1 bg-cover bg-center"
                    style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
                    aria-hidden="true"
                  />
                  <div className="border-t border-[#E8DCCB] bg-[#FFF9F1] px-4 py-4 sm:px-6 sm:py-5">
                    <p
                      className="mx-auto max-w-[16rem] text-center text-[12px] leading-[1.6] text-[#6F5648] sm:max-w-[22rem] sm:text-[13px] md:max-w-2xl md:text-base md:leading-[1.75]"
                      style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                    >
                      {visiblePostcard.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {visiblePostcard.message.length > 70 && (
              <div className="border-t border-[#E8DCCB] bg-[#FFFDF8] px-5 py-4">
                <p
                  className="mx-auto max-w-2xl whitespace-pre-wrap text-center text-[13px] leading-[1.9] tracking-[0.04em] text-[#6F5648] sm:text-[14px]"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {visiblePostcard.message}
                </p>
              </div>
            )}
            <div className="border-t border-[#E8DCCB] bg-[#FFF9F1] px-4 py-2.5 sm:px-5 sm:py-3">
              <p
                className="text-center text-[11px] leading-[1.5] text-[#A38D6B] sm:text-xs"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                {compositedImageStatus === "ready"
                  ? "長按照片可儲存包含文字的明信片"
                  : compositedImageStatus === "error"
                    ? "明信片文字已顯示，請稍後再長按儲存"
                    : "正在產生可儲存的明信片"}
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
