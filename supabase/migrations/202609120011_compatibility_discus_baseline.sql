-- Add the reviewed Symphysodon aequifasciatus (Discus) Compatibility profile without mutating prior baseline migrations.
-- Additive only; skip only when the catalog species is entirely absent, and fail closed on partial/unpublished state or reviewed-data drift.

with seed(source_key,title,publisher,url,source_type) as (values
  ('seriouslyfish-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus (Discus)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/symphysodon-aequifasciatus', 'curated_husbandry'),
  ('fishbase-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus species summary', 'FishBase', 'https://www.fishbase.se/summary/11185', 'curated_husbandry')
)
update public.evidence_sources e set source_key=seed.source_key from seed
where e.source_key is null and e.url=seed.url and e.review_status='reviewed' and e.deleted_at is null;

with seed(source_key,title,publisher,url,source_type) as (values
  ('seriouslyfish-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus (Discus)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/symphysodon-aequifasciatus', 'curated_husbandry'),
  ('fishbase-symphysodon-aequifasciatus', 'Symphysodon aequifasciatus species summary', 'FishBase', 'https://www.fishbase.se/summary/11185', 'curated_husbandry')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

do $$ begin
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-symphysodon-aequifasciatus' and title='Symphysodon aequifasciatus (Discus)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/symphysodon-aequifasciatus' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility discus evidence source drift: seriouslyfish-symphysodon-aequifasciatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-symphysodon-aequifasciatus' and title='Symphysodon aequifasciatus species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/11185' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility discus evidence source drift: fishbase-symphysodon-aequifasciatus'; end if;
end $$;

drop table if exists pg_temp.compatibility_discus_baseline_gate;
create temporary table compatibility_discus_baseline_gate (mode text not null);
do $$
declare existing_count integer; published_count integer;
begin
  select count(*), count(*) filter (where status='published') into existing_count,published_count
  from public.species where catalog_key='sp_0447' and deleted_at is null;
  if existing_count=0 then
    insert into pg_temp.compatibility_discus_baseline_gate(mode) values ('skip');
    raise notice 'Compatibility discus baseline absent; skipping reviewed-data extension.';
  elsif existing_count=1 and published_count=1 then
    insert into pg_temp.compatibility_discus_baseline_gate(mode) values ('run');
  else
    raise exception 'Compatibility discus baseline is partial or not fully published: existing %, published %, required 1', existing_count,published_count;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id, ARRAY['shoaling','breeding_defense']::text[], 5, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[], null
from public.species s where s.catalog_key='sp_0447' and s.deleted_at is null and s.status='published'
  and exists (select 1 from pg_temp.compatibility_discus_baseline_gate where mode='run')
  and not exists (select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='seriouslyfish-symphysodon-aequifasciatus'
where s.catalog_key='sp_0447' and exists (select 1 from pg_temp.compatibility_discus_baseline_gate where mode='run') on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id join public.evidence_sources e on e.source_key='fishbase-symphysodon-aequifasciatus'
where s.catalog_key='sp_0447' and exists (select 1 from pg_temp.compatibility_discus_baseline_gate where mode='run') on conflict do nothing;

do $$ begin
  if exists (select 1 from pg_temp.compatibility_discus_baseline_gate where mode='run') then
    if not exists (
      select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id
      where s.catalog_key='sp_0447' and cp.behavior_traits=ARRAY['shoaling','breeding_defense']::text[] and cp.minimum_group_size is not distinct from 5
        and cp.predation_targets=ARRAY[]::text[] and cp.confidence='high' and cp.review_status='reviewed'
        and cp.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[] and cp.deleted_at is null and s.status='published'
    ) then raise exception 'Compatibility discus profile drift: sp_0447'; end if;
    if (
      select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
      from public.species_compatibility_profiles cp
      join public.species s on s.id=cp.species_id
      left join public.species_compatibility_profile_sources l on l.profile_id=cp.id
      left join public.evidence_sources e on e.id=l.source_id
      where s.catalog_key='sp_0447'
    ) <> ARRAY['fishbase-symphysodon-aequifasciatus','seriouslyfish-symphysodon-aequifasciatus']::text[]
    then raise exception 'Compatibility discus profile evidence drift: sp_0447'; end if;
  end if;
end $$;

drop table pg_temp.compatibility_discus_baseline_gate;
