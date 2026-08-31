"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Building2,
  ShoppingCart,
  Ship,
  ClipboardList,
  TruckIcon,
  Target,
  BellRing,
  BarChart3,
  Users,
  Settings,
  ScrollText,
  ChevronDown,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/client/cn";
import type { Role } from "@supplyflow/types";

const NAV = [
  { section: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/alerts", label: "Alerts", icon: BellRing },
    { href: "/planning", label: "Planning", icon: Target }
  ]},
  { section: "Operations", items: [
    { href: "/products", label: "Products", icon: Package },
    { href: "/inventory", label: "Inventory", icon: Boxes },
    { href: "/warehouses", label: "Warehouses", icon: Building2 },
    { href: "/purchasing", label: "Purchase orders", icon: ShoppingCart },
    { href: "/inbound", label: "Inbound shipments", icon: Ship },
    { href: "/orders", label: "Customer orders", icon: ClipboardList },
    { href: "/outbound", label: "Outbound shipments", icon: TruckIcon }
  ]},
  { section: "Network", items: [
    { href: "/suppliers", label: "Suppliers", icon: Building2 },
    { href: "/customers", label: "Customers", icon: Users }
  ]},
  { section: "Workspace", items: [
    { href: "/team", label: "Team", icon: Users, permission: "members" as const },
    { href: "/audit", label: "Audit log", icon: ScrollText, permission: "audit" as const },
    { href: "/settings", label: "Settings", icon: Settings }
  ]}
];

export function Sidebar({ orgName, userName, role }: { orgName: string; userName: string; role: Role }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="flex h-14 items-center px-4 border-b border-ink-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-white font-bold text-[13px]">S</span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">SupplyFlow</span>
        </Link>
      </div>

      <div className="relative border-b border-ink-100 px-3 py-2.5">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-ink-50 sf-focus-ring">
          <span className="grid h-6 w-6 place-items-center rounded bg-brand-100 text-brand-800 text-[11px] font-semibold uppercase">{orgName.slice(0, 2)}</span>
          <span className="flex-1 truncate text-left text-[13px] font-medium text-ink-800">{orgName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
        {menuOpen ? (
          <div className="absolute left-3 right-3 top-full z-20 mt-1 rounded-lg border border-ink-200 bg-white shadow-lg py-1">
            <div className="px-3 py-2 border-b border-ink-100">
              <p className="truncate text-[13px] font-medium text-ink-800">{userName}</p>
              <p className="text-[11px] capitalize text-ink-500">{role}</p>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-ink-700 hover:bg-ink-50">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{group.section}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                        active ? "bg-brand-50 font-medium text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-ink-400")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="rounded-md bg-ink-50 px-3 py-2 text-[11px] leading-snug text-ink-500">
          <BarChart3 className="mb-1 h-3.5 w-3.5 text-brand-600" />
          SupplyFlow OSS · self-hosted edition
        </div>
      </div>
    </aside>
  );
}
