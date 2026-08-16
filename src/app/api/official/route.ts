import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { officialSources } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const institution = searchParams.get("institution");

    let query = db.select({
      id: officialSources.id,
      institution: officialSources.institution,
      url: officialSources.url,
      category: officialSources.category,
      lastChecked: officialSources.lastChecked,
      status: officialSources.status,
      verificationStatus: officialSources.verificationStatus,
    })
      .from(officialSources);

    const conditions = [];

    if (category) {
      conditions.push(eq(officialSources.category, category));
    }
    if (institution) {
      conditions.push(eq(officialSources.institution, institution));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const sources = await query;

    return NextResponse.json({ sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();

    const { institution, url, category } = body;

    if (!institution || !url || !category) {
      return NextResponse.json({ error: "Mohon lengkapi nama institusi, URL, dan kategori" }, { status: 400 });
    }

    const [newSource] = await db
      .insert(officialSources)
      .values({
        institution,
        url,
        category,
        verificationStatus: "verified",
        status: "active",
      })
      .returning();

    return NextResponse.json({ success: true, source: newSource });
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID sumber resmi wajib diisi" }, { status: 400 });
    }

    const { status, verificationStatus, lastChecked, notes } = body;

    const [updatedSource] = await db
      .update(officialSources)
      .set({
        status,
        verificationStatus,
        lastChecked: lastChecked || new Date(),
        notes,
      })
      .where(eq(officialSources.id, id))
      .returning();

    return NextResponse.json({ success: true, source: updatedSource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID sumber resmi wajib diisi" }, { status: 400 });
    }

    await db
      .delete(officialSources)
      .where(eq(officialSources.id, id));

    return NextResponse.json({ success: true, message: "Sumber resmi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}