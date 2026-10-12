# Testimonial SaaS

A multi-user SaaS for collecting, managing, and displaying customer testimonials. Owners create **Spaces** (collection campaigns), share a public link where customers submit testimonials without an account, curate submissions in an inbox, and embed a "Wall of Love" widget on any website. Free and Pro plans are billed through Stripe.

The full specification lives in [PRD/testimonial_saas_prd.md](PRD/testimonial_saas_prd.md), and the sprint plan in [wbs_and_development_plan.md](wbs_and_development_plan.md).

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16.4 (App Router), React 19.3, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon or local) via **Prisma 8** (`@prisma/orm-postgres`) |
| Auth | Custom JWT session cookie (`jose` + `bcryptjs`), enforced in `src/middleware.ts` |
| Payments | Stripe Checkout + webhooks (test mode) |
| Uploads | Vercel Blob, with a local `public/uploads/` fallback in development |
| Charts | Recharts |

## How to run the project

### Prerequisites

- Node.js 20+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works, or local Postgres)
- A Stripe account in **test mode** (only needed for the upgrade flow)

### 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma skills sync`, which copies the Prisma 8 agent skills into `.claude/`, `.cursor/`, `.agents/`, and `.devin/` (see [Agentic tools](#agentic-tools-used)).

### 2. Configure environment variables

Create a `.env` file in the project root (it is git-ignored):

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/testimonial_saas"

# Auth — secret used to sign session JWTs (use a long random string)
JWT_SECRET="generate_a_strong_random_secret_here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRO_PRICE_ID="price_..."        # recurring price for the Pro plan
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional — Vercel Blob for profile photo uploads.
# If unset, uploads are written to public/uploads/ (development only).
BLOB_READ_WRITE_TOKEN=""
```

### 3. Create the database schema

The schema is defined in [src/prisma/contract.prisma](src/prisma/contract.prisma) and the initial migration is in [migrations/app/](migrations/app/). `prisma.config.ts` reads `DATABASE_URL` from `.env`, so you can apply it with:

```bash
npx prisma db migrate
```

After changing `contract.prisma`, re-emit the contract and plan a new migration:

```bash
npx prisma contract emit
npx prisma migration plan --name <change_name>
npx prisma db migrate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and create your first Space.

### 5. (Optional) Forward Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`. Upgrades work locally without this (the checkout return is verified with Stripe's API), but cancellations and payment failures only arrive via the webhook.

### Other commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `GET /api/health` | Health check endpoint |

## Feature status

Status is measured against the PRD's functional requirements (FR-01 – FR-11).

✅ Done · 🟡 Partial · ❌ Not started

| Area | Status | Notes |
|------|:------:|-------|
| **FR-01 Authentication** | ✅ | Register (signs the user in), login, logout; case-insensitive emails; bcrypt-hashed passwords; JWT cookie; middleware protects `/dashboard`; ownership checks on all private API routes. |
| **FR-02 Dashboard** | ✅ | Totals for spaces / testimonials / featured, recent activity, daily chart with 7/30/90-day ranges, Free-plan upgrade banner. |
| **FR-03 Space management** | ✅ | Create, view, edit, delete; unique slug with collision handling; space limit (3 Free / 25 Pro) enforced on the server. |
| **FR-04 Form configuration** | 🟡 | Fields can be enabled/disabled and marked required; rating toggle works. **Only 7 themes** exist (`default`, `dark`, `light`, `glass`, `neon`, `brutal`, `corporate`) — the PRD asks for 25. |
| **FR-05 Public submission** | 🟡 | `/space/[slug]` form with enabled fields, star rating, photo upload, and an optional consent checkbox. Server only validates name, email, and text — optional fields marked required are not checked server-side. No rate limiting on the public endpoint. |
| **FR-06 Testimonial inbox** | 🟡 | List, text/name/email search, filters (all / favorite / featured / hidden), feature, favorite, hide, soft delete with confirmation, pagination. **Missing:** filters by space, rating, and date; overflow menu. |
| **FR-07 Public display** | 🟡 | Widget shows only testimonials with sharing consent; hidden and deleted are excluded; featured shown first; emails never shown. The inbox marks private (no-consent) testimonials. **Missing:** the public Space page shows only the form, not testimonials. |
| **FR-08 Widget builder** | ✅ | Masonry, Carousel, and Grid layouts; light/dark mode; background color; live preview (refreshes after save); embed code via `public/widget.js` with a copy button. The `animation` field exists in the DB but has no UI or effect yet. |
| **FR-09 Plan limits** | ✅ | Enforced on the server: 3 / 25 spaces per account and 100 / 1,000 testimonials per space (Free / Pro). Deleted testimonials don't count toward the limit. |
| **FR-10 Billing & Stripe** | ✅ | Stripe Checkout upgrade; after redirect, `/api/stripe/confirm` verifies the session with Stripe's API before activating Pro. Verified webhook (`/api/webhooks/stripe`) syncs `checkout.session.completed` and `customer.subscription.*` (active, past_due, canceled). Billing card shows real plan, status, and renewal date; Pro users manage/cancel via the Stripe Customer Portal. |
| **FR-11 Security** | 🟡 | Auth + ownership checks, server-side limits, hashed passwords, secrets in env vars, webhook signature verification and duplicate-event handling via `WebhookEvent`. **Missing:** schema-based input validation, rate limiting. `JWT_SECRET` falls back to a hard-coded default if unset. |
| **Account settings** | ✅ | Change name and password (current password required). |
| **Automated tests** | ❌ | No Playwright or unit tests yet (PRD acceptance criterion #12). |
| **CI pipeline** | ❌ | No CI config yet. |

### Suggested next steps

1. Validate all configured required fields on the server and add rate limiting to `POST /api/spaces/[id]/testimonials`.
2. Add Playwright tests for the acceptance criteria.
3. Add the inbox filters (space, rating, date) and overflow menu.
4. Expand themes to 25 and add widget animations.

## Agentic tools used

| Tool | Type | Where / how it was used |
|------|------|-------------------------|
| **Google Antigravity** (Gemini 3.1) | AI coding agent / IDE | Main development agent. Turned the PRD into the WBS & sprint plan ([wbs_and_development_plan.md](wbs_and_development_plan.md)) and implemented the app — data model, API routes, dashboard, inbox, widget builder, Stripe checkout, and UI (commit `04f5000`). |
| **Prisma 8 agent skills** (`prisma-8`, `prisma-composer-core-concepts`, `prisma-platform-core-concepts`) | Skills | Installed by `prisma skills sync` (the `postinstall` script) and configured in [prisma.config.ts](prisma.config.ts) (`skills.agents`). Synced into [.agents/skills/](.agents/skills/), [.claude/skills/](.claude/skills/), [.cursor/skills/](.cursor/skills/), and [.devin/skills/](.devin/skills/) so any agent knows Prisma 8's contract, migration, and query APIs (which differ from Prisma ≤7). |
| **[AGENTS.md](AGENTS.md)** | Agent instructions file | Generated by `next dev`. Tells agents that Next.js 16 differs from their training data and to read `node_modules/next/dist/docs/` before writing code. |
| **Project instructions in the PRD** | Agent rules | The "Project Instructions" section at the end of the [PRD](PRD/testimonial_saas_prd.md) sets the agent's workflow: plan → implement → verify, one feature at a time, server-side validation, no secrets committed, ask before destructive DB operations. |
| **Claude Code** (Claude Opus 5.5, VS Code extension) | AI coding agent | Audited the codebase against the PRD and wrote this README. |

**Not used:** no hooks, no MCP servers, and no subagents are configured in this project.

## Project structure

```
src/
├── app/
│   ├── api/                  # REST routes: auth, spaces, testimonials, widget, upload, stripe, webhooks
│   ├── dashboard/            # Authenticated app: stats, spaces, inbox, widget builder, settings
│   ├── space/[slug]/         # Public testimonial collection form
│   ├── w/[spaceId]/          # Public widget page (loaded in an iframe by widget.js)
│   ├── login/, register/     # Auth pages
│   └── page.tsx              # Landing page
├── lib/                      # auth (JWT), stripe client, API response helpers, slugify
├── prisma/                   # contract.prisma (schema), generated contract, db client
└── middleware.ts             # Route protection
public/widget.js              # Embeddable script that injects the widget iframe
migrations/                   # Prisma 8 migrations
PRD/                          # Product requirements
```
