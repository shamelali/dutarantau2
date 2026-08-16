import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { events, users, eventRsvps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    const result = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        date: events.date,
        time: events.time,
        location: events.location,
        city: events.city,
        capacity: events.capacity,
        attendeesCount: events.attendeesCount,
        imageUrl: events.imageUrl,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        organizerName: users.name,
        organizerRole: users.role,
        organizerAvatar: users.avatar,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ item: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);

    const existing = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
    }

    const isOwner = existing[0].organizerId === sessionUser.id;
    const isAdmin = sessionUser.role === "admin" || sessionUser.role === "community_lead";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Tidak berwenang menghapus acara ini" }, { status: 403 });
    }

    await db.delete(events).where(eq(events.id, eventId));
    return NextResponse.json({ success: true, message: "Acara berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
