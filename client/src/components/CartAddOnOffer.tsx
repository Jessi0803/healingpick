import { Check, Plus } from "lucide-react";
import { AMETHYST_CHIPS_ADD_ON } from "@/data/cartAddOns";
import { useCart } from "@/contexts/CartContext";
import { canShowAmethystChipsAddOn } from "@shared/cartRules";

type CartAddOnOfferProps = {
  compact?: boolean;
};

export default function CartAddOnOffer({ compact = false }: CartAddOnOfferProps) {
  const { items, addItem } = useCart();
  const isAdded = items.some(item => item.slug === AMETHYST_CHIPS_ADD_ON.slug);

  if (!canShowAmethystChipsAddOn(items)) return null;

  return (
    <section
      className={`rounded-xl border border-[#8C6FA8]/22 bg-[#F8F3FB]/70 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
        <div className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-white/60">
          <img
            src={AMETHYST_CHIPS_ADD_ON.img}
            alt={AMETHYST_CHIPS_ADD_ON.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p
            className="text-[10px] tracking-[0.2em] text-[#8C6FA8]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            加購推薦
          </p>
          <h3 className="mt-1 break-words text-[13px] tracking-[0.12em] text-[#31353A]">
            要不要加購紫水晶碎石？
          </h3>
          <p className="mt-1 text-[12px] leading-[1.65] tracking-[0.04em] text-[#31353A]/58">
            紫水晶碎石 100g，可放在盤中、角落或水晶旁一起佈置。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[13px] tracking-[0.08em] text-[#8C6FA8]">
              NT$ {AMETHYST_CHIPS_ADD_ON.price}
            </span>
            <button
              type="button"
              onClick={() => addItem(AMETHYST_CHIPS_ADD_ON)}
              disabled={isAdded}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#31353A] px-4 text-[11px] tracking-[0.16em] text-[#FAF7F4] transition hover:bg-[#8C6FA8] disabled:cursor-default disabled:bg-[#D1BE9B]/55 disabled:text-[#31353A]/62"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              {isAdded ? <Check size={14} /> : <Plus size={14} />}
              {isAdded ? "已加入" : "加入購物車"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
