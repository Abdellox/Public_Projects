import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-api';
import { AppShell } from '@/components/app-shell';

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const me = await getServerSession();
  if (!me) redirect('/login');
  if (me.memberships.length === 0) redirect('/onboarding');

  return <AppShell me={me}>{children}</AppShell>;
}
