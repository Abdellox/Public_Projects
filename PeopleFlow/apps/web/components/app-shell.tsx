"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Users, CalendarDays, CalendarCheck, Megaphone,
  FileText, CheckSquare, GitBranch, Target, GraduationCap,
  Settings, LogOut, Search as SearchIcon, Bell, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui";
import { useSession } from "@/components/session-provider";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/directory", label: "People", icon: Users },
  { href: "/leave", label: "Leave", icon: CalendarDays },
  { href: "/approvals", label: "Approvals", icon: CalendarCheck },
  { href: "/attendance", label: "Attendance", icon: ClockIcon },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

const EXTRA_NAV = [
  { href: "/recruitment", label: "Recruiting", permission: "recruitment.manage" },
  { href: "/performance", label: "Performance", permission: null },
  { href: "/training", label: "Training", permission: null },
  { href: "/admin", label: "Administration", permission: "*" },
];

function ClockIcon(props: { className?: string }) {
  return <CalendarCheck {...props} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading, can, logout } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifCount, setNotifCount] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!me) return;
    api<{ data: { id: string; readAt: string | null }[] }>("/notifications")
      .then((res) => {
        const unread = res.data.filter((n) => !n.readAt).length;
        setNotifCount(unread);
      })
      .catch(() => {});
  }, [me, pathname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) return;
    debounceRef.current = setTimeout(() => {
      router.push(`/directory?q=${encodeURIComponent(search.trim())}`);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!me) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const navItems = [
    ...NAV,
    ...EXTRA_NAV.filter((item) => !item.permission || can(item.permission)).map((i) => ({
      href: i.href,
      label: i.label,
      icon: Settings,
    })),
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold">PF</span>
            <span className="text-sm font-semibold tracking-tight">{me.organization.name}</span>
          </Link>
          <button className="ml-auto text-zinc-400 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-brand-400")} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 p-2">
          <Link
            href="/me"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname === "/me" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
            )}
          >
            <Settings className="h-4 w-4" />
            My profile
          </Link>
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onMouseDown={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur">
          <button className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative max-w-md flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {notifCount !== null && notifCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            <Link href="/me" className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-zinc-100">
              <Avatar name={me.user.name} url={me.user.avatarUrl ?? undefined} size="sm" />
              <span className="hidden text-sm font-medium text-zinc-700 sm:block">{me.user.name}</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
