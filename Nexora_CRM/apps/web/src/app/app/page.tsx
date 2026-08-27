'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from '@nexora/ui';
import { apiGet } from '@/lib/api';
import { useOrg } from '@/lib/org-context';

interface OrganizationDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  counts: { members: number; departments: number; teams: number };
}

export default function DashboardPage() {
  const { activeOrg, me } = useOrg();
  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<OrganizationDetail>(
      `/v1/organizations/${activeOrg.organizationId}`,
    )
      .then(setOrg)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [activeOrg.organizationId]);

  const isOwnerOrAdmin =
    activeOrg.roleKey === 'owner' || activeOrg.roleKey === 'admin';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, {me.user.name.split(' ')[0]}.
          </p>
        </div>
        <Badge tone="brand">{activeOrg.roleName}</Badge>
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!org && !error ? (
        <div className="mt-10 flex justify-center">
          <Spinner className="h-8 w-8 text-brand-500" />
        </div>
      ) : null}

      {org ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Members" value={org.counts.members} href="/app/team" />
            <StatCard label="Departments" value={org.counts.departments} href="/app/settings" />
            <StatCard label="Teams" value={org.counts.teams} href="/app/settings" />
          </div>

          <Card className="mt-6">
            <CardHeader
              title="Getting started"
              description="Set up your workspace — CRM modules arrive in the next milestone."
            />
            <CardBody className="space-y-3">
              <ChecklistItem
                done={org.counts.members >= 2}
                label="Invite your teammates"
                hint="Nexora is better together."
                action={
                  isOwnerOrAdmin ? (
                    <Link href="/app/team">
                      <Button variant="secondary" className="h-8 px-3 text-xs">
                        Invite people
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
              <ChecklistItem
                done={org.counts.departments > 0}
                label="Create departments"
                hint="Mirror your real company structure."
                action={
                  isOwnerOrAdmin ? (
                    <Link href="/app/settings">
                      <Button variant="secondary" className="h-8 px-3 text-xs">
                        Add department
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
              <ChecklistItem
                done={false}
                label="Add customers, leads and deals"
                hint="Contacts, pipelines and the timeline ship in milestone 2."
              />
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader title="Workspace" description={`nexora.app/${org.slug}`} />
            <CardBody>
              <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between sm:block">
                  <dt className="text-neutral-500">Created</dt>
                  <dd className="font-medium">{new Date(org.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-neutral-500">Your role</dt>
                  <dd className="font-medium">{activeOrg.roleName}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

function ChecklistItem({
  done,
  label,
  hint,
  action,
}: {
  done: boolean;
  label: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-800">
          {done ? '✓ ' : ''}{label}
        </p>
        {hint ? <p className="truncate text-xs text-neutral-500">{hint}</p> : null}
      </div>
      {!done && action}
    </div>
  );
}
