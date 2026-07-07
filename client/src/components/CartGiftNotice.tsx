import { Gift } from "lucide-react";
import { CLEAR_QUARTZ_CHIPS_GIFT } from "@/data/cartAddOns";
import { useCart } from "@/contexts/CartContext";

type CartGiftNoticeProps = {
  compact?: boolean;
};

export default function CartGiftNotice({ compact = false }: CartGiftNoticeProps) {
  const { items } = useCart();
  if (items.length === 0) return null;

  return (
    <section
      className={`rounded-xl border border-[#D1BE9B]/24 bg-white/62 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
        <div className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-[#FAF7F4]">
          <img
            src={CLEAR_QUARTZ_CHIPS_GIFT.img}
            alt={CLEAR_QUARTZ_CHIPS_GIFT.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#A38D6B]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            <Gift size={13} strokeWidth={1.6} />
            贈送
          </p>
          <h3 className="mt-1 break-words text-[13px] tracking-[0.12em] text-[#31353A]">
            白水晶碎石一包
          </h3>
          <p className="mt-1 text-[12px] leading-[1.65] tracking-[0.04em] text-[#31353A]/58">
            隨訂單附上，可放在水晶旁、擴香盤或日常小角落。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#D1BE9B]/16 px-3 py-1 text-[11px] tracking-[0.16em] text-[#8F7957]">
              免費贈品
            </span>
            <span className="text-[13px] tracking-[0.08em] text-[#A38D6B]">
              NT$ 0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
