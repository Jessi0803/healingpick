export function getDiscountedPrice(price: number) {
  return Math.max(1, Math.round(price));
}

export function formatTwd(price: number) {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
