-- Dhanflow backend integration schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text not null default 'advisor',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.users(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  risk_profile text not null default 'Moderate',
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  total_value numeric(18,2) not null default 0,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  asset_type text not null,
  quantity numeric(18,4) not null default 0,
  price numeric(18,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  type text not null,
  amount numeric(18,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  goal_name text not null,
  target_amount numeric(18,2) not null,
  current_amount numeric(18,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists public.market_assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  asset_class text,
  price numeric(18,4),
  created_at timestamptz not null default now()
);

create table if not exists public.advisor_notes (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_clients_advisor_id on public.clients(advisor_id);
create index if not exists idx_portfolios_client_id on public.portfolios(client_id);
create index if not exists idx_holdings_portfolio_id on public.holdings(portfolio_id);
create index if not exists idx_transactions_portfolio_id on public.transactions(portfolio_id);
create index if not exists idx_goals_client_id on public.goals(client_id);
create index if not exists idx_advisor_notes_advisor_id on public.advisor_notes(advisor_id);

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.market_assets enable row level security;
alter table public.advisor_notes enable row level security;

drop policy if exists advisor_can_view_own_clients on public.clients;
create policy advisor_can_view_own_clients
on public.clients
for select
using (advisor_id = auth.uid());

drop policy if exists advisor_manage_own_clients on public.clients;
create policy advisor_manage_own_clients
on public.clients
for all
using (advisor_id = auth.uid())
with check (advisor_id = auth.uid());

drop policy if exists clients_can_view_their_portfolio on public.portfolios;
create policy clients_can_view_their_portfolio
on public.portfolios
for select
using (
  exists (
    select 1
    from public.clients c
    where c.id = portfolios.client_id
      and (c.user_id = auth.uid() or c.advisor_id = auth.uid())
  )
);

drop policy if exists client_advisor_access_holdings on public.holdings;
create policy client_advisor_access_holdings
on public.holdings
for select
using (
  exists (
    select 1
    from public.portfolios p
    join public.clients c on c.id = p.client_id
    where p.id = holdings.portfolio_id
      and (c.user_id = auth.uid() or c.advisor_id = auth.uid())
  )
);

drop policy if exists client_advisor_access_transactions on public.transactions;
create policy client_advisor_access_transactions
on public.transactions
for select
using (
  exists (
    select 1
    from public.portfolios p
    join public.clients c on c.id = p.client_id
    where p.id = transactions.portfolio_id
      and (c.user_id = auth.uid() or c.advisor_id = auth.uid())
  )
);

drop policy if exists client_advisor_access_goals on public.goals;
create policy client_advisor_access_goals
on public.goals
for select
using (
  exists (
    select 1
    from public.clients c
    where c.id = goals.client_id
      and (c.user_id = auth.uid() or c.advisor_id = auth.uid())
  )
);

drop policy if exists advisor_manage_portfolios on public.portfolios;
create policy advisor_manage_portfolios
on public.portfolios
for all
using (
  exists (
    select 1
    from public.clients c
    where c.id = portfolios.client_id
      and c.advisor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clients c
    where c.id = portfolios.client_id
      and c.advisor_id = auth.uid()
  )
);

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.portfolios;
alter publication supabase_realtime add table public.holdings;
