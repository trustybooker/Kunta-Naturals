import { AppHeader } from '@/components/app-header';
import { MediaManager } from '@/components/media-manager';
export default function MediaPage() { return <main className="shell"><AppHeader /><section className="card" style={{ marginBottom: '1rem' }}><p className="eyebrow">Brand library</p><h1>Media</h1><p>Upload approved product and campaign imagery, then reuse its URL in product records.</p></section><MediaManager /></main>; }
