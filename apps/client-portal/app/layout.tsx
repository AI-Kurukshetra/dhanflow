import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dhanflow Portal',
  description: 'Dhanflow advisor/client portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
