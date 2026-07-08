import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import CartAddOnOffer from "@/components/CartAddOnOffer";
import CartBenefitNotice from "@/components/CartBenefitNotice";
import CartGiftNotice from "@/components/CartGiftNotice";
import PageLayout from "@/components/PageLayout";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import SalePrice from "@/components/SalePrice";
import { useCart } from "@/contexts/CartContext";
import { CLEAR_QUARTZ_CHIPS_GIFT } from "@/data/cartAddOns";
import { findProduct } from "@/data/products";
import { trpc } from "@/lib/trpc";
import { canShowAmethystChipsAddOn, validateCartRules } from "@shared/cartRules";
import { getDiscountedPrice } from "@shared/productPricing";

type CustomerForm = {
  customerName: string;
  email: string;
  phone: string;
  wristSize: string;
  fit: "貼手" | "剛好" | "微鬆";
  postalCode: string;
  city: string;
  district: string;
  streetAddress: string;
};

const LINE_URL = "https://lin.ee/zqRShGd";

const initialForm: CustomerForm = {
  customerName: "",
  email: "",
  phone: "",
  wristSize: "",
  fit: "剛好",
  postalCode: "",
  city: "",
  district: "",
  streetAddress: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart, openCart } = useCart();
  const [form, setForm] = useState<CustomerForm>(initialForm);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payuni");
    if (!status) return;
    if (status === "success") {
      clearCart();
      toast.success("付款完成，訂單已成立");
    } else if (status === "pending") {
      clearCart();
      toast.info("訂單已建立，完成付款後我們會開始安排。");
    } else if (status === "error") {
      toast.error("付款結果驗證失敗，請聯繫客服協助查核。");
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, [clearCart]);

  const createOrderMutation = trpc.shop.createOrder.useMutation({
    onSuccess: ({ checkout }) => {
      setForm(initialForm);
      const payuniForm = document.createElement("form");
      payuniForm.method = "POST";
      payuniForm.action = checkout.action;
      payuniForm.style.display = "none";
      Object.entries(checkout.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        payuniForm.appendChild(input);
      });
      document.body.appendChild(payuniForm);
      payuniForm.submit();
    },
    onError: error => {
      if (error.message === "PAYUNI_NOT_CONFIGURED") {
        toast.error("金流尚未完成設定，請稍後再試。");
        return;
      }
      toast.error(error.message || "訂單送出失敗，請稍後再試。");
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("購物車目前沒有商品。");
      return;
    }
    const ruleError = validateCartRules(items);
    if (ruleError) {
      toast.error(ruleError);
      return;
    }
    const address = [
      form.postalCode,
      form.city,
      form.district,
      form.streetAddress,
    ].join("");
    createOrderMutation.mutate({
      customerName: form.customerName,
      email: form.email,
      phone: form.phone,
      wristSize: form.wristSize,
      fit: form.fit,
      address,
      items: [
        ...items.map(item => {
          const originalPrice =
            item.originalPrice ?? findProduct(item.slug)?.price ?? item.price;
          return {
            slug: item.slug,
            name: item.name,
            price: getDiscountedPrice(originalPrice),
            quantity: item.quantity,
          };
        }),
        {
          slug: CLEAR_QUARTZ_CHIPS_GIFT.slug,
          name: CLEAR_QUARTZ_CHIPS_GIFT.name,
          price: CLEAR_QUARTZ_CHIPS_GIFT.price,
          quantity: 1,
        },
      ],
    });
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#FAF7F4] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.32em] text-[#D1BE9B]"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              Checkout
            </p>
            <h1
              className="text-2xl tracking-[0.2em] text-[#31353A] md:text-3xl"
              style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
            >
              結帳資料
            </h1>
          </div>

          {items.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-[#D1BE9B]/35 bg-white/45 px-6 py-14 text-center">
              <ShoppingBag
                className="mx-auto mb-4 text-[#A38D6B]/70"
                size={28}
              />
              <p className="mb-6 text-sm tracking-[0.16em] text-[#31353A]/58">
                購物車目前沒有商品
              </p>
              <Link href="/shop">
                <button
                  type="button"
                  className="rounded-full bg-[#31353A] px-6 py-3 text-xs tracking-[0.2em] text-[#FAF7F4] transition hover:bg-[#D1BE9B] hover:text-[#31353A]"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  返回商店
                </button>
              </Link>
            </section>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              <section className="rounded-2xl border border-[#D1BE9B]/20 bg-white/48 p-5 md:p-6">
                <div className="mb-5">
                  <p
                    className="text-[12px] tracking-[0.18em] text-[#31353A]/72"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    收件與手圍資料
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <OrderInput
                    label="姓名"
                    value={form.customerName}
                    onChange={customerName =>
                      setForm(current => ({ ...current, customerName }))
                    }
                    required
                  />
                  <OrderInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={email =>
                      setForm(current => ({ ...current, email }))
                    }
                    required
                  />
                  <OrderInput
                    label="手機號碼"
                    type="tel"
                    value={form.phone}
                    onChange={phone =>
                      setForm(current => ({ ...current, phone }))
                    }
                    required
                  />
                  <OrderInput
                    label="手圍大小"
                    placeholder="例如 15.5 cm"
                    value={form.wristSize}
                    onChange={wristSize =>
                      setForm(current => ({ ...current, wristSize }))
                    }
                    hint="手圍量法：拿軟尺平貼手腕繞一圈量測。沒有軟尺時，可以用棉線或紙條繞手圍，用筆做記號後，再用一般直尺量那段長度。"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-[11px] tracking-[0.16em] text-[#A38D6B]">
                    配戴鬆緊
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["貼手", "剛好", "微鬆"] as const).map(fit => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() =>
                          setForm(current => ({ ...current, fit }))
                        }
                        className={`rounded-full border px-3 py-2.5 text-xs tracking-[0.14em] transition ${
                          form.fit === fit
                            ? "border-[#31353A] bg-[#31353A] text-[#FAF7F4]"
                            : "border-[#D1BE9B]/28 bg-white/40 text-[#31353A]/68 hover:border-[#D1BE9B]/60"
                        }`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>

                <fieldset className="mt-5">
                  <legend className="mb-3 text-[11px] tracking-[0.16em] text-[#A38D6B]">
                    收件地址 <span className="text-[#D66A62]">*</span>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AddressInput
                      value={form.postalCode}
                      onChange={postalCode =>
                        setForm(current => ({ ...current, postalCode }))
                      }
                      placeholder="郵遞區號（如 100）"
                      inputMode="numeric"
                      autoComplete="postal-code"
                    />
                    <AddressInput
                      value={form.city}
                      onChange={city =>
                        setForm(current => ({ ...current, city }))
                      }
                      placeholder="縣市（如 台北市）"
                      autoComplete="address-level1"
                    />
                    <AddressInput
                      value={form.district}
                      onChange={district =>
                        setForm(current => ({ ...current, district }))
                      }
                      placeholder="鄉鎮市區（如 信義區）"
                      autoComplete="address-level2"
                      className="sm:col-span-2"
                    />
                    <AddressInput
                      value={form.streetAddress}
                      onChange={streetAddress =>
                        setForm(current => ({ ...current, streetAddress }))
                      }
                      placeholder="路名、巷號、門牌（如 信義路五段7號）"
                      autoComplete="street-address"
                      className="sm:col-span-2"
                    />
                  </div>
                </fieldset>
              </section>

              <aside className="h-fit rounded-2xl border border-[#D1BE9B]/20 bg-white/55 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p
                    className="text-[12px] tracking-[0.18em] text-[#31353A]/72"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    訂單明細
                  </p>
                  <button
                    type="button"
                    onClick={openCart}
                    className="text-[11px] tracking-[0.14em] text-[#A38D6B] underline-offset-4 transition hover:underline"
                  >
                    修改
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map(item => {
                    const product = findProduct(item.slug);
                    const originalPrice =
                      item.originalPrice ?? product?.price ?? item.price;

                    return (
                      <div
                        key={item.slug}
                        className="grid grid-cols-[52px_1fr] gap-3"
                      >
                        <div className="h-[52px] w-[52px] overflow-hidden rounded-md">
                          {product ? (
                            <ProductImageWatermark
                              product={product}
                              alt={item.name}
                              imageClassName="h-full w-full object-cover"
                              watermarkClassName="bottom-0.5 right-0.5 max-w-[calc(100%-0.25rem)] px-1 py-0.5 text-[6px] [&_svg]:h-2 [&_svg]:w-2"
                            />
                          ) : (
                            <img
                              src={item.img}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="break-words text-[12px] tracking-[0.1em] text-[#31353A]/82">
                            {item.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <SalePrice
                              price={originalPrice}
                              className="flex flex-wrap items-baseline gap-2"
                              originalClassName="text-[11px] text-[#31353A]/42 line-through"
                              saleClassName="text-[12px] text-[#A38D6B]"
                            />
                            <span className="text-[12px] text-[#31353A]/52">
                              x {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <CartGiftNotice compact />
                </div>

                {canShowAmethystChipsAddOn(items) && (
                  <div className="mt-3">
                    <CartAddOnOffer compact />
                  </div>
                )}

                <div className="mt-5 border-t border-[#D1BE9B]/16 pt-4">
                  <div className="flex items-center justify-between text-sm tracking-[0.08em] text-[#31353A]/78">
                    <span>商品小計</span>
                    <span className="text-lg text-[#A38D6B]">
                      NT$ {subtotal.toLocaleString("zh-TW")}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <CartBenefitNotice />
                </div>

                <div className="mt-4 rounded-xl border border-[#D1BE9B]/18 bg-[#FAF7F4]/58 px-4 py-3">
                  <p className="text-[10px] tracking-[0.2em] text-[#A38D6B]">
                    付款方式
                  </p>
                  <p className="mt-2 text-[12px] leading-[1.8] tracking-[0.06em] text-[#31353A]/62">
                    信用卡一次付清、Apple Pay、ATM 轉帳
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full rounded-full bg-[#31353A] px-5 py-3.5 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-md shadow-[#31353A]/10 transition hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    {createOrderMutation.isPending ? "前往中" : "前往付款"}
                  </button>
                  <a
                    href={LINE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-full border border-[#D1BE9B]/35 px-5 py-3 text-center text-xs tracking-[0.18em] text-[#8F7957] transition hover:bg-white/65"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    有問題可私訊官方 LINE
                  </a>
                </div>
              </aside>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function AddressInput({
  value,
  onChange,
  placeholder,
  className = "",
  inputMode,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputMode?: "numeric";
  autoComplete?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      required
      inputMode={inputMode}
      autoComplete={autoComplete}
      className={`h-14 w-full rounded-none border border-[#D1BE9B]/30 bg-white/72 px-4 text-sm text-[#31353A]/78 outline-none transition placeholder:text-[#31353A]/42 focus:border-[#A38D6B]/75 sm:h-[62px] sm:px-5 ${className}`}
    />
  );
}

function OrderInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-[0.16em] text-[#A38D6B]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-3 text-sm text-[#31353A]/78 outline-none transition focus:border-[#A38D6B]/70"
      />
      {hint && (
        <p className="mt-2 rounded-lg bg-[#FAF7F4]/80 px-3 py-2 text-[12px] leading-[1.8] tracking-[0.04em] text-[#31353A]/58">
          {hint}
        </p>
      )}
    </label>
  );
}
