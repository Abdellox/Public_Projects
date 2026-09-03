"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

const quickFilters = [
  { value: "today", label: "Today" },
  { value: "weekend", label: "This Weekend" },
  { value: "month", label: "This Month" },
];

const sortOptions = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance" },
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
];

interface EventFiltersProps {
  cities?: { slug: string; name: string }[];
  className?: string;
}

export function EventFilters({ cities = [], className }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [quickFilter, setQuickFilter] = useState(searchParams.get("quick") || "");
  const [isFree, setIsFree] = useState<boolean | null>(
    searchParams.get("isFree") === "true"
      ? true
      : searchParams.get("isFree") === "false"
      ? false
      : null
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date");

  const applyFilters = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  };

  const update = (patch: Record<string, string>) => {
    applyFilters(patch);
  };

  const clearAll = () => {
    setQuery(""); setCategory(""); setCity(""); setStartDate(""); setEndDate("");
    setQuickFilter(""); setIsFree(null); setSortBy("date");
    router.push("/events");
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(query || category || city || startDate || endDate || quickFilter || isFree !== null || sortBy !== "date");
  }, [query, category, city, startDate, endDate, quickFilter, isFree, sortBy]);

  return (
    <div className={cn("space-y-5 rounded-xl border bg-white p-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="search"
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters({ search: query });
              }
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            applyFilters({ category: e.target.value });
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Select
          id="city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            applyFilters({ city: e.target.value });
          }}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            applyFilters({ startDate: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end-date">End Date</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            applyFilters({ endDate: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((qf) => (
            <Button
              key={qf.value}
              variant="outline"
              size="sm"
              className={cn(quickFilter === qf.value && "border-purple-600 bg-purple-50 text-purple-700")}
              onClick={() => {
                const next = quickFilter === qf.value ? "" : qf.value;
                setQuickFilter(next);
                applyFilters({ quick: next });
              }}
            >
              {qf.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Price</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(isFree === true && "border-purple-600 bg-purple-50 text-purple-700")}
            onClick={() => {
              const next = isFree === true ? null : true;
              setIsFree(next);
              applyFilters({ isFree: next === null ? "" : String(next) });
            }}
          >
            Free
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(isFree === false && "border-purple-600 bg-purple-50 text-purple-700")}
            onClick={() => {
              const next = isFree === false ? null : false;
              setIsFree(next);
              applyFilters({ isFree: next === null ? "" : String(next) });
            }}
          >
            Paid
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Sort By</Label>
        <Select
          id="sort"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            applyFilters({ sort: e.target.value });
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <Button variant="ghost" className="w-full" onClick={clearAll} disabled={!hasActiveFilters}>
        <RotateCcw className="h-4 w-4" />
        Clear All Filters
      </Button>
    </div>
  );
}
