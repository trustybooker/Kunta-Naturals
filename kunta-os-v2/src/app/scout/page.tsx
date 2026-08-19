import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { ProductScout } from '@/components/product-scout';
import { requireAdmin } from '@/lib/admin-auth';
export default async function ScoutPage(){if(!await requireAdmin())redirect('/login');return <main className="shell"><AppHeader/><section className="card" style={{marginBottom:'1rem'}}><p className="eyebrow">Product Scout</p><h1>Find value, not catalog clutter.</h1><p>Approved network feeds are filtered against Kunta Naturals categories, safety rules, imagery, pricing, and link quality. Nothing reaches the public store until you review it here and activate the prepared product draft.</p></section><ProductScout/></main>}
