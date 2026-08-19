import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const schema = z.object({
  email: z.string().trim().email().max(254),
  topic: z.enum(['order', 'delivery', 'email', 'product', 'other']),
  orderReference: z.string().trim().max(160).optional().default(''),
  message: z.string().trim().min(10).max(2000),
  website: z.string().trim().max(100).optional().default('')
});

function allowedOrigins() {
  return (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173')
    .split(',').map((value) => value.trim()).filter(Boolean);
}

function responseHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = allowedOrigins();
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Cache-Control': 'no-store',
    Vary: 'Origin'
  };
}

function reply(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: responseHeaders(request) });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: responseHeaders(request) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins().includes(origin)) return reply(request, { error: 'Origin is not allowed.' }, 403);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply(request, { error: 'Enter a valid email and a message of at least 10 characters.' }, 400);
  if (parsed.data.website) return reply(request, { ok: true });

  const { error } = await createSupabaseAdminClient().from('support_requests').insert({
    email: parsed.data.email.toLowerCase(),
    topic: parsed.data.topic,
    order_reference: parsed.data.orderReference || null,
    message: parsed.data.message,
    source_path: request.headers.get('referer')?.slice(0, 500) || null
  });
  if (error) return reply(request, { error: 'Support is temporarily unavailable. Please try again shortly.' }, 503);
  return reply(request, { ok: true });
}
