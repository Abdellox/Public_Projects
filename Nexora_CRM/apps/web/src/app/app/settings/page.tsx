'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  FormError,
  Input,
  Spinner,
} from '@nexora/ui';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import { useOrg } from '@/lib/org-context';

interface DepartmentRow {
  id: string;
  name: string;
  description: string | null;
}

export default function SettingsPage() {
  const { activeOrg } = useOrg();
  const isOwner = activeOrg.roleKey === 'owner';
  const canManage =
    activeOrg.roleKey === 'owner' || activeOrg.roleKey === 'admin';
  const base = `/v1/organizations/${activeOrg.organizationId}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <OrgNameForm base={base} canManage={canManage} />

      {canManage ? <DepartmentsCard base={base} /> : null}

      <Card>
        <CardHeader title="Danger zone" />
        <CardBody>
          {isOwner ? (
            <p className="text-sm text-neutral-500">
              Organization deletion will be available alongside data export in an
              upcoming milestone.
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              Only the organization owner can perform destructive actions.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function OrgNameForm({ base, canManage }: { base: string; canManage: boolean }) {
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<{ organization: { name: string } }>(base)
      .then((res) => setName(res.organization.name))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [base]);

  return (
    <Card>
      <CardHeader
        title="Organization"
        description={
          canManage ? 'Rename your workspace.' : 'Only admins can change these settings.'
        }
      />
      <CardBody>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSaved(false);
            setLoading(true);
            try {
              await apiPatch(base, { name });
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Update failed');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="min-w-0 flex-1">
            <Field label="Organization name">
              <Input
                disabled={!canManage || !loaded}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" variant="secondary" loading={loading} disabled={!canManage}>
            Save
          </Button>
        </form>
        {saved && !error ? (
          <p className="mt-2 text-xs text-emerald-700">Saved.</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function DepartmentsCard({ base }: { base: string }) {
  const [departments, setDepartments] = useState<DepartmentRow[] | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await apiGet<{ departments: DepartmentRow[] }>(`${base}/departments`);
      setDepartments(res.departments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    }
  }, [base]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <Card>
      <CardHeader
        title="Departments"
        description="Mirror your company structure. Teams live inside departments."
      />
      <CardBody>
        <FormError message={error} />
        <form
          className="flex items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setAdding(true);
            try {
              await apiPost(`${base}/departments`, { name: newName });
              setNewName('');
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create department');
            } finally {
              setAdding(false);
            }
          }}
        >
          <div className="min-w-0 flex-1">
            <Field label="New department">
              <Input
                required
                placeholder="e.g. Sales"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" loading={adding}>
            Add
          </Button>
        </form>

        <div className="mt-5">
          {departments === null ? (
            <Spinner className="h-5 w-5 text-neutral-400" />
          ) : departments.length === 0 ? (
            <EmptyState
              title="No departments yet"
              description="Create your first department above."
            />
          ) : (
            <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {departments.map((department) => (
                <li key={department.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
                    {department.name}
                  </span>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                    onClick={() =>
                      void apiDelete(`${base}/departments/${department.id}`).then(reload)
                    }
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
