'use client';

import { useQuery } from 'react-query';

type Goal = {
  id: string;
  client_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
};

const fallbackGoals: Goal[] = [
  {
    id: 'g1',
    client_id: 'c1',
    goal_name: 'Retirement Corpus',
    target_amount: 80000000,
    current_amount: 57600000,
    deadline: '2038-12-31',
  },
  {
    id: 'g2',
    client_id: 'c1',
    goal_name: 'Child Education Fund',
    target_amount: 12000000,
    current_amount: 6480000,
    deadline: '2031-06-30',
  },
];

async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch('/api/goals', { cache: 'no-store' });
  if (!res.ok) return fallbackGoals;
  const payload = (await res.json()) as { data?: Goal[] };
  return payload.data && payload.data.length > 0 ? payload.data : fallbackGoals;
}

export function useGoals() {
  const query = useQuery<Goal[]>('goals', fetchGoals, { initialData: fallbackGoals });

  return {
    goals: query.data ?? fallbackGoals,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
