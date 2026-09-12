-- Compatibility review workflow: keep reviewed runtime authority stable while operators edit Draft revisions.
-- This migration is committed for controlled non-Production rollout only.

create table public.species_compatibility_profile_revisions (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  base_profile_version integer check (base_profile_version is null or base_profile_version > 0),
  behavior_traits text[] not null default '{}',
  minimum_group_size integer check (minimum_group_size is null or minimum_group_size > 0),
  predation_targets text[] not null default '{}',
  confidence text not null default 'unknown' check (confidence in ('high', 'medium', 'low', 'unknown')),
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'published', 'superseded')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  unique (species_id, revision_number)
);

create unique index species_compatibility_profile_one_active_revision_idx
  on public.species_compatibility_profile_revisions(species_id)
  where status in ('draft', 'pending_review', 'approved');

create table public.species_compatibility_profile_revision_sources (
  revision_id uuid not null references public.species_compatibility_profile_revisions(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (revision_id, source_id)
);

alter table public.species_compatibility_profile_revisions enable row level security;
alter table public.species_compatibility_profile_revision_sources enable row level security;

create policy compatibility_profile_revisions_admin_all
  on public.species_compatibility_profile_revisions for all
  using (public.is_admin()) with check (public.is_admin());

create policy compatibility_profile_revision_sources_admin_all
  on public.species_compatibility_profile_revision_sources for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.species_compatibility_profile_revisions
  add column citation_snapshots jsonb not null default '[]'::jsonb
  check (jsonb_typeof(citation_snapshots) = 'array');

create trigger species_compatibility_profile_revisions_set_updated_at
  before update on public.species_compatibility_profile_revisions
  for each row execute function public.set_updated_at_and_version();

comment on table public.species_compatibility_profile_revisions is
  'Operator Draft revisions. Reviewed species_compatibility_profiles remain unchanged until an explicit reviewed publish step.';
comment on column public.species_compatibility_profile_revisions.citation_snapshots is
  'Draft-only evidence snapshots. A future publish RPC must resolve these to reviewed evidence_sources before changing runtime authority.';
