import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

export default function HomePage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ padding: '3rem' }}>
        <p className="eyebrow">Pure. Rooted. Real.</p>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', margin: 0 }}>Kunta Naturals OS v2</h1>
        <p style={{ maxWidth: 760, fontSize: '1.2rem' }}>
          Private control center for products, Amazon picks, digital products, content, approvals, media, and analytics.
          The public site sells the ritual. The OS controls the private workflow behind it.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="button" href="/dashboard">Open dashboard</Link>
          <Link className="button" href="/products">Manage products</Link>
        </div>
      </section>
      <section className="grid two-grid" style={{ marginTop: '1rem' }}>
        <article className="card"><h2>Brand lock</h2><p>Logo, ritual framework, belief stack, and public guardrails are locked into the OS.</p></article>
        <article className="card"><h2>Commerce path</h2><p>Own digital products. Curate Amazon and partner products. Launch branded products when demand is proven.</p></article>
      </section>
    </main>
  );
}
