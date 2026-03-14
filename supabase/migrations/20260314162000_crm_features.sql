-- CRM feature expansion for Dhanflow
-- Features: client profiles, relationship mapping, lead pipeline, activity timeline,
-- task manager, meeting scheduler, calendar integration, communication logs

create type public.crm_pipeline_stage as enum (
  'prospect',
  'contacted',
  'proposal',
  'negotiation',
  'closed'
);

create type public.relationship_type as enum (
  'spouse',
  'parent',
  'child',
  'sibling',
  'business_partner',
  'beneficiary',
  'other'
);

create type public.activity_type as enum (
  'call',
  'email',
  'meeting',
  'note',
  'task',
  'pipeline_change',
  'document',
  'system'
);

create type public.calendar_provider as enum ('google', 'outlook', 'apple', 'other');
create type public.communication_direction as enum ('inbound', 'outbound');

alter table public.clients
  add column if not exists preferred_contact_method text,
  add column if not exists secondary_email text,
  add column if not exists date_of_birth date,
  add column if not exists risk_tolerance public.risk_level,
  add column if not exists advisor_notes text,
  add column if not exists family_relationship_summary jsonb not null default '[]'::jsonb;

alter table public.leads
  add column if not exists pipeline_stage public.crm_pipeline_stage not null default 'prospect',
  add column if not exists contacted_at timestamptz,
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists closed_at timestamptz;

alter table public.opportunities
  add column if not exists pipeline_stage public.crm_pipeline_stage not null default 'prospect',
  add column if not exists probability smallint not null default 0,
  add column if not exists next_step text,
  add constraint opportunities_probability_bounds check (probability >= 0 and probability <= 100);

create table if not exists public.client_relationships (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  related_client_id uuid references public.clients(id) on delete cascade,
  related_contact_name text,
  relationship_type public.relationship_type not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_relationships_target check (
    (related_client_id is not null and related_contact_name is null)
    or (related_client_id is null and related_contact_name is not null)
  )
);

create table if not exists public.calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  provider public.calendar_provider not null,
  account_email text not null,
  external_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  sync_enabled boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(advisor_user_id, provider, account_email)
);

create table if not exists public.activity_timeline (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  activity_type public.activity_type not null,
  title text not null,
  summary text,
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  meeting_id uuid references public.meetings(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  direction public.communication_direction not null,
  channel text not null,
  subject text,
  content text,
  external_message_id text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists start_at timestamptz,
  add column if not exists reminder_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists estimated_minutes integer,
  add column if not exists calendar_integration_id uuid references public.calendar_integrations(id) on delete set null,
  add column if not exists external_calendar_event_id text;

alter table public.meetings
  add column if not exists timezone text not null default 'UTC',
  add column if not exists location text,
  add column if not exists status text not null default 'scheduled',
  add column if not exists calendar_integration_id uuid references public.calendar_integrations(id) on delete set null,
  add column if not exists external_calendar_event_id text;

create index if not exists idx_clients_risk_tolerance on public.clients (advisor_user_id, risk_tolerance);
create index if not exists idx_clients_contact_lookup on public.clients (advisor_user_id, lower(email), lower(last_name), lower(first_name));

create index if not exists idx_leads_pipeline_stage on public.leads (advisor_user_id, pipeline_stage, created_at desc);
create index if not exists idx_opportunities_pipeline_stage on public.opportunities (advisor_user_id, pipeline_stage, expected_close_date);

create index if not exists idx_activity_timeline_client_time on public.activity_timeline (client_id, occurred_at desc);
create index if not exists idx_activity_timeline_advisor_time on public.activity_timeline (advisor_user_id, occurred_at desc);
create index if not exists idx_communication_logs_client_time on public.communication_logs (client_id, sent_at desc);
create index if not exists idx_tasks_schedule on public.tasks (advisor_user_id, status, due_at);
create index if not exists idx_meetings_schedule on public.meetings (advisor_user_id, starts_at);
create index if not exists idx_client_relationships_lookup on public.client_relationships (client_id, relationship_type);

alter table public.client_relationships enable row level security;
alter table public.calendar_integrations enable row level security;
alter table public.activity_timeline enable row level security;
alter table public.communication_logs enable row level security;

create policy "advisor manages client relationships" on public.client_relationships
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages calendar integrations" on public.calendar_integrations
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages activity timeline" on public.activity_timeline
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages communication logs" on public.communication_logs
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create trigger trg_client_relationships_updated_at
before update on public.client_relationships
for each row execute function public.set_updated_at();

create trigger trg_calendar_integrations_updated_at
before update on public.calendar_integrations
for each row execute function public.set_updated_at();
