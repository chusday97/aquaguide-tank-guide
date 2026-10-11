-- Next-wave freshwater batch Compatibility authority.
-- Adds 7 reviewed Profiles atomically:
-- sp_0048, sp_0050, sp_0051, sp_0054, sp_0056, sp_0057, sp_0058.
-- sp_0047 is intentionally excluded from Compatibility Profile publication:
-- targeted review reached a social/prey-scope evidence ceiling and remains fail-closed.
--
-- Prerequisite authority state:
-- 45 reviewed Profiles / 21 Pair Rules / 1 Stage Risk / 85 reviewed Evidence Sources.
-- This means the Chindongo, Opsariichthys and Pseudorasbora migrations must run first.

begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 45 then
    raise exception 'PRECHECK: expected 45 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 85 then
    raise exception 'PRECHECK: expected 85 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (
    select count(*)
    from public.species
    where catalog_key in ('sp_0048','sp_0050','sp_0051','sp_0054','sp_0056','sp_0057','sp_0058')
      and status='published'
      and deleted_at is null
  ) <> 7 then
    raise exception 'PRECHECK: expected 7 published batch species rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0048','sp_0050','sp_0051','sp_0054','sp_0056','sp_0057','sp_0058')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: batch Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'batch19-fishbase-mastacembelus-armatus',
      'seriouslyfish-mastacembelus-armatus',
      'batch19-fishbase-channa-barca',
      'seriouslyfish-channa-barca',
      'batch08-fishbase-acrossocheilus-fasciatus',
      'doi-acrossocheilus-fasciatus-behavior-2024',
      'batch09-fishbase-hemichromis-bimaculatus',
      'batch09-fishbase-heros-severus',
      'fishipedia-heros-severus',
      'batch09-fishbase-altolamprologus-calvus',
      'fishipedia-altolamprologus-calvus',
      'batch09-fishbase-neolamprologus-multifasciatus',
      'fishipedia-neolamprologus-multifasciatus'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: batch evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
('batch19-fishbase-mastacembelus-armatus','Mastacembelus armatus species summary','FishBase','https://www.fishbase.se/summary/Mastacembelus-armatus.html','curated_husbandry','reviewed',now()),
('seriouslyfish-mastacembelus-armatus','Mastacembelus armatus (Tyre-Track Eel)','Seriously Fish','https://www.seriouslyfish.com/species/mastacembelus-armatus','curated_husbandry','reviewed',now()),
('batch19-fishbase-channa-barca','Channa barca species summary','FishBase','https://www.fishbase.se/summary/Channa-barca.html','curated_husbandry','reviewed',now()),
('seriouslyfish-channa-barca','Channa barca','Seriously Fish','https://www.seriouslyfish.com/species/channa-barca','curated_husbandry','reviewed',now()),
('batch08-fishbase-acrossocheilus-fasciatus','Acrossocheilus fasciatus species summary','FishBase','https://www.fishbase.se/summary/Acrossocheilus-fasciatus.html','curated_husbandry','reviewed',now()),
('doi-acrossocheilus-fasciatus-behavior-2024','Behavioural differences between farmed and wild Acrossocheilus fasciatus','Applied Animal Behaviour Science','https://doi.org/10.1016/j.applanim.2024.106460','peer_reviewed','reviewed',now()),
('batch09-fishbase-hemichromis-bimaculatus','Rubricatochromis bimaculatus species summary','FishBase','https://www.fishbase.se/summary/Rubricatochromis-bimaculatus.html','curated_husbandry','reviewed',now()),
('batch09-fishbase-heros-severus','Heros severus species summary','FishBase','https://www.fishbase.se/summary/Heros-severus.html','curated_husbandry','reviewed',now()),
('fishipedia-heros-severus','Heros severus fish sheet','Fishipedia','https://www.fishi-pedia.com/fishes/heros-severus','curated_husbandry','reviewed',now()),
('batch09-fishbase-altolamprologus-calvus','Altolamprologus calvus species summary','FishBase','https://www.fishbase.se/summary/Altolamprologus-calvus.html','curated_husbandry','reviewed',now()),
('fishipedia-altolamprologus-calvus','Altolamprologus calvus fish sheet','Fishipedia','https://www.fishipedia.fr/fr/poissons/altolamprologus-calvus','curated_husbandry','reviewed',now()),
('batch09-fishbase-neolamprologus-multifasciatus','Neolamprologus multifasciatus species summary','FishBase','https://www.fishbase.se/summary/Neolamprologus-multifasciatus.html','curated_husbandry','reviewed',now()),
('fishipedia-neolamprologus-multifasciatus','Neolamprologus multifasciatus fish sheet','Fishipedia','https://www.fishi-pedia.com/fishes/neolamprologus-multifasciatus','curated_husbandry','reviewed',now());

create temporary table compatibility_batch_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_batch_expected_profiles values
(
  'sp_0048',
  ARRAY['predatory','intraspecific_aggression','bottom_dwelling']::text[],
  null,
  ARRAY['small_fish']::text[],
  'medium',
  ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','predation']::text[]
),
(
  'sp_0050',
  ARRAY['predatory','species_tank_required','intraspecific_aggression']::text[],
  null,
  ARRAY['small_fish']::text[],
  'high',
  ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality','predation']::text[]
),
(
  'sp_0051',
  ARRAY['shoaling']::text[],
  null,
  ARRAY[]::text[],
  'medium',
  ARRAY['water','adult_size','social_behavior']::text[]
),
(
  'sp_0054',
  ARRAY['territorial','interspecific_aggression']::text[],
  null,
  ARRAY[]::text[],
  'high',
  ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]
),
(
  'sp_0056',
  ARRAY['territorial','breeding_defense','intraspecific_aggression']::text[],
  null,
  ARRAY[]::text[],
  'medium',
  ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','breeding_behavior']::text[]
),
(
  'sp_0057',
  ARRAY['territorial','breeding_defense','intraspecific_aggression']::text[],
  null,
  ARRAY[]::text[],
  'medium',
  ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality','breeding_behavior']::text[]
),
(
  'sp_0058',
  ARRAY['territorial','group_living']::text[],
  5,
  ARRAY[]::text[],
  'medium',
  ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]
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
  x.minimum_group_size,
  x.predation_targets,
  x.confidence,
  'reviewed',
  now(),
  x.required_facts,
  null
from compatibility_batch_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

create temporary table compatibility_batch_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_batch_expected_sources values
('sp_0048','batch19-fishbase-mastacembelus-armatus'),
('sp_0048','seriouslyfish-mastacembelus-armatus'),
('sp_0050','batch19-fishbase-channa-barca'),
('sp_0050','seriouslyfish-channa-barca'),
('sp_0051','batch08-fishbase-acrossocheilus-fasciatus'),
('sp_0051','doi-acrossocheilus-fasciatus-behavior-2024'),
('sp_0054','batch09-fishbase-hemichromis-bimaculatus'),
('sp_0056','batch09-fishbase-heros-severus'),
('sp_0056','fishipedia-heros-severus'),
('sp_0057','batch09-fishbase-altolamprologus-calvus'),
('sp_0057','fishipedia-altolamprologus-calvus'),
('sp_0058','batch09-fishbase-neolamprologus-multifasciatus'),
('sp_0058','fishipedia-neolamprologus-multifasciatus');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_batch_expected_sources x
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
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 52 then
    raise exception 'POSTCHECK: expected 52 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 98 then
    raise exception 'POSTCHECK: expected 98 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_batch_expected_profiles x
    left join public.species s
      on s.catalog_key=x.catalog_key
     and s.status='published'
     and s.deleted_at is null
    left join public.species_compatibility_profiles p
      on p.species_id=s.id
     and p.review_status='reviewed'
     and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is distinct from x.minimum_group_size
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.required_facts is distinct from x.required_facts
       or p.stocking_guidance is not null
  ) then
    raise exception 'POSTCHECK: batch profile drift';
  end if;
  if exists (
    select 1
    from compatibility_batch_expected_sources x
    where not exists (
      select 1
      from public.species s
      join public.species_compatibility_profiles p
        on p.species_id=s.id
       and p.review_status='reviewed'
       and p.deleted_at is null
      join public.species_compatibility_profile_sources l on l.profile_id=p.id
      join public.evidence_sources e
        on e.id=l.source_id
       and e.review_status='reviewed'
       and e.deleted_at is null
      where s.catalog_key=x.catalog_key
        and s.status='published'
        and s.deleted_at is null
        and e.source_key=x.source_key
    )
  ) then
    raise exception 'POSTCHECK: batch source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0048','sp_0050','sp_0051','sp_0054','sp_0056','sp_0057','sp_0058')
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> 13 then
    raise exception 'POSTCHECK: expected 13 batch profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0047' and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0047 must remain without a reviewed Compatibility profile';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
