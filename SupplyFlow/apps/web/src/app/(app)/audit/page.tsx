"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { api, fmtDate } from "@/lib/client/format";

interface AuditRow {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  userName: string | null;
  createdAt: string;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api<{ data: AuditRow[] }>("/api/v1/org?view=audit&limit=300");
        setRows(res.data);
      } catch (err) {
        if (err instanceof Error && err.message.includes("permission")) setForbidden(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="h-screen overflow-y-auto">
      <PageHeader title="Audit log" description="Who did what, and when — auth events, data changes, imports and exports." />
      <div className="mx-6 pb-8 rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
        {forbidden ? (
          <p className="px-4 py-10 text-center text-[13px] text-ink-500">Your role does not include permission to view the audit log.</p>
        ) : loading ? (
          <p className="px-4 py-10 text-center text-[13px] text-ink-400">Loading…</p>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100 bg-ink-50/50">
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Entity</th>
                <th className="px-4 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                  <td className="px-4 py-2 whitespace-nowrap text-ink-500">{fmtDate(r.createdAt, true)}</td>
                  <td className="px-4 py-2 font-medium text-ink-800">{r.userName ?? "system"}</td>
                  <td className="px-4 py-2"><code className="rounded bg-ink-50 px-1.5 py-0.5 text-[11px] text-ink-700">{r.action}</code></td>
                  <td className="px-4 py-2 capitalize text-ink-600">{r.entityType?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-2 text-ink-400 truncate max-w-[280px]">{Object.keys(r.metadata ?? {}).length > 0 ? JSON.stringify(r.metadata) : "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && !loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-400">No audit events yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
