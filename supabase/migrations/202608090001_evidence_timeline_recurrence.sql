create table public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text not null,
  url text not null,
  source_type text not null check (source_type in ('government', 'peer_reviewed', 'university', 'professional_association', 'curated_husbandry')),
  published_at date,
  accessed_at date not null default current_date,
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create table public.species_compatibility_profiles (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null unique references public.species(id) on delete cascade,
  behavior_traits text[] not null default '{}',
  minimum_group_size integer check (minimum_group_size is null or minimum_group_size > 0),
  predation_targets text[] not null default '{}',
  confidence text not null default 'unknown' check (confidence in ('high', 'medium', 'low', 'unknown')),
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create table public.species_compatibility_profile_sources (
  profile_id uuid not null references public.species_compatibility_profiles(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (profile_id, source_id)
);

create table public.species_pair_compatibility_rules (
  id uuid primary key default gen_random_uuid(),
  species_a_id uuid not null references public.species(id) on delete cascade,
  species_b_id uuid not null references public.species(id) on delete cascade,
  verdict text not null check (verdict in ('compatible', 'caution', 'not_recommended', 'insufficient_data')),
  risk_type text not null,
  reason text not null,
  mitigation text[] not null default '{}',
  confidence text not null default 'unknown' check (confidence in ('high', 'medium', 'low', 'unknown')),
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (species_a_id, species_b_id),
  check (species_a_id < species_b_id)
);

create table public.species_pair_compatibility_rule_sources (
  pair_rule_id uuid not null references public.species_pair_compatibility_rules(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (pair_rule_id, source_id)
);

alter table public.care_article_steps
  add column action_title text,
  add column action_kind text not null default 'immediate'
    check (action_kind in ('immediate', 'avoid', 'observe', 'recheck'));

alter table public.care_article_step_translations
  add column action_title text;

create table public.care_article_reference_links (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.care_articles(id) on delete cascade,
  step_id uuid references public.care_article_steps(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  support_summary text not null,
  position integer not null default 1 check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create unique index care_article_reference_links_unique_idx
  on public.care_article_reference_links(article_id, coalesce(step_id, '00000000-0000-0000-0000-000000000000'::uuid), source_id)
  where deleted_at is null;

alter type public.care_event_type add value if not exists 'aquarium_created';
alter type public.care_event_type add value if not exists 'settings_updated';
alter type public.care_event_type add value if not exists 'species_added';
alter type public.care_event_type add value if not exists 'species_removed';
alter type public.care_event_type add value if not exists 'life_stage_updated';
alter type public.care_event_type add value if not exists 'daily_check';
alter type public.care_event_type add value if not exists 'care_plan_completed';

alter table public.care_events
  add column source_type text,
  add column source_id text,
  add column is_inferred boolean not null default false;

create unique index care_events_source_dedup_idx
  on public.care_events(owner_id, aquarium_id, event_type, source_type, source_id)
  where source_type is not null and source_id is not null and deleted_at is null;

alter table public.care_reminders
  add column series_id uuid,
  add column repeat_enabled boolean not null default false,
  add column repeat_interval_days integer
    check (repeat_interval_days is null or repeat_interval_days between 1 and 90);

alter table public.care_reminders
  add constraint care_reminders_repeat_contract_check check (
    (repeat_enabled = false and repeat_interval_days is null)
    or (repeat_enabled = true and repeat_interval_days between 1 and 90 and series_id is not null)
  );

alter table public.evidence_sources enable row level security;
alter table public.species_compatibility_profiles enable row level security;
alter table public.species_compatibility_profile_sources enable row level security;
alter table public.species_pair_compatibility_rules enable row level security;
alter table public.species_pair_compatibility_rule_sources enable row level security;
alter table public.care_article_reference_links enable row level security;

create policy evidence_sources_public_select on public.evidence_sources for select using ((review_status = 'reviewed' and deleted_at is null) or public.is_admin());
create policy evidence_sources_admin_insert on public.evidence_sources for insert with check (public.is_admin());
create policy evidence_sources_admin_update on public.evidence_sources for update using (public.is_admin()) with check (public.is_admin());
create policy evidence_sources_admin_delete on public.evidence_sources for delete using (public.is_admin());

create policy compatibility_profiles_public_select on public.species_compatibility_profiles for select using (
  (review_status = 'reviewed' and deleted_at is null and exists (
    select 1 from public.species s where s.id = species_id and s.status = 'published' and s.deleted_at is null
  )) or public.is_admin()
);
create policy compatibility_profiles_admin_insert on public.species_compatibility_profiles for insert with check (public.is_admin());
create policy compatibility_profiles_admin_update on public.species_compatibility_profiles for update using (public.is_admin()) with check (public.is_admin());
create policy compatibility_profiles_admin_delete on public.species_compatibility_profiles for delete using (public.is_admin());

create policy compatibility_profile_sources_public_select on public.species_compatibility_profile_sources for select using (
  (exists (select 1 from public.species_compatibility_profiles p where p.id = profile_id and p.review_status = 'reviewed' and p.deleted_at is null)
   and exists (select 1 from public.evidence_sources s where s.id = source_id and s.review_status = 'reviewed' and s.deleted_at is null))
  or public.is_admin()
);
create policy compatibility_profile_sources_admin_all on public.species_compatibility_profile_sources for all using (public.is_admin()) with check (public.is_admin());

create policy pair_compatibility_rules_public_select on public.species_pair_compatibility_rules for select using ((review_status = 'reviewed' and deleted_at is null) or public.is_admin());
create policy pair_compatibility_rules_admin_insert on public.species_pair_compatibility_rules for insert with check (public.is_admin());
create policy pair_compatibility_rules_admin_update on public.species_pair_compatibility_rules for update using (public.is_admin()) with check (public.is_admin());
create policy pair_compatibility_rules_admin_delete on public.species_pair_compatibility_rules for delete using (public.is_admin());

create policy pair_compatibility_rule_sources_public_select on public.species_pair_compatibility_rule_sources for select using (
  (exists (select 1 from public.species_pair_compatibility_rules p where p.id = pair_rule_id and p.review_status = 'reviewed' and p.deleted_at is null)
   and exists (select 1 from public.evidence_sources s where s.id = source_id and s.review_status = 'reviewed' and s.deleted_at is null))
  or public.is_admin()
);
create policy pair_compatibility_rule_sources_admin_all on public.species_pair_compatibility_rule_sources for all using (public.is_admin()) with check (public.is_admin());

create policy care_article_references_public_select on public.care_article_reference_links for select using (
  (deleted_at is null
   and exists (select 1 from public.care_articles a where a.id = article_id and a.status = 'published' and a.deleted_at is null)
   and exists (select 1 from public.evidence_sources s where s.id = source_id and s.review_status = 'reviewed' and s.deleted_at is null))
  or public.is_admin()
);
create policy care_article_references_admin_insert on public.care_article_reference_links for insert with check (public.is_admin());
create policy care_article_references_admin_update on public.care_article_reference_links for update using (public.is_admin()) with check (public.is_admin());
create policy care_article_references_admin_delete on public.care_article_reference_links for delete using (public.is_admin());

create trigger evidence_sources_set_updated_at before update on public.evidence_sources for each row execute function public.set_updated_at_and_version();
create trigger species_compatibility_profiles_set_updated_at before update on public.species_compatibility_profiles for each row execute function public.set_updated_at_and_version();
create trigger species_pair_compatibility_rules_set_updated_at before update on public.species_pair_compatibility_rules for each row execute function public.set_updated_at_and_version();
create trigger care_article_reference_links_set_updated_at before update on public.care_article_reference_links for each row execute function public.set_updated_at_and_version();
