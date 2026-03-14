import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';
import { motionTokens } from '../theme/tokens';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function GlassCard({ className, glow = true, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: motionTokens.hover.raiseY }}
      transition={{ duration: motionTokens.duration.smooth, ease: motionTokens.easing.standard }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/45 p-5 text-df-primary shadow-glass backdrop-blur-xl',
        glow && 'before:absolute before:-top-20 before:left-1/2 before:h-52 before:w-52 before:-translate-x-1/2 before:rounded-full before:bg-cyan-300/20 before:blur-3xl before:content-[""]',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
