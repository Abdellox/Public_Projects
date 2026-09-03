import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventCard } from "@/components/events/event-card";
import { EventMapWrapper } from "./event-map-wrapper";
import { FavoriteButton } from "./favorite-button";
import { ShareButton } from "./share-button";
import { ReportButton } from "./report-button";
import { CountdownTimer } from "./countdown-timer";
import {
  MapPin,
  Calendar,
  Clock,
  Ticket,
  User,
  Share2,
  Flag,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      category: true,
      city: { include: { country: true } },
      organizer: true,
      _count: { select: { favorites: true } },
    },
  });
  return event;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | EventAtlas`,
    description: event.shortDescription.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.shortDescription.slice(0, 160),
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) notFound();

  const similarEvents = await db.event.findMany({
    where: {
      categoryId: event.categoryId,
      status: "PUBLISHED",
      id: { not: event.id },
    },
    include: {
      category: true,
      city: { include: { country: true } },
      country: true,
      organizer: { select: { id: true, name: true, logo: true } },
    },
    take: 4,
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {event.coverImage && (
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="secondary">{event.category.name}</Badge>
            <h1 className="text-3xl font-bold mt-2">{event.title}</h1>
          </div>

          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            {event.venueName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>
                  {event.venueName}, {event.city.name}, {event.city.country.name}
                </span>
              </div>
            )}
          </div>

          <CountdownTimer targetDate={event.startDate.toISOString()} />

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">About This Event</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{event.fullDescription}</p>
          </div>

          {event.address && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Venue</h2>
              <p className="text-gray-700">{event.venueName}</p>
              <p className="text-gray-600">{event.address}</p>
              {event.latitude && event.longitude && (
                <div className="mt-4 h-64 rounded-lg overflow-hidden">
                  <EventMapWrapper
                    latitude={event.latitude}
                    longitude={event.longitude}
                    title={event.title}
                  />
                </div>
              )}
            </div>
          )}

          {similarEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Similar Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-2xl font-bold">
                  {event.isFree ? "Free" : formatPrice(event.price, event.currency)}
                </p>
              </div>
              {event.ticketUrl ? (
                <Button asChild className="w-full" size="lg">
                  <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                    <Ticket className="mr-2 h-5 w-5" />
                    Get Tickets
                  </a>
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  <Ticket className="mr-2 h-5 w-5" />
                  {event.isFree ? "Free Event" : "Tickets Unavailable"}
                </Button>
              )}
              <div className="flex gap-2">
                <FavoriteButton eventId={event.id} />
                <ShareButton title={event.title} />
                <ReportButton eventId={event.id} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Organizer</h3>
              <Link
                href={`/organizer/${event.organizer.id}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  <p className="text-sm text-gray-500">View Profile</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
