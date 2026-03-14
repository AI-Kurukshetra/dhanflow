import * as React from 'react';
import { GlassCard } from './GlassCard';

type Activity = { id: string; title: string; time: string };

type ActivityTimelineProps = { activities: Activity[] };

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <GlassCard className="space-y-4">
      <p className="font-display text-xs uppercase tracking-[0.18em] text-df-muted">Recent Activity</p>
      <ol className="space-y-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-df-liquidA shadow-[0_0_10px_rgba(2,192,255,0.8)]" />
            <div className="flex-1 border-b border-white/10 pb-2">
              <p className="text-sm text-df-primary">{activity.title}</p>
              <p className="df-data-text text-xs text-df-muted">{activity.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}
