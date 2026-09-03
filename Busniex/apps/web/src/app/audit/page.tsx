'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, EmptyState, Badge } from '@businex/ui';

interface Log { id: string; action: string; entityType: string; entityId: string; at: string; actorUserId?: string }

export default function AuditPage() {
  const [items, setItems] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setItems(await api<Log[]>('/audit')); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <Shell>
      <PageHeader title="Audit Log" subtitle="Immutable record of who changed what, when" />
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No audit entries yet" description="Activity will appear here automatically." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Action</Th><Th>Entity</Th><Th>Entity ID</Th><Th>Actor</Th><Th>When</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((l) => (
          <tr key={l.id} className="hover:bg-gray-50"><Td><Badge>{l.action}</Badge></Td><Td>{l.entityType}</Td><Td className="font-mono text-xs">{l.entityId.slice(0, 8)}…</Td><Td>{l.actorUserId?.slice(0, 8) ?? '—'}</Td><Td>{new Date(l.at).toLocaleString()}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
