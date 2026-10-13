# Setup — Portfolio Admin Dashboard

Everything below is manual setup on your side. Nothing here has been run
yet: the database, auth and storage are **not operational until you
complete these steps**.

Budget: everything uses **Supabase Free + Vercel Hobby only**. No paid
services, no add-ons, no credit card, no background jobs, no polling.

---

## 1. Environment variables

This is a static site with no build step, so the browser reads its public
configuration from **`js/config.js`** (the same values are documented in
`.env.example`).

**Status: done.** `js/config.js` already contains your Supabase URL and
your publishable (anon) key, so the site and `/admin` are configured as
committed. The checklist below only matters if you ever rotate the key:

1. Copy the key from Supabase → Project Settings → API → **publishable
   key** (or from `.env.example`).
2. Paste it into `js/config.js` as `SUPABASE_ANON_KEY`.
3. Optionally add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in
   Vercel → Project → Settings → Environment Variables, purely as
   documentation — Vercel does not inject them into static files.

Rules:

- Only the **publishable/anon** key ever goes in the browser.
- **Never** commit a service-role key, secret key, or the database
  password. `.env` / `.env.local` must stay out of Git.
- RLS (step 2) is what actually protects the data, not key secrecy.

## 2. Run the SQL migrations

In Supabase → **SQL Editor** → New query, paste each file in order and
click **Run**:

1. `supabase/migrations/20261012000001_init_schema.sql`
   — tables, indexes, `admins` role table, `is_admin()`, Row Level
   Security policies, and both Storage buckets
   (`certificates-public` public, `certificates-private` admin-only).
2. `supabase/migrations/20261012000002_seed.sql`
   — seed content copied from your live site (7 projects, Deloitte +
   GE Aerospace experiences, 6 highlights, 6 achievements, 33 skills,
   5 social links, 3 settings).
3. `supabase/migrations/20261013000001_experiences_featured.sql`
   — adds the `featured` flag to `experiences` (projects, achievements
   and skills already have one; highlights use `feature`) and marks
   Deloitte + GE Aerospace as featured on that first run. Until this
   runs, the dashboard hides the experience Featured toggle instead of
   failing saves.

All files are idempotent — running them twice will not duplicate rows
or overwrite your own Featured choices.
After running, check **Table Editor** to confirm the tables exist.

## 3. Create the initial administrator account

Registration is disabled — there is no public sign-up. You create the
account yourself:

1. Supabase → **Authentication → Users → Add user → Create new user**.
   Enter your email and a strong password, and **disable** "Auto confirm"
   only if you want to verify the email (either way works). This creates
   the `auth.users` row.
2. Supabase → **SQL Editor**, run (replace the email):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

The `admins` table has **no insert/update/delete policy for any client**,
so an authenticated non-admin can never grant itself admin rights —
admins are provisioned only from the SQL Editor (or a service role).

## 4. Authentication and authorization

Already handled by the migrations — nothing to configure in the dashboard:

- Email/password sign-in via Supabase Auth (`/admin` uses
  `signInWithPassword`; there is no sign-up call anywhere).
- RLS: anonymous visitors can **only read published rows**
  (`is_published = true`) and cannot write at all.
- Authenticated users pass write policies **only if** their user id is in
  `public.admins` (`public.is_admin()`), enforced in the database for
  every table and both Storage buckets.
- Storage: `certificates-private` is admin-only; `certificates-public`
  is public-read/admin-write.

Recommended (Authentication → Providers → Email): keep "Email" enabled and
turn **off** "Allow new users to sign up" so nobody can self-register.

## 5. Deploy

1. Commit and push to `main` (GitHub → Vercel auto-deploy is unchanged).
2. `vercel.json` adds one rewrite so `/admin` resolves to the dashboard.
3. After deploy, visit `https://jayashankar-p.vercel.app/admin`.

Local preview (optional):

```bash
npx serve .          # or: python3 -m http.server 8080
```

Then open `/admin/`.

## 6. Access the admin dashboard

- URL: `https://jayashankar-p.vercel.app/admin`
- Sign in with the account from step 3.
- Sidebar: Overview, Projects, Experience, Highlights, Achievements,
  Skills, Social Links, Site Settings.
- Every list has search, a published/draft filter, up/down reordering,
  preview, publish/unpublish, edit and delete (with confirmation).
- **Featured toggles**: Projects, Experience, Highlights, Achievements
  and Skills each have a Featured control. It writes to the row's
  `featured` column (`feature` for highlights) and changes how the
  public site shows that item on the next page load — featured projects
  and achievements get the emphasis treatment, featured experiences get
  the FEATURED chip, featured skills pin to the top of their card.
- Saving or publishing a change makes it visible on the public site the
  next time the page loads — no commit or redeploy needed.

---

## What the public site does

`js/data.js` fetches published rows once per page load (no polling) and
`js/remote-content.js` re-renders the project slabs, detail overlay,
experience timeline, achievements, highlights, skills, social links and
contact settings. If Supabase is unreachable, unconfigured, or a table is
missing, that section keeps its static markup — the page never breaks.

## Limits (free tier)

- Storage files are limited to 25 MB by the app (Supabase Free allows
  larger, but keep uploads small for bandwidth).
- Supabase Free projects pause after ~7 days of inactivity — the site
  falls back to static content while paused, and content returns when the
  project is woken (open the Supabase dashboard). No keep-alive jobs are
  used, per your zero-cost rules.
- No claim of unlimited uptime or storage.
