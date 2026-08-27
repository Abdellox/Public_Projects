"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MeResponse, OrganizationOverview } from "@nexora/types";
import {
  BookIcon,
  BuildingIcon,
  ChatIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  PeopleIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon,
  XIcon
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { clientApi } from "@/lib/api";
import { OrgProvider } from "./org-context";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { width?: number; height?: number }) => React.ReactNode;
}

const SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Global",
    items: [{ href: "/home", label: "Home", icon: HomeIcon }]
  },
  {
    label: "My organization",
    items: [
      { href: "/departments", label: "Departments", icon: BuildingIcon },
      { href: "/people", label: "People", icon: PeopleIcon }
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/home#knowledge", label: "Knowledge · soon", icon: BookIcon },
      { href: "/home#chat", label: "Chat · soon", icon: ChatIcon }
    ]
  },
  {
    label: "AI",
    items: [{ href: "/home#ai", label: "Assistant · soon", icon: SparkIcon }]
  },
  {
    label: "Profile",
    items: [
      { href: "/settings", label: "Settings", icon: SettingsIcon },
      { href: "/onboarding", label: "My placement", icon: PeopleIcon }
    ]
  }
];

function SidebarContent({ me }: { me: MeResponse }) {
  const pathname = usePathname();
  const router = useRouter();
  const org = me.memberships[0]?.organization;

  async function logout() {
    await clientApi("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-ink-950 text-ink-300">
      <div className="flex h-14 items-center gap-2 px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
          N
        </span>
        <span className="text-sm font-semibold tracking-tight text-white">NEXORA</span>
      </div>

      <div className="mx-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-ink-500">Organization</p>
        <p className="truncate text-[13px] font-medium text-white">
          {org?.name ?? "No organization yet"}
        </p>
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === pathname ||
                  (!item.href.includes("#") &&
                    item.href !== "/home" &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                        active
                          ? "bg-brand-600/20 font-medium text-white"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon width={17} height={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={me.user.name} url={me.user.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{me.user.name}</p>
            <p className="truncate text-[11px] text-ink-500">{me.user.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  me,
  children
}: {
  me: MeResponse;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const membership = me.memberships.find((m) => m.status === "active") ?? null;

  return (
    <OrgProvider value={{ me, membership }}>
      <div className="min-h-dvh">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
          <SidebarContent me={me} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink-950/50"
            />
            <div className="absolute inset-y-0 left-0 w-72">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="absolute -right-9 top-3 rounded-lg bg-white/10 p-1.5 text-white"
              >
                <XIcon width={18} height={18} />
              </button>
              <SidebarContent me={me} />
            </div>
          </div>
        ) : null}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-200/70 bg-white/85 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 lg:hidden"
                aria-label="Open navigation"
              >
                <MenuIcon width={20} height={20} />
              </button>
              <div className="hidden items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-1.5 text-[13px] text-ink-400 sm:flex">
                <SearchIcon width={15} height={15} />
                Universal search — coming in Phase 2
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              {membership ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-700">
                  {membership.roleKey}
                </span>
              ) : (
                <Link
                  href="/onboarding"
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  Finish setup →
                </Link>
              )}
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </OrgProvider>
  );
}

export type { OrganizationOverview };
