create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  ritual_type text not null,
  audience text not null default 'All adults',
  product_type text not null check (product_type in ('digital', 'affiliate', 'physical', 'bundle')),
  short_description text not null default '',
  description text not null default '',
  price_cents integer not null default 0,
  currency text not null default 'USD',
  image_url text,
  media_gallery jsonb not null default '[]'::jsonb,
  amazon_asin text,
  amazon_associate_tag text,
  affiliate_url text,
  checkout_url text,
  tags text[] not null default '{}',
  compliance_notes text not null default '',
  disclosure_required boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text not null,
  hook text not null default '',
  body text not null default '',
  call_to_action text not null default '',
  target_ritual text,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'active', 'archived')),
  compliance_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  path text not null,
  source text,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.content_assets enable row level security;
alter table public.analytics_events enable row level security;

create policy "admin products" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin content" on public.content_assets for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "analytics insert" on public.analytics_events for insert with check (true);
create policy "analytics read" on public.analytics_events for select using (auth.role() = 'authenticated');
