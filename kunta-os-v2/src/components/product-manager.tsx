'use client';

import { FormEvent, useEffect, useState } from 'react';

type Product = {
  id: string; name: string; slug: string; category: string; ritual_type: string; audience: string;
  product_type: 'digital' | 'physical' | 'bundle' | 'affiliate'; short_description: string; description: string;
  price: number; currency: string; image_url: string; detail_url: string;
  checkout_status: 'free_public' | 'pending_provider' | 'pending_supplier' | 'pending_partner' | 'live';
  fulfillment_model: string; tags: string[]; status: 'draft' | 'review' | 'active' | 'archived'; sort_order: number;
};

const empty: Product = { id: '', name: '', slug: '', category: 'Digital Product', ritual_type: 'Starter Ritual', audience: 'Adults', product_type: 'digital', short_description: '', description: '', price: 0, currency: 'USD', image_url: '', detail_url: '', checkout_status: 'pending_provider', fulfillment_model: 'owned_digital_private_delivery_pending', tags: [], status: 'draft', sort_order: 100 };

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [current, setCurrent] = useState<Product>(empty);
  const [status, setStatus] = useState('Loading products…');
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch('/api/admin/products', { cache: 'no-store' });
    if (response.status === 401) { window.location.href = '/login'; return; }
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || 'Could not load products.'); return; }
    setProducts(data);
    setStatus(`${data.length} products loaded.`);
  }
  useEffect(() => { void load(); }, []);

  function set<K extends keyof Product>(key: K, value: Product[K]) { setCurrent((item) => ({ ...item, [key]: value })); }
  function startNew() { setCurrent({ ...empty, sort_order: products.length * 10 + 10 }); setStatus('Creating a new draft.'); }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setStatus('Saving…');
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current) });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) { setStatus(data.error || 'Could not save product.'); return; }
    setStatus('Saved. Public catalog updates within about one minute when status is Active.');
    setCurrent(data); await load();
  }

  return <div className="admin-layout">
    <form className="card form-grid sticky-editor" onSubmit={save}>
      <div className="row-between"><div><p className="eyebrow">Editor</p><h2>{current.id ? 'Edit product' : 'New product'}</h2></div><button type="button" className="button-secondary" onClick={startNew}>New</button></div>
      <label>ID<input className="input" value={current.id} onChange={(e) => set('id', e.target.value)} required pattern="[a-z0-9-]+" /></label>
      <label>Name<input className="input" value={current.name} onChange={(e) => set('name', e.target.value)} required /></label>
      <label>Slug<input className="input" value={current.slug} onChange={(e) => set('slug', e.target.value)} required pattern="[a-z0-9-]+" /></label>
      <div className="two-field"><label>Type<select className="input" value={current.product_type} onChange={(e) => set('product_type', e.target.value as Product['product_type'])}><option value="digital">Digital</option><option value="bundle">Bundle</option><option value="physical">Physical</option><option value="affiliate">Affiliate</option></select></label><label>Status<select className="input" value={current.status} onChange={(e) => set('status', e.target.value as Product['status'])}><option value="draft">Draft</option><option value="review">Review</option><option value="active">Active</option><option value="archived">Archived</option></select></label></div>
      <div className="two-field"><label>Price<input className="input" type="number" min="0" step="0.01" value={current.price} onChange={(e) => set('price', Number(e.target.value))} /></label><label>Sort order<input className="input" type="number" min="0" value={current.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} /></label></div>
      <label>Short description<textarea className="input" rows={3} value={current.short_description} onChange={(e) => set('short_description', e.target.value)} required /></label>
      <label>Full description<textarea className="input" rows={5} value={current.description} onChange={(e) => set('description', e.target.value)} /></label>
      <label>Image URL<input className="input" value={current.image_url} onChange={(e) => set('image_url', e.target.value)} /></label>
      <label>Detail URL<input className="input" value={current.detail_url} onChange={(e) => set('detail_url', e.target.value)} /></label>
      <div className="two-field"><label>Category<input className="input" value={current.category} onChange={(e) => set('category', e.target.value)} /></label><label>Ritual type<input className="input" value={current.ritual_type} onChange={(e) => set('ritual_type', e.target.value)} /></label></div>
      <label>Checkout status<select className="input" value={current.checkout_status} onChange={(e) => set('checkout_status', e.target.value as Product['checkout_status'])}><option value="free_public">Free public</option><option value="pending_provider">Provider pending</option><option value="pending_supplier">Supplier pending</option><option value="pending_partner">Partner pending</option><option value="live">Live</option></select></label>
      <label>Tags<input className="input" value={current.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} /></label>
      <button disabled={saving} type="submit">{saving ? 'Saving…' : 'Save product'}</button>
      <p className="notice" role="status">{status}</p>
    </form>
    <section className="grid product-list">
      {products.map((product) => <article className="card product-row" key={product.id}>
        <div className="row-between"><span className="badge">{product.status}</span><strong>${Number(product.price).toFixed(2)}</strong></div>
        <h2>{product.name}</h2><p>{product.short_description}</p><p><strong>{product.product_type}</strong> · {product.checkout_status}</p>
        <p className={product.checkout_status === 'free_public' || product.checkout_status === 'live' ? 'readiness ready' : 'readiness waiting'}>
          {product.checkout_status === 'free_public' ? 'Ready now · free delivery verified' : product.checkout_status === 'live' ? 'Live · monitor checkout and delivery' : 'Early access only · payment remains disabled'}
        </p>
        <button type="button" className="button-secondary" onClick={() => { setCurrent(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
      </article>)}
    </section>
  </div>;
}
