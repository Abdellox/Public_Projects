"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Select, Spinner, StatusBadge, Textarea, Table } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  durationHours?: number | null;
  _count?: { assignments: number };
}

interface Assignment {
  id: string;
  status: string;
  dueDate: string | null;
  completedAt?: string | null;
  course: { id: string; title: string; category?: string | null; durationHours?: number | null };
}

export default function TrainingPage() {
  const { can } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certifications, setCertifications] = useState<{ id: string; title: string; validTo: string | null; courseTitle?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", contentUrl: "", durationHours: "", certificationValidMonths: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [c, a, certs] = await Promise.all([
        api<{ data: Course[] }>("/courses"),
        api<{ data: Assignment[] }>("/trainings"),
        api<{ data: typeof certifications }>("/certifications"),
      ]);
      setCourses(c.data);
      setAssignments(a.data);
      setCertifications(certs.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load training");
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
      await api("/courses", {
        method: "POST",
        body: {
          title: form.title,
          description: form.description || undefined,
          category: form.category || undefined,
          contentUrl: form.contentUrl || undefined,
          durationHours: form.durationHours ? Number(form.durationHours) : undefined,
          certificationValidMonths: form.certificationValidMonths ? Number(form.certificationValidMonths) : undefined,
        },
      });
      setCreateOpen(false);
      setForm({ title: "", description: "", category: "", contentUrl: "", durationHours: "", certificationValidMonths: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create course");
    } finally {
      setSubmitting(false);
    }
  }

  async function complete(id: string) {
    try {
      await api(`/trainings/${id}/complete`, { method: "POST", body: {} });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark complete");
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load training" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Training</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{courses.length} courses · {assignments.filter((a) => a.status !== "COMPLETED").length} assignments in progress</p>
        </div>
        {can("training.manage") && <Button onClick={() => setCreateOpen(true)}>New course</Button>}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My assignments" />
          {assignments.length === 0 ? (
            <EmptyState title="No assignments" description="Courses you're assigned to appear here." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{a.course.title}</p>
                    <p className="text-xs text-zinc-400">
                      {a.course.category ?? "General"} · {a.dueDate ? `Due ${formatDate(a.dueDate)}` : "No due date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    {a.status !== "COMPLETED" && (
                      <Button size="sm" variant="secondary" onClick={() => void complete(a.id)}>Mark done</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="My certifications" />
          {certifications.length === 0 ? (
            <EmptyState title="No certifications yet" description="Earn a certification by completing a certified course." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {certifications.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{c.title}</p>
                    <p className="text-xs text-zinc-400">{c.courseTitle ?? ""}</p>
                  </div>
                  {c.validTo ? (
                    new Date(c.validTo) < new Date() ? (
                      <Badge tone="red">Expired {formatDate(c.validTo)}</Badge>
                    ) : (
                      <Badge tone="green">Valid to {formatDate(c.validTo)}</Badge>
                    )
                  ) : (
                    <Badge tone="green">Valid</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Course catalog" />
        <Table head={["Course", "Category", "Duration", "Enrolled"]}>
          {courses.map((c) => (
            <tr key={c.id} className="transition hover:bg-zinc-50">
              <td className="px-5 py-3 font-medium text-zinc-800">{c.title}</td>
              <td className="px-5 py-3"><Badge tone="gray">{c.category ?? "General"}</Badge></td>
              <td className="px-5 py-3 text-sm text-zinc-600">{c.durationHours ? `${c.durationHours}h` : "—"}</td>
              <td className="px-5 py-3 text-sm text-zinc-600">{c._count?.assignments ?? 0}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New course" wide>
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Security Awareness Basics" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Compliance" />
            </Field>
            <Field label="Duration (hours)">
              <Input type="number" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Content URL">
              <Input value={form.contentUrl} onChange={(e) => setForm({ ...form, contentUrl: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Certification valid (months)">
              <Input type="number" value={form.certificationValidMonths} onChange={(e) => setForm({ ...form, certificationValidMonths: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} loading={submitting}>Create course</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
