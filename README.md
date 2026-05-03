
<p align="center">
  <img src="https://github.com/user-attachments/assets/1e7b265e-db01-4104-8ae0-e51aecd4c8d5" alt="LexAI Banner" width="100%" />
</p>

<h1 align="center">⚖️ LexAI</h1>

<p align="center">
  <strong>AI-powered Legal Intelligence Platform</strong><br/>
  Draft • Analyze • Research • Automate
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-B87333?style=for-the-badge&logo=typescript&logoColor=FDF6EC" />
  <img src="https://img.shields.io/badge/React-19-8C4A2F?style=for-the-badge&logo=react&logoColor=FDF6EC" />
  <img src="https://img.shields.io/badge/Node.js-Express-B87333?style=for-the-badge&logo=node.js&logoColor=FDF6EC" />
  <img src="https://img.shields.io/badge/PostgreSQL-DB-8C4A2F?style=for-the-badge&logo=postgresql&logoColor=FDF6EC" />
</p>

<p align="center">
  <sub>
    Built with React • TypeScript • Node.js • PostgreSQL • AI
  </sub>
</p>


<svg xmlns="http://www.w3.org/2000/svg" width="210" height="40" viewBox="0 0 210 40">
  <rect width="210" height="40" rx="10" fill="#B87333"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter, Arial, sans-serif" font-size="14" fill="#FDF6EC">
    🚀 Live Demo
  </text>
</svg>

<p align="center">
  <a href="https://lex-intelligence--mtiwari241905.replit.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Open-B87333?style=for-the-badge&logoColor=FDF6EC" />
  </a>
  <a href="https://github.com/MadhuTiwari-345/lex-intelligence">
    <img src="https://img.shields.io/badge/GitHub-Repository-8C4A2F?style=for-the-badge&logoColor=FDF6EC" />
  </a>
</p>

---

<p align="center">
  <i>
    The legal workspace that drafts, reviews, and researches alongside you.
  </i>
</p>

> AI-powered legal workflow automation for modern law firms and solo practitioners.  
> Draft contracts, research case law, track deadlines, and generate client briefs — all in one place.

---

<h2 align="center">📸 Product Preview</h2>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c1d411ef-df83-4e6f-85c8-f3ba20985302" width="90%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c64e4d5a-30ac-4466-9542-7a5fc8d2c1f2" width="45%" />
  <img src="https://github.com/user-attachments/assets/90cf511a-b1cf-4fd3-95d4-d3c50aaff942" width="45%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/18f360fa-5402-4165-9f50-aec2d00bdaa4" width="60%" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Database](#database)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

LexAI is a full-stack legal SaaS application that automates the most time-consuming parts of a lawyer's workflow. Built with a TypeScript monorepo architecture, it provides a clean React frontend, a robust Express API, and AI-powered features for contract drafting, case research, and client brief generation.

**Target users:** Solo lawyers, boutique firms, and in-house legal teams — primarily across India, UK, and US jurisdictions.

---

## Features

## ✨ What Makes LexAI Different

- ⚖️ **Legal-first AI** — Not generic LLM output, tuned for real workflows  
- ⚡ **Draft contracts in seconds** — From plain English to structured legal docs  
- 🧠 **Clause-level intelligence** — Risk scoring + rewrite suggestions  
- 🌍 **Multi-jurisdiction ready** — India, UK, US  
- 🔒 **Secure by design** — User-scoped data, private processing  

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Overview of active matters, upcoming deadlines, recent contracts, and activity feed |
| **Matters** | Full matter/case lifecycle management with status tracking |
| **Contracts** | AI-assisted contract drafting with risk scoring and clause analysis |
| **Documents** | Upload, store, and analyse legal documents with clause-by-clause intelligence |
| **Deadlines** | Court date and filing deadline tracker with priority and status management |
| **Research** | AI case law research with citation verification across jurisdiction databases |
| **Briefs** | One-click plain-English client brief generation from complex legalese |
| **Settings** | User profile, subscription plan management, and multi-jurisdiction preferences |

### AI Capabilities

- **Contract Drafting Engine** — Generate jurisdiction-compliant contracts from plain English in under 30 seconds
- **Document Intelligence** — Clause-by-clause risk analysis with HIGH / MEDIUM / LOW severity scoring
- **Case Law Research** — RAG-powered search across verified legal databases (Indian Kanoon, BAILII, CourtListener)
- **Client Brief Generator** — Three complexity levels: Basic, Standard, and Detailed
- **Risk Scoring** — Numeric 0–100 risk score per contract with flagged clauses and suggested rewrites
- **Multi-jurisdiction mode** — Switch between Indian, UK, and US law instantly

### Platform Features

- Clerk-based authentication with per-user data scoping
- Localised pricing for multiple countries with 2-year billing cycle
- Responsive UI with warm Copper & Cream design system
- Auto-generated TypeScript API client via Orval from OpenAPI spec

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| Vite | 7.x | Build tool and dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animations and transitions |
| TanStack Query | 5.x | Server state management |
| Wouter | — | Lightweight client-side routing |
| React Hook Form | — | Form state and validation |
| Zod | 3.x | Schema validation |
| Lucide React | 0.545.x | Icon library |
| shadcn/ui | — | Accessible component primitives |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js / Express | 5.x | HTTP API server |
| TypeScript | 5.9 | Type safety across the monorepo |
| Drizzle ORM | 0.45.x | Type-safe database queries |
| PostgreSQL | — | Primary database |
| Clerk | — | Authentication and user management |
| Orval | 8.5.3 | Auto-generated API client from OpenAPI |

### Fonts
- **Libre Baskerville** — Display / headings (serif authority)
- **Mulish** — Body text (clean, readable)
- **IBM Plex Mono** — Code, clause numbers, legal citations

---

## Project Structure

```
Lex-Intelligence/
├── artifacts/
│   ├── api-server/          # Express backend
│   │   ├── routes/
│   │   │   ├── index.ts     # Route aggregator with auth middleware
│   │   │   ├── dashboard.ts
│   │   │   ├── matters.ts
│   │   │   ├── contracts.ts
│   │   │   ├── documents.ts
│   │   │   ├── deadlines.ts
│   │   │   ├── research.ts
│   │   │   ├── briefs.ts
│   │   │   ├── settings.ts
│   │   │   └── health.ts
│   │   └── middlewares/
│   │       └── requireAuth.ts  # Clerk JWT verification
│   └── web-client/          # React frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── dashboard.tsx
│       │   │   ├── matters.tsx
│       │   │   ├── matter-detail.tsx
│       │   │   ├── contracts.tsx
│       │   │   ├── contract-detail.tsx
│       │   │   ├── documents.tsx
│       │   │   ├── document-detail.tsx
│       │   │   ├── deadlines.tsx
│       │   │   ├── research.tsx
│       │   │   ├── research-detail.tsx
│       │   │   ├── briefs.tsx
│       │   │   ├── brief-detail.tsx
│       │   │   ├── settings.tsx
│       │   │   └── not-found.tsx
│       │   └── components/
│       │       └── ui/      # shadcn/ui components
│       └── index.html       # Entry point with Google Fonts
├── lib/
│   ├── api-zod/             # Shared Zod schemas
│   ├── api-client-react/    # Orval-generated React Query hooks
│   └── db/                  # Drizzle ORM schema and migrations
├── pnpm-lock.yaml
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Clerk account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lex-intelligence.git
cd lex-intelligence

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5000` (API) and `http://localhost:5173` (frontend).

### Available Scripts

```bash
pnpm dev          # Start both frontend and backend in watch mode
pnpm build        # Build for production
pnpm db:migrate   # Run Drizzle migrations
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
pnpm type-check   # Run TypeScript compiler check
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lexai

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...

# AI Provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
```

---

## API Reference

All routes except `/health` require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check — returns `{ status: "ok" }` |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/summary` | Aggregate stats: matters, contracts, deadlines, briefs |

### Matters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/matters` | List all matters (filterable by `status`) |
| `POST` | `/matters` | Create a new matter |
| `GET` | `/matters/:id` | Get matter detail |
| `PATCH` | `/matters/:id` | Update matter |
| `DELETE` | `/matters/:id` | Delete matter |

### Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contracts` | List contracts |
| `POST` | `/contracts` | Draft a new contract (AI-generated) |
| `GET` | `/contracts/:id` | Get contract with risk analysis |
| `PATCH` | `/contracts/:id` | Update contract |
| `DELETE` | `/contracts/:id` | Delete contract |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/documents` | List uploaded documents |
| `POST` | `/documents` | Upload and analyse a document |
| `GET` | `/documents/:id` | Get document with clause analysis |
| `DELETE` | `/documents/:id` | Delete document |

### Deadlines

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/deadlines` | List deadlines (filterable by `priority`, `status`, `type`) |
| `POST` | `/deadlines` | Create deadline |
| `PATCH` | `/deadlines/:id` | Update deadline status |
| `DELETE` | `/deadlines/:id` | Delete deadline |

### Research

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/research` | List research sessions |
| `POST` | `/research` | Start a new case law research query |
| `GET` | `/research/:id` | Get research detail with citations |

### Briefs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/briefs` | List client briefs |
| `POST` | `/briefs` | Generate a brief from legalese (complexity: `basic` \| `standard` \| `detailed`) |
| `GET` | `/briefs/:id` | Get brief detail |
| `DELETE` | `/briefs/:id` | Delete brief |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings` | Get user settings and plan |
| `PATCH` | `/settings` | Update preferences and jurisdiction |

---

## Authentication

LexAI uses [Clerk](https://clerk.com) for authentication. Every authenticated route passes through the `requireAuth` middleware, which:

1. Verifies the Clerk JWT from the `Authorization` header
2. Extracts the `userId` and scopes all database queries to that user
3. Returns `401 Unauthorized` if the token is missing or invalid

All user data is isolated — users can only access their own matters, contracts, documents, deadlines, research, and briefs.

---

## Database

LexAI uses **PostgreSQL** with **Drizzle ORM** for type-safe, migration-tracked database access.

### Key Models

```
User settings     → jurisdiction, plan tier, preferences
Matters           → id, userId, title, status, clientName, createdAt
Contracts         → id, userId, matterId?, type, content, riskScore, jurisdiction
Documents         → id, userId, matterId?, s3Key, status, analysisResult (JSONB)
Deadlines         → id, userId, matterId?, title, dueDate, type, status, priority
Research          → id, userId, query, jurisdiction, results, citations
Briefs            → id, userId, matterId?, title, complexity, originalText, output
```

### Deadline Types
`court_date` | `filing_deadline` | `statute_of_limitations` | `contract_expiry` | `other`

### Brief Complexity Levels
`basic` | `standard` | `detailed`

---

## Deployment

LexAI was built and deployed on **Replit** using Replit's autoscale deployment infrastructure.

### Replit Deployment

The app is configured for Replit's deployment pipeline with:
- Automatic builds on push to `main`
- Environment secrets managed via Replit Secrets
- PostgreSQL via Replit's managed database

### Self-hosted / Custom Deployment

```bash
# Build
pnpm build

# Set production env vars, then:
node dist/server/index.js
```

Recommended infrastructure for self-hosting:
- **Frontend:** Vercel or Cloudflare Pages
- **Backend:** Railway, Render, or AWS App Runner
- **Database:** Supabase, Neon, or AWS RDS (PostgreSQL)
- **File storage:** AWS S3 or Cloudflare R2 (for document uploads)

---

## 🧠 Why LexAI?

Legal work is:
- Repetitive  
- Time-consuming  
- Expensive  

LexAI reduces hours of manual effort into minutes — without compromising accuracy.

Instead of juggling tools, lawyers get a **single intelligent workspace**.

---
## Roadmap

- [ ] **Word / DOCX export** for drafted contracts
- [ ] **PDF generation** for client briefs
- [ ] **Team collaboration** — share matters across firm accounts
- [ ] **Calendar sync** — Google Calendar / Outlook for deadline alerts
- [ ] **Stripe billing** — live payment integration for plan upgrades
- [ ] **Fine-tuned models** — jurisdiction-specific AI fine-tuning for IN/UK/US law
- [ ] **Mobile app** — React Native companion for on-the-go brief review
- [ ] **SOC 2 Type II** compliance certification

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please run `pnpm lint` and `pnpm type-check` before submitting.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🏁 Conclusion

LexAI is not just another AI tool.

It’s a **legal operating system** built for:
- Speed
- Accuracy
- Real-world usage

If you're building in legal tech — this is a serious foundation.

---


<div align="center">
  <strong>Built with ⚖️ by the LexAI team</strong><br>
  <sub>Making AI accessible to every lawyer, not just Big Law.</sub>
</div>

---
