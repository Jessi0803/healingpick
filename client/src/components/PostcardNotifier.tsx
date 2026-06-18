import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

export default function PostcardNotifier() {
  const { user, isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const createdForUserRef = useRef<number | null>(null);
  const notifiedPostcardRef = useRef<number | null>(null);
  const utils = trpc.useUtils();

  const latestUnread = trpc.postcards.latestUnread.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
    staleTime: 30_000,
  });

  const maybeCreate = trpc.postcards.maybeCreate.useMutation({
    onSuccess: async () => {
      await utils.postcards.latestUnread.invalidate();
    },
  });

  const markSeen = trpc.postcards.markSeen.useMutation({
    onSuccess: async () => {
      await utils.postcards.latestUnread.invalidate();
    },
  });

  useEffect(() => {
    if (!isAuthenticated || loading || !user?.id) return;
    if (createdForUserRef.current === user.id) return;
    const sessionKey = `soul-ease-postcard-return-${user.id}`;
    if (window.sessionStorage.getItem(sessionKey) === "1") return;
    window.sessionStorage.setItem(sessionKey, "1");
    createdForUserRef.current = user.id;
    maybeCreate.mutate();
  }, [isAuthenticated, loading, maybeCreate, user?.id]);

  const postcard = latestUnread.data;

  useEffect(() => {
    if (!postcard || notifiedPostcardRef.current === postcard.id) return;
    notifiedPostcardRef.current = postcard.id;
    setOpen(true);
    toast("你收到一張心靈明信片", {
      description: "點開看看今天留給你的溫柔小提醒。",
      action: {
        label: "打開",
        onClick: () => setOpen(true),
      },
      duration: 9000,
    });
  }, [postcard]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && postcard && !postcard.seenAt) {
      markSeen.mutate({ id: postcard.id });
    }
  };

  if (!postcard) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#D8C7AD] bg-[#FFFDF8] p-4 sm:max-w-3xl sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-[#31353A]">
            <Sparkles className="size-5 text-[#A8794C]" />
            你的心靈明信片
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-md border border-[#D8C7AD]/70 bg-white">
          <img
            src={postcard.imageUrl}
            alt="心靈明信片"
            className="aspect-[3/2] w-full bg-[#F7EFE6] object-contain"
          />
        </div>
        <p className="text-sm leading-7 text-[#5D554D]">{postcard.message}</p>
        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-[#31353A] text-white hover:bg-[#454B52]"
            onClick={() => handleOpenChange(false)}
          >
            收下這張小卡
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
