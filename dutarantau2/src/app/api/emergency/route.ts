import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { emergencyAlerts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db
      .select({
        id: emergencyAlerts.id,
        title: emergencyAlerts.title,
        type: emergencyAlerts.type,
        city: emergencyAlerts.city,
        location: emergencyAlerts.location,
        description: emergencyAlerts.description,
        urgency: emergencyAlerts.urgency,
        status: emergencyAlerts.status,
        contactNumber: emergencyAlerts.contactNumber,
        createdAt: emergencyAlerts.createdAt,
        authorId: emergencyAlerts.userId,
        authorName: users.name,
        authorRole: users.role,
        authorAvatar: users.avatar,
      })
      .from(emergencyAlerts)
      .leftJoin(users, eq(emergencyAlerts.userId, users.id))
      .orderBy(desc(emergencyAlerts.createdAt));

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

    const { title, type, city, location, description, urgency, contactNumber } = body;

    if (!title || !description || !contactNumber || !location) {
      return NextResponse.json({ error: "Mohon isi judul, lokasi, deskripsi, dan nomor kontak darurat" }, { status: 400 });
    }

    const [newItem] = await db
      .insert(emergencyAlerts)
      .values({
        userId: currentUserId,
        title,
        type: type || "Lainnya",
        city: city || "Kuala Lumpur",
        location,
        description,
        urgency: urgency || "urgent",
        status: "seeking_help",
        contactNumber,
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
