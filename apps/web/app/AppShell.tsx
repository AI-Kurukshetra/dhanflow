'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

const authPages = new Set(['/login', '/register']);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (authPages.has(pathname)) {
    return <main className="mx-auto w-full max-w-7xl p-4 lg:p-8">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
