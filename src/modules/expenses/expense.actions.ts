"use server";

import { revalidatePath } from "next/cache";
import { createExpense } from "./expense.service";
import { createExpenseSchema } from "./expense.schema";

export type ActionState = {
  success?: boolean;
  error?: string;
};

export async function createExpenseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = {
    amount: formData.get("amount"),
    description: formData.get("description"),
    paidById: formData.get("paidById"),
    expenseForId: formData.get("expenseForId"),
  };

  const parsed = createExpenseSchema.safeParse(rawData);

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Invalid input";
    return { error: issue };
  }

  try {
    createExpense(parsed.data);
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return { error: "User not found" };
    }
    return { error: "Failed to create transaction" };
  }
}
