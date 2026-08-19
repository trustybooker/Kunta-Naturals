import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

function money(cents: number | null, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format((cents || 0) / 100);
}

export default async function OperationsPage() {
  if (!await requireAdmin()) redirect('/login');
  const supabase = createSupabaseAdminClient();
  const [ordersResult, leadsResult, tokensResult, downloadsResult, emailEventsResult] = await Promise.all([
    supabase.from('orders').select('id,product_id,amount_total,currency,status,customer_email,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('email_leads').select('id,email,product,marketing_consent,sequence_status,sequence_day,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('delivery_tokens').select('id,order_id,product_id,use_count,max_uses,expires_at,revoked_at,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('download_events').select('id,product_id,event_name,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('email_events').select('id,event_type,sequence_day,occurred_at').order('occurred_at', { ascending: false }).limit(50)
  ]);
  const orders = ordersResult.data || [];
  const leads = leadsResult.data || [];
  const tokens = tokensResult.data || [];
  const downloads = downloadsResult.data || [];
  const emailEvents = emailEventsResult.data || [];
  const errors = [ordersResult, leadsResult, tokensResult, downloadsResult, emailEventsResult].filter((result) => result.error);
  const paid = orders.filter((order) => order.status === 'paid');
  const revenue = paid.reduce((sum, order) => sum + Number(order.amount_total || 0), 0);
  const deliveryIssues = paid.filter((order) => !tokens.some((token) => token.order_id === order.id));

  return <main className="shell">
    <AppHeader />
    <section className="card" style={{ marginBottom: '1rem' }}>
      <p className="eyebrow">Customer operations</p><h1>Orders, delivery and leads</h1>
      <p>Monitor paid promises first: successful orders, private access, downloads, email consent, and delivery exceptions.</p>
    </section>
    {errors.length > 0 && <section className="notice error-notice" style={{ marginBottom: '1rem' }}><strong>Partial setup detected.</strong> One or more operations tables are unavailable. Run the delivery, lead-capture, and email-automation schemas, then refresh.</section>}
    <section className="grid dashboard-grid">
      <article className="card"><span className="stat">{paid.length}</span><p>Recent paid orders</p></article>
      <article className="card"><span className="stat">{money(revenue)}</span><p>Recent paid revenue</p></article>
      <article className="card"><span className="stat">{deliveryIssues.length}</span><p>Paid orders missing access</p></article>
      <article className="card"><span className="stat">{leads.filter((lead) => lead.marketing_consent && lead.sequence_status === 'active').length}</span><p>Active consented leads</p></article>
    </section>
    {deliveryIssues.length > 0 && <section className="notice error-notice section-block"><strong>Action required:</strong> {deliveryIssues.length} paid order(s) have no matching delivery token in the latest records. Verify Stripe webhook delivery before promoting paid products.</section>}
    <section className="card section-block">
      <div className="row-between"><div><p className="eyebrow">Orders</p><h2>Recent checkout activity</h2></div><span className="badge">{orders.length} shown</span></div>
      {orders.length ? <div className="table-wrap"><table><thead><tr><th>Created</th><th>Product</th><th>Status</th><th>Amount</th><th>Customer</th><th>Access</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{new Date(order.created_at).toLocaleString()}</td><td>{order.product_id}</td><td><span className="badge">{order.status}</span></td><td>{money(order.amount_total, order.currency)}</td><td>{order.customer_email || '—'}</td><td>{tokens.some((token) => token.order_id === order.id) ? 'Created' : order.status === 'paid' ? 'Missing' : 'Not due'}</td></tr>)}</tbody></table></div> : <p className="empty-state">No orders recorded yet. A successful Stripe webhook will create the first record.</p>}
    </section>
    <section className="grid two-grid section-block">
      <article className="card"><div className="row-between"><h2>Email leads</h2><span className="badge">{leads.length}</span></div>{leads.length ? <div className="table-wrap"><table><thead><tr><th>Created</th><th>Email</th><th>Offer</th><th>Consent</th><th>Sequence</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td>{new Date(lead.created_at).toLocaleDateString()}</td><td>{lead.email}</td><td>{lead.product}</td><td>{lead.marketing_consent ? 'Yes' : 'No'}</td><td>{lead.sequence_status} · day {lead.sequence_day}</td></tr>)}</tbody></table></div> : <p className="empty-state">No email leads recorded yet.</p>}</article>
      <article className="card"><h2>Delivery health</h2><div className="quality-grid compact-quality"><div><strong>{tokens.length}</strong><p>Access tokens</p></div><div><strong>{downloads.length}</strong><p>Download events</p></div><div><strong>{emailEvents.length}</strong><p>Email events</p></div></div><p className="notice">Customer emails are visible only inside this protected owner workspace. Exporting and bulk messaging are intentionally not automatic.</p></article>
    </section>
  </main>;
}
