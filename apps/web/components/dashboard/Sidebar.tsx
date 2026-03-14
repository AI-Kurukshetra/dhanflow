'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Bot, CalendarClock, FileText, Goal, LayoutGrid, PieChart, Users, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/goals', label: 'Goals', icon: Goal },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: CalendarClock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-slate-950/65 p-5 backdrop-blur-xl lg:flex">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">Dhanflow</p>
        <h1 className="text-2xl font-semibold text-white">Wealth OS</h1>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                active
                  ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
