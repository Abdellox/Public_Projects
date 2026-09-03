"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CheckSquare, FileText, GraduationCap, Megaphone, Plane } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Card, CardHeader, EmptyState, Spinner, StatusBadge, StatCard } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";

interface Dashboard {
  me: { employeeName: string | null; role: string };
  my: {
    leaveBalances: { id: string; remaining: number; leaveType: { name: string } }[];
    upcomingLeave: { id: string; startDate: string; endDate: string; days: number; status: string }[];
    openTasks: { id: string; title: string; dueDate: string | null; status: string; priority: string }[];
    trainingDue: number;
  };
  pendingApprovals: { leaveRequests: { id: string; employeeName: string; days: number; startDate: string; endDate: string }[] };
  announcements: { id: string; title: string; publishedAt: string }[];
  unreadNotifications: number;
}

export default function DashboardPage() {
  const { can, me } = useSession();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  if (error) return <EmptyState title="Could not load your dashboard" description={error} />;
  if (!data) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Hello{data.me.employeeName ? `, ${data.me.employeeName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Here&apos;s what&apos;s happening in {me?.organization.name} today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Open tasks"
          value={data.my.openTasks.length}
          sub={<Link href="/tasks" className="text-brand-600 hover:underline">View tasks →</Link>}
        />
        <StatCard label="Training due" value={data.my.trainingDue} sub="Assignments past or near due" />
        <StatCard label="Unread alerts" value={data.unreadNotifications} sub={<Link href="/notifications" className="text-brand-600 hover:underline">Open inbox →</Link>} />
        <StatCard
          label="Pending approvals"
          value={data.pendingApprovals.leaveRequests.length}
          sub={can("leave.approve") ? "Waiting on you" : "Team requests"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My leave balances" action={<Link href="/leave" className="text-xs font-medium text-brand-600 hover:underline">Request leave</Link>} />
          {data.my.leaveBalances.length === 0 ? (
            <EmptyState icon={<Plane className="h-8 w-8" />} title="No balances yet" description="Balances appear once your organization sets up leave types." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.my.leaveBalances.map((b) => (
                <li key={b.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium text-zinc-700">{b.leaveType.name}</span>
                  <span className="text-sm text-zinc-500">
                    <strong className="text-zinc-900">{b.remaining}</strong> days left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming time off" action={<Link href="/leave" className="text-xs font-medium text-brand-600 hover:underline">Calendar</Link>} />
          {data.my.upcomingLeave.length === 0 ? (
            <EmptyState icon={<CalendarDays className="h-8 w-8" />} title="No upcoming absences" />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.my.upcomingLeave.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-zinc-700">
                    {formatDate(l.startDate)} – {formatDate(l.endDate)}
                    <span className="ml-1.5 text-xs text-zinc-400">({l.days}d)</span>
                  </span>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="My tasks" action={<Link href="/tasks" className="text-xs font-medium text-brand-600 hover:underline">All tasks</Link>} />
          {data.my.openTasks.length === 0 ? (
            <EmptyState icon={<CheckSquare className="h-8 w-8" />} title="Nothing on your plate" description="Tasks assigned to you will show up here." />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.my.openTasks.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800">{t.title}</p>
                    <p className="text-xs text-zinc-400">{t.dueDate ? `Due ${formatDate(t.dueDate)}` : "No due date"}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Latest announcements" action={<Link href="/announcements" className="text-xs font-medium text-brand-600 hover:underline">See all</Link>} />
          {data.announcements.length === 0 ? (
            <EmptyState icon={<Megaphone className="h-8 w-8" />} title="No announcements yet" />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.announcements.slice(0, 4).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <Link href={`/announcements#${a.id}`} className="text-sm font-medium text-zinc-800 hover:text-brand-600">
                    {a.title}
                  </Link>
                  <p className="text-xs text-zinc-400">{formatDateTime(a.publishedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {can("leave.approve") && data.pendingApprovals.leaveRequests.length > 0 && (
        <Card>
          <CardHeader title="Leave requests awaiting approval" action={<Link href="/approvals" className="text-xs font-medium text-brand-600 hover:underline">Review all</Link>} />
          <ul className="divide-y divide-zinc-50">
            {data.pendingApprovals.leaveRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-zinc-700">
                  <strong>{r.employeeName}</strong> · {formatDate(r.startDate)} – {formatDate(r.endDate)} ({r.days}d)
                </span>
                <Badge tone="amber">Pending</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {can("document.viewAll") && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Documents" value={<FileText className="h-5 w-5 text-zinc-300" />} sub={<Link href="/documents" className="text-brand-600 hover:underline">Manage documents</Link>} />
          <StatCard label="Training" value={<GraduationCap className="h-5 w-5 text-zinc-300" />} sub={<Link href="/training" className="text-brand-600 hover:underline">Manage courses</Link>} />
          <StatCard label="People" value={<Link href="/directory" className="text-brand-600 hover:underline">Directory</Link>} sub="" />
        </div>
      )}
    </div>
  );
}
