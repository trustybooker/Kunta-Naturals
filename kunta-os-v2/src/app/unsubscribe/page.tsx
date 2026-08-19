import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { emailFromUnsubscribeToken } from '@/lib/email-system';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  const email = emailFromUnsubscribeToken(token);
  if (email) {
    const supabase = createSupabaseAdminClient();
    await supabase.from('email_leads').update({ unsubscribed_at: new Date().toISOString(), sequence_status: 'unsubscribed', next_email_at: null }).eq('email_lower', email);
  }
  return <main className="shell"><section className="card" style={{ maxWidth: 680, margin: '4rem auto', padding: '2.5rem' }}><p className="eyebrow">Email preferences</p><h1>{email ? 'You’re unsubscribed.' : 'This link is not valid.'}</h1><p>{email ? 'Kunta Naturals will stop sending marketing and course emails to this address. Transactional order and delivery messages may still be sent when required.' : 'Open the unsubscribe link from the most recent Kunta Naturals email, or ask us to update your preferences.'}</p><div className="quick-links"><a className="button inline-button" href="https://kuntanaturals.com">Return to Kunta Naturals</a>{!email && <a className="button button-secondary inline-button" href="https://kuntanaturals.com/support.html">Contact support</a>}</div></section></main>;
}
