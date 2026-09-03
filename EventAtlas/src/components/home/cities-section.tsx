import Link from "next/link";
import { MapPin } from "lucide-react";

interface City {
  name: string;
  slug: string;
  _count: { events: number };
  country: { name: string; slug: string };
}

interface CitiesSectionProps {
  cities: City[];
}

export function CitiesSection({ cities }: CitiesSectionProps) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-2xl font-bold text-slate-900">
          Popular Cities
        </h2>

        {cities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <p className="text-slate-500">No cities available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/events?city=${city.slug}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-200" />
                    <span className="text-xs font-medium text-indigo-200">
                      {city.country.name}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{city.name}</h3>
                  <p className="mt-1 text-sm text-indigo-100">
                    {city._count.events} event
                    {city._count.events !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
