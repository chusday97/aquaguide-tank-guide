-- Repository-only reviewed Pair Rule ownership: Pterophyllum scalare x Paracheirodon innesi.
-- IMPORTANT: source control inclusion does not authorize applying this migration.
-- DB application / DB authority switch remain on HOLD until separately approved.
with seed(source_key,title,publisher,url,source_type) as (values
 ('seriouslyfish-pterophyllum-scalare','Pterophyllum scalare (Angelfish)','Seriously Fish','https://www.seriouslyfish.com/species/pterophyllum-scalare','curated_husbandry'),
 ('tfh-pterophyllum-scalare-neon-risk','Pterophyllum scalare','Tropical Fish Hobbyist Magazine','https://www.tfhmagazine.com/articles/freshwater/pterophyllum-scalare','curated_husbandry')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists(select 1 from public.evidence_sources e where e.source_key=seed.source_key)
  and not exists(select 1 from public.evidence_sources e where e.url=seed.url and e.deleted_at is null);

drop table if exists pg_temp.compatibility_angelfish_neon_gate;
create temporary table compatibility_angelfish_neon_gate(mode text not null);
do $$ declare n integer; p integer; begin
 select count(*),count(*) filter(where status='published') into n,p from public.species where catalog_key in ('sp_0446','sp_0431') and deleted_at is null;
 if n=0 then insert into pg_temp.compatibility_angelfish_neon_gate values('skip');
 elsif n=2 and p=2 then insert into pg_temp.compatibility_angelfish_neon_gate values('run');
 else raise exception 'Compatibility angelfish/neon baseline partial: existing %, published %, required 2',n,p;
 end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id),greatest(a.id,b.id),'not_recommended','predation_threat',
 '成体神仙鱼会捕食能入口的小鱼；现有 reviewed 资料明确将 Neon Tetra 作为高风险小型同伴，因此不应把该组合当作普通社区混养。',
 ARRAY['不要把成体神仙鱼与红绿灯作为长期同缸组合；优先更换更大、不会入口的室友，或分缸。','不要用“幼鱼阶段暂时和平”或增加躲避物替代捕食风险隔离。']::text[],
 'pair_rule','high','reviewed',now()
from public.species a cross join public.species b
where a.catalog_key='sp_0446' and b.catalog_key='sp_0431'
  and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and exists(select 1 from pg_temp.compatibility_angelfish_neon_gate where mode='run')
  and not exists(select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));

with links(source_key) as (values('seriouslyfish-pterophyllum-scalare'),('tfh-pterophyllum-scalare-neon-risk'))
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr
join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id
cross join links l join public.evidence_sources e on e.source_key=l.source_key
where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0446'
  and exists(select 1 from pg_temp.compatibility_angelfish_neon_gate where mode='run') on conflict do nothing;

do $$ begin
 if exists(select 1 from pg_temp.compatibility_angelfish_neon_gate where mode='run') then
  if not exists(select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0446' and pr.verdict='not_recommended' and pr.risk_type='predation_threat' and pr.basis='pair_rule' and pr.confidence='high' and pr.review_status='reviewed' and pr.deleted_at is null) then raise exception 'Compatibility angelfish/neon pair rule drift'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0446') <> ARRAY['seriouslyfish-pterophyllum-scalare','tfh-pterophyllum-scalare-neon-risk']::text[] then raise exception 'Compatibility angelfish/neon pair evidence drift'; end if;
 end if;
end $$;
drop table pg_temp.compatibility_angelfish_neon_gate;
