# Kunta Naturals Email Capture + Checkout Completion

This repo pass wires the public Kunta Naturals site to a server-side Kunta OS v2 backend for email capture, Resend delivery, Stripe Checkout, Supabase lead storage, and protected paid delivery.

## What is completed in code

- Static email signup form on `site/email-signup.html`.
- Static lead-capture script at `site/lead-capture.js`.
- Server API route at `kunta-os-v2/src/app/api/leads/subscribe/route.ts`.
- Resend email delivery through `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- Admin lead notification through `KUNTA_ADMIN_EMAIL`.
- Supabase lead table schema at `kunta-os-v2/supabase/lead-capture-schema.sql`.
- Static checkout page on `site/checkout.html`.
- Static checkout script at `site/checkout.js`.
- Public-site-to-backend CORS support for lead capture and checkout.
- Stripe Checkout route points success to the backend delivery success page and cancel back to the public site.

## Required account setup before live revenue

### Resend

1. Verify the Kunta Naturals sending domain in Resend.
2. Create a Resend API key.
3. Add these environment variables to the deployed Kunta OS v2 backend:

```text
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Kunta Naturals <hello@kuntanaturals.com>
RESEND_REPLY_TO_EMAIL=...
KUNTA_ADMIN_EMAIL=...
KUNTA_FREE_PRODUCTS_URL=https://kuntanaturals.com/free-products.html
```

### Supabase

1. Run `kunta-os-v2/supabase/lead-capture-schema.sql`.
2. Run `kunta-os-v2/supabase/delivery-schema.sql`.
3. Run `kunta-os-v2/supabase/delivery-storage-paths.sql`.
4. Create a private storage bucket named `digital-products`.
5. Upload paid files only to protected private storage paths, not to the public `site/` folder.

### Stripe

1. Add `STRIPE_SECRET_KEY` to the deployed backend.
2. Add `STRIPE_WEBHOOK_SECRET` after creating the webhook endpoint.
3. Add a strong unique `DELIVERY_TOKEN_SECRET`.
4. Create a Stripe webhook endpoint pointing to:

```text
https://YOUR-KUNTA-OS-V2-BACKEND/api/stripe/webhook
```

5. Subscribe to checkout completion events needed by the existing webhook route.

### Public site config

After the backend is deployed, update `site/data/site-config.json` with real URLs:

```json
{
  "backend_api_base_url": "https://YOUR-KUNTA-OS-V2-BACKEND",
  "lead_capture_api_url": "https://YOUR-KUNTA-OS-V2-BACKEND/api/leads/subscribe",
  "email_capture_url": "https://YOUR-KUNTA-OS-V2-BACKEND/api/leads/subscribe",
  "checkout_api_url": "https://YOUR-KUNTA-OS-V2-BACKEND/api/checkout/create"
}
```

## Compliance guardrails

- No medical advice.
- No cure claims.
- No guaranteed outcomes.
- No fake testimonials.
- No fake before/after content.
- Paid PDFs and ZIPs must remain private.
- Stripe handles payment details; the static site must not collect card details.
- Email capture requires consent before sending follow-up email.

## Remaining launch gate

The code is wired, but live capture/checkout requires deployed backend URLs and account secrets. The public GitHub Pages site cannot safely hold Stripe, Supabase service role, or Resend secrets.
