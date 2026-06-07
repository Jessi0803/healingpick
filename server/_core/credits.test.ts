import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./context";
import { chargeReading, isCreditsEnabled } from "./credits";
import { isSupabaseConfigured } from "./supabase";
import { getVisitorCreditState, spendForReading, spendVisitorFree } from "../db";

vi.mock("./supabase", () => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("../db", () => ({
  getVisitorCreditState: vi.fn(),
  spendForReading: vi.fn(),
  spendVisitorFree: vi.fn(),
}));

const mockGetVisitorCreditState = vi.mocked(getVisitorCreditState);
const mockIsSupabaseConfigured = vi.mocked(isSupabaseConfigured);
const mockSpendForReading = vi.mocked(spendForReading);
const mockSpendVisitorFree = vi.mocked(spendVisitorFree);

function baseContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    user: null,
    anonId: null,
    ipHash: null,
    ...overrides,
  };
}

describe("credits gating", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://example";
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it("is enabled only when Supabase and DATABASE_URL are configured", () => {
    expect(isCreditsEnabled()).toBe(true);

    mockIsSupabaseConfigured.mockReturnValue(false);
    expect(isCreditsEnabled()).toBe(false);

    mockIsSupabaseConfigured.mockReturnValue(true);
    delete process.env.DATABASE_URL;
    expect(isCreditsEnabled()).toBe(false);
  });

  it("charges signed-in users through the credit ledger", async () => {
    mockSpendForReading.mockResolvedValueOnce({
      ok: true,
      usedFree: true,
      state: { credits: 5, freeRemaining: 1, dailyFreeQuota: 2 },
    });

    await chargeReading(
      baseContext({
        user: { id: 42 } as NonNullable<TrpcContext["user"]>,
      }),
      "tarot"
    );

    expect(mockSpendForReading).toHaveBeenCalledWith(42, "tarot");
    expect(mockSpendVisitorFree).not.toHaveBeenCalled();
  });

  it("blocks signed-in users when free quota and credits are exhausted", async () => {
    mockSpendForReading.mockResolvedValueOnce({ ok: false, reason: "insufficient" });

    await expect(
      chargeReading(
        baseContext({
          user: { id: 42 } as NonNullable<TrpcContext["user"]>,
        }),
        "ziwei"
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "INSUFFICIENT_CREDITS",
    });
  });

  it("charges anonymous visitors against browser and IP quota", async () => {
    mockGetVisitorCreditState.mockResolvedValueOnce({
      credits: 0,
      freeRemaining: 2,
      dailyFreeQuota: 2,
    });
    mockSpendVisitorFree.mockResolvedValueOnce({
      ok: true,
      usedFree: true,
      state: { credits: 0, freeRemaining: 1, dailyFreeQuota: 2 },
    });

    await chargeReading(baseContext({ anonId: "anon-123456", ipHash: "ip-hash" }), "fortune");

    expect(mockGetVisitorCreditState).toHaveBeenCalledWith("anon-123456", "ip-hash");
    expect(mockSpendVisitorFree).toHaveBeenCalledWith("anon-123456", "ip-hash");
    expect(mockSpendForReading).not.toHaveBeenCalled();
  });

  it("requires login after the anonymous visitor has used a free reading", async () => {
    mockGetVisitorCreditState.mockResolvedValueOnce({
      credits: 0,
      freeRemaining: 1,
      dailyFreeQuota: 2,
    });

    await expect(
      chargeReading(baseContext({ anonId: "anon-123456", ipHash: "ip-hash" }), "tarot")
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "LOGIN_REQUIRED_FOR_FREE_READING",
    });

    expect(mockSpendVisitorFree).not.toHaveBeenCalled();
  });

  it("requires either a signed-in user or anonymous quota identity", async () => {
    await expect(chargeReading(baseContext(), "tarot")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "NOT_SIGNED_IN",
    });
  });

  it("fails open when the database spend call reports no_db", async () => {
    mockSpendForReading.mockResolvedValueOnce({ ok: false, reason: "no_db" });

    await expect(
      chargeReading(
        baseContext({
          user: { id: 42 } as NonNullable<TrpcContext["user"]>,
        }),
        "tarot"
      )
    ).resolves.toBeUndefined();
  });
});
