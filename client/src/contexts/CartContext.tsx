import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Minus, Plus, ShoppingBag, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import CartAddOnOffer from "@/components/CartAddOnOffer";
import CartBenefitNotice from "@/components/CartBenefitNotice";
import CartGiftNotice from "@/components/CartGiftNotice";
import ProductImageWatermark from "@/components/ProductImageWatermark";
import SalePrice from "@/components/SalePrice";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { findProduct } from "@/data/products";
import {
  canShowAmethystChipsAddOn,
  getAddItemRuleError,
  validateCartRules,
} from "@shared/cartRules";
import { getDiscountedPrice } from "@shared/productPricing";

export type CartProduct = {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  img: string;
  customization?: Record<string, string | boolean | null>;
};

type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, options?: { open?: boolean }) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "soul-ease-cart";

const CartContext = createContext<CartContextValue | null>(null);

function getCartOriginalPrice(item: CartProduct) {
  return item.originalPrice ?? findProduct(item.slug)?.price ?? item.price;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is CartItem =>
            item &&
            typeof item.slug === "string" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            typeof item.img === "string" &&
            typeof item.quantity === "number" &&
            (item.customization === undefined ||
              item.customization === null ||
              typeof item.customization === "object")
        )
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutPromptOpen, setCheckoutPromptOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + getDiscountedPrice(getCartOriginalPrice(item)) * item.quantity,
    0
  );

  const addItem: CartContextValue["addItem"] = (product, options) => {
    const ruleError = getAddItemRuleError(items, product);
    if (ruleError) {
      toast.error(ruleError);
      if (options?.open) setIsOpen(true);
      return;
    }

    setItems(current => {
      const existing = current.find(item => item.slug === product.slug);
      if (existing) {
        return current.map(item =>
          item.slug === product.slug
            ? { ...item, quantity: Math.min(20, item.quantity + 1) }
            : item
        );
      }
      const originalPrice = product.originalPrice ?? product.price;
      return [
        ...current,
        {
          ...product,
          originalPrice,
          price: getDiscountedPrice(originalPrice),
          quantity: 1,
        },
      ];
    });
    toast.success(`已加入購物車：${product.name}`);
    if (options?.open) setIsOpen(true);
  };

  const updateQuantity = (slug: string, quantity: number) => {
    setItems(current =>
      current
        .map(item =>
          item.slug === slug
            ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (slug: string) => {
    setItems(current => current.filter(item => item.slug !== slug));
  };

  const goToCheckout = () => {
    if (items.length === 0) {
      toast.error("購物車目前沒有商品。");
      return;
    }
    const ruleError = validateCartRules(items);
    if (ruleError) {
      toast.error(ruleError);
      return;
    }
    setIsOpen(false);
    setCheckoutPromptOpen(true);
  };

  const continueAsGuest = () => {
    setCheckoutPromptOpen(false);
    setLocation("/checkout");
  };

  const continueAsMember = () => {
    setCheckoutPromptOpen(false);
    window.dispatchEvent(
      new CustomEvent("open-login", {
        detail: {
          title: "會員登入",
          subtitle: "加入會員可不定時享有專屬優惠。\n登入後會直接前往結帳。",
          redirectTo: "/checkout",
        },
      })
    );
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      clearCart: () => setItems([]),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, itemCount, subtotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Dialog open={checkoutPromptOpen} onOpenChange={setCheckoutPromptOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border border-[#D1BE9B]/28 bg-[#FAF7F4] p-6 shadow-[0_24px_70px_rgba(49,53,58,0.18)] sm:max-w-md">
          <DialogTitle
            className="text-center text-[16px] tracking-[0.22em] text-[#31353A]"
            style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
          >
            選擇結帳方式
          </DialogTitle>
          <DialogDescription
            className="text-center text-[11px] leading-[1.9] tracking-[0.08em] text-[#31353A]/58"
            style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
          >
            可以先以訪客身份完成訂單，也可以登入會員保留資料與優惠通知。
          </DialogDescription>

          <div className="mt-2 grid gap-3">
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full rounded-2xl border border-[#D1BE9B]/24 bg-white/58 px-5 py-4 text-left transition hover:bg-white/80 hover:shadow-sm"
            >
              <span
                className="block text-[13px] tracking-[0.16em] text-[#31353A]"
                style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
              >
                訪客結帳
              </span>
              <span
                className="mt-1 block text-[11px] leading-[1.7] tracking-[0.06em] text-[#31353A]/56"
                style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
              >
                不登入也可以填寫資料並完成付款。
              </span>
            </button>

            <button
              type="button"
              onClick={continueAsMember}
              className="w-full rounded-2xl bg-[#31353A] px-5 py-4 text-left text-[#FAF7F4] shadow-md shadow-[#31353A]/10 transition hover:bg-[#D1BE9B] hover:text-[#31353A]"
            >
              <span className="flex items-center gap-2">
                <UserRound size={16} strokeWidth={1.6} />
                <span
                  className="text-[13px] tracking-[0.16em]"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  會員登入 / 註冊
                </span>
              </span>
              <span
                className="mt-2 block text-[11px] leading-[1.7] tracking-[0.06em] opacity-78"
                style={{ fontFamily: "Noto Sans TC, sans-serif", fontWeight: 300 }}
              >
                加入會員可不定時享有專屬優惠。
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {isOpen && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="關閉購物車"
            className="absolute inset-0 bg-[#31353A]/28 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-[#FAF7F4] shadow-[-18px_0_48px_rgba(49,53,58,0.18)]">
            <div className="sticky top-0 z-10 border-b border-[#D1BE9B]/18 bg-[#FAF7F4]/92 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-[10px] tracking-[0.28em] text-[#A38D6B]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    Checkout
                  </p>
                  <h2
                    className="mt-1 text-lg tracking-[0.18em] text-[#31353A]"
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    購物車
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#D1BE9B]/25 text-[#31353A]/70 transition hover:bg-white/70"
                  aria-label="關閉購物車"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 px-5 py-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[12px] tracking-[0.16em] text-[#31353A]/72">
                  <ShoppingBag size={15} />
                  <span
                    style={{
                      fontFamily: "Noto Serif TC, serif",
                      fontWeight: 300,
                    }}
                  >
                    已選商品
                  </span>
                </div>
                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#D1BE9B]/35 bg-white/45 px-4 py-10 text-center text-xs tracking-[0.14em] text-[#31353A]/45">
                    購物車目前沒有商品
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => {
                      const product = findProduct(item.slug);
                      const originalPrice = getCartOriginalPrice(item);

                      return (
                        <div
                          key={item.slug}
                          className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-[#D1BE9B]/18 bg-white/55 p-3"
                        >
                          <div className="h-16 w-16 overflow-hidden rounded-md">
                            {product ? (
                              <ProductImageWatermark
                                product={product}
                                alt={item.name}
                                imageClassName="h-full w-full object-cover"
                                watermarkClassName="bottom-1 right-1 max-w-[calc(100%-0.5rem)] px-1 py-0.5 text-[6px] [&_svg]:h-2 [&_svg]:w-2"
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
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words text-[13px] tracking-[0.12em] text-[#31353A]">
                                  {item.name}
                                </p>
                                <SalePrice
                                  price={originalPrice}
                                  className="mt-1 flex flex-wrap items-baseline gap-2"
                                  originalClassName="text-[11px] text-[#31353A]/42 line-through"
                                  saleClassName="text-[12px] text-[#A38D6B]"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.slug)}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#31353A]/42 transition hover:bg-[#C9837A]/10 hover:text-[#C9837A]"
                                aria-label={`移除 ${item.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="mt-3 inline-flex items-center rounded-full border border-[#D1BE9B]/25 bg-[#FAF7F4]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.slug, item.quantity - 1)
                                }
                                className="grid h-8 w-8 place-items-center text-[#31353A]/62 disabled:opacity-35"
                                disabled={item.quantity <= 1}
                                aria-label="減少數量"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-8 text-center text-xs text-[#31353A]/72">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.slug, item.quantity + 1)
                                }
                                className="grid h-8 w-8 place-items-center text-[#31353A]/62"
                                aria-label="增加數量"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {canShowAmethystChipsAddOn(items) && (
                  <div className="mt-4">
                    <CartAddOnOffer />
                  </div>
                )}
                {items.length > 0 && (
                  <div className="mt-4">
                    <CartGiftNotice />
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-[#D1BE9B]/16 pt-4 text-sm tracking-[0.08em] text-[#31353A]/78">
                  <span>商品小計</span>
                  <span className="text-lg text-[#A38D6B]">
                    NT$ {subtotal.toLocaleString("zh-TW")}
                  </span>
                </div>
                {items.length > 0 && (
                  <div className="mt-3">
                    <CartBenefitNotice />
                  </div>
                )}
              </section>

              <div className="mt-auto grid gap-3 border-t border-[#D1BE9B]/16 pt-5">
                <button
                  type="button"
                  onClick={goToCheckout}
                  disabled={items.length === 0}
                  className="w-full rounded-full bg-[#31353A] px-5 py-3.5 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-md shadow-[#31353A]/10 transition hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  前往結帳
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full border border-[#D1BE9B]/35 px-5 py-3 text-center text-xs tracking-[0.18em] text-[#8F7957] transition hover:bg-white/65"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  繼續逛逛
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
