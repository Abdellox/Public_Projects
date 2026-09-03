"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EventMap } from "@/components/maps/event-map";
import { Search } from "lucide-react";

export default function MapPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");

  useEffect(() => {
    fetch("/api/events?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setEvents(
          (data.events || []).filter(
            (e: any) => e.latitude != null && e.longitude != null
          )
        );
        setLoading(false);
      });
  }, []);

  const filtered = city
    ? events.filter((e) =>
        e.city?.name?.toLowerCase().includes(city.toLowerCase())
      )
    : events;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="bg-white shadow-sm z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city..."
              className="pl-10 border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filtered.length} events on map
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <EventMap
          events={filtered.map((e) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            latitude: e.latitude,
            longitude: e.longitude,
            category: e.category,
          }))}
          height="100%"
        />
      )}
      <p className="text-xs text-gray-500 p-3 bg-white">
        Map data © OpenStreetMap contributors. Event locations are approximate.
      </p>
    </div>
  );
}