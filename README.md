# Church Attendance Tracking System

A web app for tracking member attendance at church events, with zone-based organisation and role-based access (admin, secretariat, zonal leader, member).

---

## Repo structure

```
church-attendance-system/
├── backend/     Database schema (Drizzle), migrations, auth helpers, seed
├── frontend/    Next.js app (to be added)
└── docs/        PRD, frontend handoff, and other documentation
```

- **Backend** — Not deployed. Used for schema changes, migrations, and as the source of truth for auth/schema logic the front-end can reuse.
- **Front-end** — Next.js app in `front-end/`; deploy to Vercel; talks to Supabase (Postgres + Auth).
- **Database** — Supabase (PostgreSQL). Migrations are run via Drizzle from the backend.

**Deployment:** See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Vercel + Supabase deployment steps.

---

## Prerequisites

- **Node.js** 18+
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** — `npm install -g supabase`

---

## Backend setup (local)

### 1. Start local Supabase

From the project root:

```bash
supabase start
```

Use the printed **Database URL** and **API keys** in the next step.

### 2. Environment

In `backend/` copy `.env.example` to `.env` and set:

- `DATABASE_URL` — Postgres URL (e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres` from `supabase start`)
- `SUPABASE_URL` — e.g. `http://127.0.0.1:54321`
- `SUPABASE_ANON_KEY` — from `supabase start`
- `SUPABASE_SERVICE_ROLE_KEY` — from `supabase start`

### 3. Install dependencies and run migrations

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

### 4. Seed admin (for login)

- **Email:** `admin@church.org` or `dan@gmail.com`
- **Password:** `admin123456` or `Dinn5678` respectively

Use these with Supabase Auth in the frontend. Change in production.

---

## Backend scripts

| Command | Description |
|--------|-------------|
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:push` | Push schema directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio to browse data |
| `npm run db:seed` | Seed zones, admin user, and sample members |

---

## Documentation

- **[docs/PRD.md](docs/PRD.md)** — Product and technical requirements, data models, roles, and features.
- **[docs/FRONTEND_HANDOFF.md](docs/FRONTEND_HANDOFF.md)** — For frontend devs: schema copy, env vars, auth, and how to call backend logic from the app.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, TypeScript |
| Backend / DB | Drizzle ORM, Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel (frontend) |
