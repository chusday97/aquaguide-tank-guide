-- Additive bridge for immutable 202609160001 historical migration.
-- Historical seed URL and assertion URL disagree; this makes the immutable assertion reachable.
begin;
insert into public.evidence_sources(source_key,title,publisher,url,source_type,review_status,reviewed_at)
select 'seriouslyfish-petitella-rhodostoma',
 'Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)',
 'Seriously Fish','https://www.seriouslyfish.com/species/hemigrammus-rhodostoma',
 'curated_husbandry','reviewed',now()
where not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-petitella-rhodostoma' and deleted_at is null)
and not exists (select 1 from public.evidence_sources where url='https://www.seriouslyfish.com/species/hemigrammus-rhodostoma' and deleted_at is null);
do $$ begin
 if not exists (select 1 from public.evidence_sources where source_key='seriouslyfish-petitella-rhodostoma'
  and title='Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)'
  and publisher='Seriously Fish' and url='https://www.seriouslyfish.com/species/hemigrammus-rhodostoma'
  and source_type='curated_husbandry' and review_status='reviewed' and deleted_at is null)
 then raise exception 'Compatibility Rummy legacy bridge failed'; end if;
end $$;
commit;
