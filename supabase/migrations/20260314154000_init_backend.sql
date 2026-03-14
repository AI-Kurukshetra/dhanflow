-- Dhanflow Supabase backend bootstrap
-- Includes: auth integration, core schema, RLS policies, storage policies, and query indexes

create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'advisor', 'client');
create type public.client_status as enum ('lead', 'active', 'inactive', 'closed');
create type public.account_type as enum ('brokerage', 'retirement', 'bank', 'crypto');
create type public.transaction_type as enum ('buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'fee', 'transfer');
create type public.goal_status as enum ('on_track', 'at_risk', 'completed', 'paused');
create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type public.notification_type as enum ('info', 'warning', 'critical', 'success');
create type public.risk_level as enum ('low', 'moderate', 'high', 'aggressive');
create type public.opportunity_stage as enum ('prospecting', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'advisor',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  linked_user_id uuid references public.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  status public.client_status not null default 'lead',
  risk_level public.risk_level,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  base_currency text not null default 'USD',
  inception_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  account_name text not null,
  account_number text,
  account_type public.account_type not null,
  institution text,
  balance numeric(18, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  asset_class text not null,
  exchange text,
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(symbol, exchange)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  transaction_type public.transaction_type not null,
  quantity numeric(18, 8) not null default 0,
  price numeric(18, 8),
  gross_amount numeric(18, 2) not null default 0,
  fees_amount numeric(18, 2) not null default 0,
  net_amount numeric(18, 2) not null default 0,
  executed_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  target_amount numeric(18, 2) not null,
  current_amount numeric(18, 2) not null default 0,
  target_date date,
  status public.goal_status not null default 'on_track',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  assignee_user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  status public.task_status not null default 'todo',
  priority smallint not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  document_type text,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  channel text not null,
  subject text,
  body text,
  communicated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  agenda text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  meeting_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  record_type text not null,
  status text not null,
  details jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_data (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  open_price numeric(18, 8),
  high_price numeric(18, 8),
  low_price numeric(18, 8),
  close_price numeric(18, 8),
  volume numeric(20, 2),
  as_of timestamptz not null,
  source text,
  created_at timestamptz not null default now(),
  unique(asset_id, as_of)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.users(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  notification_type public.notification_type not null default 'info',
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  source text,
  score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  stage public.opportunity_stage not null default 'prospecting',
  expected_value numeric(18, 2) not null default 0,
  expected_close_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  fee_type text not null,
  amount numeric(18, 2) not null,
  effective_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  report_type text not null,
  period_start date,
  period_end date,
  status text not null default 'generated',
  generated_at timestamptz not null default now(),
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.risk_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  risk_level public.risk_level not null,
  score int not null,
  questionnaire_version text,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  workflow_type text not null,
  status text not null default 'active',
  definition jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'advisor')
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_auth_user_created();

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.portfolios enable row level security;
alter table public.accounts enable row level security;
alter table public.assets enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.communications enable row level security;
alter table public.meetings enable row level security;
alter table public.compliance_records enable row level security;
alter table public.market_data enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.fees enable row level security;
alter table public.reports enable row level security;
alter table public.risk_profiles enable row level security;
alter table public.workflows enable row level security;

create policy "users can view self" on public.users
for select to authenticated
using (id = auth.uid());

create policy "users can update self" on public.users
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users insert self" on public.users
for insert to authenticated
with check (id = auth.uid());

create policy "advisor manages clients" on public.clients
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages portfolios" on public.portfolios
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages accounts" on public.accounts
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "authenticated read assets" on public.assets
for select to authenticated
using (true);

create policy "advisor manages transactions" on public.transactions
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages goals" on public.goals
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages tasks" on public.tasks
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages documents" on public.documents
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages communications" on public.communications
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages meetings" on public.meetings
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages compliance" on public.compliance_records
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "authenticated read market data" on public.market_data
for select to authenticated
using (true);

create policy "users read own notifications" on public.notifications
for select to authenticated
using (recipient_user_id = auth.uid());

create policy "advisor inserts notifications" on public.notifications
for insert to authenticated
with check (advisor_user_id = auth.uid());

create policy "users update own notifications" on public.notifications
for update to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

create policy "advisor manages audit logs" on public.audit_logs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages leads" on public.leads
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages opportunities" on public.opportunities
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages fees" on public.fees
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages reports" on public.reports
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages risk profiles" on public.risk_profiles
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages workflows" on public.workflows
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-documents',
  'client-documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy "document owners can upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'client-documents' and owner = auth.uid());

create policy "document owners can read"
on storage.objects
for select
to authenticated
using (bucket_id = 'client-documents' and owner = auth.uid());

create policy "document owners can update"
on storage.objects
for update
to authenticated
using (bucket_id = 'client-documents' and owner = auth.uid())
with check (bucket_id = 'client-documents' and owner = auth.uid());

create policy "document owners can delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'client-documents' and owner = auth.uid());

create index idx_clients_advisor_status on public.clients (advisor_user_id, status);
create index idx_clients_last_contacted_at on public.clients (advisor_user_id, last_contacted_at desc);
create unique index idx_clients_email_per_advisor on public.clients (advisor_user_id, lower(email));

create index idx_transactions_account_executed_at on public.transactions (account_id, executed_at desc);
create index idx_transactions_portfolio_executed_at on public.transactions (portfolio_id, executed_at desc);
create index idx_transactions_asset_executed_at on public.transactions (asset_id, executed_at desc) where asset_id is not null;

create index idx_accounts_portfolio_id on public.accounts (portfolio_id);
create index idx_market_data_asset_as_of on public.market_data (asset_id, as_of desc);
create index idx_fees_portfolio_effective_date on public.fees (portfolio_id, effective_date desc);

create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger trg_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger trg_portfolios_updated_at before update on public.portfolios for each row execute function public.set_updated_at();
create trigger trg_accounts_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger trg_assets_updated_at before update on public.assets for each row execute function public.set_updated_at();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger trg_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger trg_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger trg_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger trg_communications_updated_at before update on public.communications for each row execute function public.set_updated_at();
create trigger trg_meetings_updated_at before update on public.meetings for each row execute function public.set_updated_at();
create trigger trg_compliance_updated_at before update on public.compliance_records for each row execute function public.set_updated_at();
create trigger trg_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger trg_opportunities_updated_at before update on public.opportunities for each row execute function public.set_updated_at();
create trigger trg_fees_updated_at before update on public.fees for each row execute function public.set_updated_at();
create trigger trg_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger trg_risk_profiles_updated_at before update on public.risk_profiles for each row execute function public.set_updated_at();
create trigger trg_workflows_updated_at before update on public.workflows for each row execute function public.set_updated_at();
