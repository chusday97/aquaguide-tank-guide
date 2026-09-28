-- Repository-only reviewed Profile ownership for Compatibility priority batch 4.
-- Species: sp_0105, sp_0117, sp_0018.
-- IMPORTANT: source control inclusion does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.
with seed(source_key,title,publisher,url) as (values
 ('seriouslyfish-polypterus-ornatapinnis','Polypterus ornatipinnis (Ornate Bichir)','Seriously Fish','https://www.seriouslyfish.com/species/polypterus-ornatapinnis'),
 ('seriouslyfish-osteoglossum-bicirrhosum','Osteoglossum bicirrhosum (Silver Arowana)','Seriously Fish','https://www.seriouslyfish.com/species/osteoglossum-bicirrhosum'),
 ('seriouslyfish-pseudotropheus-socolofi','Pseudotropheus socolofi / Chindongo socolofi (Powder Blue Cichlid)','Seriously Fish','https://www.seriouslyfish.com/species/pseudotropheus-socolofi')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,'curated_husbandry','reviewed',now() from seed
where not exists(select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists(select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_priority_batch4_gate;
create temporary table compatibility_priority_batch4_gate(mode text not null);
do $$ declare n integer; p integer; begin
 select count(*),count(*) filter(where status='published') into n,p from public.species where catalog_key in ('sp_0105','sp_0117','sp_0018') and deleted_at is null;
 if n=0 then insert into pg_temp.compatibility_priority_batch4_gate values('skip');
 elsif n=3 and p=3 then insert into pg_temp.compatibility_priority_batch4_gate values('run');
 else raise exception 'Compatibility priority batch4 baseline partial: existing %, published %, required 3',n,p;
 end if;
end $$;

with profiles(catalog_key,traits,min_group,targets,required_facts) as (values
 ('sp_0105',ARRAY['predatory','bottom_dwelling']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
 ('sp_0117',ARRAY['predatory','solitary_required']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','predation']::text[]),
 ('sp_0018',ARRAY['territorial']::text[],null::integer,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','territoriality']::text[])
)
insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,p.traits,p.min_group,p.targets,'high','reviewed',now(),p.required_facts from profiles p join public.species s on s.catalog_key=p.catalog_key
where exists(select 1 from pg_temp.compatibility_priority_batch4_gate where mode='run') and s.deleted_at is null and s.status='published'
  and not exists(select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

with links(catalog_key,source_key) as (values
 ('sp_0105','seriouslyfish-polypterus-ornatapinnis'),
 ('sp_0117','seriouslyfish-osteoglossum-bicirrhosum'),
 ('sp_0018','seriouslyfish-pseudotropheus-socolofi')
)
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from links l join public.species s on s.catalog_key=l.catalog_key join public.species_compatibility_profiles cp on cp.species_id=s.id join public.evidence_sources e on e.source_key=l.source_key
where exists(select 1 from pg_temp.compatibility_priority_batch4_gate where mode='run') on conflict do nothing;

do $$ declare k text; begin
 if exists(select 1 from pg_temp.compatibility_priority_batch4_gate where mode='run') then
  foreach k in array ARRAY['sp_0105','sp_0117','sp_0018'] loop
   if not exists(select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key=k and cp.review_status='reviewed' and cp.deleted_at is null) then raise exception 'Compatibility priority batch4 profile drift: %',k; end if;
  end loop;
  foreach k in array ARRAY['seriouslyfish-polypterus-ornatapinnis','seriouslyfish-osteoglossum-bicirrhosum','seriouslyfish-pseudotropheus-socolofi'] loop
   if not exists(select 1 from public.species_compatibility_profile_sources l join public.evidence_sources e on e.id=l.source_id where e.source_key=k) then raise exception 'Compatibility priority batch4 profile evidence drift: %',k; end if;
  end loop;
 end if;
end $$;
drop table pg_temp.compatibility_priority_batch4_gate;
