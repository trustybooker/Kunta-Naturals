import { AppHeader } from '@/components/app-header';
import { sampleProducts } from '@/lib/products';

export default function ProductsPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Products</p>
        <h1>Product command center</h1>
        <p>Manage digital products, Amazon affiliate picks, partner products, custom products, images, prices, links, and approval status.</p>
      </section>
      <section className="grid two-grid">
        <form className="card form-grid">
          <h2>Add product</h2>
          <label>Name<input className="input" placeholder="Natural Luffa Starter Pick" /></label>
          <label>Type<select className="input"><option>Affiliate</option><option>Digital</option><option>Physical</option><option>Bundle</option></select></label>
          <label>Ritual<select className="input"><option>Glow</option><option>Fresh</option><option>Scent</option><option>Scalp</option><option>Calm</option><option>Mens grooming</option><option>Family reset</option></select></label>
          <label>Price<input className="input" placeholder="$0.00 or controlled by Amazon" /></label>
          <label>Image URL<input className="input" placeholder="Product image or media URL" /></label>
          <label>Amazon ASIN<input className="input" placeholder="Add ASIN when ready" /></label>
          <label>Checkout or affiliate link<input className="input" placeholder="Amazon, Shopify, Stripe, or custom link" /></label>
          <label>Description<textarea className="input" rows={4} placeholder="Public product description" /></label>
          <label>Review notes<textarea className="input" rows={3} placeholder="Brand, claim, disclosure, and link notes" /></label>
          <button type="button">Save draft</button>
        </form>
        <section className="grid">
          {sampleProducts.map((product) => (
            <article className="card" key={product.id}>
              <span className="badge">{product.status}</span>
              <h2>{product.name}</h2>
              <p>{product.shortDescription}</p>
              <p><strong>Type:</strong> {product.productType}</p>
              <p><strong>Ritual:</strong> {product.ritualType}</p>
              <p><strong>Notes:</strong> {product.complianceNotes}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
