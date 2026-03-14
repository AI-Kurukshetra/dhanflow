'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AssetAllocationChart } from '@/components/dashboard/AssetAllocationChart';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { useTransactions } from '@/lib/hooks/useTransactions';

export default function PortfolioPage() {
  const { holdings, portfolioHistory, allocationData } = usePortfolio();
  const { transactions } = useTransactions();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <PortfolioChart data={portfolioHistory} title="Performance Trend" />
        <AssetAllocationChart data={allocationData} />
      </section>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-2">Symbol</th>
                <th className="pb-2">Name</th>
                <th className="pb-2 text-right">Allocation</th>
                <th className="pb-2 text-right">Value</th>
                <th className="pb-2 text-right">1M</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((item) => (
                <tr key={item.symbol} className="border-t border-white/10">
                  <td className="py-3 font-mono text-cyan-100">{item.symbol}</td>
                  <td className="py-3 text-slate-200">{item.name}</td>
                  <td className="py-3 text-right">{item.allocation}%</td>
                  <td className="py-3 text-right font-mono">₹{item.value.toLocaleString('en-IN')}</td>
                  <td className={`py-3 text-right ${item.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {item.change >= 0 ? '+' : ''}
                    {item.change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Transaction History</h3>
        <div className="space-y-2">
          {transactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
              <span className="text-slate-200">{tx.client}</span>
              <span className={tx.type === 'Sell' ? 'text-rose-300' : 'text-emerald-300'}>{tx.type}</span>
              <span className="font-mono text-slate-100">₹{tx.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
