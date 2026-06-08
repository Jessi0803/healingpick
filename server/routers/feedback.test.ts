import { beforeEach, describe, expect, it, vi } from "vitest";
import { feedbackRouter } from "./feedback";
import { saveReadingFeedback } from "../db";
import { notifyOwner } from "../_core/notification";

vi.mock("../db", () => ({
  saveReadingFeedback: vi.fn(),
}));

vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

const mockSaveReadingFeedback = vi.mocked(saveReadingFeedback);
const mockNotifyOwner = vi.mocked(notifyOwner);

function createCaller() {
  return feedbackRouter.createCaller({
    user: null,
    anonId: "anon_test_123",
    ipHash: "ip_hash_test",
  } as never);
}

describe("feedbackRouter.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves feedback and notifies the owner", async () => {
    mockSaveReadingFeedback.mockResolvedValueOnce(undefined);
    mockNotifyOwner.mockResolvedValueOnce(true);

    const result = await createCaller().submit({
      source: "tarot",
      message: "這次解讀很貼近我",
      context: "牌面摘要",
    });

    expect(result).toEqual({ success: true, notified: true });
    expect(mockSaveReadingFeedback).toHaveBeenCalledWith({
      userId: null,
      anonId: "anon_test_123",
      ipHash: "ip_hash_test",
      source: "tarot",
      message: "這次解讀很貼近我",
      context: "牌面摘要",
    });
    expect(mockNotifyOwner).toHaveBeenCalledOnce();
  });

  it("still succeeds when database save fails but owner notification is delivered", async () => {
    mockSaveReadingFeedback.mockRejectedValueOnce(new Error("relation does not exist"));
    mockNotifyOwner.mockResolvedValueOnce(true);

    const result = await createCaller().submit({
      source: "ziwei",
      message: "希望可以多補充感情部分",
    });

    expect(result).toEqual({ success: true, notified: true });
    expect(mockNotifyOwner).toHaveBeenCalledOnce();
  });

  it("fails when neither database save nor owner notification works", async () => {
    mockSaveReadingFeedback.mockRejectedValueOnce(new Error("Database unavailable"));
    mockNotifyOwner.mockResolvedValueOnce(false);

    await expect(
      createCaller().submit({
        source: "tarot",
        message: "想要更白話一點",
      })
    ).rejects.toThrow("Feedback delivery failed");
  });
});
