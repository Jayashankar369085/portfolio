-- ============================================================
-- Experiences: add the Featured flag
--
-- The other content tables already have `featured`
-- (projects, achievements, skills) or `feature`
-- (highlights); `experiences` was the only table missing
-- one, so its admin toggle had nothing to write to.
--
-- Safe, additive and idempotent — safe to run more than
-- once. Later runs never overwrite your choices.
-- Run this in the Supabase SQL Editor after the two
-- 20261012 migrations (which are already applied).
-- ============================================================

do $$
begin
    if not exists (
        select 1
          from information_schema.columns
         where table_schema = 'public'
           and table_name   = 'experiences'
           and column_name   = 'featured'
    ) then
        alter table public.experiences
            add column featured boolean not null default false;

        -- First run only: the public site highlights the two
        -- experiences the portfolio features. Re-running this
        -- file does nothing, so your own toggles are preserved.
        update public.experiences
           set featured = true
         where organization in ('Deloitte', 'GE Aerospace');
    end if;
end $$;

-- ============================================================
-- End of migration.
-- ============================================================
