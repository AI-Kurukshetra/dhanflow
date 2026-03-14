# Dhanflow

Dhanflow is a fintech platform monorepo bootstrapped with **Turborepo** and managed with **pnpm**.

## Monorepo layout

- `apps/web`: Public marketing website and onboarding entrypoint.
- `apps/advisor-portal`: Advisor-facing dashboard and workflows.
- `apps/client-portal`: Client-facing portfolio and transaction experience.
- `services/ai-agent`: AI orchestration service for advisory insights and automation.
- `services/mcp-server`: MCP service for tool integration and context routing.
- `packages/ui`: Shared UI components and design primitives.
- `packages/config`: Shared config presets (lint, TypeScript, build conventions).
- `packages/utils`: Shared cross-domain utility functions.
- `infra/docker`: Containerization and local orchestration assets.
- `infra/vercel`: Vercel deployment and environment notes.
- `prompts`: Prompt templates and agent workflows.

## Tooling

- Monorepo orchestration: Turborepo (`turbo.json`)
- Package management: pnpm (`pnpm-workspace.yaml`)

## Getting started

```bash
pnpm install
pnpm dev
```

## Typical commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```
