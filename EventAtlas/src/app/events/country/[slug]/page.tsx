import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/event-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = await db.country.findUnique({ where: { slug } });
  return {
    title: country ? `Events in ${country.name} | EventAtlas` : "Country Events",
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = await db.country.findUnique({
    where: { slug },
    include: { cities: { orderBy: { name: "asc" } } },
  });

  if (!country) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Country not found</h1>
      </div>
    );
  }

  const events = await db.event.findMany({
    where: { city: { countryId: country.id }, status: "PUBLISHED" },
    include: {
      category: true,
      city: { include: { country: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {country.emoji} {country.name}
      </h1>

      {country.cities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Cities</h2>
          <div className="flex flex-wrap gap-2">
            {country.cities.map((city) => (
              <a
                key={city.id}
                href={`/events/city/${city.slug}`}
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-sm"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Events in {country.name}</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No events in this country yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
