'use client';

import { useEffect, useState } from 'react';

const labels: Record<string, string> = { page_view: 'Page views', quiz_completed: 'Quiz completions', concierge_opened: 'Concierge opens', concierge_recommended: 'Concierge recommendations', free_product_opened: 'Free product opens', launch_access_clicked: 'Launch access clicks', checkout_started: 'Checkout starts' };

export function AnalyticsDashboard() {
  const [data, setData] = useState<{ totals: Record<string, number>; recent: Array<{ event_name: string; path: string; label?: string; created_at: string }>; windowDays: number } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/admin/analytics', { cache: 'no-store' }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setData(body); }).catch(() => setError('Analytics could not be loaded.')); }, []);
  if (error) return <p className="notice">{error}</p>;
  if (!data) return <p className="notice">Loading the last 30 days…</p>;
  return <>
    <section className="grid dashboard-grid">
      {Object.entries(labels).map(([key, label]) => <article className="card" key={key}><span className="stat">{data.totals[key] || 0}</span><p>{label}</p></article>)}
    </section>
    <section className="card" style={{ marginTop: '1rem' }}><h2>Recent activity</h2><div className="table-wrap"><table><thead><tr><th>Event</th><th>Page</th><th>Detail</th><th>Time</th></tr></thead><tbody>{data.recent.map((event, index) => <tr key={`${event.created_at}-${index}`}><td>{labels[event.event_name] || event.event_name}</td><td>{event.path}</td><td>{event.label || '—'}</td><td>{new Date(event.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </>;
}
