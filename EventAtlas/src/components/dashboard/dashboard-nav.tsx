"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  CalendarCheck,
  Bell,
  Settings,
  Building2,
  Calendar,
  PlusCircle,
  Shield,
  Users,
  CalendarDays,
  Tag,
  Globe,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

interface DashboardNavProps {
  role: string;
}

interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

const userLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { label: "Registrations", href: "/dashboard/registrations", icon: CalendarCheck },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const organizerLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard/organizer", icon: Building2 },
  { label: "My Events", href: "/dashboard/organizer/events", icon: Calendar },
  { label: "Create Event", href: "/dashboard/organizer/events/new", icon: PlusCircle },
];

const adminLinks: NavLink[] = [
  { label: "Admin Dashboard", href: "/dashboard/admin", icon: Shield },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Events", href: "/dashboard/admin/events", icon: CalendarDays },
  { label: "Categories", href: "/dashboard/admin/categories", icon: Tag },
  { label: "Countries", href: "/dashboard/admin/countries", icon: Globe },
  { label: "Reports", href: "/dashboard/admin/reports", icon: Flag },
];

function NavLinkItem({ link, isActive }: { link: NavLink; isActive: boolean }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {link.label}
    </Link>
  );
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();

  const hasOrganizer = role.includes("ORGANIZER");
  const hasAdmin = role.includes("ADMIN");

  return (
    <aside className="hidden h-full w-64 shrink-0 border-r bg-white md:block">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {getInitials("User Name")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                User Name
              </p>
              <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {role.split("_")[0]}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {userLinks.map((link) => (
            <NavLinkItem
              key={link.href}
              link={link}
              isActive={
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href)
              }
            />
          ))}

          {hasOrganizer && (
            <>
              <Separator className="my-3" />
              {organizerLinks.map((link) => (
                <NavLinkItem
                  key={link.href}
                  link={link}
                  isActive={pathname.startsWith(link.href)}
                />
              ))}
            </>
          )}

          {hasAdmin && (
            <>
              <Separator className="my-3" />
              {adminLinks.map((link) => (
                <NavLinkItem
                  key={link.href}
                  link={link}
                  isActive={pathname.startsWith(link.href)}
                />
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
