import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { motionTokens } from '../theme/tokens';

const liquidButtonVariants = cva(
  'group relative inline-flex items-center justify-center overflow-hidden rounded-full font-display font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
      tone: {
        cyan: 'bg-gradient-to-r from-df-liquidA via-df-liquidC to-df-liquidB shadow-[0_12px_28px_rgba(2,192,255,0.35)]',
        mint: 'bg-gradient-to-r from-emerald-300 via-cyan-300 to-df-liquidC shadow-[0_12px_28px_rgba(59,232,176,0.35)]',
      },
    },
    defaultVariants: {
      size: 'md',
      tone: 'cyan',
    },
  },
);

type LiquidButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof liquidButtonVariants>;

export function LiquidButton({ className, size, tone, children, ...props }: LiquidButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={motionTokens.easing.spring}
      className={cn(liquidButtonVariants({ size, tone }), className)}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-white/35 transition-transform duration-500 group-hover:translate-x-0" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
