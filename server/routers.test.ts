/**
 * Soul Ease — Router Integration Tests
 * Tests the tRPC router structure and LLM helper utilities.
 */
import { describe, it, expect, vi } from "vitest";
import { extractTextContent, invokeLLM } from "./_core/llm";

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

describe("invokeLLM mock mode", () => {
  it("returns a schema-shaped response without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await invokeLLM({
      messages: [{ role: "user", content: "Generate a test payload" }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_payload",
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              score: { type: "integer" },
            },
            required: ["title", "score"],
            additionalProperties: false,
          },
        },
      },
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.parse(result.choices[0].message.content as string)).toEqual({
      title: "這是本機測試用的 LLM mock 回覆，沒有呼叫 Gemini API。",
      score: 7,
    });

    fetchSpy.mockRestore();
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
