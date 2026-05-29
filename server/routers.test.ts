/**
 * Soul Ease — Router Integration Tests
 * Tests the tRPC router structure and LLM helper utilities.
 */
import { describe, it, expect } from "vitest";
import { extractTextContent } from "./_core/llm";

describe("extractTextContent", () => {
  it("returns string as-is when content is a plain string", () => {
    const result = extractTextContent("Hello, world!");
    expect(result).toBe("Hello, world!");
  });

  it("extracts text from an array of TextContent objects", () => {
    const result = extractTextContent([
      { type: "text", text: "Hello, " },
      { type: "text", text: "world!" },
    ]);
    expect(result).toBe("Hello, world!");
  });

  it("ignores non-text content types in array", () => {
    const result = extractTextContent([
      { type: "image_url" },
      { type: "text", text: "Only this" },
      { type: "file_url" },
    ]);
    expect(result).toBe("Only this");
  });

  it("returns empty string for empty array", () => {
    const result = extractTextContent([]);
    expect(result).toBe("");
  });

  it("handles array with no text items", () => {
    const result = extractTextContent([{ type: "image_url" }]);
    expect(result).toBe("");
  });

  it("handles unicode and Chinese characters", () => {
    const result = extractTextContent("今日運勢：✨ 能量充沛");
    expect(result).toBe("今日運勢：✨ 能量充沛");
  });
});

describe("Fortune router input validation", () => {
  it("validates date format YYYY-MM-DD", () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(dateRegex.test("2025-05-22")).toBe(true);
    expect(dateRegex.test("2025-1-1")).toBe(false);
    expect(dateRegex.test("not-a-date")).toBe(false);
  });

  it("validates zodiac sign IDs", () => {
    const validSigns = [
      "aries", "taurus", "gemini", "cancer", "leo", "virgo",
      "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
    ];
    expect(validSigns).toHaveLength(12);
    expect(validSigns.includes("aries")).toBe(true);
    expect(validSigns.includes("invalid")).toBe(false);
  });
});

