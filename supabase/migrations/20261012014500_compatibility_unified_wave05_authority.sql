-- Stacked Compatibility wave05 authority. Depends on exact wave04 predecessor 95 Profiles / 171 reviewed evidence.

begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 95 then
    raise exception 'PRECHECK: expected predecessor 95 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 171 then
    raise exception 'PRECHECK: expected predecessor 171 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (
    select count(*) from public.species
    where catalog_key in ('sp_0173','sp_0174','sp_0207','sp_0214')
      and status='published' and deleted_at is null
  ) <> 4 then
    raise exception 'PRECHECK: expected 4 published wave05 fish rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0173','sp_0174','sp_0207','sp_0214')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave05 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in ('wave05-fishbase-salminus-brasiliensis','wave05-seriouslyfish-salminus-brasiliensis','wave05-cbd-gymnocorymbus-albino-white','wave05-seriouslyfish-pelvicachromis-pulcher')
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: wave05 new evidence source already exists';
  end if;
  if (
    select count(*)
    from public.evidence_sources
    where source_key in ('seriouslyfish-gymnocorymbus-ternetzi','fishbase-gymnocorymbus-ternetzi')
      and review_status='reviewed'
      and deleted_at is null
  ) <> 2 then
    raise exception 'PRECHECK: expected 2 predecessor evidence sources for reviewed wave05 bridges';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0158','sp_0163','sp_0175','sp_0176','sp_0177','sp_0178','sp_0179','sp_0182','sp_0201','sp_0208','sp_0216','sp_0217','sp_0219','sp_0220','sp_0221','sp_0227','sp_0228','sp_0229','sp_0234','sp_0235','sp_0236') and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave05 identity/category holds unexpectedly have Compatibility profiles';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
('wave05-fishbase-salminus-brasiliensis','Salminus brasiliensis species summary','FishBase','https://www.fishbase.se/summary/Salminus-brasiliensis','professional_association','reviewed',now()),
('wave05-seriouslyfish-salminus-brasiliensis','Salminus brasiliensis (Dorado)','Seriously Fish','https://www.seriouslyfish.com/species/salminus-brasiliensis','curated_husbandry','reviewed',now()),
('wave05-cbd-gymnocorymbus-albino-white','Gymnocorymbus ternetzi organism record including albino/white variant','Biosafety Clearing-House / Convention on Biological Diversity','https://bch.cbd.int/en/database/ORGA%7D/BCH-ORGA-SCBD-281063-2','government','reviewed',now()),
('wave05-seriouslyfish-pelvicachromis-pulcher','Pelvicachromis pulcher (Kribensis)','Seriously Fish','https://www.seriouslyfish.com/species/pelvicachromis-pulcher','curated_husbandry','reviewed',now());

create temporary table compatibility_wave05_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_wave05_expected_profiles values
('sp_0173',ARRAY['predatory','very_large_open_water_predator','home_aquarium_unsuitable']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','adult_size','social_behavior','predation']::text[]),
('sp_0174',ARRAY['shoaling','peaceful','fin_nipping']::text[],12,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
('sp_0207',ARRAY['shoaling','peaceful','fin_nipping']::text[],12,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
('sp_0214',ARRAY['pair_living','breeding_defense','pair_parental_care']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','breeding_behavior']::text[]);

insert into public.species_compatibility_profiles(
  species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance
)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_wave05_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

create temporary table compatibility_wave05_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_wave05_expected_sources values
('sp_0173','wave05-fishbase-salminus-brasiliensis'),
('sp_0173','wave05-seriouslyfish-salminus-brasiliensis'),
('sp_0174','wave05-cbd-gymnocorymbus-albino-white'),
('sp_0174','seriouslyfish-gymnocorymbus-ternetzi'),
('sp_0174','fishbase-gymnocorymbus-ternetzi'),
('sp_0207','wave05-cbd-gymnocorymbus-albino-white'),
('sp_0207','seriouslyfish-gymnocorymbus-ternetzi'),
('sp_0207','fishbase-gymnocorymbus-ternetzi'),
('sp_0214','wave05-seriouslyfish-pelvicachromis-pulcher');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_wave05_expected_sources x
join public.species s
  on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p
  on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e
  on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 99 then
    raise exception 'POSTCHECK: expected 99 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 175 then
    raise exception 'POSTCHECK: expected 175 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_wave05_expected_profiles x
    left join public.species s
      on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p
      on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is distinct from x.minimum_group_size
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.required_facts is distinct from x.required_facts
       or p.stocking_guidance is not null
  ) then
    raise exception 'POSTCHECK: wave05 profile drift';
  end if;
  if exists (
    select 1
    from compatibility_wave05_expected_sources x
    where not exists (
      select 1
      from public.species s
      join public.species_compatibility_profiles p
        on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
      join public.species_compatibility_profile_sources l on l.profile_id=p.id
      join public.evidence_sources e
        on e.id=l.source_id and e.review_status='reviewed' and e.deleted_at is null
      where s.catalog_key=x.catalog_key
        and s.status='published'
        and s.deleted_at is null
        and e.source_key=x.source_key
    )
  ) then
    raise exception 'POSTCHECK: wave05 source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0173','sp_0174','sp_0207','sp_0214')
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> 9 then
    raise exception 'POSTCHECK: expected 9 wave05 profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0158','sp_0163','sp_0175','sp_0176','sp_0177','sp_0178','sp_0179','sp_0182','sp_0201','sp_0208','sp_0216','sp_0217','sp_0219','sp_0220','sp_0221','sp_0227','sp_0228','sp_0229','sp_0234','sp_0235','sp_0236') and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: wave05 identity/category holds must remain without Compatibility profiles';
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
