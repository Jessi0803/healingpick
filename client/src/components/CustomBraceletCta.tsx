import { Link } from "wouter";

import SalePrice from "@/components/SalePrice";
import { cn } from "@/lib/utils";

const CUSTOM_BRACELET_CTA = {
  href: "/shop/custom-bracelet",
  image: "/custom-bracelet/feedback-optimized/full/IMG_4832.webp",
  tag: "客製款",
  title: "想客製一條屬於自己的手鍊嗎",
  note: "依照你的狀態、色系與手圍搭配，設計圖可以討論。",
  price: 1580,
  cta: "開始客製",
};

/**
 * 推薦區塊底部的客製化手鍊出口。
 * 刻意不用 ProductCard 的語彙 —— 它不是排序清單裡的第 N 名，
 * 而是「以上都不夠貼」時的另一條路。
 */
export default function CustomBraceletCta({
  className,
}: {
  className?: string;
}) {
  return (
    <Link href={CUSTOM_BRACELET_CTA.href}>
      <div
        className={cn(
          "group mt-3 flex cursor-pointer flex-col gap-3.5 rounded-2xl border border-[#D1BE9B]/55 bg-white/72 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D1BE9B]/80 sm:flex-row sm:items-center sm:gap-4",
          className
        )}
      >
        <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-xl bg-[#F0E8DC] sm:h-14 sm:w-14">
          <img
            src={CUSTOM_BRACELET_CTA.image}
            alt={CUSTOM_BRACELET_CTA.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full bg-[#D1BE9B]/28 px-2 py-0.5 text-[10px] tracking-[0.16em] text-[#A38D6B]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            {CUSTOM_BRACELET_CTA.tag}
          </span>
          <p
            className="mt-1.5 text-[15px] leading-[1.5] tracking-[0.08em] text-[#31353A]/88"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            {CUSTOM_BRACELET_CTA.title}
          </p>
          <p
            className="mt-1 text-[12px] leading-[1.8] tracking-[0.06em] text-[#31353A]/62"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          >
            {CUSTOM_BRACELET_CTA.note}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
          <SalePrice
            price={CUSTOM_BRACELET_CTA.price}
            suffix=" 起"
            className="flex items-baseline"
            saleClassName="text-[12px] tracking-[0.06em] text-[#31353A]/52"
          />
          <span
            className="inline-flex shrink-0 items-center rounded-full bg-[#3D4144] px-4 py-2 text-[12px] tracking-[0.12em] text-[#FAF7F4] transition-colors duration-300 group-hover:bg-[#31353A]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            {CUSTOM_BRACELET_CTA.cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
