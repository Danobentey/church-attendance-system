# Hosted Supabase DB – Walkthrough

You’ve already created an organization and project. Follow these steps to connect your app to the **hosted** database and run migrations.

---

## Step 1: Get API credentials

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your **project** (not the org).
2. Go to **Settings** (gear icon in the left sidebar) → **API**.
3. Note:
   - **Project URL** (e.g. `https://xxxxxxxx.supabase.co`) — you’ll use this as `NEXT_PUBLIC_SUPABASE_URL` in Vercel.
   - **Project API keys**:
     - **anon public** — use as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
     - **service_role** (click “Reveal”) — use only for running the seed from your machine; do **not** put this in the front-end or in public env vars.

---

## Step 2: Get database connection strings

1. In the same project, go to **Settings** → **Database**.
2. Scroll to **Connection string**.
3. You need **two** URIs:

   **A. Direct connection (for running migrations from your PC)**  
   - Choose **URI** and the **direct** connection (not “Use connection pooling”).
   - It usually looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with the **database password** you set when creating the project (or reset it under **Database** → **Database password**).
   - Use this **only** for running `npm run db:migrate` and `npm run db:seed` from the `backend` folder. Do **not** use this in Vercel.

   **B. Pooled connection (for Vercel)**  
   - In the same **Connection string** section, switch to **“Use connection pooling”** (e.g. **Transaction** mode, port **6543**).
   - Copy that URI (it will have port **6543**; it may use a host like `aws-0-[REGION].pooler.supabase.com` or similar).
   - Use this as `DATABASE_URL` in **Vercel** (serverless needs the pooler).

---

## Step 3: Run migrations on the hosted DB

Migrations create the tables and RLS policies on your hosted project.

**Option A – From your machine (recommended)**

1. Open a terminal in the **repo root**.
2. Go to the backend folder and set the **direct** connection string (port 5432), then run migrations:

   **Windows (recommended):** Put the URL in **`backend/.env`** so PowerShell doesn’t break it. In `backend/.env` add (one line, no quotes):
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
   ```
   If your password contains `@`, `?`, `#`, `%`, or `&`, you must **URL-encode** them (`@` → `%40`, `?` → `%3F`, `#` → `%23`, `%` → `%25`, `&` → `%26`). Then run:
   ```powershell
   cd backend
   npm run db:migrate
   ```

   **PowerShell (not recommended):** Setting the URL in the terminal often fails if the password has special characters; use `.env` instead.

   **Bash (macOS/Linux):**
   ```bash
   cd backend
   export DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres"
   npm run db:migrate
   ```

   Replace `YOUR-PASSWORD` and `PROJECT-REF` with your database password and the project reference from **Settings** → **Database** (the string in the connection URI).

3. You should see migrations run without errors. Your hosted DB now has the same schema as your local one.

**Option B – Run SQL by hand in Supabase**

1. In the dashboard, go to **SQL Editor**.
2. Run the contents of each file in **order** (create a New query for each):
   - `backend/drizzle/0000_lively_zzzax.sql`
   - `backend/drizzle/0001_fair_purple_man.sql`
   - `backend/drizzle/0002_add_rls_policies.sql`
3. Click **Run** after pasting each file.

---

## Step 4: (Optional) Seed zones and admin user

Seeding creates default zones (e.g. Egbeda, Ikeja, Surulere) and an admin user so you can log in after deploying.

1. In the dashboard, go to **Settings** → **API** and copy the **service_role** key (Reveal → Copy).
2. In your terminal, from the **backend** folder, set both `DATABASE_URL` (direct, port 5432) and `SUPABASE_SERVICE_ROLE_KEY`, then run the seed:

   **PowerShell (Windows):**
   ```powershell
   cd backend
   $env:DATABASE_URL = "postgresql://postgres.[REF]:[PASSWORD]@..."
   $env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGc..."
   npm run db:seed
   ```

   **Bash (macOS/Linux):**
   ```bash
   cd backend
   export DATABASE_URL="postgresql://..."
   export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
   npm run db:seed
   ```

3. Default admin logins (after seed): **admin@church.org** / **admin123456**, or **dan@gmail.com** / **Dinn5678**.  
   Change this password in production (e.g. via Supabase Auth or a password-reset flow).

**If you get `ENOTFOUND db.xxx.supabase.co` when running seed** (your machine can’t reach the direct DB host), use the **SQL Editor** instead:

1. **Zones + optional sample members**  
   In **SQL Editor**, open `backend/drizzle/seed_manual.sql`. Run **Step 1** (zones) and **Step 3** (sample members). Skip the commented **Step 2** for now.

2. **Admin user**  
   - Go to **Authentication** → **Users** → **Add user** → create a user with email **admin@church.org** and a password (e.g. **admin123456**).  
   - Copy the new user’s **UUID** from the Users list.  
   - In **SQL Editor**, uncomment **Step 2** in `seed_manual.sql`, replace `YOUR_ADMIN_AUTH_UID` with that UUID, and run the two statements (DELETE then INSERT into `public.users`).

You’ll then have zones, an admin you can log in with, and optional sample members.

---

## Step 5: Confirm in the dashboard

1. **Table Editor** — You should see tables: `zones`, `users`, `events`, `guests`, `attendance`, etc.
2. If you ran the seed: **Authentication** → **Users** — one user (admin); **Table Editor** → **zones** — a few rows.

---

## Step 6: What to use where

| Use case | Where | What to use |
|----------|--------|-------------|
| Run migrations / seed from your PC | Terminal, `backend` | `DATABASE_URL` = **direct** URI (port **5432**); seed also needs `SUPABASE_SERVICE_ROLE_KEY` |
| Vercel (production/staging) | Vercel env vars | `DATABASE_URL` = **pooled** URI (port **6543**); `NEXT_PUBLIC_SUPABASE_URL`; `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Local dev (front-end `.env`) | Your machine only | Keep pointing at local Supabase (`http://127.0.0.1:54321`, etc.) |

---

## After you deploy to Vercel

In Supabase: **Authentication** → **URL Configuration**:

- Set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`).
- Add the same URL under **Redirect URLs** so login redirects work.

That’s it. Your hosted Supabase DB is ready for the app; use the pooled URL and API keys in Vercel when you deploy.
