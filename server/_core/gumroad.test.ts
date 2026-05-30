import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { handleGumroadPing } from "./gumroad";
import { ENV } from "./env";
import { addCredits, getDb, getUserByEmail } from "../db";

vi.mock("../db", () => ({
  addCredits: vi.fn(),
  getDb: vi.fn(),
  getUserByEmail: vi.fn(),
}));

const mockAddCredits = vi.mocked(addCredits);
const mockGetDb = vi.mocked(getDb);
const mockGetUserByEmail = vi.mocked(getUserByEmail);

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
};

function createResponse(): MockResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as unknown as MockResponse;
}

function createRequest(overrides: Partial<Request> = {}): Request {
  return {
    query: { secret: "secret" },
    body: {
      email: "buyer@example.com",
      sale_id: "sale-123",
      variants: { Version: "Standard Pack" },
    },
    ...overrides,
  } as Request;
}

function createDb(existingTransactions: unknown[] = []) {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue(existingTransactions),
        })),
      })),
    })),
  };
}

describe("handleGumroadPing", () => {
  const originalSecret = ENV.gumroadWebhookSecret;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    ENV.gumroadWebhookSecret = "secret";
    mockGetDb.mockResolvedValue(createDb() as Awaited<ReturnType<typeof getDb>>);
    mockGetUserByEmail.mockResolvedValue({
      id: 7,
      email: "buyer@example.com",
      credits: 10,
    } as Awaited<ReturnType<typeof getUserByEmail>>);
    mockAddCredits.mockResolvedValue({
      id: 7,
      email: "buyer@example.com",
      credits: 110,
    } as Awaited<ReturnType<typeof addCredits>>);
  });

  afterEach(() => {
    ENV.gumroadWebhookSecret = originalSecret;
    vi.restoreAllMocks();
  });

  it("ignores pings with an invalid webhook secret", async () => {
    const res = createResponse();

    await handleGumroadPing(createRequest({ query: { secret: "wrong" } }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledOnce();
    expect(mockAddCredits).not.toHaveBeenCalled();
  });

  it("grants the correct number of credits for a known package", async () => {
    const res = createResponse();

    await handleGumroadPing(createRequest(), res);

    expect(mockGetUserByEmail).toHaveBeenCalledWith("buyer@example.com");
    expect(mockAddCredits).toHaveBeenCalledWith(7, 100, "gumroad:sale-123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not grant credits twice for the same Gumroad sale", async () => {
    mockGetDb.mockResolvedValueOnce(createDb([{ id: 1 }]) as Awaited<ReturnType<typeof getDb>>);
    const res = createResponse();

    await handleGumroadPing(createRequest(), res);

    expect(mockAddCredits).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("ignores unknown package names without failing Gumroad retries", async () => {
    const res = createResponse();

    await handleGumroadPing(
      createRequest({
        body: {
          email: "buyer@example.com",
          sale_id: "sale-123",
          variants: { Version: "Mystery Pack" },
        },
      }),
      res
    );

    expect(mockAddCredits).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not grant credits when the buyer email has no matching app user", async () => {
    mockGetUserByEmail.mockResolvedValueOnce(undefined);
    const res = createResponse();

    await handleGumroadPing(createRequest(), res);

    expect(mockAddCredits).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
