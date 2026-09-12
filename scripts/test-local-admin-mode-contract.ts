import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');
const localStore = read('src/services/admin/local-business-admin.store.ts');
const localAssetStore = read('src/services/admin/local-asset.store.ts');
const localFilePersistence = read('src/services/admin/local-file-persistence.ts');
const localFileRouter = read('apps/api/src/routes/local-admin.ts');
const localApiApp = read('apps/api/src/app.ts');
const productionV1Router = read('apps/api/src/routes/index.ts');
const localDevScript = read('scripts/dev-local-admin.mjs');
const devWithApiScript = read('scripts/dev-with-api.mjs');
const seoAdminNavigation = read('src/services/admin/seo-admin-navigation.ts');
const operationsUi = read('src/pages/AdminHub.tsx');
const viteConfig = read('vite.config.ts');
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
assert.match(contentService, /isLocalAdminFileMode \? await putLocalFileAsset\(assetId, file\) : await localAssetStore\.put\(assetId, file\)/,
  'Durable Local File Mode must write assets to disk while browser-only Local Mode retains IndexedDB fallback.');
assert.match(contentService, /fetch\(`\/api\/v1\/admin\/assets\?\$\{query\}`/,
  'Deployed asset upload must keep the Business API asset authority.');
assert.match(localAssetStore, /indexedDB\.open\(DB_NAME, DB_VERSION\)/,
  'Local image persistence must use IndexedDB rather than large localStorage payloads.');
assert.match(localAssetStore, /MAX_BYTES = 20 \* 1024 \* 1024/,
  'Local image upload must preserve the existing 20MB safety limit.');
assert.match(localFilePersistence, /runtimeEnv\?\.DEV === true[\s\S]*VITE_ADMIN_LOCAL_FILE_MODE === 'true'/,
  'Durable Local File Mode must require DEV + Local Mode + explicit Local File flag.');
assert.match(localFilePersistence, /apiRequest\(`\/local-admin\/state\/\$\{partition\}`[\s\S]*method: 'PUT'/,
  'Durable Local File state writes must cross the local API boundary.');
assert.match(localFileRouter, /process\.env\.ADMIN_LOCAL_FILE_MODE === 'true'[\s\S]*process\.env\.NODE_ENV !== 'production'[\s\S]*!process\.env\.VERCEL/,
  'Local File API must be unavailable in Production and Vercel environments.');
assert.match(localApiApp, /import \{ localAdminFileRouter \} from '\.\/routes\/local-admin';[\s\S]*legacyApp\.use\('\/api\/v1\/local-admin', requestIdMiddleware, localAdminFileRouter\)/,
  'Local File API must be mounted only by the local Node server.');
assert.doesNotMatch(productionV1Router, /local-admin|localAdminFileRouter/,
  'Production v1 router must not import the DEV-only Local File router or its filesystem trace.');
assert.match(localFileRouter, /atomicJsonWrite[\s\S]*rename\(temp, filePath\)/,
  'Local partition JSON must use atomic temp-file replacement.');
assert.match(localDevScript, /ADMIN_LOCAL_FILE_MODE = 'true'[\s\S]*VITE_ADMIN_LOCAL_FILE_MODE = 'true'/,
  'The dedicated local-admin dev entrypoint must enable both server and browser Durable File guards.');
assert.match(localDevScript, /START_SEO_ADMIN = 'true'[\s\S]*VITE_SEO_ADMIN_PORT/,
  'The Local Admin entrypoint must explicitly start and configure the standalone Species SEO dev app.');
assert.match(devWithApiScript, /START_SEO_ADMIN === 'true'[\s\S]*detectExistingSeoAdmin[\s\S]*AquaGuide Species SEO Admin[\s\S]*apps\/admin-content/,
  'The shared dev launcher must start Species SEO only for Local Admin mode and reuse the canonical app when that port is already healthy.');
assert.match(devWithApiScript, /already serving another application/,
  'A Local SEO port occupied by another app must fail clearly instead of silently reusing the wrong service.');
assert.match(seoAdminNavigation, /VITE_SEO_ADMIN_PORT[\s\S]*3010[\s\S]*admin\/seo/,
  'Local standalone SEO navigation must share the configured dev port while deployed /admin/seo/ paths remain stable.');
assert.match(viteConfig, /process\.env\.API_PORT \|\| env\.API_PORT \|\| '8787'/,
  'Vite proxy must honor an externally assigned API port so Local Admin cannot accidentally connect to another local project.');
assert.match(operationsUi, /operations-local-persistence[\s\S]*磁盘已持久化/,
  'Operations Home must expose the active Durable Local File persistence state without adding a write authority.');
assert.match(localStore, /if \(isLocalAdminFileMode\)[\s\S]*MIGRATION_REJECTED[\s\S]*Local Business 文件状态无效/,
  'Durable Product/Care state corruption must fail closed instead of silently replacing disk authority with seed data.');
assert.match(read('src/services/admin/local-compatibility-admin.store.ts'), /if \(isLocalAdminFileMode\)[\s\S]*MIGRATION_REJECTED[\s\S]*Local Compatibility 文件状态无效/,
  'Durable Compatibility state corruption must fail closed instead of silently replacing reviewed authority.');
assert.match(localCareSeoStore, /if \(isLocalAdminFileMode\)[\s\S]*MIGRATION_REJECTED[\s\S]*Local Care SEO 文件状态无效/,
  'Durable Care SEO state corruption must fail closed instead of silently replacing Editorial history.');
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
