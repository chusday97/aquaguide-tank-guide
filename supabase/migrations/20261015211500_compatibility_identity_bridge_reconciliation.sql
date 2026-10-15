begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then raise exception 'PRECHECK: expected 101 reviewed Compatibility profiles'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 189 then raise exception 'PRECHECK: expected 189 reviewed evidence sources'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then raise exception 'PRECHECK: expected 21 reviewed Pair Rules'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then raise exception 'PRECHECK: expected 1 reviewed stage risk'; end if;
  if (select count(*) from public.species s where s.catalog_key in ('sp_0176','sp_0177','sp_0178','sp_0221','sp_0229','sp_0236','sp_0388','sp_0407') and s.status='published' and s.deleted_at is null) <> 8 then raise exception 'PRECHECK: identity bridge species missing or unpublished'; end if;
  if exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key in ('sp_0176','sp_0177','sp_0178','sp_0221','sp_0229','sp_0236','sp_0388','sp_0407') and p.deleted_at is null) then raise exception 'PRECHECK: identity bridge Profile already exists'; end if;
end
$precheck$;

insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at) values
('aquaculture-research-scleropages-blood-red-identity-wave22','A strain-specific and a sex-associated STS marker for Asian arowana (Scleropages formosus, Osteoglossidae)','Aquaculture Research','https://doi.org/10.1046/j.1365-2109.2003.00949.x','peer_reviewed','reviewed',now()),
('aquarium-glaser-apistogramma-agassizii-fire-red-wave25','Apistogramma agassizii FIRE-RED','Aquarium Glaser GmbH','https://www.aquariumglaser.de/en/25-perchlike-fishes/25d-perchlike-fishes-4-south-american-dwarf-cichlids/apistogramma_agassizii_fire_red_en/','curated_husbandry','reviewed',now()),
('aquatic-arts-pterophyllum-scalare-blue-diamond-wave26','Blue Diamond Angelfish (Pterophyllum scalare) - Tank-Bred!','Aquatic Arts','https://aquaticarts.com/products/blue-diamond-angelfish','curated_husbandry','reviewed',now()),
('aquatic-arts-pterophyllum-scalare-panda-wave27','Panda Angelfish (Pterophyllum scalare - variant), USA Bred','Aquatic Arts','https://aquaticarts.com/collections/locally-bred-fish/products/panda-angelfish-pterophyllum-scalare-variant-usa-bred','curated_husbandry','reviewed',now()),
('aquatic-arts-pterophyllum-scalare-red-devil-wave28','Red Devil Angelfish (Pterophyllum scalare ''Red Devil'') - Tank Bred','Aquatic Arts','https://aquaticarts.com/products/red-devil-angelfish-pterophyllum-scalare-red-devil-tank-bred','curated_husbandry','reviewed',now()),
('australian-government-xiphophorus-hellerii-territoriality','Review of the impacts of introduced ornamental fish species that have established wild populations in Australia','Australian Government Department of the Environment, Water, Heritage and the Arts','https://www.agriculture.gov.au/sites/default/files/documents/ornamental-fish.pdf','government','reviewed',now()),
('batch-02-fishbase-pterophyllum-scalare','Pterophyllum scalare species summary','FishBase','https://www.fishbase.se/summary/Pterophyllum-scalare.html','curated_husbandry','reviewed',now()),
('batch19-fishbase-scleropages-formosus','Scleropages formosus species review','FishBase','https://www.fishbase.se/summary/Scleropages-formosus','professional_association','reviewed',now()),
('batch25-fishbase-gyrinocheilus-aymonieri','Gyrinocheilus aymonieri species review','FishBase','https://www.fishbase.se/summary/Gyrinocheilus-aymonieri','professional_association','reviewed',now()),
('fishbase-apistogramma-agassizii','Apistogramma agassizii (Agassiz''s dwarf cichlid) species summary','FishBase','https://www.fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=076&genusname=Apistogramma&speciesname=agassizii','curated_husbandry','reviewed',now()),
('fishbase-xiphophorus-hellerii','Xiphophorus hellerii (Green swordtail) species summary','FishBase','https://www.fishbase.org/Summary/Xiphophorus-hellerii','curated_husbandry','reviewed',now()),
('fishbase-xiphophorus-hellerii-male-aggression','Xiphophorus hellerii (Green swordtail) species summary','FishBase','https://www.fishbase.se/summary/Xiphophorus-hellerii.html','curated_husbandry','reviewed',now()),
('ifrj-pterophyllum-scalare-marble-identity-wave21','Reproduction of Three Colour Varieties of Angelfish (Pterophyllum scalare)','Indonesian Fisheries Research Journal','https://doi.org/10.15578/ifrj.5.1.1999.19-22','peer_reviewed','reviewed',now()),
('myfish-scleropages-formosus-territoriality','Scleropages formosus – Asiatischer Arowana','my-fish / WZF','https://my-fish.org/my-fishothek/scleropages-formosus-asiatischer-gabelbart/','curated_husbandry','reviewed',now()),
('pcmr-xiphophorus-hellerii-red-albino-wave23','A Recessive oca2 Mutation Underlies Albinism in Xiphophorus Fish','Pigment Cell & Melanoma Research','https://doi.org/10.1111/pcmr.70113','peer_reviewed','reviewed',now()),
('seriouslyfish-apistogramma-agassizii','Apistogramma agassizii (Agassizi''s Dwarf Cichlid)','Seriously Fish','https://www.seriouslyfish.com/species/apistogramma-agassizii/','curated_husbandry','reviewed',now()),
('seriouslyfish-gyrinocheilus-aymonieri','Gyrinocheilus aymonieri (Chinese Algae Eater)','Seriously Fish','https://www.seriouslyfish.com/species/gyrinocheilus-aymonieri','curated_husbandry','reviewed',now()),
('seriouslyfish-pterophyllum-scalare','Pterophyllum scalare (Angelfish)','Seriously Fish','https://www.seriouslyfish.com/species/pterophyllum-scalare','curated_husbandry','reviewed',now()),
('seriouslyfish-scleropages-formosus','Scleropages formosus (Asian Arowana)','Seriously Fish','https://www.seriouslyfish.com/species/scleropages-formosus','curated_husbandry','reviewed',now()),
('seriouslyfish-xiphophorus-hellerii','Xiphophorus hellerii (Green Swordtail)','Seriously Fish','https://www.seriouslyfish.com/species/xiphophorus-hellerii','curated_husbandry','reviewed',now()),
('tamu-pterophyllum-scalare-reproduction','Reproduction of Angelfish (Pterophyllum scalare)','Texas A&M AgriLife Extension','https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf','government','reviewed',now()),
('tetra-gyrinocheilus-aymonieri-albino-wave24','Chinese Algae Eater – un pește fascinant, util în acvariu','Tetra Advanced Fishkeeper Blog','https://blog.tetra.net/ro-ro/chinese-algae-eater-un-peste-fascinant-util-in-acvariu/','curated_husbandry','reviewed',now())
on conflict (source_key) do nothing;

create temporary table compatibility_identity_bridge_expected_profiles(
  catalog_key text primary key, behavior_traits text[] not null, minimum_group_size integer, predation_targets text[] not null, confidence text not null, required_facts text[] not null
);

insert into compatibility_identity_bridge_expected_profiles values
('sp_0176',ARRAY['territorial','small_fish_predation']::text[],null,ARRAY['very_small_fish']::text[],'high',ARRAY['water','temperature','adult_size','social_behavior','territoriality','predation','ph','tank_size']::text[]),
('sp_0407',ARRAY['predatory','very_large_space_requirement','jumper','territorial']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','predation','territoriality']::text[]),
('sp_0236',ARRAY['shoaling','male_dominance','male_conspecific_territoriality']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior','tank_size','territoriality','predation']::text[]),
('sp_0229',ARRAY['territorial','age_increasing_aggression','mucus_grazing_risk']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0221',ARRAY['breeding_defense']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior','tank_size','territoriality','predation']::text[]),
('sp_0177',ARRAY['territorial','small_fish_predation']::text[],null,ARRAY['very_small_fish']::text[],'high',ARRAY['water','temperature','adult_size','social_behavior','territoriality','predation','ph','tank_size']::text[]),
('sp_0178',ARRAY['territorial','small_fish_predation']::text[],null,ARRAY['very_small_fish']::text[],'high',ARRAY['water','temperature','adult_size','social_behavior','territoriality','predation','ph','tank_size']::text[]),
('sp_0388',ARRAY['territorial','small_fish_predation']::text[],null,ARRAY['very_small_fish']::text[],'high',ARRAY['water','temperature','adult_size','social_behavior','territoriality','predation','ph','tank_size']::text[]);

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_identity_bridge_expected_profiles x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null;

create temporary table compatibility_identity_bridge_expected_sources(catalog_key text, source_key text, primary key(catalog_key,source_key));

insert into compatibility_identity_bridge_expected_sources values
('sp_0176','ifrj-pterophyllum-scalare-marble-identity-wave21'),
('sp_0176','batch-02-fishbase-pterophyllum-scalare'),
('sp_0176','seriouslyfish-pterophyllum-scalare'),
('sp_0176','tamu-pterophyllum-scalare-reproduction'),
('sp_0407','aquaculture-research-scleropages-blood-red-identity-wave22'),
('sp_0407','batch19-fishbase-scleropages-formosus'),
('sp_0407','seriouslyfish-scleropages-formosus'),
('sp_0407','myfish-scleropages-formosus-territoriality'),
('sp_0236','pcmr-xiphophorus-hellerii-red-albino-wave23'),
('sp_0236','seriouslyfish-xiphophorus-hellerii'),
('sp_0236','fishbase-xiphophorus-hellerii'),
('sp_0236','australian-government-xiphophorus-hellerii-territoriality'),
('sp_0236','fishbase-xiphophorus-hellerii-male-aggression'),
('sp_0229','tetra-gyrinocheilus-aymonieri-albino-wave24'),
('sp_0229','batch25-fishbase-gyrinocheilus-aymonieri'),
('sp_0229','seriouslyfish-gyrinocheilus-aymonieri'),
('sp_0221','aquarium-glaser-apistogramma-agassizii-fire-red-wave25'),
('sp_0221','seriouslyfish-apistogramma-agassizii'),
('sp_0221','fishbase-apistogramma-agassizii'),
('sp_0177','aquatic-arts-pterophyllum-scalare-blue-diamond-wave26'),
('sp_0177','batch-02-fishbase-pterophyllum-scalare'),
('sp_0177','seriouslyfish-pterophyllum-scalare'),
('sp_0177','tamu-pterophyllum-scalare-reproduction'),
('sp_0178','aquatic-arts-pterophyllum-scalare-panda-wave27'),
('sp_0178','batch-02-fishbase-pterophyllum-scalare'),
('sp_0178','seriouslyfish-pterophyllum-scalare'),
('sp_0178','tamu-pterophyllum-scalare-reproduction'),
('sp_0388','aquatic-arts-pterophyllum-scalare-red-devil-wave28'),
('sp_0388','batch-02-fishbase-pterophyllum-scalare'),
('sp_0388','seriouslyfish-pterophyllum-scalare'),
('sp_0388','tamu-pterophyllum-scalare-reproduction');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_identity_bridge_expected_sources x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 109 then raise exception 'POSTCHECK: expected 109 reviewed Compatibility profiles'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 200 then raise exception 'POSTCHECK: expected 200 reviewed evidence sources'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then raise exception 'POSTCHECK: Pair Rule count changed'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then raise exception 'POSTCHECK: stage risk count changed'; end if;
  if exists (
    select 1 from compatibility_identity_bridge_expected_profiles x
    left join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where p.id is null or p.behavior_traits is distinct from x.behavior_traits or p.minimum_group_size is distinct from x.minimum_group_size or p.predation_targets is distinct from x.predation_targets or p.confidence is distinct from x.confidence or p.required_facts is distinct from x.required_facts or p.stocking_guidance is not null
  ) then raise exception 'POSTCHECK: identity bridge Profile drift'; end if;
  if exists (select 1 from compatibility_identity_bridge_expected_sources x where not exists (select 1 from public.species s join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null join public.species_compatibility_profile_sources l on l.profile_id=p.id join public.evidence_sources e on e.id=l.source_id and e.review_status='reviewed' and e.deleted_at is null where s.catalog_key=x.catalog_key and e.source_key=x.source_key)) then raise exception 'POSTCHECK: identity bridge source link missing'; end if;
  if (select count(*) from public.species_compatibility_profile_sources l join public.species_compatibility_profiles p on p.id=l.profile_id join public.species s on s.id=p.species_id where s.catalog_key in ('sp_0176','sp_0177','sp_0178','sp_0221','sp_0229','sp_0236','sp_0388','sp_0407') and p.review_status='reviewed' and p.deleted_at is null) <> 31 then raise exception 'POSTCHECK: expected 31 identity bridge source links'; end if;
end
$postcheck$;

commit;
