'use client';

import { motion } from 'framer-motion';
import { Landmark, BriefcaseBusiness, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AssetAllocationChart } from '@/components/dashboard/AssetAllocationChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useClients } from '@/lib/hooks/useClients';
import { useGoals } from '@/lib/hooks/useGoals';

export default function DashboardPage() {
  const { allocationData, portfolioHistory, total } = usePortfolio();
  const { transactions } = useTransactions();
  const { clients } = useClients();
  const { goals } = useGoals();

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard title="Portfolio Value" value={`₹${(total / 10000000).toFixed(2)} Cr`} delta="+5.8% vs last month" icon={BriefcaseBusiness} />
        <StatCard title="Total AUM" value="₹40.5 Cr" delta="+2.4% inflow" icon={Landmark} />
        <StatCard title="Client Count" value={`${clients.length}`} delta="Active managed relationships" icon={TrendingUp} />
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <PortfolioChart data={portfolioHistory} />
        <AssetAllocationChart data={allocationData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RecentTransactions transactions={transactions} />
        <AIInsightsPanel />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {goals.slice(0, 3).map((goal) => {
          const progress = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
          return (
            <GlassCard key={goal.id} className="space-y-3">
              <p className="text-sm font-medium text-slate-200">{goal.goal_name}</p>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-slate-300">{progress}% progress</p>
            </GlassCard>
          );
        })}
      </section>
    </div>
  );
}
