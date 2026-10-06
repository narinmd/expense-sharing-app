"use client";

import { useState } from "react";
import {
  UserRecord,
  ExpenseRecord,
  NetBalanceRecord,
} from "@/modules/expenses/expense.types";
import { ExpenseModal } from "./ExpenseModal";
import { BalanceCards } from "./BalanceCards";
import { TransactionTable } from "./TransactionTable";

interface Props {
  users: UserRecord[];
  expenses: ExpenseRecord[];
  balances: NetBalanceRecord[];
}

export function ExpenseDashboard({ users, expenses, balances }: Props) {
  const [activeView, setActiveView] = useState<"balances" | "expenses">(
    "balances",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Expense sharing</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Shared expenses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep track of who owes whom.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Add expense
        </button>
      </header>

      <div className="mt-6">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveView("balances")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === "balances"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Balances
            <span className="ml-1.5 text-xs text-slate-400">
              {balances.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("expenses")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === "expenses"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Expenses
            <span className="ml-1.5 text-xs text-slate-400">
              {expenses.length}
            </span>
          </button>
        </div>
      </div>

      <main className="mt-4">
        {activeView === "balances" ? (
          <BalanceCards balances={balances} />
        ) : (
          <TransactionTable expenses={expenses} />
        )}
      </main>

      <ExpenseModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
