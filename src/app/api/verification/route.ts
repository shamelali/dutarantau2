import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { officialSources, users, organizations, articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const category = searchParams.get("category");

    let query = db.select({
      id: officialSources.id,
      institution: officialSources.institution,
      category: officialSources.category,
      lastChecked: officialSources.lastChecked,
      status: officialSources.status,
      verificationStatus: officialSources.verificationStatus,
    })
      .from(officialSources);

    const conditions = [];

    if (level) {
      conditions.push(eq(officialSources.verificationStatus, level));
    }
    if (category) {
      conditions.push(eq(officialSources.category, category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(officialSources.lastChecked));

    const sources = await query;

    return NextResponse.json({ sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { id, verificationStatus } = body;

    if (!id || !verificationStatus) {
      return NextResponse.json({ error: "ID dan status verifikasi wajib diisi" }, { status: 400 });
    }

    // Check if user is admin
    const user = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
    if (user.length === 0 || user[0].role !== "admin") {
      return NextResponse.json({ error: "Tidak berwenang mengubah verifikasi" }, { status: 403 });
    }

    const [updated] = await db
      .update(officialSources)
      .set({ verificationStatus, lastChecked: new Date() })
      .where(eq(officialSources.id, id))
      .returning();

    return NextResponse.json({ success: true, source: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}