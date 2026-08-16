import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    await seedDatabase();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");

    if (!sessionCookie?.value) {
      // Fallback: return default first user if no cookie set yet, so user gets seamless demo start
      const defaultUserList = await db.select().from(users).limit(1);
      if (defaultUserList.length > 0) {
        const u = defaultUserList[0];
        const userWithoutPassword = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          city: u.city,
          country: u.country,
          profession: u.profession,
          bio: u.bio,
          avatar: u.avatar,
          phone: u.phone,
          verified: u.verified,
        };
        return NextResponse.json({ user: userWithoutPassword });
      }
      return NextResponse.json({ user: null });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const foundUser = await db.select().from(users).where(eq(users.id, sessionData.id)).limit(1);

    if (foundUser.length === 0) {
      return NextResponse.json({ user: null });
    }

    const u = foundUser[0];
    const user = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      city: u.city,
      country: u.country,
      profession: u.profession,
      bio: u.bio,
      avatar: u.avatar,
      phone: u.phone,
      verified: u.verified,
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
