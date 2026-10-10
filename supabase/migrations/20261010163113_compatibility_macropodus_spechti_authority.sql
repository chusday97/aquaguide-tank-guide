-- Add reviewed Compatibility authority for:
-- sp_0044 Macropodus spechti (Black Paradise Fish)
-- Narrow additive release: 2 evidence sources + 1 profile + 2 profile-source links.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 38 then
    raise exception 'PRECHECK: expected 38 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 72 then
    raise exception 'PRECHECK: expected 72 reviewed evidence sources';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care publication snapshot count drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: Product/Care base count drift';
  end if;
  if (select count(*) from public.species where catalog_key='sp_0044' and status='published' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected published sp_0044 species row';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0044'
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0044 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'fishbase-macropodus-spechti',
      'seriouslyfish-macropodus-spechti'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0044 evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'fishbase-macropodus-spechti',
  'Macropodus spechti species summary',
  'FishBase',
  'https://www.fishbase.org/summary/Macropodus-spechti.html',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'seriouslyfish-macropodus-spechti',
  'Macropodus spechti (Black Paradise Fish)',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/macropodus-spechti',
  'curated_husbandry',
  'reviewed',
  now()
);

insert into public.species_compatibility_profiles(
  species_id,
  behavior_traits,
  minimum_group_size,
  predation_targets,
  confidence,
  review_status,
  reviewed_at,
  required_facts,
  stocking_guidance
)
select
  s.id,
  ARRAY['breeding_defense']::text[],
  null,
  ARRAY[]::text[],
  'high',
  'reviewed',
  now(),
  ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[],
  null
from public.species s
where s.catalog_key='sp_0044'
  and s.status='published'
  and s.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s
  on s.id=p.species_id
 and s.catalog_key='sp_0044'
 and s.status='published'
 and s.deleted_at is null
join public.evidence_sources e
  on e.source_key in (
    'fishbase-macropodus-spechti',
    'seriouslyfish-macropodus-spechti'
  )
 and e.review_status='reviewed'
 and e.deleted_at is null
where p.review_status='reviewed'
  and p.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 39 then
    raise exception 'POSTCHECK: expected 39 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 74 then
    raise exception 'POSTCHECK: expected 74 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if not exists (
    select 1
    from public.species_compatibility_profiles cp
    join public.species s on s.id=cp.species_id
    where s.catalog_key='sp_0044'
      and cp.behavior_traits=ARRAY['breeding_defense']::text[]
      and cp.minimum_group_size is null
      and cp.predation_targets=ARRAY[]::text[]
      and cp.confidence='high'
      and cp.review_status='reviewed'
      and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]
      and cp.stocking_guidance is null
      and cp.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0044 profile drift';
  end if;
  if (
    select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id
    left join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key='sp_0044'
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> ARRAY['fishbase-macropodus-spechti','seriouslyfish-macropodus-spechti']::text[] then
    raise exception 'POSTCHECK: sp_0044 source links drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
