import { notFound } from "next/navigation";
import { AdminFinanceShell } from "@/components/admin-finance-shell";
import { AdminExpenses } from "@/components/admin-expenses";
import { people } from "@/lib/finance";
export default async function PersonExpensesPage({ params }: { params: Promise<{ person: string }> }) {
  const { person } = await params;
  if (person !== "mkho" && person !== "diana") notFound();
  return <AdminFinanceShell title={`${people[person]} · Ծախսեր`}><AdminExpenses person={person} /></AdminFinanceShell>;
}
