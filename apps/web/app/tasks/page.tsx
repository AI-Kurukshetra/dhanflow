'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { useClients } from '@/hooks/useClients';

type TaskInput = {
  client_id: string;
  title: string;
  status: string;
  due_date?: string;
};

type TaskRow = TaskInput & {
  id: string;
  client_name?: string;
};

async function fetchTasks(): Promise<TaskRow[]> {
  const res = await fetch('/api/tasks', { cache: 'no-store' });
  const payload = await res.json();
  return payload.data ?? [];
}

export default function TasksPage() {
  const { clients } = useClients();
  const queryClient = useQueryClient();
  const { data: tasks = [] } = useQuery('tasks', fetchTasks);
  const { register, handleSubmit, reset } = useForm<TaskInput>({ defaultValues: { status: 'open' } });

  const clientOptions = useMemo(() => clients.map((client) => ({ id: client.id, name: client.name })), [clients]);

  const onSubmit = handleSubmit(async (values) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    reset({ status: 'open', title: '', due_date: '', client_id: clientOptions[0]?.id ?? '' });
    await queryClient.invalidateQueries('tasks');
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Create Task</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <select {...register('client_id', { required: true })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input {...register('title', { required: true })} placeholder="Task title" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <select {...register('status')} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input {...register('due_date')} type="datetime-local" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <LiquidButton type="submit">Create Task</LiquidButton>
        </form>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-100">{task.title}</p>
                <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-cyan-100">{task.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">Assigned to: {task.client_name ?? task.client_id}</p>
              {task.due_date ? <p className="text-xs text-slate-400">Due: {new Date(task.due_date).toLocaleString()}</p> : null}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
