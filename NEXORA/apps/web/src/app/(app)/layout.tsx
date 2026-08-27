import { redirect } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import type { MeResponse } from "@nexora/types";
import { AppShell } from "@/components/shell/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let me: MeResponse;
  try {
    me = await serverApi<MeResponse>("/auth/me");
  } catch {
    redirect("/login");
  }

  return <AppShell me={me}>{children}</AppShell>;
}
