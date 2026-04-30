# LexAI

A legal intelligence platform for solo lawyers, boutique firms, and in-house legal teams.

## Features

- **Dashboard** — KPIs, upcoming deadlines, recent activity, risk distribution.
- **Matters** — case/matter management with jurisdiction (India / UK / US).
- **Contract Drafting Engine** — AI generates a complete contract from a plain-English prompt.
- **Risk Scoring** — AI risk-scores contracts and surfaces flagged clauses.
- **Document Intelligence** — clause-by-clause analysis with severity and recommendations.
- **Deadline & Matter Tracker** — filings, court dates, statutes with priority.
- **Case Law Research** — AI synthesis with citations.
- **Client Brief Generator** — translates legalese to plain English.
- **Multi-Jurisdiction Mode** — India, UK, US, set per matter / contract / document.
- **Settings** — firm profile and default jurisdiction.
- **Authentication** — Clerk (Replit-managed). Public landing at `/`, sign-in at `/sign-in`, sign-up at `/sign-up`, app behind sign-in at `/app` and other resource routes. Sign-out via the sidebar user menu.

## Architecture

- **Frontend**: React + Vite (`artifacts/lexai`) at `/`. wouter, TanStack Query, shadcn/ui, Tailwind, react-hook-form + zod.
- **API**: Express 5 (`artifacts/api-server`) at `/api`. Routes per resource in `src/routes/`.
- **Database**: Postgres via Drizzle ORM (`lib/db`). Tables: matters, contracts, documents, deadlines, research_queries, briefs, settings. Every table has a `user_id text` column scoping rows to the signed-in Clerk user.
- **Contract**: OpenAPI-first in `lib/api-spec/openapi.yaml`. Codegen produces React Query hooks (`@workspace/api-client-react`) and Zod schemas (`@workspace/api-zod`).
- **AI**: OpenAI via the Replit AI Integration. Helpers live in `artifacts/api-server/src/lib/ai.ts` and a thin client in `src/lib/openai.ts`. Model: `gpt-5.4`.
- **Auth**: Clerk via `@clerk/react` (web) and `@clerk/express` (server). Proxy mounted at `/__clerk` in `app.ts`. Branded sign-in / sign-up pages defined in `src/pages/auth.tsx`; routing & `clerkAppearance` (Copper & Cream theme tokens) live in `src/App.tsx`. CSS layer order set in `src/index.css` and `tailwindcss({ optimize: false })` is required in `vite.config.ts` for production CSS layering.
- **Per-user data scoping**: `requireAuth` middleware in `artifacts/api-server/src/middlewares/requireAuth.ts` reads the Clerk session via `getAuth(req)` and attaches `req.userId`. It is mounted in `routes/index.ts` after `healthRouter` so every other route is protected (401 without a session). Each route filters SELECTs by `userId`, sets `userId` on INSERTs, and gates id-based ops by `(id, userId)`. Settings is auto-created blank per user on first GET. New accounts therefore start with an empty workspace.

## Common commands

- Regenerate API hooks/schemas after editing `lib/api-spec/openapi.yaml`:
  `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema after editing `lib/db/src/schema/*.ts`:
  `pnpm --filter @workspace/db run push`
- Typecheck composite libs: `pnpm run typecheck:libs`
- Typecheck the API server: `pnpm --filter @workspace/api-server run typecheck`

## Notes

- All AI endpoints are synchronous POSTs. The frontend shows a "thinking" disabled state while the call runs (~10–30s).
- Risk scores: 0–25 low, 26–50 medium, 51–75 high, 76–100 critical.
- Legacy seed rows have `user_id = NULL` and are invisible to all signed-in users; new accounts always start blank.
