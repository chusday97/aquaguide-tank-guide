import assert from 'node:assert/strict';
import { evaluateProductionPromotionPreflight } from './production-promotion-preflight-lib.mjs';

const readyBase = {
  userSitePhase: 'READY_FOR_PROMOTION_DECISION',
  supabaseProjectStatus: 'ACTIVE_HEALTHY',
  coreUserStateParityVerified: true,
  productionFrozen: true,
  mainSynchronized: true,
  deferredAdminMigrationCount: 34,
};

let r = evaluateProductionPromotionPreflight(readyBase);
assert.equal(r.phase, 'READY_TO_PROMOTE');
assert.deepEqual(r.blockers, []);
assert.equal(r.promotionAuthorized, false);
assert.equal(r.facts.deferredAdminMigrationCount, 34);
assert.equal(r.separateWork.adminSeoDatabaseParity, 'DEFERRED_NOT_CORE_BLOCKER');

r = evaluateProductionPromotionPreflight({
  ...readyBase,
  supabaseProjectStatus: 'INACTIVE',
  coreUserStateParityVerified: false,
});
assert.equal(r.phase, 'BLOCKED_PRE_PROMOTION');
assert.ok(r.blockers.includes('supabase_not_active:INACTIVE'));
assert.ok(r.blockers.includes('core_user_state_parity_not_verified'));
assert.ok(!r.blockers.some(blocker => blocker.includes('migration')));

r = evaluateProductionPromotionPreflight({ ...readyBase, productionFrozen: false });
assert.ok(r.blockers.includes('production_freeze_not_preserved'));

r = evaluateProductionPromotionPreflight({ ...readyBase, deferredAdminMigrationCount: 34 });
assert.equal(r.phase, 'READY_TO_PROMOTE', 'deferred Admin/SEO migrations must not block the core user-site promotion');

console.log('production promotion preflight contract PASS: core user-state parity gates; deferred Admin/SEO migrations do not');
