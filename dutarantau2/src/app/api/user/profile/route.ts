import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);
    const body = await req.json();

    const { name, city, country, profession, bio, phone, avatar } = body;

    const [updatedUser] = await db
      .update(users)
      .set({
        name: name || undefined,
        city: city || undefined,
        country: country || undefined,
        profession: profession || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      })
      .where(eq(users.id, sessionUser.id))
      .returning();

    const updatedSession = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      city: updatedUser.city,
      country: updatedUser.country,
      profession: updatedUser.profession,
      avatar: updatedUser.avatar,
      verified: updatedUser.verified,
    };

    cookieStore.set("duta_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, user: updatedSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
