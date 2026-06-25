# Deploy Kunta Naturals OS v2 Live Backend

## Safety position

Do not attach this app to the public root domain until CI passes and Supabase is connected. Deploy it as a private admin/backend app first.

Recommended URL pattern:

- Public site: https://kuntanaturals.com
- Admin app: https://admin.kuntanaturals.com or a private Vercel preview URL

## Required services

- Vercel for the Next.js app
- Supabase for auth, database, and storage
- Optional Shopify for checkout/store operations
- Optional Amazon Associates for affiliate links

## Deployment steps

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create a private storage bucket for product media.
4. Create the owner admin user in Supabase Auth.
5. Create a Vercel project from this GitHub repository.
6. Set the Vercel root directory to `kunta-os-v2`.
7. Add environment variables from `env.example`.
8. Deploy the app.
9. Confirm login page loads.
10. Wire real auth actions and protected middleware before using real business data.

## Do not store in GitHub

- Supabase service role key
- Amazon credentials
- Shopify access tokens
- Customer data
- Private partner agreements
- Supplier invoices

## Product model rule

Kunta Naturals should not store, pack, ship, or deliver physical products.

Allowed physical product models:

1. Amazon Associates links.
2. Shopify Collective suppliers.
3. Print-on-demand products.
4. Private-label supplier fulfillment.
5. Partner store referral links.

## Branded product rule

A product can carry Kunta Naturals branding only if:

- Supplier allows private label or custom branding.
- Kunta Naturals does not need to store or ship it.
- Margin is high enough after fulfillment and returns.
- Quality sample is approved first.
- Product fits cleanse, polish, moisturize, scent, or reset.

## First product focus

Start with low-risk non-medical ritual goods:

- Cotton towels
- Robes
- Shower wraps
- Tote bags
- Bathroom shelf organizers
- Ritual cards
- Journals
- Luffa/body-care tools through affiliate links
- Body oils and skincare only after supplier and claim review

## Avoid first

- Supplements
- Medical claims
- Complex skincare formulas
- Anything with high return or allergy risk
- Products needing your own shipping or storage
