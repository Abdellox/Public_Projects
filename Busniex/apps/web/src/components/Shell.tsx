'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { clearToken } from '../lib/api';

const navGroups = [
  {
    label: 'Commercial',
    items: [
      { href: '/parties', label: 'Parties', icon: '👥' },
      { href: '/products', label: 'Products', icon: '📦' },
      { href: '/orders', label: 'Sales Orders', icon: '🧾' },
    ],
  },
  {
    label: 'Finance',
    items: [{ href: '/invoices', label: 'Invoices', icon: '💳' }],
  },
  {
    label: 'Supply Chain',
    items: [{ href: '/inventory', label: 'Inventory', icon: '📦' }],
  },
  {
    label: 'Enterprise',
    items: [
      { href: '/organization', label: 'Organization', icon: '🏢' },
      { href: '/audit', label: 'Audit Log', icon: '📜' },
    ],
  },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const logout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`${
          open ? 'w-64' : 'w-16'
        } shrink-0 border-r border-gray-200 bg-white transition-all duration-200`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
          <Link href="/" className="font-bold tracking-tight text-indigo-600">
            {open ? 'BUSINEX' : 'BX'}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-sm text-gray-400 hover:text-gray-600"
            aria-label="Toggle sidebar"
          >
            {open ? '«' : '»'}
          </button>
        </div>
        <nav className="space-y-5 px-2 py-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {open ? (
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-1 flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {open ? item.label : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <span>↪</span>
            {open ? 'Sign out' : null}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
