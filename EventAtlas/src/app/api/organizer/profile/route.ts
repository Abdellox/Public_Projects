import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizerSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.organizerProfile.findUnique({
      where: { userId: session.user.id as string },
      include: {
        _count: { select: { events: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch organizer profile" },
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
        { error: "Only organizers can create a profile" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = organizerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const profile = await db.organizerProfile.upsert({
      where: { userId: session.user.id as string },
      update: result.data,
      create: {
        userId: session.user.id as string,
        ...result.data,
      },
      include: {
        _count: { select: { events: true } },
      },
    });

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Failed to save organizer profile" },
      { status: 500 }
    );
  }
}
