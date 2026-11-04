import { AdminFinanceShell } from "@/components/admin-finance-shell";
import { AdminExpenses } from "@/components/admin-expenses";
export default function ExpensesPage() {
  return <AdminFinanceShell title="Ծախսեր"><AdminExpenses /></AdminFinanceShell>;
}
