import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { suggestionComments, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const suggestionId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk memberikan komentar" }, { status: 401 });
    }

    const userId = JSON.parse(sessionCookie.value).id;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Isi komentar tidak boleh kosong" }, { status: 400 });
    }

    const [newComment] = await db
      .insert(suggestionComments)
      .values({
        suggestionId,
        authorId: userId,
        content: content.trim(),
      })
      .returning();

    const author = await db.select({ name: users.name, role: users.role, avatar: users.avatar }).from(users).where(eq(users.id, userId)).limit(1);

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment,
        authorName: author[0]?.name || "Diaspora Member",
        authorRole: author[0]?.role || "member",
        authorAvatar: author[0]?.avatar || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
