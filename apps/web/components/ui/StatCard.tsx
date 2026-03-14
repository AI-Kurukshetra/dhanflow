import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

type StatCardProps = {
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
  icon: LucideIcon;
};

export function StatCard({ title, value, delta, positive = true, icon: Icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{title}</p>
          <div className="rounded-xl bg-white/10 p-2 text-cyan-100">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="font-mono text-2xl font-semibold text-slate-50">{value}</p>
        <p className={positive ? 'text-emerald-300' : 'text-rose-300'}>{delta}</p>
      </GlassCard>
    </motion.div>
  );
}
