alter table public.email_leads
  add column if not exists sequence_status text not null default 'active'
    check (sequence_status in ('active', 'completed', 'unsubscribed', 'bounced', 'complained', 'suppressed')),
  add column if not exists sequence_day integer not null default 0 check (sequence_day between 0 and 5),
  add column if not exists next_email_at timestamptz,
  add column if not exists last_email_at timestamptz;

create index if not exists email_leads_sequence_due_idx
  on public.email_leads (sequence_status, next_email_at)
  where marketing_consent = true and unsubscribed_at is null;

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text unique,
  provider_email_id text,
  lead_id uuid references public.email_leads(id) on delete set null,
  event_type text not null,
  recipient_email text,
  sequence_day integer check (sequence_day between 1 and 5),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists email_events_lead_id_idx on public.email_events(lead_id);
create index if not exists email_events_provider_email_id_idx on public.email_events(provider_email_id);
create index if not exists email_events_occurred_at_idx on public.email_events(occurred_at desc);

alter table public.email_events enable row level security;

-- Service-role only. No browser policy is intentionally created.
