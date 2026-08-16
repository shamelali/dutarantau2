import { NextResponse } from "next/server";
import { db } from "@/db";
import { consularGuides } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db.select().from(consularGuides);

    const conditions = [];
    if (category && category !== "All") {
      conditions.push(eq(consularGuides.category, category));
    }
    if (search) {
      conditions.push(or(like(consularGuides.title, `%${search}%`), like(consularGuides.content, `%${search}%`)));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const items = await query;
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
