'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Card, CardHeader, EmptyState } from '@businex/ui';

interface Stat {
  label: string;
  path: string;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const stats: Stat[] = [
    { label: 'Customers & parties', path: '/parties' },
    { label: 'Products', path: '/products' },
    { label: 'Invoices', path: '/invoices' },
    { label: 'Sales orders', path: '/orders' },
    { label: 'Inventory items', path: '/inventory' },
  ];

  useEffect(() => {
    Promise.allSettled(
      stats.map(async (s) => {
        try {
          const rows = (await api<unknown[]>(s.path)) as unknown[];
          return [s.label, rows.length] as const;
        } catch {
          return [s.label, 0] as const;
        }
      }),
    ).then((results) => {
      const next: Record<string, number> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') next[r.value[0]] = r.value[1];
      });
      setCounts(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell>
      <PageHeader title="Dashboard" subtitle="Your BUSINEX overview" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader title={s.label} subtitle={`${counts[s.label] ?? '…'} records`} />
            <div className="px-5 py-4">
              <button
                onClick={() => window.location.assign(s.path)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Open {s.label.toLowerCase()} →
              </button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader title="Architecture" subtitle="One platform, one organization model, many capabilities" />
          <div className="px-5 py-4 text-sm text-gray-600">
            BUSINEX is a modular monolith: one shared data model, a universal
            organization hierarchy, a reusable workflow engine, centralized
            identity &amp; authorization, and an immutable audit trail — with
            CRM, Invoicing, Inventory and POS built on the same foundation.
          </div>
        </Card>
      </div>
    </Shell>
  );
}
