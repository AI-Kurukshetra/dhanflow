import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';
import { allocationData, benchmarkHistory, portfolioHistory } from '@/lib/mock-data';

const portfolioSchema = z.object({
  client_id: z.string().uuid(),
  total_value: z.number().nonnegative(),
  currency: z.string().default('INR'),
});

function requestId(req: NextRequest) {
  return req.nextUrl.searchParams.get('id');
}

export async function GET() {
  try {
    const supabase = createServerClient();

    const [{ data: holdings, error: holdingsError }, { data: portfolios, error: portfoliosError }] = await Promise.all([
      supabase.from('holdings').select('id, symbol, asset_type, quantity, price, updated_at').order('updated_at', { ascending: false }),
      supabase.from('portfolios').select('id, total_value, currency').order('created_at', { ascending: false }),
    ]);

    if (holdingsError) throw new AppError(holdingsError.message, 400);
    if (portfoliosError) throw new AppError(portfoliosError.message, 400);

    const holdingsRows = (holdings ?? []).map((item) => {
      const value = Number(item.quantity) * Number(item.price);
      return {
        symbol: item.symbol,
        name: item.asset_type,
        allocation: 0,
        value,
        change: 0,
      };
    });

    const total = holdingsRows.reduce((sum, item) => sum + item.value, 0);
    const normalized = holdingsRows.map((item) => ({
      ...item,
      allocation: total > 0 ? Number(((item.value / total) * 100).toFixed(2)) : 0,
    }));

    return NextResponse.json({
      data: {
        holdings: normalized,
        portfolios,
        allocationData,
        portfolioHistory,
        benchmarkHistory,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = portfolioSchema.parse(await req.json());
    const { data, error } = await supabase.from('portfolios').insert(body).select('*').single();
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
    const body = portfolioSchema.partial().parse(await req.json());
    const { data, error } = await supabase.from('portfolios').update(body).eq('id', id).select('*').single();
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
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
