import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { createDeliveryToken, hashDeliveryToken } from '@/lib/delivery-token';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing checkout session.' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 501 });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment is not complete.' }, { status: 402 });
  }

  const productId = session.metadata?.productId;
  if (!productId) {
    return NextResponse.json({ error: 'Missing product metadata.' }, { status: 400 });
  }

  const customerEmail = session.customer_details?.email || session.customer_email || null;
  const supabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        customer_email: customerEmail,
        product_id: productId,
        amount_total: session.amount_total || 0,
        currency: (session.currency || 'usd').toUpperCase(),
        status: 'paid'
      },
      { onConflict: 'stripe_session_id' }
    )
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Could not save order.' }, { status: 500 });
  }

  const token = createDeliveryToken(session.id, productId);
  const tokenHash = hashDeliveryToken(token);

  await supabase.from('delivery_tokens').upsert(
    {
      order_id: order.id,
      product_id: productId,
      token_hash: tokenHash,
      customer_email: customerEmail
    },
    { onConflict: 'token_hash' }
  );

  return NextResponse.json({
    productId,
    deliveryUrl: `/api/delivery/download?token=${encodeURIComponent(token)}`,
    accessPage: `/delivery/access?token=${encodeURIComponent(token)}`
  });
}
