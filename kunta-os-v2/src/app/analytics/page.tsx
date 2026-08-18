import { AppHeader } from '@/components/app-header';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AnalyticsPage() {
  if (!await requireAdmin()) redirect('/login');
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Analytics</p>
        <h1>Funnel tracker</h1>
        <p>Track the full journey from belief to quiz to guide to product click to purchase destination.</p>
      </section>
      <AnalyticsDashboard />
    </main>
  );
}
