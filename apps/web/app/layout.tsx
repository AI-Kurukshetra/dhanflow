import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { AppShell } from '@/app/AppShell';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Dhanflow',
  description: 'Dhanflow wealth operations dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="fin-grid min-h-screen bg-[#060b14] text-slate-100">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
