"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Heart, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";

export interface EventCategory {
  name: string;
  slug: string;
  color?: string | null;
}

export interface EventCity {
  name: string;
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface EventCountry {
  name: string;
  slug: string;
  code: string;
  emoji?: string | null;
}

export interface EventOrganizer {
  id: string;
  name: string;
  logo?: string | null;
}

export interface EventCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage?: string | null;
  startDate: string | Date;
  startTime?: string | null;
  venueName?: string | null;
  address?: string | null;
  price: number;
  currency?: string | null;
  isFree: boolean;
  category: EventCategory;
  city: EventCity;
  country?: EventCountry | null;
  organizer?: EventOrganizer | null;
}

interface EventCardProps {
  event: EventCardData;
  isFavorite?: boolean;
  onToggleFavorite?: (event: EventCardData) => void;
  className?: string;
}

function getCategoryColor(color?: string | null): string {
  const palette: Record<string, string> = {
    "#8b5cf6": "bg-purple-100 text-purple-700",
    "#22c55e": "bg-green-100 text-green-700",
    "#3b82f6": "bg-blue-100 text-blue-700",
    "#6366f1": "bg-indigo-100 text-indigo-700",
    "#f59e0b": "bg-amber-100 text-amber-700",
    "#ef4444": "bg-red-100 text-red-700",
    "#ec4899": "bg-pink-100 text-pink-700",
    "#f97316": "bg-orange-100 text-orange-700",
    "#14b8a6": "bg-teal-100 text-teal-700",
    "#06b6d4": "bg-cyan-100 text-cyan-700",
    "#a855f7": "bg-fuchsia-100 text-fuchsia-700",
    "#0ea5e9": "bg-sky-100 text-sky-700",
    "#7c3aed": "bg-violet-100 text-violet-700",
    "#10b981": "bg-emerald-100 text-emerald-700",
    "#6b7280": "bg-gray-100 text-gray-700",
  };
  return palette[color ?? ""] ?? "bg-slate-100 text-slate-700";
}

export function EventCard({
  event,
  isFavorite = false,
  onToggleFavorite,
  className,
}: EventCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    onToggleFavorite?.(event);
  };

  const location = [event.city?.name, event.country?.name]
    .filter(Boolean)
    .join(", ");

  const dateLabel = formatDate(event.startDate);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group block overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
            <ImageOff className="h-10 w-10 text-white/60" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <Badge
            className={cn(
              "border-0",
              getCategoryColor(event.category?.color)
            )}
          >
            {event.category?.name}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavorite}
          className={cn(
            "absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur transition-colors hover:bg-white",
            favorite ? "text-red-500" : "text-slate-500"
          )}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", favorite && "fill-red-500")} />
        </Button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-slate-900">
            {event.title}
          </h3>
          {event.isFree ? (
            <Badge
              variant="secondary"
              className="shrink-0 border-0 bg-green-100 text-green-700"
            >
              Free
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="shrink-0 border-0 bg-purple-100 text-purple-700"
            >
              {formatPrice(event.price, event.currency ?? "USD")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
            {dateLabel}
            {event.startTime && ` at ${formatTime(event.startTime)}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="line-clamp-1">
            {event.venueName
              ? `${event.city?.name} - ${event.venueName}`
              : location}
          </span>
        </div>

        <div className="border-t pt-3 text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {event.organizer?.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
