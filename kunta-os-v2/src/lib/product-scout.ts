export type FeedProduct = { externalId: string; merchant: string; name: string; description: string; category: string; price: number; currency: string; imageUrl: string; affiliateUrl: string; raw: Record<string, string> };

const positive = ['body care','body oil','body butter','body wash','soap','moisturizer','lotion','fragrance','scent','candle','bath','shower','grooming','scalp','hair oil','self care','self-care','wellness','towel','robe','organizer'];
const blocked = ['cure','treat disease','detox disease','weight loss','prescription','medical device','miracle','guaranteed results','bleach skin','whitening injection','adult product','weapon'];

export function scoreProduct(product: FeedProduct) {
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  const reasons: string[] = [];
  if (blocked.some((word) => text.includes(word))) return { score: 0, reasons: ['Blocked claim or category'] };
  const matches = positive.filter((word) => text.includes(word));
  if (!matches.length) return { score: 0, reasons: ['Outside the locked Kunta Naturals categories'] };
  let score = 20 + Math.min(35, matches.length * 9); reasons.push(`Brand fit: ${matches.slice(0, 3).join(', ')}`);
  if (product.imageUrl.startsWith('https://')) { score += 15; reasons.push('Secure product image'); }
  if (product.affiliateUrl.startsWith('https://')) { score += 15; reasons.push('Secure tracked destination'); }
  if (product.description.length >= 60) { score += 10; reasons.push('Useful source description'); }
  if (product.price > 0) { score += 5; reasons.push('Price supplied'); }
  return { score: Math.min(100, score), reasons };
}

export function parseCsv(input: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < input.length; i += 1) { const char = input[i]; if (char === '"') { if (quoted && input[i + 1] === '"') { cell += '"'; i += 1; } else quoted = !quoted; } else if (char === ',' && !quoted) { row.push(cell); cell = ''; } else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && input[i + 1] === '\n') i += 1; row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; } else cell += char; }
  row.push(cell); if (row.some(Boolean)) rows.push(row); return rows;
}

export function approvedFeedUrl(value: string) { try { const url = new URL(value); const host = url.hostname.toLowerCase(); return ['productdata.awin.com','datafeed.api.productserve.com'].includes(host) && ['http:','https:'].includes(url.protocol); } catch { return false; } }

export function feedUrlsFromList(csv: string) { const rows=parseCsv(csv); const headers=(rows.shift()||[]).map((h)=>h.trim().toLowerCase()); const index=headers.findIndex((h)=>h==='url'||h==='download url'); if(index<0)return []; return rows.map((row)=>row[index]?.trim()).filter((url):url is string=>Boolean(url)&&approvedFeedUrl(url)); }

export function normalizeFeed(csv: string): FeedProduct[] {
  const rows = parseCsv(csv); const headers = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  const pick = (raw: Record<string,string>, keys: string[]) => keys.map((key) => raw[key]).find(Boolean) || '';
  return rows.slice(0, 5000).map((values) => { const raw = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])); return { externalId: pick(raw,['aw_product_id','product_id','id','merchant_product_id']) || pick(raw,['aw_deep_link','product_url']), merchant: pick(raw,['merchant_name','advertiser_name','merchant']), name: pick(raw,['product_name','name','title']), description: pick(raw,['description','product_short_description','product_description']), category: pick(raw,['merchant_category','category_name','category']), price: Number(pick(raw,['search_price','price','store_price']).replace(/[^0-9.]/g,'')) || 0, currency: pick(raw,['currency','currency_code']) || 'USD', imageUrl: pick(raw,['merchant_image_url','aw_image_url','image_url','image']), affiliateUrl: pick(raw,['aw_deep_link','deeplink','affiliate_url','product_url']), raw }; }).filter((product) => product.externalId && product.name && product.affiliateUrl);
}
