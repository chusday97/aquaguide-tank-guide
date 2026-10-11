begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 52 then
    raise exception 'PRECHECK: expected 52 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 98 then
    raise exception 'PRECHECK: expected 98 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (
    select count(*) from public.species
    where catalog_key in ('sp_0059','sp_0062','sp_0105','sp_0108','sp_0109','sp_0119','sp_0130','sp_0131','sp_0138','sp_0139','sp_0181')
      and status='published' and deleted_at is null
  ) <> 11 then
    raise exception 'PRECHECK: expected 11 published unified-batch species rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0059','sp_0062','sp_0105','sp_0108','sp_0109','sp_0119','sp_0130','sp_0131','sp_0138','sp_0139','sp_0181')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: unified-batch Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in (
      'batch19-fishbase-macropodus-opercularis',
      'seriouslyfish-macropodus-opercularis',
      'batch09-fishbase-moenkhausia-sanctaefilomenae',
      'seriouslyfish-moenkhausia-sanctaefilomenae',
      'batch19-fishbase-polypterus-ornatipinnis',
      'seriouslyfish-polypterus-ornatapinnis',
      'batch19-fishbase-channa-bleheri',
      'seriouslyfish-channa-bleheri',
      'batch19-fishbase-channa-aurantimaculata',
      'seriouslyfish-channa-aurantimaculata',
      'batch20-fishbase-pantodon-buchholzi',
      'seriouslyfish-pantodon-buchholzi',
      'batch20-fishbase-leporinus-fasciatus',
      'seriouslyfish-leporinus-fasciatus',
      'batch20-fishbase-piaractus-brachypomus',
      'seriouslyfish-piaractus-brachypomus',
      'batch21-fishbase-gnathonemus-petersii',
      'seriouslyfish-gnathonemus-petersii'
    ) and deleted_at is null
  ) then
    raise exception 'PRECHECK: unified-batch direct evidence source already exists';
  end if;
  if (
    select count(*) from public.evidence_sources
    where source_key in (
      'fishbase-opsariichthys-bidens',
      'doi-opsariichthys-bidens-ontogeny-diet',
      'doi-opsariichthys-bidens-enrichment-2024',
      'batch19-fishbase-mastacembelus-armatus',
      'seriouslyfish-mastacembelus-armatus'
    ) and review_status='reviewed' and deleted_at is null
  ) <> 5 then
    raise exception 'PRECHECK: exact-taxon bridge evidence is incomplete';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
('batch19-fishbase-macropodus-opercularis','Macropodus opercularis species review','FishBase','https://www.fishbase.se/summary/Macropodus-opercularis','professional_association','reviewed',now()),
('seriouslyfish-macropodus-opercularis','Macropodus opercularis (Paradise Fish)','Seriously Fish','https://www.seriouslyfish.com/species/macropodus-opercularis','curated_husbandry','reviewed',now()),
('batch09-fishbase-moenkhausia-sanctaefilomenae','Moenkhausia sanctaefilomenae species review','FishBase','https://www.fishbase.se/summary/Moenkhausia-sanctaefilomenae','professional_association','reviewed',now()),
('seriouslyfish-moenkhausia-sanctaefilomenae','Moenkhausia sanctaefilomenae (Red-eye Tetra)','Seriously Fish','https://seriouslyfish.com/species/moenkhausia-sanctaefilomenae','curated_husbandry','reviewed',now()),
('batch19-fishbase-polypterus-ornatipinnis','Polypterus ornatipinnis species review','FishBase','https://www.fishbase.se/summary/Polypterus-ornatipinnis.html','professional_association','reviewed',now()),
('seriouslyfish-polypterus-ornatapinnis','Polypterus ornatapinnis (Ornate Bichir)','Seriously Fish','https://www.seriouslyfish.com/species/polypterus-ornatapinnis','curated_husbandry','reviewed',now()),
('batch19-fishbase-channa-bleheri','Channa bleheri species review','FishBase','https://www.fishbase.se/summary/Channa-bleheri.html','professional_association','reviewed',now()),
('seriouslyfish-channa-bleheri','Channa bleheri (Rainbow snakehead)','Seriously Fish','https://www.seriouslyfish.com/species/channa-bleheri','curated_husbandry','reviewed',now()),
('batch19-fishbase-channa-aurantimaculata','Channa aurantimaculata species review','FishBase','https://www.fishbase.se/summary/Channa-aurantimaculata.html','professional_association','reviewed',now()),
('seriouslyfish-channa-aurantimaculata','Channa aurantimaculata (Orange-spotted Snakehead)','Seriously Fish','https://www.seriouslyfish.com/species/channa-aurantimaculata','curated_husbandry','reviewed',now()),
('batch20-fishbase-pantodon-buchholzi','Pantodon buchholzi species review','FishBase','https://www.fishbase.se/summary/Pantodon-buchholzi','professional_association','reviewed',now()),
('seriouslyfish-pantodon-buchholzi','Pantodon buchholzi (African Butterfly Fish)','Seriously Fish','https://www.seriouslyfish.com/species/pantodon-buchholzi','curated_husbandry','reviewed',now()),
('batch20-fishbase-leporinus-fasciatus','Leporinus fasciatus species review','FishBase','https://www.fishbase.se/summary/Leporinus-fasciatus','professional_association','reviewed',now()),
('seriouslyfish-leporinus-fasciatus','Leporinus fasciatus (Banded Leporinus)','Seriously Fish','https://www.seriouslyfish.com/species/leporinus-fasciatus','curated_husbandry','reviewed',now()),
('batch20-fishbase-piaractus-brachypomus','Piaractus brachypomus species review','FishBase','https://www.fishbase.se/summary/Piaractus-brachypomus','professional_association','reviewed',now()),
('seriouslyfish-piaractus-brachypomus','Piaractus brachypomus (Red-bellied Pacu)','Seriously Fish','https://www.seriouslyfish.com/species/piaractus-brachypomus','curated_husbandry','reviewed',now()),
('batch21-fishbase-gnathonemus-petersii','Gnathonemus petersii species review','FishBase','https://www.fishbase.se/summary/Gnathonemus-petersii','professional_association','reviewed',now()),
('seriouslyfish-gnathonemus-petersii','Gnathonemus petersii (Elephantnose Fish)','Seriously Fish','https://www.seriouslyfish.com/species/gnathonemus-petersii','curated_husbandry','reviewed',now());

create temporary table compatibility_batch_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_batch_expected_profiles values
('sp_0059',ARRAY['pair_living','territorial_males','breeding_aggression']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0062',ARRAY['shoaling','peaceful']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
('sp_0105',ARRAY['predatory','large_fish_community']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','predation']::text[]),
('sp_0108',ARRAY['pair_living','adult_conspecific_aggression','predatory']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0109',ARRAY['predatory','species_tank_required','intraspecific_aggression']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0119',ARRAY['surface_dwelling','conspecific_aggression','surface_zone_aggression','predatory']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0130',ARRAY['predatory','interspecific_aggression','dominance_hierarchy']::text[],null,ARRAY['small_fish']::text[],'medium',ARRAY['water','adult_size','social_behavior','predation']::text[]),
('sp_0131',ARRAY['predatory','intraspecific_aggression','bottom_dwelling']::text[],null,ARRAY['small_fish']::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','predation']::text[]),
('sp_0138',ARRAY['conditional_group_living','conspecific_quarrelsome','predatory']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0139',ARRAY['group_living','peaceful','very_large_space_requirement']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
('sp_0181',ARRAY['group_living','peaceful','water_quality_sensitive']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]);

insert into public.species_compatibility_profiles(
  species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance
)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_batch_expected_profiles x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null;

create temporary table compatibility_batch_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_batch_expected_sources values
('sp_0059','batch19-fishbase-macropodus-opercularis'),
('sp_0059','seriouslyfish-macropodus-opercularis'),
('sp_0062','batch09-fishbase-moenkhausia-sanctaefilomenae'),
('sp_0062','seriouslyfish-moenkhausia-sanctaefilomenae'),
('sp_0105','batch19-fishbase-polypterus-ornatipinnis'),
('sp_0105','seriouslyfish-polypterus-ornatapinnis'),
('sp_0108','batch19-fishbase-channa-bleheri'),
('sp_0108','seriouslyfish-channa-bleheri'),
('sp_0109','batch19-fishbase-channa-aurantimaculata'),
('sp_0109','seriouslyfish-channa-aurantimaculata'),
('sp_0119','batch20-fishbase-pantodon-buchholzi'),
('sp_0119','seriouslyfish-pantodon-buchholzi'),
('sp_0130','fishbase-opsariichthys-bidens'),
('sp_0130','doi-opsariichthys-bidens-ontogeny-diet'),
('sp_0130','doi-opsariichthys-bidens-enrichment-2024'),
('sp_0131','batch19-fishbase-mastacembelus-armatus'),
('sp_0131','seriouslyfish-mastacembelus-armatus'),
('sp_0138','batch20-fishbase-leporinus-fasciatus'),
('sp_0138','seriouslyfish-leporinus-fasciatus'),
('sp_0139','batch20-fishbase-piaractus-brachypomus'),
('sp_0139','seriouslyfish-piaractus-brachypomus'),
('sp_0181','batch21-fishbase-gnathonemus-petersii'),
('sp_0181','seriouslyfish-gnathonemus-petersii');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_batch_expected_sources x
join public.species s
  on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p
  on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e
  on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 63 then
    raise exception 'POSTCHECK: expected 63 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 116 then
    raise exception 'POSTCHECK: expected 116 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_batch_expected_profiles x
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
    raise exception 'POSTCHECK: unified-batch profile drift';
  end if;
  if exists (
    select 1
    from compatibility_batch_expected_sources x
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
    raise exception 'POSTCHECK: unified-batch source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0059','sp_0062','sp_0105','sp_0108','sp_0109','sp_0119','sp_0130','sp_0131','sp_0138','sp_0139','sp_0181')
      and p.review_status='reviewed' and p.deleted_at is null
  ) <> 23 then
    raise exception 'POSTCHECK: expected 23 unified-batch profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0127' and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: sp_0127 identity hold must remain without Compatibility profile';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'POSTCHECK: unrelated Product/Care data changed';
  end if;
end
$postcheck$;

commit;
