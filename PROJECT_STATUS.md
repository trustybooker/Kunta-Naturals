# Kunta Naturals Launch Status

Last verified: 2026-08-18

## Mandatory workspace reminder

- `owner_access_completed: false`
- Until this value is changed to `true`, remind the owner at the beginning of every Kunta Naturals work session to finish first-time owner access at https://kunta-naturals-os.vercel.app/login.
- Approved owner email: `fifynow@gmail.com`.
- Never request, store, or transmit the owner's password.

## Integration operating preference

- For Kunta Naturals integrations, use this order by default: direct connector, MCP, Cloud Browser, then an unavoidable manual step only when consent, identity, billing, payment details, or secret creation requires the owner.
- Automate reversible, non-sensitive setup and verification work whenever an authenticated connector or browser session is available.
- Never ask the owner to paste passwords, one-time codes, API keys, card details, or other secrets into chat.
- Pause at the exact point of any consequential authorization or financial action and request confirmation with the target and effect clearly stated.

## Verified complete

- Production storefront and Vercel backend deployed from `main`.
- Supabase database, Auth integration, catalog, analytics, audit logging, RLS, and storage initialized.
- Live catalog returns nine active products.
- GitHub and Vercel production checks passed.
- Production dependency audit reports zero known vulnerabilities.

## Open launch gates

- Owner must create and confirm Supabase Auth access.
- Stripe must be connected and tested before any product is marked `live`.
- Resend must be connected and its sending domain verified before transactional or marketing email is enabled.
- Paid product files must be uploaded to the private `digital-products` bucket and tested before checkout activation.

## Safety rule

Paid products remain in launch-access mode until checkout, webhook, email, private delivery, refund handling, and a real low-value test purchase all pass end to end.
