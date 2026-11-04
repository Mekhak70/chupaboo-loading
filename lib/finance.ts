export const FINANCE_ADMIN_UID = "5d86c4c6-a328-47ae-8f8e-4fa97339de14";
export type Person = "mkho" | "diana";
export const people: Record<Person, string> = { mkho: "Մխո", diana: "Դիանա" };
export type SaleSection = "cake" | "party" | "available";
export const saleSections: Record<SaleSection, string> = {
  cake: "Վաճառված տորթեր", party: "Վաճառված PartyShop", available: "Վաճառված առկա տեսականի",
};
export interface Expense {
  id: string; person: Person; expense_date: string; description: string;
  amount: number; expense_type: "operating" | "inventory";
}
export interface SaleItem {
  product_id: string; name: string; section: SaleSection; quantity: number;
  unit_price: number; unit_cost: number | null; options: Record<string, unknown> | null;
  ingredient: string | null; image: string | null;
}
export interface FinanceOrder {
  id: string; created_at: string; business_date: string; sold_at: string | null;
  status: "pending" | "sold" | "cancelled"; phone: string;
  delivery_info: Record<string, unknown>; items: SaleItem[];
  delivery_fee: number; product_total: number;
}
export const money = (value: number) => new Intl.NumberFormat("hy-AM", {
  style: "currency", currency: "AMD", maximumFractionDigits: 2,
}).format(value);
export function today() {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  return `${p.find(x => x.type === "year")!.value}-${p.find(x => x.type === "month")!.value}-${p.find(x => x.type === "day")!.value}`;
}
export const firstDay = () => `${today().slice(0,7)}-01`;
export function errorText(error: unknown) {
  return error && typeof error === "object" && "message" in error ? String(error.message) : "Գործողությունը չհաջողվեց։";
}
// Work in integer minor units so repeated sums do not accumulate float errors.
export const minor = (amount: number) => Math.round(Number(amount) * 100);
export function summarize(orders: FinanceOrder[], expenses: Expense[]) {
  const sold = orders.filter(order => order.status === "sold");
  const totals: Record<SaleSection, number> = { cake: 0, party: 0, available: 0 };
  let partyCost = 0, missingCost = 0, delivery = 0;
  for (const order of sold) {
    delivery += minor(order.delivery_fee);
    for (const item of order.items) {
      totals[item.section] += minor(item.unit_price) * item.quantity;
      if (item.section === "party") {
        if (item.unit_cost === null) missingCost += item.quantity;
        else partyCost += minor(item.unit_cost) * item.quantity;
      }
    }
  }
  const allExpenses = expenses.reduce((sum, expense) => sum + minor(expense.amount), 0);
  const operating = expenses.filter(expense => expense.expense_type !== "inventory")
    .reduce((sum, expense) => sum + minor(expense.amount), 0);
  const revenue = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  return { totals: { cake: totals.cake/100, party: totals.party/100, available: totals.available/100 },
    revenue: revenue/100, partyCost: partyCost/100, missingCost, delivery: delivery/100,
    allExpenses: allExpenses/100, operating: operating/100,
    result: (revenue - partyCost - operating)/100,
    cashResult: (revenue + delivery - allExpenses)/100 };
}
// Store and display the same rounded unit price in checkout and in its report.
export function checkoutUnitPrice(price: number, discountPercent: number = 0): number {
  const discount = price * (discountPercent / 100);
  return Math.round(Math.max(0, price - discount) * 100) / 100;
}
