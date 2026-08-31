import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSessionUser, getBaseUser } from "@supplyflow/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  const base = await getBaseUser(token);
  if (!base) redirect("/login");
  if (!base.hasOrganization) redirect("/onboarding");

  const user = await getSessionUser(token);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={user.organizationName} userName={user.name} role={user.role} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-ink-50">
        {children}
      </main>
    </div>
  );
}
