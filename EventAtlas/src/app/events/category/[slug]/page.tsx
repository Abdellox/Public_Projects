import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/event-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  return {
    title: category ? `${category.name} Events | EventAtlas` : "Events by Category",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  const events = await db.event.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    include: {
      category: true,
      city: { include: { country: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name} Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No events in this category yet.</p>
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
