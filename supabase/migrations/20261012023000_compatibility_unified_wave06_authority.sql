-- Stacked Compatibility wave06 authority. Depends on exact wave05 predecessor 99 Profiles / 175 reviewed evidence.

begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 99 then
    raise exception 'PRECHECK: expected predecessor 99 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 175 then
    raise exception 'PRECHECK: expected predecessor 175 reviewed evidence sources';
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
    where catalog_key='sp_0283' and status='published' and deleted_at is null
  ) <> 1 then
    raise exception 'PRECHECK: expected published sp_0283 row';
  end if;
  if exists (
    select 1 from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0283' and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave06 sp_0283 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key='wave06-peer-reviewed-scleropages-formosus-super-red' and deleted_at is null
  ) then
    raise exception 'PRECHECK: wave06 evidence source already exists';
  end if;
  if (
    select count(*) from public.evidence_sources
    where source_key in ('batch19-fishbase-scleropages-formosus','seriouslyfish-scleropages-formosus')
      and review_status='reviewed' and deleted_at is null
  ) <> 2 then
    raise exception 'PRECHECK: expected 2 predecessor Scleropages formosus evidence sources';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in (
      'sp_0240','sp_0241','sp_0242','sp_0243','sp_0247','sp_0248','sp_0256','sp_0257',
      'sp_0263','sp_0264','sp_0265','sp_0266','sp_0268','sp_0269','sp_0270','sp_0271',
      'sp_0272','sp_0273','sp_0282','sp_0284','sp_0285','sp_0286','sp_0288','sp_0294'
    ) and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave06 identity/category holds unexpectedly have Compatibility profiles';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values
(
  'wave06-peer-reviewed-scleropages-formosus-super-red',
  'Cytogenetics Meets Genomics: Cytotaxonomy and Genomic Relationships among Color Variants of the Asian Arowana Scleropages formosus',
  'International Journal of Molecular Sciences',
  'https://pubmed.ncbi.nlm.nih.gov/37240350/',
  'peer_reviewed',
  'reviewed',
  now()
);

create temporary table compatibility_wave06_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_wave06_expected_profiles values
(
  'sp_0283',
  ARRAY['predatory','very_large_space_requirement','jumper']::text[],
  null,
  ARRAY['small_fish']::text[],
  'high',
  ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]
);

insert into public.species_compatibility_profiles(
  species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance
)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_wave06_expected_profiles x
join public.species s
  on s.catalog_key=x.catalog_key
 and s.status='published'
 and s.deleted_at is null;

create temporary table compatibility_wave06_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_wave06_expected_sources values
('sp_0283','wave06-peer-reviewed-scleropages-formosus-super-red'),
('sp_0283','batch19-fishbase-scleropages-formosus'),
('sp_0283','seriouslyfish-scleropages-formosus');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_wave06_expected_sources x
join public.species s
  on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p
  on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e
  on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 100 then
    raise exception 'POSTCHECK: expected 100 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 176 then
    raise exception 'POSTCHECK: expected 176 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_wave06_expected_profiles x
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
    raise exception 'POSTCHECK: wave06 profile drift';
  end if;
  if exists (
    select 1 from compatibility_wave06_expected_sources x
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
    raise exception 'POSTCHECK: wave06 source links missing';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0283'
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> 3 then
    raise exception 'POSTCHECK: expected 3 wave06 profile-source links';
  end if;
  if exists (
    select 1
    from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key in (
      'sp_0240','sp_0241','sp_0242','sp_0243','sp_0247','sp_0248','sp_0256','sp_0257',
      'sp_0263','sp_0264','sp_0265','sp_0266','sp_0268','sp_0269','sp_0270','sp_0271',
      'sp_0272','sp_0273','sp_0282','sp_0284','sp_0285','sp_0286','sp_0288','sp_0294'
    ) and p.deleted_at is null
  ) then
    raise exception 'POSTCHECK: wave06 identity/category holds must remain without Compatibility profiles';
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
