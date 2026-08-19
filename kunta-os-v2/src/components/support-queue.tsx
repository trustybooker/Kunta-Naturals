'use client';

import { useState } from 'react';

type SupportRequest = { id: string; email: string; topic: string; order_reference: string | null; message: string; status: string; created_at: string };

export function SupportQueue({ initialRequests }: { initialRequests: SupportRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [message, setMessage] = useState('');

  async function updateStatus(id: string, status: 'new' | 'in_progress' | 'resolved') {
    setMessage('Saving…');
    const response = await fetch('/api/admin/support', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (response.status === 401 || response.status === 403) { window.location.href = '/login?next=%2Foperations'; return; }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.error || 'Could not update the request.'); return; }
    setRequests((current) => current.map((item) => item.id === id ? { ...item, status: body.status } : item));
    setMessage('Support queue updated.');
  }

  return <><p className="notice" role="status">{message || 'Open a request, respond using the verified customer email, then mark it resolved.'}</p>{requests.length ? <div className="table-wrap"><table><thead><tr><th>Created</th><th>Topic</th><th>Customer</th><th>Reference</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td>{new Date(request.created_at).toLocaleString()}</td><td>{request.topic}</td><td>{request.email}</td><td>{request.order_reference || '—'}</td><td>{request.message}</td><td><span className="badge">{request.status}</span></td><td><select className="input" aria-label={`Status for request from ${request.email}`} value={request.status} onChange={(event) => updateStatus(request.id, event.target.value as 'new' | 'in_progress' | 'resolved')}><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></td></tr>)}</tbody></table></div> : <p className="empty-state">No customer support requests yet.</p>}</>;
}
