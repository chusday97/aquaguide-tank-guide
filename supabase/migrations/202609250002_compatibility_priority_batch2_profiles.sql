-- Repository-only reviewed Profile ownership for Compatibility priority batch 2.
-- Species: sp_0043, sp_0044, sp_0062, sp_0119, sp_0125.
-- IMPORTANT: source control inclusion does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.
with seed(source_key,title,publisher,url) as (values
 ('seriouslyfish-macropodus-ocellatus','Macropodus ocellatus (Roundtail Paradise Fish)','Seriously Fish','https://www.seriouslyfish.com/species/macropodus-ocellatus'),
 ('seriouslyfish-macropodus-spechti','Macropodus spechti (Black Paradise Fish)','Seriously Fish','https://www.seriouslyfish.com/species/macropodus-spechti/'),
 ('seriouslyfish-moenkhausia-sanctaefilomenae','Moenkhausia sanctaefilomenae (Red-eye Tetra)','Seriously Fish','https://www.seriouslyfish.com/species/moenkhausia-sanctaefilomenae'),
 ('seriouslyfish-pantodon-buchholzi','Pantodon buchholzi (African Butterfly Fish)','Seriously Fish','https://www.seriouslyfish.com/species/pantodon-buchholzi'),
 ('seriouslyfish-hypancistrus-inspector','Hypancistrus inspector (L102 Snowball Pleco)','Seriously Fish','https://www.seriouslyfish.com/species/hypancistrus-inspector')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,'curated_husbandry','reviewed',now() from seed
where not exists(select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists(select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_priority_batch2_gate;
create temporary table compatibility_priority_batch2_gate(mode text not null);
do $$ declare n integer; p integer; begin
 select count(*),count(*) filter(where status='published') into n,p from public.species where catalog_key in ('sp_0043','sp_0044','sp_0062','sp_0119','sp_0125') and deleted_at is null;
 if n=0 then insert into pg_temp.compatibility_priority_batch2_gate values('skip');
 elsif n=5 and p=5 then insert into pg_temp.compatibility_priority_batch2_gate values('run');
 else raise exception 'Compatibility priority batch2 baseline partial: existing %, published %, required 5',n,p;
 end if;
end $$;

with profiles(catalog_key,traits,min_group,targets,required_facts) as (values
 ('sp_0043',ARRAY['breeding_defense']::text[],null::integer,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]),
 ('sp_0044',ARRAY['breeding_defense']::text[],null::integer,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]),
 ('sp_0062',ARRAY['shoaling','fin_nipping']::text[],6,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior']::text[]),
 ('sp_0119',ARRAY['predatory']::text[],null::integer,ARRAY['small_fish']::text[],ARRAY['water','temperature','ph','adult_size','predation']::text[]),
 ('sp_0125',ARRAY['peaceful','bottom_dwelling']::text[],null::integer,ARRAY[]::text[],ARRAY['water','temperature','ph','adult_size','social_behavior']::text[])
)
insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,p.traits,p.min_group,p.targets,'high','reviewed',now(),p.required_facts
from profiles p join public.species s on s.catalog_key=p.catalog_key
where exists(select 1 from pg_temp.compatibility_priority_batch2_gate where mode='run') and s.deleted_at is null and s.status='published'
  and not exists(select 1 from public.species_compatibility_profiles cp where cp.species_id=s.id);

with links(catalog_key,source_key) as (values
 ('sp_0043','seriouslyfish-macropodus-ocellatus'),('sp_0044','seriouslyfish-macropodus-spechti'),
 ('sp_0062','seriouslyfish-moenkhausia-sanctaefilomenae'),('sp_0119','seriouslyfish-pantodon-buchholzi'),
 ('sp_0125','seriouslyfish-hypancistrus-inspector')
)
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select cp.id,e.id from links l join public.species s on s.catalog_key=l.catalog_key join public.species_compatibility_profiles cp on cp.species_id=s.id join public.evidence_sources e on e.source_key=l.source_key
where exists(select 1 from pg_temp.compatibility_priority_batch2_gate where mode='run') on conflict do nothing;

do $$ declare k text; begin
 if exists(select 1 from pg_temp.compatibility_priority_batch2_gate where mode='run') then
  foreach k in array ARRAY['sp_0043','sp_0044','sp_0062','sp_0119','sp_0125'] loop
   if not exists(select 1 from public.species_compatibility_profiles cp join public.species s on s.id=cp.species_id where s.catalog_key=k and cp.review_status='reviewed' and cp.deleted_at is null) then raise exception 'Compatibility priority batch2 profile drift: %',k; end if;
  end loop;
  foreach k in array ARRAY['seriouslyfish-macropodus-ocellatus','seriouslyfish-macropodus-spechti','seriouslyfish-moenkhausia-sanctaefilomenae','seriouslyfish-pantodon-buchholzi','seriouslyfish-hypancistrus-inspector'] loop
   if not exists(select 1 from public.species_compatibility_profile_sources l join public.evidence_sources e on e.id=l.source_id where e.source_key=k) then raise exception 'Compatibility priority batch2 profile evidence drift: %',k; end if;
  end loop;
 end if;
end $$;
drop table pg_temp.compatibility_priority_batch2_gate;
