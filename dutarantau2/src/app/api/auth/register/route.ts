import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, city, country, profession, bio, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan kata sandi wajib diisi" }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: "member",
        city: city || "Kuala Lumpur",
        country: country || "Malaysia",
        profession: profession || "Diaspora Member",
        bio: bio || "Anggota Komunitas Duta Rantau.",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone: phone || "",
        verified: true,
      })
      .returning();

    const sessionData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      city: newUser.city,
      country: newUser.country,
      profession: newUser.profession,
      avatar: newUser.avatar,
      verified: newUser.verified,
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
