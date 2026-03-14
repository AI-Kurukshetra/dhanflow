'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePortfolio } from '@/lib/hooks/usePortfolio';

export default function AnalyticsPage() {
  const { benchmarkHistory } = usePortfolio();

  return (
    <GlassCard className="h-[470px]">
      <h2 className="mb-4 text-xl font-semibold">Portfolio vs Benchmark</h2>
      <ResponsiveContainer width="100%" height="86%">
        <LineChart data={benchmarkHistory}>
          <CartesianGrid stroke="rgba(150,173,207,0.16)" strokeDasharray="4 4" />
          <XAxis dataKey="month" stroke="#9db2d1" />
          <YAxis stroke="#9db2d1" tickFormatter={(value) => `₹${value.toFixed(1)}Cr`} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(5,15,30,0.85)',
              color: '#ecf5ff',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="portfolio" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="benchmark" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
