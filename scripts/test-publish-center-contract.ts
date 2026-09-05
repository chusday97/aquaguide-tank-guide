import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const contract = readFileSync(resolve(root, 'packages/contracts/src/release-audit.ts'), 'utf8');
const apiRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin-releases.ts'), 'utf8');
const service = readFileSync(resolve(root, 'src/services/admin/publish-center.service.ts'), 'utf8');
const page = readFileSync(resolve(root, 'src/pages/PublishCenter.tsx'), 'utf8');

assert.match(contract, /ReleaseAuthority = 'product_care' \| 'compatibility' \| 'seo'/);
assert.match(contract, /ReleaseHistoryCoverage = 'current_only' \| 'revision_history' \| 'activity_history'/);
assert.match(contract, /interface ReleaseEventDto/);
assert.match(apiRoute, /adminReleasesRouter\.get\('\/'/);
assert.match(apiRoute, /content_publications/);
assert.match(apiRoute, /species_compatibility_profile_revisions/);
assert.match(apiRoute, /species_pair_compatibility_rule_revisions/);
assert.match(apiRoute, /historyCoverage: 'current_only'/);
assert.doesNotMatch(apiRoute, /\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.rpc\(/, 'Business release feed must be read-only.');
assert.match(service, /action: 'select'/);
assert.match(service, /admin_activity_log/);
assert.match(service, /content_revisions/);
assert.match(service, /import_batches/);
assert.doesNotMatch(service, /action: '(?:insert|update|upsert|delete|rpc)'/, 'SEO release adapter must be read-only.');
assert.match(page, /Publish Center 只聚合已有发布权威/);
assert.match(page, /Product\/Care 与 Compatibility 继续由 Business API \/ Supabase 管理/);
assert.match(page, /SEO 继续由独立 Repo Admin 管理/);
console.log('publish center contract: multi-authority read-only aggregation PASS');
