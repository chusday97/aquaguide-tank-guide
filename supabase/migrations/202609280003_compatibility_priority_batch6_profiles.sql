-- Repository-only reviewed Profile ownership for Compatibility priority batch 6.
-- Species: sp_0128, sp_0134, sp_0135, sp_0136.
-- IMPORTANT: source control inclusion does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.
with seed(source_key,title,publisher,url) as (values
 ('seriouslyfish-beaufortia-kweichowensis','Beaufortia kweichowensis (Butterfly Loach)','Seriously Fish','https://www.seriouslyfish.com/species/beaufortia-kweichowensis'),
 ('seriouslyfish-iriatherina-werneri','Iriatherina werneri (Threadfin Rainbowfish)','Seriously Fish','https://www.seriouslyfish.com/species/iriatherina-werneri'),
 ('seriouslyfish-pseudomugil-furcatus','Pseudomugil furcatus (Forktail Blue-eye)','Seriously Fish','https://www.seriouslyfish.com/species/pseudomugil-furcatus'),
 ('seriouslyfish-sphaerichthys-osphromenoides','Sphaerichthys osphromenoides (Chocolate Gourami)','Seriously Fish','https://www.seriouslyfish.com/species/sphaerichthys-osphromenoides')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,'curated_husbandry','reviewed',now() from seed
where not exists(select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists(select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_priority_batch6_gate;
create temporary table compatibility_priority_batch6_gate(mode text not null);
do $$ declare n integer; p integer; begin
 select count(*),count(*) filter(where status='published') into n,p from public.species where catalog_key in ('sp_0128','sp_0134','sp_0135','sp_0136') and deleted_at is null;
 if n=0 then insert into pg_temp.compatibility_priority_batch6_gate values('skip');
 elsif n=4 and p=4 then insert into pg_temp.compatibility_priority_batch6_gate values('run');
 else raise exception 'Compatibility priority batch6 baseline partial: existing %, published %, required 4',n,p;
 end if;
end $$;

with profiles(catalog_key,traits,min_group,targets,required_facts) as (values
 ('sp_0128',ARRAY['shoaling','peaceful','bottom_dwelling']::text[],6,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
 ('sp_0134',ARRAY['shoaling','peaceful']::text[],6,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
 ('sp_0135',ARRAY['shoaling','peaceful']::text[],8,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[]),
 ('sp_0136',ARRAY['peaceful']::text[],6,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior']::text[])
)
insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,p.traits,p.min_group,p.targets,'high','reviewed',now(),p.required_facts from profiles p join public.species s on s.catalog_key=p.catalog_key
where exists(select 1 from pg_temp.compatibility_priority_batch6_gate where mode='run') and s.deleted_at is null and s.status='published'
  and not exists(select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

with links(catalog_key,source_key) as (values
 ('sp_0128','seriouslyfish-beaufortia-kweichowensis'),
 ('sp_0134','seriouslyfish-iriatherina-werneri'),
 ('sp_0135','seriouslyfish-pseudomugil-furcatus'),
 ('sp_0136','seriouslyfish-sphaerichthys-osphromenoides')
)
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from links l join public.species s on s.catalog_key=l.catalog_key join public.species_compatibility_profiles cp on cp.species_id=s.id join public.evidence_sources e on e.source_key=l.source_key
where exists(select 1 from pg_temp.compatibility_priority_batch6_gate where mode='run') on conflict do nothing;

do $$ declare k text; begin
 if exists(select 1 from pg_temp.compatibility_priority_batch6_gate where mode='run') then
  foreach k in array ARRAY['sp_0128','sp_0134','sp_0135','sp_0136'] loop
   if not exists(select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key=k and cp.review_status='reviewed' and cp.deleted_at is null) then raise exception 'Compatibility priority batch6 profile drift: %',k; end if;
  end loop;
  foreach k in array ARRAY['seriouslyfish-beaufortia-kweichowensis','seriouslyfish-iriatherina-werneri','seriouslyfish-pseudomugil-furcatus','seriouslyfish-sphaerichthys-osphromenoides'] loop
   if not exists(select 1 from public.species_compatibility_profile_sources l join public.evidence_sources e on e.id=l.source_id where e.source_key=k) then raise exception 'Compatibility priority batch6 profile evidence drift: %',k; end if;
  end loop;
 end if;
end $$;
drop table pg_temp.compatibility_priority_batch6_gate;
