import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { approvedFeedUrl, feedUrlsFromList, normalizeFeed, scoreProduct } from '@/lib/product-scout';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const configured = (process.env.AWIN_PRODUCT_FEED_URLS || '').split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
  if (configured.some((url) => !approvedFeedUrl(url))) return NextResponse.json({ ok: false, error: 'Only official Awin and ProductServe feed URLs are accepted.', imported: 0 }, { status: 400 });
  const urls = [...configured];
  if (!urls.length) return NextResponse.json({ ok: false, error: 'AWIN_PRODUCT_FEED_URLS is not configured.', imported: 0 }, { status: 501 });
  const supabase = createSupabaseAdminClient(); let discovered = 0; const errors: string[] = [];
  for (let sourceIndex=0;sourceIndex<Math.min(urls.length,20);sourceIndex+=1) { const url=urls[sourceIndex];
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`feed returned ${response.status}`);
      if (!approvedFeedUrl(response.url)) throw new Error('feed redirected outside approved Awin domains');
      const length = Number(response.headers.get('content-length') || 0); if (length > 20_000_000) throw new Error('feed exceeds the 20 MB safety limit');
      const text=await response.text(); if(text.length>20_000_000)throw new Error('decompressed feed exceeds the 20 MB safety limit'); const listUrls=feedUrlsFromList(text); if(listUrls.length){for(const child of listUrls.slice(0,20-urls.length))if(!urls.includes(child))urls.push(child);continue;}
      const products = normalizeFeed(text); const ids=products.map((product)=>product.externalId); const existing=new Map<string,string>(); for(let offset=0;offset<ids.length;offset+=200){const{data}=await supabase.from('affiliate_product_candidates').select('external_id,status').eq('provider','awin').in('external_id',ids.slice(offset,offset+200));for(const item of data||[])existing.set(item.external_id,item.status);}
      for (const product of products) { const scored = scoreProduct(product); if (scored.score < 45) continue; const prior=existing.get(product.externalId); if(prior==='rejected'||prior==='imported')continue; const { error } = await supabase.from('affiliate_product_candidates').upsert({ provider: 'awin', external_id: product.externalId, merchant_name: product.merchant, name: product.name, description: product.description, category: product.category, price: product.price, currency: product.currency.slice(0,3).toUpperCase(), image_url: product.imageUrl, affiliate_url: product.affiliateUrl, score: scored.score, score_reasons: scored.reasons, status:prior||'pending', raw: product.raw, last_seen_at: new Date().toISOString() }, { onConflict: 'provider,external_id', ignoreDuplicates: false }); if (!error) discovered += 1; }
    } catch (error) { errors.push(error instanceof Error ? error.message : 'Feed sync failed.'); }
  }
  return NextResponse.json({ ok: errors.length === 0, discovered, errors });
}
