# Domain Setup: GoDaddy + GitHub Pages

Domain: `kuntanaturals.com`
Repository: `trustybooker/Kunta-Naturals`
Site folder: `/site`

## Current repo-side setup

The repository now includes:

- `.github/workflows/deploy-pages.yml` to deploy `/site` through GitHub Pages Actions.
- `site/CNAME` containing `kuntanaturals.com`.

## GitHub Pages settings

In GitHub:

1. Open `trustybooker/Kunta-Naturals`.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Set **Custom domain** to `kuntanaturals.com`.
5. Save.
6. After DNS verifies, enable **Enforce HTTPS**.

## GoDaddy DNS records

In GoDaddy Domain Portfolio → `kuntanaturals.com` → DNS, use these records for GitHub Pages.

### Apex/root domain records

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Default |
| A | @ | 185.199.109.153 | Default |
| A | @ | 185.199.110.153 | Default |
| A | @ | 185.199.111.153 | Default |

### WWW subdomain record

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | www | trustybooker.github.io | Default |

## Important cleanup

Before saving, check for conflicting GoDaddy or Airo records:

- Remove or replace old `A` records for `@` that point to a parked page, website builder, or another hosting service.
- Remove or replace old `CNAME` or `A` records for `www` if they point somewhere else.
- Do not add wildcard records unless there is a specific reason.
- Do not delete MX email records unless you intentionally want to change email service.

## After DNS is saved

DNS can take time to propagate. After propagation:

1. Reopen GitHub **Settings → Pages**.
2. Confirm the custom domain check passes.
3. Turn on **Enforce HTTPS**.
4. Test:
   - `https://kuntanaturals.com`
   - `https://www.kuntanaturals.com`

## If GitHub Pages cannot publish

If the repo remains private and GitHub Pages is not available on the current GitHub plan, use one of these fallback options:

1. Make the repo public and publish with GitHub Pages.
2. Keep the repo private and deploy `/site` through Netlify, Vercel, Replit, or another host.
3. Upgrade GitHub plan if private-repo GitHub Pages is required.
