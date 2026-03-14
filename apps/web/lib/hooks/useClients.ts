'use client';

import { useQuery } from 'react-query';
import { mockClients } from '@/lib/mock-data';

type Client = {
  id: string;
  advisor_id?: string;
  name: string;
  email?: string;
  phone?: string;
  segment?: string;
  risk_profile: 'Low' | 'Moderate' | 'High';
  aum?: number;
  status?: 'Active' | 'Pending';
};

async function fetchClients(): Promise<Client[]> {
  const res = await fetch('/api/clients', { cache: 'no-store' });
  if (!res.ok) {
    return mockClients as unknown as Client[];
  }
  const payload = (await res.json()) as { data?: Client[] };
  return payload.data && payload.data.length > 0 ? payload.data : (mockClients as unknown as Client[]);
}

export function useClients() {
  const query = useQuery<Client[]>('clients', fetchClients, {
    initialData: mockClients as unknown as Client[],
  });

  return {
    clients: query.data ?? (mockClients as unknown as Client[]),
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
