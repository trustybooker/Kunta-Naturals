import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

type ResendEvent = {
  type?: string;
  created_at?: string;
  data?: { email_id?: string; to?: string[]; subject?: string };
};

function verifySignature(payload: string, request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  const id = request.headers.get('svix-id') || '';
  const timestamp = request.headers.get('svix-timestamp') || '';
  const signatures = (request.headers.get('svix-signature') || '').split(' ');
  const unix = Number(timestamp);
  if (!id || !unix || Math.abs(Date.now() / 1000 - unix) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest();
  return signatures.some((entry) => {
    const [, value] = entry.split(',');
    if (!value) return false;
    const supplied = Buffer.from(value, 'base64');
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}

async function verifyWithResend(event: ResendEvent) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailId = event.data?.email_id;
  if (!apiKey || !emailId) return false;
  const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store'
  });
  if (!response.ok) return false;
  const email = await response.json().catch(() => null);
  const expected = new Set((event.data?.to || []).map((value) => value.toLowerCase()));
  const actual = new Set((Array.isArray(email?.to) ? email.to : []).map((value: string) => value.toLowerCase()));
  return expected.size > 0 && [...expected].every((value) => actual.has(value));
}

export async function POST(request: Request) {
  const payload = await request.text();
  let event: ResendEvent;
  try { event = JSON.parse(payload); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  if (!verifySignature(payload, request) && !await verifyWithResend(event)) {
    return NextResponse.json({ error: 'Invalid webhook.' }, { status: 400 });
  }

  const svixId = request.headers.get('svix-id');
  const email = event.data?.to?.[0]?.toLowerCase() || null;
  const type = event.type || 'unknown';
  const supabase = createSupabaseAdminClient();
  const { data: lead } = email
    ? await supabase.from('email_leads').select('id').eq('email_lower', email).maybeSingle()
    : { data: null };
  await supabase.from('email_events').upsert({
    provider_event_id: svixId,
    provider_email_id: event.data?.email_id || null,
    lead_id: lead?.id || null,
    event_type: type,
    recipient_email: email,
    occurred_at: event.created_at || new Date().toISOString()
  }, { onConflict: 'provider_event_id', ignoreDuplicates: true });

  if (lead && ['email.bounced', 'email.complained', 'email.suppressed'].includes(type)) {
    const status = type.replace('email.', '');
    await supabase.from('email_leads').update({ sequence_status: status, next_email_at: null }).eq('id', lead.id);
  }
  return NextResponse.json({ received: true });
}
