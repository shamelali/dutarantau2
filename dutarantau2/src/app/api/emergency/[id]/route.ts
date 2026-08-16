import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { emergencyAlerts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const alertId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { status } = await req.json();

    const [updated] = await db
      .update(emergencyAlerts)
      .set({ status })
      .where(eq(emergencyAlerts.id, alertId))
      .returning();

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const alertId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    await db.delete(emergencyAlerts).where(eq(emergencyAlerts.id, alertId));
    return NextResponse.json({ success: true, message: "Panggilan bantuan dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
