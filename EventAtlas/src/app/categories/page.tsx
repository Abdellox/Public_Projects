import { db } from "@/lib/db";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { events: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Browse by Category</h1>
        <p className="text-gray-500 mb-8">Find events in every category</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/events?category=${category.id}`}
              className="group p-6 rounded-xl border hover:shadow-lg transition bg-white"
              style={{ borderTop: `4px solid ${category.color || "#6366f1"}` }}
            >
              <div
                className="mb-3 h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: category.color || "#6366f1" }}
              >
                {category.name[0]}
              </div>
              <h3 className="font-semibold group-hover:text-indigo-600">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {category._count.events} events
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}