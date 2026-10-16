-- Reconcile Production Compatibility authority for Chrysiptera cyanea with
-- source-controlled reviewed wave21/wave22/wave23 evidence. Product publication
-- snapshots are intentionally not modified by this Compatibility-only migration.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 109 then
    raise exception 'PRECHECK: expected 109 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 200 then
    raise exception 'PRECHECK: expected 200 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (select count(*) from public.species s
      join public.species_compatibility_profiles p on p.species_id=s.id
      where s.catalog_key='sp_0187' and s.status='published' and s.deleted_at is null
        and p.review_status='reviewed' and p.deleted_at is null
        and p.version=1
        and p.required_facts = ARRAY['water','social_behavior','territoriality']::text[]
        and p.predation_targets = ARRAY[]::text[]
        and p.behavior_traits = ARRAY['territorial','aggressive_for_size']::text[]
        and p.confidence='medium') <> 1 then
    raise exception 'PRECHECK: sp_0187 reviewed profile baseline drift';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'research-wave21-fishipedia-chrysiptera-cyanea',
      'fishbase-chrysiptera-cyanea-diet-wave22'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: Chrysiptera reconciliation evidence already exists';
  end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key), ARRAY[]::text[])
      from public.species s
      join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
      left join public.species_compatibility_profile_sources l on l.profile_id=p.id
      left join public.evidence_sources e on e.id=l.source_id and e.review_status='reviewed' and e.deleted_at is null
      where s.catalog_key='sp_0187')
      is distinct from ARRAY['atlarium-chrysiptera-cyanea','batch11-fishbase-chrysiptera-cyanea']::text[] then
    raise exception 'PRECHECK: sp_0187 source baseline drift';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'research-wave21-fishipedia-chrysiptera-cyanea',
  'Chrysiptera cyanea exact-taxon species profile',
  'Fishipedia',
  'https://www.fishipedia.fr/fr/poissons/chrysiptera-cyanea',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishbase-chrysiptera-cyanea-diet-wave22',
  'Food and Feeding Habits Summary - Chrysiptera cyanea',
  'FishBase',
  'https://fishbase.se/TrophicEco/DietCompoSummary.php?dietcode=2494&genusname=Chrysiptera&speciesname=cyanea',
  'curated_husbandry',
  'reviewed',
  now()
);

update public.species_compatibility_profiles p
set predation_targets = ARRAY['fish_fry']::text[],
    required_facts = ARRAY[
      'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'
    ]::text[],
    version = p.version + 1,
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0187'
  and p.review_status='reviewed'
  and p.deleted_at is null;

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species s
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key in (
  'research-wave21-fishipedia-chrysiptera-cyanea',
  'fishbase-chrysiptera-cyanea-diet-wave22'
) and e.review_status='reviewed' and e.deleted_at is null
where s.catalog_key='sp_0187' and s.status='published' and s.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 109 then
    raise exception 'POSTCHECK: profile count changed';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 202 then
    raise exception 'POSTCHECK: expected 202 reviewed evidence sources';
  end if;
  if (select count(*) from public.species s
      join public.species_compatibility_profiles p on p.species_id=s.id
      where s.catalog_key='sp_0187' and p.review_status='reviewed' and p.deleted_at is null
        and p.version=2
        and p.required_facts = ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]
        and p.predation_targets = ARRAY['fish_fry']::text[]
        and p.behavior_traits = ARRAY['territorial','aggressive_for_size']::text[]
        and p.confidence='medium') <> 1 then
    raise exception 'POSTCHECK: sp_0187 profile reconciliation drift';
  end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key), ARRAY[]::text[])
      from public.species s
      join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
      left join public.species_compatibility_profile_sources l on l.profile_id=p.id
      left join public.evidence_sources e on e.id=l.source_id and e.review_status='reviewed' and e.deleted_at is null
      where s.catalog_key='sp_0187')
      is distinct from ARRAY[
        'atlarium-chrysiptera-cyanea',
        'batch11-fishbase-chrysiptera-cyanea',
        'fishbase-chrysiptera-cyanea-diet-wave22',
        'research-wave21-fishipedia-chrysiptera-cyanea'
      ]::text[] then
    raise exception 'POSTCHECK: sp_0187 reviewed sources drift';
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
