/**
 * mochi.test.ts — Mochi AI 對話路由測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mochiRouter } from "./mochi";
import * as llmModule from "../_core/llm";

// Mock invokeLLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
  extractTextContent: vi.fn((content: string) => content),
}));

const mockInvokeLLM = vi.mocked(llmModule.invokeLLM);

// Helper: create a caller for the router
function createCaller() {
  return mochiRouter.createCaller({} as never);
}

describe("mochiRouter.chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a reply from Mochi", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: "喵～ 我在這裡陪你 ♡" } }],
    } as never);

    const caller = createCaller();
    const result = await caller.chat({
      message: "我今天很難過",
      history: [],
    });

    expect(result.reply).toBe("喵～ 我在這裡陪你 ♡");
    expect(mockInvokeLLM).toHaveBeenCalledOnce();
  });

  it("should include chat history in the LLM call", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: "我懂你的感受" } }],
    } as never);

    const caller = createCaller();
    await caller.chat({
      message: "謝謝你",
      history: [
        { role: "user", content: "我很孤單" },
        { role: "assistant", content: "喵～ 我在這裡 ♡" },
      ],
    });

    const callArgs = mockInvokeLLM.mock.calls[0][0];
    // Should have system + 2 history + 1 new message = 4 messages
    expect(callArgs.messages.length).toBe(4);
    expect(callArgs.messages[1]).toMatchObject({ role: "user", content: "我很孤單" });
    expect(callArgs.messages[2]).toMatchObject({ role: "assistant", content: "喵～ 我在這裡 ♡" });
    expect(callArgs.messages[3]).toMatchObject({ role: "user", content: "謝謝你" });
  });

  it("should include page context hint when currentPage is provided", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: "今天的牌陣很有意思" } }],
    } as never);

    const caller = createCaller();
    await caller.chat({
      message: "我抽到了愚者",
      history: [],
      currentPage: "/tarot",
    });

    const callArgs = mockInvokeLLM.mock.calls[0][0];
    const systemMessage = callArgs.messages[0];
    expect(systemMessage.role).toBe("system");
    expect(systemMessage.content).toContain("塔羅占卜");
  });

  it("should return fallback reply when LLM returns empty content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    } as never);

    const caller = createCaller();
    const result = await caller.chat({
      message: "你好",
      history: [],
    });

    expect(result.reply).toContain("Mochi");
  });

  it("should reject messages that are too long", async () => {
    const caller = createCaller();
    await expect(
      caller.chat({
        message: "a".repeat(501),
        history: [],
      })
    ).rejects.toThrow();
  });

  it("should reject empty messages", async () => {
    const caller = createCaller();
    await expect(
      caller.chat({
        message: "",
        history: [],
      })
    ).rejects.toThrow();
  });
});
