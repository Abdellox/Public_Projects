'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, EmptyState, Badge } from '@businex/ui';

interface Unit { id: string; type: string; code: string; name: string }

export default function OrganizationPage() {
  const [items, setItems] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setItems(await api<Unit[]>('/org/units')); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <Shell>
      <PageHeader title="Organization" subtitle="Universal org hierarchy — legal entities, departments, warehouses, teams" />
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No org units yet" description="Seed the database or create organization units via the API." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Type</Th><Th>Code</Th><Th>Name</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((u) => (
          <tr key={u.id} className="hover:bg-gray-50"><Td><Badge tone="blue">{u.type}</Badge></Td><Td className="font-mono">{u.code}</Td><Td className="font-medium">{u.name}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
