-- Additive ownership for the three reviewed Profiles that were added after the
-- previous baseline. This migration never rewrites historical migrations.

with seed(source_key,title,publisher,url,source_type) as (values
  ('seriouslyfish-petitella-rhodostoma', 'Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/hemigrammus-rhodostomus', 'curated_husbandry'),
  ('fishbase-petitella-rhodostoma', 'Petitella rhodostoma species summary', 'FishBase', 'https://www.fishbase.se/summary/Hemigrammus-rhodostomus.html', 'curated_husbandry'),
  ('fishbase-otocinclus-vittatus', 'Otocinclus vittatus species summary', 'FishBase', 'https://www.fishbase.se/summary/Otocinclus-vittatus.html', 'curated_husbandry'),
  ('aquariumcoop-otocinclus-catfish', 'Care Guide for Otocinclus Catfish', 'Aquarium Co-Op', 'https://www.aquariumcoop.com/blogs/aquarium/otocinclus-catfish', 'curated_husbandry'),
  ('scotcat-otocinclus-vittatus', 'Otocinclus vittatus Regan, 1904', 'ScotCat', 'https://www.scotcat.com/loricariidae/otocinclus_vittatus.htm', 'curated_husbandry'),
  ('fishbase-astronotus-ocellatus-ecology', 'Astronotus ocellatus ecology summary', 'FishBase', 'https://www.fishbase.se/Ecology/Astronotus_ocellatus', 'curated_husbandry'),
  ('seriouslyfish-astronotus-ocellatus', 'Astronotus ocellatus (Oscar)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/astronotus-ocellatus', 'curated_husbandry')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

do $$ begin
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-petitella-rhodostoma' and title='Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/hemigrammus-rhodostoma' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: seriouslyfish-petitella-rhodostoma'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-petitella-rhodostoma' and title='Petitella rhodostoma species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Hemigrammus-rhodostomus.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: fishbase-petitella-rhodostoma'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-otocinclus-vittatus' and title='Otocinclus vittatus species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Otocinclus-vittatus.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: fishbase-otocinclus-vittatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='aquariumcoop-otocinclus-catfish' and title='Care Guide for Otocinclus Catfish' and publisher='Aquarium Co-Op' and url='https://www.aquariumcoop.com/blogs/aquarium/otocinclus-catfish' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: aquariumcoop-otocinclus-catfish'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='scotcat-otocinclus-vittatus' and title='Otocinclus vittatus Regan, 1904' and publisher='ScotCat' and url='https://www.scotcat.com/loricariidae/otocinclus_vittatus.htm' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: scotcat-otocinclus-vittatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-astronotus-ocellatus-ecology' and title='Astronotus ocellatus ecology summary' and publisher='FishBase' and url='https://www.fishbase.se/Ecology/Astronotus_ocellatus' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: fishbase-astronotus-ocellatus-ecology'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-astronotus-ocellatus' and title='Astronotus ocellatus (Oscar)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/astronotus-ocellatus' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility rummy-oto-oscar evidence source drift: seriouslyfish-astronotus-ocellatus'; end if;
end $$;

drop table if exists pg_temp.compatibility_rummy_oto_oscar_gate;
create temporary table compatibility_rummy_oto_oscar_gate (mode text not null);
do $$
declare existing_count integer; published_count integer;
begin
  select count(*), count(*) filter (where status='published') into existing_count,published_count
  from public.species where catalog_key in ('sp_0433','sp_0013','sp_0451') and deleted_at is null;
  if existing_count=0 then
    insert into pg_temp.compatibility_rummy_oto_oscar_gate(mode) values ('skip');
    raise notice 'Compatibility rummy/oto/oscar baseline absent; skipping reviewed-data extension.';
  elsif existing_count=3 and published_count=3 then
    insert into pg_temp.compatibility_rummy_oto_oscar_gate(mode) values ('run');
  else
    raise exception 'Compatibility rummy/oto/oscar baseline is partial or not fully published: existing %, published %, required 3', existing_count,published_count;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id, v.behavior_traits, v.minimum_group_size, v.predation_targets, v.confidence, 'reviewed', now(), v.required_facts
from public.species s
join (values
  ('sp_0433', ARRAY['shoaling','peaceful']::text[], 10, ARRAY[]::text[], 'high', ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
  ('sp_0013', ARRAY['peaceful','bottom_dwelling']::text[], null, ARRAY[]::text[], 'medium', ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
  ('sp_0451', ARRAY['predatory']::text[], null, ARRAY['small_fish']::text[], 'medium', ARRAY['water','temperature','adult_size','predation']::text[])
) as v(catalog_key,behavior_traits,minimum_group_size,predation_targets,confidence,required_facts) on v.catalog_key=s.catalog_key
where exists (select 1 from pg_temp.compatibility_rummy_oto_oscar_gate where mode='run')
  and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key in ('seriouslyfish-petitella-rhodostoma','fishbase-petitella-rhodostoma')
where s.catalog_key='sp_0433' and exists (select 1 from pg_temp.compatibility_rummy_oto_oscar_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key in ('fishbase-otocinclus-vittatus','aquariumcoop-otocinclus-catfish','scotcat-otocinclus-vittatus')
where s.catalog_key='sp_0013' and exists (select 1 from pg_temp.compatibility_rummy_oto_oscar_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key in ('fishbase-astronotus-ocellatus-ecology','seriouslyfish-astronotus-ocellatus')
where s.catalog_key='sp_0451' and exists (select 1 from pg_temp.compatibility_rummy_oto_oscar_gate where mode='run') on conflict do nothing;

do $$ begin
  if exists (select 1 from pg_temp.compatibility_rummy_oto_oscar_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0433' and p.behavior_traits=ARRAY['shoaling','peaceful']::text[] and p.minimum_group_size is not distinct from 10 and p.predation_targets=ARRAY[]::text[] and p.confidence='high' and p.review_status='reviewed' and p.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior']::text[] and p.deleted_at is null and s.status='published') then raise exception 'Compatibility rummy-oto-oscar profile drift: sp_0433'; end if;
    if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0013' and p.behavior_traits=ARRAY['peaceful','bottom_dwelling']::text[] and p.minimum_group_size is not distinct from null and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior']::text[] and p.deleted_at is null and s.status='published') then raise exception 'Compatibility rummy-oto-oscar profile drift: sp_0013'; end if;
    if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0451' and p.behavior_traits=ARRAY['predatory']::text[] and p.minimum_group_size is not distinct from null and p.predation_targets=ARRAY['small_fish']::text[] and p.confidence='medium' and p.review_status='reviewed' and p.required_facts=ARRAY['water','temperature','adult_size','predation']::text[] and p.deleted_at is null and s.status='published') then raise exception 'Compatibility rummy-oto-oscar profile drift: sp_0451'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0433') <> ARRAY['fishbase-petitella-rhodostoma','seriouslyfish-petitella-rhodostoma']::text[] then raise exception 'Compatibility rummy-oto-oscar profile evidence drift: sp_0433'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0013') <> ARRAY['aquariumcoop-otocinclus-catfish','fishbase-otocinclus-vittatus','scotcat-otocinclus-vittatus']::text[] then raise exception 'Compatibility rummy-oto-oscar profile evidence drift: sp_0013'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0451') <> ARRAY['fishbase-astronotus-ocellatus-ecology','seriouslyfish-astronotus-ocellatus']::text[] then raise exception 'Compatibility rummy-oto-oscar profile evidence drift: sp_0451'; end if;
  end if;
end $$;

drop table pg_temp.compatibility_rummy_oto_oscar_gate;
