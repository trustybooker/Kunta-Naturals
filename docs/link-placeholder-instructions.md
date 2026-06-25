# Link Placeholder Instructions

The repo is set up so official links can be added later.

## Replace these placeholders

- TODO_ADD_EMAIL_CAPTURE_LINK
- TODO_ADD_CHECKOUT_LINK_9
- TODO_ADD_CHECKOUT_LINK_27
- TODO_ADD_CHECKOUT_LINK_47
- TODO_ADD_OFFICIAL_AFFILIATE_LINK
- TODO_ADD_BACKUP_LINK

## Main files to update

- site/index.html
- data/affiliate-products.json
- data/offers.json

## Affiliate product fields

Each product has:

- id
- collection
- name
- role
- why_it_fits
- content_angle
- risk_level
- disclosure_required
- affiliate_url
- backup_url
- status

When adding a real link, update:

```json
"affiliate_url": "https://real-affiliate-link-here",
"status": "active"
```

## Do not skip disclosure

If the link earns money, add a disclosure near the link and in the caption.
