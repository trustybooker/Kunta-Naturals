'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/dashboard', 'Dashboard'], ['/products', 'Products'], ['/content', 'Content'],
  ['/media', 'Media'], ['/approvals', 'Approvals'], ['/analytics', 'Analytics'], ['/playbook', 'Playbook']
] as const;

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="header">
      <Link href="/dashboard" className="logo">
        <img src="/assets/logo-mark.svg" alt="" />
        <span>Kunta Naturals OS</span>
      </Link>
      <nav className="admin-nav" aria-label="Kunta Naturals OS">
        {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
        <form action="/api/auth/logout" method="post"><button className="link-button" type="submit">Log out</button></form>
      </nav>
    </header>
  );
}
