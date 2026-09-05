-- Compatibility Pair Rule review workflow. Repository-only until controlled migration rollout.

alter table public.species_pair_compatibility_rules
  add column if not exists basis text not null default 'rule_inference'
  check (basis in ('species_trait', 'pair_rule', 'tank_condition', 'rule_inference'));

create table public.species_pair_compatibility_rule_revisions (
  id uuid primary key default gen_random_uuid(),
  species_a_id uuid not null references public.species(id) on delete cascade,
  species_b_id uuid not null references public.species(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  base_rule_version integer check (base_rule_version is null or base_rule_version > 0),
  verdict text not null check (verdict in ('compatible', 'caution', 'not_recommended', 'insufficient_data')),
  risk_type text not null,
  reason text not null,
  mitigation text[] not null default '{}',
  basis text not null default 'rule_inference'
    check (basis in ('species_trait', 'pair_rule', 'tank_condition', 'rule_inference')),
  confidence text not null default 'unknown'
    check (confidence in ('high', 'medium', 'low', 'unknown')),
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'rejected', 'published', 'superseded')),
  citation_snapshots jsonb not null default '[]'::jsonb
    check (jsonb_typeof(citation_snapshots) = 'array'),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  unique (species_a_id, species_b_id, revision_number),
  check (species_a_id < species_b_id)
);

create unique index species_pair_compatibility_one_active_revision_idx
  on public.species_pair_compatibility_rule_revisions(species_a_id, species_b_id)
  where status in ('draft', 'pending_review', 'approved');

create table public.species_pair_compatibility_rule_revision_sources (
  revision_id uuid not null references public.species_pair_compatibility_rule_revisions(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (revision_id, source_id)
);

alter table public.species_pair_compatibility_rule_revisions enable row level security;
alter table public.species_pair_compatibility_rule_revision_sources enable row level security;

create policy compatibility_pair_rule_revisions_admin_all
  on public.species_pair_compatibility_rule_revisions for all
  using (public.is_admin()) with check (public.is_admin());

create policy compatibility_pair_rule_revision_sources_admin_all
  on public.species_pair_compatibility_rule_revision_sources for all
  using (public.is_admin()) with check (public.is_admin());

create trigger species_pair_compatibility_rule_revisions_set_updated_at
  before update on public.species_pair_compatibility_rule_revisions
  for each row execute function public.set_updated_at_and_version();

comment on table public.species_pair_compatibility_rule_revisions is
  'Operator Pair Rule Draft revisions. Reviewed pair rules remain unchanged until explicit reviewed publish.';
comment on column public.species_pair_compatibility_rule_revisions.citation_snapshots is
  'Draft-only evidence snapshots; reviewed publish must resolve them to reviewed evidence_sources.';
