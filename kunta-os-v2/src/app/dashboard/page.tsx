import { AppHeader } from '@/components/app-header';
import { sampleProducts, workflowColumns } from '@/lib/products';

export default function DashboardPage() {
  const active = sampleProducts.filter((product) => product.status === 'active').length;
  const draft = sampleProducts.filter((product) => product.status === 'draft').length;
  const affiliate = sampleProducts.filter((product) => product.productType === 'affiliate').length;
  const digital = sampleProducts.filter((product) => product.productType === 'digital').length;

  return (
    <main className="shell">
      <AppHeader />
      <section className="grid dashboard-grid">
        <article className="card"><span className="stat">{sampleProducts.length}</span><p>Total products</p></article>
        <article className="card"><span className="stat">{active}</span><p>Active</p></article>
        <article className="card"><span className="stat">{draft}</span><p>Draft</p></article>
        <article className="card"><span className="stat">{affiliate + digital}</span><p>Commerce assets</p></article>
      </section>
      <section className="grid two-grid" style={{ marginTop: '1rem' }}>
        <article className="card">
          <p className="eyebrow">Brand engine</p>
          <h2>Belief, pain, remedy, solution, dream, future</h2>
          <p>The OS keeps every product and content asset aligned to the ritual promise.</p>
        </article>
        <article className="card">
          <p className="eyebrow">Workflow</p>
          <h2>Approval before publishing</h2>
          <p>Nothing should go live without product fit, image fit, disclosure, link check, price check, and brand review.</p>
        </article>
      </section>
      <section className="grid workflow" style={{ marginTop: '1rem' }}>
        {workflowColumns.map((column) => (
          <article className="card" key={column.id}>
            <span className="badge">{column.title}</span>
            <p>{column.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
