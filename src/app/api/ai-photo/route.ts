import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { photoProjects, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();

    const { originalImage, background } = body;

    if (!originalImage) {
      return NextResponse.json({ error: "Gambar asli wajib diisi" }, { status: 400 });
    }

    // In a full implementation, this would call the AI image generation service
    // For now, we'll create a photo project record with placeholder result
    const resultImage = `/placeholder-ai-photo.jpg?background=${background}`;

    const [newProject] = await db
      .insert(photoProjects)
      .values({
        userId: currentUserId,
        originalImage,
        background,
        resultImage,
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
          userId: currentUserId,
        }),
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      project: newProject[0],
      message: "Foto berhasil diproses oleh AI" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const projects = await db.select({
      id: photoProjects.id,
      originalImage: photoProjects.originalImage,
      background: photoProjects.background,
      resultImage: photoProjects.resultImage,
      createdAt: photoProjects.createdAt,
    })
      .from(photoProjects)
      .where(eq(photoProjects.userId, currentUserId));

    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}