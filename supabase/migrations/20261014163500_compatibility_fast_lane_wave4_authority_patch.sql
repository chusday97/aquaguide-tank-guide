-- Additive Compatibility Fast Lane wave4 authority patch.
-- Closes two evidence-backed territoriality gaps and records one terminal tank-size evidence conflict.
-- Requires the released wave3 authority state first; historical migrations remain immutable.
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
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 184 then
    raise exception 'PRECHECK: expected 184 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (
    select count(*)
    from public.species s
    join public.species_compatibility_profiles p
      on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where s.catalog_key in ('sp_0105','sp_0468','sp_0198')
      and s.status='published' and s.deleted_at is null
  ) <> 3 then
    raise exception 'PRECHECK: expected all three Fast Lane wave4 target profiles';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'aquaticarts-polypterus-ornatipinnis-conspecific-territoriality',
      'wetwebmedia-polypterus-ornatipinnis-territoriality',
      'hydrohabitats-trigonostigma-heteromorpha-nonterritorial',
      'baqua-channa-diplogramma-tank-minimum',
      'fishipedia-channa-diplogramma-tank-minimum'
    )
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: Fast Lane wave4 evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'aquaticarts-polypterus-ornatipinnis-conspecific-territoriality',
  'Ornate Bichir (Polypterus ornatipinnis), Tank-Bred',
  'Aquatic Arts',
  'https://aquaticarts.com/products/ornate-bichir',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'wetwebmedia-polypterus-ornatipinnis-territoriality',
  'Bichirs compatibility FAQ: Polypterus ornatipinnis territoriality',
  'WetWebMedia',
  'https://www.wetwebmedia.com/FWSubWebIndex/polypcompfaqs.htm',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'hydrohabitats-trigonostigma-heteromorpha-nonterritorial',
  'Harlequin Rasbora care guide',
  'Hydro Habitats',
  'https://www.hydrohabitats.com/guides/freshwater-fish-harlequin-rasbora',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'baqua-channa-diplogramma-tank-minimum',
  'Channa diplogramma husbandry profile',
  'B-Aqua',
  'https://www.b-aqua.com/pages/fiche.aspx?id=980&media=print',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'fishipedia-channa-diplogramma-tank-minimum',
  'Channa diplogramma fish sheet',
  'Fishi-pedia',
  'https://www.fishi-pedia.com/fishes/channa-diplogramma',
  'curated_husbandry',
  'reviewed',
  now()
);

update public.species_compatibility_profiles p
set behavior_traits = ARRAY['predatory','large_fish_community','conspecific_territoriality']::text[],
    required_facts = ARRAY[
      'water','temperature','ph','adult_size','tank_size','social_behavior','predation','territoriality'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0105'
  and p.review_status='reviewed'
  and p.deleted_at is null;

update public.species_compatibility_profiles p
set required_facts = ARRAY[
      'water','temperature','ph','adult_size','social_behavior','tank_size','territoriality','predation'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0468'
  and p.review_status='reviewed'
  and p.deleted_at is null;

create temporary table compatibility_fast_lane_wave4_profile_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_fast_lane_wave4_profile_sources values
('sp_0105','aquaticarts-polypterus-ornatipinnis-conspecific-territoriality'),
('sp_0105','wetwebmedia-polypterus-ornatipinnis-territoriality'),
('sp_0468','hydrohabitats-trigonostigma-heteromorpha-nonterritorial');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_fast_lane_wave4_profile_sources x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
declare
  channa_profile_id uuid;
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then
    raise exception 'POSTCHECK: expected 101 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 189 then
    raise exception 'POSTCHECK: expected 189 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;

  if exists (
    select 1
    from public.species s
    join public.species_compatibility_profiles p
      on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where (s.catalog_key='sp_0105' and (
      p.behavior_traits is distinct from ARRAY['predatory','large_fish_community','conspecific_territoriality']::text[]
      or p.predation_targets is distinct from ARRAY['small_fish']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','predation','territoriality']::text[]
    ))
    or (s.catalog_key='sp_0468' and (
      p.behavior_traits is distinct from ARRAY['shoaling','peaceful']::text[]
      or p.predation_targets is distinct from ARRAY[]::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','social_behavior','tank_size','territoriality','predation']::text[]
    ))
    or (s.catalog_key='sp_0198' and (
      p.behavior_traits is distinct from ARRAY['species_tank_required','predatory','adult_conspecific_aggression','very_large_space_requirement']::text[]
      or p.predation_targets is distinct from ARRAY['small_fish']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality','predation']::text[]
    ))
  ) then
    raise exception 'POSTCHECK: Fast Lane wave4 profile patch drift';
  end if;

  if exists (
    select 1
    from compatibility_fast_lane_wave4_profile_sources x
    left join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    left join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id and l.source_id=e.id
    where l.profile_id is null
  ) then
    raise exception 'POSTCHECK: Fast Lane wave4 profile-source link missing';
  end if;

  select p.id into channa_profile_id
  from public.species s
  join public.species_compatibility_profiles p
    on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
  where s.catalog_key='sp_0198' and s.status='published' and s.deleted_at is null;

  if exists (
    select 1
    from public.species_compatibility_profile_sources l
    join public.evidence_sources e on e.id=l.source_id and e.deleted_at is null
    where l.profile_id=channa_profile_id
      and e.source_key in (
        'baqua-channa-diplogramma-tank-minimum',
        'fishipedia-channa-diplogramma-tank-minimum'
      )
  ) then
    raise exception 'POSTCHECK: conflicting Channa numeric-minimum evidence must not be linked as Profile authority';
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
