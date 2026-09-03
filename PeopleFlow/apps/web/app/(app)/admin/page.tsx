"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Select, Spinner, Table, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Tab = "settings" | "roles" | "members";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  isSystem?: boolean;
  _count?: { memberships: number };
}

interface Member {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleId: string;
  lastSeenAt?: string | null;
}

export default function AdminPage() {
  const { me, can } = useSession();
  const [tab, setTab] = useState<Tab>("settings");
  const [org, setOrg] = useState<{ name: string; slug: string } | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("");
  const [roleForm, setRoleForm] = useState<{ name: string; permissions: string[] }>({ name: "", permissions: [] });
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", roleId: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, membersRes] = await Promise.all([
        api<{ data: (Role & { permissionCount: number })[]; catalog: string[] }>("/roles"),
        api<{ data: Member[] }>("/members"),
      ]);
      setRoles(rolesRes.data as unknown as Role[]);
      setCatalog(rolesRes.catalog);
      setMembers(membersRes.data);
      setOrg({ name: me?.organization.name ?? "", slug: me?.organization.slug ?? "" });
      setOrgName(me?.organization.name ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [me]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveOrg() {
    await api("/organization", { method: "PATCH", body: { name: orgName } });
    await load();
  }

  async function createRole() {
    setError(null);
    if (!roleForm.name) {
      setError("Role name is required");
      return;
    }
    try {
      await api("/roles", { method: "POST", body: { name: roleForm.name, permissions: roleForm.permissions } });
      setRoleForm({ name: "", permissions: [] });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create role");
    }
  }

  async function invite() {
    setError(null);
    try {
      await api("/members/invite", { method: "POST", body: inviteForm });
      setInviteForm({ name: "", email: "", roleId: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invite member");
    }
  }

  async function setRole(userId: string, roleId: string) {
    try {
      await api(`/members/${userId}`, { method: "PATCH", body: { roleId } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await api(`/members/${userId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove member");
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load administration" description={error} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: "settings", label: "Settings" },
    { id: "roles", label: "Roles" },
    { id: "members", label: "Members" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Administration</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Workspace settings, roles and members.</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      {tab === "settings" && (
        <Card>
          <CardHeader title="Organization settings" />
          <div className="space-y-4 p-5">
            <Field label="Organization name" hint={`Slug: ${org?.slug ?? ""}`}>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="max-w-sm" />
            </Field>
            <Button onClick={() => void saveOrg()}>Save</Button>
          </div>
        </Card>
      )}

      {tab === "roles" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Create role" />
            <div className="space-y-4 p-5">
              <Field label="Role name">
                <Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className="max-w-sm" placeholder="Operations lead" />
              </Field>
              <Field label="Permissions" hint={`${roleForm.permissions.length} selected`}>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-3">
                  {catalog.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-xs text-zinc-600">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(p)}
                        onChange={(e) =>
                          setRoleForm({
                            ...roleForm,
                            permissions: e.target.checked ? [...roleForm.permissions, p] : roleForm.permissions.filter((x) => x !== p),
                          })
                        }
                        className="rounded border-zinc-300"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </Field>
              <Button onClick={() => void createRole()}>Create role</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Roles" />
            <Table head={["Role", "Permissions", "Members"]}>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium text-zinc-800">{r.name}</td>
                  <td className="px-5 py-3"><Badge tone="blue">{r.permissions.length} perms</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-600">{r._count?.memberships ?? 0}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Invite member" />
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-4">
              <Field label="Name">
                <Input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
              </Field>
              <Field label="Role">
                <Select value={inviteForm.roleId} onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })}>
                  <option value="">Select role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button onClick={() => void invite()} className="w-full">Invite</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Members" />
            {members.length === 0 ? (
              <EmptyState title="No members yet" />
            ) : (
              <Table head={["", "Name", "Email", "Role", "Last active", ""]}>
                {members.map((m) => (
                  <tr key={m.id} className="transition hover:bg-zinc-50">
                    <td className="px-5 py-3"><Avatar name={m.name} size="sm" /></td>
                    <td className="px-5 py-3 font-medium text-zinc-800">{m.name}</td>
                    <td className="px-5 py-3 text-sm text-zinc-600">{m.email}</td>
                    <td className="px-5 py-3">
                      <Select
                        value={m.roleId}
                        onChange={(e) => void setRole(m.id, e.target.value)}
                        className="border-0 bg-transparent px-0 text-sm font-medium"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-500">{m.lastSeenAt ? formatDate(m.lastSeenAt) : "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => void removeMember(m.id)} className="text-xs font-medium text-red-600 hover:underline">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

