-- Canonicalize the existing code-reviewed Compatibility baseline before versioned DB publish.
-- Fail closed on any pre-existing DB drift; this migration is intentionally not an auto-accept of divergent reviewed rows.

alter table public.evidence_sources add column if not exists source_key text;
create unique index if not exists evidence_sources_source_key_uidx on public.evidence_sources(source_key);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'evidence_sources_source_key_format') then
    alter table public.evidence_sources add constraint evidence_sources_source_key_format
      check (source_key is null or source_key ~ '^[a-z0-9][a-z0-9._-]{1,199}$');
  end if;
end $$;
with seed(source_key,title,publisher,url,source_type) as (values
  ('channa-rhodeus-information-dynamics-study', 'Information Dynamics in the Interaction between a Prey and a Predator Fish', 'Entropy', 'https://doi.org/10.3390/e17107230', 'peer_reviewed'),
  ('channa-rhodeus-predation-stress-study', 'Effects of predation stress and sex on growth, metabolism, personality traits, and reproductive investment in the rosy bitterling (Rhodeus ocellatus)', 'Comparative Biochemistry and Physiology Part A: Molecular & Integrative Physiology', 'https://doi.org/10.1016/j.cbpa.2026.111986', 'peer_reviewed'),
  ('convict-cichlid-territory-study', 'Sex Differences in How Territory Quality Affects Aggression in Convict Cichlids', 'Integrative and Comparative Biology', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8522484/', 'peer_reviewed'),
  ('fishbase-paracheirodon-axelrodi', 'Paracheirodon axelrodi (Cardinal tetra) species summary', 'FishBase', 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html', 'curated_husbandry'),
  ('fishbase-paracheirodon-innesi', 'Paracheirodon innesi (Neon tetra) species summary', 'FishBase', 'https://www.fishbase.org/summary/Paracheirodon-innesi.html', 'curated_husbandry'),
  ('fishbase-poecilia-reticulata', 'Poecilia reticulata (Guppy) species summary', 'FishBase', 'https://www.fishbase.se/summary/Poecilia-reticulata.html', 'curated_husbandry'),
  ('fishbase-tanichthys-albonubes', 'Tanichthys albonubes (White cloud mountain minnow) species summary', 'FishBase', 'https://www.fishbase.se/summary/Tanichthys-albonubes.html', 'curated_husbandry'),
  ('guppy-schooling-learning-study', 'Schooling and learning: early social environment predicts social learning ability in the guppy, Poecilia reticulata', 'Animal Behaviour', 'https://www.sciencedirect.com/science/article/abs/pii/S0003347208002364', 'peer_reviewed'),
  ('oscar-zebrafish-development-predator-study', 'Modulation of Cortisol Responses to an Acute Stressor in Zebrafish Visually Exposed to Heterospecific Fish During Development', 'Zebrafish', 'https://journals.sagepub.com/doi/10.1089/zeb.2017.1509', 'peer_reviewed'),
  ('oscar-zebrafish-live-predator-study', 'Live Predators, Robots, and Computer-Animated Images Elicit Differential Avoidance Responses in Zebrafish', 'Zebrafish', 'https://journals.sagepub.com/doi/10.1089/zeb.2014.1041', 'peer_reviewed'),
  ('small-snakehead-fws-assessment', 'Ecological Risk Screening Summary: Small Snakehead (Channa asiatica)', 'U.S. Fish and Wildlife Service', 'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Small-Snakehead.pdf', 'government'),
  ('tiger-barb-group-size-study', 'The effect of group size on the behaviour and welfare of four fish species commonly kept in home aquaria', 'Applied Animal Behaviour Science', 'https://www.sciencedirect.com/science/article/pii/S0168159110001292', 'peer_reviewed'),
  ('white-cloud-shoaling-study', 'Shoaling in White Cloud Mountain minnows, Tanichthys albonubes: effects of predation risk and prey hunger', 'Animal Behaviour', 'https://www.sciencedirect.com/science/article/pii/S0003347284712917', 'peer_reviewed')
)
update public.evidence_sources e
set source_key = seed.source_key
from seed
where e.source_key is null and e.url = seed.url and e.review_status = 'reviewed' and e.deleted_at is null;

with seed(source_key,title,publisher,url,source_type) as (values
  ('channa-rhodeus-information-dynamics-study', 'Information Dynamics in the Interaction between a Prey and a Predator Fish', 'Entropy', 'https://doi.org/10.3390/e17107230', 'peer_reviewed'),
  ('channa-rhodeus-predation-stress-study', 'Effects of predation stress and sex on growth, metabolism, personality traits, and reproductive investment in the rosy bitterling (Rhodeus ocellatus)', 'Comparative Biochemistry and Physiology Part A: Molecular & Integrative Physiology', 'https://doi.org/10.1016/j.cbpa.2026.111986', 'peer_reviewed'),
  ('convict-cichlid-territory-study', 'Sex Differences in How Territory Quality Affects Aggression in Convict Cichlids', 'Integrative and Comparative Biology', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8522484/', 'peer_reviewed'),
  ('fishbase-paracheirodon-axelrodi', 'Paracheirodon axelrodi (Cardinal tetra) species summary', 'FishBase', 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html', 'curated_husbandry'),
  ('fishbase-paracheirodon-innesi', 'Paracheirodon innesi (Neon tetra) species summary', 'FishBase', 'https://www.fishbase.org/summary/Paracheirodon-innesi.html', 'curated_husbandry'),
  ('fishbase-poecilia-reticulata', 'Poecilia reticulata (Guppy) species summary', 'FishBase', 'https://www.fishbase.se/summary/Poecilia-reticulata.html', 'curated_husbandry'),
  ('fishbase-tanichthys-albonubes', 'Tanichthys albonubes (White cloud mountain minnow) species summary', 'FishBase', 'https://www.fishbase.se/summary/Tanichthys-albonubes.html', 'curated_husbandry'),
  ('guppy-schooling-learning-study', 'Schooling and learning: early social environment predicts social learning ability in the guppy, Poecilia reticulata', 'Animal Behaviour', 'https://www.sciencedirect.com/science/article/abs/pii/S0003347208002364', 'peer_reviewed'),
  ('oscar-zebrafish-development-predator-study', 'Modulation of Cortisol Responses to an Acute Stressor in Zebrafish Visually Exposed to Heterospecific Fish During Development', 'Zebrafish', 'https://journals.sagepub.com/doi/10.1089/zeb.2017.1509', 'peer_reviewed'),
  ('oscar-zebrafish-live-predator-study', 'Live Predators, Robots, and Computer-Animated Images Elicit Differential Avoidance Responses in Zebrafish', 'Zebrafish', 'https://journals.sagepub.com/doi/10.1089/zeb.2014.1041', 'peer_reviewed'),
  ('small-snakehead-fws-assessment', 'Ecological Risk Screening Summary: Small Snakehead (Channa asiatica)', 'U.S. Fish and Wildlife Service', 'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Small-Snakehead.pdf', 'government'),
  ('tiger-barb-group-size-study', 'The effect of group size on the behaviour and welfare of four fish species commonly kept in home aquaria', 'Applied Animal Behaviour Science', 'https://www.sciencedirect.com/science/article/pii/S0168159110001292', 'peer_reviewed'),
  ('white-cloud-shoaling-study', 'Shoaling in White Cloud Mountain minnows, Tanichthys albonubes: effects of predation risk and prey hunger', 'Animal Behaviour', 'https://www.sciencedirect.com/science/article/pii/S0003347284712917', 'peer_reviewed')
)
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select source_key,title,publisher,url,source_type,'reviewed',now() from seed
where not exists (select 1 from public.evidence_sources e where e.source_key = seed.source_key)
  and not exists (select 1 from public.evidence_sources e where e.url = seed.url and e.deleted_at is null);
do $$ begin
  if not exists (select 1 from public.evidence_sources where source_key='channa-rhodeus-information-dynamics-study' and title='Information Dynamics in the Interaction between a Prey and a Predator Fish' and publisher='Entropy' and url='https://doi.org/10.3390/e17107230' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: channa-rhodeus-information-dynamics-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='channa-rhodeus-predation-stress-study' and title='Effects of predation stress and sex on growth, metabolism, personality traits, and reproductive investment in the rosy bitterling (Rhodeus ocellatus)' and publisher='Comparative Biochemistry and Physiology Part A: Molecular & Integrative Physiology' and url='https://doi.org/10.1016/j.cbpa.2026.111986' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: channa-rhodeus-predation-stress-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='convict-cichlid-territory-study' and title='Sex Differences in How Territory Quality Affects Aggression in Convict Cichlids' and publisher='Integrative and Comparative Biology' and url='https://pmc.ncbi.nlm.nih.gov/articles/PMC8522484/' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: convict-cichlid-territory-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-paracheirodon-axelrodi' and title='Paracheirodon axelrodi (Cardinal tetra) species summary' and publisher='FishBase' and url='https://www.fishbase.org/summary/Paracheirodon-axelrodi.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: fishbase-paracheirodon-axelrodi'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-paracheirodon-innesi' and title='Paracheirodon innesi (Neon tetra) species summary' and publisher='FishBase' and url='https://www.fishbase.org/summary/Paracheirodon-innesi.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: fishbase-paracheirodon-innesi'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-poecilia-reticulata' and title='Poecilia reticulata (Guppy) species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Poecilia-reticulata.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: fishbase-poecilia-reticulata'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='fishbase-tanichthys-albonubes' and title='Tanichthys albonubes (White cloud mountain minnow) species summary' and publisher='FishBase' and url='https://www.fishbase.se/summary/Tanichthys-albonubes.html' and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: fishbase-tanichthys-albonubes'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='guppy-schooling-learning-study' and title='Schooling and learning: early social environment predicts social learning ability in the guppy, Poecilia reticulata' and publisher='Animal Behaviour' and url='https://www.sciencedirect.com/science/article/abs/pii/S0003347208002364' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: guppy-schooling-learning-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='oscar-zebrafish-development-predator-study' and title='Modulation of Cortisol Responses to an Acute Stressor in Zebrafish Visually Exposed to Heterospecific Fish During Development' and publisher='Zebrafish' and url='https://journals.sagepub.com/doi/10.1089/zeb.2017.1509' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: oscar-zebrafish-development-predator-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='oscar-zebrafish-live-predator-study' and title='Live Predators, Robots, and Computer-Animated Images Elicit Differential Avoidance Responses in Zebrafish' and publisher='Zebrafish' and url='https://journals.sagepub.com/doi/10.1089/zeb.2014.1041' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: oscar-zebrafish-live-predator-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='small-snakehead-fws-assessment' and title='Ecological Risk Screening Summary: Small Snakehead (Channa asiatica)' and publisher='U.S. Fish and Wildlife Service' and url='https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Small-Snakehead.pdf' and source_type='government' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: small-snakehead-fws-assessment'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='tiger-barb-group-size-study' and title='The effect of group size on the behaviour and welfare of four fish species commonly kept in home aquaria' and publisher='Applied Animal Behaviour Science' and url='https://www.sciencedirect.com/science/article/pii/S0168159110001292' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: tiger-barb-group-size-study'; end if;
  if not exists (select 1 from public.evidence_sources where source_key='white-cloud-shoaling-study' and title='Shoaling in White Cloud Mountain minnows, Tanichthys albonubes: effects of predation risk and prey hunger' and publisher='Animal Behaviour' and url='https://www.sciencedirect.com/science/article/pii/S0003347284712917' and source_type='peer_reviewed' and review_status='reviewed' and deleted_at is null) then raise exception 'Compatibility evidence source drift: white-cloud-shoaling-study'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['shoaling', 'interspecific_aggression', 'fin_nipping']::text[], 6, ARRAY[]::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0439' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='tiger-barb-group-size-study'
where s.catalog_key='sp_0439' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0439' and p.behavior_traits=ARRAY['shoaling', 'interspecific_aggression', 'fin_nipping']::text[] and p.minimum_group_size is not distinct from 6 and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0439'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0439') <> ARRAY['tiger-barb-group-size-study']::text[] then raise exception 'Compatibility profile evidence drift: sp_0439'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['territorial', 'breeding_defense', 'chasing', 'biting']::text[], null, ARRAY[]::text[], 'high', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0021' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='convict-cichlid-territory-study'
where s.catalog_key='sp_0021' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0021' and p.behavior_traits=ARRAY['territorial', 'breeding_defense', 'chasing', 'biting']::text[] and p.minimum_group_size is not distinct from null and p.predation_targets=ARRAY[]::text[] and p.confidence='high' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0021'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0021') <> ARRAY['convict-cichlid-territory-study']::text[] then raise exception 'Compatibility profile evidence drift: sp_0021'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['predatory', 'solitary_required', 'territorial']::text[], null, ARRAY['small_fish']::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0049' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='small-snakehead-fws-assessment'
where s.catalog_key='sp_0049' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0049' and p.behavior_traits=ARRAY['predatory', 'solitary_required', 'territorial']::text[] and p.minimum_group_size is not distinct from null and p.predation_targets=ARRAY['small_fish']::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0049'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0049') <> ARRAY['small-snakehead-fws-assessment']::text[] then raise exception 'Compatibility profile evidence drift: sp_0049'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['shoaling']::text[], 5, ARRAY[]::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0431' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='fishbase-paracheirodon-innesi'
where s.catalog_key='sp_0431' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0431' and p.behavior_traits=ARRAY['shoaling']::text[] and p.minimum_group_size is not distinct from 5 and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0431'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0431') <> ARRAY['fishbase-paracheirodon-innesi']::text[] then raise exception 'Compatibility profile evidence drift: sp_0431'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['shoaling']::text[], 5, ARRAY[]::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0432' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='fishbase-paracheirodon-axelrodi'
where s.catalog_key='sp_0432' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0432' and p.behavior_traits=ARRAY['shoaling']::text[] and p.minimum_group_size is not distinct from 5 and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0432'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0432') <> ARRAY['fishbase-paracheirodon-axelrodi']::text[] then raise exception 'Compatibility profile evidence drift: sp_0432'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['shoaling']::text[], 5, ARRAY[]::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0434' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='fishbase-tanichthys-albonubes'
where s.catalog_key='sp_0434' on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='white-cloud-shoaling-study'
where s.catalog_key='sp_0434' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0434' and p.behavior_traits=ARRAY['shoaling']::text[] and p.minimum_group_size is not distinct from 5 and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0434'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0434') <> ARRAY['fishbase-tanichthys-albonubes', 'white-cloud-shoaling-study']::text[] then raise exception 'Compatibility profile evidence drift: sp_0434'; end if;
end $$;

insert into public.species_compatibility_profiles(species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,reviewed_at)
select s.id, ARRAY['shoaling']::text[], 5, ARRAY[]::text[], 'medium', 'reviewed', now()
from public.species s
where s.catalog_key='sp_0436' and s.deleted_at is null and s.status='published'
  and not exists (select 1 from public.species_compatibility_profiles p where p.species_id=s.id);
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='fishbase-poecilia-reticulata'
where s.catalog_key='sp_0436' on conflict do nothing;
insert into public.species_compatibility_profile_sources(profile_id,source_id)
select p.id,e.id from public.species_compatibility_profiles p join public.species s on s.id=p.species_id join public.evidence_sources e on e.source_key='guppy-schooling-learning-study'
where s.catalog_key='sp_0436' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where s.catalog_key='sp_0436' and p.behavior_traits=ARRAY['shoaling']::text[] and p.minimum_group_size is not distinct from 5 and p.predation_targets=ARRAY[]::text[] and p.confidence='medium' and p.review_status='reviewed' and p.deleted_at is null and s.status='published') then raise exception 'Compatibility profile drift: sp_0436'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_compatibility_profiles p join public.species s on s.id=p.species_id left join public.species_compatibility_profile_sources l on l.profile_id=p.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0436') <> ARRAY['fishbase-poecilia-reticulata', 'guppy-schooling-learning-study']::text[] then raise exception 'Compatibility profile evidence drift: sp_0436'; end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id), greatest(a.id,b.id), 'not_recommended', 'behavior_and_territory_conflict', '虎皮鱼有追鳍与种间攻击倾向，迷你鹦鹉鱼会追逐、啃咬并在繁殖期强烈护域；两者同缸容易形成持续追逐和领地冲突。', ARRAY['优先分缸饲养；不要把增加躲避物当作消除行为冲突的保证。']::text[], 'rule_inference', 'medium', 'reviewed', now()
from public.species a cross join public.species b
where a.catalog_key='sp_0021' and b.catalog_key='sp_0439' and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and not exists (select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='tiger-barb-group-size-study'
where least(a.catalog_key,b.catalog_key)='sp_0021' and greatest(a.catalog_key,b.catalog_key)='sp_0439' on conflict do nothing;
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='convict-cichlid-territory-study'
where least(a.catalog_key,b.catalog_key)='sp_0021' and greatest(a.catalog_key,b.catalog_key)='sp_0439' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0021' and greatest(a.catalog_key,b.catalog_key)='sp_0439' and pr.verdict='not_recommended' and pr.risk_type='behavior_and_territory_conflict' and pr.reason='虎皮鱼有追鳍与种间攻击倾向，迷你鹦鹉鱼会追逐、啃咬并在繁殖期强烈护域；两者同缸容易形成持续追逐和领地冲突。' and pr.mitigation=ARRAY['优先分缸饲养；不要把增加躲避物当作消除行为冲突的保证。']::text[] and pr.basis='rule_inference' and pr.confidence='medium' and pr.review_status='reviewed' and pr.deleted_at is null and a.status='published' and b.status='published') then raise exception 'Compatibility pair rule drift: sp_0021__sp_0439'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0021' and greatest(a.catalog_key,b.catalog_key)='sp_0439') <> ARRAY['convict-cichlid-territory-study', 'tiger-barb-group-size-study']::text[] then raise exception 'Compatibility pair evidence drift: sp_0021__sp_0439'; end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id), greatest(a.id,b.id), 'caution', 'group_size_and_shared_water_window', 'FishBase 将红绿灯与宝莲灯都记录为小型淡水群游/群养鱼；两者温度区间在约 23–26°C、pH 区间在约 5.0–6.0 有共同范围。当前没有直接配对实验，因此只作为有条件可尝试，而不是“已证明安全”。', ARRAY['两种鱼都按群体饲养，不以单条长期混养作为目标。', '把温度和 pH 保持在两者共同区间，并避免快速波动。', '分批加入并持续观察摄食、追逐和应激表现。']::text[], 'rule_inference', 'medium', 'reviewed', now()
from public.species a cross join public.species b
where a.catalog_key='sp_0431' and b.catalog_key='sp_0432' and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and not exists (select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='fishbase-paracheirodon-innesi'
where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0432' on conflict do nothing;
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='fishbase-paracheirodon-axelrodi'
where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0432' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0432' and pr.verdict='caution' and pr.risk_type='group_size_and_shared_water_window' and pr.reason='FishBase 将红绿灯与宝莲灯都记录为小型淡水群游/群养鱼；两者温度区间在约 23–26°C、pH 区间在约 5.0–6.0 有共同范围。当前没有直接配对实验，因此只作为有条件可尝试，而不是“已证明安全”。' and pr.mitigation=ARRAY['两种鱼都按群体饲养，不以单条长期混养作为目标。', '把温度和 pH 保持在两者共同区间，并避免快速波动。', '分批加入并持续观察摄食、追逐和应激表现。']::text[] and pr.basis='rule_inference' and pr.confidence='medium' and pr.review_status='reviewed' and pr.deleted_at is null and a.status='published' and b.status='published') then raise exception 'Compatibility pair rule drift: sp_0431__sp_0432'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0431' and greatest(a.catalog_key,b.catalog_key)='sp_0432') <> ARRAY['fishbase-paracheirodon-axelrodi', 'fishbase-paracheirodon-innesi']::text[] then raise exception 'Compatibility pair evidence drift: sp_0431__sp_0432'; end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id), greatest(a.id,b.id), 'not_recommended', 'predation_threat', '多项斑马鱼 predator-response 实验明确把地图鱼 Astronotus ocellatus 作为 Danio rerio 的捕食者刺激；活体地图鱼可诱发稳定回避/恐惧反应，长期视觉暴露研究也将该组合定义为 predator–prey 模型。证据支持存在明确捕食威胁，但这些实验并不是家庭水族箱中的长期同缸吞食试验。', ARRAY['不要把地图鱼与斑马鱼作为长期同缸组合；优先物理分缸。', '不要用增加躲避物或“先试试看”替代捕食风险隔离。']::text[], 'pair_rule', 'medium', 'reviewed', now()
from public.species a cross join public.species b
where a.catalog_key='sp_0435' and b.catalog_key='sp_0451' and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and not exists (select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='oscar-zebrafish-live-predator-study'
where least(a.catalog_key,b.catalog_key)='sp_0435' and greatest(a.catalog_key,b.catalog_key)='sp_0451' on conflict do nothing;
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='oscar-zebrafish-development-predator-study'
where least(a.catalog_key,b.catalog_key)='sp_0435' and greatest(a.catalog_key,b.catalog_key)='sp_0451' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0435' and greatest(a.catalog_key,b.catalog_key)='sp_0451' and pr.verdict='not_recommended' and pr.risk_type='predation_threat' and pr.reason='多项斑马鱼 predator-response 实验明确把地图鱼 Astronotus ocellatus 作为 Danio rerio 的捕食者刺激；活体地图鱼可诱发稳定回避/恐惧反应，长期视觉暴露研究也将该组合定义为 predator–prey 模型。证据支持存在明确捕食威胁，但这些实验并不是家庭水族箱中的长期同缸吞食试验。' and pr.mitigation=ARRAY['不要把地图鱼与斑马鱼作为长期同缸组合；优先物理分缸。', '不要用增加躲避物或“先试试看”替代捕食风险隔离。']::text[] and pr.basis='pair_rule' and pr.confidence='medium' and pr.review_status='reviewed' and pr.deleted_at is null and a.status='published' and b.status='published') then raise exception 'Compatibility pair rule drift: sp_0435__sp_0451'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0435' and greatest(a.catalog_key,b.catalog_key)='sp_0451') <> ARRAY['oscar-zebrafish-development-predator-study', 'oscar-zebrafish-live-predator-study']::text[] then raise exception 'Compatibility pair evidence drift: sp_0435__sp_0451'; end if;
end $$;

insert into public.species_pair_compatibility_rules(species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,reviewed_at)
select least(a.id,b.id), greatest(a.id,b.id), 'not_recommended', 'predation_threat', '2015 年 predator–prey 实验直接使用高体鳑鲏 Rhodeus ocellatus 作为 prey、乌鳢 Channa argus 作为 predator，并记录到猎物倾向远离捕食者；2026 年研究进一步将乌鳢明确描述为高体鳑鲏的 natural predator，并以 20 天持续视觉/化学线索暴露研究非消耗性捕食压力。证据支持明确捕食威胁，但两项实验均采用物理隔离，不是家庭水族箱长期同缸吞食试验。', ARRAY['不要把白金雷龙与高体鳑鲏作为长期同缸组合；优先物理分缸。', '不要用躲避物、体型暂时接近或短期未追逐来替代捕食风险隔离。']::text[], 'pair_rule', 'medium', 'reviewed', now()
from public.species a cross join public.species b
where a.catalog_key='sp_0224' and b.catalog_key='sp_0475' and a.deleted_at is null and b.deleted_at is null and a.status='published' and b.status='published'
  and not exists (select 1 from public.species_pair_compatibility_rules pr where pr.species_a_id=least(a.id,b.id) and pr.species_b_id=greatest(a.id,b.id));
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='channa-rhodeus-information-dynamics-study'
where least(a.catalog_key,b.catalog_key)='sp_0224' and greatest(a.catalog_key,b.catalog_key)='sp_0475' on conflict do nothing;
insert into public.species_pair_compatibility_rule_sources(pair_rule_id,source_id)
select pr.id,e.id from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id join public.evidence_sources e on e.source_key='channa-rhodeus-predation-stress-study'
where least(a.catalog_key,b.catalog_key)='sp_0224' and greatest(a.catalog_key,b.catalog_key)='sp_0475' on conflict do nothing;
do $$ begin
  if not exists (select 1 from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id where least(a.catalog_key,b.catalog_key)='sp_0224' and greatest(a.catalog_key,b.catalog_key)='sp_0475' and pr.verdict='not_recommended' and pr.risk_type='predation_threat' and pr.reason='2015 年 predator–prey 实验直接使用高体鳑鲏 Rhodeus ocellatus 作为 prey、乌鳢 Channa argus 作为 predator，并记录到猎物倾向远离捕食者；2026 年研究进一步将乌鳢明确描述为高体鳑鲏的 natural predator，并以 20 天持续视觉/化学线索暴露研究非消耗性捕食压力。证据支持明确捕食威胁，但两项实验均采用物理隔离，不是家庭水族箱长期同缸吞食试验。' and pr.mitigation=ARRAY['不要把白金雷龙与高体鳑鲏作为长期同缸组合；优先物理分缸。', '不要用躲避物、体型暂时接近或短期未追逐来替代捕食风险隔离。']::text[] and pr.basis='pair_rule' and pr.confidence='medium' and pr.review_status='reviewed' and pr.deleted_at is null and a.status='published' and b.status='published') then raise exception 'Compatibility pair rule drift: sp_0224__sp_0475'; end if;
  if (select coalesce(array_agg(e.source_key order by e.source_key),ARRAY[]::text[]) from public.species_pair_compatibility_rules pr join public.species a on a.id=pr.species_a_id join public.species b on b.id=pr.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=pr.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0224' and greatest(a.catalog_key,b.catalog_key)='sp_0475') <> ARRAY['channa-rhodeus-information-dynamics-study', 'channa-rhodeus-predation-stress-study']::text[] then raise exception 'Compatibility pair evidence drift: sp_0224__sp_0475'; end if;
end $$;

alter table public.species_compatibility_profile_revisions add column if not exists evidence_resolution jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_resolution)='array');
alter table public.species_pair_compatibility_rule_revisions add column if not exists evidence_resolution jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_resolution)='array');

comment on column public.evidence_sources.source_key is 'Stable reviewed evidence identity used by Compatibility revisions and versioned publish.';
comment on column public.species_compatibility_profile_revisions.evidence_resolution is 'Server-resolved canonical evidence IDs/versions captured at review submission.';
comment on column public.species_pair_compatibility_rule_revisions.evidence_resolution is 'Server-resolved canonical evidence IDs/versions captured at review submission.';
