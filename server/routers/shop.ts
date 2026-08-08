import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { productOrders } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { pushLineTextMessage } from "../_core/line";
import { assertPayuniConfigured, createPayuniProductCheckout } from "../_core/payuni";
import { publicProcedure, router } from "../_core/trpc";
import { validateCartRules } from "../../shared/cartRules";

const orderItemInput = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  price: z.number().int().min(0).max(100000),
  quantity: z.number().int().min(1).max(20),
  customization: z
    .record(z.string(), z.union([z.string().max(2000), z.boolean(), z.null()]))
    .optional(),
});

function createDetailToken() {
  return crypto.randomBytes(24).toString("hex");
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

export const shopRouter = router({
  createOrder: publicProcedure
    .input(
      z.object({
        customerName: z.string().trim().min(1, "請輸入姓名").max(80),
        email: z.string().trim().email("請輸入正確 email").max(320),
        phone: z.string().trim().min(6, "請輸入手機號碼").max(32),
        items: z.array(orderItemInput).min(1, "購物車目前沒有商品").max(31),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      if (subtotal <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "訂單金額需大於 0",
        });
      }

      const ruleError = validateCartRules(input.items);
      if (ruleError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: ruleError,
        });
      }

      try {
        assertPayuniConfigured();
      } catch (error) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: String((error as Error)?.message ?? error),
        });
      }

      const inserted = await db
        .insert(productOrders)
        .values({
          customerName: input.customerName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          items: JSON.stringify(input.items),
          subtotal,
          detailToken: createDetailToken(),
        })
        .returning({
          id: productOrders.id,
          createdAt: productOrders.createdAt,
          detailToken: productOrders.detailToken,
        });

      const order = inserted[0];
      if (!order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Order was not created",
        });
      }

      return {
        orderId: order.id,
        createdAt: order.createdAt,
        detailToken: order.detailToken,
        checkout: createPayuniProductCheckout({
          req: ctx.req,
          orderId: order.id,
          email: input.email.toLowerCase(),
          amount: subtotal,
          productDescription: input.items
            .map((item) => `${item.name} x ${item.quantity}`)
            .join("; ")
            .slice(0, 550),
        }),
      };
    }),
  completeOrderDetails: publicProcedure
    .input(
      z.object({
        orderId: z.number().int().positive(),
        detailToken: z.string().trim().min(16).max(64),
        wristSize: z.string().trim().min(1, "請輸入手圍大小").max(32),
        fit: z.enum(["貼手", "剛好", "微鬆"]),
        address: z.string().trim().min(6, "請輸入完整收件地址").max(500),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const rows = await db
        .select()
        .from(productOrders)
        .where(and(eq(productOrders.id, input.orderId), eq(productOrders.detailToken, input.detailToken)))
        .limit(1);
      const order = rows[0];
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "找不到可補資料的訂單，請聯繫客服協助。",
        });
      }

      const nextStatus = order.status === "paid_pending_details" || order.status === "paid"
        ? "paid"
        : "details_completed";

      const updated = await db
        .update(productOrders)
        .set({
          wristSize: input.wristSize,
          fit: input.fit,
          address: input.address,
          status: nextStatus,
        })
        .where(and(eq(productOrders.id, input.orderId), eq(productOrders.detailToken, input.detailToken)))
        .returning({
          id: productOrders.id,
          customerName: productOrders.customerName,
          email: productOrders.email,
          phone: productOrders.phone,
          items: productOrders.items,
          subtotal: productOrders.subtotal,
          status: productOrders.status,
        });
      const completed = updated[0];
      if (!completed) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "訂單資料更新失敗，請稍後再試。",
        });
      }

      if (ENV.ownerLineUserId && nextStatus === "paid") {
        await pushLineTextMessage(
          ENV.ownerLineUserId,
          [
            "HealingPick 已付款商品訂單已補齊資料",
            `訂單編號：#${completed.id}`,
            `金額：NT$ ${completed.subtotal.toLocaleString("zh-TW")}`,
            `姓名：${completed.customerName}`,
            `Email：${completed.email}`,
            `電話：${completed.phone}`,
            `手圍：${input.wristSize}（${input.fit}）`,
            `商品：${formatProductOrderItems(completed.items)}`,
            `收件地址：${input.address}`,
          ].join("\n")
        );
      }

      return {
        orderId: completed.id,
        status: completed.status,
      };
    }),
});
