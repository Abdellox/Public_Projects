"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Avatar, Badge, Card, CardHeader, EmptyState, Spinner, StatusBadge, Table } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface EmployeeDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  title: string | null;
  department: string | null;
  team: string | null;
  location: string | null;
  managerName: string | null;
  managerId: string | null;
  employmentType: string;
  employmentStatus: string;
  startDate: string | null;
  phone: string | null;
  private: {
    salaryList?: { id: string; amountMinor: number; currency: string; effectiveDate: string; annualBase: boolean }[];
  };
  permissions: { canViewSalary: boolean };
  upcomingLeave: { id: string; startDate: string; endDate: string; days: number; status: string }[];
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const { can } = useSession();
  const [emp, setEmp] = useState<EmployeeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<EmployeeDetail>(`/employees/${params.id}`)
      .then(setEmp)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load employee"));
  }, [params.id]);

  if (error) return <EmptyState title="Could not load this profile" description={error} />;
  if (!emp) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={emp.name} url={emp.photoUrl} size="lg" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{emp.name}</h1>
            <p className="text-sm text-zinc-500">
              {emp.title ?? "No role"} {emp.department ? `· ${emp.department}` : ""}
              {emp.location ? ` · ${emp.location}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="gray">{emp.employmentType.replace(/_/g, " ")}</Badge>
              <StatusBadge status={emp.employmentStatus} />
              {emp.managerId && (
                <a href={`/directory/${emp.managerId}`} className="text-xs font-medium text-brand-600 hover:underline">
                  Reports to {emp.managerName}
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Details" />
            <dl className="divide-y divide-zinc-50">
              <Row label="Email" value={emp.email} />
              <Row label="Phone" value={emp.phone} />
              <Row label="Department" value={emp.department} />
              <Row label="Team" value={emp.team} />
              <Row label="Location" value={emp.location} />
              <Row label="Start date" value={emp.startDate ? formatDate(emp.startDate) : "—"} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Upcoming leave" />
            {emp.upcomingLeave.length === 0 ? (
              <EmptyState title="No upcoming leave" />
            ) : (
              <ul className="divide-y divide-zinc-50">
                {emp.upcomingLeave.map((l) => (
                  <li key={l.id} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-zinc-700">
                      {formatDate(l.startDate)} – {formatDate(l.endDate)} <span className="text-zinc-400">({l.days}d)</span>
                    </span>
                    <StatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {can("salary.view") && emp.permissions.canViewSalary && (
          <Card>
            <CardHeader title="Salary history" />
            {!emp.private.salaryList || emp.private.salaryList.length === 0 ? (
              <EmptyState title="No salary records" />
            ) : (
              <ul className="divide-y divide-zinc-50">
                {emp.private.salaryList.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-zinc-700">
                      {(s.amountMinor / 100).toLocaleString(undefined, { style: "currency", currency: s.currency })}
                      {s.annualBase ? "/yr" : ""}
                    </span>
                    <span className="text-xs text-zinc-400">{formatDate(s.effectiveDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm font-medium text-zinc-800">{value ?? "—"}</dd>
    </div>
  );
}
