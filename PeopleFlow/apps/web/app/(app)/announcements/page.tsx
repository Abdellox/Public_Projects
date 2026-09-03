"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Spinner, StatusBadge, Table, Textarea, Avatar, Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  authorName?: string;
  pinned?: boolean;
  reactionCount: number;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  commentCount: number;
  comments: { id: string; authorName: string; body: string; createdAt: string }[];
}

export default function AnnouncementsPage() {
  const { can } = useSession();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "ALL" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api<{ data: Announcement[] }>("/announcements");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api("/announcements", { method: "POST", body: form });
      setCreateOpen(false);
      setForm({ title: "", body: "", audience: "ALL" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish");
    } finally {
      setSubmitting(false);
    }
  }

  async function react(id: string, emoji: string) {
    try {
      await api(`/announcements/${id}/reactions`, { method: "POST", body: { emoji } });
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load announcements" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Announcements</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Company news, updates and celebrations.</p>
        </div>
        {can("org.settings") && <Button onClick={() => setCreateOpen(true)}>New announcement</Button>}
      </div>

      {items.length === 0 ? (
        <Card><EmptyState title="No announcements yet" description="Company-wide news will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Avatar name={a.authorName ?? "?"} size="sm" />
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">{a.title}</h2>
                    <p className="text-xs text-zinc-400">
                      {a.authorName ?? "Unknown"} · {formatDateTime(a.publishedAt)}
                    </p>
                  </div>
                </div>
                {a.pinned && <Badge tone="amber">Pinned</Badge>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{a.body}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
                {a.reactions.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => void react(a.id, r.emoji)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition ${
                      r.reacted ? "border-brand-300 bg-brand-50 text-brand-700" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.count}</span>
                  </button>
                ))}
                <Badge tone="gray">{a.commentCount} comment{a.commentCount === 1 ? "" : "s"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New announcement" wide>
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Quarterly all-hands reminders" />
          </Field>
          <Field label="Message">
            <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your announcement…" />
          </Field>
          <Field label="Audience">
            <Input value={form.audience} disabled />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void submit()} loading={submitting}>Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
