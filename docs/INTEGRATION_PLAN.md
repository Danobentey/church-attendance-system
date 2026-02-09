# Front-end / Backend Integration Plan

This plan connects the existing **front-end** (Next.js app in `front-end/`) to the **backend** (Drizzle schema, Supabase Auth, Postgres). The front-end currently uses mock login and static data.

---

## Current state

| Area | Front-end now | Backend provides |
|------|----------------|------------------|
| **Folder** | `front-end/` (not `frontend/`) | — |
| **Login** | POST `/api/auth/login` sets cookie `ca_session` (no validation) | Supabase Auth + `public.users` (role, zoneId) |
| **Data** | Hardcoded members, placeholder dashboard, “Save (placeholder)” on Add Person | Drizzle schema, `createMember`, `createLoginableUser`, events, attendance |
| **Terms** | “Service”, “Department” | Event, Zone |
| **Auth check** | None (app routes are open) | — |

---

## 1. Naming and mapping

- **Service** (UI) → **Event** (DB). Keep “Service” in the UI if the dev prefers; map to `events` table.
- **Department** (UI) → **Zone** (DB). Member list filter “Department (all)” becomes “Zone (all)” and options come from `zones`. “Department / Unit” on Add Member can be a zone selector.
- **Check-in** → recording **attendance** (event + user/guest + zone).

No need to change every label; ensure API and DB use Event/Zone.

---

## 2. Dependencies and environment

**In `front-end/`:**
- Add: `@supabase/supabase-js`, `drizzle-orm`, `postgres`, `dotenv` (or rely on Next env).
- Env (e.g. `.env.local`):
  - `DATABASE_URL` — Postgres (same as backend; server-only).
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key.
  - `SUPABASE_SERVICE_ROLE_KEY` — Server-only; for creating auth users (invite flow) and any admin actions.

Remove or repurpose `NEXT_PUBLIC_API_BASE_URL` once data comes from Server Actions + DB instead of an external API.

---

## 3. Schema and DB in the front-end

- Copy `backend/src/db/schema/*` into `front-end/src/lib/db/schema/` (or `front-end/app/lib/db/schema/`) and fix relative imports between schema files only.
- Create a server-only DB client (e.g. `front-end/app/lib/db/index.ts`) using `drizzle-orm` + `postgres` and `DATABASE_URL`, with the copied schema. Use this only in Server Components, Server Actions, and Route Handlers.

---

## 4. Real authentication

**Login:**
- Replace the current login flow with Supabase Auth: `signInWithPassword({ email, password })` (client-side with `NEXT_PUBLIC_SUPABASE_*`).
- On success, redirect to `/dashboard` (and optionally set a short-lived cookie for server-side checks if needed).

**Session and profile:**
- Use Supabase client `getSession()` / `onAuthStateChange` to know if the user is logged in.
- After login, load profile from `public.users` by `session.user.id` (e.g. in a Server Action or server layout) to get `role` and `zoneId`. Use this for:
  - Role-based UI (admin vs secretariat vs zonal leader).
  - Zone-scoped data (e.g. members list for zonal leader = only their zone).

**Logout:**
- Call `supabase.auth.signOut()` and redirect to `/login`. Remove or repurpose `/api/auth/logout` so it no longer implies a custom session.

**Optional:** Keep “Remember me” by tuning Supabase session persistence (e.g. local storage vs session storage).

---

## 5. Route protection

- Add **middleware** (or layout-level check) that:
  - Allows public access only to `/login` (and maybe `/`, which redirects to login).
  - For routes under `(app)/`, requires a valid Supabase session; otherwise redirect to `/login`.
- Use the loaded profile (role/zoneId) in layouts or Server Actions to hide/disable links or data that the user is not allowed to see (e.g. Settings for admin only; member list filtered by zone for zonal leader).

---

## 6. Dashboard

- Replace placeholder stats with real data from the DB (via Server Actions or server component):
  - Total attendance (e.g. count for “today” or selected date range).
  - First timers / guests (count from `guests` or attendance where guest_id is set).
  - Members (count `users` where role = member).
  - Guests (count `guests` or attendance by guest_id).
- Respect role/zone: e.g. zonal leader sees counts for their zone only.

---

## 7. Member list

- Replace hardcoded `members` with a query: `users` where `role = 'member'`, optionally filtered by `zoneId` (and search by name/phone).
- Map to current table: name (firstName + lastName), phone, lastAttendance (e.g. latest `attendance` row for that user, or “—” if none).
- “Department (all)” dropdown → Zone selector; options from `zones` table. For zonal leader, only their zone (or single option).

---

## 8. Add Member / Guest

- **Member:** On Save, call backend logic equivalent to `createMember({ firstName, lastName, phoneNumber, email?, zoneId?, ... })`. Split “Full name” into first/last (or store in one field and split; backend expects firstName/lastName). “Department / Unit” → zone selector; required for member so we can assign `zoneIdentifier` (e.g. EGB001).
- **Guest:** Insert into `guests` (firstName, lastName, phone, email, congregation, address, etc.). No zone required for guest record; zone can be set when recording attendance.
- Implement as Server Actions that use the shared DB client and, for members, the same zone-identifier logic as in the backend (copy or reuse `generateZoneIdentifier` + `createMember` logic).

---

## 9. Services (events) and Check-in (attendance)

- **Services/today:** List/create events (from `events`) for today (or selected date). “Create / Select Service” → create or select an event; store selected event (e.g. in context or URL) for check-in.
- **Check-in:** For the selected event, show members (and optionally guests) by zone; allow marking present. Insert rows into `attendance` (event_id, user_id or guest_id, zone_id, recorded_by = current user id). Enforce: zonal leader only for their zone; secretariat/admin for any zone.

This can be phased: first “select event + list members by zone,” then “mark present” and persist.

---

## 10. Order of implementation

1. **Env and schema** — Add Supabase and Drizzle deps, env vars, copy schema, add DB client in front-end.
2. **Auth** — Supabase login/logout, load profile from `public.users`, optional middleware for route protection.
3. **Route protection** — Middleware (or layout) so app routes require a valid session.
4. **Dashboard** — Real counts from DB, scoped by role/zone.
5. **Members list** — Real data from `users`, zone filter, lastAttendance.
6. **Add Person** — createMember and insert guest with Server Actions.
7. **Services (events)** — List/create events, select for today.
8. **Check-in** — Mark attendance for selected event by zone; persist to `attendance`.

---

## 11. Docs and repo

- Update **README** (root and/or front-end) to mention that the app lives in `front-end/`.
- Keep **FRONTEND_HANDOFF.md** as the reference for schema copy, env, and auth helpers; point front-end dev to this integration plan for the wiring steps above.
