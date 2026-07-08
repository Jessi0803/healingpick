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

function expectCustomBracelet(products: Array<{ slug: string }>) {
  expect(products.map((product) => product.slug)).toContain(customBraceletSlug);
}

describe("reading product recommendations", () => {
  it("includes the custom bracelet option for tarot recommendations", () => {
    expectCustomBracelet(recommendForTarot("love", "最近的感情發展"));
  });

  it("includes the custom bracelet option for AI category recommendations", () => {
    expectCustomBracelet(recommendForCategory("wealth"));
  });

  it("includes the custom bracelet option for ziwei recommendations", () => {
    expectCustomBracelet(recommendForZiwei("夫妻宮", "女"));
  });

  it("includes the custom bracelet option for fortune recommendations", () => {
    expectCustomBracelet(recommendForFortune("火"));
  });

  it("includes the custom bracelet option for dream recommendations", () => {
    expectCustomBracelet(recommendForDream("夢到在走廊迷路", "近期正在整理方向感"));
  });

  it("keeps the custom bracelet option even when the recommendation limit is tight", () => {
    const products = recommendForCategory("love", 1);

    expect(products).toHaveLength(1);
    expectCustomBracelet(products);
  });
});
