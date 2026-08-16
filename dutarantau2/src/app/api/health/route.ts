import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    // Lazy seed database if empty
    await seedDatabase();
    await db.select().from(users).limit(1);
    return NextResponse.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
