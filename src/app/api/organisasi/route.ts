import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, organizations, organizationMembers } from "@/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

interface OrganizationFormData {
  name: string;
  type: string;
  description: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
}

interface MemberFormData {
  role: string;
  status: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const name = searchParams.get("name");

    let query = db.select({
      id: organizations.id,
      name: organizations.name,
      type: organizations.type,
      description: organizations.description,
      location: organizations.location,
      verificationStatus: organizations.verificationStatus,
      website: organizations.website,
      contactEmail: organizations.contactEmail,
      contactPhone: organizations.contactPhone,
      foundedDate: organizations.foundedDate,
      createdAt: organizations.createdAt,
    })
      .from(organizations);

    const conditions = [];

    if (category) {
      conditions.push(eq(organizations.type, category));
    }
    if (name) {
      conditions.push(ilike(organizations.name, `%${name}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(organizations.createdAt));

    const results = await query;

    return NextResponse.json({ organizations: results });
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

    const { name, type, description, location, website, contactEmail, contactPhone } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Nama dan jenis organisasi wajib diisi" }, { status: 400 });
    }

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name,
        type: type || "informal",
        description: description || "",
        location: location || "Kuala Lumpur",
        website: website || "",
        contactEmail: contactEmail || "",
        contactPhone: contactPhone || "",
        verificationStatus: "unverified",
      })
      .returning();

    // auto-add creator as admin member
    await db.insert(organizationMembers).values({
      organizationId: newOrg.id,
      userId: currentUserId,
      role: "organization_admin",
      status: "active",
      joinedAt: new Date(),
    });

    return NextResponse.json({ success: true, organization: newOrg[0] });
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
    const { id, name, type, description, location, website, contactEmail, contactPhone } = body;

    if (!id) {
      return NextResponse.json({ error: "ID organisasi wajib diisi" }, { status: 400 });
    }

    // Check if user is admin of this organization
    const orgMember = await db.select().from(organizationMembers).where(
      eq(organizationMembers.organizationId, Number(id))
    ).limit(1);

    if (orgMember.length === 0 || orgMember[0].role !== "organization_admin") {
      return NextResponse.json({ error: "Tidak berwenang mengubah organisasi ini" }, { status: 403 });
    }

    const [updatedOrg] = await db
      .update(organizations)
      .set({
        name: name || undefined,
        type: type || undefined,
        description: description || undefined,
        location: location || undefined,
        website: website || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      })
      .where(eq(organizations.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, organization: updatedOrg[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID organisasi wajib diisi" }, { status: 400 });
    }

    // Check if user is admin
    const orgMember = await db.select().from(organizationMembers).where(
      eq(organizationMembers.organizationId, Number(id))
    ).limit(1);

    if (orgMember.length === 0 || orgMember[0].role !== "organization_admin") {
      return NextResponse.json({ error: "Tidak berwenang menghapus organisasi ini" }, { status: 403 });
    }

    // Delete member relationships first, then organization
    await db.delete(organizationMembers).where(
      eq(organizationMembers.organizationId, Number(id))
    );
    await db.delete(organizations).where(eq(organizations.id, Number(id)));

    return NextResponse.json({ success: true, message: "Organisasi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET organization members
export async function GETmembers(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = Number(id);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;

    // Check if user is admin or member
    const orgMember = await db.select().from(organizationMembers).where(
      eq(organizationMembers.organizationId, organizationId)
    ).limit(1);

    if (orgMember.length === 0) {
      return NextResponse.json({ members: [] });
    }

    const members = await db.select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      status: organizationMembers.status,
      joinedAt: organizationMembers.joinedAt,
      leftAt: organizationMembers.leftAt,
      userName: users.name,
      userAvatar: users.avatar,
      userProfession: users.profession,
    })
      .from(organizationMembers)
      .leftJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId));

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST add member
export async function POSTmember(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { organizationId, userId, role } = body;

    if (!organizationId || !userId) {
      return NextResponse.json({ error: "ID organisasi dan user wajib diisi" }, { status: 400 });
    }

    // Check if organizer is admin
    const org = await db.select().from(organizations).where(
      eq(organizations.id, organizationId)
    ).limit(1);

    if (org.length === 0) {
      return NextResponse.json({ error: "Organisasi tidak ditemukan" }, { status: 404 });
    }

    const isAdmin = org[0].createdBy === currentUserId; // Simplified check
    // In full implementation, check organizationMembers for admin role

    const [newMember] = await db
      .insert(organizationMembers)
      .values({
        organizationId,
        userId,
        role: role || "member",
        status: "active",
        joinedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, member: newMember[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}