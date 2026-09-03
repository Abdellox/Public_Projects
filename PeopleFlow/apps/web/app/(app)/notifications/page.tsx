"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge, Button, Card, CardHeader, EmptyState, Spinner } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body?: string | null;
  type: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [data, setData] = useState<{ data: Notification[]; unreadCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(unread = false) {
    setLoading(true);
    try {
      const res = await api<{ data: Notification[]; unreadCount: number }>(`/notifications?unread=${unread}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function markAllRead() {
    await api("/notifications/read", { method: "POST", body: {} });
    await load();
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{data.unreadCount} unread</p>
        </div>
        {data.unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>Mark all read</Button>
        )}
      </div>

      <Card>
        {data.data.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up." />
        ) : (
          <ul className="divide-y divide-zinc-50">
            {data.data.map((n) => (
              <li key={n.id} className="px-5 py-3.5">
                <Content n={n} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Content({ n }: { n: Notification }) {
  const inner = (
    <div className="flex items-start gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-brand-500"}`} />
      <div className="min-w-0">
        <p className={`text-sm ${n.readAt ? "text-zinc-500" : "font-medium text-zinc-800"}`}>{n.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
          <Badge tone="gray">{n.type.replace(/_/g, " ")}</Badge>
          <span>{formatDateTime(n.createdAt)}</span>
        </div>
      </div>
    </div>
  );
  if (n.link) {
    return <Link href={n.link}>{inner}</Link>;
  }
  return inner;
}
