import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function findEvent(idOrSlug: string) {
  return db.event.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      category: true,
      city: true,
      country: true,
      organizer: {
        select: { id: true, name: true, logo: true, description: true, website: true },
      },
      _count: {
        select: { favorites: true, registrations: true },
      },
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await findEvent(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await db.event.update({
      where: { id: event.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ ...event, viewCount: event.viewCount + 1 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const role = (session.user as any).role;
    const organizer = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
    });

    if (role !== "ADMIN" && event.organizerId !== organizer?.id) {
      return NextResponse.json(
        { error: "You can only edit your own events" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = eventSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, ...updateData } = result.data;

    const updatePayload: any = { ...updateData };

    if (title) {
      updatePayload.title = title;
      const baseSlug = slugify(title);
      updatePayload.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
    }

    if (role === "ADMIN" && body.status) {
      updatePayload.status = body.status;
    }

    const updated = await db.event.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
        city: true,
        country: true,
        organizer: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const role = (session.user as any).role;
    const organizer = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
    });

    if (role !== "ADMIN" && event.organizerId !== organizer?.id) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    await db.event.delete({ where: { id } });

    return NextResponse.json({ message: "Event deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
