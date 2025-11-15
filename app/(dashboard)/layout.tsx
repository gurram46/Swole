import { redirect } from 'next/navigation';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardShell } from '@/components/dashboard/shell';
import { Toaster } from '@/components/ui/toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromRequest();

  if (!session) {
    redirect('/login');
  }

  const gym = await prisma.gym.findUnique({
    where: { id: session.gym_id },
  });

  if (!gym) {
    redirect('/login');
  }

  return (
    <DashboardShell gymName={gym.name} userEmail={session.email}>
      {children}
      <Toaster />
    </DashboardShell>
  );
}
