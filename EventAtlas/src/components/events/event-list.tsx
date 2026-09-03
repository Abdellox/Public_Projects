"use client";

import { CalendarX2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCard, type EventCardData } from "@/components/events/event-card";
import { Skeleton } from "@/components/ui/skeleton";

interface EventListProps {
  events: EventCardData[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function EventList({
  events,
  loading = false,
  emptyMessage = "No events found. Try adjusting your filters.",
  className,
}: EventListProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
          className
        )}
        data-testid="events-loading"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-white">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-16 text-center">
        <CalendarX2 className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-lg font-medium text-slate-700">
          No events to show
        </p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
