"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Button, Card, CardHeader, EmptyState, ErrorBanner, Spinner, Table } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface TodayEntry {
  entry: {
    id: string;
    clockIn: string | null;
    clockOut: string | null;
    workedMinutes: number | null;
    note?: string | null;
  } | null;
}

interface EntryRow {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workedMinutes: number | null;
  note?: string | null;
}

export default function AttendancePage() {
  const { can } = useSession();
  const [today, setToday] = useState<TodayEntry | null>(null);
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  async function load() {
    try {
      const [t, r] = await Promise.all([
        api<TodayEntry>("/attendance/today"),
        api<{ data: EntryRow[] }>("/attendance?pageSize=15"),
      ]);
      setToday(t);
      setRows(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function clockIn() {
    setWorking("in");
    setError(null);
    try {
      await api("/attendance/clock-in", { method: "POST", body: {} });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clock in");
    } finally {
      setWorking(null);
    }
  }

  async function clockOut() {
    setWorking("out");
    setError(null);
    try {
      await api("/attendance/clock-out", { method: "POST", body: {} });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clock out");
    } finally {
      setWorking(null);
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load attendance" description={error} />;

  const entry = today?.entry;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Attendance</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Track your time and review your history.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-500">Today</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {entry?.clockIn ? (
                <>
                  Clocked in at {formatDateTime(entry.clockIn)}
                  {entry.clockOut && <span className="text-zinc-400"> · out at {formatDateTime(entry.clockOut)}</span>}
                </>
              ) : (
                "Not clocked in yet"
              )}
            </p>
            {entry?.workedMinutes != null && entry.clockOut && (
              <p className="mt-1 text-sm text-zinc-500">
                {Math.floor((entry.workedMinutes ?? 0) / 60)}h {(entry.workedMinutes ?? 0) % 60}m worked today
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {can("attendance.clock") &&
              (!entry?.clockIn || entry?.clockOut ? (
                <Button onClick={() => void clockIn()} loading={working === "in"}>Clock in</Button>
              ) : (
                <Button variant="secondary" onClick={() => void clockOut()} loading={working === "out"}>Clock out</Button>
              ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent history" />
        {rows.length === 0 ? (
          <EmptyState title="No attendance records yet" description="Clock in to start building your history." />
        ) : (
          <Table head={["Date", "Clock in", "Clock out", "Worked"]}>
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-zinc-50">
                <td className="px-5 py-3 text-sm text-zinc-700">{r.date.slice(0, 10)}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{r.clockIn ? formatDateTime(r.clockIn) : "—"}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{r.clockOut ? formatDateTime(r.clockOut) : "—"}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">
                  {r.workedMinutes != null ? `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m` : "—"}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <ErrorBanner message={error} />
    </div>
  );
}
