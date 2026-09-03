"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Calendar, Eye, Heart, Plus } from "lucide-react";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, views: 0 });

  useEffect(() => {
    fetch("/api/organizer/events")
      .then((r) => r.json())
      .then((data) => {
        const evts = data.events || [];
        setEvents(evts);
        setStats({
          total: evts.length,
          published: evts.filter((e: any) => e.status === "PUBLISHED").length,
          pending: evts.filter((e: any) => e.status === "PENDING").length,
          views: evts.reduce((sum: number, e: any) => sum + (e.viewCount || 0), 0),
        });
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
        <Link
          href="/organizer/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Event
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Events" value={stats.total} icon={Calendar} />
        <StatsCard title="Published" value={stats.published} icon={Calendar} color="text-green-600" />
        <StatsCard title="Pending" value={stats.pending} icon={Calendar} color="text-yellow-600" />
        <StatsCard title="Total Views" value={stats.views} icon={Eye} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">
            No events yet.{" "}
            <Link href="/organizer/events/new" className="text-indigo-600 hover:underline">
              Create your first event
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 5).map((event) => (
                  <tr key={event.id} className="border-b">
                    <td className="py-3">
                      <Link href={`/organizer/events/${event.id}/edit`} className="text-indigo-600 hover:underline">
                        {event.title}
                      </Link>
                    </td>
                    <td className="py-3">{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : event.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3">{event.viewCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
