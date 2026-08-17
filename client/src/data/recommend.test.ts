import { describe, expect, it } from "vitest";

import { CUSTOM_BRACELET_RECOMMENDATION_PRODUCT } from "./products";
import {
  recommendForCategory,
  recommendForDream,
  recommendForFortune,
  recommendForTarot,
  recommendForZiwei,
} from "./recommend";

const customBraceletSlug = CUSTOM_BRACELET_RECOMMENDATION_PRODUCT.slug;

// 客製化手鍊不再佔用推薦名額，改由 <CustomBraceletCta /> 在推薦區塊底部固定曝光。
function expectNoCustomBracelet(products: Array<{ slug: string }>) {
  expect(products.map((product) => product.slug)).not.toContain(customBraceletSlug);
}

function expectNoTestProducts(products: Array<{ slug: string; name?: string }>) {
  expect(products.some((product) => product.slug.includes("test") || product.name?.includes("測試"))).toBe(false);
}

describe("reading product recommendations", () => {
  it("leaves the custom bracelet out of tarot recommendations", () => {
    expectNoCustomBracelet(recommendForTarot("love", "最近的感情發展"));
  });

  it("leaves the custom bracelet out of AI category recommendations", () => {
    expectNoCustomBracelet(recommendForCategory("wealth"));
  });

  it("leaves the custom bracelet out of ziwei recommendations", () => {
    expectNoCustomBracelet(recommendForZiwei("夫妻宮", "女"));
  });

  it("leaves the custom bracelet out of fortune recommendations", () => {
    expectNoCustomBracelet(recommendForFortune("火"));
  });

  it("leaves the custom bracelet out of dream recommendations", () => {
    expectNoCustomBracelet(recommendForDream("夢到在走廊迷路", "近期正在整理方向感"));
  });

  it("fills every slot with a real catalogue product", () => {
    const products = recommendForTarot("love", "最近的感情發展");

    expect(products).toHaveLength(5);
    expectNoCustomBracelet(products);
  });

  it("honours a tight recommendation limit", () => {
    const products = recommendForCategory("love", 1);

    expect(products).toHaveLength(1);
    expectNoCustomBracelet(products);
  });

  it("does not recommend test products", () => {
    expectNoTestProducts(recommendForCategory("healing", 20));
    expectNoTestProducts(recommendForTarot("growth", "想確認購物流程順不順"));
  });
});
