'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { useGoals } from '@/lib/hooks/useGoals';
import { useClients } from '@/hooks/useClients';

type GoalInput = {
  client_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
};

export default function GoalsPage() {
  const { goals, refetch } = useGoals();
  const { clients } = useClients();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<GoalInput>();

  const onSubmit = handleSubmit(async (values) => {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        target_amount: Number(values.target_amount),
        current_amount: Number(values.current_amount),
      }),
    });

    reset();
    await queryClient.invalidateQueries('goals');
    await refetch();
  });

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Create Financial Goal</h2>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <select {...register('client_id', { required: true })} className="rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input {...register('goal_name', { required: true })} placeholder="Goal name" className="rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <input {...register('target_amount', { required: true })} type="number" placeholder="Target amount" className="rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <input {...register('current_amount', { required: true })} type="number" placeholder="Current amount" className="rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <input {...register('deadline', { required: true })} type="date" className="rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <LiquidButton type="submit">Add Goal</LiquidButton>
        </form>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {goals.map((goal, index) => {
          const progress = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <GlassCard className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Goal</p>
                  <h3 className="text-lg font-semibold">{goal.goal_name}</h3>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{progress}% achieved</span>
                  <span className="font-mono">₹{goal.target_amount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-slate-400">Timeline projection: on-track for {new Date(goal.deadline).getFullYear()}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
