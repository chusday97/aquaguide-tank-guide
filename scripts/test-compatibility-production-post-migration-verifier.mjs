import assert from 'node:assert/strict';
import { CURRENT_PRODUCTION_LATEST_VERSION,CURRENT_PRODUCTION_MIGRATION_COUNT,classifyState,validateDetailedState } from './compatibility-production-post-migration-verifier.mjs';
import { getAuthorityKeys } from './compatibility-production-migration-guard.mjs';
const pre={migration_count:26,latest_version:'20260816160129',content_publications_exists:false,species:486,feeding:486,care:41,care_steps:128,species_assets:0,care_assets:0,profiles:0,pair_rules:0,evidence:0,authority_state_exists:false,stage_risks_exists:false};
assert.equal(classifyState(pre),'NOT_MIGRATED');
const post={...pre,migration_count:CURRENT_PRODUCTION_MIGRATION_COUNT,latest_version:CURRENT_PRODUCTION_LATEST_VERSION,content_publications_exists:true,profiles:35,pair_rules:21,evidence:67,authority_state_exists:true,stage_risks_exists:true};
assert.equal(classifyState(post),'VERIFY_POST_MIGRATION');
assert.equal(classifyState({...pre,migration_count:27}),'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({...pre,content_publications_exists:true}),'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({...post,content_publications_exists:false}),'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({...post,migration_count:51,latest_version:'202610090003',profiles:34,evidence:65}),'BLOCKED_STATE_DRIFT','obsolete pre-kissing-gourami Production baseline must no longer classify as current.');
const keys=getAuthorityKeys();
const detail={
 profile_keys:keys.profiles,pair_keys:keys.pairRules,stage_risk_keys:keys.stageRisks,reviewed_evidence:20,authority_singleton:1,
 tiger_guppy:{verdict:'not_recommended',risk_type:'fin_nipping_long_fin_conflict',reason:'孔雀鱼与虎皮鱼存在直接追鳍和长鳍冲突。',basis:'pair_rule',confidence:'high',source_keys:['seriouslyfish-poecilia-reticulata','seriouslyfish-puntigrus-tetrazona']},
 guppy_stage_risk:{rule_key:'sp_0436:conspecific_fry_predation',verdict:'not_recommended',risk_type:'conspecific_fry_predation',younger_stages:['fry'],older_stages:['adult'],reason:'成鱼可能捕食同种幼鱼。',source_keys:['guppy-cannibalism-refuge-study','guppy-fry-yield-cannibalism-study']},
};
assert.equal(validateDetailedState(post,detail).ready,true);
const bad=validateDetailedState(post,{...detail,tiger_guppy:{...detail.tiger_guppy,verdict:'caution'}});
assert.equal(bad.ready,false); assert.ok(bad.blockers.includes('tiger_guppy_verdict:caution'));
console.log('Compatibility Production post-migration verifier contract PASS');
