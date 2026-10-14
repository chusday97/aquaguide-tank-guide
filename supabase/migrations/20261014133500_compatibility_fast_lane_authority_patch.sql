-- Additive Compatibility authority patch for already-released species.
-- Historical release migrations remain immutable.
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
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 177 then
    raise exception 'PRECHECK: expected 177 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (select count(*) from public.species s join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null where s.catalog_key in ('sp_0197','sp_0447','sp_0451') and s.status='published' and s.deleted_at is null) <> 3 then
    raise exception 'PRECHECK: expected all three Fast Lane target profiles';
  end if;
  if (select count(*) from public.evidence_sources where source_key='fishbase-symphysodon-aequifasciatus' and review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected existing discus FishBase authority';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'batch03-fishbase-astronotus-ocellatus',
      'animaldiversity-astronotus-ocellatus-behavior',
      'icar-cifa-channa-stewartii-live-fish'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: Fast Lane patch evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'batch03-fishbase-astronotus-ocellatus',
  'Astronotus ocellatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Astronotus-ocellatus.html',
  'curated_husbandry',
  'reviewed',
  now()
),
(
  'animaldiversity-astronotus-ocellatus-behavior',
  'Astronotus ocellatus behavior and reproduction',
  'Animal Diversity Web, University of Michigan',
  'https://animaldiversity.org/accounts/Astronotus_ocellatus/',
  'university',
  'reviewed',
  now()
),
(
  'icar-cifa-channa-stewartii-live-fish',
  'ICAR-CIFA Annual Report 2019: stock development of indigenous ornamental Channa species',
  'ICAR-Central Institute of Freshwater Aquaculture',
  'https://cifa.nic.in/sites/default/files/Report_2019.pdf',
  'government',
  'reviewed',
  now()
);

update public.species_compatibility_profiles p
set required_facts = ARRAY[
  'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'
]::text[],
    predation_targets = ARRAY[]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0197'
  and p.review_status='reviewed'
  and p.deleted_at is null;

update public.species_compatibility_profiles p
set behavior_traits = ARRAY['shoaling','breeding_defense','breeding_territoriality']::text[],
    required_facts = ARRAY[
      'water','temperature','ph','adult_size','social_behavior','breeding_behavior',
      'tank_size','territoriality','predation'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0447'
  and p.review_status='reviewed'
  and p.deleted_at is null;

update public.species_compatibility_profiles p
set behavior_traits = ARRAY['predatory','territorial','territory_defense']::text[],
    required_facts = ARRAY[
      'water','temperature','adult_size','predation','ph','tank_size','social_behavior','territoriality'
    ]::text[],
    reviewed_at = now()
from public.species s
where s.id=p.species_id
  and s.catalog_key='sp_0451'
  and p.review_status='reviewed'
  and p.deleted_at is null;

create temporary table compatibility_fast_lane_patch_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_fast_lane_patch_sources values
('sp_0197','icar-cifa-channa-stewartii-live-fish'),
('sp_0447','fishbase-symphysodon-aequifasciatus'),
('sp_0451','batch03-fishbase-astronotus-ocellatus'),
('sp_0451','animaldiversity-astronotus-ocellatus-behavior');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_fast_lane_patch_sources x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then
    raise exception 'POSTCHECK: expected 101 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 180 then
    raise exception 'POSTCHECK: expected 180 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;

  if exists (
    select 1
    from public.species s
    join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where (s.catalog_key='sp_0197' and (
      p.predation_targets is distinct from ARRAY[]::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]
    ))
    or (s.catalog_key='sp_0447' and (
      p.behavior_traits is distinct from ARRAY['shoaling','breeding_defense','breeding_territoriality']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior','tank_size','territoriality','predation']::text[]
    ))
    or (s.catalog_key='sp_0451' and (
      p.behavior_traits is distinct from ARRAY['predatory','territorial','territory_defense']::text[]
      or p.required_facts is distinct from ARRAY['water','temperature','adult_size','predation','ph','tank_size','social_behavior','territoriality']::text[]
    ))
  ) then
    raise exception 'POSTCHECK: Fast Lane profile patch drift';
  end if;

  if exists (
    select 1
    from compatibility_fast_lane_patch_sources x
    left join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    left join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id and l.source_id=e.id
    where l.profile_id is null
  ) then
    raise exception 'POSTCHECK: Fast Lane profile-source link missing';
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
