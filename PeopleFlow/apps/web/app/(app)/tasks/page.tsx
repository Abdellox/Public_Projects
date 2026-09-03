"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Select, Spinner, StatusBadge, Table, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  workflowName?: string | null;
  createdByName?: string;
}

export default function TasksPage() {
  const { can } = useSession();
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api<{ data: Task[] }>("/tasks");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    setSubmitting(true);
    setError(null);
    try {
      await api("/tasks", { method: "POST", body: {
        ...form,
        dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00.000Z`).toISOString() : null,
      } });
      setCreateOpen(false);
      setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/tasks/${id}`, { method: "PATCH", body: { status } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load tasks" description={error} />;

  const open = items.filter((t) => t.status !== "COMPLETED");
  const done = items.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{open.length} open · {done.length} completed</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New task</Button>
      </div>

      <Card>
        <CardHeader title="To do" />
        {open.length === 0 ? (
          <EmptyState title="All clear" description="No open tasks assigned to you." />
        ) : (
          <Table head={["Task", "Due", "Priority", "Status", ""]}>
            {open.map((t) => (
              <tr key={t.id} className="transition hover:bg-zinc-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-800">{t.title}</p>
                  {t.description && <p className="text-xs text-zinc-400">{t.description}</p>}
                </td>
                <td className="px-5 py-3 text-sm text-zinc-600">{t.dueDate ? formatDate(t.dueDate) : "—"}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{t.priority.replace(/_/g, " ")}</td>
                <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="secondary" onClick={() => void updateStatus(t.id, "COMPLETED")}>Complete</Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New task">
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Prepare onboarding deck" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} loading={submitting}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
