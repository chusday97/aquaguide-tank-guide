begin;

-- Downstream Care SEO Editorial only. Care Knowledge facts remain in Published Care authority.
create table if not exists public.care_seo_editorial_revisions (
  id uuid primary key default gen_random_uuid(),
  source_care_id uuid not null,
  source_care_catalog_key text not null,
  source_care_version integer not null check (source_care_version > 0),
  locale text not null check (locale in ('zh-CN','en')),
  revision_number integer not null check (revision_number > 0),
  version integer not null default 1 check (version > 0),
  review_state text not null default 'draft' check (review_state in ('draft','ready_for_review','approved')),
  index_strategy text not null default 'noindex' check (index_strategy in ('noindex','index')),
  seo_title text not null check (char_length(seo_title) between 1 and 80),
  meta_description text not null check (char_length(meta_description) between 1 and 200),
  h1 text not null check (char_length(h1) between 1 and 240),
  focus_keyword text not null check (char_length(focus_keyword) between 1 and 160),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_care_id, source_care_version, locale, revision_number)
);

create index if not exists care_seo_editorial_latest_idx
  on public.care_seo_editorial_revisions(source_care_id, locale, source_care_version desc, revision_number desc);

alter table public.care_seo_editorial_revisions enable row level security;
revoke all on public.care_seo_editorial_revisions from anon, authenticated;
grant select on public.care_seo_editorial_revisions to authenticated;
drop policy if exists care_seo_editorial_admin_select on public.care_seo_editorial_revisions;
create policy care_seo_editorial_admin_select
  on public.care_seo_editorial_revisions for select using (public.is_admin());

commit;
