-- ============================================================
-- Portfolio admin — initial schema
-- Project: https://clnqsitwiqzmikjuistr.supabase.co (ap-northeast-1)
--
-- Run this file in the Supabase SQL Editor (or `supabase db push`).
-- It is idempotent: safe to run more than once.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Administrator authorization
-- ------------------------------------------------------------

create table if not exists public.admins (
    user_id     uuid primary key references auth.users (id) on delete cascade,
    email       text,
    created_at  timestamptz not null default now()
);

-- SECURITY DEFINER so callers do not need SELECT on public.admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.admins where user_id = auth.uid()
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

alter table public.admins enable row level security;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row"
    on public.admins for select
    to authenticated
    using (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policy exists for any client role:
-- admins can only be provisioned from the SQL Editor / service role,
-- so an authenticated non-admin can never grant itself admin rights.

-- ------------------------------------------------------------
-- 2. Shared helpers
-- ------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. Content tables
-- ------------------------------------------------------------

create table if not exists public.projects (
    id                 uuid primary key default gen_random_uuid(),
    slug               text not null unique,
    name               text not null,
    subtitle           text not null default '',
    overview           text[] not null default '{}',
    problem            text not null default '',
    features           text[] not null default '{}',
    tech               text[] not null default '{}',
    full_tech          text[] not null default '{}',
    contribution_label text not null default 'My Contribution',
    contribution       text[] not null default '{}',
    status             text not null default 'COMPLETED',
    status_kind        text not null default 'done'
                       check (status_kind in ('live', 'building', 'done')),
    tagline            text not null default '',
    live_url           text,
    github_url         text,
    featured           boolean not null default false,
    sort_order         integer not null default 0,
    is_published       boolean not null default true,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.experiences (
    id                 uuid primary key default gen_random_uuid(),
    organization       text not null,
    title              text not null default '',
    experience_type    text not null default '',
    occurred_on        date,
    date_precision     text not null default 'day'
                       check (date_precision in ('day', 'month', 'year')),
    description        text not null default '',
    skills             text[] not null default '{}',
    certificate_path   text,
    certificate_name   text,
    is_published       boolean not null default true,
    sort_order         integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.highlights (
    id                 uuid primary key default gen_random_uuid(),
    title              text not null,
    issuer             text not null default '',
    kind               text not null default 'CERTIFICATION',
    occurred_on        date,
    date_precision     text not null default 'day'
                       check (date_precision in ('day', 'month', 'year')),
    description        text not null default '',
    credential_id      text,
    verification_url   text,
    profile_url        text,
    project_label      text,
    project_url        text,
    feature            boolean not null default false,
    certificate_path   text,
    certificate_name   text,
    is_published       boolean not null default true,
    sort_order         integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.achievements (
    id                 uuid primary key default gen_random_uuid(),
    title              text not null,
    range_label        text not null default '',
    description        text not null default '',
    tag                text,
    featured           boolean not null default false,
    is_published       boolean not null default true,
    sort_order         integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.skills (
    id                 uuid primary key default gen_random_uuid(),
    name               text not null,
    category           text not null default 'General',
    category_icon      text,
    icon               text,
    featured           boolean not null default false,
    is_published       boolean not null default true,
    sort_order         integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.social_links (
    id                 uuid primary key default gen_random_uuid(),
    platform           text not null,
    label              text not null default '',
    url                text not null,
    is_published       boolean not null default true,
    sort_order         integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create table if not exists public.site_settings (
    key                text primary key,
    value              text not null default '',
    updated_at         timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. Indexes
-- ------------------------------------------------------------

create index if not exists projects_public_order_idx
    on public.projects (is_published, sort_order);
create index if not exists experiences_public_order_idx
    on public.experiences (is_published, sort_order);
create index if not exists highlights_public_order_idx
    on public.highlights (is_published, sort_order);
create index if not exists achievements_public_order_idx
    on public.achievements (is_published, sort_order);
create index if not exists skills_public_order_idx
    on public.skills (is_published, sort_order);
create index if not exists social_links_public_order_idx
    on public.social_links (is_published, sort_order);

-- ------------------------------------------------------------
-- 5. updated_at triggers
-- ------------------------------------------------------------

do $$
declare
    t text;
begin
    foreach t in array array['projects', 'experiences', 'highlights',
                             'achievements', 'skills', 'social_links']
    loop
        execute format(
            'drop trigger if exists set_%1$s_updated_at on public.%1$s', t);
        execute format(
            'create trigger set_%1$s_updated_at before update on public.%1$s
             for each row execute function public.touch_updated_at()', t);
    end loop;

    drop trigger if exists set_site_settings_updated_at on public.site_settings;
    create trigger set_site_settings_updated_at before update on public.site_settings
        for each row execute function public.touch_updated_at();
end;
$$;

-- ------------------------------------------------------------
-- 6. Row Level Security
-- ------------------------------------------------------------

do $$
declare
    t text;
begin
    foreach t in array array['projects', 'experiences', 'highlights',
                             'achievements', 'skills', 'social_links']
    loop
        execute format('alter table public.%1$s enable row level security', t);

        execute format(
            'drop policy if exists "%1$s public read published" on public.%1$s', t);
        execute format(
            'create policy "%1$s public read published" on public.%1$s
             for select to anon, authenticated
             using (is_published)', t);

        execute format(
            'drop policy if exists "%1$s admin full access" on public.%1$s', t);
        execute format(
            'create policy "%1$s admin full access" on public.%1$s
             for all to authenticated
             using (public.is_admin())
             with check (public.is_admin())', t);
    end loop;
end;
$$;

alter table public.site_settings enable row level security;

drop policy if exists "site settings public read" on public.site_settings;
create policy "site settings public read"
    on public.site_settings for select
    to anon, authenticated
    using (true);

drop policy if exists "site settings admin full access" on public.site_settings;
create policy "site settings admin full access"
    on public.site_settings for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------
-- 7. Storage buckets
--    certificates-private : drafts / unpublished files (admin only)
--    certificates-public  : published documents (public read, admin write)
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('certificates-private', 'certificates-private', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificates-public', 'certificates-public', true)
on conflict (id) do nothing;

drop policy if exists "public certs readable" on storage.objects;
create policy "public certs readable"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'certificates-public');

drop policy if exists "public certs admin managed" on storage.objects;
create policy "public certs admin managed"
    on storage.objects for all
    to authenticated
    using (bucket_id = 'certificates-public' and public.is_admin())
    with check (bucket_id = 'certificates-public' and public.is_admin());

drop policy if exists "private certs admin only" on storage.objects;
create policy "private certs admin only"
    on storage.objects for all
    to authenticated
    using (bucket_id = 'certificates-private' and public.is_admin())
    with check (bucket_id = 'certificates-private' and public.is_admin());

-- ============================================================
-- End of migration 000001. Continue with 000002_seed.sql.
-- ============================================================
