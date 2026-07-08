import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { z } from "zod";
import { creditTransactions, productOrders } from "../../drizzle/schema";
import { CREDIT_PACKAGES, getCreditPackage } from "../../shared/creditPackages";
import { addCredits, getDb } from "../db";
import { ENV } from "./env";
import { pushLineTextMessage } from "./line";

const PAYUNI_UPP_VERSION = "2.0";
const PAYUNI_PRODUCTION_UPP_URL = "https://api.payuni.com.tw/api/upp";
const PAYUNI_SANDBOX_UPP_URL = "https://sandbox-api.payuni.com.tw/api/upp";

const payuniPostSchema = z.object({
  MerID: z.string(),
  Version: z.string(),
  EncryptInfo: z.string(),
  HashInfo: z.string(),
  Status: z.string().optional(),
});

export type PayuniCheckoutPackageCode = (typeof CREDIT_PACKAGES)[number]["code"];

function payuniUppUrl() {
  return ENV.payuniMode === "sandbox" ? PAYUNI_SANDBOX_UPP_URL : PAYUNI_PRODUCTION_UPP_URL;
}

function payuniConfigured() {
  return Boolean(ENV.payuniMerId && ENV.payuniHashKey && ENV.payuniHashIv);
}

export function assertPayuniConfigured() {
  if (!payuniConfigured()) {
    throw new Error("PAYUNI_NOT_CONFIGURED");
  }
}

function allowedPaymentTools() {
  return {
    Credit: 1,
    ApplePay: 1,
    ATM: 1,
  };
}

function encryptPayuni(plaintext: string) {
  const cipher = crypto.createCipheriv("aes-256-gcm", ENV.payuniHashKey, Buffer.from(ENV.payuniHashIv));
  let cipherText = cipher.update(plaintext, "utf8", "base64");
  cipherText += cipher.final("base64");
  const tag = cipher.getAuthTag().toString("base64");
  return Buffer.from(`${cipherText}:::${tag}`).toString("hex").trim();
}

function decryptPayuni(encryptStr: string) {
  const [encryptData, tag] = Buffer.from(encryptStr, "hex").toString().split(":::");
  if (!encryptData || !tag) throw new Error("INVALID_PAYUNI_ENCRYPT_INFO");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENV.payuniHashKey, Buffer.from(ENV.payuniHashIv));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  let decipherText = decipher.update(encryptData, "base64", "utf8");
  decipherText += decipher.final("utf8");
  return decipherText;
}

function hashPayuni(encryptStr: string) {
  return crypto
    .createHash("sha256")
    .update(`${ENV.payuniHashKey}${encryptStr}${ENV.payuniHashIv}`)
    .digest("hex")
    .toUpperCase();
}

function objectToQuery(data: Record<string, string | number>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    params.set(key, String(value));
  }
  return params.toString();
}

function queryToObject(query: string) {
  return Object.fromEntries(new URLSearchParams(query).entries());
}

function requestBaseUrl(req: Request) {
  if (ENV.publicSiteUrl) return ENV.publicSiteUrl.replace(/\/$/, "");
  const proto = String(req.headers["x-forwarded-proto"] ?? req.protocol ?? "https").split(",")[0];
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").split(",")[0];
  return `${proto}://${host}`.replace(/\/$/, "");
}

function makeMerTradeNo(userId: number, packageCode: PayuniCheckoutPackageCode) {
  return `HP${userId}${packageCode}${Date.now().toString(36).toUpperCase()}`;
}

function parseMerTradeNo(merTradeNo: string) {
  const match = /^HP(\d+)([A-Z])([A-Z0-9]+)$/.exec(merTradeNo);
  if (!match) return null;
  return {
    userId: Number(match[1]),
    packageCode: match[2],
  };
}

export function createPayuniCheckout(input: {
  req: Request;
  userId: number;
  userEmail: string | null;
  packageCode: PayuniCheckoutPackageCode;
}) {
  assertPayuniConfigured();

  const creditPackage = getCreditPackage(input.packageCode);
  if (!creditPackage) {
    throw new Error("UNKNOWN_PACKAGE");
  }

  const baseUrl = requestBaseUrl(input.req);
  const encryptInfo: Record<string, string | number> = {
    MerID: ENV.payuniMerId,
    MerTradeNo: makeMerTradeNo(input.userId, input.packageCode),
    TradeAmt: creditPackage.price,
    Timestamp: Math.floor(Date.now() / 1000),
    ReturnURL: `${baseUrl}/api/payuni/return`,
    NotifyURL: `${baseUrl}/api/payuni/notify`,
    BackURL: `${baseUrl}/buy`,
    ProdDesc: `HealingPick ${creditPackage.variant}`,
    ...allowedPaymentTools(),
  };

  if (input.userEmail) {
    encryptInfo.UsrMail = input.userEmail;
    encryptInfo.UsrMailFix = 1;
  }

  const encrypted = encryptPayuni(objectToQuery(encryptInfo));
  return {
    action: payuniUppUrl(),
    fields: {
      MerID: ENV.payuniMerId,
      Version: PAYUNI_UPP_VERSION,
      EncryptInfo: encrypted,
      HashInfo: hashPayuni(encrypted),
    },
  };
}

function makeProductMerTradeNo(orderId: number) {
  return `HS${orderId}${Date.now().toString(36).toUpperCase()}`;
}

function parseProductMerTradeNo(merTradeNo: string) {
  const match = /^HS(\d+)([A-Z0-9]+)$/.exec(merTradeNo);
  if (!match) return null;
  return {
    orderId: Number(match[1]),
  };
}

export function createPayuniProductCheckout(input: {
  req: Request;
  orderId: number;
  email: string;
  amount: number;
  productDescription: string;
}) {
  assertPayuniConfigured();

  const baseUrl = requestBaseUrl(input.req);
  const encryptInfo: Record<string, string | number> = {
    MerID: ENV.payuniMerId,
    MerTradeNo: makeProductMerTradeNo(input.orderId),
    TradeAmt: input.amount,
    Timestamp: Math.floor(Date.now() / 1000),
    ReturnURL: `${baseUrl}/api/payuni/return`,
    NotifyURL: `${baseUrl}/api/payuni/notify`,
    BackURL: `${baseUrl}/checkout`,
    ProdDesc: input.productDescription,
    UsrMail: input.email,
    UsrMailFix: 1,
    ...allowedPaymentTools(),
  };

  const encrypted = encryptPayuni(objectToQuery(encryptInfo));
  return {
    action: payuniUppUrl(),
    fields: {
      MerID: ENV.payuniMerId,
      Version: PAYUNI_UPP_VERSION,
      EncryptInfo: encrypted,
      HashInfo: hashPayuni(encrypted),
    },
  };
}

function verifyAndDecryptPayuniPost(body: unknown) {
  if (!payuniConfigured()) throw new Error("PAYUNI_NOT_CONFIGURED");
  const parsed = payuniPostSchema.parse(body);
  if (parsed.MerID !== ENV.payuniMerId) throw new Error("PAYUNI_MERID_MISMATCH");
  if (parsed.Version !== PAYUNI_UPP_VERSION) throw new Error("PAYUNI_VERSION_MISMATCH");
  if (hashPayuni(parsed.EncryptInfo) !== parsed.HashInfo) throw new Error("PAYUNI_HASH_MISMATCH");
  return queryToObject(decryptPayuni(parsed.EncryptInfo));
}

async function grantCreditsFromPayuniResult(data: Record<string, string>) {
  if (data.Status !== "SUCCESS" || data.TradeStatus !== "1") {
    return { granted: false, reason: "not_paid" };
  }

  const parsedTrade = parseMerTradeNo(data.MerTradeNo ?? "");
  if (!parsedTrade) {
    return { granted: false, reason: "unknown_order" };
  }

  const creditPackage = getCreditPackage(parsedTrade.packageCode);
  if (!creditPackage || Number(data.TradeAmt) !== creditPackage.price) {
    return { granted: false, reason: "amount_mismatch" };
  }

  const db = await getDb();
  if (!db) {
    return { granted: false, reason: "no_db" };
  }

  const reason = `payuni:${data.MerTradeNo}`;
  const existing = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.reason, reason))
    .limit(1);
  if (existing.length > 0) {
    return { granted: false, reason: "already_processed" };
  }

  const updated = await addCredits(parsedTrade.userId, creditPackage.credits, reason);
  return {
    granted: Boolean(updated),
    reason: updated ? "paid" : "user_not_found",
  };
}

async function markProductOrderPaidFromPayuniResult(data: Record<string, string>) {
  if (data.Status !== "SUCCESS" || data.TradeStatus !== "1") {
    return { updated: false, reason: "not_paid" };
  }

  const parsedTrade = parseProductMerTradeNo(data.MerTradeNo ?? "");
  if (!parsedTrade) {
    return { updated: false, reason: "unknown_order" };
  }

  const db = await getDb();
  if (!db) {
    return { updated: false, reason: "no_db" };
  }

  const rows = await db
    .select()
    .from(productOrders)
    .where(eq(productOrders.id, parsedTrade.orderId))
    .limit(1);
  const order = rows[0];
  if (!order) {
    return { updated: false, reason: "order_not_found" };
  }
  if (order.status === "paid") {
    return { updated: false, reason: "already_paid" };
  }
  if (Number(data.TradeAmt) !== order.subtotal) {
    return { updated: false, reason: "amount_mismatch" };
  }

  await db
    .update(productOrders)
    .set({ status: "paid" })
    .where(eq(productOrders.id, parsedTrade.orderId));

  if (ENV.ownerLineUserId) {
    const itemSummary = formatProductOrderItems(order.items);
    const sent = await pushLineTextMessage(
      ENV.ownerLineUserId,
      [
        "HealingPick 有新的已付款商品訂單",
        `訂單編號：#${order.id}`,
        `金額：NT$ ${order.subtotal.toLocaleString("zh-TW")}`,
        `姓名：${order.customerName}`,
        `Email：${order.email}`,
        `電話：${order.phone}`,
        `手圍：${order.wristSize}（${order.fit}）`,
        `商品：${itemSummary}`,
        `收件地址：${order.address}`,
        `付款單號：${data.TradeNo ?? data.MerTradeNo ?? "未提供"}`,
      ].join("\n")
    );
    if (!sent) {
      console.warn("[PAYUNi] Owner LINE notification was not sent", {
        orderId: order.id,
        merTradeNo: data.MerTradeNo,
      });
    }
  }

  return { updated: true, reason: "paid" };
}

function formatProductOrderItems(itemsJson: string) {
  try {
    const items = JSON.parse(itemsJson) as Array<{
      name?: unknown;
      quantity?: unknown;
      price?: unknown;
    }>;
    if (!Array.isArray(items) || items.length === 0) return "未提供";
    return items
      .map((item) => {
        const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "未命名商品";
        const quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1;
        const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
        return `${name} x ${quantity}（NT$ ${price.toLocaleString("zh-TW")}）`;
      })
      .join("、");
  } catch {
    return "解析失敗，請至後台查看";
  }
}

function redirectHtml(target: string) {
  const safeTarget = JSON.stringify(target);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>location.replace(${safeTarget});</script></body></html>`;
}

export async function handlePayuniNotify(req: Request, res: Response) {
  try {
    const result = verifyAndDecryptPayuniPost(req.body);
    const grant = result.MerTradeNo?.startsWith("HS")
      ? await markProductOrderPaidFromPayuniResult(result)
      : await grantCreditsFromPayuniResult(result);
    console.log("[PAYUNi] Notify processed", {
      merTradeNo: result.MerTradeNo,
      tradeNo: result.TradeNo,
      status: result.Status,
      tradeStatus: result.TradeStatus,
      grant,
    });
    return res.status(200).send("OK");
  } catch (error) {
    console.error("[PAYUNi] Notify error:", error);
    return res.status(200).send("OK");
  }
}

export async function handlePayuniReturn(req: Request, res: Response) {
  const baseUrl = requestBaseUrl(req);
  try {
    const result = verifyAndDecryptPayuniPost(req.body);
    const isPaid = result.Status === "SUCCESS" && result.TradeStatus === "1";
    const status = isPaid ? "success" : "pending";
    const path = result.MerTradeNo?.startsWith("HS") ? "/checkout" : "/buy";
    return res.type("html").send(redirectHtml(`${baseUrl}${path}?payuni=${status}`));
  } catch (error) {
    console.error("[PAYUNi] Return error:", error);
    return res.type("html").send(redirectHtml(`${baseUrl}/buy?payuni=error`));
  }
}
