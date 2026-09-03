import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { citySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId") || "";

    const where: any = {};
    if (countryId) {
      where.countryId = countryId;
    }

    const cities = await db.city.findMany({
      where,
      include: {
        country: {
          select: { id: true, name: true, code: true },
        },
        _count: { select: { events: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(cities);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cities" },
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

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = citySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const country = await db.country.findUnique({
      where: { id: result.data.countryId },
    });

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    const existing = await db.city.findFirst({
      where: {
        slug: result.data.slug,
        countryId: result.data.countryId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A city with this slug already exists in this country" },
        { status: 409 }
      );
    }

    const city = await db.city.create({
      data: result.data,
      include: {
        country: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(city, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}
