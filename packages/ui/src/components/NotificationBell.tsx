import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

type NotificationBellProps = {
  count?: number;
  className?: string;
};

export function NotificationBell({ count = 0, className }: NotificationBellProps) {
  return (
    <motion.button
      whileHover={{ rotate: [0, -8, 8, -4, 0] }}
      transition={{ duration: 0.45 }}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-900/55 text-df-primary backdrop-blur-xl',
        'shadow-[0_12px_24px_rgba(4,12,24,0.5)]',
        className,
      )}
      aria-label="Notifications"
      type="button"
    >
      <span className="text-lg">🔔</span>
      {count > 0 ? (
        <span className="df-data-text absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-df-loss px-1 text-[10px] font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </motion.button>
  );
}
