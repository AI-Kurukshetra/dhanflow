'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, UserCircle2, LogOut } from 'lucide-react';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { logout } from '@/lib/auth';

const mobileLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/goals', label: 'Goals' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/ai-advisor', label: 'AI Advisor' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/documents', label: 'Documents' },
  { href: '/calendar', label: 'Calendar' },
];

export function Topbar() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/45 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
          <Search className="h-4 w-4" />
          Search clients, holdings, goals
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/20 bg-white/[0.06] p-2 text-slate-100">
            <Bell className="h-4 w-4" />
          </button>
          <LiquidButton>Generate Report</LiquidButton>
          <button className="hidden rounded-xl border border-white/20 bg-white/[0.06] p-2 text-slate-100 sm:block">
            <UserCircle2 className="h-5 w-5" />
          </button>
          <button onClick={handleLogout} className="rounded-xl border border-white/20 bg-white/[0.06] p-2 text-slate-100" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {mobileLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
