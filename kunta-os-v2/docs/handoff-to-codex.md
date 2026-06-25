# Handoff to Codex or Claude Code

## Goal

Turn Kunta Naturals OS v2 from a scaffold into a deployed secure admin app without breaking the live GitHub Pages site.

## Repository rule

Do not modify `/site` unless explicitly requested. The live domain currently depends on the static site.

## App path

`/kunta-os-v2`

## First tasks

1. Install dependencies in `kunta-os-v2`.
2. Run typecheck and lint.
3. Fix any Next.js or Supabase API version issues.
4. Add real Supabase auth actions for login and logout.
5. Add protected route middleware.
6. Replace sample data with Supabase-backed product CRUD.
7. Add storage upload for product images and media.
8. Add content asset CRUD.
9. Add approval workflow.
10. Add analytics event insert and dashboard summaries.

## Deployment

Recommended host: Vercel.
Recommended database/auth/storage: Supabase.

## Guardrails

- No public strategy leakage.
- No fake proof.
- No medical claims.
- No unlicensed product or people images.
- No public affiliate links before disclosure is live.
- Human approval before publishing or changing prices.

## Brand doctrine

Use `docs/brand-doctrine.md` and `docs/marketing-system.md` as the source of truth.
