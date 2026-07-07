import {
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type CartProduct = {
  slug: string;
  name: string;
  price: number;
  img: string;
};

type CartItem = CartProduct & {
  quantity: number;
};

type CustomerForm = {
  customerName: string;
  email: string;
  phone: string;
  wristSize: string;
  fit: "貼手" | "剛好" | "微鬆";
  address: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, options?: { open?: boolean }) => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "soul-ease-cart";
const LINE_URL = "https://lin.ee/zqRShGd";

const CartContext = createContext<CartContextValue | null>(null);

const initialForm: CustomerForm = {
  customerName: "",
  email: "",
  phone: "",
  wristSize: "",
  fit: "剛好",
  address: "",
};

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
            typeof item.quantity === "number"
        )
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const createOrderMutation = trpc.shop.createOrder.useMutation({
    onSuccess: ({ orderId }) => {
      setItems([]);
      setForm(initialForm);
      toast.success(`已收到訂單 #${orderId}，我們會盡快確認。`);
    },
    onError: (error) => {
      toast.error(error.message || "訂單送出失敗，請稍後再試。");
    },
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem: CartContextValue["addItem"] = (product, options) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      if (existing) {
        return current.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: Math.min(20, item.quantity + 1) }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    toast.success(`已加入購物車：${product.name}`);
    if (options?.open) setIsOpen(true);
  };

  const updateQuantity = (slug: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.slug === slug ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (slug: string) => {
    setItems((current) => current.filter((item) => item.slug !== slug));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("購物車目前沒有商品。");
      return;
    }
    createOrderMutation.mutate({
      ...form,
      items: items.map(({ slug, name, price, quantity }) => ({
        slug,
        name,
        price,
        quantity,
      })),
    });
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, itemCount, subtotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
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
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    Checkout
                  </p>
                  <h2
                    className="mt-1 text-lg tracking-[0.18em] text-[#31353A]"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    購物車與下單
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
              <div className="mt-4 rounded-lg border border-[#D1BE9B]/25 bg-white/58 px-4 py-3 text-[12px] leading-[1.8] tracking-[0.08em] text-[#8F7957]">
                下單一條免運，即贈送白水晶碎石一包。
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-5 py-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[12px] tracking-[0.16em] text-[#31353A]/72">
                  <ShoppingBag size={15} />
                  <span style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}>
                    已選商品
                  </span>
                </div>
                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#D1BE9B]/35 bg-white/45 px-4 py-10 text-center text-xs tracking-[0.14em] text-[#31353A]/45">
                    購物車目前沒有商品
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.slug}
                        className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-[#D1BE9B]/18 bg-white/55 p-3"
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words text-[13px] tracking-[0.12em] text-[#31353A]">
                                {item.name}
                              </p>
                              <p className="mt-1 text-[12px] text-[#A38D6B]">
                                NT$ {item.price.toLocaleString("zh-TW")}
                              </p>
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
                              onClick={() => updateQuantity(item.slug, item.quantity - 1)}
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
                              onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                              className="grid h-8 w-8 place-items-center text-[#31353A]/62"
                              aria-label="增加數量"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-[#D1BE9B]/16 pt-4 text-sm tracking-[0.08em] text-[#31353A]/78">
                  <span>商品小計</span>
                  <span className="text-lg text-[#A38D6B]">
                    NT$ {subtotal.toLocaleString("zh-TW")}
                  </span>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <p
                    className="text-[12px] tracking-[0.18em] text-[#31353A]/72"
                    style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                  >
                    收件與手圍資料
                  </p>
                  <p className="mt-2 rounded-lg bg-white/50 px-4 py-3 text-[12px] leading-[1.9] tracking-[0.05em] text-[#31353A]/58">
                    手圍量法：拿軟尺平貼手腕繞一圈量測。沒有軟尺時，可以用棉線或紙條繞手圍，用筆做記號後，再用一般直尺量那段長度。
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <OrderInput
                    label="姓名"
                    value={form.customerName}
                    onChange={(customerName) => setForm((current) => ({ ...current, customerName }))}
                    required
                  />
                  <OrderInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(email) => setForm((current) => ({ ...current, email }))}
                    required
                  />
                  <OrderInput
                    label="手機號碼"
                    type="tel"
                    value={form.phone}
                    onChange={(phone) => setForm((current) => ({ ...current, phone }))}
                    required
                  />
                  <OrderInput
                    label="手圍大小"
                    placeholder="例如 15.5 cm"
                    value={form.wristSize}
                    onChange={(wristSize) => setForm((current) => ({ ...current, wristSize }))}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] tracking-[0.16em] text-[#A38D6B]">
                    配戴鬆緊
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["貼手", "剛好", "微鬆"] as const).map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, fit }))}
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

                <label className="block">
                  <span className="mb-2 block text-[11px] tracking-[0.16em] text-[#A38D6B]">
                    收件地址
                  </span>
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    required
                    rows={3}
                    className="w-full resize-y rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-3 text-sm leading-[1.7] text-[#31353A]/78 outline-none transition focus:border-[#A38D6B]/70"
                  />
                </label>
              </section>

              <div className="mt-auto grid gap-3 border-t border-[#D1BE9B]/16 pt-5">
                <button
                  type="submit"
                  disabled={items.length === 0 || createOrderMutation.isPending}
                  className="w-full rounded-full bg-[#31353A] px-5 py-3.5 text-xs tracking-[0.22em] text-[#FAF7F4] shadow-md shadow-[#31353A]/10 transition hover:bg-[#D1BE9B] hover:text-[#31353A] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  {createOrderMutation.isPending ? "送出中" : "送出訂單"}
                </button>
                <a
                  href={LINE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-full border border-[#D1BE9B]/35 px-5 py-3 text-center text-xs tracking-[0.18em] text-[#8F7957] transition hover:bg-white/65"
                  style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 300 }}
                >
                  有問題可私訊官方 LINE
                </a>
              </div>
            </form>
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}

function OrderInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-[#D1BE9B]/25 bg-white/70 px-4 py-3 text-sm text-[#31353A]/78 outline-none transition focus:border-[#A38D6B]/70"
      />
    </label>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
