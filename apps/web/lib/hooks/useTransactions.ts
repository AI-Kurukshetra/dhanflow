'use client';

import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useQueryClient } from 'react-query';
import { mockTransactions, type Transaction } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase/client';

type TransactionRow = Transaction & { relativeTime?: string };

async function fetchTransactions(): Promise<TransactionRow[]> {
  const res = await fetch('/api/transactions', { cache: 'no-store' });
  if (!res.ok) {
    return mockTransactions.map((item) => ({
      ...item,
      relativeTime: formatDistanceToNow(new Date(item.date), { addSuffix: true }),
    }));
  }

  const payload = (await res.json()) as { data?: Transaction[] };
  const rows = payload.data && payload.data.length > 0 ? payload.data : mockTransactions;

  return rows.map((item) => ({
    ...item,
    relativeTime: formatDistanceToNow(new Date(item.date), { addSuffix: true }),
  }));
}

export function useTransactions() {
  const queryClient = useQueryClient();
  const query = useQuery<TransactionRow[]>('transactions', fetchTransactions, {
    initialData: mockTransactions.map((item) => ({
      ...item,
      relativeTime: formatDistanceToNow(new Date(item.date), { addSuffix: true }),
    })),
  });

  useEffect(() => {
    const realtime = supabase;
    if (!realtime) return;

    const channel = realtime
      .channel('transactions-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        void queryClient.invalidateQueries('transactions');
      })
      .subscribe();

    return () => {
      void realtime.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    transactions: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
