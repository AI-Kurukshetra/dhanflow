'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { supabase } from '@/lib/supabase/client';
import {
  allocationData,
  benchmarkHistory,
  mockHoldings,
  portfolioHistory,
  type Holding,
} from '@/lib/mock-data';

type PortfolioPayload = {
  holdings: Holding[];
  allocationData: Array<{ name: string; value: number }>;
  portfolioHistory: Array<{ month: string; value: number }>;
  benchmarkHistory: Array<{ month: string; portfolio: number; benchmark: number }>;
};

async function fetchPortfolio(): Promise<PortfolioPayload> {
  const res = await fetch('/api/portfolios', { cache: 'no-store' });
  if (!res.ok) {
    return { holdings: mockHoldings, allocationData, portfolioHistory, benchmarkHistory };
  }

  const payload = (await res.json()) as { data?: Partial<PortfolioPayload> };

  return {
    holdings: payload.data?.holdings && payload.data.holdings.length > 0 ? payload.data.holdings : mockHoldings,
    allocationData: payload.data?.allocationData && payload.data.allocationData.length > 0 ? payload.data.allocationData : allocationData,
    portfolioHistory: payload.data?.portfolioHistory && payload.data.portfolioHistory.length > 0 ? payload.data.portfolioHistory : portfolioHistory,
    benchmarkHistory:
      payload.data?.benchmarkHistory && payload.data.benchmarkHistory.length > 0
        ? payload.data.benchmarkHistory
        : benchmarkHistory,
  };
}

export function usePortfolio() {
  const queryClient = useQueryClient();
  const query = useQuery<PortfolioPayload>('portfolio', fetchPortfolio, {
    initialData: { holdings: mockHoldings, allocationData, portfolioHistory, benchmarkHistory },
  });

  useEffect(() => {
    const realtime = supabase;
    if (!realtime) return;

    const channel = realtime
      .channel('portfolio-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'holdings' }, () => {
        void queryClient.invalidateQueries('portfolio');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios' }, () => {
        void queryClient.invalidateQueries('portfolio');
      })
      .subscribe();

    return () => {
      void realtime.removeChannel(channel);
    };
  }, [queryClient]);

  const holdings = query.data?.holdings ?? mockHoldings;
  const total = holdings.reduce((sum, item) => sum + item.value, 0);

  return {
    holdings,
    total,
    allocationData: query.data?.allocationData ?? allocationData,
    portfolioHistory: query.data?.portfolioHistory ?? portfolioHistory,
    benchmarkHistory: query.data?.benchmarkHistory ?? benchmarkHistory,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
