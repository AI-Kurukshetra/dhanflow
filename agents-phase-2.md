# DHANFLOW BACKEND INTEGRATION AGENT

You are a senior full-stack engineer.

The frontend for the Dhanflow project already exists.

Your task is to integrate the backend using Supabase.

You must implement:

Database schema
Supabase client
Authentication
API routes
Data hooks
Realtime updates

The stack is:

Next.js App Router
TypeScript
Supabase
TailwindCSS
ShadCN

All code must be created inside:

apps/web

---

# STEP 1 — Install Dependencies

Ensure these packages exist.

pnpm add @supabase/supabase-js
pnpm add zod
pnpm add react-query
pnpm add date-fns

---

# STEP 2 — Supabase Client

Create:

apps/web/lib/supabase/client.ts

Code:

import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

---

# STEP 3 — Server Supabase Client

Create:

apps/web/lib/supabase/server.ts

import { createClient } from "@supabase/supabase-js"

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

---

# STEP 4 — Database Schema

Generate SQL migration scripts for these tables.

Tables:

users
clients
portfolios
holdings
transactions
goals
market_assets
advisor_notes

Each table must have:

uuid primary key
created_at timestamp

Relationships:

client → advisor
portfolio → client
holdings → portfolio
transactions → portfolio

---

# STEP 5 — Clients Table

Columns:

id uuid
advisor_id uuid
name text
email text
phone text
risk_profile text
created_at timestamp

---

# STEP 6 — Portfolio Table

Columns:

id uuid
client_id uuid
total_value numeric
currency text
created_at timestamp

---

# STEP 7 — Holdings Table

Columns:

id uuid
portfolio_id uuid
symbol text
asset_type text
quantity numeric
price numeric
updated_at timestamp

---

# STEP 8 — Transactions Table

Columns:

id uuid
portfolio_id uuid
type text
amount numeric
created_at timestamp

---

# STEP 9 — Goals Table

Columns:

id uuid
client_id uuid
goal_name text
target_amount numeric
current_amount numeric
deadline date

---

# STEP 10 — Enable Row Level Security

Enable RLS on all tables.

Policies:

advisor can view their clients
clients can view their portfolio

---

# STEP 11 — Auth Integration

Create:

apps/web/lib/auth.ts

Implement:

login
signup
logout
session

Use Supabase auth.

---

# STEP 12 — API Routes

Create API routes:

app/api/clients
app/api/portfolio
app/api/transactions
app/api/goals

Each route must support:

GET
POST
PATCH
DELETE

Use server Supabase client.

---

# STEP 13 — Data Hooks

Create hooks:

lib/hooks/useClients.ts
lib/hooks/usePortfolio.ts
lib/hooks/useTransactions.ts
lib/hooks/useGoals.ts

Use React Query for caching.

---

# STEP 14 — Realtime Updates

Enable realtime subscriptions for:

transactions
portfolio updates

Use Supabase realtime channel.

---

# STEP 15 — AI Advisor API

Create route:

app/api/ai-advisor/route.ts

Input:

portfolio data

Output:

portfolio analysis
risk insights
allocation suggestions

Use OpenAI API.

---

# STEP 16 — Seed Data

Generate seed script.

Create:

scripts/seed.ts

Seed:

5 clients
sample portfolios
transactions
holdings

---

# STEP 17 — Error Handling

Add centralized error handler.

Create:

lib/errors.ts

---

# STEP 18 — Ensure App Runs

After implementation verify:

pnpm install
pnpm dev

The app must:

connect to Supabase
load clients
load portfolios
display dashboard data