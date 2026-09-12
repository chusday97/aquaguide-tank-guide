-- Extend the canonical reviewed Compatibility baseline with Product Recovery reviewed authority.
-- Additive only: historical baseline migrations remain immutable. Fail closed on partial published catalog coverage or reviewed-data drift.

with seed(source_key,title,publisher,url,source_type) as (values
  ('fishbase-xiphophorus-hellerii', 'Xiphophorus hellerii (Green swordtail) species summary', 'FishBase', 'https://www.fishbase.org/Summary/Xiphophorus-hellerii', 'curated_husbandry'),
  ('fishbase-xiphophorus-maculatus', 'Xiphophorus maculatus (Southern platyfish) species summary', 'FishBase', 'https://www.fishbase.se/summary/Xiphophorus_maculatus.html', 'curated_husbandry'),
  ('seriouslyfish-corydoras-aeneus', 'Corydoras aeneus (Bronze Cory)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/corydoras-aeneus', 'curated_husbandry'),
  ('seriouslyfish-corydoras-panda', 'Corydoras panda (Panda Cory)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/corydoras-panda', 'curated_husbandry'),
  ('seriouslyfish-danio-rerio', 'Brachydanio rerio (Zebra ''Danio'')', 'Seriously Fish', 'https://www.seriouslyfish.com/species/danio-rerio', 'curated_husbandry'),
  ('seriouslyfish-poecilia-reticulata', 'Poecilia reticulata (Guppy)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/poecilia-reticulata/', 'curated_husbandry'),
  ('seriouslyfish-poecilia-sphenops', 'Poecilia sphenops (Short-finned Molly/Black Molly)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/poecilia-sphenops', 'curated_husbandry'),
  ('seriouslyfish-pterophyllum-scalare', 'Pterophyllum scalare (Angelfish)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/pterophyllum-scalare', 'curated_husbandry'),
  ('seriouslyfish-puntigrus-tetrazona', 'Puntigrus tetrazona (Tiger Barb)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/puntigrus-tetrazona', 'curated_husbandry'),
  ('seriouslyfish-xiphophorus-hellerii', 'Xiphophorus hellerii (Green Swordtail)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/xiphophorus-hellerii', 'curated_husbandry'),
  ('seriouslyfish-xiphophorus-maculatus', 'Xiphophorus maculatus (Platy)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/xiphophorus-maculatus', 'curated_husbandry'),
  ('tamu-pterophyllum-scalare-reproduction', 'Reproduction of Angelfish (Pterophyllum scalare)', 'Texas A&M AgriLife Extension', 'https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf', 'government')
)
update public.evidence_sources e set source_key=seed.source_key from seed
where e.source_key is null and e.url=seed.url and e.review_status='reviewed' and e.deleted_at is null;

with seed(source_key,title,publisher,url,source_type) as (values
  ('fishbase-xiphophorus-hellerii', 'Xiphophorus hellerii (Green swordtail) species summary', 'FishBase', 'https://www.fishbase.org/Summary/Xiphophorus-hellerii', 'curated_husbandry'),
  ('fishbase-xiphophorus-maculatus', 'Xiphophorus maculatus (Southern platyfish) species summary', 'FishBase', 'https://www.fishbase.se/summary/Xiphophorus_maculatus.html', 'curated_husbandry'),
  ('seriouslyfish-corydoras-aeneus', 'Corydoras aeneus (Bronze Cory)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/corydoras-aeneus', 'curated_husbandry'),
  ('seriouslyfish-corydoras-panda', 'Corydoras panda (Panda Cory)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/corydoras-panda', 'curated_husbandry'),
  ('seriouslyfish-danio-rerio', 'Brachydanio rerio (Zebra ''Danio'')', 'Seriously Fish', 'https://www.seriouslyfish.com/species/danio-rerio', 'curated_husbandry'),
  ('seriouslyfish-poecilia-reticulata', 'Poecilia reticulata (Guppy)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/poecilia-reticulata/', 'curated_husbandry'),
  ('seriouslyfish-poecilia-sphenops', 'Poecilia sphenops (Short-finned Molly/Black Molly)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/poecilia-sphenops', 'curated_husbandry'),
  ('seriouslyfish-pterophyllum-scalare', 'Pterophyllum scalare (Angelfish)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/pterophyllum-scalare', 'curated_husbandry'),
  ('seriouslyfish-puntigrus-tetrazona', 'Puntigrus tetrazona (Tiger Barb)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/puntigrus-tetrazona', 'curated_husbandry'),
  ('seriouslyfish-xiphophorus-hellerii', 'Xiphophorus hellerii (Green Swordtail)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/xiphophorus-hellerii', 'curated_husbandry'),
  ('seriouslyfish-xiphophorus-maculatus', 'Xiphophorus maculatus (Platy)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/xiphophorus-maculatus', 'curated_husbandry'),
  ('tamu-pterophyllum-scalare-reproduction', 'Reproduction of Angelfish (Pterophyllum scalare)', 'Texas A&M AgriLife Extension', 'https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf', 'government')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

do $$ begin
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-xiphophorus-hellerii' and title='Xiphophorus hellerii (Green swordtail) species summary' and publisher='FishBase' and url='https://www.fishbase.org/Summary/Xiphophorus-hellerii' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: fishbase-xiphophorus-hellerii'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-xiphophorus-maculatus' and title='Xiphophorus maculatus (Southern platyfish) species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Xiphophorus_maculatus.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: fishbase-xiphophorus-maculatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-corydoras-aeneus' and title='Corydoras aeneus (Bronze Cory)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/corydoras-aeneus' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-corydoras-aeneus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-corydoras-panda' and title='Corydoras panda (Panda Cory)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/corydoras-panda' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-corydoras-panda'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-danio-rerio' and title='Brachydanio rerio (Zebra ''Danio'')' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/danio-rerio' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-danio-rerio'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-poecilia-reticulata' and title='Poecilia reticulata (Guppy)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/poecilia-reticulata/' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-poecilia-reticulata'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-poecilia-sphenops' and title='Poecilia sphenops (Short-finned Molly/Black Molly)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/poecilia-sphenops' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-poecilia-sphenops'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-pterophyllum-scalare' and title='Pterophyllum scalare (Angelfish)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/pterophyllum-scalare' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-pterophyllum-scalare'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-puntigrus-tetrazona' and title='Puntigrus tetrazona (Tiger Barb)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/puntigrus-tetrazona' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-puntigrus-tetrazona'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-xiphophorus-hellerii' and title='Xiphophorus hellerii (Green Swordtail)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/xiphophorus-hellerii' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-xiphophorus-hellerii'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-xiphophorus-maculatus' and title='Xiphophorus maculatus (Platy)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/xiphophorus-maculatus' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: seriouslyfish-xiphophorus-maculatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='tamu-pterophyllum-scalare-reproduction' and title='Reproduction of Angelfish (Pterophyllum scalare)' and publisher='Texas A&M AgriLife Extension' and url='https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf' and source_type='government' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility recovery evidence source drift: tamu-pterophyllum-scalare-reproduction'; end if;
end $$;

drop table if exists pg_temp.compatibility_recovery_baseline_gate;
create temporary table compatibility_recovery_baseline_gate (mode text not null);
do $$
declare
  required_catalog_keys text[] := ARRAY['sp_0011', 'sp_0014', 'sp_0435', 'sp_0436', 'sp_0437', 'sp_0438', 'sp_0439', 'sp_0443', 'sp_0446']::text[];
  existing_count integer;
  published_count integer;
begin
  select count(*), count(*) filter (where status='published') into existing_count,published_count
  from public.species where catalog_key=any(required_catalog_keys) and deleted_at is null;
  if existing_count=0 then
    insert into pg_temp.compatibility_recovery_baseline_gate(mode) values ('skip');
    raise notice 'Compatibility recovery baseline absent; skipping reviewed-data extension.';
  elsif existing_count=cardinality(required_catalog_keys) and published_count=cardinality(required_catalog_keys) then
    insert into pg_temp.compatibility_recovery_baseline_gate(mode) values ('run');
  else
    raise exception 'Compatibility recovery baseline is partial or not fully published: existing %, published %, required %', existing_count,published_count,cardinality(required_catalog_keys);
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['peaceful']::text[], null, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior']::text[], null
from public.species s where s.catalog_key='sp_0011' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-xiphophorus-maculatus'
where s.catalog_key='sp_0011' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='fishbase-xiphophorus-maculatus'
where s.catalog_key='sp_0011' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0011' and cp.behavior_traits=ARRAY['peaceful']::text[] and cp.minimum_group_size is not distinct from null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0011'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0011') <> ARRAY['fishbase-xiphophorus-maculatus', 'seriouslyfish-xiphophorus-maculatus']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0011'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['peaceful']::text[], null, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior']::text[], null
from public.species s where s.catalog_key='sp_0437' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-poecilia-sphenops'
where s.catalog_key='sp_0437' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0437' and cp.behavior_traits=ARRAY['peaceful']::text[] and cp.minimum_group_size is not distinct from null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0437'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0437') <> ARRAY['seriouslyfish-poecilia-sphenops']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0437'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['shoaling', 'male_dominance']::text[], null, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior']::text[], null
from public.species s where s.catalog_key='sp_0438' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-xiphophorus-hellerii'
where s.catalog_key='sp_0438' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='fishbase-xiphophorus-hellerii'
where s.catalog_key='sp_0438' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0438' and cp.behavior_traits=ARRAY['shoaling', 'male_dominance']::text[] and cp.minimum_group_size is not distinct from null and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0438'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0438') <> ARRAY['fishbase-xiphophorus-hellerii', 'seriouslyfish-xiphophorus-hellerii']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0438'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['shoaling', 'bottom_dwelling']::text[], 4, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'adult_size', 'social_behavior']::text[], null
from public.species s where s.catalog_key='sp_0014' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-corydoras-aeneus'
where s.catalog_key='sp_0014' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0014' and cp.behavior_traits=ARRAY['shoaling', 'bottom_dwelling']::text[] and cp.minimum_group_size is not distinct from 4 and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'adult_size', 'social_behavior']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0014'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0014') <> ARRAY['seriouslyfish-corydoras-aeneus']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0014'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['shoaling', 'bottom_dwelling']::text[], 6, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'adult_size', 'social_behavior']::text[], null
from public.species s where s.catalog_key='sp_0443' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-corydoras-panda'
where s.catalog_key='sp_0443' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0443' and cp.behavior_traits=ARRAY['shoaling', 'bottom_dwelling']::text[] and cp.minimum_group_size is not distinct from 6 and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'adult_size', 'social_behavior']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0443'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0443') <> ARRAY['seriouslyfish-corydoras-panda']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0443'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['shoaling']::text[], 8, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'social_behavior', 'adult_size']::text[], null
from public.species s where s.catalog_key='sp_0435' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-danio-rerio'
where s.catalog_key='sp_0435' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0435' and cp.behavior_traits=ARRAY['shoaling']::text[] and cp.minimum_group_size is not distinct from 8 and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'social_behavior', 'adult_size']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0435'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0435') <> ARRAY['seriouslyfish-danio-rerio']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0435'; end if;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['territorial', 'small_fish_predation']::text[], null, ARRAY['very_small_fish']::text[], 'high', 'reviewed', now(), ARRAY['water', 'temperature', 'adult_size', 'social_behavior', 'territoriality', 'predation']::text[], null
from public.species s where s.catalog_key='sp_0446' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-pterophyllum-scalare'
where s.catalog_key='sp_0446' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='tamu-pterophyllum-scalare-reproduction'
where s.catalog_key='sp_0446' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key='sp_0446' and cp.behavior_traits=ARRAY['territorial', 'small_fish_predation']::text[] and cp.minimum_group_size is not distinct from null and cp.predation_targets=ARRAY['very_small_fish']::text[] and cp.confidence='high' and cp.review_status='reviewed' and cp.required_facts=ARRAY['water', 'temperature', 'adult_size', 'social_behavior', 'territoriality', 'predation']::text[] and cp.deleted_at is null and s.status='published') then raise exception 'Compatibility recovery profile drift: sp_0446'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id left join public.species_compatibility_profile_sources l on l.profile_id=cp.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0446') <> ARRAY['seriouslyfish-pterophyllum-scalare', 'tamu-pterophyllum-scalare-reproduction']::text[] then raise exception 'Compatibility recovery profile evidence drift: sp_0446'; end if;
  end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id),greatest(a.id,b.id),'not_recommended','fin_nipping_long_fin_conflict','孔雀鱼资料明确建议不要与虎皮等追鳍鱼混养；虎皮鱼资料也明确指出其不适合作为长鳍或慢游鱼的同伴。该组合有直接的养护层配对建议，不应仅作为一般性 caution。',ARRAY['优先不要长期混养；选择非追鳍同伴，或将两者分缸。', '不要把“虎皮数量够了”理解为已经消除对长鳍鱼的追鳍风险。']::text[],'pair_rule','high','reviewed',now()
from public.species a cross join public.species b where a.catalog_key='sp_0439' and b.catalog_key='sp_0436' and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run')
  and not exists (select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='seriouslyfish-poecilia-reticulata'
where least(a.catalog_key,b.catalog_key)='sp_0436' and greatest(a.catalog_key,b.catalog_key)='sp_0439' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='seriouslyfish-puntigrus-tetrazona'
where least(a.catalog_key,b.catalog_key)='sp_0436' and greatest(a.catalog_key,b.catalog_key)='sp_0439' and exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') on conflict do nothing;
do $$ begin
  if exists (select 1 from pg_temp.compatibility_recovery_baseline_gate where mode='run') then
    if not exists (select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0436' and greatest(a.catalog_key,b.catalog_key)='sp_0439' and pr.verdict='not_recommended' and pr.risk_type='fin_nipping_long_fin_conflict' and pr.reason='孔雀鱼资料明确建议不要与虎皮等追鳍鱼混养；虎皮鱼资料也明确指出其不适合作为长鳍或慢游鱼的同伴。该组合有直接的养护层配对建议，不应仅作为一般性 caution。' and pr.mitigation=ARRAY['优先不要长期混养；选择非追鳍同伴，或将两者分缸。', '不要把“虎皮数量够了”理解为已经消除对长鳍鱼的追鳍风险。']::text[] and pr.basis='pair_rule' and pr.confidence='high' and pr.review_status='reviewed' and pr.deleted_at is null) then raise exception 'Compatibility recovery pair rule drift: sp_0436__sp_0439'; end if;
    if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0436' and greatest(a.catalog_key,b.catalog_key)='sp_0439') <> ARRAY['seriouslyfish-poecilia-reticulata', 'seriouslyfish-puntigrus-tetrazona']::text[] then raise exception 'Compatibility recovery pair evidence drift: sp_0436__sp_0439'; end if;
  end if;
end $$;

drop table pg_temp.compatibility_recovery_baseline_gate;
