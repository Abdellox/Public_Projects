"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Select, Spinner, StatusBadge, Table } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface LeaveType {
  id: string;
  name: string;
  daysPerYear: number;
}

interface Balance {
  id: string;
  year: number;
  remaining: number;
  used: number;
  pending: number;
  leaveType: { id: string; name: string };
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string | null;
  leaveType: { id: string; name: string };
  employee: { id: string; name: string };
}

export default function LeavePage() {
  const { can } = useSession();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [t, b, r] = await Promise.all([
        api<{ data: LeaveType[] }>("/leave/types"),
        api<{ data: Balance[] }>("/leave/balances"),
        api<{ data: LeaveRequest[] }>("/leave/requests?scope=mine"),
      ]);
      setTypes(t.data);
      setBalances(b.data);
      setRequests(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalRemaining = useMemo(() => balances.reduce((acc, b) => acc + b.remaining, 0), [balances]);

  async function submit() {
    setFormError(null);
    if (!form.leaveTypeId || !form.startDate || !form.endDate) {
      setFormError("Please fill in leave type and dates.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/leave/requests", { method: "POST", body: { ...form } });
      setCreateOpen(false);
      setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load leave" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leave</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{totalRemaining} days of leave remaining this year</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Request leave</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {balances.length === 0 ? (
          <p className="text-sm text-zinc-500">No leave balances configured yet.</p>
        ) : (
          balances.map((b) => (
            <Card key={b.id} className="p-4">
              <p className="text-xs font-medium text-zinc-500">{b.leaveType.name} · {b.year}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900">{b.remaining}<span className="text-sm font-normal text-zinc-400"> days</span></p>
              <p className="mt-1 text-xs text-zinc-400">{b.used} used · {b.pending} pending</p>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader title="My requests" />
        {requests.length === 0 ? (
          <EmptyState title="No leave requests yet" description="Request time off and it will appear here." />
        ) : (
          <Table head={["Leave type", "Dates", "Days", "Status"]}>
            {requests.map((r) => (
              <tr key={r.id} className="transition hover:bg-zinc-50">
                <td className="px-5 py-3 text-sm font-medium text-zinc-800">{r.leaveType.name}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">
                  {formatDate(r.startDate)} – {formatDate(r.endDate)}
                </td>
                <td className="px-5 py-3 text-sm text-zinc-600">{r.days}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Request leave">
        <div className="space-y-4">
          <ErrorBanner message={formError} />
          <Field label="Leave type">
            <Select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
              <option value="">Select type…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="End date">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Reason">
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Optional" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void submit()} loading={submitting}>Submit request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
