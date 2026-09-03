import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [featured, recent] = await Promise.all([
      db.event.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        include: {
          category: true,
          city: true,
          country: true,
          organizer: {
            select: { id: true, name: true, logo: true },
          },
          _count: { select: { favorites: true } },
        },
        orderBy: { startDate: "asc" },
        take: 8,
      }),
      db.event.findMany({
        where: { status: "PUBLISHED", isFeatured: false },
        include: {
          category: true,
          city: true,
          country: true,
          organizer: {
            select: { id: true, name: true, logo: true },
          },
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    return NextResponse.json({ featured, recent });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch featured events" },
      { status: 500 }
    );
  }
}
