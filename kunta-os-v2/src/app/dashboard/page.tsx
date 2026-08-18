import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!await requireAdmin()) redirect('/login');
  const supabase = createSupabaseAdminClient();
  const [products, active, content, review, events] = await Promise.all([
    supabase.from('catalog_products').select('*', { count: 'exact', head: true }),
    supabase.from('catalog_products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('content_items').select('*', { count: 'exact', head: true }),
    supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
  ]);
  const stats = [[products.count || 0, 'Total products'], [active.count || 0, 'Active products'], [content.count || 0, 'Content assets'], [events.count || 0, '30-day events']];
  return <main className="shell">
    <AppHeader />
    {products.error && <section className="notice error-notice"><strong>Setup required:</strong> Run <code>supabase/admin-schema.sql</code> in Supabase, then refresh.</section>}
    <section className="grid dashboard-grid">{stats.map(([value, label]) => <article className="card" key={String(label)}><span className="stat">{value}</span><p>{label}</p></article>)}</section>
    <section className="grid two-grid" style={{ marginTop: '1rem' }}>
      <article className="card"><p className="eyebrow">Next action</p><h2>{review.count ? `${review.count} item${review.count === 1 ? '' : 's'} awaiting review` : 'No content waiting for review'}</h2><p>Review claims, links, visuals, pricing, and brand fit before anything becomes public.</p><Link className="button inline-button" href="/approvals">Open approval checklist</Link></article>
      <article className="card"><p className="eyebrow">Operating path</p><h2>Manage without editing code</h2><p>Products feed the public catalog. Content stays private until the owner deliberately approves it.</p><div className="quick-links"><Link href="/products">Manage products</Link><Link href="/content">Manage content</Link><Link href="/analytics">View analytics</Link></div></article>
    </section>
  </main>;
}
