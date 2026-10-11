-- Add reviewed Compatibility authority for three stable marine taxa:
-- sp_0022 Lutjanus kasmira
-- sp_0023 Zebrasoma flavescens
-- sp_0024 Paracanthurus hepatus
-- Narrow additive release: 3 evidence sources + 3 profiles + 3 profile-source links.
-- No pair rule or stage-risk changes.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 39 then
    raise exception 'PRECHECK: expected 39 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 74 then
    raise exception 'PRECHECK: expected 74 reviewed evidence sources';
  end if;
  if (select count(*) from public.content_publications) <> 527
     or (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: unrelated Product/Care authority drift';
  end if;
  if (select count(*) from public.species where catalog_key in ('sp_0022','sp_0023','sp_0024') and status='published' and deleted_at is null) <> 3 then
    raise exception 'PRECHECK: expected all three marine species rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0022','sp_0023','sp_0024')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: marine Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'fishbase-lutjanus-kasmira',
      'fishbase-zebrasoma-flavescens',
      'fishbase-paracanthurus-hepatus'
    )
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: marine evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'fishbase-lutjanus-kasmira',
  'Lutjanus kasmira species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Lutjanus-kasmira',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishbase-zebrasoma-flavescens',
  'Zebrasoma flavescens species summary',
  'FishBase',
  'https://www.fishbase.se/summary/6018',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishbase-paracanthurus-hepatus',
  'Paracanthurus hepatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Paracanthurus-hepatus.html',
  'curated_husbandry',
  'reviewed',
  now()
);

create temporary table compatibility_marine_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null,
  source_key text not null
);

insert into compatibility_marine_expected_profiles values
(
  'sp_0022',
  array['group_living']::text[],
  array[]::text[],
  'medium',
  array['water','adult_size','social_behavior']::text[],
  'fishbase-lutjanus-kasmira'
),
(
  'sp_0023',
  array['variable_social']::text[],
  array[]::text[],
  'medium',
  array['water','adult_size','social_behavior']::text[],
  'fishbase-zebrasoma-flavescens'
),
(
  'sp_0024',
  array['group_living']::text[],
  array[]::text[],
  'medium',
  array['water','adult_size','social_behavior']::text[],
  'fishbase-paracanthurus-hepatus'
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
  x.behavior_traits,
  null,
  x.predation_targets,
  x.confidence,
  'reviewed',
  now(),
  x.required_facts,
  null
from compatibility_marine_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_marine_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null
join public.species_compatibility_profiles p
  on p.species_id=s.id
 and p.review_status='reviewed'
 and p.deleted_at is null
join public.evidence_sources e
  on e.source_key=x.source_key
 and e.review_status='reviewed'
 and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 42 then
    raise exception 'POSTCHECK: expected 42 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 77 then
    raise exception 'POSTCHECK: expected 77 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_marine_expected_profiles x
    left join public.species s
      on s.catalog_key=x.catalog_key
     and s.status='published'
     and s.deleted_at is null
    left join public.species_compatibility_profiles p
      on p.species_id=s.id
     and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is not null
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.review_status is distinct from 'reviewed'
       or p.required_facts is distinct from x.required_facts
       or p.stocking_guidance is not null
  ) then
    raise exception 'POSTCHECK: marine profile drift';
  end if;
  if exists (
    select 1
    from compatibility_marine_expected_profiles x
    join public.species s on s.catalog_key=x.catalog_key
    join public.species_compatibility_profiles p on p.species_id=s.id and p.deleted_at is null
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id
    left join public.evidence_sources e on e.id=l.source_id and e.source_key=x.source_key
    where e.id is null
  ) then
    raise exception 'POSTCHECK: marine source-link drift';
  end if;
  if (select count(*) from public.content_publications) <> 527
     or (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
