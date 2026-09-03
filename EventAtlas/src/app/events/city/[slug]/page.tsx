import { db } from "@/lib/db";
import Link from "next/link";

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const city = await db.city.findFirst({
    where: { slug },
    include: { country: true },
  });

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">City not found</h1>
          <Link href="/events" className="text-indigo-600 hover:underline">
            Browse all events
          </Link>
        </div>
      </div>
    );
  }

  const events = await db.event.findMany({
    where: { cityId: city.id, status: "PUBLISHED" },
    include: { category: true, organizer: true },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-indigo-200 mb-2">{city.country.name}</p>
          <h1 className="text-4xl font-bold mb-2">{city.name}</h1>
          <p className="text-indigo-200">{events.length} events available</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              <span className="text-xs font-medium text-indigo-600">
                {event.category.name}
              </span>
              <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {event.isFree ? (
                <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  Free
                </span>
              ) : (
                <span className="inline-block mt-2 text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                  ${event.price}
                </span>
              )}
            </Link>
          ))}
        </div>
        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events in {city.name} yet.</p>
            <Link href="/events" className="text-indigo-600 hover:underline mt-2 inline-block">
              Browse all events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
