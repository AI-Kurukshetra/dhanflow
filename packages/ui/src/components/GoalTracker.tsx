import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

type GoalTrackerProps = {
  label: string;
  progress: number;
};

export function GoalTracker({ label, progress }: GoalTrackerProps) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-df-primary">{label}</p>
        <span className="df-data-text text-xs text-df-muted">{progress}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ duration: 0.9 }}
          className="h-3 rounded-full bg-gradient-to-r from-df-liquidA to-df-liquidB"
        />
      </div>
    </GlassCard>
  );
}
