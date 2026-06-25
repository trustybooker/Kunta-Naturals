import { AppHeader } from '@/components/app-header';

const events = [
  'Quiz started',
  'Quiz completed',
  'Guide clicked',
  'Email signup',
  'Product clicked',
  'Checkout clicked'
];

export default function AnalyticsPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Analytics</p>
        <h1>Funnel tracker</h1>
        <p>Track the full journey from belief to quiz to guide to product click to purchase destination.</p>
      </section>
      <section className="grid dashboard-grid">
        {events.map((event, index) => (
          <article className="card" key={event}>
            <span className="stat">{index === 0 ? 0 : '—'}</span>
            <p>{event}</p>
          </article>
        ))}
      </section>
      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Next measurement layer</h2>
        <p>Connect analytics tools after the public site and product links are finalized.</p>
      </section>
    </main>
  );
}
