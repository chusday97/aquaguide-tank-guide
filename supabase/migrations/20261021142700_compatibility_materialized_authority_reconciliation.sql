begin;

do $$ begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 131 then raise exception 'ABORT: expected 131 reviewed Compatibility profiles'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then raise exception 'ABORT: expected 21 reviewed pair rules'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then raise exception 'ABORT: expected 1 reviewed stage risk'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 279 then raise exception 'ABORT: expected 279 reviewed evidence sources'; end if;
  if (select count(*) from public.species where catalog_key = any(ARRAY['sp_0171','sp_0196','sp_0289','sp_0290','sp_0291','sp_0363']::text[]) and deleted_at is null) <> 6 then raise exception 'ABORT: expected six materialized-authority species'; end if;
  if exists (
    select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id
    where s.catalog_key = any(ARRAY['sp_0171','sp_0196','sp_0289','sp_0290','sp_0291','sp_0363']::text[]) and p.review_status='reviewed' and p.deleted_at is null
  ) then raise exception 'ABORT: materialized-authority target profile already active'; end if;
  if (select count(*) from public.evidence_sources where source_key = any(ARRAY['baqua-channa-diplogramma-tank-minimum','fishipedia-channa-diplogramma-tank-minimum']::text[]) and review_status='reviewed' and deleted_at is null) <> 2 then raise exception 'ABORT: expected two stale reviewed evidence sources'; end if;
  if exists (
    select 1 from public.evidence_sources e
    where e.source_key = any(ARRAY['baqua-channa-diplogramma-tank-minimum','fishipedia-channa-diplogramma-tank-minimum']::text[])
      and (
        exists(select 1 from public.species_compatibility_profile_sources l where l.source_id=e.id)
        or exists(select 1 from public.species_pair_compatibility_rule_sources l where l.source_id=e.id)
        or exists(select 1 from public.species_compatibility_profile_stage_risk_sources l where l.source_id=e.id)
        or exists(select 1 from public.care_article_reference_links l where l.source_id=e.id and l.deleted_at is null)
      )
  ) then raise exception 'ABORT: stale evidence source is still referenced'; end if;
end $$;

create temporary table _materialized_delta_evidence(
  source_key text primary key,
  title text not null,
  publisher text not null,
  url text not null,
  source_type text not null
) on commit drop;

insert into _materialized_delta_evidence(source_key,title,publisher,url,source_type) values
('phase2-15-fda-glofish-danio-risk-reviewed-igas','Intentional Genomic Alterations (IGAs) in Animals: Risk-Reviewed IGAs','U.S. Food and Drug Administration','https://www.fda.gov/animal-veterinary/intentional-genomic-alterations-igas-animals/intentional-genomic-alterations-igas-animals-risk-reviewed-igas','government'),
('phase2-15-glofish-zebra-danio-single-color-collection','GloFish Zebra Danio Single Color Set','GloFish','https://shop.glofish.com/products/danio-single-color-collection','curated_husbandry'),
('phase2-21-quality-marine-golden-roseline','The Golden Roseline','Quality Marine','https://www.qualitymarine.com/news/the-golden-roseline/','curated_husbandry'),
('phase2-21-seriouslyfish-tanichthys-albonubes-color-strains','Tanichthys albonubes (White Cloud Mountain Minnow)','Seriously Fish','https://www.seriouslyfish.com/species/tanichthys-albonubes/','curated_husbandry');

insert into public.evidence_sources as e(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now()
from _materialized_delta_evidence
on conflict (source_key) do update set
  title=excluded.title,
  publisher=excluded.publisher,
  url=excluded.url,
  source_type=excluded.source_type,
  review_status='reviewed',
  reviewed_at=case when e.review_status is distinct from 'reviewed' or e.deleted_at is not null then now() else e.reviewed_at end,
  deleted_at=null,
  updated_at=now(),
  version=e.version+1
where e.title is distinct from excluded.title
   or e.publisher is distinct from excluded.publisher
   or e.url is distinct from excluded.url
   or e.source_type is distinct from excluded.source_type
   or e.review_status is distinct from 'reviewed'
   or e.deleted_at is not null;

update public.evidence_sources
set deleted_at=now(), updated_at=now(), version=version+1
where source_key = any(ARRAY['baqua-channa-diplogramma-tank-minimum','fishipedia-channa-diplogramma-tank-minimum']::text[])
  and review_status='reviewed'
  and deleted_at is null;

create temporary table _materialized_delta_profiles(
  catalog_key text primary key,
  behavior_traits text[] not null,
  minimum_group_size integer,
  predation_targets text[] not null,
  confidence text not null,
  required_facts text[] not null
) on commit drop;

insert into _materialized_delta_profiles(catalog_key,behavior_traits,minimum_group_size,predation_targets,confidence,required_facts) values
('sp_0171',ARRAY['shoaling']::text[],5,'{}'::text[],'medium',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0196',ARRAY['shoaling','peaceful']::text[],6,'{}'::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0289',ARRAY['shoaling']::text[],8,'{}'::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0290',ARRAY['shoaling']::text[],8,'{}'::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0291',ARRAY['shoaling']::text[],8,'{}'::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]),
('sp_0363',ARRAY['shoaling']::text[],8,'{}'::text[],'high',ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]);

insert into public.species_compatibility_profiles as p(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts
from _materialized_delta_profiles x
join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null
on conflict (species_id) do update set
  behavior_traits=excluded.behavior_traits,
  minimum_group_size=excluded.minimum_group_size,
  predation_targets=excluded.predation_targets,
  confidence=excluded.confidence,
  review_status='reviewed',
  reviewed_at=now(),
  required_facts=excluded.required_facts,
  deleted_at=null,
  updated_at=now(),
  version=p.version+1
where p.behavior_traits is distinct from excluded.behavior_traits
   or p.minimum_group_size is distinct from excluded.minimum_group_size
   or p.predation_targets is distinct from excluded.predation_targets
   or p.confidence is distinct from excluded.confidence
   or p.required_facts is distinct from excluded.required_facts
   or p.review_status is distinct from 'reviewed'
   or p.deleted_at is not null;

create temporary table _materialized_delta_profile_sources(
  catalog_key text not null,
  source_key text not null,
  primary key(catalog_key,source_key)
) on commit drop;

insert into _materialized_delta_profile_sources(catalog_key,source_key) values
('sp_0171','phase2-21-seriouslyfish-tanichthys-albonubes-color-strains'),
('sp_0171','fishbase-tanichthys-albonubes'),
('sp_0171','white-cloud-shoaling-study'),
('sp_0196','phase2-21-quality-marine-golden-roseline'),
('sp_0196','seriouslyfish-sahyadria-denisonii'),
('sp_0196','fishbase-sahyadria-denisonii'),
('sp_0289','phase2-15-fda-glofish-danio-risk-reviewed-igas'),
('sp_0289','phase2-15-glofish-zebra-danio-single-color-collection'),
('sp_0289','seriouslyfish-danio-rerio'),
('sp_0290','phase2-15-fda-glofish-danio-risk-reviewed-igas'),
('sp_0290','phase2-15-glofish-zebra-danio-single-color-collection'),
('sp_0290','seriouslyfish-danio-rerio'),
('sp_0291','phase2-15-fda-glofish-danio-risk-reviewed-igas'),
('sp_0291','phase2-15-glofish-zebra-danio-single-color-collection'),
('sp_0291','seriouslyfish-danio-rerio'),
('sp_0363','phase2-15-fda-glofish-danio-risk-reviewed-igas'),
('sp_0363','phase2-15-glofish-zebra-danio-single-color-collection'),
('sp_0363','seriouslyfish-danio-rerio');

delete from public.species_compatibility_profile_sources l
using public.species_compatibility_profiles p, public.species s, public.evidence_sources e
where l.profile_id=p.id
  and p.species_id=s.id
  and l.source_id=e.id
  and s.catalog_key = any(ARRAY['sp_0171','sp_0196','sp_0289','sp_0290','sp_0291','sp_0363']::text[])
  and not exists (
    select 1 from _materialized_delta_profile_sources x
    where x.catalog_key=s.catalog_key and x.source_key=e.source_key
  );

insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id
from _materialized_delta_profile_sources x
join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
on conflict do nothing;

do $$ begin
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 137 then raise exception 'POSTCHECK: expected 137 reviewed Compatibility profiles'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> 21 then raise exception 'POSTCHECK: pair rule count changed'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> 1 then raise exception 'POSTCHECK: stage risk count changed'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 281 then raise exception 'POSTCHECK: expected 281 reviewed evidence sources'; end if;
  if exists (
    select 1 from _materialized_delta_evidence x
    left join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
    where e.id is null or e.title is distinct from x.title or e.publisher is distinct from x.publisher or e.url is distinct from x.url or e.source_type is distinct from x.source_type
  ) then raise exception 'POSTCHECK: delta evidence authority drift'; end if;
  if exists (
    select 1 from _materialized_delta_profiles x
    join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null
    left join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    where p.id is null
       or p.behavior_traits is distinct from x.behavior_traits
       or p.minimum_group_size is distinct from x.minimum_group_size
       or p.predation_targets is distinct from x.predation_targets
       or p.confidence is distinct from x.confidence
       or p.required_facts is distinct from x.required_facts
  ) then raise exception 'POSTCHECK: delta profile authority drift'; end if;
  if exists (
    select 1 from _materialized_delta_profile_sources x
    join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null
    join public.species_compatibility_profiles p on p.species_id=s.id and p.review_status='reviewed' and p.deleted_at is null
    join public.evidence_sources e on e.source_key=x.source_key and e.review_status='reviewed' and e.deleted_at is null
    left join public.species_compatibility_profile_sources l on l.profile_id=p.id and l.source_id=e.id
    where l.profile_id is null
  ) then raise exception 'POSTCHECK: expected delta profile evidence link missing'; end if;
  if exists (
    select 1 from public.species_compatibility_profile_sources l
    join public.species_compatibility_profiles p on p.id=l.profile_id and p.review_status='reviewed' and p.deleted_at is null
    join public.species s on s.id=p.species_id
    join public.evidence_sources e on e.id=l.source_id
    where s.catalog_key = any(ARRAY['sp_0171','sp_0196','sp_0289','sp_0290','sp_0291','sp_0363']::text[])
      and not exists (
        select 1 from _materialized_delta_profile_sources x where x.catalog_key=s.catalog_key and x.source_key=e.source_key
      )
  ) then raise exception 'POSTCHECK: unexpected delta profile evidence link'; end if;
  if exists (
    select 1 from public.evidence_sources e
    where e.source_key = any(ARRAY['baqua-channa-diplogramma-tank-minimum','fishipedia-channa-diplogramma-tank-minimum']::text[]) and e.deleted_at is null
  ) then raise exception 'POSTCHECK: stale evidence remained active'; end if;
end $$;

commit;
