import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const user = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const membership = await db.select().from(memberships).where(
      eq(memberships.userId, currentUserId)
    ).limit(1);

    let membershipData = {
      plan: user[0].membershipStatus,
      status: "active",
      startDate: user[0].membershipStartDate,
      renewalDate: user[0].membershipRenewalDate,
      failedPaymentCount: memberships.failed_payment_count,
    };

    // If no membership record exists, create one
    if (membership.length === 0) {
      const [newMembership] = await db
        .insert(memberships)
        .values({
          userId: currentUserId,
          plan: "free",
          status: "active",
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

      membershipData = {
        plan: "free",
        status: "active",
        startDate: newMembership.startDate,
        renewalDate: newMembership.renewalDate,
        failedPaymentCount: 0,
      };
    } else {
      membershipData = {
        plan: membership[0].plan,
        status: membership[0].status,
        startDate: membership[0].startDate,
        renewalDate: membership[0].renewalDate,
        failedPaymentCount: membership[0].failed_payment_count,
      };
    }

    return NextResponse.json({ membership: membershipData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();

    const { plan } = body;

    if (!plan) {
      return NextResponse.json({ error: "Plan langganan wajib diisi" }, { status: 400 });
    }

    // Check existing membership
    const existing = await db.select().from(memberships).where(
      eq(memberships.userId, currentUserId)
    ).limit(1);

    let membershipData: any;

    if (plan === "member") {
      // Activate membership
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      if (existing.length === 0) {
        const [newMembership] = await db
          .insert(memberships)
          .values({
            userId: currentUserId,
            plan: "member",
            status: "active",
            startDate: new Date(),
            renewalDate: renewalDate,
          })
          .returning();

        membershipData = {
          plan: "member",
          status: "active",
          startDate: newMembership.startDate,
          renewalDate: newMembership.renewalDate,
          eastelBonus: "pending",
          message: "Langganan aktif. Bonus SIM Eastel: 1 kartu SIM fisik gratis (satu kali).",
        };
      } else {
        const [updatedMembership] = await db
          .update(memberships)
          .set({
            plan: "member",
            status: "active",
            renewalDate: renewalDate,
          })
          .where(eq(memberships.userId, currentUserId))
          .returning();

        membershipData = {
          plan: "member",
          status: "active",
          startDate: updatedMembership.startDate,
          renewalDate: updatedMembership.renewalDate,
          eastelBonus: "pending",
          message: "Langganan diperbarui. Bonus SIM Eastel: 1 kartu SIM fisik gratis (satu kali).",
        };
      }
    } else {
      // Free plan
      if (existing.length === 0) {
        const [newMembership] = await db
          .insert(memberships)
          .values({
            userId: currentUserId,
            plan: "free",
            status: "active",
          })
          .returning();

        membershipData = {
          plan: "free",
          status: "active",
          message: "Anda berlangganan paket free.",
        };
      } else {
        const [updatedMembership] = await db
          .update(memberships)
          .set({
            plan: "free",
          })
          .where(eq(memberships.userId, currentUserId))
          .returning();

        membershipData = {
          plan: "free",
          status: "active",
          message: "Anda kembali ke paket free.",
        };
      }
    }

    return NextResponse.json({ success: true, membership: membershipData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { status, failedPaymentCount } = body;

    if (!status) {
      return NextResponse.json({ error: "Status wajib diisi" }, { status: 400 });
    }

    // Check if user is admin or the member themselves
    const existing = await db.select().from(memberships).where(
      eq(memberships.userId, currentUserId)
    ).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Membership tidak ditemukan" }, { status: 404 });
    }

    const [updated] = await db
      .update(memberships)
      .set({
        status: status,
        failedPaymentCount: failedPaymentCount ?? existing[0].failed_payment_count,
      })
      .where(eq(memberships.userId, currentUserId))
      .returning();

    return NextResponse.json({ success: true, membership: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}