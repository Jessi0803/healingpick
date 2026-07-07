export type CartRuleItem = {
  slug: string;
  name?: string;
  quantity?: number;
};

export const AMETHYST_CHIPS_ADD_ON_SLUG = "amethyst-chips-100g";
export const CLEAR_QUARTZ_CHIPS_GIFT_SLUG = "clear-quartz-chips-gift";

export const SOLO_CHECKOUT_PRODUCT_SLUGS = [
  "xi-guang",
  "nuan-ying",
  "jing-lan",
] as const;

const SOLO_CHECKOUT_PRODUCT_NAMES = ["曦光", "暖櫻", "靜瀾"] as const;

export function isSoloCheckoutProductSlug(slug: string) {
  return SOLO_CHECKOUT_PRODUCT_SLUGS.includes(
    slug as (typeof SOLO_CHECKOUT_PRODUCT_SLUGS)[number]
  );
}

export function hasSoloCheckoutProduct(items: CartRuleItem[]) {
  return items.some((item) => isSoloCheckoutProductSlug(item.slug));
}

export function canShowAmethystChipsAddOn(items: CartRuleItem[]) {
  return items.length > 0 && !hasSoloCheckoutProduct(items);
}

export function validateCartRules(items: CartRuleItem[]) {
  const ruleItems = items.filter(
    (item) => item.slug !== CLEAR_QUARTZ_CHIPS_GIFT_SLUG
  );
  const soloItem = ruleItems.find((item) => isSoloCheckoutProductSlug(item.slug));
  if (!soloItem) return null;

  const uniqueSlugs = new Set(ruleItems.map((item) => item.slug));
  if (uniqueSlugs.size > 1) {
    return `${soloItem.name ?? "此商品"}需單獨結帳，不能與其他商品一起結帳。`;
  }

  if (soloItem.slug === AMETHYST_CHIPS_ADD_ON_SLUG) {
    return "紫水晶碎石不能與此商品一起加購。";
  }

  return null;
}

export function getAddItemRuleError(
  currentItems: CartRuleItem[],
  product: CartRuleItem
) {
  const existing = currentItems.find((item) => item.slug === product.slug);
  if (existing) return null;

  const currentSoloItem = currentItems.find((item) =>
    isSoloCheckoutProductSlug(item.slug)
  );
  if (currentSoloItem) {
    if (product.slug === AMETHYST_CHIPS_ADD_ON_SLUG) {
      return `${currentSoloItem.name ?? "此商品"}不能加購紫水晶碎石。`;
    }
    return `${currentSoloItem.name ?? "此商品"}需單獨結帳，不能與其他商品一起結帳。`;
  }

  if (isSoloCheckoutProductSlug(product.slug) && currentItems.length > 0) {
    return `${product.name ?? "此商品"}需單獨結帳，請先清空購物車再加入。`;
  }

  return null;
}

export function getSoloCheckoutProductNames() {
  return [...SOLO_CHECKOUT_PRODUCT_NAMES];
}
