import { NextResponse } from "next/server";
import { getAllUsers } from "@/modules/expenses/expense.service";

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
