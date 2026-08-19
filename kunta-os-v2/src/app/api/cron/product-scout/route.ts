import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { normalizeFeed, scoreProduct } from '@/lib/product-scout';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const urls = (process.env.AWIN_PRODUCT_FEED_URLS || '').split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
  if (!urls.length) return NextResponse.json({ ok: false, error: 'AWIN_PRODUCT_FEED_URLS is not configured.', imported: 0 }, { status: 501 });
  const supabase = createSupabaseAdminClient(); let discovered = 0; const errors: string[] = [];
  for (const url of urls.slice(0, 10)) {
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`feed returned ${response.status}`);
      const length = Number(response.headers.get('content-length') || 0); if (length > 20_000_000) throw new Error('feed exceeds the 20 MB safety limit');
      const products = normalizeFeed(await response.text());
      for (const product of products) { const scored = scoreProduct(product); if (scored.score < 45) continue; const { error } = await supabase.from('affiliate_product_candidates').upsert({ provider: 'awin', external_id: product.externalId, merchant_name: product.merchant, name: product.name, description: product.description, category: product.category, price: product.price, currency: product.currency.slice(0,3).toUpperCase(), image_url: product.imageUrl, affiliate_url: product.affiliateUrl, score: scored.score, score_reasons: scored.reasons, raw: product.raw, last_seen_at: new Date().toISOString() }, { onConflict: 'provider,external_id', ignoreDuplicates: false }); if (!error) discovered += 1; }
    } catch (error) { errors.push(error instanceof Error ? error.message : 'Feed sync failed.'); }
  }
  return NextResponse.json({ ok: errors.length === 0, discovered, errors });
}
