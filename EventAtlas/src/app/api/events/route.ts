import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const isFree = searchParams.get("isFree") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE));

    const where: any = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (city) {
      where.city = { slug: city };
    }

    if (country) {
      where.country = { slug: country };
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.startDate = { ...where.startDate, lte: new Date(endDate) };
    }

    if (isFree === "true") {
      where.isFree = true;
    } else if (isFree === "false") {
      where.isFree = false;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "upcoming") orderBy = { startDate: "asc" };
    else if (sort === "popular") orderBy = { viewCount: "desc" };

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          category: true,
          city: true,
          country: true,
          organizer: {
            select: { id: true, name: true, logo: true },
          },
          _count: { select: { favorites: true } },
        },
        orderBy,
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

    const body = await req.json();
    const result = eventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const organizer = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!organizer || !organizer.approved) {
      return NextResponse.json(
        { error: "You need an approved organizer profile to create events" },
        { status: 403 }
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
        organizer: {
          select: { id: true, name: true, logo: true },
        },
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
