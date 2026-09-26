-- Repository-only reviewed Profile ownership for Compatibility priority batch 3.
-- Species: sp_0181, sp_0139, sp_0140, sp_0120, sp_0138.
-- IMPORTANT: source control inclusion does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.
with seed(source_key,title,publisher,url) as (values
 ('seriouslyfish-gnathonemus-petersii','Gnathonemus petersii (Elephantnose Fish)','Seriously Fish','https://www.seriouslyfish.com/species/gnathonemus-petersii'),
 ('seriouslyfish-piaractus-brachypomus','Piaractus brachypomus (Red-bellied Pacu)','Seriously Fish','https://www.seriouslyfish.com/species/piaractus-brachypomus'),
 ('seriouslyfish-serrasalmus-rhombeus','Serrasalmus rhombeus (Black Piranha/Rhom)','Seriously Fish','https://www.seriouslyfish.com/species/serrasalmus-rhombeus'),
 ('seriouslyfish-gymnotus-carapo','Gymnotus carapo (Banded Knifefish)','Seriously Fish','https://www.seriouslyfish.com/species/gymnotus-carapo'),
 ('seriouslyfish-leporinus-fasciatus','Leporinus fasciatus (Banded Leporinus)','Seriously Fish','https://www.seriouslyfish.com/species/leporinus-fasciatus')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,'curated_husbandry','reviewed',now() from seed
where not exists(select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists(select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_priority_batch3_gate;
create temporary table compatibility_priority_batch3_gate(mode text not null);
do $$ declare n integer; p integer; begin
 select count(*),count(*) filter(where status='published') into n,p from public.species where catalog_key in ('sp_0181','sp_0139','sp_0140','sp_0120','sp_0138') and deleted_at is null;
 if n=0 then insert into pg_temp.compatibility_priority_batch3_gate values('skip');
 elsif n=5 and p=5 then insert into pg_temp.compatibility_priority_batch3_gate values('run');
 else raise exception 'Compatibility priority batch3 baseline partial: existing %, published %, required 5',n,p;
 end if;
end $$;

with profiles(catalog_key,traits,min_group,targets,required_facts) as (values
 ('sp_0181',ARRAY['peaceful','bottom_dwelling']::text[],null::integer,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
 ('sp_0139',ARRAY['predatory','peaceful']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','predation']::text[]),
 ('sp_0140',ARRAY['predatory','solitary_required','territorial']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','adult_size','social_behavior','territoriality','predation']::text[]),
 ('sp_0120',ARRAY['predatory','bottom_dwelling']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','predation']::text[]),
 ('sp_0138',ARRAY['predatory']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[])
)
insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,p.traits,p.min_group,p.targets,'high','reviewed',now(),p.required_facts from profiles p join public.species s on s.catalog_key=p.catalog_key
where exists(select 1 from pg_temp.compatibility_priority_batch3_gate where mode='run') and s.deleted_at is null and s.status='published'
  and not exists(select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

with links(catalog_key,source_key) as (values
 ('sp_0181','seriouslyfish-gnathonemus-petersii'),('sp_0139','seriouslyfish-piaractus-brachypomus'),('sp_0140','seriouslyfish-serrasalmus-rhombeus'),('sp_0120','seriouslyfish-gymnotus-carapo'),('sp_0138','seriouslyfish-leporinus-fasciatus')
)
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from links l join public.species s on s.catalog_key=l.catalog_key join public.species_compatibility_profiles cp on cp.species_id=s.id join public.evidence_sources e on e.source_key=l.source_key
where exists(select 1 from pg_temp.compatibility_priority_batch3_gate where mode='run') on conflict do nothing;

do $$ declare k text; begin
 if exists(select 1 from pg_temp.compatibility_priority_batch3_gate where mode='run') then
  foreach k in array ARRAY['sp_0181','sp_0139','sp_0140','sp_0120','sp_0138'] loop
   if not exists(select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key=k and cp.review_status='reviewed' and cp.deleted_at is null) then raise exception 'Compatibility priority batch3 profile drift: %',k; end if;
  end loop;
  foreach k in array ARRAY['seriouslyfish-gnathonemus-petersii','seriouslyfish-piaractus-brachypomus','seriouslyfish-serrasalmus-rhombeus','seriouslyfish-gymnotus-carapo','seriouslyfish-leporinus-fasciatus'] loop
   if not exists(select 1 from public.species_compatibility_profile_sources l join public.evidence_sources e on e.id=l.source_id where e.source_key=k) then raise exception 'Compatibility priority batch3 profile evidence drift: %',k; end if;
  end loop;
 end if;
end $$;
drop table pg_temp.compatibility_priority_batch3_gate;
