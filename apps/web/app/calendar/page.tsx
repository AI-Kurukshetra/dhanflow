'use client';

import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { useClients } from '@/hooks/useClients';

type MeetingInput = {
  client_id: string;
  meeting_time: string;
  meeting_link: string;
};

type MeetingRow = MeetingInput & {
  id: string;
  client_name?: string;
};

async function fetchMeetings(): Promise<MeetingRow[]> {
  const res = await fetch('/api/meetings', { cache: 'no-store' });
  const payload = await res.json();
  return payload.data ?? [];
}

export default function CalendarPage() {
  const { clients } = useClients();
  const queryClient = useQueryClient();
  const { data: meetings = [] } = useQuery('meetings', fetchMeetings);
  const { register, handleSubmit, reset } = useForm<MeetingInput>();

  const onSubmit = handleSubmit(async (values) => {
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    reset();
    await queryClient.invalidateQueries('meetings');
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Schedule Meeting</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <select {...register('client_id', { required: true })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2">
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input {...register('meeting_time', { required: true })} type="datetime-local" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <input {...register('meeting_link', { required: true })} placeholder="https://meet.google.com/..." className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
          <LiquidButton type="submit">Schedule</LiquidButton>
        </form>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-medium text-slate-100">{meeting.client_name ?? meeting.client_id}</p>
              <p className="text-sm text-slate-300">{new Date(meeting.meeting_time).toLocaleString()}</p>
              <a href={meeting.meeting_link} className="text-sm text-cyan-100" target="_blank" rel="noreferrer">{meeting.meeting_link}</a>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
