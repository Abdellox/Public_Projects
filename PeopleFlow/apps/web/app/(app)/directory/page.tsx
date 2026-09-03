"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Avatar, Badge, Card, EmptyState, Input, Select, Spinner, Table } from "@/components/ui";

interface Employee {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  title: string | null;
  departmentName: string | null;
  employmentType: string;
  status: string;
}

export default function DirectoryPage() {
  return (
    <Suspense>
      <DirectoryInner />
    </Suspense>
  );
}

function DirectoryInner() {
  const searchParams = useSearchParams();
  const { can } = useSession();
  const [data, setData] = useState<Employee[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");

  const urlQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    api<{ data: Employee[] }>("/employees")
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load directory"));
  }, []);

  const departments = useMemo(() => {
    if (!data) return [] as string[];
    return [...new Set(data.map((e) => e.departmentName).filter((d): d is string => !!d))].sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.filter((e) => {
      const matchesQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.title ?? "").toLowerCase().includes(q) ||
        (e.departmentName ?? "").toLowerCase().includes(q);
      const matchesDept = department === "all" || e.departmentName === department;
      return matchesQ && matchesDept;
    });
  }, [data, query, department]);

  if (error) return <EmptyState title="Could not load the directory" description={error} />;
  if (!data) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">People</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{data.length} employees in your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56"
          />
          <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-44">
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No people found" description="Try adjusting your search or filters." />
        ) : (
          <Table head={["", "Name", "Title", "Department", "Type", "Status"]}>
            {filtered.map((e) => (
              <tr key={e.id} className="transition hover:bg-zinc-50">
                <td className="px-5 py-3">
                  <Avatar name={e.name} url={e.photoUrl} size="sm" />
                </td>
                <td className="px-5 py-3">
                  <a href={`/directory/${e.id}`} className="font-medium text-zinc-800 hover:text-brand-600">
                    {e.name}
                  </a>
                  <p className="text-xs text-zinc-400">{e.email}</p>
                </td>
                <td className="px-5 py-3 text-sm text-zinc-600">{e.title ?? "—"}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{e.departmentName ?? "—"}</td>
                <td className="px-5 py-3">
                  <Badge tone="gray">{e.employmentType.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-5 py-3">
                  {can("employee.viewAll") ? <Badge tone="green">{e.status}</Badge> : "—"}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
