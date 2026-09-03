import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE));

    const [reminders, total] = await Promise.all([
      db.eventReminder.findMany({
        where: { userId: session.user.id as string },
        include: {
          event: {
            include: {
              category: true,
              city: true,
              country: true,
              organizer: {
                select: { id: true, name: true, logo: true },
              },
            },
          },
        },
        orderBy: { remindAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.eventReminder.count({ where: { userId: session.user.id as string } }),
    ]);

    return NextResponse.json({
      reminders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
