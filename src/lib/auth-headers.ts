import { supabase } from './supabase';

/**
 * Build request headers carrying the current Supabase session token,
 * so server API routes can verify the caller is the signed-in admin.
 * Client-side only.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
