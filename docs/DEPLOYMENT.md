# Deployment: Vercel + Supabase

This guide covers deploying the Church Attendance app to **Vercel** (Next.js front-end) and **Supabase** (Auth + Postgres).

---

## Current setup

**Supabase currently runs only locally** (`supabase start`). Your `.env` points at local URLs (e.g. `http://127.0.0.1:54321`, port `54322` for Postgres). That is fine for development.

**To deploy**, you need a **hosted Supabase project** in the cloud. Create one at [supabase.com](https://supabase.com) (free tier is enough to start). The steps below assume you are creating or using that hosted project for Vercel.

**→ Step-by-step for an existing project:** See **[SUPABASE_HOSTED_WALKTHROUGH.md](SUPABASE_HOSTED_WALKTHROUGH.md)** for a full walkthrough (get credentials, run migrations, optional seed).

---

## 1. Supabase (hosted)

### 1.1 Create a hosted project

1. Go to [supabase.com](https://supabase.com) → sign in → Dashboard → **New project**.
2. Pick organization, name (e.g. `church-attendance`), database password, region.
3. Wait for the project to be ready.

You will use this project’s **URL** and **keys** in Vercel (and for migrations). Your local Supabase stays for dev only.

### 1.2 Get credentials

In the project:

- **Settings → API**: copy **Project URL** and **anon public** key.
- **Settings → Database**: under **Connection string**, choose **URI** and copy it.  
  For serverless (Vercel), use **Connection pooling** with **Transaction** mode (port **6543**) so the app can use a single connection string for many serverless invocations.

Example pooled URI (replace password and ref):

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Keep the non-pooled URI (port 5432) for running migrations from your machine.

### 1.3 Run database migrations

From your machine, using the **non-pooled** connection string (port 5432) so Drizzle can run migrations:

```bash
cd backend
# Set DATABASE_URL to your Supabase Postgres URI (port 5432)
# Windows (PowerShell):
$env:DATABASE_URL = "postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
# Then:
npm run db:migrate
```

Or run the SQL by hand in Supabase **SQL Editor**: open each file under `backend/drizzle/` in order (`0000_*.sql`, `0001_*.sql`, `0002_*.sql`) and run them.

### 1.4 (Optional) Seed data

To create zones and an admin user:

```bash
cd backend
# Set DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role)
npm run db:seed
```

Admin users (change in production): **admin@church.org** / **admin123456**, or **dan@gmail.com** / **Dinn5678** (both seeded by `db:seed`).

### 1.5 Auth settings (production URL)

After you have a Vercel URL:

- **Authentication → URL Configuration**: set **Site URL** to your production URL (e.g. `https://your-app.vercel.app`) and add the same under **Redirect URLs** if you use redirects.

---

## 2. Vercel

### 2.1 Import the repo

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import the Git repository (e.g. GitHub: `Danobentey/church-attendance-system`).
3. **Root Directory**: set to **`front-end`** (not the repo root).  
   Click **Edit** next to “Root Directory” and choose `front-end`.
4. **Framework**: leave as **Next.js** (auto-detected).
5. **Build Command**: `npm run build` (default).
6. **Output Directory**: leave default (`.next`).
7. Do **not** deploy yet; add environment variables first.

### 2.2 Environment variables

In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your Supabase **pooled** connection string (port **6543**, `?pgbouncer=true`) | Server-only; used by Drizzle in Server Components/Actions. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project URL** | Exposed to the client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon** key | Exposed to the client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key | Optional; only if you add server-side admin auth (e.g. creating users). Server-only. |

Apply these to **Production** (and **Preview** if you want staging/preview deployments to use the same or a separate Supabase project).

### 2.3 Deploy

- **Production**: push to `main` or trigger **Redeploy** in Vercel.
- **Staging**: connect the **staging** branch in Vercel (same project or a second project). Use the same env vars or a separate Supabase project for staging.

### 2.4 Branch settings (optional)

- **Production branch**: `main`.
- **Preview branches**: enable for `staging` and others; each push creates a preview URL. You can set **staging** as the “staging” deployment in Vercel if you use one project for both.

---

## 3. After first deploy

1. In Supabase **Authentication → URL Configuration**, set **Site URL** and **Redirect URLs** to your Vercel URL(s).
2. Test login (e.g. with the seeded admin user if you ran `db:seed`).
3. If you use a custom domain, add it in Vercel and update Supabase redirect URLs.

**If you see "Application error: a server-side exception" after login** (e.g. on `/dashboard`), the app is failing when loading server data. Most often **`DATABASE_URL` is missing or wrong** in Vercel. Check: (1) Vercel → Project → Settings → Environment Variables: `DATABASE_URL` must be set and must be the **pooled** connection string (port **6543**). (2) Redeploy after adding or changing env vars. (3) In Vercel, open the deployment → **Functions** or **Logs** to see the actual server error message.

---

## 4. Staging vs production

- **Same Supabase project**: use one set of env vars; staging and production share the same database. Easiest, but staging can affect production data.
- **Separate Supabase project**: create a second Supabase project for staging. Run migrations and optional seed there, then in Vercel create a second project (or use Preview env vars) pointing to the staging Supabase URL and keys. Use the **staging** branch for that deployment.

---

## 5. What’s missing before you begin

Nothing in the codebase blocks deployment. You only need to do the following.

| Item | Status | Notes |
|------|--------|--------|
| **Hosted Supabase project** | You need to create one | Supabase runs locally only today. Create a project at [supabase.com](https://supabase.com) and use it for deployment. |
| **Run migrations on hosted DB** | Do after creating the project | Use `backend` with the hosted DB URL, or run the SQL files in Supabase SQL Editor. |
| **Vercel env vars** | Set in Vercel before first deploy | `DATABASE_URL` (pooled), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| **Root Directory = `front-end`** | Set in Vercel when importing | Required so Vercel builds the Next.js app, not the repo root. |
| **Seed (admin user)** | Optional but recommended | Lets you log in after deploy. Run from `backend` with hosted DB + `SUPABASE_SERVICE_ROLE_KEY`; change default password in production. |
| **Supabase Auth redirect** | Do after first deploy | In Supabase: set **Site URL** and **Redirect URLs** to your Vercel URL so login redirects work. |

**Not blocking (can come after first deploy):**

- **Check-in persistence** — “Check in” currently only shows a confirmation page; it does not yet insert into the `attendance` table (planned in integration step 8).
- **Services/events** — “Create / Select Service” uses local UI state only; events are not yet loaded from or saved to the `events` table (integration step 7).
- **Custom domain** — Add in Vercel and Supabase when you’re ready.

---

## 6. Checklist

- [ ] Hosted Supabase project created
- [ ] Migrations run on hosted DB (`backend/drizzle/*.sql` or `npm run db:migrate` from backend)
- [ ] (Optional) Seed run; admin password changed for production
- [ ] Vercel project created with **Root Directory** = `front-end`
- [ ] `DATABASE_URL` (pooled), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] First deploy successful
- [ ] Supabase Auth **Site URL** and **Redirect URLs** updated to Vercel URL
- [ ] Login and main flows tested
