import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assetUploadQuerySchema,
  careArticleAdminInputSchema,
  speciesAdminInputSchema,
} from '../packages/contracts/src/index';

const root = resolve(import.meta.dirname, '..');
const migration = readFileSync(resolve(root, 'supabase/migrations/202607160001_core_schema.sql'), 'utf8');
const publicationMigration = readFileSync(resolve(root, 'supabase/migrations/202609040001_product_care_publication_snapshots.sql'), 'utf8');
const adminRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const contentRoute = readFileSync(resolve(root, 'apps/api/src/routes/content.ts'), 'utf8');
const publicationBoundary = readFileSync(resolve(root, 'apps/api/src/content-publications.ts'), 'utf8');
const contentMapper = readFileSync(resolve(root, 'apps/api/src/content-mappers.ts'), 'utf8');
const vercelConfig = readFileSync(resolve(root, 'vercel.json'), 'utf8');
const vercelV1Router = readFileSync(resolve(root, 'api/v1/router.ts'), 'utf8');
const vercelBusinessApiBuild = readFileSync(resolve(root, 'scripts/build-vercel-business-api.mjs'), 'utf8');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
const runtimeCatalog = readFileSync(resolve(root, 'src/data/runtimeContentCatalog.ts'), 'utf8');
const adminContentPage = readFileSync(resolve(root, 'src/pages/AdminContent.tsx'), 'utf8');
const aquariumPage = readFileSync(resolve(root, 'src/pages/Aquarium.tsx'), 'utf8');
const identifyPage = readFileSync(resolve(root, 'src/pages/Identify.tsx'), 'utf8');
const encyclopediaPage = readFileSync(resolve(root, 'src/pages/Encyclopedia.tsx'), 'utf8');
const careEncyclopediaPage = readFileSync(resolve(root, 'src/pages/CareEncyclopedia.tsx'), 'utf8');

assert.equal(speciesAdminInputSchema.safeParse({}).success, false);
assert.equal(careArticleAdminInputSchema.safeParse({}).success, false);
assert.equal(assetUploadQuerySchema.safeParse({
  contentType: 'species',
  contentId: 'ae1732a3-27d0-4820-986c-2e932990f570',
  fileName: 'fish.png',
}).success, true);

assert.match(adminRoute, /requireAuth, requireAdmin/);
assert.match(adminRoute, /express\.raw\(/);
assert.match(adminRoute, /sharp\(request\.body\)/);
assert.match(adminRoute, /catalog-originals/);
assert.match(adminRoute, /catalog-public/);
assert.match(adminRoute, /finishIdempotentWrite/);
assert.match(adminRoute, /supersededIds/);

assert.match(migration, /storage_bucket = 'catalog-public'.*species/s);
assert.match(migration, /storage_bucket = 'catalog-public'.*care_articles/s);
assert.match(contentMapper, /row\.storage_bucket === 'catalog-public'/);

assert.match(publicationMigration, /create table if not exists public\.content_publications/);
assert.match(publicationMigration, /publish_content_snapshot/);
assert.match(publicationMigration, /archive_content_snapshot/);
assert.match(publicationMigration, /grant execute on function public\.publish_content_snapshot[^;]+to service_role/s);
assert.doesNotMatch(publicationMigration, /grant execute on function public\.publish_content_snapshot[^;]+to (?:anon|authenticated)/s);
assert.match(adminRoute, /ensurePublishedSnapshotBeforeDraft\('species'/);
assert.match(adminRoute, /ensurePublishedSnapshotBeforeDraft\('care'/);
assert.match(adminRoute, /status: 'draft'/);
assert.match(adminRoute, /rpc\('publish_content_snapshot'/);
assert.match(adminRoute, /rpc\('archive_content_snapshot'/);
assert.match(publicationBoundary, /buildPublicationSnapshot/);
assert.match(contentRoute, /from\('content_publications'\)/);
assert.match(adminRoute, /repair-publication-snapshot/, 'Admin API must expose a protected Care publication-snapshot repair route.');
assert.match(adminRoute, /ensurePublishedSnapshotBeforeDraft\('care', id\)/, 'Snapshot repair must reuse the existing immutable publication guard instead of republishing content.');
assert.match(adminContentPage, /!isLocalBusinessAdminMode[\s\S]{0,180}requestedSnapshotRepair/, 'Legacy snapshot repair UI must stay unavailable in Local Mode.');
assert.match(adminContentPage, /fieldset disabled=\{isSnapshotRepair\}/, 'Snapshot repair must lock Product\/Care fields instead of allowing content edits during maintenance.');
assert.match(adminContentPage, /selected && !isSnapshotRepair[\s\S]{0,180}content-review-reference/, 'Snapshot repair must hide downstream review\/SEO tools until maintenance context clears.');
assert.match(contentRoute, /publicationKeys/);
assert.match(contentRoute, /isPublicationStoreNotMigrated/);
assert.match(contentRoute, /contentRouter\.get\('\/content-bootstrap'/);
assert.match(vercelConfig, /\"source\": \"\/api\/v1\/:path\*\"/);
assert.match(vercelConfig, /\"destination\": \"\/api\/v1\/router\"/);
assert.match(vercelV1Router, /createBusinessApiApp/);
assert.match(vercelV1Router, /from '\.\/business-app\.bundle\.mjs'/, 'Vercel wrapper must load the generated Business API bundle instead of the raw TypeScript import graph.');
assert.match(vercelBusinessApiBuild, /entryPoints:[\s\S]*apps\/api\/src\/business-app\.ts/);
assert.match(vercelBusinessApiBuild, /bundle: true[\s\S]*platform: 'node'[\s\S]*format: 'esm'[\s\S]*packages: 'external'/, 'Vercel Business API build must bundle local ESM imports while keeping npm packages external.');
assert.match(packageJson.scripts?.build || '', /^npm run build:business-api && /, 'Production build must generate the Vercel Business API bundle before Vercel traces serverless functions.');
assert.match(runtimeCatalog, /hydratePublishedContentCatalog/);
assert.match(runtimeCatalog, /runtimeFishData/);
assert.match(runtimeCatalog, /runtimeCareTopicsData/);
assert.match(encyclopediaPage, /runtimeFishData as fishData/);
assert.match(careEncyclopediaPage, /runtimeCareTopicsData as careTopicsData/);
assert.match(aquariumPage, /runtimeCareTopicsData as careTopicsData/);
assert.match(identifyPage, /runtimeCareTopicsData as careTopicsData/);

console.log('admin content contract verified: protected CRUD, publication snapshots, draft isolation, runtime API routing and private-original isolation');
