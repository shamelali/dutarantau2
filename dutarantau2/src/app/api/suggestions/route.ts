import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { suggestions, users, suggestionUpvotes } from "@/db/schema";
import { eq, desc, asc, sql, and, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const targetCity = searchParams.get("targetCity");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "upvotes"; // 'upvotes', 'latest', 'oldest'

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    let currentUserId: number | null = null;
    if (sessionCookie?.value) {
      try {
        currentUserId = JSON.parse(sessionCookie.value).id;
      } catch {}
    }

    let query = db
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
      .leftJoin(users, eq(suggestions.authorId, users.id));

    const conditions = [];

    if (category && category !== "All") {
      conditions.push(eq(suggestions.category, category));
    }
    if (status && status !== "All") {
      conditions.push(eq(suggestions.status, status));
    }
    if (targetCity && targetCity !== "All Cities") {
      conditions.push(or(eq(suggestions.targetCity, targetCity), eq(suggestions.targetCity, "All Cities")));
    }
    if (search) {
      conditions.push(
        or(
          like(suggestions.title, `%${search}%`),
          like(suggestions.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    if (sortBy === "latest") {
      // @ts-ignore
      query = query.orderBy(desc(suggestions.createdAt));
    } else if (sortBy === "oldest") {
      // @ts-ignore
      query = query.orderBy(asc(suggestions.createdAt));
    } else {
      // Default: upvotes
      // @ts-ignore
      query = query.orderBy(desc(suggestions.upvotesCount), desc(suggestions.createdAt));
    }

    const results = await query;

    // Fetch user's upvoted suggestion IDs if logged in
    let userUpvotedSet = new Set<number>();
    if (currentUserId) {
      const myUpvotes = await db
        .select({ suggestionId: suggestionUpvotes.suggestionId })
        .from(suggestionUpvotes)
        .where(eq(suggestionUpvotes.userId, currentUserId));
      myUpvotes.forEach((u) => userUpvotedSet.add(u.suggestionId));
    }

    const items = results.map((item) => ({
      ...item,
      hasUpvoted: userUpvotedSet.has(item.id),
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

    const { title, description, category, targetCity } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Judul, kategori, dan deskripsi wajib diisi" }, { status: 400 });
    }

    const [newSuggestion] = await db
      .insert(suggestions)
      .values({
        title,
        description,
        category,
        targetCity: targetCity || "All Cities",
        status: "open",
        authorId: currentUserId,
        upvotesCount: 1, // Auto upvote by creator
      })
      .returning();

    // Auto add upvote by author
    await db.insert(suggestionUpvotes).values({
      suggestionId: newSuggestion.id,
      userId: currentUserId,
    });

    return NextResponse.json({ success: true, item: newSuggestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
