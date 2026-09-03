"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase, LogOut, LayoutDashboard } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;

  const dashboardHref = user?.role === "CANDIDATE" ? "/candidate" : user?.role === "COMPANY" ? "/company" : "/admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Briefcase className="h-6 w-6" />
          HireFlow
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Jobs</Link>
          {user && (
            <Link href={dashboardHref} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
              <Button size="sm" asChild><Link href="/register">Sign Up</Link></Button>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t p-4 space-y-3">
          <Link href="/jobs" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Jobs</Link>
          {user && <Link href={dashboardHref} className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
          {user ? (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { signOut(); setMobileOpen(false); }}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1"><Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link></Button>
              <Button size="sm" asChild className="flex-1"><Link href="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
