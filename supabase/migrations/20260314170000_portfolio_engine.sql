-- Portfolio analytics engine for Dhanflow
-- Dashboard, benchmark comparison, analytics metrics, and investment simulation support

create type public.benchmark_index as enum ('nifty_50', 'sensex');
create type public.goal_type as enum ('retirement', 'education', 'property_purchase');

alter table public.goals
  add column if not exists goal_type public.goal_type not null default 'retirement';

create table if not exists public.benchmark_prices (
  id uuid primary key default gen_random_uuid(),
  benchmark public.benchmark_index not null,
  as_of_date date not null,
  close_price numeric(18, 4) not null,
  change_percent numeric(8, 4),
  source text,
  created_at timestamptz not null default now(),
  unique (benchmark, as_of_date)
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  as_of_date date not null,
  total_value numeric(18, 2) not null,
  total_cost numeric(18, 2) not null default 0,
  daily_return_percent numeric(8, 4),
  cumulative_return_percent numeric(8, 4),
  risk_score numeric(8, 4),
  volatility numeric(12, 8),
  sharpe_ratio numeric(12, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, as_of_date)
);

create table if not exists public.investment_simulations (
  id uuid primary key default gen_random_uuid(),
  advisor_user_id uuid not null references public.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  goal_type public.goal_type not null,
  benchmark public.benchmark_index,
  scenario_name text not null,
  initial_investment numeric(18, 2) not null,
  monthly_contribution numeric(18, 2) not null default 0,
  expected_return numeric(8, 6) not null,
  expected_volatility numeric(8, 6) not null,
  years integer not null,
  iterations integer not null default 1000,
  percentile_10_value numeric(18, 2),
  percentile_50_value numeric(18, 2),
  percentile_90_value numeric(18, 2),
  probability_of_success numeric(8, 4),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_benchmark_prices_benchmark_date
  on public.benchmark_prices (benchmark, as_of_date desc);

create index if not exists idx_portfolio_snapshots_portfolio_date
  on public.portfolio_snapshots (portfolio_id, as_of_date desc);

create index if not exists idx_portfolio_snapshots_advisor_date
  on public.portfolio_snapshots (advisor_user_id, as_of_date desc);

create index if not exists idx_transactions_portfolio_asset_time
  on public.transactions (portfolio_id, asset_id, executed_at desc)
  where asset_id is not null;

create index if not exists idx_investment_simulations_goal
  on public.investment_simulations (advisor_user_id, goal_type, created_at desc);

alter table public.benchmark_prices enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.investment_simulations enable row level security;

create policy "authenticated read benchmark prices" on public.benchmark_prices
for select to authenticated
using (true);

create policy "advisor manages portfolio snapshots" on public.portfolio_snapshots
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create policy "advisor manages investment simulations" on public.investment_simulations
for all to authenticated
using (advisor_user_id = auth.uid())
with check (advisor_user_id = auth.uid());

create trigger trg_portfolio_snapshots_updated_at
before update on public.portfolio_snapshots
for each row execute function public.set_updated_at();

create trigger trg_investment_simulations_updated_at
before update on public.investment_simulations
for each row execute function public.set_updated_at();
