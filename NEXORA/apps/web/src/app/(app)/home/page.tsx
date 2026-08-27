"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { OrganizationOverview } from "@nexora/types";
import { useOrg } from "@/components/shell/org-context";
import { clientApi } from "@/lib/api";
import { Card, CardHeader, EmptyState, ErrorNote, StatCard } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BuildingIcon } from "@/components/icons";

export default function HomePage() {
  const { membership } = useOrg();
  const [overview, setOverview] = useState<OrganizationOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const slug = membership?.organization.slug;
    if (!slug) return;
    clientApi<OrganizationOverview>(`/organizations/slug/${slug}`)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load overview");
      });
    return () => {
      cancelled = true;
    };
  }, [membership]);

  if (!membership) {
    return (
      <EmptyState
        icon={<BuildingIcon width={28} height={28} />}
        title="You are not part of an organization yet"
        description="Create your own organization or accept an invitation to get started."
        action={
          <Link href="/onboarding">
            <Button>Set up your organization</Button>
          </Link>
        }
      />
    );
  }

  if (error) return <ErrorNote message={error} />;

  if (!overview) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
          {overview.organization.name}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Here is how your organization is doing today.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={overview.stats.members} />
        <StatCard label="Departments" value={overview.stats.departments} />
        <StatCard label="Teams" value={overview.stats.teams} />
        <StatCard
          label="Your role"
          value={<span className="capitalize">{overview.myMembership.roleKey}</span>}
          hint={`${overview.myMembership.permissions.length} permissions`}
        />
      </section>

      <Card>
        <CardHeader
          title="Departments"
          subtitle="The structure of your organization"
          action={
            <Link href="/departments" className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          }
        />
        {overview.departments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No departments yet"
              description="Create your first department to give the organization its shape."
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink-100 px-5">
            {overview.departments.slice(0, 6).map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm font-medium text-ink-900">{d.name}</span>
                <span className="ml-auto flex items-center gap-2">
                  <Badge>{d.memberCount} members</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Newest colleagues" subtitle="Welcome the latest members" />
        {overview.recentMembers.length === 0 ? (
          <div className="p-5 text-sm text-ink-500">Nobody else has joined yet.</div>
        ) : (
          <ul className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {overview.recentMembers.map((m) => (
              <li key={m.userId} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                <Avatar name={m.name} url={m.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-950">{m.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {m.jobTitleName ?? "—"}
                    {m.departmentName ? ` · ${m.departmentName}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
