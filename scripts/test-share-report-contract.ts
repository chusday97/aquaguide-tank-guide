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

console.log('share report contract: ok');
