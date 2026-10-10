import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  PRODUCTION_PROJECT_REF,
  START_LATEST_VERSION,
  START_MIGRATION_COUNT,
  MIGRATIONS,
  getAuthorityKeys,
  readLinkedProjectRef,
  validateProductionCodeCompatibility,
} from './compatibility-production-migration-guard.mjs';

const root=resolve(import.meta.dirname,'..');
export const CURRENT_PRODUCTION_LATEST_VERSION='20261010101020';
export const CURRENT_PRODUCTION_MIGRATION_COUNT=52;
const run=(cmd,args)=>{
  const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});
  if(r.status!==0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr||r.stdout}`);
  return r.stdout.trim();
};
const query=sql=>{
  const rows=JSON.parse(run('supabase',['db','query','--linked','--output-format','json',sql]));
  if(!Array.isArray(rows)) throw new Error('Unexpected Supabase JSON response.');
  return rows;
};

export const classifyState=state=>{
  const pre=state.migration_count===START_MIGRATION_COUNT
    && state.latest_version===START_LATEST_VERSION
    && state.content_publications_exists===false
     && state.profiles===0 && state.pair_rules===0 && state.evidence===0
    && state.authority_state_exists===false && state.stage_risks_exists===false;
  if(pre) return 'NOT_MIGRATED';
  const post=state.migration_count===CURRENT_PRODUCTION_MIGRATION_COUNT
    && state.latest_version===CURRENT_PRODUCTION_LATEST_VERSION
    && state.content_publications_exists===true
    && state.authority_state_exists===true && state.stage_risks_exists===true;
  return post?'VERIFY_POST_MIGRATION':'BLOCKED_STATE_DRIFT';
};

export const validateDetailedState=(state,detail)=>{
  const expected=getAuthorityKeys();
  const blockers=[];
  if(state.species!==486) blockers.push(`species:${state.species}/486`);
  if(state.feeding!==486) blockers.push(`feeding:${state.feeding}/486`);
  if(state.care!==41) blockers.push(`care:${state.care}/41`);
  if(state.care_steps!==128) blockers.push(`care_steps:${state.care_steps}/128`);
  if(state.species_assets!==0) blockers.push(`species_assets:${state.species_assets}/0`);
  if(state.care_assets!==0) blockers.push(`care_assets:${state.care_assets}/0`);
  if(JSON.stringify(detail.profile_keys)!==JSON.stringify(expected.profiles)) blockers.push('profile_key_set_mismatch');
  if(JSON.stringify(detail.pair_keys)!==JSON.stringify(expected.pairRules)) blockers.push('pair_key_set_mismatch');
  if(JSON.stringify(detail.stage_risk_keys)!==JSON.stringify(expected.stageRisks)) blockers.push('stage_risk_key_set_mismatch');
  if(detail.reviewed_evidence<=0) blockers.push('reviewed_evidence_missing');
  if(detail.authority_singleton!==1) blockers.push(`authority_singleton:${detail.authority_singleton}/1`);
  const pair=detail.tiger_guppy;
  if(!pair) blockers.push('tiger_guppy_rule_missing');
  else {
    if(pair.verdict!=='not_recommended') blockers.push(`tiger_guppy_verdict:${pair.verdict}`);
    if(pair.risk_type!=='fin_nipping_long_fin_conflict') blockers.push(`tiger_guppy_risk_type:${pair.risk_type}`);
    if(pair.basis!=='pair_rule') blockers.push(`tiger_guppy_basis:${pair.basis}`);
    if(pair.confidence!=='high') blockers.push(`tiger_guppy_confidence:${pair.confidence}`);
    const expectedSources=['seriouslyfish-poecilia-reticulata','seriouslyfish-puntigrus-tetrazona'];
    if(JSON.stringify(pair.source_keys)!==JSON.stringify(expectedSources)) blockers.push('tiger_guppy_sources_mismatch');
    if(!/追鳍|长鳍/.test(pair.reason||'')) blockers.push('tiger_guppy_reason_not_fin_nipping');
  }
  const stage=detail.guppy_stage_risk;
  if(!stage) blockers.push('guppy_stage_risk_missing');
  else {
    if(stage.rule_key!=='sp_0436:conspecific_fry_predation') blockers.push(`guppy_stage_key:${stage.rule_key}`);
    if(stage.verdict!=='not_recommended') blockers.push(`guppy_stage_verdict:${stage.verdict}`);
    if(stage.risk_type!=='conspecific_fry_predation') blockers.push(`guppy_stage_risk_type:${stage.risk_type}`);
    if(JSON.stringify(stage.younger_stages)!==JSON.stringify(['fry'])) blockers.push('guppy_stage_younger_mismatch');
    if(JSON.stringify(stage.older_stages)!==JSON.stringify(['adult'])) blockers.push('guppy_stage_older_mismatch');
    const expectedSources=['guppy-cannibalism-refuge-study','guppy-fry-yield-cannibalism-study'];
    if(JSON.stringify(stage.source_keys)!==JSON.stringify(expectedSources)) blockers.push('guppy_stage_sources_mismatch');
  }
  return {ready:blockers.length===0,blockers,expected:{profiles:expected.profiles.length,pairRules:expected.pairRules.length,stageRisks:expected.stageRisks.length}};
};

export const readState=()=>query(`select
 (select count(*) from supabase_migrations.schema_migrations)::int migration_count,
 (select max(version) from supabase_migrations.schema_migrations) latest_version,
 (to_regclass('public.content_publications') is not null) content_publications_exists,
 (select count(*) from public.species where deleted_at is null)::int species,
 (select count(*) from public.species_feeding_profiles where deleted_at is null)::int feeding,
 (select count(*) from public.care_articles where deleted_at is null)::int care,
 (select count(*) from public.care_article_steps where deleted_at is null)::int care_steps,
 (select count(*) from public.species_assets)::int species_assets,
 (select count(*) from public.care_article_assets)::int care_assets,
 (select count(*) from public.species_compatibility_profiles)::int profiles,
 (select count(*) from public.species_pair_compatibility_rules)::int pair_rules,
 (select count(*) from public.evidence_sources)::int evidence,
 (to_regclass('public.compatibility_authority_state') is not null) authority_state_exists,
 (to_regclass('public.species_compatibility_profile_stage_risks') is not null) stage_risks_exists;`)[0];

export const readDetailedState=()=>{
  const profileKeys=query(`select s.catalog_key from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where p.review_status='reviewed' and p.deleted_at is null order by s.catalog_key;`).map(r=>r.catalog_key);
  const pairKeys=query(`select least(a.catalog_key,b.catalog_key)||'__'||greatest(a.catalog_key,b.catalog_key) pair_key from public.species_pair_compatibility_rules r join public.species a on a.id=r.species_a_id join public.species b on b.id=r.species_b_id where r.review_status='reviewed' and r.deleted_at is null order by pair_key;`).map(r=>r.pair_key);
  const stageKeys=query(`select s.catalog_key||':'||r.risk_type stage_risk_key from public.species_compatibility_profile_stage_risks r join public.species_compatibility_profiles p on p.id=r.profile_id join public.species s on s.id=p.species_id where r.review_status='reviewed' and r.deleted_at is null order by stage_risk_key;`).map(r=>r.stage_risk_key);
  const metrics=query(`select (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null)::int reviewed_evidence,(select count(*) from public.compatibility_authority_state where singleton=true)::int authority_singleton;`)[0];
  const pairRows=query(`select r.verdict,r.risk_type,r.reason,r.basis,r.confidence,coalesce(array_agg(e.source_key order by e.source_key) filter (where e.source_key is not null),'{}'::text[]) source_keys from public.species_pair_compatibility_rules r join public.species a on a.id=r.species_a_id join public.species b on b.id=r.species_b_id left join public.species_pair_compatibility_rule_sources l on l.pair_rule_id=r.id left join public.evidence_sources e on e.id=l.source_id where least(a.catalog_key,b.catalog_key)='sp_0436' and greatest(a.catalog_key,b.catalog_key)='sp_0439' and r.review_status='reviewed' and r.deleted_at is null group by r.id,r.verdict,r.risk_type,r.reason,r.basis,r.confidence;`);
  const stageRows=query(`select r.rule_key,r.verdict,r.risk_type,r.younger_stages,r.older_stages,r.reason,coalesce(array_agg(e.source_key order by e.source_key) filter (where e.source_key is not null),'{}'::text[]) source_keys from public.species_compatibility_profile_stage_risks r join public.species_compatibility_profiles p on p.id=r.profile_id join public.species s on s.id=p.species_id left join public.species_compatibility_profile_stage_risk_sources l on l.stage_risk_id=r.id left join public.evidence_sources e on e.id=l.source_id where s.catalog_key='sp_0436' and r.rule_key='sp_0436:conspecific_fry_predation' and r.review_status='reviewed' and r.deleted_at is null group by r.id,r.rule_key,r.verdict,r.risk_type,r.younger_stages,r.older_stages,r.reason;`);
  return {profile_keys:profileKeys,pair_keys:pairKeys,stage_risk_keys:stageKeys,...metrics,tiger_guppy:pairRows[0]||null,guppy_stage_risk:stageRows[0]||null};
};

const isMain=import.meta.url===`file://${process.argv[1]}`;
if(isMain){
  const linkedRef=readLinkedProjectRef();
  if(linkedRef!==PRODUCTION_PROJECT_REF) throw new Error(`Linked Supabase ref mismatch: ${linkedRef}`);
  const productionCodeCompatibility=validateProductionCodeCompatibility();
  const state=readState();
  const phase=classifyState(state);
  if(phase!=='VERIFY_POST_MIGRATION') {
    console.log(JSON.stringify({phase,projectRef:linkedRef,state,productionCodeCompatibility,ready:false,mutationAuthorized:false},null,2));
    process.exit(0);
  }
  const detail=readDetailedState();
  const validation=validateDetailedState(state,detail);
  console.log(JSON.stringify({phase:validation.ready?'READY_COMPATIBILITY_PRODUCTION':'BLOCKED_POST_MIGRATION',projectRef:linkedRef,state,detail,productionCodeCompatibility,...validation,mutationAuthorized:false},null,2));
}
