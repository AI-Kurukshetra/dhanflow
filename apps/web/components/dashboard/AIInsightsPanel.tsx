'use client';

import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const insights = [
  {
    icon: TrendingUp,
    title: 'Momentum Signal',
    detail: 'Large-cap equity allocation can be increased by 3% based on rolling alpha strength.',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Rebalance',
    detail: 'Debt exposure in moderate-risk portfolios is 2.4% below strategic band.',
  },
  {
    icon: Sparkles,
    title: 'AI Suggestion',
    detail: 'Stagger deployment into international ETFs over next 3 weeks to reduce timing risk.',
  },
];

export function AIInsightsPanel() {
  return (
    <GlassCard className="space-y-4">
      <h3 className="font-semibold text-slate-100">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-1 flex items-center gap-2 text-cyan-100">
              <item.icon className="h-4 w-4" />
              <p className="text-sm font-medium">{item.title}</p>
            </div>
            <p className="text-sm text-slate-300">{item.detail}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
