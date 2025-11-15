'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';

interface DashboardShellProps {
  children: React.ReactNode;
  gymName: string;
  userEmail: string;
}

export function DashboardShell({ children, gymName, userEmail }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] to-[#09090b]">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="lg:pl-[260px]">
        <Topbar
          gymName={gymName}
          userEmail={userEmail}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
