import { describe, expect, it } from "vitest";
import {
  recommendForFortune,
  recommendForTarot,
  recommendForZiwei,
} from "../client/src/data/recommend";
import { findProduct } from "../client/src/data/products";

const expectLinkedProducts = (products: ReturnType<typeof recommendForTarot>) => {
  expect(products.length).toBeGreaterThan(0);

  for (const product of products) {
    expect(findProduct(product.slug)).toBe(product);
    expect(`/shop/${product.slug}`).toMatch(/^\/shop\/[a-z0-9-]+$/);
  }
};

describe("product recommendations", () => {
  it("tarot recommendations all link to product detail pages", () => {
    const questionTypes = [
      "romance",
      "reconciliation",
      "careerChoice",
      "moneyOpportunity",
      "issueClarity",
      "choice",
      "boundaries",
      "emotions",
    ];

    for (const questionType of questionTypes) {
      const products = recommendForTarot(
        questionType,
        "我想知道接下來的感情與工作方向"
      );

      expectLinkedProducts(products);
      expect(products).toHaveLength(2);
    }
  });

  it("ziwei recommendations all link to product detail pages", () => {
    const palaceNames = [
      "命宮",
      "福德宮",
      "財帛宮",
      "田宅宮",
      "官祿宮",
      "事業宮",
      "夫妻宮",
      "子女宮",
      "兄弟宮",
      "遷移宮",
      "疾厄宮",
      "父母宮",
      "交友宮",
      "僕役宮",
    ];

    for (const palaceName of palaceNames) {
      const products = recommendForZiwei(palaceName, "女");

      expectLinkedProducts(products);
      expect(products).toHaveLength(2);
    }
  });

  it("ziwei fallback recommendations link to product detail pages", () => {
    expectLinkedProducts(recommendForZiwei(null, "女"));
    expectLinkedProducts(recommendForZiwei(null, "男"));
  });

  it("fortune recommendations all link to product detail pages", () => {
    const elements = ["火", "土", "風", "水"];

    for (const element of elements) {
      const products = recommendForFortune(element);

      expectLinkedProducts(products);
      expect(products).toHaveLength(2);
    }
  });
});
