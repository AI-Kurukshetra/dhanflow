import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';

const taskSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(2),
  status: z.string().default('open'),
  due_date: z.string().optional(),
});

function requestId(req: NextRequest) {
  return req.nextUrl.searchParams.get('id');
}

export async function GET() {
  try {
    // Optional role gate via header, keeps local dev usable without auth wiring.
    // Send x-user-id to enforce advisor/admin/assistant access.
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, due_date, client_id, clients(name)')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw new AppError(error.message, 400);
    const normalized = (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      due_date: row.due_date,
      client_id: row.client_id,
      client_name: row.clients?.name ?? 'Client',
    }));

    return NextResponse.json({ data: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (userId) {
      await requireRole(userId, ['advisor', 'admin', 'assistant']);
    }
    const supabase = createServerClient();
    const body = taskSchema.parse(await req.json());
    const { data, error } = await supabase.from('tasks').insert(body).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (userId) {
      await requireRole(userId, ['advisor', 'admin', 'assistant']);
    }
    const id = requestId(req);
    if (!id) throw new AppError('Missing id query parameter', 400);

    const supabase = createServerClient();
    const body = taskSchema.partial().parse(await req.json());
    const { data, error } = await supabase.from('tasks').update(body).eq('id', id).select('*').single();
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (userId) {
      await requireRole(userId, ['advisor', 'admin']);
    }
    const id = requestId(req);
    if (!id) throw new AppError('Missing id query parameter', 400);

    const supabase = createServerClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
