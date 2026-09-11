-- Compatibility v3 Profile authority extension.
-- Additive only; committed for controlled non-Production rollout.

begin;

alter table public.species_compatibility_profiles
  add column if not exists required_facts text[] not null default '{}',
  add column if not exists stocking_guidance jsonb;

alter table public.species_compatibility_profile_revisions
  add column if not exists required_facts text[] not null default '{}',
  add column if not exists stocking_guidance jsonb,
  add column if not exists stage_risk_rules jsonb not null default '[]'::jsonb,
  add column if not exists stage_risk_evidence_resolution jsonb not null default '{}'::jsonb;

create or replace function public.is_valid_compatibility_stocking_guidance(p_value jsonb)
returns boolean
language sql
immutable
set search_path=public
as $$
  select p_value is null or (
    jsonb_typeof(p_value)='object'
    and p_value ?& ARRAY['kind','recommendedMin','recommendedMax','constraints','confidence','evidenceIds']::text[]
    and p_value->>'kind' in ('reviewed_range','minimum_group_only','screening_only','unknown')
    and p_value->>'confidence' in ('high','medium','low','unknown')
    and case jsonb_typeof(p_value->'recommendedMin')
      when 'null' then true
      when 'number' then (p_value->>'recommendedMin')::numeric > 0
        and (p_value->>'recommendedMin')::numeric = trunc((p_value->>'recommendedMin')::numeric)
      else false
    end
    and case jsonb_typeof(p_value->'recommendedMax')
      when 'null' then true
      when 'number' then (p_value->>'recommendedMax')::numeric > 0
        and (p_value->>'recommendedMax')::numeric = trunc((p_value->>'recommendedMax')::numeric)
      else false
    end
    and case when jsonb_typeof(p_value->'constraints')='array' then
      jsonb_array_length(p_value->'constraints') <= 30
      and not exists (
        select 1 from jsonb_array_elements(p_value->'constraints') item
        where jsonb_typeof(item)<>'string' or nullif(btrim(item#>>'{}'),'') is null
      )
      else false
    end
    and case when jsonb_typeof(p_value->'evidenceIds')='array' then
      jsonb_array_length(p_value->'evidenceIds') <= 30
      and not exists (
        select 1 from jsonb_array_elements(p_value->'evidenceIds') item
        where jsonb_typeof(item)<>'string' or nullif(btrim(item#>>'{}'),'') is null
      )
      and jsonb_array_length(p_value->'evidenceIds') = (
        select count(distinct item#>>'{}') from jsonb_array_elements(p_value->'evidenceIds') item
      )
      else false
    end
  );
$$;

comment on function public.is_valid_compatibility_stocking_guidance(jsonb) is
  'Pure validator for Compatibility v3 stocking guidance persisted in reviewed Profile authority.';

create or replace function public.is_unique_text_array(p_value text[])
returns boolean
language sql
immutable
set search_path=public
as $$
  select coalesce(cardinality(p_value),0) = (
    select count(distinct item) from unnest(coalesce(p_value,ARRAY[]::text[])) item
  );
$$;

comment on function public.is_unique_text_array(text[]) is
  'Treats Compatibility array fields as mathematical sets so duplicates cannot alter authority fingerprints without changing behavior.';

alter table public.species_compatibility_profile_revisions
  add constraint compatibility_profile_revision_stage_risk_rules_array_check
    check (jsonb_typeof(stage_risk_rules) = 'array'),
  add constraint compatibility_profile_revision_stage_risk_resolution_object_check
    check (jsonb_typeof(stage_risk_evidence_resolution) = 'object');

create table if not exists public.species_compatibility_profile_stage_risks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.species_compatibility_profiles(id) on delete cascade,
  rule_key text not null check (length(btrim(rule_key))>0),
  younger_stages text[] not null
    check (cardinality(younger_stages)>0 and public.is_unique_text_array(younger_stages) and younger_stages <@ ARRAY['unknown','juvenile','adult','fry','subadult']::text[]),
  older_stages text[] not null
    check (cardinality(older_stages)>0 and public.is_unique_text_array(older_stages) and older_stages <@ ARRAY['unknown','juvenile','adult','fry','subadult']::text[]),
  verdict text not null check (verdict in ('caution','not_recommended')),
  risk_type text not null check (length(btrim(risk_type))>0),
  reason text not null check (length(btrim(reason))>0),
  mitigation text[] not null default '{}',
  basis text not null default 'species_trait' check (basis in ('species_trait','pair_rule','tank_condition','rule_inference')),
  confidence text not null default 'unknown' check (confidence in ('high','medium','low','unknown')),
  review_status text not null default 'reviewed' check (review_status in ('draft','reviewed','rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (profile_id, rule_key)
);
create table if not exists public.species_compatibility_profile_stage_risk_sources (
  stage_risk_id uuid not null references public.species_compatibility_profile_stage_risks(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (stage_risk_id, source_id)
);

alter table public.species_compatibility_profile_stage_risks enable row level security;
alter table public.species_compatibility_profile_stage_risk_sources enable row level security;

create policy compatibility_profile_stage_risks_public_select
  on public.species_compatibility_profile_stage_risks for select using (
    (review_status='reviewed' and deleted_at is null and exists (
      select 1 from public.species_compatibility_profiles p
      join public.species s on s.id=p.species_id
      where p.id=profile_id and p.review_status='reviewed' and p.deleted_at is null
        and s.status='published' and s.deleted_at is null
    )) or public.is_admin()
  );
create policy compatibility_profile_stage_risks_admin_all
  on public.species_compatibility_profile_stage_risks for all
  using (public.is_admin()) with check (public.is_admin());
create policy compatibility_profile_stage_risk_sources_public_select
  on public.species_compatibility_profile_stage_risk_sources for select using (
    (exists (
       select 1 from public.species_compatibility_profile_stage_risks r
       join public.species_compatibility_profiles p on p.id=r.profile_id
       join public.species s on s.id=p.species_id
       where r.id=stage_risk_id and r.review_status='reviewed' and r.deleted_at is null
         and p.review_status='reviewed' and p.deleted_at is null
         and s.status='published' and s.deleted_at is null
     )
     and exists (select 1 from public.evidence_sources e where e.id=source_id and e.review_status='reviewed' and e.deleted_at is null))
    or public.is_admin()
  );
create policy compatibility_profile_stage_risk_sources_admin_all
  on public.species_compatibility_profile_stage_risk_sources for all
  using (public.is_admin()) with check (public.is_admin());
create trigger species_compatibility_profile_stage_risks_set_updated_at
  before update on public.species_compatibility_profile_stage_risks
  for each row execute function public.set_updated_at_and_version();

create trigger compatibility_profile_stage_risks_bump_authority
  after insert or update or delete on public.species_compatibility_profile_stage_risks
  for each row execute function public.bump_compatibility_authority_state();
create trigger compatibility_profile_stage_risk_sources_bump_authority
  after insert or update or delete on public.species_compatibility_profile_stage_risk_sources
  for each row execute function public.bump_compatibility_authority_state();

create or replace function public.bump_compatibility_for_evidence_change()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_source_id uuid;
begin
  if tg_op='DELETE' then v_source_id := old.id; else v_source_id := new.id; end if;
  if exists (select 1 from public.species_compatibility_profile_sources where source_id=v_source_id)
     or exists (select 1 from public.species_pair_compatibility_rule_sources where source_id=v_source_id)
     or exists (select 1 from public.species_compatibility_profile_stage_risk_sources where source_id=v_source_id) then
    update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

comment on table public.species_compatibility_profile_stage_risks is
  'Profile-owned reviewed Compatibility life-stage risk rules; shares Profile review/publish authority.';
comment on column public.species_compatibility_profile_revisions.stage_risk_rules is
  'Draft snapshot of Profile-owned Stage Risk rules including independent citation snapshots.';
-- Canonical v3 Profile required-fact backfill. Existing reviewed behavior data is preserved.
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','social_behavior','territoriality']::text[]
from public.species s where s.id=p.species_id and s.catalog_key='sp_0439';
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','territoriality','breeding_behavior']::text[]
from public.species s where s.id=p.species_id and s.catalog_key='sp_0021';
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','adult_size','predation','territoriality']::text[]
from public.species s where s.id=p.species_id and s.catalog_key='sp_0049';
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','ph','social_behavior']::text[]
from public.species s where s.id=p.species_id and s.catalog_key in ('sp_0431','sp_0432');
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','social_behavior']::text[]
from public.species s where s.id=p.species_id and s.catalog_key='sp_0434';
update public.species_compatibility_profiles p set required_facts=ARRAY['water','temperature','social_behavior','breeding_behavior']::text[]
from public.species s where s.id=p.species_id and s.catalog_key='sp_0436';

insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
values
('guppy-cannibalism-refuge-study','Guppy populations differ in cannibalistic degree and adaptation to structural environments','Oecologia','https://pubmed.ncbi.nlm.nih.gov/21516310/','peer_reviewed','reviewed',now()),
('guppy-fry-yield-cannibalism-study','The effects of illumination and daily number of collections on fry yields in guppy breeding tanks','Aquacultural Engineering','https://www.sciencedirect.com/science/article/abs/pii/S0144860913000848','peer_reviewed','reviewed',now())
on conflict (source_key) do update set
  title=excluded.title,publisher=excluded.publisher,url=excluded.url,source_type=excluded.source_type,
  review_status='reviewed',deleted_at=null,updated_at=now();
insert into public.species_compatibility_profile_stage_risks(
  profile_id,rule_key,younger_stages,older_stages,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at
)
select p.id,'sp_0436:conspecific_fry_predation',ARRAY['fry']::text[],ARRAY['adult']::text[],
  'not_recommended','conspecific_fry_predation',
  '孔雀鱼成体捕食同种幼体在水族箱实验与繁育研究中均有记录，且捕食程度会受到幼体体型与躲避结构影响。当前不应把成鱼与新生鱼苗直接同缸视为已证明安全。',
  ARRAY['鱼苗优先使用育苗隔离区或独立育苗缸。','不要把水草躲避物当作能够消除同类吞食风险的保证。']::text[],
  'species_trait','medium','reviewed',now()
from public.species_compatibility_profiles p
join public.species s on s.id=p.species_id
where s.catalog_key='sp_0436'
on conflict (profile_id,rule_key) do update set
  younger_stages=excluded.younger_stages,older_stages=excluded.older_stages,verdict=excluded.verdict,
  risk_type=excluded.risk_type,reason=excluded.reason,mitigation=excluded.mitigation,basis=excluded.basis,
  confidence=excluded.confidence,review_status='reviewed',deleted_at=null,reviewed_at=now();

insert into public.species_compatibility_profile_stage_risk_sources(stage_risk_id,source_id)
select r.id,e.id from public.species_compatibility_profile_stage_risks r
join public.species_compatibility_profiles p on p.id=r.profile_id
join public.species s on s.id=p.species_id
join public.evidence_sources e on e.source_key in ('guppy-cannibalism-refuge-study','guppy-fry-yield-cannibalism-study')
where s.catalog_key='sp_0436' and r.rule_key='sp_0436:conspecific_fry_predation'
on conflict do nothing;
-- Backfill v3 snapshots only into active Profile revisions. Historical rejected/published/superseded revisions remain untouched
-- so the audit trail never claims that legacy approvals included Compatibility v3 fields that did not exist yet.
update public.species_compatibility_profile_revisions r
set base_profile_version=p.version,
    required_facts=p.required_facts,
    stocking_guidance=p.stocking_guidance,
    stage_risk_rules=coalesce((
      select jsonb_agg(jsonb_build_object(
        'ruleKey',sr.rule_key,'youngerStages',to_jsonb(sr.younger_stages),'olderStages',to_jsonb(sr.older_stages),
        'verdict',sr.verdict,'riskType',sr.risk_type,'reason',sr.reason,'mitigation',to_jsonb(sr.mitigation),
        'basis',sr.basis,'confidence',sr.confidence,
        'citations',coalesce((select jsonb_agg(jsonb_build_object(
          'sourceKey',e.source_key,'title',e.title,'publisher',e.publisher,'url',e.url,
          'sourceType',e.source_type,'reviewStatus',e.review_status) order by e.source_key)
          from public.species_compatibility_profile_stage_risk_sources l
          join public.evidence_sources e on e.id=l.source_id where l.stage_risk_id=sr.id),'[]'::jsonb)
      ) order by sr.rule_key)
      from public.species_compatibility_profile_stage_risks sr
      where sr.profile_id=p.id and sr.review_status='reviewed' and sr.deleted_at is null
    ),'[]'::jsonb)
from public.species_compatibility_profiles p
where p.species_id=r.species_id and p.review_status='reviewed' and p.deleted_at is null
  and r.status in ('draft','pending_review','approved');

-- Fail closed with actionable diagnostics before v3 constraints are installed.
-- Extra reviewed Profiles or orphaned active revisions must not fail later as opaque CHECK violations.
do $$
declare
  v_invalid_profile_keys text[];
  v_invalid_revision_ids uuid[];
begin
  select array_agg(s.catalog_key order by s.catalog_key)
  into v_invalid_profile_keys
  from public.species_compatibility_profiles p
  join public.species s on s.id=p.species_id
  where p.review_status='reviewed' and p.deleted_at is null
    and (
      cardinality(p.required_facts)=0
      or not public.is_unique_text_array(p.required_facts)
      or exists (
        select 1 from unnest(p.required_facts) fact
        where fact not in ('water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation','breeding_behavior')
      )
    );
  if v_invalid_profile_keys is not null then
    raise exception 'Compatibility v3 reviewed Profile requiredFacts backfill incomplete for catalog keys: %', array_to_string(v_invalid_profile_keys, ', ');
  end if;

  select array_agg(r.id order by r.id)
  into v_invalid_revision_ids
  from public.species_compatibility_profile_revisions r
  where r.status in ('draft','pending_review','approved')
    and (
      cardinality(r.required_facts)=0
      or not public.is_unique_text_array(r.required_facts)
      or exists (
        select 1 from unnest(r.required_facts) fact
        where fact not in ('water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation','breeding_behavior')
      )
    );
  if v_invalid_revision_ids is not null then
    raise exception 'Compatibility v3 active Profile revision requiredFacts backfill incomplete for revision ids: %', array_to_string(v_invalid_revision_ids::text[], ', ');
  end if;
end $$;

alter table public.species_compatibility_profiles
  add constraint compatibility_profiles_required_facts_v3_check
    check (review_status<>'reviewed' or (
      cardinality(required_facts)>0 and public.is_unique_text_array(required_facts) and required_facts <@ ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation','breeding_behavior']::text[]
    )),
  add constraint compatibility_profiles_stocking_guidance_v3_check
    check (public.is_valid_compatibility_stocking_guidance(stocking_guidance));

alter table public.species_compatibility_profile_revisions
  add constraint compatibility_profile_revisions_required_facts_v3_check
    check (status in ('rejected','published','superseded') or (
      cardinality(required_facts)>0 and public.is_unique_text_array(required_facts) and required_facts <@ ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation','breeding_behavior']::text[]
    )),
  add constraint compatibility_profile_revisions_stocking_guidance_v3_check
    check (public.is_valid_compatibility_stocking_guidance(stocking_guidance));

update public.species_compatibility_profile_revisions
set status=case when status='approved' then 'pending_review' else status end,
    impact_report='{}'::jsonb, regression_report='{}'::jsonb,
    evidence_resolution='[]'::jsonb, stage_risk_evidence_resolution='{}'::jsonb,
    reviewed_by=null, reviewed_at=null, review_note=null
where status in ('pending_review','approved');
create or replace function public.publish_compatibility_profile_revision(
  p_revision_id uuid,
  p_expected_revision_version integer
) returns jsonb
language plpgsql
security definer
set search_path=public
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
  if coalesce(jsonb_array_length(v_revision.impact_report->'changedFields'),0)=0 then raise exception 'PUBLISH_GATE_REJECTED: impact_missing'; end if;
  if cardinality(v_revision.required_facts)=0 or not public.is_unique_text_array(v_revision.required_facts) or exists (
    select 1 from unnest(v_revision.required_facts) fact
    where fact not in ('water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation','breeding_behavior')
  ) then raise exception 'PUBLISH_GATE_REJECTED: required_facts_invalid'; end if;
  if not public.is_valid_compatibility_stocking_guidance(v_revision.stocking_guidance) then raise exception 'PUBLISH_GATE_REJECTED: stocking_guidance_invalid'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.stage_risk_rules) rule
    where nullif(btrim(rule->>'ruleKey'),'') is null
       or nullif(btrim(rule->>'riskType'),'') is null
       or nullif(btrim(rule->>'reason'),'') is null
       or jsonb_typeof(rule->'youngerStages') is distinct from 'array'
       or jsonb_array_length(coalesce(rule->'youngerStages','[]'::jsonb))=0
       or not public.is_unique_text_array(array(select jsonb_array_elements_text(coalesce(rule->'youngerStages','[]'::jsonb))))
       or exists (select 1 from jsonb_array_elements_text(coalesce(rule->'youngerStages','[]'::jsonb)) stage where stage not in ('unknown','juvenile','adult','fry','subadult'))
       or jsonb_typeof(rule->'olderStages') is distinct from 'array'
       or jsonb_array_length(coalesce(rule->'olderStages','[]'::jsonb))=0
       or not public.is_unique_text_array(array(select jsonb_array_elements_text(coalesce(rule->'olderStages','[]'::jsonb))))
       or exists (select 1 from jsonb_array_elements_text(coalesce(rule->'olderStages','[]'::jsonb)) stage where stage not in ('unknown','juvenile','adult','fry','subadult'))
       or jsonb_typeof(rule->'citations') is distinct from 'array'
       or jsonb_array_length(coalesce(rule->'citations','[]'::jsonb))=0
  ) then raise exception 'PUBLISH_GATE_REJECTED: stage_risk_shape_invalid'; end if;
  if exists (
    select 1 from (
      select rule->>'ruleKey' as rule_key, count(*)
      from jsonb_array_elements(v_revision.stage_risk_rules) rule
      group by rule->>'ruleKey' having count(*)>1
    ) duplicate_rule
  ) then raise exception 'PUBLISH_GATE_REJECTED: stage_risk_rule_key_duplicate'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.stage_risk_rules) rule
    where exists (
      select 1 from (
        select citation->>'sourceKey' as source_key, count(*)
        from jsonb_array_elements(coalesce(rule->'citations','[]'::jsonb)) citation
        group by citation->>'sourceKey'
        having nullif(btrim(citation->>'sourceKey'),'') is null or count(*)>1
      ) duplicate_source
    )
  ) then raise exception 'PUBLISH_GATE_REJECTED: stage_risk_citation_duplicate'; end if;
  if exists (
    select 1 from (
      select citation->>'sourceKey' as source_key, count(*)
      from jsonb_array_elements(v_revision.citation_snapshots) citation
      group by citation->>'sourceKey'
      having nullif(btrim(citation->>'sourceKey'),'') is null or count(*)>1
    ) duplicate_source
  ) then raise exception 'PUBLISH_GATE_REJECTED: profile_citation_duplicate'; end if;
  if jsonb_array_length(v_revision.evidence_resolution)=0
     or jsonb_array_length(v_revision.evidence_resolution)<>jsonb_array_length(v_revision.citation_snapshots)
  then raise exception 'PUBLISH_GATE_REJECTED: evidence_resolution_missing'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.stage_risk_rules) rule
    where not (v_revision.stage_risk_evidence_resolution ? (rule->>'ruleKey'))
       or jsonb_array_length(coalesce(v_revision.stage_risk_evidence_resolution->(rule->>'ruleKey'),'[]'::jsonb))
          <> jsonb_array_length(coalesce(rule->'citations','[]'::jsonb))
       or exists (
         select 1 from jsonb_array_elements(coalesce(rule->'citations','[]'::jsonb)) citation
         where not exists (
           select 1 from jsonb_array_elements(coalesce(v_revision.stage_risk_evidence_resolution->(rule->>'ruleKey'),'[]'::jsonb)) resolved
           where resolved->>'sourceKey'=citation->>'sourceKey'
         )
       )
  ) then raise exception 'PUBLISH_GATE_REJECTED: stage_risk_evidence_resolution_missing'; end if;

  select * into v_baseline from public.species_compatibility_profiles
  where species_id=v_revision.species_id and review_status='reviewed' and deleted_at is null for update;
  if not found then raise exception 'PUBLISH_GATE_REJECTED: reviewed_baseline_missing'; end if;
  if v_baseline.version <> v_revision.base_profile_version then raise exception 'VERSION_CONFLICT: baseline'; end if;
  if exists (
    select 1 from jsonb_array_elements(v_revision.evidence_resolution) item
    left join public.evidence_sources e on e.id=(item->>'sourceId')::uuid
    where e.id is null or e.source_key<>item->>'sourceKey' or e.review_status<>'reviewed'
      or e.deleted_at is not null or e.version<>(item->>'version')::integer
  ) then raise exception 'VERSION_CONFLICT: evidence'; end if;

  if exists (
    select 1 from jsonb_array_elements(v_revision.stage_risk_rules) rule
    cross join lateral jsonb_array_elements(coalesce(v_revision.stage_risk_evidence_resolution->(rule->>'ruleKey'),'[]'::jsonb)) item
    left join public.evidence_sources e on e.id=(item->>'sourceId')::uuid
    where e.id is null or e.source_key<>item->>'sourceKey' or e.review_status<>'reviewed'
      or e.deleted_at is not null or e.version<>(item->>'version')::integer
  ) then raise exception 'VERSION_CONFLICT: stage_risk_evidence'; end if;

  update public.species_compatibility_profiles set
    behavior_traits=v_revision.behavior_traits,
    minimum_group_size=v_revision.minimum_group_size,
    predation_targets=v_revision.predation_targets,
    required_facts=v_revision.required_facts,
    stocking_guidance=v_revision.stocking_guidance,
    confidence=v_revision.confidence,
    review_status='reviewed',reviewed_by=auth.uid(),reviewed_at=now()
  where id=v_baseline.id returning version into v_new_version;
  delete from public.species_compatibility_profile_sources where profile_id=v_baseline.id;
  insert into public.species_compatibility_profile_sources(profile_id,source_id)
  select v_baseline.id,(item->>'sourceId')::uuid
  from jsonb_array_elements(v_revision.evidence_resolution) item;

  delete from public.species_compatibility_profile_stage_risks where profile_id=v_baseline.id;
  insert into public.species_compatibility_profile_stage_risks(
    profile_id,rule_key,younger_stages,older_stages,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_by,reviewed_at
  )
  select v_baseline.id,
    rule->>'ruleKey',
    array(select jsonb_array_elements_text(coalesce(rule->'youngerStages','[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(rule->'olderStages','[]'::jsonb))),
    rule->>'verdict',rule->>'riskType',rule->>'reason',
    array(select jsonb_array_elements_text(coalesce(rule->'mitigation','[]'::jsonb))),
    coalesce(rule->>'basis','species_trait'),coalesce(rule->>'confidence','unknown'),'reviewed',auth.uid(),now()
  from jsonb_array_elements(v_revision.stage_risk_rules) rule;

  insert into public.species_compatibility_profile_stage_risk_sources(stage_risk_id,source_id)
  select sr.id,(resolved->>'sourceId')::uuid
  from jsonb_array_elements(v_revision.stage_risk_rules) rule
  join public.species_compatibility_profile_stage_risks sr
    on sr.profile_id=v_baseline.id and sr.rule_key=rule->>'ruleKey'
  cross join lateral jsonb_array_elements(coalesce(v_revision.stage_risk_evidence_resolution->(rule->>'ruleKey'),'[]'::jsonb)) resolved;
  update public.species_compatibility_profile_revisions
    set status='superseded'
    where species_id=v_revision.species_id and id<>v_revision.id and status='published';
  update public.species_compatibility_profile_revisions
    set status='published',published_at=now()
    where id=v_revision.id;

  update public.compatibility_authority_state
    set version=version+1,updated_at=now()
    where singleton=true returning version into v_next_authority_version;

  return jsonb_build_object(
    'revisionId',v_revision.id,
    'baselineId',v_baseline.id,
    'baselineVersion',v_new_version,
    'authorityVersion',v_next_authority_version
  );
end;
$$;

revoke all on function public.publish_compatibility_profile_revision(uuid,integer) from public;
grant execute on function public.publish_compatibility_profile_revision(uuid,integer) to authenticated;

comment on function public.publish_compatibility_profile_revision(uuid,integer) is
  'Atomically publishes one approved Compatibility v3 Profile including required facts, stocking guidance, Profile evidence and Profile-owned Stage Risk evidence.';

commit;
