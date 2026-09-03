"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

export default function OrganizerEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/organizer/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []));
  }, []);

  const filtered = filter === "ALL" ? events : events.filter((e) => e.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          href="/organizer/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Event
        </Link>
      </div>
      <div className="flex gap-2 mb-4">
        {["ALL", "PUBLISHED", "PENDING", "DRAFT", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded text-sm ${
              filter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-gray-500">
              <th className="p-3">Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Views</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr key={event.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{event.title}</td>
                <td className="p-3">{new Date(event.startDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : event.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : event.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="p-3">{event.viewCount || 0}</td>
                <td className="p-3">
                  <Link href={`/organizer/events/${event.id}/edit`} className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No events found.</p>
        )}
      </div>
    </div>
  );
}
