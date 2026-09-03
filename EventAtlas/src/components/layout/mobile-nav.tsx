"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, X, Map, LayoutGrid, LayoutDashboard, Heart, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

const navLinks = [
  { href: "/events", label: "Explore", icon: LayoutGrid },
  { href: "/map", label: "Map", icon: Map },
  { href: "/categories", label: "Categories", icon: LayoutDashboard },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
}

export function MobileNav({ open, onClose, session }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Globe className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-bold text-slate-900">EventAtlas</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-purple-50 text-purple-700"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {session && (
            <>
              <div className="my-4 border-t" />
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/favorites"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        <div className="border-t p-4">
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                    {session.user?.name?.[0] ?? "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {session.user?.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={onClose}>
                <Button className="w-full">
                  <UserPlus className="h-4 w-4" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
