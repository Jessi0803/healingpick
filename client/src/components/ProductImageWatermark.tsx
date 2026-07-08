import { Instagram } from "lucide-react";
import type { CSSProperties, ImgHTMLAttributes } from "react";
import { getProductImageStyle, type Product } from "@/data/products";

const WATERMARKED_PRODUCT_SLUGS = new Set([
  "xi-guang",
  "nuan-ying",
  "jing-lan",
]);
const WATERMARK_TEXT = "liang_07077";

type ProductImageWatermarkProps = {
  product: Product;
  src?: string;
  alt: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  watermarkClassName?: string;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, "loading">;

export default function ProductImageWatermark({
  product,
  src = product.img,
  alt,
  imageClassName = "h-full w-full object-cover",
  imageStyle,
  watermarkClassName = "",
  loading,
}: ProductImageWatermarkProps) {
  const showWatermark = WATERMARKED_PRODUCT_SLUGS.has(product.slug);

  return (
    <div className="relative h-full w-full">
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={imageClassName}
        style={{ ...getProductImageStyle(product), ...imageStyle }}
      />
      {showWatermark && (
        <div
          className={`pointer-events-none absolute bottom-2 right-2 flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full bg-black/42 px-2 py-1 text-[9px] leading-[1.35] tracking-normal text-white/95 shadow-sm backdrop-blur-sm ${watermarkClassName}`}
          aria-hidden="true"
        >
          <Instagram className="h-3 w-3 flex-shrink-0" strokeWidth={1.8} />
          <span className="whitespace-nowrap pb-px font-mono">
            {WATERMARK_TEXT}
          </span>
        </div>
      )}
    </div>
  );
}
