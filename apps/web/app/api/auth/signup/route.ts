import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { handleApiError, AppError } from '@/lib/errors';
import { createServerClient } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['advisor', 'admin', 'assistant']).default('advisor'),
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
    const payload = signupSchema.parse(await req.json());
    const supabase = getAuthClient();
    const serviceClient = createServerClient();

    // Use admin creation to avoid public signup email rate limits.
    const { data: adminData, error: adminError } = await serviceClient.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    });

    if (adminError) {
      // Fallback for already-existing users so UX stays predictable.
      if (!adminError.message.toLowerCase().includes('already') && !adminError.message.toLowerCase().includes('exists')) {
        throw new AppError(adminError.message, 400);
      }
    }

    // Create a login session immediately after user creation.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error || !data.user) {
      throw new AppError(error?.message ?? 'Unable to establish session after signup', 401);
    }

    const { error: profileError } = await serviceClient.from('users').upsert(
      {
        id: data.user.id,
        email: payload.email,
        role: payload.role,
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      throw new AppError(`User profile creation failed: ${profileError.message}`, 500);
    }

    const response = NextResponse.json({
      data: { user: data.user, role: payload.role, needsEmailVerification: false },
    });

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
