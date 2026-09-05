create table if not exists public.compatibility_authority_state (
  singleton boolean primary key default true check (singleton),
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
insert into public.compatibility_authority_state(singleton,version) values (true,1) on conflict (singleton) do nothing;
alter table public.compatibility_authority_state enable row level security;
revoke all on table public.compatibility_authority_state from anon, authenticated;

create or replace function public.bump_compatibility_authority_state()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.bump_compatibility_for_species_publication()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_resource_type text;
begin
  if tg_op='DELETE' then v_resource_type := old.resource_type; else v_resource_type := new.resource_type; end if;
  if v_resource_type='species' then
    update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.bump_compatibility_for_evidence_change()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_source_id uuid;
begin
  if tg_op='DELETE' then v_source_id := old.id; else v_source_id := new.id; end if;
  if exists (select 1 from public.species_compatibility_profile_sources where source_id=v_source_id)
     or exists (select 1 from public.species_pair_compatibility_rule_sources where source_id=v_source_id) then
    update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create trigger compatibility_profiles_bump_authority after insert or update or delete on public.species_compatibility_profiles for each row execute function public.bump_compatibility_authority_state();
create trigger compatibility_pair_rules_bump_authority after insert or update or delete on public.species_pair_compatibility_rules for each row execute function public.bump_compatibility_authority_state();
create trigger compatibility_profile_sources_bump_authority after insert or update or delete on public.species_compatibility_profile_sources for each row execute function public.bump_compatibility_authority_state();
create trigger compatibility_pair_sources_bump_authority after insert or update or delete on public.species_pair_compatibility_rule_sources for each row execute function public.bump_compatibility_authority_state();
create trigger compatibility_evidence_bump_authority after update on public.evidence_sources for each row execute function public.bump_compatibility_for_evidence_change();
create trigger compatibility_species_publication_bump_authority after insert or update or delete on public.content_publications for each row execute function public.bump_compatibility_for_species_publication();
create trigger compatibility_legacy_species_bump_authority after update on public.species for each row when (old.status='published' or new.status='published') execute function public.bump_compatibility_authority_state();

alter table public.species_compatibility_profile_revisions
  add column if not exists regression_report jsonb not null default '{}'::jsonb check (jsonb_typeof(regression_report)='object');
alter table public.species_pair_compatibility_rule_revisions
  add column if not exists regression_report jsonb not null default '{}'::jsonb check (jsonb_typeof(regression_report)='object');

create or replace function public.publish_compatibility_profile_revision(
  p_revision_id uuid,
  p_expected_revision_version integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revision public.species_compatibility_profile_revisions%rowtype;
  v_baseline public.species_compatibility_profiles%rowtype;
  v_new_version integer;
  v_authority_version bigint;
  v_next_authority_version bigint;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into v_revision from public.species_compatibility_profile_revisions where id=p_revision_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_revision.status <> 'approved' then raise exception 'PUBLISH_GATE_REJECTED: revision_not_approved'; end if;
  if v_revision.version <> p_expected_revision_version then raise exception 'VERSION_CONFLICT: revision'; end if;
  select version into v_authority_version from public.compatibility_authority_state where singleton=true for update;
  if not found then raise exception 'PUBLISH_GATE_REJECTED: authority_state_missing'; end if;
  if coalesce((v_revision.regression_report->>'evaluatedScenarios')::integer,0) <= 0 then raise exception 'PUBLISH_GATE_REJECTED: regression_missing'; end if;
  if coalesce((v_revision.regression_report->>'authoritySequence')::bigint,0) <> v_authority_version then raise exception 'VERSION_CONFLICT: regression_authority'; end if;
  if coalesce((v_revision.regression_report->>'baselineVersion')::integer,0) <> v_revision.base_profile_version then raise exception 'VERSION_CONFLICT: regression_baseline'; end if;
  if coalesce(jsonb_array_length(v_revision.impact_report -> 'changedFields'),0)=0 then raise exception 'PUBLISH_GATE_REJECTED: impact_missing'; end if;
  if jsonb_array_length(v_revision.evidence_resolution)=0 or jsonb_array_length(v_revision.evidence_resolution) <> jsonb_array_length(v_revision.citation_snapshots) then raise exception 'PUBLISH_GATE_REJECTED: evidence_resolution_missing'; end if;
  select * into v_baseline from public.species_compatibility_profiles
  where species_id=v_revision.species_id and review_status='reviewed' and deleted_at is null for update;
  if not found then raise exception 'PUBLISH_GATE_REJECTED: reviewed_baseline_missing'; end if;
  if v_baseline.version <> v_revision.base_profile_version then raise exception 'VERSION_CONFLICT: baseline'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.evidence_resolution) item
    left join public.evidence_sources e on e.id=(item->>'sourceId')::uuid
    where e.id is null or e.source_key <> item->>'sourceKey' or e.review_status <> 'reviewed'
      or e.deleted_at is not null or e.version <> (item->>'version')::integer
  ) then raise exception 'VERSION_CONFLICT: evidence'; end if;

  update public.species_compatibility_profiles set
    behavior_traits=v_revision.behavior_traits,
    minimum_group_size=v_revision.minimum_group_size,
    predation_targets=v_revision.predation_targets,
    confidence=v_revision.confidence,
    review_status='reviewed', reviewed_by=auth.uid(), reviewed_at=now()
  where id=v_baseline.id returning version into v_new_version;

  delete from public.species_compatibility_profile_sources where profile_id=v_baseline.id;
  insert into public.species_compatibility_profile_sources(profile_id,source_id)
  select v_baseline.id,(item->>'sourceId')::uuid from jsonb_array_elements(v_revision.evidence_resolution) item;
  update public.species_compatibility_profile_revisions
    set status='superseded'
    where species_id=v_revision.species_id and id<>v_revision.id and status='published';
  update public.species_compatibility_profile_revisions
    set status='published', published_at=now()
    where id=v_revision.id;
  update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true returning version into v_next_authority_version;

  return jsonb_build_object(
    'revisionId', v_revision.id,
    'baselineId', v_baseline.id,
    'baselineVersion', v_new_version,
    'authorityVersion', v_next_authority_version
  );
end;
$$;

revoke all on function public.publish_compatibility_profile_revision(uuid,integer) from public;
grant execute on function public.publish_compatibility_profile_revision(uuid,integer) to authenticated;

create or replace function public.publish_compatibility_pair_rule_revision(
  p_revision_id uuid,
  p_expected_revision_version integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revision public.species_pair_compatibility_rule_revisions%rowtype;
  v_baseline public.species_pair_compatibility_rules%rowtype;
  v_new_version integer;
  v_authority_version bigint;
  v_next_authority_version bigint;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into v_revision from public.species_pair_compatibility_rule_revisions where id=p_revision_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_revision.status <> 'approved' then raise exception 'PUBLISH_GATE_REJECTED: revision_not_approved'; end if;
  if v_revision.version <> p_expected_revision_version then raise exception 'VERSION_CONFLICT: revision'; end if;
  select version into v_authority_version from public.compatibility_authority_state where singleton=true for update;
  if not found then raise exception 'PUBLISH_GATE_REJECTED: authority_state_missing'; end if;
  if coalesce((v_revision.regression_report->>'evaluatedScenarios')::integer,0) <= 0 then raise exception 'PUBLISH_GATE_REJECTED: regression_missing'; end if;
  if coalesce((v_revision.regression_report->>'authoritySequence')::bigint,0) <> v_authority_version then raise exception 'VERSION_CONFLICT: regression_authority'; end if;
  if coalesce((v_revision.regression_report->>'baselineVersion')::integer,0) <> v_revision.base_rule_version then raise exception 'VERSION_CONFLICT: regression_baseline'; end if;
  if coalesce(jsonb_array_length(v_revision.impact_report -> 'changedFields'),0)=0 then raise exception 'PUBLISH_GATE_REJECTED: impact_missing'; end if;
  if jsonb_array_length(v_revision.evidence_resolution)=0 or jsonb_array_length(v_revision.evidence_resolution) <> jsonb_array_length(v_revision.citation_snapshots) then raise exception 'PUBLISH_GATE_REJECTED: evidence_resolution_missing'; end if;

  select * into v_baseline from public.species_pair_compatibility_rules
  where species_a_id=v_revision.species_a_id and species_b_id=v_revision.species_b_id
    and review_status='reviewed' and deleted_at is null for update;
  if not found then raise exception 'PUBLISH_GATE_REJECTED: reviewed_baseline_missing'; end if;
  if v_baseline.version <> v_revision.base_rule_version then raise exception 'VERSION_CONFLICT: baseline'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.evidence_resolution) item
    left join public.evidence_sources e on e.id=(item->>'sourceId')::uuid
    where e.id is null or e.source_key <> item->>'sourceKey' or e.review_status <> 'reviewed'
      or e.deleted_at is not null or e.version <> (item->>'version')::integer
  ) then raise exception 'VERSION_CONFLICT: evidence'; end if;
  update public.species_pair_compatibility_rules set
    verdict=v_revision.verdict,
    risk_type=v_revision.risk_type,
    reason=v_revision.reason,
    mitigation=v_revision.mitigation,
    basis=v_revision.basis,
    confidence=v_revision.confidence,
    review_status='reviewed', reviewed_by=auth.uid(), reviewed_at=now()
  where id=v_baseline.id returning version into v_new_version;

  delete from public.species_pair_compatibility_rule_sources where pair_rule_id=v_baseline.id;
  insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
  select v_baseline.id,(item->>'sourceId')::uuid from jsonb_array_elements(v_revision.evidence_resolution) item;

  update public.species_pair_compatibility_rule_revisions
    set status='superseded'
    where species_a_id=v_revision.species_a_id and species_b_id=v_revision.species_b_id
      and id<>v_revision.id and status='published';
  update public.species_pair_compatibility_rule_revisions
    set status='published', published_at=now()
    where id=v_revision.id;
  update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true returning version into v_next_authority_version;
  return jsonb_build_object(
    'revisionId', v_revision.id,
    'baselineId', v_baseline.id,
    'baselineVersion', v_new_version,
    'authorityVersion', v_next_authority_version
  );
end;
$$;

revoke all on function public.publish_compatibility_pair_rule_revision(uuid,integer) from public;
grant execute on function public.publish_compatibility_pair_rule_revision(uuid,integer) to authenticated;

comment on function public.publish_compatibility_profile_revision(uuid,integer) is
  'Version-publishes one approved Compatibility Profile revision after impact/evidence/baseline gates.';
comment on function public.publish_compatibility_pair_rule_revision(uuid,integer) is
  'Version-publishes one approved Compatibility Pair Rule revision after impact/evidence/baseline gates.';

comment on column public.species_compatibility_profile_revisions.regression_report is 'Server-generated before/after Compatibility engine regression captured before human approval.';
comment on column public.species_pair_compatibility_rule_revisions.regression_report is 'Server-generated before/after Compatibility engine regression captured before human approval.';
