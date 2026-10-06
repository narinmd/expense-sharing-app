export interface UserRecord {
  id: string;
  name: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  description: string;
  date: string;
  paidById: string;
  payerName: string;
  expenseForId: string;
  recipientName: string;
}

export interface NetBalanceRecord {
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  amount: number;
}
