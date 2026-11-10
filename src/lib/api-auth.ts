import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

/**
 * Verify the request carries a valid Supabase Auth bearer token.
 * Returns the authenticated user, or null when unauthenticated.
 * Server-side only.
 */
export async function requireAdmin(req: Request) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/** Best-effort client IP behind Vercel / proxies. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

const buckets = new Map<string, { count: number; reset: number }>();

/**
 * Fixed-window in-memory rate limit. Returns true when allowed.
 * Note: per serverless instance, so this deters casual abuse rather
 * than providing a hard global cap.
 */
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Convenience 401 / 429 responses. */
export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
export const tooManyRequests = () =>
  NextResponse.json({ error: 'Too many requests' }, { status: 429 });
