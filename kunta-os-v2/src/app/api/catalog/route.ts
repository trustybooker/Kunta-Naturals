import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173').split(',').map((value) => value.trim());
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('catalog_products')
      .select('id,name,slug,category,ritual_type,audience,product_type,short_description,description,price,currency,image_url,detail_url,checkout_status,fulfillment_model,tags,status,sort_order')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || [], { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'Access-Control-Allow-Origin': corsOrigin, Vary: 'Origin' } });
  } catch {
    return NextResponse.json({ error: 'Catalog is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
