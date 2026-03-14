-- CRM extended schema from agents-phase-2 follow-up
-- Uses uuid_generate_v4() as requested.

create extension if not exists "uuid-ossp";

-- USERS
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  role text,
  created_at timestamp default now()
);

-- CLIENTS
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  advisor_id uuid references public.users(id),
  name text,
  email text,
  phone text,
  risk_profile text,
  created_at timestamp default now()
);

-- PORTFOLIOS
create table if not exists public.portfolios (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  total_value numeric,
  created_at timestamp default now()
);

-- HOLDINGS
create table if not exists public.holdings (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid references public.portfolios(id),
  symbol text,
  asset_type text,
  quantity numeric,
  price numeric
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid references public.portfolios(id),
  type text,
  amount numeric,
  created_at timestamp default now()
);

-- GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  goal_name text,
  target_amount numeric,
  current_amount numeric,
  deadline date
);

-- TASKS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  title text,
  status text,
  due_date timestamp
);

-- DOCUMENTS
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  file_url text,
  created_at timestamp default now()
);

-- MEETINGS
create table if not exists public.meetings (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  meeting_time timestamp,
  meeting_link text
);

-- COMMUNICATION LOG
create table if not exists public.communications (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  channel text,
  message text,
  created_at timestamp default now()
);
