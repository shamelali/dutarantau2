import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'job', 'housing', 'service', etc.
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    let currentUserId: number | null = null;
    if (sessionCookie?.value) {
      try {
        currentUserId = JSON.parse(sessionCookie.value).id;
      } catch {}
    }

    let query = db.select({
      id: jobs.id,
      title: jobs.title,
      type: jobs.type,
      category: jobs.category,
      salaryOrPrice: jobs.salaryOrPrice,
      description: jobs.description,
      location: jobs.location,
      contactInfo: jobs.contactInfo,
      verificationStatus: jobs.verificationStatus,
      datePosted: jobs.datePosted,
      expirationDate: jobs.expirationDate,
    })
      .from(jobs);

    const conditions = [];

    if (type && type !== "All") {
      conditions.push(eq(jobs.type, type));
    }
    if (city && city !== "All Cities") {
      conditions.push(eq(jobs.location, city));
    }
    if (search) {
      conditions.push(or(
        like(jobs.title, `%${search}%`),
        like(jobs.description, `%${search}%`)
      ));
    }

    // @ts-ignore
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // @ts-ignore
    query = query.orderBy(desc(jobs.datePosted));

    // Cast to any to bypass TypeScript strict typing on select result
    const items = await (query as any);

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

    const { title, type, category, salaryOrPrice, description, location, contactInfo } = body;

    if (!title || !type || !description || !location || !contactInfo) {
      return NextResponse.json({ error: "Mohon lengkapi judul, jenis lowongan, deskripsi, lokasi, dan kontak" }, { status: 400 });
    }

    const [newItem] = await db
      .insert(jobs)
      .values({
        title,
        type: type || "job",
        category: category || "full-time",
        salaryOrPrice: salaryOrPrice || "Tersedia",
        description,
        location,
        contactInfo,
        verificationStatus: "unverified",
        postedByUserId: currentUserId,
        datePosted: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}