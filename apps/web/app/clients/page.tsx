'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { useClients } from '@/lib/hooks/useClients';

export default function ClientsPage() {
  const { clients } = useClients();
  const [query, setQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filtered = useMemo(
    () => clients.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [clients, query],
  );
  const activeClientId = selectedClientId ?? filtered[0]?.id ?? null;

  const { data: communications = [] } = useQuery(['communications', activeClientId], async () => {
    if (!activeClientId) return [];
    const res = await fetch(`/api/communications?client_id=${activeClientId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload.data ?? [];
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Client CRM</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search client"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-2">Client</th>
                <th className="pb-2">Segment</th>
                <th className="pb-2">Risk</th>
                <th className="pb-2 text-right">AUM</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-t border-white/10 cursor-pointer" onClick={() => setSelectedClientId(client.id)}>
                  <td className="py-3 font-medium text-slate-100">{client.name}</td>
                  <td className="py-3 text-slate-300">{client.segment ?? '-'}</td>
                  <td className="py-3 text-slate-300">{client.risk_profile}</td>
                  <td className="py-3 text-right font-mono text-slate-200">₹{(client.aum ?? 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold">Client Profile Panel</h3>
          <p className="text-sm text-slate-300">
            Select a client to see profile details, KYC status, investment mandate, and relationship notes.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Activity Timeline</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {communications.length === 0 ? <li>No communications logged yet.</li> : null}
              {communications.map((item: { id: string; channel: string; message: string; created_at: string }) => (
                <li key={item.id}>
                  <span className="text-cyan-100">{item.channel}</span>: {item.message}
                  <div className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
