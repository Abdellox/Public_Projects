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
    const body = await req.json();
    const { remindAt } = body;

    if (!remindAt) {
      return NextResponse.json(
        { error: "remindAt is required" },
        { status: 400 }
      );
    }

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const reminder = await db.eventReminder.upsert({
      where: {
        userId_eventId: { userId: session.user.id as string, eventId },
      },
      update: { remindAt: new Date(remindAt) },
      create: {
        userId: session.user.id as string,
        eventId,
        remindAt: new Date(remindAt),
      },
    });

    return NextResponse.json(reminder);
  } catch {
    return NextResponse.json(
      { error: "Failed to set reminder" },
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

    const { id: eventId } = await params;

    const existing = await db.eventReminder.findUnique({
      where: { userId_eventId: { userId: session.user.id as string, eventId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    await db.eventReminder.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Reminder removed" });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove reminder" },
      { status: 500 }
    );
  }
}
