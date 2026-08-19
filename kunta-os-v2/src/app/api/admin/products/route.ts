import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { reviewCopy } from '@/lib/compliance';

const productSchema = z.object({
  id: z.string().min(2).max(100),
  name: z.string().min(2).max(140),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string().max(100).default('Digital Product'),
  ritual_type: z.string().max(100).default('Starter Ritual'),
  audience: z.string().max(100).default('Adults'),
  product_type: z.enum(['digital', 'physical', 'bundle', 'affiliate']),
  short_description: z.string().min(10).max(260),
  description: z.string().max(4000).default(''),
  price: z.number().min(0).max(100000),
  currency: z.string().length(3).default('USD'),
  image_url: z.string().max(500),
  detail_url: z.string().max(500),
  affiliate_url: z.string().url().max(1000).or(z.literal('')).default(''),
  vendor_name: z.string().max(120).default(''),
  affiliate_disclosure: z.string().max(300).default(''),
  checkout_status: z.enum(['free_public', 'pending_provider', 'pending_supplier', 'pending_partner', 'live']),
  fulfillment_model: z.string().max(120),
  tags: z.array(z.string().max(40)).max(20).default([]),
  status: z.enum(['draft', 'review', 'active', 'archived']),
  sort_order: z.number().int().min(0).max(10000).default(100)
});

async function authorize() {
  const admin = await requireAdmin();
  return admin ? { admin, supabase: createSupabaseAdminClient() } : null;
}

export async function GET() {
  const context = await authorize();
  if (!context) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data, error } = await context.supabase.from('catalog_products').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: 'Could not load products.' }, { status: 500 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const context = await authorize();
  if (!context) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Product fields are invalid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const product = parsed.data;
  const copyReview = reviewCopy([product.name, product.short_description, product.description].join(' '));
  if (!copyReview.approved) {
    return NextResponse.json({ error: 'Remove unsupported claims before saving.', flags: copyReview.flags }, { status: 400 });
  }
  if (product.product_type === 'affiliate') {
    const affiliateGaps = [!product.affiliate_url ? 'a valid partner URL' : '', !product.vendor_name ? 'a vendor name' : '', !product.affiliate_disclosure ? 'an affiliate disclosure' : '', !product.image_url ? 'an approved image' : ''].filter(Boolean);
    if (affiliateGaps.length) return NextResponse.json({ error: `Affiliate products require ${affiliateGaps.join(', ')}.` }, { status: 400 });
  }
  if (product.product_type === 'physical' && product.checkout_status === 'live') {
    return NextResponse.json({ error: 'Direct physical checkout is not enabled because shipping, tax, returns, and supplier fulfillment are not connected. Use Affiliate for partner-fulfilled products or keep this item pending.' }, { status: 409 });
  }
  if (product.checkout_status === 'live' && product.product_type !== 'affiliate') {
    const launchGaps = [
      product.price <= 0 ? 'a paid price' : '',
      !product.image_url ? 'an approved product image' : '',
      !product.detail_url ? 'a product detail page' : '',
      product.fulfillment_model.includes('pending') ? 'verified fulfillment without a pending status' : ''
    ].filter(Boolean);
    if (launchGaps.length) {
      return NextResponse.json({ error: `Live checkout requires ${launchGaps.join(', ')}.` }, { status: 400 });
    }
  }
  const now = new Date().toISOString();
  const { data, error } = await context.supabase.from('catalog_products').upsert({ ...product, updated_at: now }, { onConflict: 'id' }).select().single();
  if (error) return NextResponse.json({ error: 'Could not save product.' }, { status: 500 });
  await context.supabase.from('admin_audit_log').insert({ actor_email: context.admin.email, action: 'product_upsert', entity_type: 'catalog_product', entity_id: parsed.data.id });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
