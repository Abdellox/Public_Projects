"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/lib/constants";

const stats = [
  { label: "Events", value: "1000+" },
  { label: "Cities", value: "50+" },
  { label: "Countries", value: "15+" },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/events?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[500px] w-full bg-gradient-to-r from-indigo-600 to-purple-700">
      <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Discover Events Around the World
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-indigo-100">
          Find the best events, conferences, festivals, and meetups happening
          near you and across the globe.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative mb-8 flex w-full max-w-2xl items-center"
        >
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search events, cities, or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-32 text-base text-slate-900 shadow-lg placeholder:text-slate-400"
          />
          <Button
            type="submit"
            className="absolute right-2 h-10 rounded-full bg-indigo-600 px-6 text-white hover:bg-indigo-700"
          >
            Search
          </Button>
        </form>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.slug}
              onClick={() =>
                router.push(`/events?category=${cat.slug}`)
              }
              className={cn(
                "rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-2xl font-bold">{stat.value}</span>
                <span className="text-indigo-200">{stat.label}</span>
              </div>
              {i < stats.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="h-8 bg-white/30"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
