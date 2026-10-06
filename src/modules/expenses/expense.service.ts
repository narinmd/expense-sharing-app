import databaseConnection from "@/lib/db";
import { CreateExpenseInput } from "./expense.schema";
import { ExpenseRecord, NetBalanceRecord, UserRecord } from "./expense.types";
import { randomUUID } from "crypto";

export function getAllUsers(): UserRecord[] {
  const selectAllUsersStatement = databaseConnection.prepare(
    "SELECT id, name FROM users ORDER BY name ASC",
  );
  return selectAllUsersStatement.all() as UserRecord[];
}

export function getAllExpenses(): ExpenseRecord[] {
  const selectAllExpensesQuery = `
    SELECT 
      expenses.id,
      expenses.amount,
      expenses.description,
      expenses.date,
      expenses.paidById,
      payerUser.name AS payerName,
      expenses.expenseForId,
      recipientUser.name AS recipientName
    FROM expenses
    JOIN users AS payerUser ON expenses.paidById = payerUser.id
    JOIN users AS recipientUser ON expenses.expenseForId = recipientUser.id
    ORDER BY expenses.date DESC, expenses.createdAt DESC
  `;
  return databaseConnection
    .prepare(selectAllExpensesQuery)
    .all() as ExpenseRecord[];
}

export function createExpense(expenseInput: CreateExpenseInput) {
  const findUserStatement = databaseConnection.prepare(
    "SELECT id FROM users WHERE id = ?",
  );

  const payerExists = findUserStatement.get(expenseInput.paidById);
  const recipientExists = findUserStatement.get(expenseInput.expenseForId);

  if (!payerExists || !recipientExists) {
    throw new Error("USER_NOT_FOUND");
  }

  const defaultGroup = databaseConnection
    .prepare("SELECT id FROM groups LIMIT 1")
    .get() as { id: string } | undefined;
  const groupId = defaultGroup ? defaultGroup.id : randomUUID();

  const generatedExpenseId = randomUUID();

  const insertExpenseStatement = databaseConnection.prepare(`
    INSERT INTO expenses (id, groupId, amount, description, paidById, expenseForId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertExpenseStatement.run(
    generatedExpenseId,
    groupId,
    expenseInput.amount,
    expenseInput.description,
    expenseInput.paidById,
    expenseInput.expenseForId,
  );

  return { id: generatedExpenseId, ...expenseInput };
}

export function calculateNetBalances(): NetBalanceRecord[] {
  const selectRawTransactionsQuery = `
    SELECT 
      expenses.amount, 
      expenses.paidById, 
      payerUser.name AS payerName, 
      expenses.expenseForId, 
      recipientUser.name AS recipientName
    FROM expenses
    JOIN users AS payerUser ON expenses.paidById = payerUser.id
    JOIN users AS recipientUser ON expenses.expenseForId = recipientUser.id
  `;

  const rawTransactions = databaseConnection
    .prepare(selectRawTransactionsQuery)
    .all() as {
    amount: number;
    paidById: string;
    payerName: string;
    expenseForId: string;
    recipientName: string;
  }[];

  const ledgerMap = new Map<
    string,
    {
      primaryUser: { id: string; name: string };
      secondaryUser: { id: string; name: string };
      netAmount: number;
    }
  >();

  for (const transaction of rawTransactions) {
    if (transaction.paidById === transaction.expenseForId) continue;

    const isPayerLexicographicallyFirst =
      transaction.paidById < transaction.expenseForId;

    const primaryUser = isPayerLexicographicallyFirst
      ? { id: transaction.paidById, name: transaction.payerName }
      : { id: transaction.expenseForId, name: transaction.recipientName };

    const secondaryUser = isPayerLexicographicallyFirst
      ? { id: transaction.expenseForId, name: transaction.recipientName }
      : { id: transaction.paidById, name: transaction.payerName };

    const pairwiseLedgerKey = `${primaryUser.id}:${secondaryUser.id}`;

    if (!ledgerMap.has(pairwiseLedgerKey)) {
      ledgerMap.set(pairwiseLedgerKey, {
        primaryUser,
        secondaryUser,
        netAmount: 0,
      });
    }

    const pairLedger = ledgerMap.get(pairwiseLedgerKey)!;

    if (transaction.paidById === primaryUser.id) {
      pairLedger.netAmount += transaction.amount;
    } else {
      pairLedger.netAmount -= transaction.amount;
    }
  }

  const calculatedBalances: NetBalanceRecord[] = [];

  for (const { primaryUser, secondaryUser, netAmount } of ledgerMap.values()) {
    const roundedNetAmount = Math.round(netAmount * 100) / 100;

    if (roundedNetAmount > 0) {
      calculatedBalances.push({
        debtorId: secondaryUser.id,
        debtorName: secondaryUser.name,
        creditorId: primaryUser.id,
        creditorName: primaryUser.name,
        amount: roundedNetAmount,
      });
    } else if (roundedNetAmount < 0) {
      calculatedBalances.push({
        debtorId: primaryUser.id,
        debtorName: primaryUser.name,
        creditorId: secondaryUser.id,
        creditorName: secondaryUser.name,
        amount: Math.abs(roundedNetAmount),
      });
    }
  }

  return calculatedBalances;
}
