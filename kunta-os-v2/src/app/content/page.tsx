import { AppHeader } from '@/components/app-header';
import { ContentManager } from '@/components/content-manager';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

export default async function ContentPage() {
  if (!await requireAdmin()) redirect('/login');
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Content</p>
        <h1>Content engine</h1>
        <p>Turn one real customer question into a reviewed website, email, blog, or social draft—without exposing internal strategy or publishing unsupported claims.</p>
      </section>
      <section className="grid two-grid" style={{ marginBottom: '1rem' }}>
        <article className="card"><h2>How it works</h2><ol className="spaced-list"><li>Capture a real question, objection, or useful lesson.</li><li>Choose the channel and write one focused answer.</li><li>Add one relevant call to action.</li><li>Move Draft → Review → Approved → Published.</li></ol></article>
        <article className="card"><h2>What it does not do</h2><p>It does not automatically post, invent proof, make medical promises, or send campaigns without approval. “Published” is a recorded business state; channel transmission remains a deliberate action.</p><div className="notice">Best use: one useful answer → one audience → one offer → one measurable response.</div></article>
      </section>
      <ContentManager />
    </main>
  );
}
