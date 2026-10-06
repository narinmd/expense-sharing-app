import { NextResponse } from "next/server";
import { calculateNetBalances } from "@/modules/expenses/expense.service";

export async function GET() {
  try {
    const netBalances = calculateNetBalances();
    return NextResponse.json(netBalances);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
