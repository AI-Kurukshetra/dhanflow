# Dhanflow

Dhanflow is a scalable fintech monorepo bootstrapped with **Turborepo** and managed by **pnpm**.

## Tech stack

- Frontend: Next.js 16, React 19, TypeScript
- UI: TailwindCSS, ShadCN pattern support, Framer Motion, Three.js
- Backend: Supabase, PostgreSQL, Edge Functions
- AI: OpenAI API

## Monorepo architecture

- `apps/web`: Public web app and onboarding funnel.
- `apps/advisor-portal`: Advisor workflows, insights, and operations.
- `apps/client-portal`: Client dashboard, portfolio views, and actions.
- `services/ai-agent`: AI orchestration and LLM workflows.
- `services/mcp-server`: MCP integrations and tool routing service.
- `packages/ui`: Shared UI primitives and component contracts.
- `packages/config`: Shared base configs for ESLint, Prettier, Tailwind, and TypeScript.
- `packages/utils`: Shared business and platform utilities.
- `infra/docker`: Container and local environment assets.
- `infra/vercel`: Deployment and environment mapping for Vercel.
- `prompts`: Prompt templates for internal AI workflows.

## Base configuration

- ESLint: `packages/config/eslint/*`
- Prettier: `packages/config/prettier/base.cjs`
- TypeScript: `packages/config/typescript/*`
- Tailwind: `packages/config/tailwind/base.cjs`

## Turborepo pipelines

- `dev`: non-cached persistent processes for local development.
- `build`: cacheable builds with dependency ordering.
- `lint`: lint across workspaces with dependency ordering.
- `typecheck`: type checks across workspaces.

## Workspace scripts

```bash
pnpm dev
pnpm build
pnpm lint
```
