'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, Button, EmptyState, Badge } from '@businex/ui';

interface Row {
  product: { id: string; code: string; name: string; kind: string; createdAt: string };
  config: { isSellable: boolean; isStockable: boolean; isService: boolean } | null;
}

export default function ProductsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState('product');

  const load = async () => {
    try {
      const rows = await api<Row[]>('/products');
      setItems(rows);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/products', { method: 'POST', body: { code, name, kind } });
    setCode(''); setName(''); setShowForm(false); load();
  };

  return (
    <Shell>
      <PageHeader title="Products" subtitle="Universal catalog — used by sales, POS, inventory and procurement" action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ Add product'}</Button>} />
      {showForm ? (
        <form onSubmit={create} className="mb-6 flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Code</span><input value={code} onChange={(e) => setCode(e.target.value)} className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm" required /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm" required /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Kind</span><select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="product">Product</option><option value="service">Service</option></select></label>
          <Button type="submit">Create</Button>
        </form>
      ) : null}
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No products yet" description="Add your first product to the universal catalog." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Code</Th><Th>Name</Th><Th>Kind</Th><Th>Sellable</Th><Th>Stockable</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map(({ product: p, config }) => (
          <tr key={p.id} className="hover:bg-gray-50"><Td className="font-medium">{p.code}</Td><Td>{p.name}</Td><Td><Badge>{p.kind}</Badge></Td><Td>{config?.isSellable ? '✓' : '—'}</Td><Td>{config?.isStockable ? '✓' : '—'}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
