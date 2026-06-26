import { AppHeader } from '@/components/app-header';

export default function DeliveryAccessPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || '';
  const downloadUrl = token ? `/api/delivery/download?token=${encodeURIComponent(token)}` : '';

  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ padding: '3rem' }}>
        <p className="eyebrow">Secure delivery</p>
        <h1>Your Kunta Naturals digital product is ready.</h1>
        <p>This download link is protected, limited-use, and time-limited. Do not share it publicly.</p>
        {token ? <a className="button" href={downloadUrl}>Download product</a> : <p>Missing delivery token. Contact support with your receipt.</p>}
      </section>
    </main>
  );
}
