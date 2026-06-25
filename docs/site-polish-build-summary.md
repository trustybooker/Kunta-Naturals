# Site Polish Build Summary

## Why the product images looked wrong

Several product records used `assets/logo.svg` as the product image. The product card CSS treated that wide logo like a photo and cropped it into a 4:3 media card. That caused the cut-off `Kunta Nat...` look.

## Fix

- Added proper digital and product cover visuals.
- Updated product data to point to cover assets instead of the wide logo.
- Changed product image fitting to `contain` so brand assets are not badly cropped.
- Kept the original logo files as the official brand identity.

## SEO/AEO/schema additions

- Canonical URL
- Open Graph tags
- Twitter card tags
- Organization schema
- WebSite schema
- WebPage schema
- ItemList schema
- Visible FAQ section
- FAQ schema that matches visible FAQ content
- robots.txt
- sitemap.xml
- Digital products landing page

## Still needed later

- Real email capture link
- Real checkout links
- Real product photography or approved supplier mockups
- Separate detail pages for every paid product
- Search Console submission
- Analytics tracking
- Supabase/Vercel admin backend deployment
