-- Additive database owner for reviewed runtime Compatibility authority added after 202609160001.
-- Generated from getCompatibilityEvidenceAudit(): exact missing 2 Profiles + 16 Pair Rules.
begin;

update public.evidence_sources
set url='https://www.seriouslyfish.com/species/hemigrammus-rhodostomus',updated_at=now()
where source_key='seriouslyfish-petitella-rhodostoma'
 and url='https://www.seriouslyfish.com/species/hemigrammus-rhodostoma'
 and review_status='reviewed' and deleted_at is null;
do $$ begin
 if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-petitella-rhodostoma'
  and title='Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)'
  and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/hemigrammus-rhodostomus'
  and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null)
 then raise exception 'Compatibility runtime reconciliation Rummy source drift'; end if;
end $$;

create temporary table compatibility_runtime_expected_sources(source_key text primary key,title text,publisher text,url text,source_type text);
insert into compatibility_runtime_expected_sources values ('batch03-fishbase-rhodeus-ocellatus','Rhodeus ocellatus species summary','FishBase','https://www.fishbase.se/summary/Rhodeus-ocellatus.html','professional_association'),
 ('fishbase-mikrogeophagus-ramirezi','Mikrogeophagus ramirezi species summary','FishBase','https://www.fishbase.se/summary/12305','curated_husbandry'),
 ('jstage-rhodeus-ocellatus-schooling','Characteristics of Schooling Behavior by the Group Size of Rose Bitterling in the Experimental Water Tank','Nippon Suisan Gakkaishi / J-STAGE','https://doi.org/10.2331/suisan.51.1977','peer_reviewed'),
 ('northern-snakehead-fws-erss-2024','Ecological Risk Screening Summary - Northern Snakehead (Channa argus) - High Risk','U.S. Fish and Wildlife Service','https://www.fws.gov/media/ecological-risk-screening-summary-northern-snakehead-channa-argus-high-risk','government'),
 ('northern-snakehead-usgs-diet-2012','Diet of non-native northern snakehead (Channa argus) compared to three co-occurring predators in the lower Potomac River, USA','U.S. Geological Survey / Ecology of Freshwater Fish','https://pubs.usgs.gov/publication/70168483','peer_reviewed'),
 ('seriouslyfish-mikrogeophagus-ramirezi','Mikrogeophagus ramirezi (Ram)','Seriously Fish','https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi','curated_husbandry');
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select x.source_key,x.title,x.publisher,x.url,x.source_type,'reviewed',now()
from compatibility_runtime_expected_sources x
where not exists (select 1 from public.evidence_sources e where e.source_key=x.source_key and e.deleted_at is null)
 and not exists (select 1 from public.evidence_sources e where e.url=x.url and e.deleted_at is null);
do $$ begin
 if exists (select 1 from compatibility_runtime_expected_sources x left join public.evidence_sources e
  on e.source_key=x.source_key and e.deleted_at is null
  where e.id is null or e.title is distinct from x.title or e.publisher is distinct from x.publisher
   or e.url is distinct from x.url or e.source_type is distinct from x.source_type or e.review_status is distinct from 'reviewed')
 then raise exception 'Compatibility runtime reconciliation evidence source drift'; end if;
end $$;

create temporary table compatibility_runtime_expected_profiles(
 catalog_key text primary key,behavior_traits text[],minimum_group_size integer,predation_targets text[],
 confidence text,required_facts text[],stocking_guidance jsonb);
insert into compatibility_runtime_expected_profiles values ('sp_0016',ARRAY['peaceful','breeding_defense']::text[],null,ARRAY[]::text[],'high',ARRAY['water','temperature','ph','adult_size','social_behavior','breeding_behavior']::text[],null),
 ('sp_0475',ARRAY['schooling']::text[],3,ARRAY[]::text[],'medium',ARRAY['water','temperature','adult_size','social_behavior']::text[],null);
insert into public.species_compatibility_profiles(
 species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at,required_facts,stocking_guidance)
select s.id,x.behavior_traits,x.minimum_group_size,x.predation_targets,x.confidence,'reviewed',now(),x.required_facts,x.stocking_guidance
from compatibility_runtime_expected_profiles x join public.species s
 on s.catalog_key=x.catalog_key and s.deleted_at is null and s.status='published'
where not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id and p.deleted_at is null);

create temporary table compatibility_runtime_expected_profile_sources(catalog_key text,source_key text,primary key(catalog_key,source_key));
insert into compatibility_runtime_expected_profile_sources values ('sp_0016','seriouslyfish-mikrogeophagus-ramirezi'),
 ('sp_0016','fishbase-mikrogeophagus-ramirezi'),
 ('sp_0475','batch03-fishbase-rhodeus-ocellatus'),
 ('sp_0475','jstage-rhodeus-ocellatus-schooling');
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from compatibility_runtime_expected_profile_sources x
join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null
join public.species_compatibility_profiles p on p.species_id=s.id and p.deleted_at is null
join public.evidence_sources e on e.source_key=x.source_key and e.deleted_at is null on conflict do nothing;
do $$ begin
 if exists (select 1 from compatibility_runtime_expected_profiles x
  left join public.species s on s.catalog_key=x.catalog_key and s.deleted_at is null and s.status='published'
  left join public.species_compatibility_profiles p on p.species_id=s.id and p.deleted_at is null
  where p.id is null or p.behavior_traits is distinct from x.behavior_traits
   or p.minimum_group_size is distinct from x.minimum_group_size or p.predation_targets is distinct from x.predation_targets
   or p.confidence is distinct from x.confidence or p.required_facts is distinct from x.required_facts
   or p.stocking_guidance is distinct from x.stocking_guidance or p.review_status is distinct from 'reviewed')
 then raise exception 'Compatibility runtime reconciliation profile drift'; end if;
 if exists (select catalog_key,source_key from compatibility_runtime_expected_profile_sources except
  select s.catalog_key,e.source_key from public.species_compatibility_profiles p join public.species s on s.id=p.species_id
  join public.species_compatibility_profile_sources l on l.profile_id=p.id join public.evidence_sources e on e.id=l.source_id
  where s.catalog_key in (select catalog_key from compatibility_runtime_expected_profiles))
 or exists (select s.catalog_key,e.source_key from public.species_compatibility_profiles p join public.species s on s.id=p.species_id
  join public.species_compatibility_profile_sources l on l.profile_id=p.id join public.evidence_sources e on e.id=l.source_id
  where s.catalog_key in (select catalog_key from compatibility_runtime_expected_profiles) except
  select catalog_key,source_key from compatibility_runtime_expected_profile_sources)
 then raise exception 'Compatibility runtime reconciliation profile source drift'; end if;
end $$;

create temporary table compatibility_runtime_expected_pairs(
 catalog_key_a text,catalog_key_b text,verdict text,risk_type text,reason text,mitigation text[],basis text,confidence text,
 primary key(catalog_key_a,catalog_key_b));
insert into compatibility_runtime_expected_pairs values ('sp_0001','sp_0224','not_recommended','predation_threat','黑壳虾/极火虾对象均有 reviewed Neocaridina davidi 身份与约 4 cm 最大体长 authority。USGS Channa argus 物种资料记录成体猎物包括 crayfish，并指出成体剩余非鱼类食物中包含 crustaceans；风险评估也把 surface-dwelling crayfish and shrimp 列为可能受影响的甲壳类。对 4 cm 级淡水虾，存在足够的捕食威胁，不应作为长期同缸安全组合。',ARRAY['不要把白金雷龙与该小型淡水虾作为长期同缸组合；优先物理分缸。','不要把水草躲避物或短期未捕食理解为风险已消失。']::text[],'rule_inference','medium'),
 ('sp_0010','sp_0224','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0011','sp_0224','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0012','sp_0224','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0013','sp_0224','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0021','sp_0224','not_recommended','predation_threat','迷你鹦鹉鱼 catalog object 的商业品系 taxon 仍未完全解析，但对象级最大体长约 10 cm 已审核通过。USGS 记录成体 Channa argus 可捕食达到自身约 33% 体长的鱼；10 cm 级鱼明显落在白金雷龙 reviewed 最大约 100 cm 所对应的捕食尺寸窗口内。该结论只依赖“鱼类 + reviewed 对象级体型”，不把基础种行为自动提升为该商业品系。',ARRAY['不要把白金雷龙与迷你鹦鹉鱼作为长期同缸组合；优先物理分缸。','不要用商业品系身份尚未完全解析来反推捕食风险不存在。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0431','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0434','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0435','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0436','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0437','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0438','not_recommended','predation_threat','白金雷龙对象已审核到 Channa argus Platinum，最大体长约 100 cm；红剑鱼 reviewed 最大体长约 14 cm。USGS 物种资料记录成体 Channa argus 可捕食达到自身约 33% 体长的鱼，因此 14 cm 红剑鱼明显落在已记录捕食尺寸窗口内。该结论是物种捕食生态 + reviewed 体型的规则推断。',ARRAY['不要把白金雷龙与红剑鱼作为长期同缸组合；优先物理分缸。','不要把幼体阶段暂时体型接近理解为成年后仍安全。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0439','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0443','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0459','not_recommended','predation_threat','黑壳虾/极火虾对象均有 reviewed Neocaridina davidi 身份与约 4 cm 最大体长 authority。USGS Channa argus 物种资料记录成体猎物包括 crayfish，并指出成体剩余非鱼类食物中包含 crustaceans；风险评估也把 surface-dwelling crayfish and shrimp 列为可能受影响的甲壳类。对 4 cm 级淡水虾，存在足够的捕食威胁，不应作为长期同缸安全组合。',ARRAY['不要把白金雷龙与该小型淡水虾作为长期同缸组合；优先物理分缸。','不要把水草躲避物或短期未捕食理解为风险已消失。']::text[],'rule_inference','medium'),
 ('sp_0224','sp_0468','not_recommended','predation_threat','白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',ARRAY['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。','不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。']::text[],'rule_inference','medium');
insert into public.species_pair_compatibility_rules(
 species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select case when a.id<b.id then a.id else b.id end,case when a.id<b.id then b.id else a.id end,
 x.verdict,x.risk_type,x.reason,x.mitigation,x.basis,x.confidence,'reviewed',now()
from compatibility_runtime_expected_pairs x
join public.species a on a.catalog_key=x.catalog_key_a and a.deleted_at is null and a.status='published'
join public.species b on b.catalog_key=x.catalog_key_b and b.deleted_at is null and b.status='published'
where not exists (select 1 from public.species_pair_compatibility_rules r where r.deleted_at is null
 and ((r.species_a_id=a.id and r.species_b_id=b.id) or (r.species_a_id=b.id and r.species_b_id=a.id)));

create temporary table compatibility_runtime_expected_pair_sources(catalog_key_a text,catalog_key_b text,source_key text,primary key(catalog_key_a,catalog_key_b,source_key));
insert into compatibility_runtime_expected_pair_sources values ('sp_0001','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0001','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0010','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0010','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0011','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0011','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0012','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0012','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0013','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0013','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0021','sp_0224','northern-snakehead-fws-erss-2024'),
 ('sp_0021','sp_0224','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0431','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0431','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0434','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0434','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0435','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0435','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0436','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0436','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0437','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0437','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0438','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0438','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0439','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0439','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0443','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0443','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0459','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0459','northern-snakehead-usgs-diet-2012'),
 ('sp_0224','sp_0468','northern-snakehead-fws-erss-2024'),
 ('sp_0224','sp_0468','northern-snakehead-usgs-diet-2012');
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select r.id,e.id from compatibility_runtime_expected_pair_sources x
join public.species a on a.catalog_key=x.catalog_key_a and a.deleted_at is null
join public.species b on b.catalog_key=x.catalog_key_b and b.deleted_at is null
join public.species_pair_compatibility_rules r on r.deleted_at is null
 and ((r.species_a_id=a.id and r.species_b_id=b.id) or (r.species_a_id=b.id and r.species_b_id=a.id))
join public.evidence_sources e on e.source_key=x.source_key and e.deleted_at is null on conflict do nothing;
do $$ begin
 if exists (select 1 from compatibility_runtime_expected_pairs x
  left join public.species a on a.catalog_key=x.catalog_key_a and a.deleted_at is null and a.status='published'
  left join public.species b on b.catalog_key=x.catalog_key_b and b.deleted_at is null and b.status='published'
  left join public.species_pair_compatibility_rules r on r.deleted_at is null
   and ((r.species_a_id=a.id and r.species_b_id=b.id) or (r.species_a_id=b.id and r.species_b_id=a.id))
  where r.id is null or r.verdict is distinct from x.verdict or r.risk_type is distinct from x.risk_type
   or r.reason is distinct from x.reason or r.mitigation is distinct from x.mitigation or r.basis is distinct from x.basis
   or r.confidence is distinct from x.confidence or r.review_status is distinct from 'reviewed')
 then raise exception 'Compatibility runtime reconciliation pair rule drift'; end if;
 if exists (select catalog_key_a,catalog_key_b,source_key from compatibility_runtime_expected_pair_sources except
  select least(a.catalog_key,b.catalog_key),greatest(a.catalog_key,b.catalog_key),e.source_key
  from public.species_pair_compatibility_rules r join public.species a on a.id=r.species_a_id join public.species b on b.id=r.species_b_id
  join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=r.id join public.evidence_sources e on e.id=l.source_id
  where least(a.catalog_key,b.catalog_key)||'__'||greatest(a.catalog_key,b.catalog_key)
   in (select catalog_key_a||'__'||catalog_key_b from compatibility_runtime_expected_pairs))
 or exists (select least(a.catalog_key,b.catalog_key),greatest(a.catalog_key,b.catalog_key),e.source_key
  from public.species_pair_compatibility_rules r join public.species a on a.id=r.species_a_id join public.species b on b.id=r.species_b_id
  join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=r.id join public.evidence_sources e on e.id=l.source_id
  where least(a.catalog_key,b.catalog_key)||'__'||greatest(a.catalog_key,b.catalog_key)
   in (select catalog_key_a||'__'||catalog_key_b from compatibility_runtime_expected_pairs) except
  select catalog_key_a,catalog_key_b,source_key from compatibility_runtime_expected_pair_sources)
 then raise exception 'Compatibility runtime reconciliation pair source drift'; end if;
end $$;

commit;
