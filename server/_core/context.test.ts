import { beforeEach, describe, expect, it, vi } from "vitest";
import { createContext } from "./context";
import { verifyAccessToken } from "./supabase";
import { getPreferredUserByEmail, getUserByOpenId, touchUserSignInById, upsertUser } from "../db";

vi.mock("./supabase", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("../db", () => ({
  getPreferredUserByEmail: vi.fn(),
  getUserByOpenId: vi.fn(),
  touchUserSignInById: vi.fn(),
  upsertUser: vi.fn(),
}));

const mockVerifyAccessToken = vi.mocked(verifyAccessToken);
const mockGetPreferredUserByEmail = vi.mocked(getPreferredUserByEmail);
const mockGetUserByOpenId = vi.mocked(getUserByOpenId);
const mockTouchUserSignInById = vi.mocked(touchUserSignInById);
const mockUpsertUser = vi.mocked(upsertUser);

function createOptions(headers: Record<string, string | string[] | undefined> = {}) {
  return {
    req: {
      headers,
      socket: { remoteAddress: "203.0.113.10" },
    },
    res: {},
  } as Parameters<typeof createContext>[0];
}

describe("createContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps public requests anonymous while preserving valid anon and IP identities", async () => {
    const ctx = await createContext(createOptions({ "x-anon-id": "anon_123456" }));

    expect(ctx.user).toBeNull();
    expect(ctx.anonId).toBe("anon_123456");
    expect(ctx.ipHash).toMatch(/^[a-f0-9]{32}$/);
    expect(mockVerifyAccessToken).not.toHaveBeenCalled();
  });

  it("rejects malformed anonymous ids", async () => {
    const ctx = await createContext(createOptions({ "x-anon-id": "../bad" }));

    expect(ctx.anonId).toBeNull();
    expect(ctx.ipHash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("uses an existing app user for a valid bearer token", async () => {
    mockVerifyAccessToken.mockResolvedValueOnce({
      id: "supabase-user",
      email: "user@example.com",
      name: "User",
    });
    mockGetPreferredUserByEmail.mockResolvedValueOnce(undefined);
    mockGetUserByOpenId.mockResolvedValueOnce({
      id: 9,
      openId: "supabase-user",
      email: "user@example.com",
      name: "User",
    } as Awaited<ReturnType<typeof getUserByOpenId>>);

    const ctx = await createContext(createOptions({ authorization: "Bearer token-123" }));

    expect(mockVerifyAccessToken).toHaveBeenCalledWith("token-123");
    expect(mockGetUserByOpenId).toHaveBeenCalledWith("supabase-user");
    expect(mockUpsertUser).not.toHaveBeenCalled();
    expect(ctx.user?.id).toBe(9);
  });

  it("reuses an existing app user with the same email when the auth id is new", async () => {
    mockVerifyAccessToken.mockResolvedValueOnce({
      id: "new-provider-id",
      email: "user@example.com",
      name: "Provider Name",
    });
    mockGetUserByOpenId.mockResolvedValueOnce(undefined);
    mockGetPreferredUserByEmail.mockResolvedValueOnce({
      id: 12,
      openId: "line:owner",
      email: "user@example.com",
      name: "Existing User",
      loginMethod: "line",
    } as Awaited<ReturnType<typeof getPreferredUserByEmail>>);
    mockTouchUserSignInById.mockResolvedValueOnce({
      id: 12,
      openId: "line:owner",
      email: "user@example.com",
      name: "Existing User",
      loginMethod: "line",
    } as Awaited<ReturnType<typeof touchUserSignInById>>);

    const ctx = await createContext(createOptions({ authorization: "Bearer token-789" }));

    expect(mockGetPreferredUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(mockTouchUserSignInById).toHaveBeenCalledWith(12, {
      email: "user@example.com",
      name: "Provider Name",
      loginMethod: "line",
    });
    expect(mockUpsertUser).not.toHaveBeenCalled();
    expect(ctx.user?.id).toBe(12);
  });

  it("keeps the canonical account email when signing in through an alias", async () => {
    mockVerifyAccessToken.mockResolvedValueOnce({
      id: "alias-provider-id",
      email: "alias@example.com",
      name: "Alias Name",
    });
    mockGetUserByOpenId.mockResolvedValueOnce(undefined);
    mockGetPreferredUserByEmail.mockResolvedValueOnce({
      id: 12,
      openId: "primary-provider-id",
      email: "primary@example.com",
      name: "Primary User",
      loginMethod: "email",
    } as Awaited<ReturnType<typeof getPreferredUserByEmail>>);
    mockTouchUserSignInById.mockResolvedValueOnce({
      id: 12,
      openId: "primary-provider-id",
      email: "primary@example.com",
      name: "Primary User",
      loginMethod: "email",
    } as Awaited<ReturnType<typeof touchUserSignInById>>);

    const ctx = await createContext(createOptions({ authorization: "Bearer token-alias" }));

    expect(mockGetPreferredUserByEmail).toHaveBeenCalledWith("alias@example.com");
    expect(mockTouchUserSignInById).toHaveBeenCalledWith(12, {
      email: "primary@example.com",
      name: "Alias Name",
      loginMethod: "email",
    });
    expect(ctx.user?.id).toBe(12);
  });

  it("prefers the canonical email user when the bearer token matches a duplicate user", async () => {
    mockVerifyAccessToken.mockResolvedValueOnce({
      id: "duplicate-provider-id",
      email: "user@example.com",
      name: "Provider Name",
    });
    mockGetUserByOpenId.mockResolvedValueOnce({
      id: 14,
      openId: "duplicate-provider-id",
      email: "user@example.com",
      name: "Duplicate User",
      loginMethod: "email",
      role: "user",
    } as Awaited<ReturnType<typeof getUserByOpenId>>);
    mockGetPreferredUserByEmail.mockResolvedValueOnce({
      id: 12,
      openId: "line:owner",
      email: "user@example.com",
      name: "Admin User",
      loginMethod: "line",
      role: "admin",
    } as Awaited<ReturnType<typeof getPreferredUserByEmail>>);
    mockTouchUserSignInById.mockResolvedValueOnce({
      id: 12,
      openId: "line:owner",
      email: "user@example.com",
      name: "Admin User",
      loginMethod: "line",
      role: "admin",
    } as Awaited<ReturnType<typeof touchUserSignInById>>);

    const ctx = await createContext(createOptions({ authorization: "Bearer token-duplicate" }));

    expect(mockTouchUserSignInById).toHaveBeenCalledWith(12, {
      email: "user@example.com",
      name: "Provider Name",
      loginMethod: "line",
    });
    expect(ctx.user?.id).toBe(12);
  });

  it("creates an app user on first authenticated sign-in", async () => {
    mockVerifyAccessToken.mockResolvedValueOnce({
      id: "new-supabase-user",
      email: "new@example.com",
      name: "New User",
    });
    mockGetUserByOpenId.mockResolvedValueOnce(undefined);
    mockGetPreferredUserByEmail.mockResolvedValueOnce(undefined);
    mockUpsertUser.mockResolvedValueOnce({
      id: 10,
      openId: "new-supabase-user",
      email: "new@example.com",
      name: "New User",
      loginMethod: "email",
    } as Awaited<ReturnType<typeof upsertUser>>);

    const ctx = await createContext(createOptions({ authorization: "Bearer token-456" }));

    expect(mockUpsertUser).toHaveBeenCalledWith({
      openId: "new-supabase-user",
      email: "new@example.com",
      name: "New User",
      loginMethod: "email",
    });
    expect(ctx.user?.id).toBe(10);
  });

  it("falls back to anonymous context when token verification fails", async () => {
    mockVerifyAccessToken.mockRejectedValueOnce(new Error("bad token"));

    const ctx = await createContext(createOptions({ authorization: "Bearer bad-token" }));

    expect(ctx.user).toBeNull();
    expect(ctx.ipHash).toMatch(/^[a-f0-9]{32}$/);
  });
});
