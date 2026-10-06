import { NextRequest, NextResponse } from "next/server";
import {
  createExpense,
  getAllExpenses,
} from "@/modules/expenses/expense.service";
import { createExpenseSchema } from "@/modules/expenses/expense.schema";

export async function GET() {
  try {
    const expenses = getAllExpenses();
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestPayload = await request.json();
    const validationResult = createExpenseSchema.safeParse(requestPayload);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const createdExpense = createExpense(validationResult.data);
    return NextResponse.json(createdExpense, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
