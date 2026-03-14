# Supabase Backend Setup

This folder contains Supabase schema migrations for Dhanflow.

## Includes

- Supabase Auth integration via `auth.users` + profile sync trigger
- PostgreSQL schema for all core fintech entities
- Row Level Security (RLS) across business tables
- Supabase Storage private bucket for client documents
- Performance indexes for client listing, transaction history, and portfolio performance queries
- CRM extensions for client profiles, relationship mapping, pipeline, tasks, meetings, and communication logs

## Migrations

- `migrations/20260314154000_init_backend.sql`
- `migrations/20260314162000_crm_features.sql`
- `migrations/20260314170000_portfolio_engine.sql`

## Local workflow

```bash
supabase start
supabase db reset
supabase db push
```

## Auth and Storage notes

- New auth users are mirrored into `public.users` via `handle_auth_user_created` trigger.
- Document uploads are scoped to bucket `client-documents` and locked to `storage.objects.owner = auth.uid()`.
