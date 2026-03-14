import { createServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';

export type AppRole = 'advisor' | 'admin' | 'assistant';

export async function requireRole(userId: string, allowed: AppRole[]) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
  if (error || !data) {
    throw new AppError('User role not found', 403);
  }

  if (!allowed.includes((data.role ?? '') as AppRole)) {
    throw new AppError('Insufficient role permissions', 403);
  }

  return data.role as AppRole;
}
