import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type LiquidButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
};

export function LiquidButton({ className, children, ...props }: LiquidButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-cyan-100/30 px-4 py-2 text-sm font-medium text-slate-50',
        'bg-gradient-to-r from-cyan-500/70 via-sky-500/70 to-emerald-400/70 shadow-[0_12px_30px_-15px_rgba(0,190,255,0.75)]',
        'transition duration-300 hover:shadow-[0_16px_35px_-16px_rgba(57,232,182,0.75)]',
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.35),transparent_45%)]" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
