import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, Mail, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const recordedUsers = new Set<number>();

function driveFileId(url: string) {
  const match = url.match(/[?&]id=([^&]+)/) ?? url.match(/\/d\/([^/]+)/);
  return match?.[1] ?? null;
}

function drivePreviewUrl(url: string) {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1600` : url;
}

function driveDownloadUrl(url: string) {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

function driveViewUrl(url: string) {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/view` : url;
}

export default function PostcardMailbox() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [activePostcard, setActivePostcard] = useState<typeof pendingQuery.data>(null);
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
    if (recordedUsers.has(user.id)) return;
    recordedUsers.add(user.id);
    authenticatedOpenMutation.mutate();
  }, [authenticatedOpenMutation, user?.id]);

  const postcard = pendingQuery.data;
  const visiblePostcard = activePostcard ?? postcard;
  const imageUrl = useMemo(
    () => (visiblePostcard?.imageUrl ? drivePreviewUrl(visiblePostcard.imageUrl) : ""),
    [visiblePostcard?.imageUrl],
  );
  const downloadUrl = useMemo(
    () => (visiblePostcard?.imageUrl ? driveDownloadUrl(visiblePostcard.imageUrl) : ""),
    [visiblePostcard?.imageUrl],
  );
  const originalUrl = useMemo(
    () => (visiblePostcard?.imageUrl ? driveViewUrl(visiblePostcard.imageUrl) : ""),
    [visiblePostcard?.imageUrl],
  );

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
        <button
          type="button"
          onClick={openPostcard}
          className="fixed right-5 top-[116px] z-[70] flex items-center gap-2 rounded-full border border-[#D1BE9B]/45 bg-[#FFFDF8]/92 px-4 py-2.5 text-xs tracking-[0.16em] text-[#6F5648] shadow-[0_10px_30px_rgba(138,114,80,0.16)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#C8A96A]/70 hover:text-[#A38D6B] md:right-8"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          aria-label="打開明信片通知"
        >
          <Mail size={15} strokeWidth={1.8} />
          你有一封信
        </button>
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
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/82 text-[#6F5648] shadow-sm transition hover:bg-white"
                aria-label="下載明信片圖片"
                title="下載圖片"
              >
                <Download size={17} />
              </a>
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

            <div className="relative aspect-[16/11] w-full bg-[#F8EFE5]">
              <img
                src={imageUrl}
                alt="會員明信片"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2F2722]/72 via-[#2F2722]/24 to-transparent px-5 pb-5 pt-20 md:px-8 md:pb-7">
                <p
                  className="mx-auto max-w-2xl text-center text-lg leading-[1.9] text-[#FFFDF8] drop-shadow md:text-2xl"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {visiblePostcard.message}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
