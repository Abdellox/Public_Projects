import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalEvents,
      totalOrganizers,
      totalRegistrations,
      eventsByStatus,
      eventsByCategory,
    ] = await Promise.all([
      db.user.count(),
      db.event.count(),
      db.organizerProfile.count(),
      db.eventRegistration.count(),
      db.event.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.event.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersOverTime = await db.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const categorizedEventsByCategory = await Promise.all(
      eventsByCategory.map(async (item) => {
        const category = await db.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true, slug: true },
        });
        return {
          category,
          count: item._count.id,
        };
      })
    );

    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalOrganizers,
      totalRegistrations,
      eventsByStatus: eventsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      eventsByCategory: categorizedEventsByCategory,
      usersOverTime: usersOverTime.map((item) => ({
        date: item.createdAt,
        count: item._count.id,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
