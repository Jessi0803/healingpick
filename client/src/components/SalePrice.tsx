import { formatTwd } from "@shared/productPricing";

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
  originalClassName,
  className = "flex flex-wrap items-baseline gap-2",
  suffix = "",
}: SalePriceProps) {
  const displayOriginalPrice = originalPrice ?? price;

  return (
    <span className={className}>
      <span className={saleClassName || originalClassName}>
        {formatTwd(displayOriginalPrice)}
        {suffix}
      </span>
    </span>
  );
}
