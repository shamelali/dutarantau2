import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  body: string;
  category: string;
  location: string | null;
  source: string | null;
  sourceStatus: string | null;
  lastChecked: string | null;
  verificationStatus: string;
  authorName: string | null;
  publishDate: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    let query = db.select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      body: articles.body,
      category: articles.category,
      location: articles.location,
      source: articles.source,
      sourceStatus: articles.sourceStatus,
      lastChecked: articles.lastChecked,
      verificationStatus: articles.verificationStatus,
      authorName: users.name,
    })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id));

    const conditions = [];

    if (category) {
      conditions.push(eq(articles.category, category));
    }
    if (q) {
      conditions.push(or(
        ilike(articles.title, `%${q}%`),
        ilike(articles.body, `%${q}%`)
      ));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(articles.createdAt));

    const results = await query;

    const articles: ArticleItem[] = results.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      body: r.body.substring(0, 200) + (r.body.length > 200 ? "..." : ""),
      category: r.category,
      location: r.location,
      source: r.source,
      sourceStatus: r.sourceStatus,
      lastChecked: r.lastChecked,
      verificationStatus: r.verificationStatus,
      authorName: r.authorName,
    }));

    return NextResponse.json({ articles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}