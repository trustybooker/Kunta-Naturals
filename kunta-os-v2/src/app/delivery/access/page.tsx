export default async function DeliveryAccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token || '';
  const downloadUrl = token ? `/api/delivery/download?token=${encodeURIComponent(token)}` : '';

  return (
    <main className="shell">
      <header className="header"><a className="logo" href="https://kuntanaturals.com"><img src="/assets/logo-mark.svg" alt="" /><span>Kunta Naturals</span></a></header>
      <section className="card" style={{ padding: '3rem' }}>
        <p className="eyebrow">Secure delivery</p>
        <h1>Your Kunta Naturals digital product is ready.</h1>
        <p>This download link is protected, limited-use, and time-limited. Do not share it publicly.</p>
        {token ? <a className="button" href={downloadUrl}>Download product</a> : <><p>That delivery link is incomplete. Keep your receipt so we can locate the order.</p><a className="button button-secondary" href="https://kuntanaturals.com/support.html">Contact support</a></>}
      </section>
    </main>
  );
}
