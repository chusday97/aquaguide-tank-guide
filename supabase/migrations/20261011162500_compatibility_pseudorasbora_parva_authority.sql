-- Add reviewed Compatibility authority for:
-- sp_0042 Pseudorasbora parva (topmouth gudgeon / 麦穗鱼)
-- Narrow additive release: 3 evidence sources + 1 profile + 3 profile-source links.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 44 then
    raise exception 'PRECHECK: expected 44 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 82 then
    raise exception 'PRECHECK: expected 82 reviewed evidence sources';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care publication snapshot count drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: Product/Care base count drift';
  end if;
  if (select count(*) from public.species where catalog_key='sp_0042' and status='published' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected published sp_0042 species row';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0042' and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0042 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'batch08-fishbase-pseudorasbora-parva',
      'doi-pseudorasbora-parva-spawning-competition-2004',
      'doi-pseudorasbora-parva-shoaling-2005'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0042 evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'batch08-fishbase-pseudorasbora-parva',
  'Pseudorasbora parva species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Pseudorasbora-parva.html',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'doi-pseudorasbora-parva-spawning-competition-2004',
  'Size-dependent male-male competition for a spawning substrate between Pseudorasbora parva and Pseudorasbora pumila',
  'Ichthyological Research',
  'https://doi.org/10.1007/s10228-003-0203-5',
  'peer_reviewed',
  'reviewed',
  now()
),
(
  'doi-pseudorasbora-parva-shoaling-2005',
  'Foraging of a Small Planktivore (Pseudorasbora parva: Cyprinidae) and its Behavioral Flexibility in an Artificial Stream',
  'Hydrobiologia',
  'https://doi.org/10.1007/s10750-005-5442-1',
  'peer_reviewed',
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
  ARRAY['shoaling','breeding_defense']::text[],
  null,
  ARRAY[]::text[],
  'medium',
  'reviewed',
  now(),
  ARRAY['water','adult_size','social_behavior','breeding_behavior']::text[],
  null
from public.species s
where s.catalog_key='sp_0042'
  and s.status='published'
  and s.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s
  on s.id=p.species_id
 and s.catalog_key='sp_0042'
 and s.status='published'
 and s.deleted_at is null
join public.evidence_sources e
  on e.source_key in (
    'batch08-fishbase-pseudorasbora-parva',
    'doi-pseudorasbora-parva-spawning-competition-2004',
    'doi-pseudorasbora-parva-shoaling-2005'
  )
 and e.review_status='reviewed'
 and e.deleted_at is null
where p.review_status='reviewed'
  and p.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 45 then
    raise exception 'POSTCHECK: expected 45 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 85 then
    raise exception 'POSTCHECK: expected 85 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if not exists (
    select 1
    from public.species_compatibility_profiles cp
    join public.species s on s.id=cp.species_id
    where s.catalog_key='sp_0042'
      and cp.behavior_traits=ARRAY['shoaling','breeding_defense']::text[]
      and cp.minimum_group_size is null
      and cp.predation_targets=ARRAY[]::text[]
      and cp.confidence='medium'
      and cp.review_status='reviewed'
      and cp.required_facts=ARRAY['water','adult_size','social_behavior','breeding_behavior']::text[]
      and cp.stocking_guidance is null
      and cp.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0042 profile drift';
  end if;
  if (
    select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id
    left join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key='sp_0042'
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> ARRAY[
    'batch08-fishbase-pseudorasbora-parva',
    'doi-pseudorasbora-parva-shoaling-2005',
    'doi-pseudorasbora-parva-spawning-competition-2004'
  ]::text[] then
    raise exception 'POSTCHECK: sp_0042 source links drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
