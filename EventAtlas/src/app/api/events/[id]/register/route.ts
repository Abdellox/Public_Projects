import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { REGISTRATION_STATUS } from "@/lib/constants";

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
    const { status } = body;

    if (!status || !Object.values(REGISTRATION_STATUS).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: INTERESTED, GOING, MAYBE, CANCELLED" },
        { status: 400 }
      );
    }

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const registration = await db.eventRegistration.upsert({
      where: {
        userId_eventId: { userId: session.user.id as string, eventId },
      },
      update: { status },
      create: {
        userId: session.user.id as string,
        eventId,
        status,
      },
    });

    return NextResponse.json(registration);
  } catch {
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
