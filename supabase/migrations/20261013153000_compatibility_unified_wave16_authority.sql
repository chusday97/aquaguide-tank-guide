-- Stacked Compatibility wave16 authority.
-- Repository-only until an explicit Production promotion is authorized.
begin;

do $precheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 100 then
    raise exception 'PRECHECK: expected predecessor 100 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then
    raise exception 'PRECHECK: expected 21 reviewed Compatibility pair rules';
  end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected 1 reviewed Compatibility stage risk';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 176 then
    raise exception 'PRECHECK: expected predecessor 176 reviewed evidence sources';
  end if;
  if (select count(*) from public.species where deleted_at is null) <> 486
     or (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486
     or (select count(*) from public.care_articles where deleted_at is null) <> 41
     or (select count(*) from public.care_article_steps where deleted_at is null) <> 128
     or (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: Product/Care authority drift';
  end if;
  if (select count(*) from public.species where catalog_key='sp_0052' and status='published' and deleted_at is null) <> 1 then
    raise exception 'PRECHECK: expected published sp_0052 row';
  end if;
  if exists (
    select 1 from public.species_compatibility_profiles p
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0052' and p.deleted_at is null
  ) then
    raise exception 'PRECHECK: wave16 sp_0052 Compatibility profile already exists';
  end if;
  if exists (
    select 1 from public.evidence_sources
    where source_key='batch05-fishbase-gastrodermus-hastatus' and deleted_at is null
  ) then
    raise exception 'PRECHECK: wave16 evidence source already exists';
  end if;
end
$precheck$;

insert into public.evidence_sources(
  source_key,title,publisher,url,source_type,review_status,reviewed_at
) values (
  'batch05-fishbase-gastrodermus-hastatus',
  'Gastrodermus hastatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Corydoras-hastatus',
  'curated_husbandry',
  'reviewed',
  now()
);

create temporary table compatibility_wave16_expected_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
);

insert into compatibility_wave16_expected_profiles values (
  'sp_0052',
  ARRAY['shoaling','bottom_dwelling']::text[],
  null,
  ARRAY[]::text[],
  'medium',
  ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]
);

insert into public.species_compatibility_profiles(
  species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance
)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,null
from compatibility_wave16_expected_profiles x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null;

create temporary table compatibility_wave16_expected_sources(
  catalog_key text,
  source_key text,
  primary key(catalog_key,source_key)
);

insert into compatibility_wave16_expected_sources values
('sp_0052','batch05-fishbase-gastrodermus-hastatus');

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from compatibility_wave16_expected_sources x
join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $postcheck$
begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 101 then
    raise exception 'POSTCHECK: expected 101 reviewed Compatibility profiles';
  end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 177 then
    raise exception 'POSTCHECK: expected 177 reviewed evidence sources';
  end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21
     or (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: pair/stage authority count changed';
  end if;
  if exists (
    select 1
    from compatibility_wave16_expected_profiles x
    left join public.species s on s.catalog_key=x.catalog_key and s.status='published' and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is distinct from x.minimum_group_size
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.required_facts is distinct from x.required_facts
       or p.stocking_guidance is not null
  ) then
    raise exception 'POSTCHECK: wave16 profile drift';
  end if;
  if (
    select count(*)
    from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id
    join public.species s on s.id=p.species_id
    where s.catalog_key='sp_0052'
      and p.review_status='reviewed'
      and p.deleted_at is null
  ) <> 1 then
    raise exception 'POSTCHECK: expected 1 wave16 profile-source link';
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
