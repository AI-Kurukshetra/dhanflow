'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

const COLORS = ['#17c9ff', '#4ee0b8', '#8eb5ff', '#ffb770', '#ff7ea4'];

type Allocation = { name: string; value: number };

type AssetAllocationChartProps = {
  data: Allocation[];
};

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  return (
    <GlassCard className="h-[320px]">
      <h3 className="mb-4 font-semibold text-slate-100">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="78%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
            {data.map((_, index) => (
              <Cell key={`allocation-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(5,15,30,0.85)',
              color: '#ecf5ff',
            }}
            formatter={(value: number) => [`${value}%`, 'Allocation']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span>{item.name}</span>
            <span className="ml-auto font-mono">{item.value}%</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
