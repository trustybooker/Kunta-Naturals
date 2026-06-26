import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { hashDeliveryToken, parseDeliveryToken } from '@/lib/delivery-token';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'Missing delivery token.' }, { status: 400 });

  const parsed = parseDeliveryToken(token);
  if (!parsed) return NextResponse.json({ error: 'Invalid delivery token.' }, { status: 403 });

  const supabase = createSupabaseAdminClient();
  const tokenHash = hashDeliveryToken(token);

  const { data: deliveryToken } = await supabase
    .from('delivery_tokens')
    .select('id, product_id, customer_email, use_count, max_uses, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .single();

  if (!deliveryToken) return NextResponse.json({ error: 'Delivery token not found.' }, { status: 404 });
  if (deliveryToken.revoked_at) return NextResponse.json({ error: 'Delivery token is not active.' }, { status: 403 });
  if (new Date(deliveryToken.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'Delivery token expired.' }, { status: 403 });
  if (deliveryToken.use_count >= deliveryToken.max_uses) return NextResponse.json({ error: 'Download limit reached.' }, { status: 403 });

  const { data: product } = await supabase
    .from('digital_products')
    .select('id, name, protected_storage_path')
    .eq('id', deliveryToken.product_id)
    .single();

  if (!product?.protected_storage_path) return NextResponse.json({ error: 'Delivery file is not configured yet.' }, { status: 501 });

  const bucket = process.env.SUPABASE_DELIVERY_BUCKET || 'digital-products';
  const { data: signedUrl, error: signedUrlError } = await supabase.storage.from(bucket).createSignedUrl(product.protected_storage_path, 60 * 30);

  if (signedUrlError || !signedUrl?.signedUrl) return NextResponse.json({ error: 'Could not create secure download link.' }, { status: 500 });

  await supabase.from('delivery_tokens').update({ use_count: deliveryToken.use_count + 1 }).eq('id', deliveryToken.id);
  await supabase.from('download_events').insert({ delivery_token_id: deliveryToken.id, product_id: product.id, customer_email: deliveryToken.customer_email, event_name: 'download_link_created', user_agent: request.headers.get('user-agent') });

  return NextResponse.redirect(signedUrl.signedUrl, 302);
}
