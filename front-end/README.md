# Church Attendance (COC Ikeja)

A Next.js (App Router) web app scaffold for managing church attendance.

The UI and page flow are based on the product spec in:

`../church attendance web app pages.txt`

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS**

## Features Implemented (Scaffold)

- **Route groups**
  - `(auth)` for unauthenticated pages (e.g. `/login`)
  - `(app)` for authenticated pages (sidebar + topbar shell)
- **Simple auth (demo)**
  - `POST /api/auth/login` sets an HTTP-only cookie: `ca_session`
  - `POST /api/auth/logout` clears `ca_session`
  - Route protection is **currently disabled** (see "Auth Notes")
- **Selected service (in-memory)**
  - Stored in a client context with `sessionStorage` persistence
  - Available in the topbar dropdown and on the service selection page

## Getting Started (Local Dev)

### Prerequisites

- Node.js 20+
- npm 10+

### Install

From this folder (`Front-end/church-attendance`):

```bash
npm install
```

### Run

```bash
npm run dev
```

Then open:

`http://localhost:3000`

## Scripts

- **`npm run dev`**: start dev server
- **`npm run build`**: production build
- **`npm run start`**: run production server
- **`npm run lint`**: ESLint
- **`npm run typecheck`**: TypeScript typecheck (`tsc --noEmit`)

## Main Routes

### Auth

- `/login`

### App

- `/dashboard`
- `/services/today`
- `/check-in`
- `/check-in/confirmation`
- `/people/new`
- `/members`
- `/people/[personId]`
- `/people/[personId]/attendance-history`
- `/people/[personId]/notes`
- `/people/[personId]/edit`
- `/attendance-log`
- `/import-export`
- `/analytics`
- `/reports`
- `/follow-ups`
- `/settings`
- `/settings/church-profile`
- `/settings/services-setup`
- `/settings/backup-export`
- `/settings/audit-log`

## Auth Notes (Demo)

This is a **placeholder authentication** implementation:

- Any non-empty email + password will return `ok: true` and set a cookie.
- There is no user database, roles, or password reset yet.

### Route Protection (currently disabled)

Route protection/redirects are intentionally **not enforced** right now, since the plan is to call a dedicated backend (to be added later).

When you’re ready to re-enable protection, the main place to wire it in is:

- `app/(app)/layout.tsx` (check auth/session and redirect to `/login`)

## Backend Wiring

Client-side API calls (login/logout) use the helper:

- `app/lib/api.ts` (`apiFetch`)

To point the frontend at your dedicated backend, set:

`NEXT_PUBLIC_API_BASE_URL`

Example (backend on `http://localhost:4000`):

```bash
set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Notes:

- `apiFetch` always uses `credentials: "include"` to support cookie-based sessions.
- If your backend is on a different origin, it must enable CORS with credentials.

## Selected Service Notes

- The “service for today” selection is stored in `sessionStorage`.
- The provider lives in `app/(app)/selected-service.tsx`.

## Next Steps (Suggested)

- Replace demo auth with real authentication and role-based access.
- Persist services, people, and attendance records to a database (e.g. Postgres + Prisma).
- Add exports (CSV/Excel/PDF) for reports and attendance logs.
- Add import validation + detailed import error reporting.

