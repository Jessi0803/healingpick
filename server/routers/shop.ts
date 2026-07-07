import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { productOrders } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";

const orderItemInput = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  price: z.number().int().min(0).max(100000),
  quantity: z.number().int().min(1).max(20),
});

export const shopRouter = router({
  createOrder: publicProcedure
    .input(
      z.object({
        customerName: z.string().trim().min(1, "請輸入姓名").max(80),
        email: z.string().trim().email("請輸入正確 email").max(320),
        phone: z.string().trim().min(6, "請輸入手機號碼").max(32),
        wristSize: z.string().trim().min(1, "請輸入手圍大小").max(32),
        fit: z.enum(["貼手", "剛好", "微鬆"]),
        address: z.string().trim().min(6, "請輸入完整收件地址").max(500),
        items: z.array(orderItemInput).min(1, "購物車目前沒有商品").max(30),
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

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const inserted = await db
        .insert(productOrders)
        .values({
          customerName: input.customerName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          wristSize: input.wristSize,
          fit: input.fit,
          address: input.address,
          items: JSON.stringify(input.items),
          subtotal,
        })
        .returning({
          id: productOrders.id,
          createdAt: productOrders.createdAt,
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
      };
    }),
});
