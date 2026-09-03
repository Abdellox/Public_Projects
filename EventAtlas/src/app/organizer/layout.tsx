"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const role = (session.user as any)?.role;
  if (role !== "ORGANIZER" && role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardNav role={role} />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">{children}</main>
      </div>
    </div>
  );
}
