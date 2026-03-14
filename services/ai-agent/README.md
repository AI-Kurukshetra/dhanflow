# AI Advisor Service

`services/ai-agent` provides portfolio intelligence and AI advisor responses.

## Endpoint

- `POST /api/ai-advisor`

Request body:

```json
{
  "query": "How should this client rebalance?",
  "clientId": "uuid",
  "portfolioId": "uuid",
  "advisorUserId": "uuid",
  "benchmark": "nifty_50"
}
```

Workflow:

1. User query
2. Call MCP tools
3. Fetch Supabase data
4. Generate AI response

Capabilities:

- Portfolio recommendations
- Goal forecasting
- Risk insights
- Market summaries (Nifty 50, Sensex)
- Client churn prediction

## Run

```bash
pnpm --filter @dhanflow/ai-agent dev
```

Environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (optional fallback to deterministic output when missing)
- `AI_ADVISOR_MODEL` (optional)
- `PORT` (optional, default `8787`)
