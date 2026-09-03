"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Bell, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/favorites").then((r) => r.json()),
      fetch("/api/user/registrations").then((r) => r.json()),
      fetch("/api/user/reminders").then((r) => r.json()),
    ]).then(([fav, reg, rem]) => {
      setFavorites(fav);
      setRegistrations(reg);
      setReminders(rem);
    });
  }, []);

  const upcomingRegistrations = registrations.filter(
    (r) => r.status === "GOING" || r.status === "INTERESTED"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Favorite Events"
          value={favorites.length}
          icon={Heart}
        />
        <StatsCard
          title="Upcoming Registrations"
          value={upcomingRegistrations}
          icon={Calendar}
        />
        <StatsCard
          title="Active Reminders"
          value={reminders.length}
          icon={Bell}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Favorites</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/favorites">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map((fav: any) => (
              <EventCard key={fav.id} event={fav.event} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No favorites yet.{" "}
            <Link href="/events" className="text-blue-600 hover:underline">
              Browse events
            </Link>{" "}
            to get started.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/registrations">My Registrations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reminders">My Reminders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings">Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
