# Jayashankar — Portfolio + Admin Dashboard

Static portfolio (no build step) with a Supabase-backed admin dashboard.

- **Live site:** https://jayashankar-p.vercel.app/
- **Admin dashboard:** https://jayashankar-p.vercel.app/admin
- **Setup guide:** [SETUP.md](SETUP.md) — environment variables, SQL
  migrations, admin account provisioning, deployment.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html`, `js/`, `css/`, `assets/` | Public portfolio (dark/purple theme) |
| `js/config.js` | Public Supabase config (publishable key only) |
| `js/data.js` | Reads published rows from Supabase once per load |
| `js/remote-content.js` | Re-renders sections from Supabase, static fallback |
| `admin/` | Admin dashboard served at `/admin` |
| `supabase/migrations/` | Version-controlled SQL schema + seed (run in SQL Editor) |
| `.env.example` | Documented public configuration |
| `vercel.json` | Rewrite so `/admin` resolves to the dashboard |

## How content stays in sync

The public site fetches published rows from Supabase on every page load
(no polling, no redeploy) and replaces the static markup for projects,
detail views, experiences, achievements, highlights, skills, social links
and settings. If Supabase is unreachable or unconfigured, each section
keeps its static content — the page never breaks.

Authorization is enforced by Row Level Security in the database: anonymous
visitors can only read `is_published = true` rows, and only users listed in
`public.admins` can write. Storage keeps unpublished PDFs in a private
bucket; publishing copies the file into the public bucket.

Budget: Supabase Free + Vercel Hobby only.
