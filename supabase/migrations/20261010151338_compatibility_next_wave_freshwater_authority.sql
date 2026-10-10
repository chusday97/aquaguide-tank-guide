-- Add reviewed Compatibility authority for:
-- sp_0019 Pterophyllum altum
-- sp_0026 Hypostomus plecostomus
-- sp_0043 Macropodus ocellatus
-- Narrow additive release: 5 evidence sources + 3 profiles + 5 profile-source links.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 35 then
    raise exception 'PRECHECK: expected 35 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 67 then
    raise exception 'PRECHECK: expected 67 reviewed evidence sources';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care publication snapshot count drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: Product/Care base count drift';
  end if;
  if (select count(*) from public.species where catalog_key in ('sp_0019','sp_0026','sp_0043') and status='published' and deleted_at is null) <> 3 then
    raise exception 'PRECHECK: expected all three next-wave species rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0019','sp_0026','sp_0043')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: one or more next-wave Compatibility profiles already exist';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'fishbase-pterophyllum-altum',
      'seriouslyfish-pterophyllum-altum',
      'fishbase-hypostomus-plecostomus',
      'fishbase-macropodus-ocellatus',
      'seriouslyfish-macropodus-ocellatus'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: one or more next-wave evidence sources already exist';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'fishbase-pterophyllum-altum',
  'Pterophyllum altum species summary',
  'FishBase',
  'https://www.fishbase.se/summary/pterophyllum-altum.html',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'seriouslyfish-pterophyllum-altum',
  'Pterophyllum altum (Altum Angel)',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/pterophyllum-altum',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishbase-hypostomus-plecostomus',
  'Hypostomus plecostomus species summary',
  'FishBase',
  'https://www.fishbase.org/summary/3057',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishbase-macropodus-ocellatus',
  'Macropodus ocellatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Macropodus-ocellatus.html',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'seriouslyfish-macropodus-ocellatus',
  'Macropodus ocellatus (Roundtail Paradise Fish)',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/macropodus-ocellatus',
  'curated_husbandry',
  'reviewed',
  now()
);

create temporary table compatibility_next_wave_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_next_wave_expected_profiles values
(
  'sp_0019',
  array['small_fish_predation']::text[],
  array['very_small_fish']::text[],
  'high',
  array['water','temperature','ph','adult_size','predation']::text[]
),
(
  'sp_0026',
  array['bottom_dwelling']::text[],
  array[]::text[],
  'medium',
  array['water','temperature','ph','adult_size']::text[]
),
(
  'sp_0043',
  array['breeding_defense','territorial']::text[],
  array[]::text[],
  'high',
  array['water','temperature','ph','adult_size','territoriality','breeding_behavior']::text[]
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
from compatibility_next_wave_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

create temporary table compatibility_next_wave_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_next_wave_expected_sources values
('sp_0019','fishbase-pterophyllum-altum'),
('sp_0019','seriouslyfish-pterophyllum-altum'),
('sp_0026','fishbase-hypostomus-plecostomus'),
('sp_0043','fishbase-macropodus-ocellatus'),
('sp_0043','seriouslyfish-macropodus-ocellatus');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_next_wave_expected_sources x
join public.species s
  on s.catalog_key=x.catalog_key
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
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 38 then
    raise exception 'POSTCHECK: expected 38 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 72 then
    raise exception 'POSTCHECK: expected 72 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_next_wave_expected_profiles x
    left join public.species s
      on s.catalog_key=x.catalog_key and s.deleted_at is null and s.status='published'
    left join public.species_compatibility_profiles p
      on p.species_id=s.id and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is not null
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.review_status is distinct from 'reviewed'
       or p.required_facts is distinct from x.required_facts
       or p.stocking_guidance is not null
  ) then
    raise exception 'POSTCHECK: next-wave profile drift';
  end if;
  if exists (
    select catalog_key,source_key from compatibility_next_wave_expected_sources
    except
    select s.catalog_key,e.source_key
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    join public.species_compatibility_profile_sources l on l.profile_id=p.id
    join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key in ('sp_0019','sp_0026','sp_0043')
  ) or exists (
    select s.catalog_key,e.source_key
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    join public.species_compatibility_profile_sources l on l.profile_id=p.id
    join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key in ('sp_0019','sp_0026','sp_0043')
    except
    select catalog_key,source_key from compatibility_next_wave_expected_sources
  ) then
    raise exception 'POSTCHECK: next-wave source-link drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
