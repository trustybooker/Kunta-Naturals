'use client';
import { FormEvent, useEffect, useState } from 'react';
type Media = { name: string; url: string };
export function MediaManager() {
  const [items, setItems] = useState<Media[]>([]); const [message, setMessage] = useState('Loading media…'); const [busy, setBusy] = useState(false);
  async function load() { const r = await fetch('/api/admin/media', { cache: 'no-store' }); if (r.status === 401) { location.href = '/login'; return; } const d = await r.json(); if (!r.ok) { setMessage(d.error || 'Could not load media.'); return; } setItems(d); setMessage(`${d.length} media files loaded.`); }
  useEffect(() => { void load(); }, []);
  async function upload(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage('Uploading…'); const form = event.currentTarget; const r = await fetch('/api/admin/media', { method: 'POST', body: new FormData(form) }); const d = await r.json(); setBusy(false); if (!r.ok) { setMessage(d.error || 'Upload failed.'); return; } form.reset(); setMessage('Uploaded. Copy its URL into a product image field.'); await load(); }
  return <><form className="card form-grid" onSubmit={upload}><label>Brand image<input className="input" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required /></label><p>PNG, JPEG, WebP, or SVG · 10 MB maximum. Upload only media you own or are licensed to use.</p><button disabled={busy}>{busy ? 'Uploading…' : 'Upload image'}</button><p className="notice" role="status">{message}</p></form><section className="media-grid">{items.map((item) => <article className="card" key={item.name}><img src={item.url} alt="" /><strong>{item.name}</strong><button className="button-secondary" type="button" onClick={() => navigator.clipboard.writeText(item.url)}>Copy URL</button></article>)}</section></>;
}
