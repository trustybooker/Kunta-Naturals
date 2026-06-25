# Kunta Naturals OS v2

Kunta Naturals OS v2 is the private operating system for the brand. It is designed to keep the public site simple while giving the owner a secure backend for products, media, Amazon affiliate picks, custom products, digital products, content, approvals, and analytics.

## Core idea

Kunta Naturals is not a random product store. It is a belief-driven ritual commerce brand.

Public promise:

> Stop buying random self-care products. Build one simple natural ritual that fits your body, scent, hair, and lifestyle.

Private operating model:

- Own the brand, domain, audience, email list, digital products, and ritual framework.
- Curate physical products through Amazon affiliate links, partner stores, or Shopify products.
- Launch branded physical products only when demand is proven.
- Keep marketing proof, positioning, and automation private.

## What OS v2 includes

- Next.js app scaffold
- Supabase-ready auth and database structure
- Product manager data model
- Media library data model
- Amazon affiliate product workflow
- Digital product workflow
- Custom product workflow
- Content idea and approval queue
- Compliance guardrails
- Analytics event model
- Brand doctrine
- Marketing doctrine
- Launch checklist

## Public vs private separation

Public site should show:

- Belief
- Pain
- Ritual solution
- Quiz
- Guide
- Store picks
- Email capture

Private OS should handle:

- Strategy
- Product sourcing
- Affiliate links
- Media creation
- Pricing
- Compliance review
- Content calendar
- Analytics
- Publishing approvals

## Recommended deployment

Phase 1: keep GitHub Pages live as the public front door.
Phase 2: deploy this OS v2 app to Vercel.
Phase 3: connect Supabase for auth, database, and storage.
Phase 4: connect Shopify, Stripe, Amazon affiliate links, and email automation.

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://kuntanaturals.com
```

Do not commit secret values.

## Owner rule

The logo and brand identity are locked. Any future images, products, pages, emails, and ads must fit the Kunta Naturals doctrine: Pure. Rooted. Real.
