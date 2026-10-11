-- Add reviewed Compatibility authority for:
-- sp_0038 Opsariichthys bidens (Chinese hooksnout carp / 马口鱼)
-- Narrow additive release: 3 evidence sources + 1 profile + 3 profile-source links.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 43 then
    raise exception 'PRECHECK: expected 43 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 79 then
    raise exception 'PRECHECK: expected 79 reviewed evidence sources';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care publication snapshot count drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41 then
    raise exception 'PRECHECK: Product/Care base count drift';
  end if;
  if (select count(*) from public.species where catalog_key='sp_0038' and status='published' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected published sp_0038 species row';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0038' and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0038 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'fishbase-opsariichthys-bidens',
      'doi-opsariichthys-bidens-ontogeny-diet',
      'doi-opsariichthys-bidens-enrichment-2024'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: sp_0038 evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'fishbase-opsariichthys-bidens',
  'Opsariichthys bidens species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Opsariichthys-bidens',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'doi-opsariichthys-bidens-ontogeny-diet',
  'The relationship between ontogeny, morphology, and diet in the Chinese hook snout carp (Opsariichthys bidens)',
  'Ichthyological Research',
  'https://doi.org/10.1007/s10228-005-0316-0',
  'peer_reviewed',
  'reviewed',
  now()
),
(
  'doi-opsariichthys-bidens-enrichment-2024',
  'Effects of Environmental Enrichment on the Growth, Gonadal Development, and Welfare of the Chinese Hooksnout Carp (Opsariichthys bidens)',
  'Fishes',
  'https://doi.org/10.3390/fishes9090339',
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
  ARRAY['predatory','interspecific_aggression','dominance_hierarchy']::text[],
  null,
  ARRAY['small_fish']::text[],
  'medium',
  'reviewed',
  now(),
  ARRAY['water','adult_size','social_behavior','predation']::text[],
  null
from public.species s
where s.catalog_key='sp_0038'
  and s.status='published'
  and s.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s
  on s.id=p.species_id
 and s.catalog_key='sp_0038'
 and s.status='published'
 and s.deleted_at is null
join public.evidence_sources e
  on e.source_key in (
    'fishbase-opsariichthys-bidens',
    'doi-opsariichthys-bidens-ontogeny-diet',
    'doi-opsariichthys-bidens-enrichment-2024'
  )
 and e.review_status='reviewed'
 and e.deleted_at is null
where p.review_status='reviewed'
  and p.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 44 then
    raise exception 'POSTCHECK: expected 44 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 82 then
    raise exception 'POSTCHECK: expected 82 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if not exists (
    select 1
    from public.species_compatibility_profiles cp
    join public.species s on s.id=cp.species_id
    where s.catalog_key='sp_0038'
      and cp.behavior_traits=ARRAY['predatory','interspecific_aggression','dominance_hierarchy']::text[]
      and cp.minimum_group_size is null
      and cp.predation_targets=ARRAY['small_fish']::text[]
      and cp.confidence='medium'
      and cp.review_status='reviewed'
      and cp.required_facts=ARRAY['water','adult_size','social_behavior','predation']::text[]
      and cp.stocking_guidance is null
      and cp.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0038 profile drift';
  end if;
  if (
    select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id
    left join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key='sp_0038'
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> ARRAY[
    'doi-opsariichthys-bidens-enrichment-2024',
    'doi-opsariichthys-bidens-ontogeny-diet',
    'fishbase-opsariichthys-bidens'
  ]::text[] then
    raise exception 'POSTCHECK: sp_0038 source links drift';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
