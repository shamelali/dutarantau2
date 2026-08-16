import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { events, users, organizations, eventRsvps } from "@/db/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
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

    // Build base select with joins
    const baseQuery = db.select({
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
      organizerId: events.organizationId,
      createdAt: events.createdAt,
    })
      .from(events)
      .leftJoin(users, eq(events.organizationId, users.id))
      .leftJoin(organizations, eq(events.organizationId, organizations.id));

    let query = baseQuery as any;

    const conditions = [];

    if (category && category !== "All") {
      conditions.push(sql`${events.category} = ${category}`);
    }
    if (city && city !== "All Cities") {
      conditions.push(sql`${events.city} = ${city}`);
    }
    if (search) {
      conditions.push(or(
        like(events.title, `%${search}%`),
        like(events.description, `%${search}%`)
      ));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(events.createdAt));

    const itemsList = await query;

    let userRsvpsMap = new Map<number, string>();
    if (currentUserId) {
      const myRsvps = await db.select().from(eventRsvps).where(eq(eventRsvps.userId, currentUserId));
      myRsvps.forEach((r) => userRsvpsMap.set(r.eventId, r.status));
    }

    const items = itemsList.map((item: any) => ({
      ...item,
      userRsvpStatus: userRsvpsMap.get(item.id) || null,
    }));

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

    const { title, description, category, date, time, location, city, capacity, imageUrl, organizationId } = body;

    if (!title || !description || !category || !date || !location || !city) {
      return NextResponse.json({ error: "Mohon lengkapi judul, kategori, tanggal, lokasi, dan kota" }, { status: 400 });
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        description,
        category,
        date,
        time: time || "10:00 MYT",
        location,
        city,
        capacity: Number(capacity) || 100,
        attendeesCount: 1, // Organizer attending
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
        organizationId: organizationId || null,
      })
      .returning();

    // RSVP creator as 'going'
    await db.insert(eventRsvps).values({
      eventId: newEvent.id,
      userId: currentUserId,
      status: "going",
    });

    return NextResponse.json({ success: true, item: newEvent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}