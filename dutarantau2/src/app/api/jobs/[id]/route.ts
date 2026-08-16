import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { jobsMarketplace } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const jobId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);

    const existing = await db.select().from(jobsMarketplace).where(eq(jobsMarketplace.id, jobId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Lapak tidak ditemukan" }, { status: 404 });
    }

    const isOwner = existing[0].authorId === sessionUser.id;
    const isAdmin = sessionUser.role === "admin" || sessionUser.role === "community_lead";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Tidak berwenang menghapus lapak ini" }, { status: 403 });
    }

    await db.delete(jobsMarketplace).where(eq(jobsMarketplace.id, jobId));
    return NextResponse.json({ success: true, message: "Lapak berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
