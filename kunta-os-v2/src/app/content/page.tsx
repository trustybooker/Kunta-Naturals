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
        <p>Draft public content from the brand doctrine without exposing internal strategy on the customer-facing site.</p>
      </section>
      <ContentManager />
    </main>
  );
}
