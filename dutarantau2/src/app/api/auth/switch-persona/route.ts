import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const foundUsers = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);

    if (foundUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = foundUsers[0];
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      country: user.country,
      profession: user.profession,
      avatar: user.avatar,
      verified: user.verified,
    };

    const cookieStore = await cookies();
    cookieStore.set("duta_session", JSON.stringify(sessionData), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
