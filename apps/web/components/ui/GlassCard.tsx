import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function GlassCard({ className, glow = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.08] p-5 shadow-[0_20px_45px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl',
        glow &&
          'before:pointer-events-none before:absolute before:-top-24 before:left-1/2 before:h-52 before:w-52 before:-translate-x-1/2 before:rounded-full before:bg-cyan-300/20 before:blur-3xl before:content-[""]',
        className,
      )}
      {...props}
    />
  );
}
