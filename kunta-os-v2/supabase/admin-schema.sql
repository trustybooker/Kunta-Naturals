create extension if not exists pgcrypto;

create table if not exists public.catalog_products (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null default 'Digital Product',
  ritual_type text not null default 'Starter Ritual',
  audience text not null default 'Adults',
  product_type text not null check (product_type in ('digital', 'physical', 'bundle', 'affiliate')),
  short_description text not null,
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  currency text not null default 'USD',
  image_url text not null default '',
  detail_url text not null default '',
  checkout_status text not null check (checkout_status in ('free_public', 'pending_provider', 'pending_supplier', 'pending_partner', 'live')),
  fulfillment_model text not null default '',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'review', 'active', 'archived')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text not null,
  label text,
  referrer_host text,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events(event_name, created_at desc);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text not null,
  body text not null default '',
  call_to_action text,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'published', 'archived')),
  scheduled_for timestamptz,
  campaign text not null default '',
  content_format text not null default 'Post',
  media_url text,
  publication_url text,
  publish_status text not null default 'not_scheduled' check (publish_status in ('not_scheduled', 'scheduled', 'published', 'failed')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.content_items add column if not exists campaign text not null default '';
alter table public.content_items add column if not exists content_format text not null default 'Post';
alter table public.content_items add column if not exists media_url text;
alter table public.content_items add column if not exists publication_url text;
alter table public.content_items add column if not exists publish_status text not null default 'not_scheduled';
alter table public.content_items add column if not exists published_at timestamptz;
do $$ begin
  alter table public.content_items add constraint content_items_publish_status_check check (publish_status in ('not_scheduled', 'scheduled', 'published', 'failed'));
exception when duplicate_object then null; end $$;
create index if not exists content_items_schedule_idx on public.content_items(publish_status, scheduled_for);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;
alter table public.analytics_events enable row level security;
alter table public.content_items enable row level security;
alter table public.admin_audit_log enable row level security;

-- No browser-facing policies are created. All reads and writes pass through
-- authenticated server routes using the service role and an admin allowlist.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-media', 'brand-media', true, 10485760, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit)
values ('digital-products', 'digital-products', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

insert into public.catalog_products (id,name,slug,category,ritual_type,audience,product_type,short_description,description,price,currency,image_url,detail_url,checkout_status,fulfillment_model,tags,status,sort_order) values
('kn-digital-3-minute-guide','3-Minute Natural Self-Care Guide','free-3-minute-guide','Free Digital Guide','Starter Ritual','Adults','digital','Start with cleanse, polish, moisturize, scent, and reset.','A free starter guide that helps people build the ritual before buying more products.',0,'USD','assets/kn-clean-starter.svg','downloads/free-3-minute-guide.html','free_public','owned_digital',array['free','guide','starter'],'active',10),
('kn-free-starter-checklist','Natural Body-Care Starter Checklist','starter-checklist','Free Digital Checklist','Starter Ritual','Adults','digital','A shopping filter for cleanse, polish, moisturize, scent, and reset.','A free printable checklist that keeps the first purchase simple and role-based.',0,'USD','assets/cards-cover.svg','downloads/starter-checklist.html','free_public','owned_digital',array['free','checklist','starter'],'active',20),
('kn-free-5-day-course','5-Day Natural Ritual Course','5-day-natural-ritual-course','Free Course','Starter Ritual','Adults','digital','Five short lessons to simplify your routine before buying more.','A free education path that introduces the Kunta Naturals ritual framework.',0,'USD','assets/kn-product-email-course.svg','downloads/5-day-natural-ritual-course.html','free_public','owned_digital',array['free','course'],'active',30),
('kn-7-day-body-ritual-guide','7-Day Body Ritual Guide','7-day-body-ritual-guide','Digital Guide','Body Ritual','Adults','digital','A one-week routine with daily steps, inventory, and an end-of-week scorecard.','Build one written ritual, a low-energy version, and a clear list of what not to buy next.',9,'USD','assets/kn-product-guide-7-day.svg','products/7-day-body-ritual-guide.html','pending_provider','owned_digital_private_delivery_pending',array['paid','guide'],'active',40),
('kn-glow-scent-bundle','Natural Glow + Scent Ritual Bundle','glow-scent-bundle','Digital Bundle','Glow + Scent Ritual','Adults','bundle','Coordinate body care and scent with a seven-day test and budget guardrail.','Build one everyday combination, one low-scent option, and a finish-before-buying list.',27,'USD','assets/kn-product-glow-scent-bundle.svg','products/glow-scent-bundle.html','pending_provider','owned_digital_private_delivery_pending',array['paid','bundle'],'active',50),
('kn-ritual-journal','Kunta Naturals Ritual Journal','ritual-journal','Digital Journal','Reset','Adults','digital','Record what you use, ignore, repeat, and stop buying.','A guided reflection system for product value, preferences, friction, and repeatable choices.',24.99,'USD','assets/kn-clean-journal.svg','products/ritual-journal.html','pending_provider','owned_digital_or_pod_pending',array['paid','journal'],'active',60),
('kn-self-care-planner','Self-Care Planner','self-care-planner','Digital Planner','Reset','Adults','digital','Plan products, time, and reset steps before the week begins.','A forward-looking weekly planning system with product-role mapping and monthly review.',27.99,'USD','assets/kn-clean-planner.svg','products/self-care-planner.html','pending_provider','owned_digital_or_pod_pending',array['paid','planner'],'active',70),
('kn-bathroom-reset-cards','Bathroom Reset Checklist Cards','bathroom-reset-cards','Digital Cards','Home Reset','Households','digital','Ten visual cards for shelves, towels, tools, clutter, and weekly resets.','Short visible prompts that support a clearer shared self-care space.',14.99,'USD','assets/kn-clean-cards.svg','products/bathroom-reset-cards.html','pending_provider','owned_digital_or_pod_pending',array['paid','cards'],'active',80),
('kn-ritual-vault','Kunta Naturals Ritual Vault','ritual-vault','Complete Digital System','Complete Ritual System','Adults','bundle','Inventory, coordinate, plan, replace, and maintain the complete ritual system.','A complete system for fewer unresolved product, routine, budget, and replacement decisions.',47,'USD','assets/kn-product-vault.svg','products/ritual-vault.html','pending_provider','owned_digital_private_delivery_pending',array['paid','vault'],'active',90)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, category=excluded.category, ritual_type=excluded.ritual_type, audience=excluded.audience, product_type=excluded.product_type, short_description=excluded.short_description, description=excluded.description, price=excluded.price, currency=excluded.currency, image_url=excluded.image_url, detail_url=excluded.detail_url, checkout_status=excluded.checkout_status, fulfillment_model=excluded.fulfillment_model, tags=excluded.tags, status=excluded.status, sort_order=excluded.sort_order, updated_at=now();
