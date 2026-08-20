import assert from 'node:assert/strict';
import { sanitizedAquariumReportSchema } from '../packages/contracts/src/share-reports';
import { hashShareToken } from '../apps/api/src/routes/share-reports';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rawToken = 'A'.repeat(43);
assert.equal(hashShareToken(rawToken).length, 64);
assert.equal(hashShareToken(rawToken), hashShareToken(rawToken));
assert.notEqual(hashShareToken(rawToken), hashShareToken('B'.repeat(43)));

const parsed = sanitizedAquariumReportSchema.parse({
  snapshotVersion: 1,
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  health: { score: 80, status: '正常', reasons: ['记录稳定'], missingData: [] },
  environment: { waterType: 'Freshwater', volumeLiters: 82, targetTemperatureC: 25, equipment: ['过滤'] },
  species: [{ catalogKey: 'guppy', name: '孔雀鱼', quantity: 6, internalId: 'must-strip' }],
  weeklyCarePlan: [],
  disclaimer: '仅根据用户记录生成。',
  ownerId: 'must-strip',
  aquariumName: 'must-strip',
  userDescription: 'must-strip',
  aiRawResponse: 'must-strip',
});

const serialized = JSON.stringify(parsed);
for (const forbidden of ['ownerId', 'aquariumName', 'userDescription', 'aiRawResponse', 'internalId']) {
  assert.equal(serialized.includes(forbidden), false, `forbidden field leaked: ${forbidden}`);
}

const updateLockMigration = readFileSync(resolve('supabase/migrations/202607290002_lock_share_report_updates.sql'), 'utf8');
assert.match(updateLockMigration, /drop policy if exists aquarium_share_reports_owner_update/);
assert.doesNotMatch(updateLockMigration, /create policy .*update/i);

const insertLockMigration = readFileSync(resolve('supabase/migrations/202607290003_lock_share_report_inserts.sql'), 'utf8');
assert.match(insertLockMigration, /drop policy if exists aquarium_share_reports_owner_insert/);
assert.doesNotMatch(insertLockMigration, /create policy .*insert/i);

const shareRoute = readFileSync(resolve('apps/api/src/routes/share-reports.ts'), 'utf8');
assert.match(shareRoute, /const adminClient = getAdminSupabase\(\);[\s\S]*adminClient[\s\S]*\.from\('aquarium_share_reports'\)[\s\S]*\.upsert/);

const apiConfigSource = readFileSync(resolve('apps/api/src/config.ts'), 'utf8');
assert.match(
  apiConfigSource,
  /shareTokenSecret:\s*process\.env\.SHARE_TOKEN_SECRET\s*\|\|\s*''/,
  'share-report signing must require an explicit SHARE_TOKEN_SECRET',
);
assert.doesNotMatch(
  apiConfigSource,
  /shareTokenSecret:[^\n]*SUPABASE_SERVICE_ROLE_KEY/,
  'Supabase service-role credentials must never be reused as the share-token signing secret',
);

const releaseAcceptance = readFileSync(resolve('.github/workflows/rc1-release-acceptance.yml'), 'utf8');
assert.match(
  releaseAcceptance,
  /npm run test:share-report-contract/,
  'RC1 release acceptance must enforce the share-report security contract before production',
);

const healthRoute = readFileSync(resolve('apps/api/src/routes/index.ts'), 'utf8');
assert.match(
  healthRoute,
  /shareReportsConfigured:\s*isShareReportsConfigured\(\)/,
  'business-health must expose a boolean share-report readiness signal without exposing secret values',
);

const postDeploySmoke = readFileSync(resolve('scripts/verify-rc1-deployment.mjs'), 'utf8');
assert.match(
  postDeploySmoke,
  /"shareReportsConfigured":true/,
  'post-deploy smoke must fail if the deployed share-report signing/admin dependencies are not configured',
);

console.log('share report contract: ok');
