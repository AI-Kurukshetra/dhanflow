import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';

const meetingSchema = z.object({
  client_id: z.string().uuid(),
  meeting_time: z.string(),
  meeting_link: z.string().url(),
});

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('meetings')
      .select('id, client_id, meeting_time, meeting_link, clients(name)')
      .order('meeting_time', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    const normalized = (data ?? []).map((row: any) => ({
      id: row.id,
      client_id: row.client_id,
      client_name: row.clients?.name ?? 'Client',
      meeting_time: row.meeting_time,
      meeting_link: row.meeting_link,
    }));

    return NextResponse.json({ data: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = meetingSchema.parse(await req.json());
    const { data, error } = await supabase.from('meetings').insert(body).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
