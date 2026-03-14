import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';

const transactionSchema = z.object({
  portfolio_id: z.string().uuid(),
  type: z.enum(['Buy', 'Sell', 'SIP']),
  amount: z.number().nonnegative(),
});

function requestId(req: NextRequest) {
  return req.nextUrl.searchParams.get('id');
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, created_at, portfolios(client_id, clients(name))')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new AppError(error.message, 400);

    const normalized = (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      date: row.created_at,
      asset: 'Portfolio Transaction',
      client: row.portfolios?.clients?.name ?? 'Client',
    }));

    return NextResponse.json({ data: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = transactionSchema.parse(await req.json());
    const { data, error } = await supabase.from('transactions').insert(body).select('*').single();
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
    const body = transactionSchema.partial().parse(await req.json());
    const { data, error } = await supabase.from('transactions').update(body).eq('id', id).select('*').single();
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
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
