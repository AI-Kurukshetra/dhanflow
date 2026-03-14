# MCP Server

Model Context Protocol tool server for Dhanflow.

## Endpoint

- `POST /mcp`

Payload format:

```json
{
  "tool": "portfolio_analysis",
  "input": {
    "portfolioId": "uuid"
  }
}
```

## Exposed tools

- `market_data_fetch`
- `portfolio_analysis`
- `risk_simulation`
- `client_lookup`
- `goal_projection`

Each tool queries Supabase and returns structured JSON.

`market_data_fetch` now supports provider sources:
- `nse`
- `bse`
- `mutual_funds`
- `etf`
- `crypto`

## Utility routes

- `GET /health`
- `GET /tools`

## Run

```bash
pnpm --filter @dhanflow/mcp-server dev
```

Environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MCP_PORT` (optional, default `8790`)
