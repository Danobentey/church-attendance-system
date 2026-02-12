# Frontend handoff

This doc is for the developer building the Next.js frontend. It describes how to use the backend schema, database, and auth from the frontend app.

---

## 1. Project layout

- **`backend/`** — Database schema (Drizzle), migrations, auth helpers, seed. Not deployed; used for migrations and as the source of truth for schema and utilities.
- **`frontend/`** — Next.js app (your work). It talks to the same Supabase Postgres and Supabase Auth.

---

## 2. Schema in the frontend

Copy the schema files from the backend into the frontend so you can use Drizzle and shared types.

**Copy these files as-is into `frontend/src/lib/db/schema/` (or equivalent):**

- `backend/src/db/schema/enums.ts`
- `backend/src/db/schema/zones.ts`
- `backend/src/db/schema/users.ts`
- `backend/src/db/schema/events.ts`
- `backend/src/db/schema/guests.ts`
- `backend/src/db/schema/attendance.ts`
- `backend/src/db/schema/index.ts`

**Adjust imports:** Update relative imports in those files so they point to each other correctly inside `frontend/src/lib/db/schema/` (e.g. `./enums`, `./zones`). Do not import from `../db/index` or `../lib/` in the schema files; the frontend will have its own `db` and `lib` setup.

---

## 3. Database connection (frontend)

Install in the frontend:

```bash
npm install drizzle-orm postgres
```

Create `frontend/src/lib/db/index.ts` (or equivalent):

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

Use this `db` only in **server code** (Server Actions, Route Handlers, server components). Never expose `DATABASE_URL` to the client.

---

## 4. Environment variables

In `frontend/.env.local` (and in Vercel for production):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres connection string (same as backend). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (for Auth in the browser). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (for Auth in the browser). |

For creating loginable users (admin/secretariat/zonal leader) from the server, you will also need the **service role key** in a server-only env (e.g. `SUPABASE_SERVICE_ROLE_KEY`) so the frontend can call the same “create auth user + insert profile” logic. Options:

- Reimplement the backend’s `createLoginableUser` in the frontend repo (copy from `backend/src/lib/auth.ts` and `backend/src/lib/zone-identifier.ts`, plus Supabase admin client), and call it from a Server Action, or  
- Depend on a shared package / backend API that exposes this later.

---

## 5. Auth: login and profile

- **Login** — Use Supabase Auth in the frontend (e.g. `@supabase/supabase-js`): `signInWithPassword({ email, password })`. No password is stored in your app DB; Supabase Auth holds it.
- **After login** — Use the session’s user id (`session.user.id`) to load the app profile from `public.users` (role, zone, etc.) via Drizzle in a Server Action or server component.

Example pattern:

```ts
// In a Server Action or server component
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const profile = await db.query.users.findFirst({
  where: eq(users.id, session.user.id),
});
// profile.role, profile.zoneId, etc.
```

Redirect or render based on `profile.role` (admin, secretariat, zonal_leader). Members do not log in; they only exist as rows in `public.users`.

---

## 6. Creating users from the frontend

**Loginable users (admin, secretariat, zonal_leader)**  
- Backend provides `createLoginableUser(email, password, role, profile)`. It creates the Supabase Auth user and a row in `public.users` with the same `id`.  
- Copy that logic (and `generateZoneIdentifier`, plus Supabase admin client) into the frontend and call it from a Server Action (e.g. “Invite user” flow). Only admin should be able to call it; enforce in the Action.

**Members (no login)**  
- Backend provides `createMember(profile)`. It only inserts into `public.users` with `role: "member"` and an optional `zoneId` (zone identifier is generated when `zoneId` is present).  
- Copy that logic into the frontend and call it from a Server Action (e.g. “Register new member”). Enforce permissions in the Action (secretariat: any zone; zonal_leader: own zone only).

---

## 7. Seed admin (local / staging)

After running backend migrations and seed:

- **Email:** `admin@church.org` or `dan@gmail.com` (after seed)  
- **Password:** `admin123456` or `Dinn5678` respectively  

Use this to sign in via Supabase Auth in the frontend. Change the password in production.

---

## 8. RLS (Row Level Security)

Supabase RLS is enabled on `users`, `zones`, `events`, `guests`, and `attendance`. It applies when the database is accessed **with the Supabase client and the user’s JWT** (e.g. PostgREST with anon key + session). It does **not** apply when the frontend uses a direct Postgres connection (e.g. Drizzle with `DATABASE_URL`). So:

- When you use **Drizzle in Server Actions**, enforce “who can see/edit what” in application code (e.g. check `profile.role` and `profile.zoneId` before queries/mutations).
- When you use the **Supabase JS client** (e.g. `supabase.from('users').select()`) with the user’s session, RLS will restrict rows by role and zone automatically.

---

## 9. PRD and migrations

- Full product and data model: **`docs/PRD.md`**  
- Schema changes: add or edit files under `backend/src/db/schema/`, then run in the backend repo:
  - `npm run db:generate`
  - `npm run db:migrate`  
  Then copy the updated schema files into the frontend again and adjust imports as in section 2.
