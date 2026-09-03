"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Select, Spinner, StatusBadge, Table, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate: string | null;
  progress?: number;
  employee: { id: string; firstName: string; lastName: string };
}

interface Cycle {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function PerformancePage() {
  const { me, can } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [reviews, setReviews] = useState<{ id: string; status: string; cycle: { id: string; name: string }; reviewee: { firstName: string; lastName: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [g, c, r] = await Promise.all([
        api<{ data: Goal[] }>("/goals"),
        api<{ data: Cycle[] }>("/review-cycles"),
        api<{ data: typeof reviews }>("/reviews"),
      ]);
      setGoals(g.data);
      setCycles(c.data);
      setReviews(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createGoal() {
    setSubmitting(true);
    setError(null);
    try {
      await api("/goals", {
        method: "POST",
        body: { title: form.title, description: form.description || undefined, dueDate: form.dueDate || undefined, employeeId: me?.employeeId ?? undefined },
      });
      setGoalOpen(false);
      setForm({ title: "", description: "", dueDate: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create goal");
    } finally {
      setSubmitting(false);
    }
  }

  async function advanceGoal(id: string, status: string) {
    try {
      await api(`/goals/${id}`, { method: "PATCH", body: { status } });
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load performance" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Performance</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Goals, review cycles and feedback.</p>
        </div>
        <Button onClick={() => setGoalOpen(true)}>New goal</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My goals" />
          {goals.length === 0 ? (
            <EmptyState title="No goals yet" description="Set a goal to get started." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {goals.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{g.title}</p>
                    <p className="text-xs text-zinc-400">{g.dueDate ? `Due ${formatDate(g.dueDate)}` : "No due date"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.status} />
                    {g.status === "ACTIVE" && (
                      <Button size="sm" variant="secondary" onClick={() => void advanceGoal(g.id, "COMPLETED")}>Complete</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Review cycles" />
          {cycles.length === 0 ? (
            <EmptyState title="No review cycles" description="Your HR team can create performance review cycles." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {cycles.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{c.name}</p>
                    <p className="text-xs text-zinc-400">{formatDate(c.startDate)} – {formatDate(c.endDate)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="My reviews" />
        {reviews.length === 0 ? (
          <EmptyState title="No reviews assigned" description="Reviews you're involved in appear here." />
        ) : (
          <Table head={["Cycle", "Subject", "Status"]}>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 text-sm text-zinc-700">{r.cycle.name}</td>
                <td className="px-5 py-3 text-sm text-zinc-700">{r.reviewee.firstName} {r.reviewee.lastName}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="New goal">
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ship the Q3 platform milestone" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setGoalOpen(false)}>Cancel</Button>
            <Button onClick={() => void createGoal()} loading={submitting}>Create goal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
