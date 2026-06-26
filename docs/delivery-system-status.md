# Kunta Naturals Delivery System Status

## What is now set up

### Google Drive

Private owner folders were created under the connected Google Drive account:

- Kunta Naturals Products
- Digital Product Delivery
- Paid Product Masters - Private
- Free Product Delivery

The branded digital product ZIP was uploaded to the private paid masters folder as the source master file. It is not public.

### Free products

The public site has free delivery pages that users can open, print, or save:

- `/downloads/free-3-minute-guide.html`
- `/downloads/starter-checklist.html`
- `/downloads/5-day-natural-ritual-course.html`
- `/free-products.html`

### Paid products

The OS v2 backend now has the delivery foundation:

- product catalog
- Stripe checkout creation route
- Stripe webhook route
- order records
- delivery token records
- signed delivery token helpers
- paid delivery claim route
- protected paid download route
- success page
- secure access page
- Supabase storage path migration

## How paid delivery works

1. Customer selects a paid digital product.
2. OS v2 creates a Stripe Checkout session from trusted server-side product data.
3. Stripe sends payment completion to the webhook.
4. OS v2 records the order.
5. OS v2 creates a signed delivery token.
6. Customer lands on the delivery success page.
7. OS v2 validates payment and issues a limited delivery link.
8. The download endpoint creates a short-lived Supabase Storage signed URL.
9. Download usage is logged.

## What must be connected before paid delivery is live

- Deploy `kunta-os-v2` to Vercel.
- Run `kunta-os-v2/supabase/delivery-schema.sql`.
- Run `kunta-os-v2/supabase/delivery-storage-paths.sql`.
- Create a private Supabase Storage bucket named `digital-products`.
- Upload paid files to the paths listed in `delivery-storage-paths.sql`.
- Add Vercel environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `DELIVERY_TOKEN_SECRET`
  - `SUPABASE_DELIVERY_BUCKET=digital-products`

## Public repo safety

Paid PDF/ZIP files are intentionally not stored in the public GitHub Pages site. They must be kept in private Drive, private Supabase Storage, or a payment provider delivery system.
