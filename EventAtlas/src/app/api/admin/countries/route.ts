import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { countrySchema } from "@/lib/validations";

export async function GET() {
  try {
    const countries = await db.country.findMany({
      include: {
        _count: { select: { cities: true, events: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(countries);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch countries" },
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
    const result = countrySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await db.country.findFirst({
      where: {
        OR: [{ name: result.data.name }, { code: result.data.code }, { slug: result.data.slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A country with this name, code, or slug already exists" },
        { status: 409 }
      );
    }

    const country = await db.country.create({ data: result.data });

    return NextResponse.json(country, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create country" },
      { status: 500 }
    );
  }
}
