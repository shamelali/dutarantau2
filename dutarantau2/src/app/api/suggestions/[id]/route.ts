import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { suggestions, users, suggestionUpvotes, suggestionComments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const suggestionId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    let currentUserId: number | null = null;
    if (sessionCookie?.value) {
      try {
        currentUserId = JSON.parse(sessionCookie.value).id;
      } catch {}
    }

    // Increment view count
    await db
      .update(suggestions)
      .set({ viewsCount: sql`${suggestions.viewsCount} + 1` })
      .where(eq(suggestions.id, suggestionId));

    const result = await db
      .select({
        id: suggestions.id,
        title: suggestions.title,
        description: suggestions.description,
        category: suggestions.category,
        targetCity: suggestions.targetCity,
        status: suggestions.status,
        officialResponse: suggestions.officialResponse,
        upvotesCount: suggestions.upvotesCount,
        viewsCount: suggestions.viewsCount,
        authorId: suggestions.authorId,
        createdAt: suggestions.createdAt,
        updatedAt: suggestions.updatedAt,
        authorName: users.name,
        authorRole: users.role,
        authorAvatar: users.avatar,
        authorProfession: users.profession,
        authorCity: users.city,
      })
      .from(suggestions)
      .leftJoin(users, eq(suggestions.authorId, users.id))
      .where(eq(suggestions.id, suggestionId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Usulan tidak ditemukan" }, { status: 404 });
    }

    const item = result[0];

    // Check if current user upvoted
    let hasUpvoted = false;
    if (currentUserId) {
      const upvote = await db
        .select()
        .from(suggestionUpvotes)
        .where(
          sql`${suggestionUpvotes.suggestionId} = ${suggestionId} AND ${suggestionUpvotes.userId} = ${currentUserId}`
        )
        .limit(1);
      hasUpvoted = upvote.length > 0;
    }

    // Fetch comments
    const commentsList = await db
      .select({
        id: suggestionComments.id,
        content: suggestionComments.content,
        createdAt: suggestionComments.createdAt,
        authorId: suggestionComments.authorId,
        authorName: users.name,
        authorRole: users.role,
        authorAvatar: users.avatar,
      })
      .from(suggestionComments)
      .leftJoin(users, eq(suggestionComments.authorId, users.id))
      .where(eq(suggestionComments.suggestionId, suggestionId))
      .orderBy(desc(suggestionComments.createdAt));

    return NextResponse.json({ item: { ...item, hasUpvoted }, comments: commentsList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const suggestionId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);
    const body = await req.json();

    const existing = await db.select().from(suggestions).where(eq(suggestions.id, suggestionId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Usulan tidak ditemukan" }, { status: 404 });
    }

    const s = existing[0];
    const isOwner = s.authorId === sessionUser.id;
    const isAdminOrStaff = sessionUser.role === "admin" || sessionUser.role === "embassy_staff" || sessionUser.role === "community_lead";

    if (!isOwner && !isAdminOrStaff) {
      return NextResponse.json({ error: "Tidak memiliki hak akses merubah usulan ini" }, { status: 403 });
    }

    const updateFields: any = { updatedAt: new Date() };

    if (body.title && isOwner) updateFields.title = body.title;
    if (body.description && isOwner) updateFields.description = body.description;
    if (body.category && isOwner) updateFields.category = body.category;
    if (body.targetCity && isOwner) updateFields.targetCity = body.targetCity;
    
    // Status & official response updates (allowed for staff/lead/admin)
    if (body.status && isAdminOrStaff) updateFields.status = body.status;
    if (body.officialResponse !== undefined && isAdminOrStaff) updateFields.officialResponse = body.officialResponse;

    const [updatedItem] = await db
      .update(suggestions)
      .set(updateFields)
      .where(eq(suggestions.id, suggestionId))
      .returning();

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const suggestionId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);

    const existing = await db.select().from(suggestions).where(eq(suggestions.id, suggestionId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Usulan tidak ditemukan" }, { status: 404 });
    }

    const isOwner = existing[0].authorId === sessionUser.id;
    const isAdmin = sessionUser.role === "admin" || sessionUser.role === "community_lead";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Tidak berwenang menghapus usulan" }, { status: 403 });
    }

    await db.delete(suggestions).where(eq(suggestions.id, suggestionId));
    return NextResponse.json({ success: true, message: "Usulan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
