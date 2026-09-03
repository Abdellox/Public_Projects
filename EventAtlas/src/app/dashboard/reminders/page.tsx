"use client";

import { useEffect, useState } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

type Reminder = {
  id: string;
  remindAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/reminders")
      .then((r) => r.json())
      .then((data) => {
        setReminders(data);
        setLoading(false);
      });
  }, []);

  const handleCancel = async (id: string) => {
    await fetch(`/api/user/reminders/${id}`, { method: "DELETE" });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Reminders</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse bg-muted h-16" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No reminders</h3>
          <p className="text-muted-foreground mt-1">
            Set reminders for events you&apos;re interested in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium">{rem.event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Event: {formatDate(new Date(rem.event.startDate))} &middot; Reminder:{" "}
                  {formatDate(new Date(rem.remindAt))} at{" "}
                  {new Date(rem.remindAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(rem.id)}
              >
                Cancel
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
