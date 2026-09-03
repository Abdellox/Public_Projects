"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Spinner, Table } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface PendingLeave {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  leaveType: { name: string };
  employee: { id: string; name: string };
  createdByName?: string;
}

export default function ApprovalsPage() {
  const { can } = useSession();
  const [items, setItems] = useState<PendingLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api<{ data: PendingLeave[] }>("/leave/requests?scope=team&status=PENDING");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, decision: "APPROVE" | "REJECT") {
    setWorking(id);
    setError(null);
    try {
      await api(`/leave/requests/${id}/decide`, { method: "POST", body: { decision } });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update request");
    } finally {
      setWorking(null);
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load approvals" description={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Approvals</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Leave requests waiting for your decision.</p>
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState title="You're all caught up 🎉" description="No pending requests waiting for you." />
        ) : (
          <div className="divide-y divide-zinc-50">
            {items.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {r.employee.name} <span className="font-normal text-zinc-400">requested {r.leaveType.name}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days} day{r.days > 1 ? "s" : ""}
                  </p>
                  {r.reason && <p className="mt-0.5 text-xs italic text-zinc-400">“{r.reason}”</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="amber">Pending</Badge>
                  <Button variant="secondary" size="sm" disabled={!!working} onClick={() => void decide(r.id, "REJECT")}>
                    Reject
                  </Button>
                  <Button size="sm" loading={working === r.id} onClick={() => void decide(r.id, "APPROVE")}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ErrorBanner message={error} />
    </div>
  );
}
