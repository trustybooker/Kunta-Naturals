import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getDigitalProduct } from '@/lib/digital-products';

const requestSchema = z.object({
  productId: z.string().min(1),
  customerEmail: z.string().email().optional()
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const product = getDigitalProduct(parsed.data.productId);

  if (!product) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 404 });
  }

  if (product.priceCents <= 0 && product.publicDeliveryPath) {
    return NextResponse.json({ url: product.publicDeliveryPath, free: true });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 501 });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: parsed.data.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            metadata: {
              productId: product.id,
              fulfillment: product.deliveryMode
            }
          }
        }
      }
    ],
    success_url: `${siteUrl}/delivery/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/digital-products.html`,
    metadata: {
      productId: product.id,
      productName: product.name,
      deliveryMode: product.deliveryMode
    }
  });

  return NextResponse.json({ url: session.url });
}
