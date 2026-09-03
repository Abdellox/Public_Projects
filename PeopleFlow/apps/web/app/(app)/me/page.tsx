"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Avatar, Badge, Card, CardHeader, EmptyState, Spinner, StatusBadge, Table } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Profile {
  employee: {
    id: string | null;
    name: string;
    email: string;
    title: string | null;
    department: string | null;
    team: string | null;
    location: string | null;
    employmentType: string | null;
    employmentStatus: string | null;
    startDate: string | null;
    photoUrl: string | null;
    managerName: string | null;
    managerId: string | null;
  } | null;
  leaveBalances: { id: string; year: number; remaining: number; used: number; leaveType: { name: string } }[];
  upcomingLeave: { id: string; startDate: string; endDate: string; days: number; status: string }[];
  certifications: { id: string; courseTitle: string; title: string; validTo: string | null }[];
}

export default function MePage() {
  const { me, can } = useSession();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Profile>("/employees/me")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load your profile" description={error} />;
  if (!data) return null;

  const e = data.employee;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={e?.name ?? me?.user.name} url={e?.photoUrl ?? me?.user.avatarUrl ?? undefined} size="lg" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{e?.name ?? me?.user.name}</h1>
            <p className="text-sm text-zinc-500">
              {e?.title ?? "No role"} {e?.department ? `· ${e.department}` : ""} {e?.location ? ` · ${e.location}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="gray">{e?.employmentType?.replace(/_/g, " ") ?? "—"}</Badge>
              {e?.employmentStatus && <StatusBadge status={e.employmentStatus} />}
              <Badge tone="violet">{me?.role.name}</Badge>
            </div>
            {e?.managerId && (
              <a href={`/directory/${e.managerId}`} className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline">
                Reports to {e.managerName}
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Leave balances" />
          {data.leaveBalances.length === 0 ? (
            <EmptyState title="No balances yet" />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.leaveBalances.map((b) => (
                <li key={b.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-zinc-700">{b.leaveType.name} · {b.year}</span>
                  <span className="text-sm text-zinc-500"><strong className="text-zinc-900">{b.remaining}</strong> remaining</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming time off" />
          {data.upcomingLeave.length === 0 ? (
            <EmptyState title="No upcoming absences" />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.upcomingLeave.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-zinc-700">{formatDate(l.startDate)} – {formatDate(l.endDate)} <span className="text-zinc-400">({l.days}d)</span></span>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Certifications" />
        {data.certifications.length === 0 ? (
          <EmptyState title="No certifications yet" description="Complete training courses to earn certifications." />
        ) : (
          <Table head={["Certification", "Course", "Valid until"]}>
            {data.certifications.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 text-sm font-medium text-zinc-800">{c.title}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{c.courseTitle}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{c.validTo ? formatDate(c.validTo) : "No expiry"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
