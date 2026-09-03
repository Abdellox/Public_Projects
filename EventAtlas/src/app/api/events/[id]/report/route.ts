import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reportSchema } from "@/lib/validations";

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
    const result = reportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingReport = await db.eventReport.findFirst({
      where: { userId: session.user.id as string, eventId },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this event" },
        { status: 409 }
      );
    }

    const report = await db.eventReport.create({
      data: {
        userId: session.user.id as string,
        eventId,
        ...result.data,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to report event" },
      { status: 500 }
    );
  }
}
