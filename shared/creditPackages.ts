export const CREDIT_PACKAGES = [
  {
    code: "A",
    variant: "Starter Pack",
    credits: 30,
    price: 70,
    label: "Starter Pack：30 點",
    tag: "輕巧",
  },
  {
    code: "B",
    variant: "Standard Pack",
    credits: 100,
    price: 180,
    label: "Standard Pack：100 點",
    tag: "最受歡迎",
  },
  {
    code: "C",
    variant: "Premium Pack",
    credits: 300,
    price: 450,
    label: "Premium Pack：300 點",
    tag: "超值",
  },
] as const;

export type CreditPackageCode = (typeof CREDIT_PACKAGES)[number]["code"];

export function getCreditPackage(code: string) {
  return CREDIT_PACKAGES.find((p) => p.code === code);
}
