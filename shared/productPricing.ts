export const SITE_WIDE_DISCOUNT_RATE = 0.9;

export function getDiscountedPrice(price: number) {
  return Math.max(1, Math.round(price * SITE_WIDE_DISCOUNT_RATE));
}

export function formatTwd(price: number) {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
