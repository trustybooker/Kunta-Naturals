import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getDigitalProduct } from '@/lib/digital-products';

const requestSchema = z.object({
  productId: z.string().min(1),
  customerEmail: z.string().email().optional()
});

function allowedOrigins() {
  return (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = allowedOrigins();
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    Vary: 'Origin',
    'Cache-Control': 'no-store'
  };
}

function json(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins().includes(origin)) {
    return json(request, { error: 'Origin is not allowed.' }, 403);
  }
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json(request, { error: 'Invalid JSON request body.' }, 400);
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return json(request, { error: 'Invalid checkout request.' }, 400);
  }

  const product = getDigitalProduct(parsed.data.productId);

  if (!product) {
    return json(request, { error: 'Unknown product.' }, 404);
  }

  if (product.priceCents <= 0 && product.publicDeliveryPath) {
    return json(request, { url: product.publicDeliveryPath, free: true });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';
  const backendUrl = process.env.KUNTA_BACKEND_PUBLIC_URL || publicSiteUrl;

  if (!secretKey) {
    return json(request, { error: 'Stripe is not configured yet.' }, 501);
  }

  const stripe = new Stripe(secretKey);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
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
    success_url: `${backendUrl}/delivery/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicSiteUrl}/digital-products.html`,
    metadata: {
      productId: product.id,
      productName: product.name,
      deliveryMode: product.deliveryMode
    }
    });
  } catch {
    return json(request, { error: 'Secure checkout is temporarily unavailable.' }, 503);
  }

  if (!session.url) {
    return json(request, { error: 'Checkout session did not return a URL.' }, 500);
  }

  return json(request, { url: session.url });
}
