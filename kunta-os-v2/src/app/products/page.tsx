import { AppHeader } from '@/components/app-header';
import { ProductManager } from '@/components/product-manager';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

export default async function ProductsPage() {
  if (!await requireAdmin()) redirect('/login');
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Products</p>
        <h1>Product command center</h1>
        <p>Manage digital products, Amazon affiliate picks, partner products, custom products, images, prices, links, and approval status.</p>
      </section>
      <ProductManager />
    </main>
  );
}
