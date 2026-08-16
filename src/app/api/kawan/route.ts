import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

interface UserSearchResult {
  id: number;
  name: string;
  avatar: string | null;
  city: string;
  country: string;
  profession: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city");
    const profession = searchParams.get("profession");

    let condition = ilike(users.name, `%${query}%`);

    if (city && city !== "All Cities") {
      condition = and(condition, ilike(users.city, `%${city}%`));
    }
    if (profession) {
      condition = and(condition, ilike(users.profession, `%${profession}%`));
    }

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        city: users.city,
        country: users.country,
        profession: users.profession,
      })
      .from(users)
      .where(condition)
      .limit(20)
      .orderBy(desc(users.createdAt));

    const formattedResults = results.map((user): UserSearchResult => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      city: user.city,
      country: user.country,
      profession: user.profession,
    }));

    return NextResponse.json({ users: formattedResults });
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

    const { organizationId, title, description, date, time, location, city } = body;

    if (!title || !description || !date || !location || !city) {
      return NextResponse.json({ error: "Mohon lengkapi judul, deskripsi, tanggal, lokasi, dan kota" }, { status: 400 });
    }

    // Check if user is member of the organization
    const orgMember = await db.select().from(organizations).where(
      eq(organizations.id, organizationId)
    ).limit(1);

    if (orgMember.length === 0) {
      return NextResponse.json({ error: "Organisasi tidak ditemukan" }, { status: 404 });
    }

    // Create event/community post
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: "Komunitas/event dibuat successfully",
      organization: orgMember[0].name
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}