import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/components/compatibility/RelocationConfirmationDialog.tsx', 'utf8');
const state = readFileSync('src/lib/relocationConfirmationState.ts', 'utf8');

assert.match(component, /RelocationExecutionRequest/);
assert.match(component, /RelocationExecutionResult/);
assert.match(component, /executeFreshRelocation: \(request: RelocationExecutionRequest\) => Promise<RelocationExecutionResult>/);
assert.match(component, /executeFreshRelocation\(request\)/);

for (const marker of [
  'data-relocation-confirmation-dialog',
  'data-relocation-source',
  'data-relocation-destination',
  'data-relocation-species',
  'data-relocation-quantity',
  'data-confirm-relocation',
  'data-reconcile-relocation',
  'data-relocation-result',
]) {
  assert.match(component, new RegExp(marker));
}

assert.match(component, /value=\{String\(request\.quantity\)\}/, 'displayed quantity must come from the actual execution request');
assert.doesNotMatch(component, /facts\.quantity/, 'confirmation must not maintain a second display-only quantity source');
assert.match(component, /重新检查并确认迁移/);
assert.match(component, /之前看到的目标缸结论不会直接授权迁移/);
assert.match(component, /条件已变化，本次没有执行迁移/);
assert.match(component, /迁移已完成，并已重新计算两个鱼缸/);
assert.match(component, /暂时无法确认迁移是否已经执行/);
assert.match(component, /迁移可能已经完成，但最新状态暂时无法同步/);
assert.match(component, /不要再次发起迁移/);
assert.match(component, /重新同步鱼缸状态/);

assert.match(state, /mutation_state_unknown/);
assert.match(state, /executed_post_state_unavailable/);
assert.match(state, /relocationOutcomeAllowsBlindMutationRetry/);
assert.match(state, /=> false/);

for (const forbidden of [
  'AquaGuideRepository',
  'relocateLivestock',
  'apiRequest',
  'supabase',
  '重试迁移',
  'Retry relocation',
]) {
  assert.doesNotMatch(component, new RegExp(forbidden), `confirmation surface must not bypass the fresh execution policy or offer a blind mutation retry: ${forbidden}`);
}

console.log('relocation confirmation surface contract passed: request-bound facts, policy-only execution callback, distinct blocked/completed/reconcile states, and no direct repository or blind retry path');
