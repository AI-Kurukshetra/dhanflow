import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

type AIInsightPanelProps = {
  title: string;
  insight: string;
  confidence: number;
};

export function AIInsightPanel({ title, insight, confidence }: AIInsightPanelProps) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm uppercase tracking-[0.14em] text-cyan-200">{title}</p>
        <span className="df-data-text text-xs text-df-muted">{confidence}% confidence</span>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-sm leading-relaxed text-df-primary"
      >
        {insight}
      </motion.p>
    </GlassCard>
  );
}
