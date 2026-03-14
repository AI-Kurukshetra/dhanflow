import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

type TickerItem = { symbol: string; price: string; delta: string; positive?: boolean };

type MarketTickerProps = { items: TickerItem[] };

export function MarketTicker({ items }: MarketTickerProps) {
  return (
    <GlassCard className="overflow-hidden py-3">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
        className="flex w-[200%] gap-8"
      >
        {[...items, ...items].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex min-w-max items-baseline gap-2">
            <span className="font-display text-sm text-df-primary">{item.symbol}</span>
            <span className="df-data-text text-sm text-df-muted">{item.price}</span>
            <span className={item.positive ? 'df-data-text text-xs text-df-gain' : 'df-data-text text-xs text-df-loss'}>
              {item.delta}
            </span>
          </div>
        ))}
      </motion.div>
    </GlassCard>
  );
}
