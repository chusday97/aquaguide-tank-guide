begin;

create table if not exists public.species_compatibility_field_reviews (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  field text not null check (field in (
    'identity','water','temperature','ph','adult_size','tank_size',
    'social_behavior','territoriality','predation'
  )),
  proposed_value jsonb not null,
  resolution text not null default 'supported' check (resolution in ('supported','unknown')),
  confidence text not null default 'medium' check (confidence in ('high','medium','low','unknown')),
  review_status text not null default 'reviewed' check (review_status in ('draft','reviewed','rejected')),
  identity_provider_id text,
  identity_external_id text,
  identity_source_url text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists species_compatibility_field_reviews_active_uidx
  on public.species_compatibility_field_reviews(species_id, field)
  where deleted_at is null;

create index if not exists species_compatibility_field_reviews_species_idx
  on public.species_compatibility_field_reviews(species_id)
  where deleted_at is null;

create table if not exists public.species_compatibility_field_review_sources (
  field_review_id uuid not null references public.species_compatibility_field_reviews(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (field_review_id, source_id)
);

alter table public.species_compatibility_field_reviews enable row level security;
alter table public.species_compatibility_field_review_sources enable row level security;

revoke all on table public.species_compatibility_field_reviews from anon, authenticated;
revoke all on table public.species_compatibility_field_review_sources from anon, authenticated;
grant select, insert, update, delete on table public.species_compatibility_field_reviews to service_role;
grant select, insert, update, delete on table public.species_compatibility_field_review_sources to service_role;

drop trigger if exists species_compatibility_field_reviews_set_updated_at on public.species_compatibility_field_reviews;
create trigger species_compatibility_field_reviews_set_updated_at
  before update on public.species_compatibility_field_reviews
  for each row execute function public.set_updated_at_and_version();

drop trigger if exists species_compatibility_field_reviews_bump_authority on public.species_compatibility_field_reviews;
create trigger species_compatibility_field_reviews_bump_authority
  after insert or update or delete on public.species_compatibility_field_reviews
  for each row execute function public.bump_compatibility_authority_state();

drop trigger if exists species_compatibility_field_review_sources_bump_authority on public.species_compatibility_field_review_sources;
create trigger species_compatibility_field_review_sources_bump_authority
  after insert or update or delete on public.species_compatibility_field_review_sources
  for each row execute function public.bump_compatibility_authority_state();

create or replace function public.bump_compatibility_for_evidence_change()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_source_id uuid;
begin
  if tg_op='DELETE' then v_source_id := old.id; else v_source_id := new.id; end if;
  if exists (select 1 from public.species_compatibility_profile_sources where source_id=v_source_id)
    or exists (select 1 from public.species_pair_compatibility_rule_sources where source_id=v_source_id)
    or exists (select 1 from public.species_compatibility_field_review_sources where source_id=v_source_id)
  then
    update public.compatibility_authority_state set version=version+1, updated_at=now() where singleton=true;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.persist_species_compatibility_field_authority(
  p_species_id uuid,
  p_species jsonb,
  p_identity jsonb,
  p_field_reviews jsonb,
  p_sources jsonb,
  p_actor_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path=''
as $$
declare
  v_species_id uuid;
  v_catalog_key text;
  v_scientific_name text;
  v_existing_scientific_name text;
  v_created_species boolean := false;
  v_review jsonb;
  v_source jsonb;
  v_source_key text;
  v_field text;
  v_review_id uuid;
  v_source_keys text[];
  v_source_count integer;
  v_approved_fields text[];
  v_decision_ready boolean;
  v_full_authority_ready boolean;
  v_species_status text;
begin
  if jsonb_typeof(p_species) <> 'object'
    or jsonb_typeof(p_identity) <> 'object'
    or coalesce(jsonb_typeof(p_field_reviews),'null') <> 'array'
    or coalesce(jsonb_typeof(p_sources),'null') <> 'array'
  then
    raise exception 'VALIDATION: invalid Compatibility field-authority payload';
  end if;

  v_catalog_key := nullif(btrim(p_species->>'catalog_key'), '');
  v_scientific_name := nullif(btrim(p_species->>'scientific_name'), '');
  if v_catalog_key is null or v_scientific_name is null then
    raise exception 'VALIDATION: catalog_key and scientific_name are required';
  end if;
  if nullif(btrim(p_identity->>'provider_id'), '') is null
    or nullif(btrim(p_identity->>'external_id'), '') is null
    or nullif(btrim(p_identity->>'source_url'), '') is null
    or nullif(btrim(p_identity->>'canonical_name'), '') is null
  then
    raise exception 'VALIDATION: reviewed identity metadata is incomplete';
  end if;

  select id, scientific_name into v_species_id, v_existing_scientific_name
  from public.species
  where catalog_key=v_catalog_key and deleted_at is null
  for update;

  if v_species_id is null then
    if p_species_id is null then raise exception 'VALIDATION: species id is required for a new catalog object'; end if;
    insert into public.species(
      id,catalog_key,name,scientific_name,category,difficulty,
      water_temperature_text,water_temperature_min_c,water_temperature_max_c,
      ph_level_text,ph_min,ph_max,water_change_cycle_days,description,diet,
      tank_size_text,min_tank_liters,temperament,size_class,housing_mode,housing_reason,
      is_custom,search_terms,status
    ) values (
      p_species_id,
      v_catalog_key,
      nullif(btrim(p_species->>'name'), ''),
      v_scientific_name,
      nullif(btrim(p_species->>'category'), ''),
      nullif(btrim(p_species->>'difficulty'), ''),
      nullif(btrim(p_species->>'water_temperature_text'), ''),
      nullif(p_species->>'water_temperature_min_c','')::numeric,
      nullif(p_species->>'water_temperature_max_c','')::numeric,
      nullif(btrim(p_species->>'ph_level_text'), ''),
      nullif(p_species->>'ph_min','')::numeric,
      nullif(p_species->>'ph_max','')::numeric,
      coalesce(nullif(p_species->>'water_change_cycle_days','')::integer, 7),
      nullif(btrim(p_species->>'description'), ''),
      nullif(btrim(p_species->>'diet'), ''),
      nullif(btrim(p_species->>'tank_size_text'), ''),
      nullif(p_species->>'min_tank_liters','')::numeric,
      nullif(btrim(p_species->>'temperament'), ''),
      nullif(btrim(p_species->>'size_class'), ''),
      nullif(btrim(p_species->>'housing_mode'), ''),
      nullif(btrim(p_species->>'housing_reason'), ''),
      coalesce((p_species->>'is_custom')::boolean, false),
      array(select jsonb_array_elements_text(coalesce(p_species->'search_terms','[]'::jsonb))),
      'draft'
    );
    v_species_id := p_species_id;
    v_created_species := true;
  elsif lower(btrim(v_existing_scientific_name)) <> lower(v_scientific_name) then
    raise exception 'IDENTITY_CONFLICT: catalog object scientific_name does not match reviewed identity';
  end if;

  insert into public.species_compatibility_field_reviews(
    species_id,field,proposed_value,resolution,confidence,review_status,
    identity_provider_id,identity_external_id,identity_source_url,reviewed_at,reviewed_by,deleted_at
  ) values (
    v_species_id,'identity',p_identity,'supported','high','reviewed',
    p_identity->>'provider_id',p_identity->>'external_id',p_identity->>'source_url',
    now(),p_actor_id,null
  )
  on conflict (species_id, field) where deleted_at is null
  do update set
    proposed_value=excluded.proposed_value,
    resolution='supported',
    confidence='high',
    review_status='reviewed',
    identity_provider_id=excluded.identity_provider_id,
    identity_external_id=excluded.identity_external_id,
    identity_source_url=excluded.identity_source_url,
    reviewed_at=excluded.reviewed_at,
    reviewed_by=excluded.reviewed_by,
    deleted_at=null;

  for v_source in select value from jsonb_array_elements(coalesce(p_sources,'[]'::jsonb))
  loop
    v_source_key := nullif(btrim(v_source->>'source_key'), '');
    if v_source_key is null
      or nullif(btrim(v_source->>'title'), '') is null
      or nullif(btrim(v_source->>'publisher'), '') is null
      or nullif(btrim(v_source->>'url'), '') is null
      or nullif(btrim(v_source->>'source_type'), '') is null
    then
      raise exception 'VALIDATION: reviewed evidence source is incomplete';
    end if;

    insert into public.evidence_sources as e(
      source_key,title,publisher,url,source_type,review_status,reviewed_at,deleted_at
    ) values (
      v_source_key,v_source->>'title',v_source->>'publisher',v_source->>'url',
      v_source->>'source_type','reviewed',now(),null
    )
    on conflict (source_key)
    do update set
      title=excluded.title,
      publisher=excluded.publisher,
      url=excluded.url,
      source_type=excluded.source_type,
      review_status='reviewed',
      reviewed_at=coalesce(e.reviewed_at, excluded.reviewed_at),
      deleted_at=null;
  end loop;

  for v_review in select value from jsonb_array_elements(coalesce(p_field_reviews,'[]'::jsonb))
  loop
    v_field := nullif(btrim(v_review->>'field'), '');
    if v_field is null or v_field not in (
      'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'
    ) then
      raise exception 'VALIDATION: unsupported Compatibility authority field %', coalesce(v_field,'<null>');
    end if;
    if v_review->'proposed_value' is null or v_review->'proposed_value' = 'null'::jsonb then
      raise exception 'VALIDATION: field % has no proposed_value', v_field;
    end if;

    select coalesce(array_agg(distinct value), array[]::text[])
    into v_source_keys
    from jsonb_array_elements_text(coalesce(v_review->'source_ids','[]'::jsonb));
    if cardinality(v_source_keys)=0 then
      raise exception 'VALIDATION: field % requires reviewed evidence', v_field;
    end if;

    select count(*) into v_source_count
    from public.evidence_sources e
    where e.source_key = any(v_source_keys)
      and e.review_status='reviewed' and e.deleted_at is null;
    if v_source_count <> cardinality(v_source_keys) then
      raise exception 'VALIDATION: field % references missing or unreviewed evidence', v_field;
    end if;

    insert into public.species_compatibility_field_reviews(
      species_id,field,proposed_value,resolution,confidence,review_status,reviewed_at,reviewed_by,deleted_at
    ) values (
      v_species_id,v_field,v_review->'proposed_value','supported',
      coalesce(nullif(v_review->>'confidence',''),'medium'),'reviewed',now(),p_actor_id,null
    )
    on conflict (species_id, field) where deleted_at is null
    do update set
      proposed_value=excluded.proposed_value,
      resolution='supported',
      confidence=excluded.confidence,
      review_status='reviewed',
      reviewed_at=excluded.reviewed_at,
      reviewed_by=excluded.reviewed_by,
      deleted_at=null
    returning id into v_review_id;

    delete from public.species_compatibility_field_review_sources where field_review_id=v_review_id;
    insert into public.species_compatibility_field_review_sources(field_review_id,source_id)
    select v_review_id,e.id
    from public.evidence_sources e
    where e.source_key = any(v_source_keys)
      and e.review_status='reviewed' and e.deleted_at is null
    on conflict do nothing;
  end loop;

  select coalesce(array_agg(field order by field), array[]::text[])
  into v_approved_fields
  from public.species_compatibility_field_reviews
  where species_id=v_species_id and field <> 'identity'
    and resolution='supported' and review_status='reviewed' and deleted_at is null;

  v_decision_ready := array['adult_size','temperature','water']::text[] <@ v_approved_fields;
  v_full_authority_ready := array[
    'adult_size','ph','predation','social_behavior','tank_size','temperature','territoriality','water'
  ]::text[] <@ v_approved_fields;

  select status into v_species_status from public.species where id=v_species_id;

  return jsonb_build_object(
    'speciesId',v_species_id,
    'catalogKey',v_catalog_key,
    'createdSpecies',v_created_species,
    'speciesStatus',v_species_status,
    'approvedFields',to_jsonb(v_approved_fields),
    'decisionReady',v_decision_ready,
    'fullAuthorityReady',v_full_authority_ready,
    'createsPairRules',false
  );
end;
$$;

revoke all on function public.persist_species_compatibility_field_authority(
  uuid,jsonb,jsonb,jsonb,jsonb,uuid
) from public, anon, authenticated;
grant execute on function public.persist_species_compatibility_field_authority(
  uuid,jsonb,jsonb,jsonb,jsonb,uuid
) to service_role;

commit;
