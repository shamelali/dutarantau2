import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk mendaftar acara" }, { status: 401 });
    }

    const userId = JSON.parse(sessionCookie.value).id;
    const { status } = await req.json(); // 'going' or 'cancel'

    const existing = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .limit(1);

    if (status === "cancel" || (existing.length > 0 && status === existing[0].status)) {
      if (existing.length > 0) {
        await db.delete(eventRsvps).where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
        await db
          .update(events)
          .set({ attendeesCount: sql`GREATEST(${events.attendeesCount} - 1, 0)` })
          .where(eq(events.id, eventId));
      }
      return NextResponse.json({ success: true, userRsvpStatus: null });
    }

    if (existing.length > 0) {
      await db
        .update(eventRsvps)
        .set({ status: status || "going" })
        .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
    } else {
      await db.insert(eventRsvps).values({ eventId, userId, status: status || "going" });
      await db
        .update(events)
        .set({ attendeesCount: sql`${events.attendeesCount} + 1` })
        .where(eq(events.id, eventId));
    }

    return NextResponse.json({ success: true, userRsvpStatus: status || "going" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
