import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizer = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE));
    const status = searchParams.get("status") || "";

    const where: any = { organizerId: organizer.id };
    if (status) {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          category: true,
          city: true,
          country: true,
          _count: { select: { favorites: true, registrations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only organizers can create events" },
        { status: 403 }
      );
    }

    const organizer = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!organizer || !organizer.approved) {
      return NextResponse.json(
        { error: "You need an approved organizer profile" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = eventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const baseSlug = slugify(result.data.title);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const { title, ...eventData } = result.data;

    const event = await db.event.create({
      data: {
        title,
        slug,
        ...eventData,
        organizerId: organizer.id,
        status: role === "ADMIN" ? "PUBLISHED" : "PENDING",
      },
      include: {
        category: true,
        city: true,
        country: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
