import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

type AllocationItem = { label: string; value: number; color: string };

type AssetAllocationChartProps = { items: AllocationItem[] };

export function AssetAllocationChart({ items }: AssetAllocationChartProps) {
  return (
    <GlassCard className="space-y-4">
      <h3 className="font-display text-sm uppercase tracking-[0.15em] text-df-muted">Asset Allocation</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-df-muted">
              <span>{item.label}</span>
              <span className="df-data-text">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
