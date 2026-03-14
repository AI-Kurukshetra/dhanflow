import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';

const clientSchema = z.object({
  advisor_id: z.string().uuid().optional(),
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  risk_profile: z.string().default('Moderate'),
});

function requestId(req: NextRequest) {
  return req.nextUrl.searchParams.get('id');
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = clientSchema.parse(await req.json());
    const { data, error } = await supabase.from('clients').insert(body).select('*').single();
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
    const body = clientSchema.partial().parse(await req.json());
    const { data, error } = await supabase.from('clients').update(body).eq('id', id).select('*').single();
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
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
