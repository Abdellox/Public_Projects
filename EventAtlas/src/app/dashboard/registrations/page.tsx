"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Registration = {
  id: string;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
};

const statusFilters = ["ALL", "GOING", "INTERESTED", "MAYBE"];

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/registrations")
      .then((r) => r.json())
      .then((data) => {
        setRegistrations(data);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "ALL"
      ? registrations
      : registrations.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Registrations</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {statusFilters.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse bg-muted h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No registrations found.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => (
            <Link
              key={reg.id}
              href={`/events/${reg.event.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{reg.event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(reg.event.startDate))}
                  </p>
                </div>
                <Badge variant={reg.status === "GOING" ? "default" : "secondary"}>
                  {reg.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
