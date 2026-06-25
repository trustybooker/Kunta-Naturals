import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kunta Naturals OS v2',
  description: 'Private operating system for Kunta Naturals products, media, content, approvals, and analytics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
