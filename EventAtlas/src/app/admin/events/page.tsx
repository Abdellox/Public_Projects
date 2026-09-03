"use client";
import { useEffect, useState } from "react";
import { Check, X, Star } from "lucide-react";

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");

  const fetchEvents = () => {
    const q = status === "ALL" ? "" : `?status=${status}`;
    fetch(`/api/admin/events${q}`).then((r) => r.json()).then((data) => setEvents(data.events || []));
  };

  useEffect(() => { fetchEvents(); }, [status]);

  const updateEvent = async (eventId: string, action: string, value?: any) => {
    await fetch("/api/admin/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, action, ...value }),
    });
    fetchEvents();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Event Management</h1>
      <div className="flex gap-2 mb-4">
        {["ALL", "PENDING", "PUBLISHED", "CANCELLED", "FINISHED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded text-sm ${status === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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
              <th className="p-3">Organizer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{event.title}</td>
                <td className="p-3">{event.organizer?.name || "—"}</td>
                <td className="p-3">{new Date(event.startDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    event.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                    event.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    event.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{event.status}</span>
                </td>
                <td className="p-3 flex gap-2">
                  {event.status === "PENDING" && (
                    <>
                      <button onClick={() => updateEvent(event.id, "status", { status: "PUBLISHED" })} className="text-green-600 hover:text-green-800" title="Approve"><Check className="h-4 w-4" /></button>
                      <button onClick={() => updateEvent(event.id, "status", { status: "CANCELLED" })} className="text-red-600 hover:text-red-800" title="Reject"><X className="h-4 w-4" /></button>
                    </>
                  )}
                  <button
                    onClick={() => updateEvent(event.id, "feature", { isFeatured: !event.isFeatured })}
                    className={`${event.isFeatured ? "text-yellow-500" : "text-gray-400"} hover:text-yellow-600`}
                    title="Toggle Featured"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <p className="text-center text-gray-500 py-8">No events found.</p>}
      </div>
    </div>
  );
}
