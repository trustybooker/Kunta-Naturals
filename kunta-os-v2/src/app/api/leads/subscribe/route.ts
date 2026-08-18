import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { sendLesson } from '@/lib/email-system';

const schema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().max(100).optional().default(''),
  product: z.string().trim().max(80).optional().default('free-guide'),
  source: z.string().trim().max(120).optional().default('website'),
  marketingConsent: z.boolean(),
  website: z.string().trim().max(100).optional().default('')
});

function origins() {
  return (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function headers(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = origins();
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    Vary: 'Origin',
    'Cache-Control': 'no-store'
  };
}

function reply(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: headers(request) });
}

function publicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: headers(request) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && !origins().includes(origin)) {
    return reply(request, { error: 'Origin is not allowed.' }, 403);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply(request, { error: 'Invalid JSON request body.' }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return reply(request, { error: 'Enter a valid email and consent.' }, 400);
  const input = parsed.data;

  if (input.website) return reply(request, { ok: true, freeProductsUrl: `${publicSiteUrl()}/free-products.html` });
  if (!input.marketingConsent) return reply(request, { error: 'Consent is required before Kunta Naturals can email you.' }, 400);

  const email = input.email.trim().toLowerCase();

  const supabase = createSupabaseAdminClient();
  let leadId = '';
  try {
    const { data, error } = await supabase.from('email_leads').upsert(
      {
        email,
        email_lower: email,
        name: input.name || null,
        product: input.product,
        source: input.source,
        marketing_consent: input.marketingConsent,
        unsubscribed_at: null,
        sequence_status: 'active',
        sequence_day: 0,
        next_email_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'email_lower' }
    ).select('id').single();
    if (error) throw error;
    leadId = data.id;
  } catch {
    return reply(request, { error: 'Lead capture storage is not configured yet.' }, 501);
  }

  let emailSent = false;
  try {
    const result = await sendLesson(email, 1, leadId);
    emailSent = true;
    const now = new Date().toISOString();
    await supabase.from('email_events').insert({ lead_id: leadId, provider_email_id: result.id, event_type: 'email.sent', sequence_day: 1 });
    await supabase.from('email_leads').update({ sequence_day: 1, last_email_at: now, next_email_at: new Date(Date.now() + 86400000).toISOString() }).eq('id', leadId);
  } catch (error) {
    console.error('Kunta Naturals lead email was not sent.', error);
    emailSent = false;
  }

  return reply(request, { ok: true, emailSent, freeProductsUrl: `${publicSiteUrl()}/free-products.html` });
}
