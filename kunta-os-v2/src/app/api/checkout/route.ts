import { NextResponse } from 'next/server';
/** Retired: this route previously trusted client-supplied names and prices. */
export async function POST() {
  return NextResponse.json(
    { error: 'This checkout endpoint has been retired. Use /api/checkout/create.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Checkout requests must use the production checkout flow.' },
    { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } }
  );
}
