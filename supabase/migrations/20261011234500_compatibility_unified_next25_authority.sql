begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 63 then
    raise exception 'PRECHECK: expected 63 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 116 then
    raise exception 'PRECHECK: expected 116 reviewed evidence sources';
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
    where catalog_key in ('sp_0103','sp_0117','sp_0118','sp_0121','sp_0122','sp_0123','sp_0125','sp_0129','sp_0140','sp_0183','sp_0184','sp_0185','sp_0187','sp_0197','sp_0198','sp_0199','sp_0200','sp_0202','sp_0218','sp_0441','sp_0449','sp_0450')
      and status='published' and deleted_at is null
  ) <> 22 then
    raise exception 'PRECHECK: expected 22 published unified-next25 species rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0103','sp_0117','sp_0118','sp_0121','sp_0122','sp_0123','sp_0125','sp_0129','sp_0140','sp_0183','sp_0184','sp_0185','sp_0187','sp_0197','sp_0198','sp_0199','sp_0200','sp_0202','sp_0218','sp_0441','sp_0449','sp_0450')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: unified-next25 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in ('batch19-fishbase-scleropages-formosus','seriouslyfish-scleropages-formosus','batch20-fishbase-osteoglossum-bicirrhosum','seriouslyfish-osteoglossum-bicirrhosum','batch20-fishbase-osteoglossum-ferreirai','aquaristatlas-osteoglossum-ferreirai','batch09-fishbase-peckoltia-compta','aquaristatlas-peckoltia-compta','batch09-fishbase-panaque-nigrolineatus','aquaristatlas-panaque-nigrolineatus','batch10-fishbase-pterygoplichthys-gibbiceps','aquaristatlas-pterygoplichthys-gibbiceps','batch10-fishbase-hypancistrus-inspector','seriouslyfish-hypancistrus-inspector','batch10-fishbase-zacco-platypus','journal-ethology-zacco-platypus-sociability','batch20-fishbase-serrasalmus-rhombeus','seriouslyfish-serrasalmus-rhombeus','batch21-fishbase-xanthichthys-mento','reefs-xanthichthys-mento','batch21-fishbase-centropyge-heraldi','reeflings-centropyge-heraldi','batch21-fishbase-pomacanthus-annularis','reefapp-pomacanthus-annularis','batch11-fishbase-chrysiptera-cyanea','atlarium-chrysiptera-cyanea','batch21-fishbase-channa-stewartii','seriouslyfish-channa-stewartii','batch21-fishbase-channa-diplogramma','seriouslyfish-channa-diplogramma','batch21-fishbase-badis-badis','seriouslyfish-badis-badis','batch22-fishbase-dario-dario','seriouslyfish-dario-dario','batch11-fishbase-scobinancistrus-aureatus','atlarium-scobinancistrus-aureatus','batch12-fishbase-hyphessobrycon-erythrostigma','seriouslyfish-megalamphodus-erythrostigma','batch25-fishbase-gyrinocheilus-aymonieri','seriouslyfish-gyrinocheilus-aymonieri','batch17-fishbase-labidochromis-caeruleus','seriouslyfish-labidochromis-caeruleus','batch17-fishbase-andinoacara-pulcher','seriouslyfish-andinoacara-pulcher')
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: unified-next25 evidence source already exists';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0110','sp_0120','sp_0334') and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: identity/type hold unexpectedly has Compatibility profile';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
('batch19-fishbase-scleropages-formosus','Scleropages formosus species review','FishBase','https://www.fishbase.se/summary/Scleropages-formosus','professional_association','reviewed',now()),
('seriouslyfish-scleropages-formosus','Scleropages formosus (Asian Arowana)','Seriously Fish','https://www.seriouslyfish.com/species/scleropages-formosus','curated_husbandry','reviewed',now()),
('batch20-fishbase-osteoglossum-bicirrhosum','Osteoglossum bicirrhosum species review','FishBase','https://www.fishbase.se/summary/Osteoglossum-bicirrhosum','professional_association','reviewed',now()),
('seriouslyfish-osteoglossum-bicirrhosum','Osteoglossum bicirrhosum (Silver Arowana)','Seriously Fish','https://www.seriouslyfish.com/species/osteoglossum-bicirrhosum','curated_husbandry','reviewed',now()),
('batch20-fishbase-osteoglossum-ferreirai','Osteoglossum ferreirai species review','FishBase','https://www.fishbase.se/summary/Osteoglossum-ferreirai','professional_association','reviewed',now()),
('aquaristatlas-osteoglossum-ferreirai','Black Arowana (Osteoglossum ferreirai) Care Guide','Aquarist Atlas','https://www.aquaristatlas.com/bonytongues/osteoglossum-ferreirai/','curated_husbandry','reviewed',now()),
('batch09-fishbase-peckoltia-compta','Peckoltia compta species review','FishBase','https://www.fishbase.se/summary/Peckoltia-compta','professional_association','reviewed',now()),
('aquaristatlas-peckoltia-compta','Leopard Frog Pleco (Peckoltia compta) Care Guide','Aquarist Atlas','https://www.aquaristatlas.com/plecos/peckoltia-compta/','curated_husbandry','reviewed',now()),
('batch09-fishbase-panaque-nigrolineatus','Panaque nigrolineatus species review','FishBase','https://www.fishbase.se/summary/Panaque-nigrolineatus','professional_association','reviewed',now()),
('aquaristatlas-panaque-nigrolineatus','Royal Pleco (Panaque nigrolineatus) Care Guide','Aquarist Atlas','https://www.aquaristatlas.com/plecos/panaque-nigrolineatus/','curated_husbandry','reviewed',now()),
('batch10-fishbase-pterygoplichthys-gibbiceps','Pterygoplichthys gibbiceps species review','FishBase','https://www.fishbase.se/summary/Pterygoplichthys-gibbiceps','professional_association','reviewed',now()),
('aquaristatlas-pterygoplichthys-gibbiceps','Sailfin Pleco (Pterygoplichthys gibbiceps) Care Guide','Aquarist Atlas','https://www.aquaristatlas.com/plecos/pterygoplichthys-gibbiceps/','curated_husbandry','reviewed',now()),
('batch10-fishbase-hypancistrus-inspector','Hypancistrus inspector species review','FishBase','https://www.fishbase.se/summary/Hypancistrus-inspector','professional_association','reviewed',now()),
('seriouslyfish-hypancistrus-inspector','Hypancistrus inspector (Snowball Pleco)','Seriously Fish','https://www.seriouslyfish.com/species/hypancistrus-inspector','curated_husbandry','reviewed',now()),
('batch10-fishbase-zacco-platypus','Zacco platypus species review','FishBase','https://www.fishbase.se/summary/Zacco-platypus','professional_association','reviewed',now()),
('journal-ethology-zacco-platypus-sociability','Effects of habitat conditions on the boldness and sociability of wild-caught fish (Zacco platypus) along a river','Journal of Ethology','https://link.springer.com/article/10.1007/s10164-021-00715-0','peer_reviewed','reviewed',now()),
('batch20-fishbase-serrasalmus-rhombeus','Serrasalmus rhombeus species review','FishBase','https://www.fishbase.se/summary/Serrasalmus-rhombeus','professional_association','reviewed',now()),
('seriouslyfish-serrasalmus-rhombeus','Serrasalmus rhombeus (Black Piranha)','Seriously Fish','https://www.seriouslyfish.com/species/serrasalmus-rhombeus','curated_husbandry','reviewed',now()),
('batch21-fishbase-xanthichthys-mento','Xanthichthys mento species review','FishBase','https://www.fishbase.se/summary/Xanthichthys-mento','professional_association','reviewed',now()),
('reefs-xanthichthys-mento','Aquarium Fish: The Crosshatch Triggerfish, Xanthichthys mento','Reefs.com','https://reefs.com/magazine/aquarium-fish-the-crosshatch-triggerfish-xanthichthys-mento/','curated_husbandry','reviewed',now()),
('batch21-fishbase-centropyge-heraldi','Centropyge heraldi species review','FishBase','https://www.fishbase.se/summary/Centropyge-heraldi','professional_association','reviewed',now()),
('reeflings-centropyge-heraldi','Centropyge heraldi species guide','Reeflings','https://reeflings.com/species/centropyge-heraldi','curated_husbandry','reviewed',now()),
('batch21-fishbase-pomacanthus-annularis','Pomacanthus annularis species review','FishBase','https://www.fishbase.se/summary/Pomacanthus-annularis','professional_association','reviewed',now()),
('reefapp-pomacanthus-annularis','Pomacanthus annularis','Reef App','https://reefapp.net/en/encyclopedia/pomacanthus-annularis','curated_husbandry','reviewed',now()),
('batch11-fishbase-chrysiptera-cyanea','Chrysiptera cyanea species review','FishBase','https://www.fishbase.se/summary/Chrysiptera-cyanea','professional_association','reviewed',now()),
('atlarium-chrysiptera-cyanea','Chrysiptera cyanea species guide','Atlarium','https://atlarium.bio/en/catalog/fish/chrysiptera-cyanea','curated_husbandry','reviewed',now()),
('batch21-fishbase-channa-stewartii','Channa stewartii species review','FishBase','https://www.fishbase.se/summary/Channa-stewartii','professional_association','reviewed',now()),
('seriouslyfish-channa-stewartii','Channa genus review: Channa stewartii subsection','Seriously Fish','https://www.seriouslyfish.com/genus/channa','curated_husbandry','reviewed',now()),
('batch21-fishbase-channa-diplogramma','Channa diplogramma species review','FishBase','https://www.fishbase.se/summary/Channa-diplogramma','professional_association','reviewed',now()),
('seriouslyfish-channa-diplogramma','Channa diplogramma','Seriously Fish','https://www.seriouslyfish.com/species/channa-diplogramma','curated_husbandry','reviewed',now()),
('batch21-fishbase-badis-badis','Badis badis species review','FishBase','https://www.fishbase.se/summary/Badis-badis','professional_association','reviewed',now()),
('seriouslyfish-badis-badis','Badis badis (Blue Perch)','Seriously Fish','https://www.seriouslyfish.com/species/badis-badis','curated_husbandry','reviewed',now()),
('batch22-fishbase-dario-dario','Dario dario species review','FishBase','https://www.fishbase.se/summary/Dario-dario','professional_association','reviewed',now()),
('seriouslyfish-dario-dario','Dario dario (Scarlet Badis)','Seriously Fish','https://www.seriouslyfish.com/species/dario-dario','curated_husbandry','reviewed',now()),
('batch11-fishbase-scobinancistrus-aureatus','Scobinancistrus aureatus species review','FishBase','https://www.fishbase.se/summary/Scobinancistrus-aureatus','professional_association','reviewed',now()),
('atlarium-scobinancistrus-aureatus','Scobinancistrus aureatus species guide','Atlarium','https://atlarium.bio/en/catalog/fish/scobinancistrus-aureatus','curated_husbandry','reviewed',now()),
('batch12-fishbase-hyphessobrycon-erythrostigma','Hyphessobrycon erythrostigma species review','FishBase','https://www.fishbase.se/summary/Hyphessobrycon-erythrostigma','professional_association','reviewed',now()),
('seriouslyfish-megalamphodus-erythrostigma','Megalamphodus erythrostigma (Bleeding Heart Tetra)','Seriously Fish','https://www.seriouslyfish.com/species/megalamphodus-erythrostigma','curated_husbandry','reviewed',now()),
('batch25-fishbase-gyrinocheilus-aymonieri','Gyrinocheilus aymonieri species review','FishBase','https://www.fishbase.se/summary/Gyrinocheilus-aymonieri','professional_association','reviewed',now()),
('seriouslyfish-gyrinocheilus-aymonieri','Gyrinocheilus aymonieri (Chinese Algae Eater)','Seriously Fish','https://www.seriouslyfish.com/species/gyrinocheilus-aymonieri','curated_husbandry','reviewed',now()),
('batch17-fishbase-labidochromis-caeruleus','Labidochromis caeruleus species review','FishBase','https://www.fishbase.se/summary/Labidochromis-caeruleus','professional_association','reviewed',now()),
('seriouslyfish-labidochromis-caeruleus','Labidochromis caeruleus','Seriously Fish','https://www.seriouslyfish.com/species/labidochromis-caeruleus','curated_husbandry','reviewed',now()),
('batch17-fishbase-andinoacara-pulcher','Andinoacara pulcher species review','FishBase','https://www.fishbase.se/summary/Andinoacara-pulcher','professional_association','reviewed',now()),
('seriouslyfish-andinoacara-pulcher','Andinoacara pulcher (Blue Acara)','Seriously Fish','https://www.seriouslyfish.com/species/andinoacara-pulcher','curated_husbandry','reviewed',now());

create temporary table compatibility_batch_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_batch_expected_profiles values
('sp_0103',ARRAY['predatory','very_large_space_requirement','jumper']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
('sp_0117',ARRAY['predatory','very_large_space_requirement','variable_social']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0118',ARRAY['predatory','very_large_space_requirement','surface_predator']::text[],null,ARRAY['small_fish']::text[],'medium',ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
('sp_0121',ARRAY['bottom_dwelling','cave_territoriality','peaceful_to_dissimilar_fish']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0122',ARRAY['bottom_dwelling','very_large_space_requirement','resource_territoriality']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0123',ARRAY['bottom_dwelling','very_large_space_requirement','peaceful_to_dissimilar_fish']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0125',ARRAY['bottom_dwelling','peaceful','hybridisation_risk_with_hypancistrus']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
('sp_0129',ARRAY['group_living','cool_flowing_water','predatory']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','adult_size','social_behavior','predation']::text[]),
('sp_0140',ARRAY['solitary','species_tank_required','severe_conspecific_aggression']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0183',ARRAY['relatively_mellow','variable_social','open_water']::text[],null,ARRAY['small_fish']::text[],'medium',ARRAY['water','adult_size','social_behavior','predation']::text[]),
('sp_0184',ARRAY['semi_aggressive','territorial_to_similar_fish']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','tank_size','social_behavior','territoriality']::text[]),
('sp_0185',ARRAY['aggressive','very_large_space_requirement','not_reef_safe']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0187',ARRAY['territorial','aggressive_for_size']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','social_behavior','territoriality']::text[]),
('sp_0197',ARRAY['intraspecific_aggression','snakehead']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0198',ARRAY['species_tank_required','predatory','adult_conspecific_aggression','very_large_space_requirement']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality','predation']::text[]),
('sp_0199',ARRAY['slow_feeder','rival_male_aggression','vulnerable_to_aggressive_tankmates']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0200',ARRAY['slow_feeder','rival_male_aggression','vulnerable_to_aggressive_tankmates']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0202',ARRAY['bottom_dwelling','severe_cave_territoriality','very_large_space_requirement']::text[],null,ARRAY[]::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0218',ARRAY['group_living','peaceful']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
('sp_0441',ARRAY['territorial','age_increasing_aggression','mucus_grazing_risk']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]),
('sp_0449',ARRAY['relatively_peaceful_mbuna','hard_alkaline_water','hybridisation_risk_with_labidochromis']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
('sp_0450',ARRAY['pair_living','breeding_territoriality','relatively_peaceful_cichlid']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality']::text[]);

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
('sp_0103','batch19-fishbase-scleropages-formosus'),
('sp_0103','seriouslyfish-scleropages-formosus'),
('sp_0117','batch20-fishbase-osteoglossum-bicirrhosum'),
('sp_0117','seriouslyfish-osteoglossum-bicirrhosum'),
('sp_0118','batch20-fishbase-osteoglossum-ferreirai'),
('sp_0118','aquaristatlas-osteoglossum-ferreirai'),
('sp_0121','batch09-fishbase-peckoltia-compta'),
('sp_0121','aquaristatlas-peckoltia-compta'),
('sp_0122','batch09-fishbase-panaque-nigrolineatus'),
('sp_0122','aquaristatlas-panaque-nigrolineatus'),
('sp_0123','batch10-fishbase-pterygoplichthys-gibbiceps'),
('sp_0123','aquaristatlas-pterygoplichthys-gibbiceps'),
('sp_0125','batch10-fishbase-hypancistrus-inspector'),
('sp_0125','seriouslyfish-hypancistrus-inspector'),
('sp_0129','batch10-fishbase-zacco-platypus'),
('sp_0129','journal-ethology-zacco-platypus-sociability'),
('sp_0140','batch20-fishbase-serrasalmus-rhombeus'),
('sp_0140','seriouslyfish-serrasalmus-rhombeus'),
('sp_0183','batch21-fishbase-xanthichthys-mento'),
('sp_0183','reefs-xanthichthys-mento'),
('sp_0184','batch21-fishbase-centropyge-heraldi'),
('sp_0184','reeflings-centropyge-heraldi'),
('sp_0185','batch21-fishbase-pomacanthus-annularis'),
('sp_0185','reefapp-pomacanthus-annularis'),
('sp_0187','batch11-fishbase-chrysiptera-cyanea'),
('sp_0187','atlarium-chrysiptera-cyanea'),
('sp_0197','batch21-fishbase-channa-stewartii'),
('sp_0197','seriouslyfish-channa-stewartii'),
('sp_0198','batch21-fishbase-channa-diplogramma'),
('sp_0198','seriouslyfish-channa-diplogramma'),
('sp_0199','batch21-fishbase-badis-badis'),
('sp_0199','seriouslyfish-badis-badis'),
('sp_0200','batch22-fishbase-dario-dario'),
('sp_0200','seriouslyfish-dario-dario'),
('sp_0202','batch11-fishbase-scobinancistrus-aureatus'),
('sp_0202','atlarium-scobinancistrus-aureatus'),
('sp_0218','batch12-fishbase-hyphessobrycon-erythrostigma'),
('sp_0218','seriouslyfish-megalamphodus-erythrostigma'),
('sp_0441','batch25-fishbase-gyrinocheilus-aymonieri'),
('sp_0441','seriouslyfish-gyrinocheilus-aymonieri'),
('sp_0449','batch17-fishbase-labidochromis-caeruleus'),
('sp_0449','seriouslyfish-labidochromis-caeruleus'),
('sp_0450','batch17-fishbase-andinoacara-pulcher'),
('sp_0450','seriouslyfish-andinoacara-pulcher');

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
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 85 then
    raise exception 'POSTCHECK: expected 85 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 160 then
    raise exception 'POSTCHECK: expected 160 reviewed evidence sources';
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
    raise exception 'POSTCHECK: unified-next25 profile drift';
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
    raise exception 'POSTCHECK: unified-next25 source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0103','sp_0117','sp_0118','sp_0121','sp_0122','sp_0123','sp_0125','sp_0129','sp_0140','sp_0183','sp_0184','sp_0185','sp_0187','sp_0197','sp_0198','sp_0199','sp_0200','sp_0202','sp_0218','sp_0441','sp_0449','sp_0450')
      and p.review_status='reviewed' and p.deleted_at is null
  ) <> 44 then
    raise exception 'POSTCHECK: expected 44 unified-next25 profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0110','sp_0120','sp_0334') and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: identity/type holds must remain without Compatibility profile';
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
