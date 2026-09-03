import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { EventFilters } from "@/components/events/event-filters";
import { EventCard } from "@/components/events/event-card";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Explore Events | EventAtlas",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    city?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
    isFree?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ExploreEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const take = ITEMS_PER_PAGE;
  const skip = (page - 1) * take;

  const where: any = { status: "PUBLISHED" };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { shortDescription: { contains: params.search } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.city) {
    where.city = { slug: params.city };
  }

  if (params.country) {
    where.city = { ...where.city, country: { slug: params.country } };
  }

  if (params.startDate) {
    where.startDate = { gte: new Date(params.startDate) };
  }

  if (params.endDate) {
    where.startDate = { ...where.startDate, lte: new Date(params.endDate) };
  }

  if (params.isFree === "true") {
    where.isFree = true;
  }

  const orderBy: any =
    params.sort === "oldest"
      ? { startDate: "asc" }
      : params.sort === "popular"
      ? { favorites: { _count: "desc" } }
      : { startDate: "desc" };

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      include: {
        category: true,
        city: { include: { country: true } },
        country: true,
        organizer: { select: { name: true, id: true, logo: true } },
      },
      orderBy,
      skip,
      take,
    }),
    db.event.count({ where }),
  ]);

  const cities = await db.city.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const totalPages = Math.ceil(total / take);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Events</h1>
      <EventFilters cities={cities} />
      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No events found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  );
}
