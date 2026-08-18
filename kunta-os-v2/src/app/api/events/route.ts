import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const allowedEvents = ['page_view', 'quiz_completed', 'concierge_opened', 'concierge_recommended', 'free_product_opened', 'launch_access_clicked', 'checkout_started'] as const;
const schema = z.object({
  event: z.enum(allowedEvents),
  path: z.string().max(180),
  label: z.string().max(120).optional(),
  referrerHost: z.string().max(120).optional()
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173').split(',').map((value) => value.trim());
  if (origin && !allowedOrigins.includes(origin)) return NextResponse.json({ error: 'Origin is not allowed.' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('analytics_events').insert({
      event_name: parsed.data.event,
      path: parsed.data.path,
      label: parsed.data.label || null,
      referrer_host: parsed.data.referrerHost || null
    });
    if (error) throw error;
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': origin || allowedOrigins[0], Vary: 'Origin' } });
  } catch {
    return NextResponse.json({ error: 'Event storage is unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173').split(',').map((value) => value.trim());
  if (origin && !allowedOrigins.includes(origin)) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', Vary: 'Origin' } });
}
