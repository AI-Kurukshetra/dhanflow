'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Transaction } from '@/lib/mock-data';

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <GlassCard className="h-full">
      <h3 className="mb-4 font-semibold text-slate-100">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="grid grid-cols-[1.25fr_0.8fr_0.8fr] items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-slate-100">{item.client}</p>
              <p className="text-xs text-slate-400">{item.asset}</p>
            </div>
            <p className={item.type === 'Sell' ? 'text-rose-300' : 'text-emerald-300'}>{item.type}</p>
            <p className="text-right font-mono text-slate-200">₹{item.amount.toLocaleString('en-IN')}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
