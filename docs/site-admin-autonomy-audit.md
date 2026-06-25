# Kunta Naturals Site, Admin, and Autonomy Audit

## Current state

The current live site is a static GitHub Pages funnel. It is good for a fast public launch, brand validation, SEO indexing, and basic link-in-bio traffic. It is not yet a full ecommerce/admin application.

## What exists now

- Public homepage
- Logo, favicon, and brand identity assets
- Ritual quiz in browser JavaScript
- Digital offer cards
- Affiliate-ready product collection placeholders
- Compliance-safe copy
- GitHub Pages deployment
- Custom domain support

## What does not exist yet

- Secure admin login
- Logout
- Role-based dashboard
- Product image upload
- Media library
- Editable product descriptions in a dashboard
- Price editor
- Inventory manager
- Analytics dashboard
- Order management
- Customer accounts
- Secure database
- File storage
- Payment checkout integration
- Email automation integration

## Why admin/login/logout are not set up yet

The site was intentionally deployed first as static HTML on GitHub Pages so the domain, brand, and funnel could go live quickly with low cost and low technical risk. GitHub Pages does not run a private backend server, database, secure sessions, file uploads, or real admin authentication by itself.

A real admin system requires a backend or managed platform.

## Recommended next architecture

### Fastest safe path

Use Shopify for the product/store/admin layer and keep KuntaNaturals.com as the brand front door.

Best for:
- Products
- Images
- Media
- Product descriptions
- Prices
- Checkout
- Payments
- Discounts
- Inventory
- Order tracking
- Customer accounts
- Admin login/logout

### Best custom/autonomous path

Build Kunta Naturals OS as a web app with:

- Next.js frontend
- Supabase database
- Supabase Auth for login/logout
- Supabase Storage for images/media
- Stripe or Shopify checkout
- Admin dashboard
- Product approval queue
- Content calendar
- Analytics tables
- Affiliate link manager
- Compliance guard
- AI content assistant

## Product data model

Each product should have:

- id
- name
- slug
- category
- ritual type
- audience
- description
- short description
- price
- compare-at price
- currency
- product type: digital, affiliate, physical, bundle
- image URL
- media gallery
- affiliate URL
- checkout URL
- inventory status
- tags
- compliance notes
- disclosure required
- status: draft, review, active, archived

## Admin dashboard screens needed

1. Login
2. Logout
3. Dashboard overview
4. Products
5. Product editor
6. Media library
7. Offers and bundles
8. Affiliate links
9. Digital downloads
10. Blog/content drafts
11. Social video scripts
12. Compliance review queue
13. Analytics
14. Settings
15. Brand assets

## Autonomous workflow

1. Trend scout finds product/content opportunities.
2. Product curator scores ideas by demand, profit, risk, and brand fit.
3. AI drafts product page, captions, email, and video scripts.
4. Compliance guard reviews claims and disclosures.
5. Owner approves or rejects.
6. Approved product/content goes live.
7. Analytics tracks views, clicks, signups, purchases, and affiliate revenue.
8. Weekly optimizer recommends what to double down on.

## Approval gates

Human approval is required before:

- Publishing content
- Changing prices
- Adding official affiliate links
- Sending campaigns
- Spending ad money
- Launching products
- Making claims
- Using child/family imagery in promotional campaigns

## Conversion audit

Current strengths:

- Clear brand promise
- Strong logo foundation
- Simple ritual framework
- Low-friction quiz CTA
- Offer ladder is visible
- Affiliate disclosure is present
- Compliance-safe language

Current gaps:

- No real product photos yet
- Placeholder checkout links remain
- Placeholder email capture links remain
- No admin dashboard yet
- No analytics dashboard yet
- No live product editor yet
- No real checkout yet
- No email automation yet

## Immediate next moves

1. Add male and diverse lifestyle visuals.
2. Replace placeholder links with email capture and checkout links.
3. Choose Shopify or custom Supabase/Next.js admin.
4. Create real product image/media workflow.
5. Add analytics tracking.
6. Add admin dashboard.
7. Add approval queue and compliance guard.
