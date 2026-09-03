import Link from "next/link";
import { db } from "@/lib/db";
import { SITE_NAME } from "@/lib/constants";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedEvents } from "@/components/home/featured-events";
import { CategoriesSection } from "@/components/home/categories-section";
import { CitiesSection } from "@/components/home/cities-section";
import { StatsSection } from "@/components/home/stats-section";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const featuredEvents = await db.event.findMany({
    where: { isFeatured: true, status: "PUBLISHED" },
    include: {
      category: true,
      city: { include: { country: true } },
      country: true,
      organizer: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { startDate: "asc" },
    take: 8,
  });

  const citiesWithCounts = await db.city.findMany({
    include: {
      country: { select: { name: true, slug: true } },
      _count: { select: { events: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { events: { _count: "desc" } },
    take: 12,
  });

  return (
    <div>
      <HeroSection />
      <FeaturedEvents events={featuredEvents} />
      <CategoriesSection />
      <CitiesSection
        cities={citiesWithCounts.map((c) => ({
          name: c.name,
          slug: c.slug,
          country: { name: c.country.name, slug: c.country.slug },
          _count: { events: c._count.events },
        }))}
      />
      <StatsSection />
      <section className="py-20 bg-primary-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Organize Your Own Event</h2>
          <p className="text-lg mb-8 text-primary-100">
            Share your events with thousands of people around the world.
          </p>
          <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
