create extension if not exists pgcrypto;

create table if not exists public.email_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_lower text not null unique,
  name text,
  product text not null default 'free-guide',
  source text not null default 'website',
  marketing_consent boolean not null default false,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_leads enable row level security;

drop policy if exists "no public email lead access" on public.email_leads;

-- No anon/authenticated client policy is created. The API route writes through the Supabase service role only.
-- Add a narrow admin policy later after Kunta OS staff/admin authentication is implemented.

create index if not exists email_leads_created_at_idx on public.email_leads (created_at desc);
create index if not exists email_leads_product_idx on public.email_leads (product);
