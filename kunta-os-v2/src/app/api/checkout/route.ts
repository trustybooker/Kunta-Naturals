import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const checkoutRequestSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  priceCents: z.number().int().min(50),
  successPath: z.string().default('/thank-you'),
  cancelPath: z.string().default('/products')
});

export async function POST(request: Request) {
  const parsed = checkoutRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 501 });
  }

  const stripe = new Stripe(secretKey);
  const { productId, productName, priceCents, successPath, cancelPath } = parsed.data;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: priceCents,
          product_data: {
            name: productName,
            metadata: { productId }
          }
        }
      }
    ],
    success_url: `${siteUrl}${successPath}?product=${encodeURIComponent(productId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${cancelPath}`,
    metadata: { productId }
  });

  return NextResponse.json({ url: session.url });
}
