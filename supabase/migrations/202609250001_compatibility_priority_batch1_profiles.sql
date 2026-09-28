-- Repository-only reviewed Profile ownership for Compatibility priority batch 1.
-- Species: sp_0015, sp_0059, sp_0199, sp_0200, sp_0019.
-- IMPORTANT: inclusion in source control does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.

with seed(source_key,title,publisher,url,source_type) as (values
  ('seriouslyfish-helostoma-temminkii', 'Helostoma temminkii (Kissing Gourami)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/helostoma-temminkii', 'curated_husbandry'),
  ('seriouslyfish-macropodus-opercularis', 'Macropodus opercularis (Paradise Fish)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/macropodus-opercularis', 'curated_husbandry'),
  ('seriouslyfish-badis-badis', 'Badis badis (Badis)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/badis-badis', 'curated_husbandry'),
  ('seriouslyfish-dario-dario', 'Dario dario (Scarlet Badis)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/dario-dario/', 'curated_husbandry'),
  ('seriouslyfish-pterophyllum-altum', 'Pterophyllum altum (Altum Angel)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/pterophyllum-altum', 'curated_husbandry')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_priority_batch1_gate;
create temporary table compatibility_priority_batch1_gate (mode text not null);

do $$
declare existing_count integer; published_count integer;
begin
  select count(*), count(*) filter (where status='published')
  into existing_count,published_count
  from public.species
  where catalog_key in ('sp_0015','sp_0059','sp_0199','sp_0200','sp_0019') and deleted_at is null;

  if existing_count=0 then
    insert into pg_temp.compatibility_priority_batch1_gate(mode) values ('skip');
    raise notice 'Compatibility priority batch1 baseline absent; skipping reviewed Profile extension.';
  elsif existing_count=5 and published_count=5 then
    insert into pg_temp.compatibility_priority_batch1_gate(mode) values ('run');
  else
    raise exception 'Compatibility priority batch1 baseline is partial or not fully published: existing %, published %, required 5', existing_count,published_count;
  end if;
end $$;

with profiles(catalog_key,behavior_traits,minimum_group_size,predation_targets,confidence,required_facts) as (values
  ('sp_0015', ARRAY['interspecific_aggression']::text[], null::integer, ARRAY[]::text[], 'high', ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
  ('sp_0059', ARRAY['territorial']::text[], null::integer, ARRAY[]::text[], 'high', ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[]),
  ('sp_0199', ARRAY['territorial']::text[], null::integer, ARRAY[]::text[], 'high', ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[]),
  ('sp_0200', ARRAY['territorial']::text[], null::integer, ARRAY[]::text[], 'high', ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[]),
  ('sp_0019', ARRAY['predatory']::text[], null::integer, ARRAY['small_fish']::text[], 'high', ARRAY['water','temperature','ph','adult_size','predation']::text[])
)
insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,p.behavior_traits,p.minimum_group_size,p.predation_targets,p.confidence,'reviewed',now(),p.required_facts
from profiles p
join public.species s on s.catalog_key=p.catalog_key
where exists (select 1 from pg_temp.compatibility_priority_batch1_gate where mode='run')
  and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

with links(catalog_key,source_key) as (values
  ('sp_0015','seriouslyfish-helostoma-temminkii'),
  ('sp_0059','seriouslyfish-macropodus-opercularis'),
  ('sp_0199','seriouslyfish-badis-badis'),
  ('sp_0200','seriouslyfish-dario-dario'),
  ('sp_0019','seriouslyfish-pterophyllum-altum')
)
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id
from links l
join public.species s on s.catalog_key=l.catalog_key
join public.species_compatibility_profiles cp on cp.species_id=s.id
join public.evidence_sources e on e.source_key=l.source_key
where exists (select 1 from pg_temp.compatibility_priority_batch1_gate where mode='run')
on conflict do nothing;

do $$ begin
  if exists (select 1 from pg_temp.compatibility_priority_batch1_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0015' and cp.behavior_traits=ARRAY['interspecific_aggression']::text[] and cp.minimum_group_size is null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior']::text[] and cp.deleted_at is null) then raise exception 'Compatibility priority batch1 profile drift: sp_0015'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0059' and cp.behavior_traits=ARRAY['territorial']::text[] and cp.minimum_group_size is null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[] and cp.deleted_at is null) then raise exception 'Compatibility priority batch1 profile drift: sp_0059'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0199' and cp.behavior_traits=ARRAY['territorial']::text[] and cp.minimum_group_size is null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[] and cp.deleted_at is null) then raise exception 'Compatibility priority batch1 profile drift: sp_0199'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0200' and cp.behavior_traits=ARRAY['territorial']::text[] and cp.minimum_group_size is null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[] and cp.deleted_at is null) then raise exception 'Compatibility priority batch1 profile drift: sp_0200'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0019' and cp.behavior_traits=ARRAY['predatory']::text[] and cp.minimum_group_size is null and cp.predation_targets=ARRAY['small_fish']::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water','temperature','ph','adult_size','predation']::text[] and cp.deleted_at is null) then raise exception 'Compatibility priority batch1 profile drift: sp_0019'; end if;

    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.species_compatibility_profile_sources l on l.profile_id=cp.id join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0015' and e.source_key='seriouslyfish-helostoma-temminkii') then raise exception 'Compatibility priority batch1 profile evidence drift: sp_0015'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.species_compatibility_profile_sources l on l.profile_id=cp.id join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0059' and e.source_key='seriouslyfish-macropodus-opercularis') then raise exception 'Compatibility priority batch1 profile evidence drift: sp_0059'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.species_compatibility_profile_sources l on l.profile_id=cp.id join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0199' and e.source_key='seriouslyfish-badis-badis') then raise exception 'Compatibility priority batch1 profile evidence drift: sp_0199'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.species_compatibility_profile_sources l on l.profile_id=cp.id join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0200' and e.source_key='seriouslyfish-dario-dario') then raise exception 'Compatibility priority batch1 profile evidence drift: sp_0200'; end if;
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.species_compatibility_profile_sources l on l.profile_id=cp.id join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0019' and e.source_key='seriouslyfish-pterophyllum-altum') then raise exception 'Compatibility priority batch1 profile evidence drift: sp_0019'; end if;
  end if;
end $$;

drop table pg_temp.compatibility_priority_batch1_gate;
