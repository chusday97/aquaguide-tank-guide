-- Additive Compatibility Fast Lane wave2 authority patch.
-- Historical release migrations and prior authority patches remain immutable.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then
    raise exception 'PRECHECK: expected 101 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 180 then
    raise exception 'PRECHECK: expected 180 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (select count(*) from public.species s join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null where s.catalog_key in ('sp_0139','sp_0199') and s.status='published' and s.deleted_at is null) <> 2 then
    raise exception 'PRECHECK: expected both Fast Lane wave2 target profiles';
  end if;
  if (select count(*) from public.evidence_sources where source_key='seriouslyfish-badis-badis' and review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected existing Badis Seriously Fish authority';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key='animaldiversity-piaractus-brachypomus' and deleted_at is null
  ) then
    raise exception 'PRECHECK: Fast Lane wave2 ADW source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values (
  'animaldiversity-piaractus-brachypomus',
  'Piaractus brachypomus (Cachama) behavior and natural history',
  'Animal Diversity Web, University of Michigan',
  'https://animaldiversity.org/accounts/Piaractus_brachypomus/',
  'university',
  'reviewed',
  now()
);

update public.species_compatibility_profiles p
set behavior_traits = ARRAY[
      'group_living','peaceful','very_large_space_requirement','territorial','age_increasing_territoriality'
    ]::text[],
    predation_targets = ARRAY['small_fish']::text[],
    required_facts = ARRAY[
      'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0139'
  and p.review_status='reviewed'
  and p.deleted_at is null;

update public.species_compatibility_profiles p
set predation_targets = ARRAY['very_small_fish']::text[],
    required_facts = ARRAY[
      'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0199'
  and p.review_status='reviewed'
  and p.deleted_at is null;

create temporary table compatibility_fast_lane_wave2_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_fast_lane_wave2_sources values
('sp_0139','animaldiversity-piaractus-brachypomus'),
('sp_0199','seriouslyfish-badis-badis');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_fast_lane_wave2_sources x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then
    raise exception 'POSTCHECK: expected 101 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 181 then
    raise exception 'POSTCHECK: expected 181 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;

  if exists (
    select 1
    from public.species s
    join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where (s.catalog_key='sp_0139' and (
      p.behavior_traits is distinct from ARRAY['group_living','peaceful','very_large_space_requirement','territorial','age_increasing_territoriality']::text[]
      or p.predation_targets is distinct from ARRAY['small_fish']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]
    ))
    or (s.catalog_key='sp_0199' and (
      p.predation_targets is distinct from ARRAY['very_small_fish']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]
    ))
  ) then
    raise exception 'POSTCHECK: Fast Lane wave2 profile patch drift';
  end if;

  if exists (
    select 1
    from compatibility_fast_lane_wave2_sources x
    left join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    left join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id and l.source_id=e.id
    where l.profile_id is null
  ) then
    raise exception 'POSTCHECK: Fast Lane wave2 profile-source link missing';
  end if;

  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
