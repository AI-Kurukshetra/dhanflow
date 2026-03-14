import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';

const goalSchema = z.object({
  client_id: z.string().uuid(),
  goal_name: z.string().min(2),
  target_amount: z.number().nonnegative(),
  current_amount: z.number().nonnegative(),
  deadline: z.string(),
});

function requestId(req: NextRequest) {
  return req.nextUrl.searchParams.get('id');
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = goalSchema.parse(await req.json());
    const { data, error } = await supabase.from('goals').insert(body).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = requestId(req);
    if (!id) throw new AppError('Missing id query parameter', 400);

    const supabase = createServerClient();
    const body = goalSchema.partial().parse(await req.json());
    const { data, error } = await supabase.from('goals').update(body).eq('id', id).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = requestId(req);
    if (!id) throw new AppError('Missing id query parameter', 400);

    const supabase = createServerClient();
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
