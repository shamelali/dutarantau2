import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { suggestions, suggestionUpvotes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const suggestionId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk memberikan dukungan (upvote)" }, { status: 401 });
    }

    const userId = JSON.parse(sessionCookie.value).id;

    // Check existing upvote
    const existing = await db
      .select()
      .from(suggestionUpvotes)
      .where(and(eq(suggestionUpvotes.suggestionId, suggestionId), eq(suggestionUpvotes.userId, userId)))
      .limit(1);

    let hasUpvoted = false;
    let upvotesDelta = 0;

    if (existing.length > 0) {
      // Un-vote
      await db
        .delete(suggestionUpvotes)
        .where(and(eq(suggestionUpvotes.suggestionId, suggestionId), eq(suggestionUpvotes.userId, userId)));
      await db
        .update(suggestions)
        .set({ upvotesCount: sql`GREATEST(${suggestions.upvotesCount} - 1, 0)` })
        .where(eq(suggestions.id, suggestionId));
      hasUpvoted = false;
      upvotesDelta = -1;
    } else {
      // Upvote
      await db.insert(suggestionUpvotes).values({ suggestionId, userId });
      await db
        .update(suggestions)
        .set({ upvotesCount: sql`${suggestions.upvotesCount} + 1` })
        .where(eq(suggestions.id, suggestionId));
      hasUpvoted = true;
      upvotesDelta = 1;
    }

    const updated = await db
      .select({ upvotesCount: suggestions.upvotesCount })
      .from(suggestions)
      .where(eq(suggestions.id, suggestionId))
      .limit(1);

    return NextResponse.json({
      success: true,
      hasUpvoted,
      upvotesCount: updated[0]?.upvotesCount ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
