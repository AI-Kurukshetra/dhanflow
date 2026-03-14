import * as React from 'react';
import { GlassCard } from './GlassCard';

type PortfolioWidgetProps = {
  totalValue: string;
  dailyDelta: string;
  positive?: boolean;
};

export function PortfolioWidget({ totalValue, dailyDelta, positive = true }: PortfolioWidgetProps) {
  return (
    <GlassCard className="space-y-3">
      <p className="font-display text-xs uppercase tracking-[0.2em] text-df-muted">Total Portfolio</p>
      <p className="df-data-text text-3xl font-semibold text-df-primary">{totalValue}</p>
      <p className={positive ? 'df-data-text text-df-gain' : 'df-data-text text-df-loss'}>{dailyDelta}</p>
    </GlassCard>
  );
}
