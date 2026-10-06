import { z } from "zod";

export const createExpenseSchema = z
  .object({
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(200, "Description is too long"),
    paidById: z.string().uuid("Invalid payer UUID"),
    expenseForId: z.string().uuid("Invalid recipient UUID"),
  })
  .refine((transaction) => transaction.paidById !== transaction.expenseForId, {
    message: "Payer and recipient cannot be the same person",
    path: ["expenseForId"],
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
