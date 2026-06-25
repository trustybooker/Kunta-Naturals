import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        <img src="/assets/logo-mark.svg" alt="" />
        <span>Kunta Naturals OS</span>
      </Link>
      <nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/content">Content</Link>
        <Link href="/approvals">Approvals</Link>
        <Link href="/analytics">Analytics</Link>
      </nav>
    </header>
  );
}
