"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, Calendar, Building2, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={stats.totalUsers || 0} icon={Users} />
        <StatsCard title="Total Events" value={stats.totalEvents || 0} icon={Calendar} />
        <StatsCard title="Organizers" value={stats.totalOrganizers || 0} icon={Building2} />
        <StatsCard title="Published" value={stats.publishedEvents || 0} icon={CheckCircle} color="text-green-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/events" className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 text-sm">Manage Events</Link>
            <Link href="/admin/users" className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 text-sm">Manage Users</Link>
            <Link href="/admin/categories" className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 text-sm">Manage Categories</Link>
            <Link href="/admin/countries" className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 text-sm">Manage Countries & Cities</Link>
            <Link href="/admin/reports" className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 text-sm">Review Reports</Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Events</h2>
          {stats.pendingEvents > 0 ? (
            <p className="text-yellow-600">{stats.pendingEvents} events waiting for approval. <Link href="/admin/events" className="underline">Review now</Link></p>
          ) : (
            <p className="text-gray-500">No pending events.</p>
          )}
        </div>
      </div>
    </div>
  );
}
