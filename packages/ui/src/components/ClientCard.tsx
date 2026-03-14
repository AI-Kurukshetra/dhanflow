import * as React from 'react';
import { GlassCard } from './GlassCard';

type ClientCardProps = {
  name: string;
  riskProfile: 'Conservative' | 'Balanced' | 'Growth';
  aum: string;
};

export function ClientCard({ name, riskProfile, aum }: ClientCardProps) {
  return (
    <GlassCard className="flex items-center justify-between gap-4">
      <div>
        <p className="font-display text-lg text-df-primary">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-df-muted">{riskProfile}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-[0.16em] text-df-muted">AUM</p>
        <p className="df-data-text text-lg text-df-primary">{aum}</p>
      </div>
    </GlassCard>
  );
}
