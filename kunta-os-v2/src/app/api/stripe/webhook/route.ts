import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 501 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const productId = session.metadata?.productId;

  if (!productId) {
    return NextResponse.json({ error: 'Missing product id.' }, { status: 400 });
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

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);

  await supabase.from('delivery_tokens').insert({
    order_id: order.id,
    product_id: productId,
    token_hash: tokenHash,
    customer_email: customerEmail
  });

  return NextResponse.json({ received: true });
}
