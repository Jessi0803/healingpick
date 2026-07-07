import { Gift, Truck } from "lucide-react";

export default function CartBenefitNotice() {
  return (
    <div className="rounded-lg border border-[#D1BE9B]/20 bg-[#FAF7F4]/72 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] leading-relaxed tracking-[0.08em] text-[#31353A]/68">
        <span className="inline-flex items-center gap-1.5">
          <Truck size={14} className="text-[#A38D6B]" />
          單筆訂單享免運
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gift size={14} className="text-[#A38D6B]" />
          隨單贈送水晶碎石一包
        </span>
      </div>
    </div>
  );
}
