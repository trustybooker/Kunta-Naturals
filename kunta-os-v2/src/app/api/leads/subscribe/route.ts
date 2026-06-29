import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const schema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().max(100).optional().default(''),
  product: z.string().trim().max(80).optional().default('free-guide'),
  source: z.string().trim().max(120).optional().default('website'),
  marketingConsent: z.boolean(),
  website: z.string().trim().max(100).optional().default('')
});

function origins() {
  return (process.env.LEAD_ALLOWED_ORIGINS || 'https://kuntanaturals.com,http://localhost:4173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function headers(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = origins();
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    Vary: 'Origin'
  };
}

function reply(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: headers(request) });
}

function publicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], subject, html })
  });

  if (!response.ok) throw new Error('Resend email failed.');
  return { sent: true };
}

function customerEmailHtml() {
  const site = publicSiteUrl();
  return `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#2e2119;max-width:620px;margin:0 auto;padding:24px;"><h1 style="font-family:Georgia,serif;">Kunta Naturals</h1><p>Hi,</p><p>Here are your free starter products. Use them to build a simple routine before buying more products.</p><ul><li><a href="${site}/downloads/free-3-minute-guide.html">3-Minute Natural Self-Care Guide</a></li><li><a href="${site}/downloads/starter-checklist.html">Natural Body-Care Starter Checklist</a></li><li><a href="${site}/downloads/5-day-natural-ritual-course.html">5-Day Natural Ritual Course</a></li></ul><p><a href="${site}/free-products.html">Open all free products</a></p><p style="font-size:13px;color:#536b45;">General self-care education only. No medical advice, cure claims, or guaranteed outcomes.</p></div>`;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: headers(request) });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply(request, { error: 'Invalid JSON request body.' }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return reply(request, { error: 'Enter a valid email and consent.' }, 400);
  const input = parsed.data;

  if (input.website) return reply(request, { ok: true, freeProductsUrl: `${publicSiteUrl()}/free-products.html` });
  if (!input.marketingConsent) return reply(request, { error: 'Consent is required before Kunta Naturals can email you.' }, 400);

  const email = input.email.trim().toLowerCase();

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('email_leads').upsert(
      {
        email,
        email_lower: email,
        name: input.name || null,
        product: input.product,
        source: input.source,
        marketing_consent: input.marketingConsent,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'email_lower' }
    );
    if (error) throw error;
  } catch {
    return reply(request, { error: 'Lead capture storage is not configured yet.' }, 501);
  }

  let emailSent = false;
  try {
    const result = await sendEmail(email, 'Your Kunta Naturals free ritual guide', customerEmailHtml());
    emailSent = result.sent;
    const adminEmail = process.env.KUNTA_ADMIN_EMAIL;
    if (adminEmail) await sendEmail(adminEmail, 'New Kunta Naturals lead', '<p>A new Kunta Naturals lead was captured in Supabase.</p>');
  } catch {
    emailSent = false;
  }

  return reply(request, { ok: true, emailSent, freeProductsUrl: `${publicSiteUrl()}/free-products.html` });
}
