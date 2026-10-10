-- Add reviewed Compatibility authority for Helostoma temminkii (sp_0015).
-- Narrow additive release: 2 evidence sources + 1 profile + 2 profile-source links.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 34 then
    raise exception 'PRECHECK: expected 34 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 65 then
    raise exception 'PRECHECK: expected 65 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where catalog_key='sp_0015' and status='published' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected one published sp_0015 species row';
  end if;
  if exists (
    select 1 from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0015' and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0015 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in ('fishbase-helostoma-temminkii','seriouslyfish-helostoma-temminkii')
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: kissing-gourami evidence source already exists';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486 then
    raise exception 'PRECHECK: species count drift';
  end if;
  if (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: care count drift';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care publication snapshot count drift';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'fishbase-helostoma-temminkii',
  'Helostoma temminkii (Kissing gourami) species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Helostoma-temminckii',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'seriouslyfish-helostoma-temminkii',
  'Helostoma temminkii (Kissing Gourami)',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/helostoma-temminkii',
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
  array['interspecific_aggression']::text[],
  null,
  array[]::text[],
  'medium',
  'reviewed',
  now(),
  array['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[],
  null
from public.species s
where s.catalog_key='sp_0015'
  and s.status='published'
  and s.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s on s.id=p.species_id
join public.evidence_sources e
  on e.source_key in ('fishbase-helostoma-temminkii','seriouslyfish-helostoma-temminkii')
 and e.review_status='reviewed'
 and e.deleted_at is null
where s.catalog_key='sp_0015'
  and p.review_status='reviewed'
  and p.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 35 then
    raise exception 'POSTCHECK: expected 35 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'POSTCHECK: Compatibility pair rule count changed';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: Compatibility stage risk count changed';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 67 then
    raise exception 'POSTCHECK: expected 67 reviewed evidence sources';
  end if;
  if not exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0015'
      and p.behavior_traits=array['interspecific_aggression']::text[]
      and p.minimum_group_size is null
      and p.predation_targets=array[]::text[]
      and p.confidence='medium'
      and p.review_status='reviewed'
      and p.required_facts=array['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]
      and p.stocking_guidance is null
      and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0015 profile drift';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key='sp_0015'
      and e.source_key in ('fishbase-helostoma-temminkii','seriouslyfish-helostoma-temminkii')
  ) <> 2 then
    raise exception 'POSTCHECK: sp_0015 source links drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
