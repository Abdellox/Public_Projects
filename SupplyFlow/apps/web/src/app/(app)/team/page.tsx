"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Input, Select } from "@/components/ui";
import { api, fmtDate } from "@/lib/client/format";
import { ROLES } from "@supplyflow/types";

interface Member { userId: string; name: string; email: string; role: string; joinedAt: string; lastLoginAt: string | null }

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<{ data: Member[] }>("/api/v1/team");
    setMembers(res.data);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api<{ data: { temporaryPassword: string | null } }>("/api/v1/team", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          name: fd.get("name"),
          role: fd.get("role"),
          temporaryPassword: String(fd.get("password") || "")
        })
      });
      setTempPassword(res.data.temporaryPassword);
      setInviteOpen(false);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    }
  }

  async function changeRole(userId: string, role: string) {
    try {
      await api("/api/v1/team", { method: "PATCH", body: JSON.stringify({ userId, role }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    }
  }

  return (
    <div className="h-screen overflow-y-auto">
      <PageHeader
        title="Team"
        description="People with access to this organization."
        actions={<Button size="sm" onClick={() => { setTempPassword(null); setInviteOpen(true); }}><UserPlus className="h-3.5 w-3.5" /> Invite member</Button>}
      />
      {error ? <p className="mx-6 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      {tempPassword ? (
        <div className="mx-6 mb-4 max-w-xl text-[13px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
          Member added. Temporary password: <code className="font-mono font-semibold">{tempPassword}</code> — share it securely.
        </div>
      ) : null}

      <div className="mx-6 max-w-3xl rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100 bg-ink-50/50">
              <th className="px-4 py-2.5 font-medium">Member</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId} className="border-b border-ink-50 last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-800 text-[11px] font-semibold">{m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                    <span><span className="block font-medium text-ink-900">{m.name}</span><span className="block text-[11.5px] text-ink-400">{m.email}</span></span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    onChange={(e) => void changeRole(m.userId, e.target.value)}
                    disabled={m.role === "owner"}
                    className="h-8 w-32 rounded-md border border-ink-200 px-2 text-[12px] capitalize disabled:bg-ink-50 disabled:text-ink-400"
                  >
                    {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink-500">{fmtDate(m.joinedAt)}</td>
                <td className="px-4 py-3 text-ink-500">{m.lastLoginAt ? fmtDate(m.lastLoginAt, true) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-6 mt-4 max-w-3xl rounded-lg border border-ink-100 bg-white p-4 shadow-card">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-ink-500 mb-2">Role permissions</h2>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-[12px] text-ink-600">
          <li><strong>Owner / Admin</strong> — full control incl. team & settings</li>
          <li><strong>Manager</strong> — inventory, orders, shipments</li>
          <li><strong>Buyer</strong> — purchasing, suppliers, planning</li>
          <li><strong>Planner</strong> — planning and product data</li>
          <li><strong>Viewer</strong> — read-only across operations</li>
        </ul>
      </div>

      {inviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={() => setInviteOpen(false)} />
          <form onSubmit={invite} className="relative z-10 w-full max-w-sm space-y-3 rounded-xl border border-ink-200 bg-white p-5 shadow-xl">
            <h2 className="text-[15px] font-semibold">Invite a teammate</h2>
            <Input name="name" placeholder="Full name" required />
            <Input name="email" type="email" placeholder="work@email.com" required />
            <Select name="role" defaultValue="buyer">
              {["admin", "manager", "buyer", "planner", "viewer"].map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </Select>
            <Input name="password" type="text" placeholder="Temporary password (auto-generated if empty)" minLength={8} />
            <Button type="submit" className="w-full">Add member</Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
