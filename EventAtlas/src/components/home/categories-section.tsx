import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export function CategoriesSection() {
  return (
    <section className="w-full bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-2xl font-bold text-slate-900">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/events?category=${category.slug}`}
              className="group flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: category.color + "20" }}
              >
                <div
                  className="h-7 w-7 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
