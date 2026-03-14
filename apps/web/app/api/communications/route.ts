import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';

const communicationSchema = z.object({
  client_id: z.string().uuid(),
  channel: z.string().min(2),
  message: z.string().min(2),
});

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('client_id');
    const supabase = createServerClient();

    const query = supabase
      .from('communications')
      .select('id, client_id, channel, message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data, error } = clientId ? await query.eq('client_id', clientId) : await query;

    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = communicationSchema.parse(await req.json());
    const { data, error } = await supabase.from('communications').insert(body).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
