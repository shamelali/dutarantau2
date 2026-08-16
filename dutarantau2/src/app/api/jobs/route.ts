import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { jobsMarketplace, users } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'job', 'housing', 'service', etc.
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    let query = db
      .select({
        id: jobsMarketplace.id,
        title: jobsMarketplace.title,
        type: jobsMarketplace.type,
        category: jobsMarketplace.category,
        priceOrSalary: jobsMarketplace.priceOrSalary,
        description: jobsMarketplace.description,
        city: jobsMarketplace.city,
        contactInfo: jobsMarketplace.contactInfo,
        status: jobsMarketplace.status,
        authorId: jobsMarketplace.authorId,
        createdAt: jobsMarketplace.createdAt,
        authorName: users.name,
        authorRole: users.role,
        authorAvatar: users.avatar,
      })
      .from(jobsMarketplace)
      .leftJoin(users, eq(jobsMarketplace.authorId, users.id));

    const conditions = [];

    if (type && type !== "All") {
      conditions.push(eq(jobsMarketplace.type, type));
    }
    if (city && city !== "All Cities") {
      conditions.push(eq(jobsMarketplace.city, city));
    }
    if (search) {
      conditions.push(or(like(jobsMarketplace.title, `%${search}%`), like(jobsMarketplace.description, `%${search}%`)));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // @ts-ignore
    query = query.orderBy(desc(jobsMarketplace.createdAt));

    const items = await query;
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await req.json();

    const { title, type, category, priceOrSalary, description, city, contactInfo } = body;

    if (!title || !type || !description || !city || !contactInfo) {
      return NextResponse.json({ error: "Mohon lengkapi judul, jenis lapak, deskripsi, kota, dan kontak" }, { status: 400 });
    }

    const [newItem] = await db
      .insert(jobsMarketplace)
      .values({
        title,
        type,
        category: category || "General",
        priceOrSalary: priceOrSalary || "Hubungi Kontak",
        description,
        city,
        contactInfo,
        authorId: currentUserId,
        status: "active",
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
