import { NetBalanceRecord } from "@/modules/expenses/expense.types";

export function BalanceCards({ balances }: { balances: NetBalanceRecord[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Current Balances
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Net amounts between users after offsetting transactions.
        </p>
      </div>

      {balances.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
          <p className="text-sm text-slate-500">All balances are settled.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {balances.map((balance) => (
            <div
              key={`${balance.debtorId}-${balance.creditorId}`}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">
                  {balance.debtorName}
                </span>

                <span className="text-slate-400">owes</span>

                <span className="font-medium text-slate-900">
                  {balance.creditorName}
                </span>
              </div>

              <span className="shrink-0 font-semibold text-slate-900">
                ${balance.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
