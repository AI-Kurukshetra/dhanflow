# Vercel Infrastructure

Dhanflow production deployment targets Vercel with the web app as the primary frontend deployment unit.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Configure these in Vercel Project Settings and GitHub Actions secrets.

## GitHub Actions secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Recommended project settings

- Framework preset: Next.js
- Root directory: `apps/web`
- Build command: `pnpm build`
- Install command: `pnpm install --frozen-lockfile`
