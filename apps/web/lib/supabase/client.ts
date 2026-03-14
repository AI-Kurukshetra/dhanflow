import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Keep runtime resilient in local dev without envs.
  console.warn('Supabase client env vars are missing. Falling back to mock data in hooks.');
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
