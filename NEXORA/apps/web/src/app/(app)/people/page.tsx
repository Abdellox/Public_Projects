"use client";

import { useEffect, useMemo, useState } from "react";
import type { MemberListItem } from "@nexora/types";
import { useOrg } from "@/components/shell/org-context";
import { clientApi, ApiError } from "@/lib/api";
import { Card, EmptyState, ErrorNote } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PeopleIcon, SearchIcon } from "@/components/icons";

export default function PeoplePage() {
  const { membership } = useOrg();
  const orgId = membership?.organization.id;

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [members, setMembers] = useState<MemberListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    clientApi<{ items: MemberListItem[] }>(
      `/organizations/${orgId}/members?q=${encodeURIComponent(debouncedQ)}&limit=50`
    )
      .then((page) => {
        if (!cancelled) {
          setMembers(page.items);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load people");
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, debouncedQ]);

  const grouped = useMemo(() => members ?? [], [members]);

  if (!orgId) return <EmptyState title="Join an organization first" />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">People</h1>
        <p className="mt-1 text-sm text-ink-500">
          Discover colleagues by name, team or expertise.
        </p>
      </header>

      <div className="relative max-w-md">
        <SearchIcon
          width={16}
          height={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email…"
          aria-label="Search people"
          className="pl-9"
        />
      </div>

      <ErrorNote message={error ?? ""} />

      {!members ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon width={28} height={28} />}
          title={debouncedQ ? "No matches" : "Nobody here yet"}
          description={
            debouncedQ
              ? "Try a different name or clear the search."
              : "Invite colleagues to bring your organization to life."
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((m) => (
            <li key={m.membershipId}>
              <Card className="h-full p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} url={m.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">{m.name}</p>
                    <p className="truncate text-[13px] text-ink-500">{m.jobTitleName ?? "—"}</p>
                  </div>
                  <span className="ml-auto">
                    <Badge tone={m.roleKey === "owner" ? "brand" : m.status === "active" ? "success" : "warning"}>
                      {m.roleKey === "guest" ? m.roleName : m.roleKey}
                    </Badge>
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                  {m.departmentName ? <Badge>{m.departmentName}</Badge> : null}
                  {m.teamName ? <Badge>{m.teamName}</Badge> : null}
                </div>
                {m.skills.length > 0 ? (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-500">
                    <span className="font-medium text-ink-600">Skills:</span> {m.skills.join(", ")}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
