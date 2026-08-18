import { AppHeader } from '@/components/app-header';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

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
    </main>
  );
}
