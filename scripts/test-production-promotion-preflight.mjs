import assert from 'node:assert/strict';
import { evaluateProductionPromotionPreflight } from './production-promotion-preflight-lib.mjs';

const readyBase = {
  userSitePhase: 'READY_FOR_PROMOTION_DECISION',
  supabaseProjectStatus: 'ACTIVE_HEALTHY',
  supabaseParityVerified: true,
  productionFrozen: true,
  mainSynchronized: true,
  pendingMigrationCount: 0,
};
let r = evaluateProductionPromotionPreflight(readyBase);
assert.equal(r.phase, 'READY_TO_PROMOTE');
assert.deepEqual(r.blockers, []);
assert.equal(r.promotionAuthorized, false);

r = evaluateProductionPromotionPreflight({ ...readyBase, supabaseProjectStatus: 'INACTIVE', supabaseParityVerified: false, pendingMigrationCount: 34 });
assert.equal(r.phase, 'BLOCKED_PRE_PROMOTION');
assert.ok(r.blockers.includes('supabase_not_active:INACTIVE'));
assert.ok(r.blockers.includes('supabase_parity_not_verified'));
assert.equal(r.facts.pendingMigrationCount, 34);

r = evaluateProductionPromotionPreflight({ ...readyBase, productionFrozen: false });
assert.ok(r.blockers.includes('production_freeze_not_preserved'));
console.log('production promotion preflight contract PASS');
