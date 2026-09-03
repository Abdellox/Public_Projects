"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

interface EventMapEvent {
  id: string;
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
  category: { name: string; color: string };
}

interface EventMapProps {
  events: EventMapEvent[];
  height?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

function EventMapInner({
  events,
  height = "400px",
  className,
  center = [48.8566, 2.3522],
  zoom = 3,
}: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const leafletLoaded = new Promise<void>((resolve) => {
      if ((window as any).L) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

    leafletLoaded.then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      if (events.length > 0) {
        events.forEach((event) => {
          const marker = L.circleMarker([event.latitude, event.longitude], {
            radius: 8,
            fillColor: event.category.color,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          marker.bindPopup(
            `<div style="min-width:150px">
              <p style="font-weight:600;margin:0 0 4px">${event.title}</p>
              <p style="font-size:12px;color:#6b7280;margin:0 0 4px">${event.category.name}</p>
              <a href="/events/${event.slug}" style="color:#6366f1;font-size:12px;text-decoration:none">View Event →</a>
            </div>`
          );
        });

        if (events.length === 1) {
          map.setView([events[0].latitude, events[0].longitude], 13);
        }
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, center, zoom]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height, width: "100%", borderRadius: "0.75rem" }}
    />
  );
}

const EventMap = dynamic(() => Promise.resolve(EventMapInner), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl bg-slate-100"
      style={{ height: "400px" }}
    >
      <p className="text-sm text-slate-500">Loading map...</p>
    </div>
  ),
});

export { EventMap };
