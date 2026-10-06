import {
  getAllUsers,
  getAllExpenses,
  calculateNetBalances,
} from "@/modules/expenses/expense.service";
import { ExpenseDashboard } from "@/components/ExpenseDashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [users, expenses, balances] = await Promise.all([
    getAllUsers(),
    getAllExpenses(),
    calculateNetBalances(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8 md:py-10">
      <ExpenseDashboard users={users} expenses={expenses} balances={balances} />
    </main>
  );
}
