import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existing = await db.favorite.findUnique({
      where: { userId_eventId: { userId: session.user.id as string, eventId } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await db.favorite.create({
      data: { userId: session.user.id as string, eventId },
    });

    return NextResponse.json({ favorited: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: eventId } = await params;

    if (!session?.user) {
      return NextResponse.json({ favorited: false });
    }

    const favorite = await db.favorite.findUnique({
      where: { userId_eventId: { userId: session.user.id as string, eventId } },
    });

    return NextResponse.json({ favorited: !!favorite });
  } catch {
    return NextResponse.json(
      { error: "Failed to check favorite" },
      { status: 500 }
    );
  }
}
