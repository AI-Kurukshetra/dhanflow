-- Ensure every core table has created_at as required by master build.

alter table if exists public.holdings add column if not exists created_at timestamp default now();
alter table if exists public.goals add column if not exists created_at timestamp default now();
alter table if exists public.tasks add column if not exists created_at timestamp default now();
alter table if exists public.meetings add column if not exists created_at timestamp default now();
