-- Integrations and compliance features
-- Market sources: NSE, BSE, mutual funds, ETFs, crypto
-- Compliance: SEBI audit logs, advisor alerts, regulatory reporting
-- Documents: secure vault, versioning, sharing

create type public.market_source_provider as enum ('nse', 'bse', 'mutual_funds', 'etf', 'crypto');
create type public.compliance_severity as enum ('low', 'medium', 'high', 'critical');
create type public.compliance_alert_status as enum ('open', 'in_review', 'resolved', 'dismissed');
create type public.reporting_regulator as enum ('sebi');
create type public.document_share_permission as enum ('view', 'download', 'comment');
create type public.document_share_status as enum ('active', 'revoked', 'expired');

create table if not exists public.market_integration_configs (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  provider public.market_source_provider not null,
  api_base_url text,
  api_key_reference text,
  is_enabled boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (advisor_user_id, provider)
);

create table if not exists public.market_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider public.market_source_provider not null,
  asset_id uuid references public.assets(id) on delete set null,
  symbol text not null,
  instrument_type text not null,
  as_of timestamptz not null,
  open_price numeric(18, 8),
  high_price numeric(18, 8),
  low_price numeric(18, 8),
  close_price numeric(18, 8) not null,
  volume numeric(22, 2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, symbol, as_of)
);

create table if not exists public.sebi_audit_logs (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.advisor_compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  alert_type text not null,
  severity public.compliance_severity not null,
  status public.compliance_alert_status not null default 'open',
  title text not null,
  message text,
  details jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.regulatory_reporting_runs (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  regulator public.reporting_regulator not null default 'sebi',
  report_name text not null,
  reporting_period_start date,
  reporting_period_end date,
  status text not null default 'draft',
  output_storage_path text,
  submitted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  version_number integer not null,
  storage_path text not null,
  checksum text,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  change_summary text,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  shared_with_user_id uuid references public.users(id) on delete set null,
  shared_with_email text,
  permission public.document_share_permission not null default 'view',
  status public.document_share_status not null default 'active',
  access_token text not null default encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_shares_target check (
    (shared_with_user_id is not null and shared_with_email is null)
    or (shared_with_user_id is null and shared_with_email is not null)
  )
);

create table if not exists public.secure_vault_access_logs (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists idx_market_price_provider_symbol_as_of
  on public.market_price_snapshots (provider, symbol, as_of desc);

create index if not exists idx_market_price_asset_as_of
  on public.market_price_snapshots (asset_id, as_of desc)
  where asset_id is not null;

create index if not exists idx_sebi_audit_advisor_time
  on public.sebi_audit_logs (advisor_user_id, created_at desc);

create index if not exists idx_compliance_alerts_advisor_status
  on public.advisor_compliance_alerts (advisor_user_id, status, severity, created_at desc);

create index if not exists idx_regulatory_reporting_advisor_period
  on public.regulatory_reporting_runs (advisor_user_id, reporting_period_start desc);

create index if not exists idx_document_versions_document_version
  on public.document_versions (document_id, version_number desc);

create index if not exists idx_document_shares_lookup
  on public.document_shares (document_id, status, expires_at);

create index if not exists idx_secure_vault_access_document_time
  on public.secure_vault_access_logs (document_id, created_at desc);

alter table public.market_integration_configs enable row level security;
alter table public.market_price_snapshots enable row level security;
alter table public.sebi_audit_logs enable row level security;
alter table public.advisor_compliance_alerts enable row level security;
alter table public.regulatory_reporting_runs enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_shares enable row level security;
alter table public.secure_vault_access_logs enable row level security;

create policy "advisor manages market integration configs" on public.market_integration_configs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "authenticated read market price snapshots" on public.market_price_snapshots
for select to authenticated
using (true);

create policy "advisor manages sebi audit logs" on public.sebi_audit_logs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages compliance alerts" on public.advisor_compliance_alerts
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages regulatory reporting runs" on public.regulatory_reporting_runs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages document versions" on public.document_versions
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages document shares" on public.document_shares
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages secure vault access logs" on public.secure_vault_access_logs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit)
values ('secure-vault', 'secure-vault', false, 15728640)
on conflict (id) do nothing;

drop policy if exists "secure vault owners upload" on storage.objects;
drop policy if exists "secure vault owners read" on storage.objects;
drop policy if exists "secure vault owners update" on storage.objects;
drop policy if exists "secure vault owners delete" on storage.objects;

create policy "secure vault owners upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'secure-vault' and owner = auth.uid());

create policy "secure vault owners read"
on storage.objects
for select
to authenticated
using (bucket_id = 'secure-vault' and owner = auth.uid());

create policy "secure vault owners update"
on storage.objects
for update
to authenticated
using (bucket_id = 'secure-vault' and owner = auth.uid())
with check (bucket_id = 'secure-vault' and owner = auth.uid());

create policy "secure vault owners delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'secure-vault' and owner = auth.uid());

create trigger trg_market_integration_configs_updated_at
before update on public.market_integration_configs
for each row execute function public.set_updated_at();

create trigger trg_advisor_compliance_alerts_updated_at
before update on public.advisor_compliance_alerts
for each row execute function public.set_updated_at();

create trigger trg_regulatory_reporting_runs_updated_at
before update on public.regulatory_reporting_runs
for each row execute function public.set_updated_at();

create trigger trg_document_shares_updated_at
before update on public.document_shares
for each row execute function public.set_updated_at();
