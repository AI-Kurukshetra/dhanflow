# DHANFLOW MASTER BUILD AGENT

You are a senior full-stack fintech engineer.

Your task is to **fully implement a working wealth management platform** called **Dhanflow** using the existing repository.

The application must implement a working **frontend + backend + database integration**.

The final application must run locally with:

pnpm install
pnpm dev

and open successfully at:

http://localhost:3000

The platform must include:

Authentication
Client CRM
Portfolio management
Task management
Financial goals
API layer
Supabase database connection

---

# TECH STACK

Frontend
Next.js (App Router)
React
TypeScript

UI
TailwindCSS
ShadCN
Framer Motion

Backend
Next.js API Routes

Database
Supabase PostgreSQL

Charts
Recharts

---

# STEP 1 — Verify Project Structure

Ensure repository structure:

apps/web

If apps/web does not exist create it.

Ensure folders exist:

apps/web/app
apps/web/components
apps/web/lib
apps/web/hooks
apps/web/services

---

# STEP 2 — Install Required Dependencies

Add the following dependencies if missing.

@supabase/supabase-js
react-hook-form
zod
recharts
lucide-react
clsx

---

# STEP 3 — Configure Supabase Client

Create:

apps/web/lib/supabaseClient.ts

Implementation:

import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

---

# STEP 4 — Database Schema

Generate SQL migrations for the following tables.

users
clients
portfolios
holdings
transactions
goals
tasks
documents
meetings
communications

Each table must contain:

id uuid primary key default uuid_generate_v4()
created_at timestamp default now()

Relationships:

clients.advisor_id → users.id
portfolios.client_id → clients.id
holdings.portfolio_id → portfolios.id
transactions.portfolio_id → portfolios.id

---

# STEP 5 — Authentication

Create authentication pages.

app/login/page.tsx
app/register/page.tsx

Features:

Email signup
Email login
Session persistence

Use Supabase Auth:

supabase.auth.signUp
supabase.auth.signInWithPassword

Redirect authenticated users to dashboard.

---

# STEP 6 — API Layer

Create API routes:

app/api/clients/route.ts
app/api/portfolios/route.ts
app/api/transactions/route.ts
app/api/goals/route.ts
app/api/tasks/route.ts

Each route must support:

GET
POST
PATCH
DELETE

All routes must query Supabase tables.

---

# STEP 7 — Data Hooks

Create React hooks:

hooks/useClients.ts
hooks/usePortfolio.ts
hooks/useTransactions.ts
hooks/useGoals.ts

Hooks must fetch data from API routes.

---

# STEP 8 — Dashboard UI

Update dashboard page:

app/page.tsx

Display:

Total portfolio value
Client count
Asset allocation chart
Recent transactions
Goal progress cards

Use Recharts for charts.

---

# STEP 9 — Client CRM

Create page:

app/clients/page.tsx

Features:

Client list table
Client profile panel
Communication history

---

# STEP 10 — Portfolio Page

Create:

app/portfolio/page.tsx

Display:

Portfolio holdings
Asset allocation chart
Transaction history

---

# STEP 11 — Goals Page

Create:

app/goals/page.tsx

Features:

Create financial goals
Track goal progress
Show progress visualization

---

# STEP 12 — Task Management

Create:

app/tasks/page.tsx

Features:

Create tasks
Assign tasks to clients
Track status

---

# STEP 13 — Document Storage

Integrate Supabase Storage.

Create:

app/documents/page.tsx

Features:

Upload documents
Store file URL in documents table

---

# STEP 14 — Meeting Scheduler

Create:

app/calendar/page.tsx

Features:

Schedule client meetings
Store meeting links
Display upcoming meetings

---

# STEP 15 — Role Based Access

Implement role field in users table.

Roles:

advisor
admin
assistant

Restrict access based on role.

---

# STEP 16 — Seed Initial Data

Create:

scripts/seed.ts

Seed:

5 clients
3 portfolios
sample transactions
sample goals

---

# STEP 17 — Error Handling

Create centralized error handler.

apps/web/lib/errors.ts

---

# STEP 18 — Verify Integration

Ensure:

Supabase connection works
API routes return data
Dashboard displays real data

---

# FINAL RESULT

Running the application must show:

Working authentication
Client CRM system
Portfolio tracking
Task management
Goal tracking
API layer connected to Supabase
Charts displaying portfolio data
