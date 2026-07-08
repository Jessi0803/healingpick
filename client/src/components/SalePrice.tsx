import { formatTwd, getDiscountedPrice } from "@shared/productPricing";

type SalePriceProps = {
  price: number;
  originalPrice?: number | null;
  saleClassName?: string;
  originalClassName?: string;
  className?: string;
  suffix?: string;
};

export default function SalePrice({
  price,
  originalPrice,
  saleClassName = "text-[#A38D6B]",
  originalClassName = "text-[#31353A]/42 line-through",
  className = "flex flex-wrap items-baseline gap-2",
  suffix = "",
}: SalePriceProps) {
  const displayOriginalPrice = originalPrice ?? price;
  const salePrice = getDiscountedPrice(price);

  return (
    <span className={className}>
      <span className={originalClassName}>
        {formatTwd(displayOriginalPrice)}
        {suffix}
      </span>
      <span className={saleClassName}>
        {formatTwd(salePrice)}
        {suffix}
      </span>
    </span>
  );
}
