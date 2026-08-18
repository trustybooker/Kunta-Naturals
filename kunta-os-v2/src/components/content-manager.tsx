'use client';

import { FormEvent, useEffect, useState } from 'react';

type ContentItem = { id?: string; title: string; channel: 'Site'|'Email'|'Instagram'|'TikTok'|'YouTube Shorts'|'Blog'; body: string; call_to_action: string | null; status: 'draft'|'review'|'approved'|'published'|'archived'; scheduled_for: string | null; updated_at?: string };
const blank: ContentItem = { title: '', channel: 'Site', body: '', call_to_action: '', status: 'draft', scheduled_for: null };

export function ContentManager() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [item, setItem] = useState<ContentItem>(blank);
  const [message, setMessage] = useState('Loading content…');
  const [saving, setSaving] = useState(false);
  async function load() {
    const response = await fetch('/api/admin/content', { cache: 'no-store' });
    if (response.status === 401) { window.location.href = '/login'; return; }
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Could not load content.'); return; }
    setItems(data); setMessage(`${data.length} content items loaded.`);
  }
  useEffect(() => { void load(); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('Saving…');
    const response = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(data.error || 'Could not save content.'); return; }
    setItem(data); setMessage('Saved. Publishing remains an explicit owner decision.'); await load();
  }
  return <div className="admin-layout">
    <form className="card form-grid sticky-editor" onSubmit={save}>
      <div className="row-between"><div><p className="eyebrow">Editor</p><h2>{item.id ? 'Edit content' : 'New content'}</h2></div><button type="button" className="button-secondary" onClick={() => setItem(blank)}>New</button></div>
      <label>Title<input className="input" required value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} /></label>
      <label>Channel<select className="input" value={item.channel} onChange={(e) => setItem({ ...item, channel: e.target.value as ContentItem['channel'] })}>{['Site','Email','Instagram','TikTok','YouTube Shorts','Blog'].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Body<textarea className="input" required minLength={10} rows={9} value={item.body} onChange={(e) => setItem({ ...item, body: e.target.value })} /></label>
      <label>Call to action<input className="input" value={item.call_to_action || ''} onChange={(e) => setItem({ ...item, call_to_action: e.target.value })} /></label>
      <label>Status<select className="input" value={item.status} onChange={(e) => setItem({ ...item, status: e.target.value as ContentItem['status'] })}>{['draft','review','approved','published','archived'].map((v) => <option key={v}>{v}</option>)}</select></label>
      <button disabled={saving}>{saving ? 'Saving…' : 'Save content'}</button><p className="notice" role="status">{message}</p>
    </form>
    <section className="grid product-list">{items.map((entry) => <article className="card product-row" key={entry.id}><div className="row-between"><span className="badge">{entry.status}</span><span>{entry.channel}</span></div><h2>{entry.title}</h2><p>{entry.body.slice(0, 180)}{entry.body.length > 180 ? '…' : ''}</p><button type="button" className="button-secondary" onClick={() => { setItem(entry); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button></article>)}</section>
  </div>;
}
