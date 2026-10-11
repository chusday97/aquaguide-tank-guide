-- Stacked Compatibility wave04 authority. Depends on 20261011234500 predecessor candidate.

begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 85 then
    raise exception 'PRECHECK: expected predecessor 85 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 160 then
    raise exception 'PRECHECK: expected predecessor 160 reviewed evidence sources';
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
    where catalog_key in ('sp_0116','sp_0452','sp_0453','sp_0069','sp_0070','sp_0104','sp_0146','sp_0151','sp_0156','sp_0157')
      and status='published' and deleted_at is null
  ) <> 10 then
    raise exception 'PRECHECK: expected 10 published wave04 fish rows';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0116','sp_0452','sp_0453','sp_0069','sp_0070','sp_0104','sp_0146','sp_0151','sp_0156','sp_0157')
      and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave04 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key in ('batch19-fishbase-scleropages-formosus-green','batch17-fishbase-amphiprion-ocellaris','batch26-fishbase-pterois-volitans','batch09-fishbase-cyprinus-carpio-var','batch09-fishbase-cyprinus-carpio-longfin','batch19-fishbase-scleropages-formosus-red','batch10-fishbase-mikrogeophagus-ramirezi-platinum','batch21-fishbase-gymnocorymbus-ternetzi-color-morph','batch21-fishbase-trichopodus-trichopterus-platinum','seriouslyfish-trichopodus-trichopterus','batch10-fishbase-mikrogeophagus-ramirezi-blue')
      and deleted_at is null
  ) then
    raise exception 'PRECHECK: wave04 new evidence source already exists';
  end if;
  if (
    select count(*)
    from public.evidence_sources
    where source_key in ('batch19-fishbase-scleropages-formosus','seriouslyfish-scleropages-formosus','seriouslyfish-mikrogeophagus-ramirezi','fishbase-mikrogeophagus-ramirezi','seriouslyfish-gymnocorymbus-ternetzi','fishbase-gymnocorymbus-ternetzi')
      and review_status='reviewed'
      and deleted_at is null
  ) <> 6 then
    raise exception 'PRECHECK: expected six predecessor evidence sources for reviewed bridges';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0055','sp_0110','sp_0120','sp_0334','sp_0006','sp_0035','sp_0430','sp_0457','sp_0007','sp_0008','sp_0009','sp_0318','sp_0319','sp_0321','sp_0322','sp_0323','sp_0325','sp_0379','sp_0382','sp_0384') and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: identity/domain holds unexpectedly have fish Compatibility profiles';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
('batch19-fishbase-scleropages-formosus-green','Scleropages formosus Green variant review','FishBase','https://www.fishbase.se/Summary/Scleropages-formosus','professional_association','reviewed',now()),
('batch17-fishbase-amphiprion-ocellaris','Amphiprion ocellaris species review','FishBase','https://www.fishbase.se/summary/amphiprion-ocellaris.html','professional_association','reviewed',now()),
('batch26-fishbase-pterois-volitans','Pterois volitans species review','FishBase','https://www.fishbase.se/summary/Pterois-volitans.html','professional_association','reviewed',now()),
('batch09-fishbase-cyprinus-carpio-var','Cyprinus carpio var. catalog taxon review','FishBase','https://www.fishbase.se/summary/Cyprinus-carpio.html','professional_association','reviewed',now()),
('batch09-fishbase-cyprinus-carpio-longfin','Cyprinus carpio var. Longfin catalog variant review','FishBase','https://www.fishbase.se/summary/Cyprinus-carpio.html','professional_association','reviewed',now()),
('batch19-fishbase-scleropages-formosus-red','Scleropages formosus Red variant review','FishBase','https://www.fishbase.se/summary/6357','professional_association','reviewed',now()),
('batch10-fishbase-mikrogeophagus-ramirezi-platinum','Mikrogeophagus ramirezi Platinum variant review','FishBase','https://www.fishbase.se/summary/mikrogeophagus-ramirezi.html','professional_association','reviewed',now()),
('batch21-fishbase-gymnocorymbus-ternetzi-color-morph','Gymnocorymbus ternetzi Color morph variant review','FishBase','https://www.fishbase.se/summary/Gymnocorymbus-ternetzi','professional_association','reviewed',now()),
('batch21-fishbase-trichopodus-trichopterus-platinum','Trichopodus trichopterus Platinum variant review','FishBase','https://www.fishbase.se/summary/Trichopodus-trichopterus','professional_association','reviewed',now()),
('seriouslyfish-trichopodus-trichopterus','Trichopodus trichopterus (Three-spot Gourami)','Seriously Fish','https://www.seriouslyfish.com/species/trichopodus-trichopterus','curated_husbandry','reviewed',now()),
('batch10-fishbase-mikrogeophagus-ramirezi-blue','Mikrogeophagus ramirezi Blue variant review','FishBase','https://www.fishbase.se/summary/mikrogeophagus-ramirezi.html','professional_association','reviewed',now());

create temporary table compatibility_wave04_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_wave04_expected_profiles values
('sp_0116',ARRAY['predatory','very_large_space_requirement','jumper']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
('sp_0452',ARRAY['pair_living','anemone_association','male_egg_guarding']::text[],null,ARRAY[]::text[],'high',ARRAY['water','adult_size','social_behavior','breeding_behavior']::text[]),
('sp_0453',ARRAY['solitary','predatory','venomous_spines']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','adult_size','social_behavior','predation']::text[]),
('sp_0069',ARRAY['group_living','pond_scale','very_large_space_requirement']::text[],5,ARRAY[]::text[],'high',ARRAY['water','tank_size','social_behavior']::text[]),
('sp_0070',ARRAY['group_living','pond_scale','very_large_space_requirement']::text[],5,ARRAY[]::text[],'high',ARRAY['water','tank_size','social_behavior']::text[]),
('sp_0104',ARRAY['predatory','very_large_space_requirement','jumper']::text[],null,ARRAY['small_fish']::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
('sp_0146',ARRAY['peaceful','breeding_defense']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]),
('sp_0151',ARRAY['shoaling','peaceful','fin_nipping']::text[],12,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
('sp_0156',ARRAY['variable_temperament','male_territoriality','breeding_aggression']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','breeding_behavior']::text[]),
('sp_0157',ARRAY['peaceful','breeding_defense']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]);

insert into public.species_compatibility_profiles(
  species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance
)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_wave04_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

create temporary table compatibility_wave04_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_wave04_expected_sources values
('sp_0116','batch19-fishbase-scleropages-formosus-green'),
('sp_0116','batch19-fishbase-scleropages-formosus'),
('sp_0116','seriouslyfish-scleropages-formosus'),
('sp_0452','batch17-fishbase-amphiprion-ocellaris'),
('sp_0453','batch26-fishbase-pterois-volitans'),
('sp_0069','batch09-fishbase-cyprinus-carpio-var'),
('sp_0070','batch09-fishbase-cyprinus-carpio-longfin'),
('sp_0104','batch19-fishbase-scleropages-formosus-red'),
('sp_0104','batch19-fishbase-scleropages-formosus'),
('sp_0104','seriouslyfish-scleropages-formosus'),
('sp_0146','batch10-fishbase-mikrogeophagus-ramirezi-platinum'),
('sp_0146','seriouslyfish-mikrogeophagus-ramirezi'),
('sp_0146','fishbase-mikrogeophagus-ramirezi'),
('sp_0151','batch21-fishbase-gymnocorymbus-ternetzi-color-morph'),
('sp_0151','seriouslyfish-gymnocorymbus-ternetzi'),
('sp_0151','fishbase-gymnocorymbus-ternetzi'),
('sp_0156','batch21-fishbase-trichopodus-trichopterus-platinum'),
('sp_0156','seriouslyfish-trichopodus-trichopterus'),
('sp_0157','batch10-fishbase-mikrogeophagus-ramirezi-blue'),
('sp_0157','seriouslyfish-mikrogeophagus-ramirezi'),
('sp_0157','fishbase-mikrogeophagus-ramirezi');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_wave04_expected_sources x
join public.species s
  on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p
  on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e
  on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 95 then
    raise exception 'POSTCHECK: expected 95 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 171 then
    raise exception 'POSTCHECK: expected 171 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_wave04_expected_profiles x
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
    raise exception 'POSTCHECK: wave04 profile drift';
  end if;
  if exists (
    select 1
    from compatibility_wave04_expected_sources x
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
    raise exception 'POSTCHECK: wave04 source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0116','sp_0452','sp_0453','sp_0069','sp_0070','sp_0104','sp_0146','sp_0151','sp_0156','sp_0157')
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> 21 then
    raise exception 'POSTCHECK: expected 21 wave04 profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in ('sp_0055','sp_0110','sp_0120','sp_0334','sp_0006','sp_0035','sp_0430','sp_0457','sp_0007','sp_0008','sp_0009','sp_0318','sp_0319','sp_0321','sp_0322','sp_0323','sp_0325','sp_0379','sp_0382','sp_0384') and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: identity/domain holds must remain without fish Compatibility profiles';
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
