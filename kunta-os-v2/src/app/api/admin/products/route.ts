import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

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
  const now = new Date().toISOString();
  const { data, error } = await context.supabase.from('catalog_products').upsert({ ...parsed.data, updated_at: now }, { onConflict: 'id' }).select().single();
  if (error) return NextResponse.json({ error: 'Could not save product.' }, { status: 500 });
  await context.supabase.from('admin_audit_log').insert({ actor_email: context.admin.email, action: 'product_upsert', entity_type: 'catalog_product', entity_id: parsed.data.id });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
