'use client';

import { useEffect, useState } from 'react';

export default function DeliverySuccessPage() {
  const [message, setMessage] = useState('Confirming your payment...');
  const [accessPage, setAccessPage] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (!sessionId) {
      setMessage('Missing checkout session. Contact support with your receipt.');
      return;
    }

    fetch(`/api/delivery/claim?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.accessPage) {
          setAccessPage(data.accessPage);
          setMessage('Your secure delivery link is ready.');
        } else {
          setMessage(data.error || 'Delivery is not ready yet. Contact support with your receipt.');
        }
      })
      .catch(() => setMessage('Delivery check failed. Contact support with your receipt.'));
  }, []);

  return (
    <main className="shell">
      <header className="header"><a className="logo" href="https://kuntanaturals.com"><img src="/assets/logo-mark.svg" alt="" /><span>Kunta Naturals</span></a></header>
      <section className="card" style={{ padding: '3rem' }}>
        <p className="eyebrow">Payment received</p>
        <h1>Your Kunta Naturals delivery is being prepared.</h1>
        <p>{message}</p>
        {accessPage ? <a className="button" href={accessPage}>Open secure delivery</a> : <a className="button button-secondary" href="https://kuntanaturals.com/support.html">Get delivery help</a>}
      </section>
    </main>
  );
}
