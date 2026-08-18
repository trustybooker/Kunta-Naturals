import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { emailFromUnsubscribeToken } from '@/lib/email-system';

async function unsubscribe(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get('token') || '';
  if (request.method === 'POST' && !token) {
    const form = await request.formData().catch(() => null);
    token = String(form?.get('token') || '');
  }
  const email = emailFromUnsubscribeToken(token);
  if (!email) return NextResponse.json({ error: 'Invalid unsubscribe request.' }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  await supabase.from('email_leads').update({ unsubscribed_at: new Date().toISOString(), sequence_status: 'unsubscribed', next_email_at: null }).eq('email_lower', email);
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) { return unsubscribe(request); }
