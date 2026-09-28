-- Repository-only reviewed Profile ownership for Gold Ram (sp_0016) and Rhodeus ocellatus (sp_0475).
-- IMPORTANT: inclusion in source control does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.

with seed(source_key,title,publisher,url,source_type) as (values
  ('seriouslyfish-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi (Ram)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi', 'curated_husbandry'),
  ('fishbase-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi species summary', 'FishBase', 'https://www.fishbase.se/summary/12305', 'curated_husbandry'),
  ('batch03-fishbase-rhodeus-ocellatus', 'Rhodeus ocellatus species summary', 'FishBase', 'https://www.fishbase.se/summary/Rhodeus-ocellatus.html', 'professional_association'),
  ('jstage-rhodeus-ocellatus-schooling', 'Characteristics of Schooling Behavior by the Group Size of Rose Bitterling in the Experimental Water Tank', 'Nippon Suisan Gakkaishi / J-STAGE', 'https://doi.org/10.2331/suisan.51.1977', 'peer_reviewed')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

do $$ begin
  if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-mikrogeophagus-ramirezi' and title='Mikrogeophagus ramirezi (Ram)' and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility gold-ram/rhodeus evidence source drift: seriouslyfish-mikrogeophagus-ramirezi'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-mikrogeophagus-ramirezi' and title='Mikrogeophagus ramirezi species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/12305' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility gold-ram/rhodeus evidence source drift: fishbase-mikrogeophagus-ramirezi'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='batch03-fishbase-rhodeus-ocellatus' and title='Rhodeus ocellatus species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Rhodeus-ocellatus.html' and source_type='professional_association' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility gold-ram/rhodeus evidence source drift: batch03-fishbase-rhodeus-ocellatus'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='jstage-rhodeus-ocellatus-schooling' and title='Characteristics of Schooling Behavior by the Group Size of Rose Bitterling in the Experimental Water Tank' and publisher='Nippon Suisan Gakkaishi / J-STAGE' and url='https://doi.org/10.2331/suisan.51.1977' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility gold-ram/rhodeus evidence source drift: jstage-rhodeus-ocellatus-schooling'; end if;
end $$;

drop table if exists pg_temp.compatibility_gold_ram_rhodeus_gate;
create temporary table compatibility_gold_ram_rhodeus_gate (mode text not null);

do $$
declare existing_count integer; published_count integer;
begin
  select count(*), count(*) filter (where status='published')
  into existing_count,published_count
  from public.species
  where catalog_key in ('sp_0016','sp_0475') and deleted_at is null;

  if existing_count=0 then
    insert into pg_temp.compatibility_gold_ram_rhodeus_gate(mode) values ('skip');
    raise notice 'Compatibility gold-ram/rhodeus baseline absent; skipping reviewed Profile extension.';
  elsif existing_count=2 and published_count=2 then
    insert into pg_temp.compatibility_gold_ram_rhodeus_gate(mode) values ('run');
  else
    raise exception 'Compatibility gold-ram/rhodeus baseline is partial or not fully published: existing %, published %, required 2', existing_count,published_count;
  end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id, ARRAY['peaceful','breeding_defense']::text[], null, ARRAY[]::text[], 'high', 'reviewed', now(), ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]
from public.species s
where s.catalog_key='sp_0016'
  and exists (select 1 from pg_temp.compatibility_gold_ram_rhodeus_gate where mode='run')
  and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s on s.id=p.species_id
join public.evidence_sources e on e.source_key in ('seriouslyfish-mikrogeophagus-ramirezi','fishbase-mikrogeophagus-ramirezi')
where s.catalog_key='sp_0016'
  and exists (select 1 from pg_temp.compatibility_gold_ram_rhodeus_gate where mode='run')
on conflict do nothing;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id, ARRAY['schooling']::text[], 3, ARRAY[]::text[], 'medium', 'reviewed', now(), ARRAY['water','temperature','adult_size','social_behavior']::text[]
from public.species s
where s.catalog_key='sp_0475'
  and exists (select 1 from pg_temp.compatibility_gold_ram_rhodeus_gate where mode='run')
  and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from public.species_compatibility_profiles p
join public.species s on s.id=p.species_id
join public.evidence_sources e on e.source_key in ('batch03-fishbase-rhodeus-ocellatus','jstage-rhodeus-ocellatus-schooling')
where s.catalog_key='sp_0475'
  and exists (select 1 from pg_temp.compatibility_gold_ram_rhodeus_gate where mode='run')
on conflict do nothing;

do $$ begin
  if exists (select 1 from pg_temp.compatibility_gold_ram_rhodeus_gate where mode='run') then
    if not exists (
      select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id
      where s.catalog_key='sp_0016'
        and p.behavior_traits=ARRAY['peaceful','breeding_defense']::text[]
        and p.minimum_group_size is not distinct from null
        and p.predation_targets=ARRAY[]::text[]
        and p.confidence='high'
        and p.review_status='reviewed'
        and p.required_facts=ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[]
        and p.deleted_at is null and s.status='published'
    ) then raise exception 'Compatibility gold-ram/rhodeus profile drift: sp_0016'; end if;

    if not exists (
      select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id
      where s.catalog_key='sp_0475'
        and p.behavior_traits=ARRAY['schooling']::text[]
        and p.minimum_group_size is not distinct from 3
        and p.predation_targets=ARRAY[]::text[]
        and p.confidence='medium'
        and p.review_status='reviewed'
        and p.required_facts=ARRAY['water','temperature','adult_size','social_behavior']::text[]
        and p.deleted_at is null and s.status='published'
    ) then raise exception 'Compatibility gold-ram/rhodeus profile drift: sp_0475'; end if;

    if (
      select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
      from public.species_compatibility_profiles p
      join public.species s on s.id=p.species_id
      left join public.species_compatibility_profile_sources l on l.profile_id=p.id
      left join public.evidence_sources e on e.id=l.source_id
      where s.catalog_key='sp_0016'
    ) <> ARRAY['fishbase-mikrogeophagus-ramirezi','seriouslyfish-mikrogeophagus-ramirezi']::text[]
    then raise exception 'Compatibility gold-ram/rhodeus profile evidence drift: sp_0016'; end if;

    if (
      select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[])
      from public.species_compatibility_profiles p
      join public.species s on s.id=p.species_id
      left join public.species_compatibility_profile_sources l on l.profile_id=p.id
      left join public.evidence_sources e on e.id=l.source_id
      where s.catalog_key='sp_0475'
    ) <> ARRAY['batch03-fishbase-rhodeus-ocellatus','jstage-rhodeus-ocellatus-schooling']::text[]
    then raise exception 'Compatibility gold-ram/rhodeus profile evidence drift: sp_0475'; end if;
  end if;
end $$;

drop table pg_temp.compatibility_gold_ram_rhodeus_gate;
