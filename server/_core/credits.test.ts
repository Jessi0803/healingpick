import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./context";
import { chargeReading, isCreditsEnabled } from "./credits";
import { isSupabaseConfigured } from "./supabase";
import { spendForReading, spendPaidCredit } from "../db";

vi.mock("./supabase", () => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("../db", () => ({
  spendForReading: vi.fn(),
  spendPaidCredit: vi.fn(),
}));

const mockIsSupabaseConfigured = vi.mocked(isSupabaseConfigured);
const mockSpendForReading = vi.mocked(spendForReading);
const mockSpendPaidCredit = vi.mocked(spendPaidCredit);

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
    expect(mockSpendPaidCredit).not.toHaveBeenCalled();
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

  it("requires sign-in even when an anonymous visitor identity is present", async () => {
    await expect(
      chargeReading(baseContext({ anonId: "anon-123456", ipHash: "ip-hash" }), "fortune")
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "NOT_SIGNED_IN",
    });

    expect(mockSpendForReading).not.toHaveBeenCalled();
    expect(mockSpendPaidCredit).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
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
