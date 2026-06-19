import { useEffect, useMemo, useRef, useState } from "react";
import { Mail, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const recordedUsers = new Set<number>();

function drivePreviewUrl(url: string) {
  const match = url.match(/[?&]id=([^&]+)/) ?? url.match(/\/d\/([^/]+)/);
  const id = match?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1600` : url;
}

export default function PostcardMailbox() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
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
  const imageUrl = useMemo(
    () => (postcard?.imageUrl ? drivePreviewUrl(postcard.imageUrl) : ""),
    [postcard?.imageUrl],
  );

  if (!isAuthenticated || !postcard) return null;

  const openPostcard = () => {
    setIsOpen(true);
    if (openedRef.current === postcard.id) return;
    openedRef.current = postcard.id;
    openMutation.mutate({ id: postcard.id });
  };

  return (
    <>
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

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#31353A]/35 px-4 py-8 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <section className="relative w-full max-w-3xl overflow-hidden rounded-[8px] border border-white/70 bg-[#FFFDF8] shadow-[0_24px_70px_rgba(49,53,58,0.24)]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
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
                  {postcard.message}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
