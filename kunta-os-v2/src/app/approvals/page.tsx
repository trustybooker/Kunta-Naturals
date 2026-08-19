import { AppHeader } from '@/components/app-header';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const checks = [
  'Brand fit: Pure. Rooted. Real.',
  'Audience fit: adults, men, women, family-safe context.',
  'No medical outcome language.',
  'No fake reviews, fake results, or fake before-after proof.',
  'Official affiliate or checkout link added.',
  'Product photo or media is believable and premium.',
  'Disclosure is present when needed.',
  'Price, destination, and product role are clear.'
];

export default async function ApprovalsPage() {
  if (!await requireAdmin()) redirect('/login');
  const supabase = createSupabaseAdminClient();
  const [productsResult, contentResult] = await Promise.all([
    supabase.from('catalog_products').select('id,name,short_description,checkout_status,status').eq('status', 'review').order('sort_order'),
    supabase.from('content_items').select('id,title,channel,status,updated_at').eq('status', 'review').order('updated_at', { ascending: false })
  ]);
  const products = productsResult.data || [];
  const content = contentResult.data || [];
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Approvals</p>
        <h1>Approval queue</h1>
        <p>Every product, page, image, email, and post passes review before public use.</p>
      </section>
      <section className="grid two-grid">
        <article className="card">
          <h2>Pre-publish checklist</h2>
          <ul>
            {checks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </article>
        <article className="card">
          <h2>Owner approval gates</h2>
          <p>Owner approval is required before product launch, price changes, paid ads, official affiliate links, public campaigns, and branded physical product decisions.</p>
          <div className="notice">Autonomy means prepare, score, and recommend. It does not mean publish risky items without approval.</div>
        </article>
      </section>
      <section className="grid two-grid section-block">
        <article className="card">
          <div className="row-between"><h2>Products awaiting review</h2><span className="badge">{products.length}</span></div>
          {products.length ? <div className="queue-list">{products.map((product) => <div className="queue-item" key={product.id}><div><strong>{product.name}</strong><p>{product.short_description}</p><small>{product.checkout_status}</small></div><Link className="button button-secondary" href="/products">Review product</Link></div>)}</div> : <p className="empty-state">No products are waiting for review.</p>}
        </article>
        <article className="card">
          <div className="row-between"><h2>Content awaiting review</h2><span className="badge">{content.length}</span></div>
          {content.length ? <div className="queue-list">{content.map((item) => <div className="queue-item" key={item.id}><div><strong>{item.title}</strong><p>{item.channel} · updated {new Date(item.updated_at).toLocaleDateString()}</p></div><Link className="button button-secondary" href="/content">Review content</Link></div>)}</div> : <p className="empty-state">No content is waiting for review.</p>}
        </article>
      </section>
      {(productsResult.error || contentResult.error) && <section className="notice error-notice section-block">The live approval queue could not be loaded. Check the admin schema and Supabase connection.</section>}
    </main>
  );
}
