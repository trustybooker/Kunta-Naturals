create extension if not exists pgcrypto;

create table if not exists public.digital_products (
  id text primary key,
  name text not null,
  product_type text not null check (product_type in ('free', 'paid')),
  price_cents integer not null default 0,
  currency text not null default 'USD',
  delivery_mode text not null check (delivery_mode in ('public_free_page', 'private_paid_file', 'partner_provider')),
  public_delivery_path text,
  protected_file_label text,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  product_id text not null references public.digital_products(id),
  amount_total integer not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.digital_products(id),
  token_hash text not null unique,
  customer_email text,
  max_uses integer not null default 5,
  use_count integer not null default 0,
  expires_at timestamptz not null default (now() + interval '14 days'),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  delivery_token_id uuid references public.delivery_tokens(id) on delete set null,
  product_id text references public.digital_products(id),
  customer_email text,
  event_name text not null default 'download_opened',
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.digital_products enable row level security;
alter table public.orders enable row level security;
alter table public.delivery_tokens enable row level security;
alter table public.download_events enable row level security;

drop policy if exists "admin digital products" on public.digital_products;
drop policy if exists "admin orders" on public.orders;
drop policy if exists "admin delivery tokens" on public.delivery_tokens;
drop policy if exists "admin download events" on public.download_events;

-- No anon/authenticated client policy is created here. The delivery API uses the Supabase service role on the server.
-- Add a narrower admin policy later only after Kunta OS staff/admin authentication is implemented.

insert into public.digital_products (id, name, product_type, price_cents, delivery_mode, public_delivery_path, protected_file_label, status) values
  ('free-3-minute-guide', '3-Minute Natural Self-Care Guide', 'free', 0, 'public_free_page', '/downloads/free-3-minute-guide.html', null, 'active'),
  ('free-starter-checklist', 'Natural Body-Care Starter Checklist', 'free', 0, 'public_free_page', '/downloads/starter-checklist.html', null, 'active'),
  ('free-5-day-course', '5-Day Natural Ritual Email Course', 'free', 0, 'public_free_page', '/downloads/5-day-natural-ritual-course.html', null, 'active'),
  ('7-day-body-ritual-guide', '7-Day Body Ritual Guide', 'paid', 900, 'private_paid_file', null, 'Kunta Naturals 7-Day Body Ritual Guide PDF', 'active'),
  ('bathroom-reset-cards', 'Bathroom Reset Checklist Cards', 'paid', 1499, 'private_paid_file', null, 'Kunta Naturals Bathroom Reset Cards PDF', 'active'),
  ('ritual-journal', 'Kunta Naturals Ritual Journal', 'paid', 2499, 'private_paid_file', null, 'Kunta Naturals Ritual Journal PDF', 'active'),
  ('self-care-planner', 'Kunta Naturals Self-Care Planner', 'paid', 2799, 'private_paid_file', null, 'Kunta Naturals Self-Care Planner PDF', 'active'),
  ('glow-scent-bundle', 'Natural Glow + Scent Ritual Bundle', 'paid', 2700, 'private_paid_file', null, 'Kunta Naturals Glow + Scent Bundle ZIP', 'active'),
  ('ritual-vault', 'Kunta Naturals Ritual Vault', 'paid', 4700, 'private_paid_file', null, 'Kunta Naturals Ritual Vault ZIP', 'active')
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  price_cents = excluded.price_cents,
  delivery_mode = excluded.delivery_mode,
  public_delivery_path = excluded.public_delivery_path,
  protected_file_label = excluded.protected_file_label,
  status = excluded.status,
  updated_at = now();
