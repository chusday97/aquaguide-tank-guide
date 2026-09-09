import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');
const localStore = read('src/services/admin/local-business-admin.store.ts');
const contentService = read('src/services/admin/content-admin.service.ts');
const compatibilityService = read('src/services/admin/compatibility-admin.service.ts');
const localCareSeoStore = read('src/services/admin/local-care-seo-editorial.store.ts');
const careSeoUi = read('src/components/admin/CareSeoProjectionPreview.tsx');
const runtimeCompatibility = read('src/data/runtimeCompatibilityEvidence.ts');
const operationsService = read('src/services/admin/operations-work-item.service.ts');
const publishCenterService = read('src/services/admin/publish-center.service.ts');

assert.match(localStore, /runtimeEnv\?\.DEV === true && runtimeEnv\.VITE_ADMIN_LOCAL_MODE === 'true'/,
  'Local Business Admin must require Vite DEV mode plus the explicit local flag.');
assert.match(contentService, /isLocalBusinessAdminMode \? localBusinessAdminStore\.listSpecies\(\)/,
  'Product reads must only switch to the local store behind the local-mode guard.');
assert.match(contentService, /isLocalBusinessAdminMode \? localBusinessAdminStore\.setStatus/,
  'Product publish/archive must only use local persistence behind the local-mode guard.');
assert.match(compatibilityService, /isLocalBusinessAdminMode \? localCompatibilityAdminStore\.listProfileRevisions\(\)/,
  'Compatibility reads must only switch to the local store behind the local-mode guard.');
assert.match(compatibilityService, /isLocalBusinessAdminMode \? localCompatibilityAdminStore\.publishPairRuleRevision/,
  'Compatibility publish must only use local runtime authority behind the local-mode guard.');
assert.match(contentService, /isLocalBusinessAdminMode \? localCareSeoEditorialStore\.getWorkspace/,
  'Care SEO Editorial workspace must use the local editorial authority only behind Local Mode.');
assert.match(contentService, /Local Mode AI Assist 尚未接入；不会伪造 AI 输出/,
  'Local Care SEO AI must fail closed instead of fabricating suggestions.');
assert.match(localCareSeoStore, /locale !== 'zh-CN'/,
  'Local Care SEO must reject English until a real English Published Care source exists.');
assert.match(localCareSeoStore, /if \(value !== 'noindex'\)/,
  'Local Care SEO must keep indexStrategy locked to noindex.');
assert.match(careSeoUi, /English（待接入）/,
  'Local Care SEO UI must surface the missing English source truthfully.');
assert.match(runtimeCompatibility, /if \(isLocalBusinessAdminMode\) return applyReviewedCompatibilityBootstrap/,
  'Runtime Compatibility hydration must explicitly select local authority only in local mode.');
assert.match(operationsService, /isLocalBusinessAdminMode[\s\S]*rawProductAvailability/,
  'Operations must bypass cloud release readiness for Product/Care only in local mode.');
assert.match(operationsService, /isLocalBusinessAdminMode[\s\S]*rawCompatibilityAvailability/,
  'Operations must bypass cloud release readiness for Compatibility only in local mode.');
assert.match(publishCenterService, /isLocalBusinessAdminMode[\s\S]*loadLocalBusinessReleaseFeed/ ,
  'Publish Center must select local Product/Care + Compatibility history before the Business release API in Local Mode.');
assert.match(publishCenterService, /localBusinessAdminStore\.getReleaseEvents\(\)/,
  'Local Publish Center must read Product/Care release history from the local authority.');
assert.match(publishCenterService, /localCompatibilityAdminStore\.getReleaseEvents\(\)/,
  'Local Publish Center must read Compatibility release history from the local authority.');
assert.doesNotMatch(localStore, /isLocalBusinessAdminMode\s*=\s*runtimeEnv(?:\?\.)?\.VITE_ADMIN_LOCAL_MODE\s*===\s*'true'/,
  'The local flag alone must never be sufficient to enable local authority.');

console.log('local admin mode contract: DEV-only, guarded Product/Care + Compatibility + Care SEO + Operations routing PASS');
