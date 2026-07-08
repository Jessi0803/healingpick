import { Check, Plus } from "lucide-react";
import SalePrice from "@/components/SalePrice";
import { AMETHYST_CHIPS_ADD_ON } from "@/data/cartAddOns";
import { useCart } from "@/contexts/CartContext";
import { canShowAmethystChipsAddOn } from "@shared/cartRules";
import { getDiscountedPrice } from "@shared/productPricing";

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
            <SalePrice
              price={AMETHYST_CHIPS_ADD_ON.price}
              className="flex flex-wrap items-baseline gap-2"
              originalClassName="text-[11px] tracking-[0.08em] text-[#31353A]/42 line-through"
              saleClassName="text-[13px] tracking-[0.08em] text-[#8C6FA8]"
            />
            <button
              type="button"
              onClick={() =>
                addItem({
                  ...AMETHYST_CHIPS_ADD_ON,
                  originalPrice: AMETHYST_CHIPS_ADD_ON.price,
                  price: getDiscountedPrice(AMETHYST_CHIPS_ADD_ON.price),
                })
              }
              disabled={isAdded}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#8C6FA8]/35 bg-white/72 px-4 text-[11px] tracking-[0.16em] text-[#7A5F95] shadow-[0_8px_22px_rgba(140,111,168,0.12)] transition-[background-color,border-color,color,box-shadow,transform] hover:border-[#8C6FA8]/70 hover:bg-[#8C6FA8] hover:text-white hover:shadow-[0_10px_26px_rgba(140,111,168,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6FA8]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F3FB] active:scale-[0.98] disabled:cursor-default disabled:border-[#D1BE9B]/35 disabled:bg-[#FAF7F4]/70 disabled:text-[#8A7250]/70 disabled:shadow-none"
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
