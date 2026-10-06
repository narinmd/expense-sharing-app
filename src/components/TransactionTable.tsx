import { ExpenseRecord } from "@/modules/expenses/expense.types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function TransactionTable({ expenses }: { expenses: ExpenseRecord[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction History
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent expenses recorded between users.
        </p>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm italic text-slate-500">
          No transactions recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Paid By</th>
                <th className="pb-3 font-medium">For</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="py-3 font-medium text-slate-900">
                    {expense.description}
                  </td>

                  <td className="py-3 text-slate-700">{expense.payerName}</td>

                  <td className="py-3 text-slate-600">
                    {expense.recipientName}
                  </td>

                  <td className="py-3 font-medium text-slate-900">
                    ${expense.amount.toFixed(2)}
                  </td>

                  <td className="py-3 text-slate-500">
                    {dateFormatter.format(new Date(expense.date))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
