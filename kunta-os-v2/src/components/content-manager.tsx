'use client';

import { FormEvent, useEffect, useState } from 'react';

type ContentItem = { id?: string; title: string; channel: 'Site'|'Email'|'Instagram'|'TikTok'|'YouTube Shorts'|'Pinterest'|'Facebook'|'Blog'; body: string; call_to_action: string | null; status: 'draft'|'review'|'approved'|'published'|'archived'; scheduled_for: string | null; campaign: string; content_format: 'Post'|'Carousel'|'Story'|'Reel'|'Short video'|'Long video'|'Article'|'Email'; media_url: string | null; publication_url: string | null; publish_status: 'not_scheduled'|'scheduled'|'published'|'failed'; published_at: string | null; updated_at?: string };
const blank: ContentItem = { title: '', channel: 'Site', body: '', call_to_action: '', status: 'draft', scheduled_for: null, campaign: '', content_format: 'Post', media_url: '', publication_url: '', publish_status: 'not_scheduled', published_at: null };
function errorMessage(value: unknown, fallback: string) { return value instanceof Error ? value.message : fallback; }

export function ContentManager() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [item, setItem] = useState<ContentItem>(blank);
  const [message, setMessage] = useState('Loading content…');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  async function load() {
    try {
      const response = await fetch('/api/admin/content', { cache: 'no-store' });
      if (response.status === 401 || response.status === 403) { window.location.href = '/login?next=%2Fcontent'; return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load content.');
      setItems(data); setMessage(`${data.length} content items loaded.`);
    } catch (error) { setMessage(errorMessage(error, 'Could not load content. Check your connection and try again.')); }
  }
  useEffect(() => { void load(); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('Saving…');
    try {
      const response = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (response.status === 401 || response.status === 403) { window.location.href = '/login?next=%2Fcontent'; return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save content.');
      setItem(data); await load(); setMessage('Saved. Publishing remains an explicit owner decision.');
    } catch (error) { setMessage(errorMessage(error, 'Could not save content. Your work is preserved; try again.')); }
    finally { setSaving(false); }
  }
  return <div className="admin-layout">
    <form className="card form-grid sticky-editor" onSubmit={save}>
      <div className="row-between"><div><p className="eyebrow">Editor</p><h2>{item.id ? 'Edit content' : 'New content'}</h2></div><button type="button" className="button-secondary" onClick={() => setItem(blank)}>New</button></div>
      <label>Title<input className="input" required value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} /></label>
      <div className="two-field"><label>Channel<select className="input" value={item.channel} onChange={(e) => setItem({ ...item, channel: e.target.value as ContentItem['channel'] })}>{['Site','Email','Instagram','TikTok','YouTube Shorts','Pinterest','Facebook','Blog'].map((v) => <option key={v}>{v}</option>)}</select></label><label>Format<select className="input" value={item.content_format} onChange={(e) => setItem({ ...item, content_format: e.target.value as ContentItem['content_format'] })}>{['Post','Carousel','Story','Reel','Short video','Long video','Article','Email'].map((v) => <option key={v}>{v}</option>)}</select></label></div>
      <label>Campaign<input className="input" value={item.campaign} onChange={(e) => setItem({ ...item, campaign: e.target.value })} placeholder="Example: 5-Day Ritual Launch" /></label>
      <label>Body<textarea className="input" required minLength={10} rows={9} value={item.body} onChange={(e) => setItem({ ...item, body: e.target.value })} /></label>
      <label>Call to action<input className="input" value={item.call_to_action || ''} onChange={(e) => setItem({ ...item, call_to_action: e.target.value })} /></label>
      <div className="two-field"><label>Editorial status<select className="input" value={item.status} onChange={(e) => setItem({ ...item, status: e.target.value as ContentItem['status'] })}>{['draft','review','approved','published','archived'].map((v) => <option key={v}>{v}</option>)}</select></label><label>Publishing status<select className="input" value={item.publish_status} onChange={(e) => setItem({ ...item, publish_status: e.target.value as ContentItem['publish_status'] })}><option value="not_scheduled">Not scheduled</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="failed">Failed / needs attention</option></select></label></div>
      <label>Schedule for<input className="input" type="datetime-local" value={item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : ''} onChange={(e) => setItem({ ...item, scheduled_for: e.target.value ? new Date(e.target.value).toISOString() : null })} /><small>This records publishing intent; it does not auto-post to external channels.</small></label>
      <label>Media URL<input className="input" value={item.media_url || ''} onChange={(e) => setItem({ ...item, media_url: e.target.value })} placeholder="Use a URL from Media" /></label>
      <label>Live publication URL<input className="input" type="url" value={item.publication_url || ''} onChange={(e) => setItem({ ...item, publication_url: e.target.value })} placeholder="https://instagram.com/p/…" /><small>Required when a social item is marked Published. This proves what actually went live.</small></label>
      <button disabled={saving}>{saving ? 'Saving…' : 'Save content'}</button><p className="notice" role="status">{message}</p>
    </form>
    <section><div className="content-toolbar"><strong>{items.length} content items</strong><label>Filter<span className="sr-only"> content</span><select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="failed">Needs attention</option><option value="review">In review</option></select></label></div><div className="grid product-list">{items.length === 0 && <div className="card empty-state"><h2>No content yet</h2><p>Create a draft, send it through review, then publish only after approval.</p></div>}{items.filter((entry) => filter === 'all' || entry.publish_status === filter || entry.status === filter).map((entry) => <article className="card product-row" key={entry.id}><div className="row-between"><span className="badge">{entry.status}</span><span>{entry.channel} · {entry.content_format}</span></div><h2>{entry.title}</h2>{entry.campaign && <p><strong>Campaign:</strong> {entry.campaign}</p>}<p>{entry.body.slice(0, 180)}{entry.body.length > 180 ? '…' : ''}</p><p className={entry.publish_status === 'failed' ? 'readiness waiting' : 'readiness ready'}>{entry.publish_status.replace('_', ' ')}</p>{entry.scheduled_for && <p><strong>Planned:</strong> {new Date(entry.scheduled_for).toLocaleString()}</p>}{entry.publication_url && <p><a href={entry.publication_url} target="_blank" rel="noreferrer">Open live post</a></p>}<button type="button" className="button-secondary" onClick={() => { setItem({ ...blank, ...entry }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button></article>)}</div></section>
  </div>;
}
