# DHANFLOW – Codex Agent Instructions

You are an expert full-stack engineer.

lnjk
pnpm dev

and start a working web app.

---

# TECH STACK

Frontend
Next.js 16
React 19
TypeScript

Styling
TailwindCSS
ShadCN UI
Framer Motion

Backend
Supabase

Charts
Recharts
aaa
---

# STEP 1 — Create Web Application

Create a Next.js application inside:

apps/web

If the directory does not exist, create it.

Use:

Next.js App Router
TypeScript
TailwindCSS

Ensure the following structure exists:

apps/web

app/
layout.tsx
page.tsx

components/
ui/
dashboard/

lib/

styles/

package.json
tailwind.config.ts
tsconfig.json
next.config.js

---

# STEP 2 — Create Root Layout

Create:

app/layout.tsx

Layout must include:

Sidebar navigation
Top navigation bar
Content container

Navigation items:

Dashboard
Clients
Portfolio
Goals
AI Advisor
Analytics

---

# STEP 3 — Create Dashboard Page

Create:

app/page.tsx

This page must show:

Portfolio value card
AUM statistics
Asset allocation chart
Recent transactions
AI insights panel

Use glassmorphism UI style.

Use Tailwind + Framer Motion.

---

# STEP 4 — Create UI Components

Create reusable UI components in:

components/ui

Components:

GlassCard.tsx
StatCard.tsx
LiquidButton.tsx

Dashboard components:

PortfolioChart.tsx
AssetAllocationChart.tsx
RecentTransactions.tsx
AIInsightsPanel.tsx

Charts must use Recharts.

---

# STEP 5 — Configure Tailwind

Ensure Tailwind is configured.

Enable:

dark mode
glassmorphism utilities
gradient backgrounds

---

# STEP 6 — Supabase Integration

Create:

lib/supabase.ts

Initialize Supabase client using environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

---
# DHANFLOW BUILDER AGENT

You are a senior full-stack fintech engineer.

Your task is to build a **complete working web application** inside this repository.

The project name is **dhanflow**.

The app must run successfully with:

pnpm install
pnpm dev

and open at:

http://localhost:3000

If any required directories or files do not exist, you must create them.

---

# TECH STACK

Framework
Next.js (App Router)

Language
TypeScript

UI
TailwindCSS
ShadCN UI
Framer Motion

Charts
Recharts

Backend
Supabase

---

# STEP 1 — Create Web App

Create the application inside:

apps/web

If the folder does not exist, create it.

Initialize a Next.js project using:

App Router
TypeScript
TailwindCSS

Ensure the structure:

apps/web
  app
  components
  lib
  styles
  public

---

# STEP 2 — Required App Router Files

Create these files if missing:

apps/web/app/layout.tsx
apps/web/app/page.tsx

---

# STEP 3 — Root Layout

File:

app/layout.tsx

The layout must include:

Sidebar navigation
Top navbar
Main content area

Navigation items:

Dashboard
Clients
Portfolio
Goals
Analytics
AI Advisor

Use Tailwind for layout.

---

# STEP 4 — Dashboard Page

Create:

app/page.tsx

Dashboard must contain:

Portfolio Value card
Total AUM card
Asset Allocation chart
Recent Transactions table
AI Insights panel

Use glassmorphic UI style.

Add subtle animations using Framer Motion.

---

# STEP 5 — Create UI Components

Directory:

components/ui

Create:

GlassCard.tsx
StatCard.tsx
LiquidButton.tsx

GlassCard must implement:

backdrop blur
semi transparent background
border glow

---

# STEP 6 — Dashboard Components

Directory:

components/dashboard

Create:

PortfolioChart.tsx
AssetAllocationChart.tsx
RecentTransactions.tsx
AIInsightsPanel.tsx
Sidebar.tsx
Topbar.tsx

Charts must use **Recharts**.

---

# STEP 7 — Tailwind Configuration

Ensure Tailwind is configured in:

tailwind.config.ts

Enable:

dark mode
glassmorphism utilities
gradient backgrounds

Add utilities for:

backdrop blur
gradient borders
financial dashboard cards

---

# STEP 8 — Supabase Integration

Create:

lib/supabase.ts

Initialize Supabase client using:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

---

# STEP 9 — Data Hooks

Create folder:

lib/hooks

Hooks:

useClients.ts
usePortfolio.ts
useTransactions.ts

Each hook must fetch data from Supabase.

---

# STEP 10 — CRM Pages

Create pages:

app/clients/page.tsx
app/portfolio/page.tsx
app/goals/page.tsx
app/analytics/page.tsx

Clients page:

client list table
search
profile panel

Portfolio page:

holdings list
performance chart
asset allocation chart

Goals page:

goal cards
progress bars
timeline projections

Analytics page:

portfolio performance charts
benchmark comparison

---

# STEP 11 — AI Advisor Page

Create:

app/ai-advisor/page.tsx

This page must include:

chat interface
portfolio suggestions panel
market insights

For now use mock AI responses.

---

# STEP 12 — Styling

Use modern fintech style:

glassmorphism
liquid gradients
blur backgrounds
floating cards

Use Tailwind + Framer Motion.

---

# STEP 13 — Package.json Scripts

Ensure apps/web/package.json includes:

dev
build
start
lint

---

# STEP 14 — Ensure App Runs

After generating all files verify:

pnpm install
pnpm dev

starts a working web app.

If any dependencies are missing, add them.

Required packages include:

tailwindcss
framer-motion
recharts
@supabase/supabase-js
lucide-react
clsx
# STEP 7 — Create Data Hooks

Create:

lib/hooks

Hooks:

useClients.ts
usePortfolio.ts
useTransactions.ts

These should fetch data from Supabase tables.

---

# STEP 8 — Create CRM Pages

Create pages:

app/clients/page.tsx
app/portfolio/page.tsx
app/goals/page.tsx

Clients page:

client table
profile view
activity timeline

Portfolio page:

holdings list
portfolio performance chart
benchmark comparison

Goals page:

goal tracking cards
progress indicators

---

# STEP 9 — AI Advisor Page

Create:

app/ai-advisor/page.tsx

This page should include:

Chat interface
Portfolio suggestion panel
Risk insights

Use placeholder AI responses for now.

---

# STEP 10 — Create Navigation Sidebar

Create:

components/dashboard/Sidebar.tsx

Navigation links:

Dashboard
Clients
Portfolio
Goals
Analytics
AI Advisor

Sidebar must be responsive.

---

# STEP 11 — Styling

UI style must be:

Glassmorphic cards
Blur backgrounds
Gradient accents
Animated transitions

Use:

backdrop-blur
semi-transparent cards
Framer Motion animations

---

# STEP 12 — Ensure App Runs

After generating all files ensure:

pnpm install
pnpm dev

starts:

http://localhost:3000

without errors.

If necessary generate missing config files.

---

# FINAL RESULT

Running the app must show a working dashboard UI with:

Portfolio statistics
Charts
Client CRM table
Navigation sidebar
AI advisor page