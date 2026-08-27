'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Avatar,
  Logo,
  SettingsIcon,
  UsersIcon,
  LogoutIcon,
  cn,
} from '@nexora/ui';
import type { MeResponse } from '@nexora/types';
import { apiPost } from '@/lib/api';
import { OrgProvider, useOrg } from '@/lib/org-context';

const navigation = [
  { href: '/app', label: 'Dashboard', icon: null },
  { href: '/app/team', label: 'Team', icon: UsersIcon },
  { href: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export function AppShell({ me, children }: { me: MeResponse; children: React.ReactNode }) {
  const activeOrgId =
    me.memberships.find((m) => m.status === 'active')?.organizationId ??
    me.memberships[0]?.organizationId;

  if (!activeOrgId) return children;

  return (
    <ShellInner me={me} initialOrgId={activeOrgId}>
      {children}
    </ShellInner>
  );
}

function ShellInner({
  me,
  initialOrgId,
  children,
}: {
  me: MeResponse;
  initialOrgId: string;
  children: React.ReactNode;
}) {
  const [activeOrgId, setActiveOrgId] = useState(initialOrgId);
  const activeOrg =
    me.memberships.find((m) => m.organizationId === activeOrgId) ?? me.memberships[0]!;

  return (
    <OrgProvider
      value={{
        me,
        activeOrg,
        setActiveOrg: (id) => {
          setActiveOrgId(id);
          window.location.reload();
        },
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Topbar />
          <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:pt-8">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/app">
          <Logo />
        </Link>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const active =
            item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )}
            >
              {Icon ? <Icon className="h-[18px] w-[18px]" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="border-t border-neutral-100 px-6 py-4 text-xs text-neutral-400">
        Nexora CRM · Milestone 1
      </p>
    </aside>
  );
}

function Topbar() {
  const router = useRouter();
  const { me, activeOrg, setActiveOrg } = useOrg();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiPost('/v1/auth/logout');
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:left-64">
      <div className="lg:hidden">
        <Logo label={false} />
      </div>
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-neutral-400">Workspace</span>
        <select
          aria-label="Active organization"
          value={activeOrg?.organizationId ?? ''}
          onChange={(e) => setActiveOrg(e.target.value)}
          className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-sm font-medium"
        >
          {me.memberships.map((m) => (
            <option key={m.organizationId} value={m.organizationId}>
              {m.organizationName}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm font-medium text-neutral-700 sm:block">
          {me.user.name}
        </span>
        <Avatar name={me.user.name} />
        <button
          onClick={signOut}
          disabled={signingOut}
          title="Sign out"
          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogoutIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
