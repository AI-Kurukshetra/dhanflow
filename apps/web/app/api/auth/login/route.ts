import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { handleApiError, AppError } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new AppError('Supabase auth env vars are missing', 500);
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const payload = loginSchema.parse(await req.json());
    const supabase = getAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error || !data.session) {
      throw new AppError(error?.message ?? 'Invalid credentials', 401);
    }

    const response = NextResponse.json({ data: { user: data.user } });

    response.cookies.set('df_access_token', data.session.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: data.session.expires_in,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
