/**
 * SOUL EASE | Mochi．crystal — Product Quick View
 *
 * Recommendation cards on the reading pages open this popup instead of
 * navigating to /shop/<slug>. Leaving the page would throw away the reading
 * (it only lives in component state), so customers could never come back to
 * pick a second recommended piece.
 */

import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import SalePrice from "@/components/SalePrice";
import { getProductFitSummary, type Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { getDiscountedPrice } from "@shared/productPricing";

const SUITED_FOR_ICONS = ["♡", "𓇢𓆸", "☁︎", "⟡", "𓂃 ࣪˖", "ִֶָ𐀔"];

function QuickViewBody({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  const meanings = product.meanings.slice(0, 3);

  return (
    <div className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
      <p
        className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#8F7957]"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
      >
        {product.material}
      </p>
      <h2
        className="mb-3 pr-8 text-xl tracking-[0.16em] text-[#31353A] sm:text-2xl"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 200 }}
      >
        {product.name}
      </h2>

      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-[#D1BE9B]/20 bg-[#F0EBE3]/40">
        <ProductImageWatermark
          product={product}
          src={product.images[activeImage] ?? product.img}
          alt={product.name}
          imageClassName="h-full w-full object-cover"
        />
      </div>

      {product.images.length > 1 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {product.images.slice(0, 6).map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveImage(idx)}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${
                idx === activeImage
                  ? "border-[#D1BE9B]/70 opacity-100"
                  : "border-[#D1BE9B]/20 opacity-60 hover:opacity-90"
              }`}
              aria-label={`${product.name} 圖片 ${idx + 1}`}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <p
        className="mt-4 whitespace-pre-line text-[12.5px] leading-[1.95] tracking-[0.08em] text-[#31353A]/72"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
      >
        {product.tagline}
      </p>

      <SalePrice
        price={product.price}
        originalPrice={product.originalPrice}
        className="mt-4 flex flex-wrap items-baseline gap-3"
        originalClassName="text-sm text-[#31353A]/38 line-through"
        saleClassName="text-2xl text-[#A38D6B]"
      />

      <div className="mt-4 rounded-2xl border border-[#D1BE9B]/20 bg-white/55 px-4 py-3">
        <p
          className="mb-1 text-[10px] tracking-[0.22em] text-[#A38D6B]"
          style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
        >
          適合此刻的你
        </p>
        <p
          className="text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/68"
          style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
        >
          {getProductFitSummary(product)}
        </p>
      </div>

      {meanings.length > 0 && (
        <div className="mt-4 space-y-2">
          {meanings.map(m => (
            <div key={m.title} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0 text-[13px] leading-none">
                {m.emoji}
              </span>
              <p
                className="text-[12px] leading-[1.75] tracking-[0.06em] text-[#31353A]/70"
                style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
              >
                <span className="text-[#A38D6B]">{m.title}</span>
                <span className="text-[#31353A]/40">｜</span>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {product.suitedFor.length > 0 && (
        <div className="mt-5 border-t border-[#D1BE9B]/15 pt-4">
          <p
            className="mb-2.5 text-[10px] uppercase tracking-[0.3em] text-[#D1BE9B]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            𓂃 ࣪˖ ִֶָ𐀔 適合這樣的你
          </p>
          <ul className="space-y-1.5">
            {product.suitedFor.map((s, idx) => (
              <li key={s} className="flex items-start gap-2.5 text-left">
                <span className="mt-0.5 flex-shrink-0 text-[13px] leading-none text-[#A38D6B]">
                  {SUITED_FOR_ICONS[idx % SUITED_FOR_ICONS.length]}
                </span>
                <span
                  className="text-[12.5px] leading-[1.7] tracking-[0.06em] text-[#A38D6B]"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 400 }}
                >
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          addItem({
            slug: product.slug,
            name: product.name,
            price: getDiscountedPrice(product.originalPrice ?? product.price),
            originalPrice: product.originalPrice ?? product.price,
            img: product.img,
          })
        }
        className="mt-6 w-full rounded-full bg-[#3D4144] px-5 py-3.5 text-xs tracking-[0.2em] text-[#FAF7F4] shadow-md shadow-[#3D4144]/10 transition hover:bg-[#D1BE9B] hover:text-[#31353A] hover:shadow-[#D1BE9B]/20 active:scale-95"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
      >
        加入購物車
      </button>

      {/* Opens in a new tab so the reading behind this popup stays put. */}
      <a
        href={`/shop/${product.slug}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block w-full rounded-full border border-[#D1BE9B]/25 px-5 py-3 text-center text-xs tracking-[0.16em] text-[#31353A]/62 transition hover:bg-white/50 hover:text-[#A38D6B]"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
      >
        看完整商品介紹 ✦
      </a>

      <DialogClose
        className="mt-3 block w-full px-5 py-2 text-center text-[11px] tracking-[0.16em] text-[#31353A]/45 transition hover:text-[#31353A]/70"
        style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
      >
        ← 回到我的解讀
      </DialogClose>
    </div>
  );
}

/**
 * Wraps a recommendation card so tapping it opens the product popup.
 * Products with their own `href` (e.g. the custom bracelet flow) keep
 * navigating, since there is no catalogue page to preview.
 */
export default function ProductQuickView({
  product,
  children,
  className = "block h-full w-full text-left",
}: {
  product: Product;
  children: ReactNode;
  className?: string;
}) {
  if (product.href) {
    return (
      <Link href={product.href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger className={`cursor-pointer ${className}`}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] w-[calc(100%_-_2rem)] max-w-[30rem] sm:max-w-[30rem] overflow-y-auto border-[#D1BE9B]/30 bg-[#FFFDF8]/97 p-0 shadow-[0_28px_70px_rgba(138,114,80,0.22)] backdrop-blur-xl sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{getProductFitSummary(product)}</DialogDescription>
        </DialogHeader>
        <QuickViewBody product={product} />
      </DialogContent>
    </Dialog>
  );
}
