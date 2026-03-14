'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

type PortfolioChartProps = {
  data: Array<{ month: string; value: number }>;
  title?: string;
};

export function PortfolioChart({ data, title = 'Portfolio Growth' }: PortfolioChartProps) {
  return (
    <GlassCard className="h-[320px]">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="font-semibold text-slate-100">{title}</h3>
        <p className="font-mono text-xs text-cyan-200">Last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height="86%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16c9ff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#16c9ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#9db2d1" tickLine={false} axisLine={false} />
          <YAxis stroke="#9db2d1" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(1)}Cr`} />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(5,15,30,0.85)',
              color: '#ecf5ff',
            }}
            formatter={(value: number) => [`₹${value.toFixed(2)} Cr`, 'Value']}
          />
          <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2.5} fill="url(#portfolioGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
