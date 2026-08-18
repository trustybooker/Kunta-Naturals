import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { sendLesson } from '@/lib/email-system';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: leads, error } = await supabase
    .from('email_leads')
    .select('id,email_lower,sequence_day')
    .eq('marketing_consent', true)
    .is('unsubscribed_at', null)
    .eq('sequence_status', 'active')
    .lte('next_email_at', now)
    .order('next_email_at')
    .limit(100);
  if (error) return NextResponse.json({ error: 'Could not load due emails.' }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const lead of leads || []) {
    const day = Math.min(Number(lead.sequence_day || 1) + 1, 5);
    try {
      const result = await sendLesson(lead.email_lower, day, lead.id);
      await supabase.from('email_events').insert({ lead_id: lead.id, provider_email_id: result.id, event_type: 'email.sent', sequence_day: day });
      await supabase.from('email_leads').update({
        sequence_day: day,
        sequence_status: day >= 5 ? 'completed' : 'active',
        last_email_at: now,
        next_email_at: day >= 5 ? null : new Date(Date.now() + 86400000).toISOString()
      }).eq('id', lead.id).eq('sequence_day', lead.sequence_day);
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return NextResponse.json({ ok: true, due: leads?.length || 0, sent, failed });
}
