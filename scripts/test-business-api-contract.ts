import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  aquariumCreateSchema,
  aquariumSpeciesCreateSchema,
  aquariumSpeciesBatchCreateSchema,
  aquariumSpeciesBatchSplitSchema,
  aquariumSpeciesBatchMergeSchema,
  aquariumSpeciesBatchRemovalSchema,
  careReminderCreateSchema,
  diagnosisSaveSchema,
  feedbackCreateSchema,
  feedbackStatusUpdateSchema,
  profilePreferencesUpdateSchema,
} from '../packages/contracts/src/index';
import { clampAiPriority, highestRisk } from '../packages/domain-rules/src/index';
import { camelize, deterministicUuid, snakeize } from '../apps/api/src/data-utils';

assert.equal(aquariumCreateSchema.safeParse({ name: '客厅缸', lengthCm: 60 }).success, true);
assert.equal(aquariumCreateSchema.safeParse({ name: '', lengthCm: -1 }).success, false);
assert.equal(aquariumSpeciesCreateSchema.safeParse({ speciesCatalogKey: 'sp_0001', quantity: 3, entryDate: '2026-07-16' }).success, true);
assert.equal(aquariumSpeciesBatchCreateSchema.safeParse({ quantity: 2, entryDate: '2026-07-16', lifeStage: 'juvenile', reproductiveState: 'normal' }).success, true);
assert.equal(aquariumSpeciesBatchSplitSchema.safeParse({ quantity: 1, lifeStage: 'adult', reproductiveState: 'pregnant_or_gravid', sourceVersion: 1 }).success, true);
assert.equal(aquariumSpeciesBatchSplitSchema.safeParse({ quantity: 0, lifeStage: 'adult', reproductiveState: 'normal', sourceVersion: 1 }).success, false);
assert.equal(aquariumSpeciesBatchMergeSchema.safeParse({ sourceBatchId: '00000000-0000-4000-8000-000000000001', targetEntryDate: '2026-07-16', targetLifeStage: 'adult', targetReproductiveState: 'normal', targetVersion: 1, sourceVersion: 1 }).success, true);
assert.equal(aquariumSpeciesBatchRemovalSchema.safeParse({ quantity: 2 }).success, true);
assert.equal(aquariumSpeciesBatchRemovalSchema.safeParse({ quantity: 1.5 }).success, false);
assert.equal(aquariumSpeciesBatchRemovalSchema.safeParse({ quantity: 0 }).success, false);
assert.equal(careReminderCreateSchema.safeParse({ sourceCatalogKey: 'guide_water', title: '换水', reminderType: '换水', scheduledFor: '2026-07-17T08:00:00+08:00' }).success, true);
assert.equal(diagnosisSaveSchema.safeParse({ diagnosisKey: 'daily', answers: {}, resultSummary: '正常', riskLevel: '低' }).success, true);
assert.equal(profilePreferencesUpdateSchema.safeParse({ version: 1, onboarding: { version: 1, status: 'pending', goal: 'build_tank', viewedSpecies: false, taskCardDismissed: false } }).success, true);
assert.equal(profilePreferencesUpdateSchema.safeParse({ version: 1 }).success, false);
assert.equal(feedbackCreateSchema.safeParse({
  category: 'suggestion',
  message: '希望风险建议可以直接定位到对应物种。',
  pagePath: '/settings#feedback',
  locale: 'zh-CN',
  appVersion: 'local-preview',
  deviceLayout: 'desktop',
}).success, true);
assert.equal(feedbackCreateSchema.safeParse({
  category: 'problem',
  message: '太短',
  pagePath: '/settings',
  locale: 'zh-CN',
  appVersion: 'local-preview',
  deviceLayout: 'phone',
}).success, false);
assert.equal(feedbackStatusUpdateSchema.safeParse({ status: 'reviewed' }).success, true);

const firstId = deterministicUuid('user:operation:key');
assert.equal(firstId, deterministicUuid('user:operation:key'));
assert.notEqual(firstId, deterministicUuid('user:operation:other'));
assert.match(firstId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

assert.deepEqual(snakeize({ targetTemperatureC: 25, lastWaterStoredAt: undefined }), { target_temperature_c: 25 });
assert.deepEqual(camelize({ target_temperature_c: 25, nested_rows: [{ created_at: 'now' }] }), {
  targetTemperatureC: 25,
  nestedRows: [{ createdAt: 'now' }],
});

assert.equal(clampAiPriority('high', 'routine'), 'urgent');
assert.equal(clampAiPriority('low', 'watch'), 'watch');
assert.equal(highestRisk('low', 'high', 'medium'), 'high');

const routes = [
  readFileSync(resolve(import.meta.dirname, '../apps/api/src/routes/aquariums.ts'), 'utf8'),
  readFileSync(resolve(import.meta.dirname, '../apps/api/src/routes/user-records.ts'), 'utf8'),
  readFileSync(resolve(import.meta.dirname, '../apps/api/src/routes/feedback.ts'), 'utf8'),
].join('\n');
const livestockDialogSource = readFileSync(resolve(import.meta.dirname, '../src/components/aquarium/LivestockRosterDialog.tsx'), 'utf8');
const aquariumPageSource = readFileSync(resolve(import.meta.dirname, '../src/pages/Aquarium.tsx'), 'utf8');

for (const route of [
  '/aquariums',
  '/aquariums/:id/species',
  '/aquariums/:id/species/:recordId/batches',
  '/aquariums/:id/species/:recordId/batches/:batchId/split',
  '/aquariums/:id/species/:recordId/batches/:batchId/merge',
  '/aquariums/:id/species/:recordId/batches/:batchId/remove',
  '/aquariums/:id/species/:recordId/batches/:batchId/memorial',
  '/aquariums/:id/equipment',
  '/aquariums/:id/daily-checks/:localDate',
  '/memorial-records',
  '/care-reminders',
  '/care-events',
  '/feedback',
  '/feedback/:id/status',
]) {
  assert.equal(routes.includes(route), true, `${route} route must exist`);
}
assert.match(routes, /registerFavoriteRoutes\('species'\)/);
assert.match(routes, /registerFavoriteRoutes\('care'\)/);
assert.match(routes, /这个物种已有多个批次，请调整具体批次的数量/);
assert.doesNotMatch(routes, /const \{ version, \.\.\.updates \} = parsed\.data;[\s\S]{0,300}from\('aquarium_species'\)\.update\(snakeize\(updates\)\)/);
assert.match(routes, /MAX_SUBMISSIONS_PER_HOUR = 5/);
assert.match(routes, /owner_id: userId \|\| null/);
assert.match(livestockDialogSource, /createLivestockRemovalAttempt\(\)/);
assert.match(livestockDialogSource, /operationId: removal\.operationId/);
assert.match(livestockDialogSource, /markLivestockRemovalSubmitted\(current\)/);
assert.match(aquariumPageSource, /operationId: input\.operationId/);
assert.doesNotMatch(aquariumPageSource, /removeLivestockQuantity[\s\S]{0,800}crypto\.randomUUID/);

const atomicRemovalMigration = readFileSync(resolve(import.meta.dirname, '../supabase/migrations/202607260002_atomic_livestock_removal.sql'), 'utf8');
assert.match(atomicRemovalMigration, /create or replace function public\.remove_aquarium_species_batch_quantity/);
assert.match(atomicRemovalMigration, /pg_advisory_xact_lock/);
assert.match(atomicRemovalMigration, /insert into public\.idempotency_records/);
assert.match(atomicRemovalMigration, /current_batch\.quantity - removal_quantity/);
assert.ok(
  atomicRemovalMigration.indexOf('from public.idempotency_records') < atomicRemovalMigration.indexOf('from public.aquarium_species_batches batch'),
  'replay must be resolved before checking an active batch so a removed final batch can replay',
);
const removalRoute = routes.slice(routes.indexOf("aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/remove'"));
assert.ok(
  removalRoute.indexOf("client.rpc('remove_aquarium_species_batch_quantity'") < removalRoute.indexOf("aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial'"),
  'the removal endpoint must invoke the atomic replay-aware RPC',
);
assert.doesNotMatch(
  removalRoute.slice(0, removalRoute.indexOf("client.rpc('remove_aquarium_species_batch_quantity'")),
  /getOwnedSpeciesRecord/,
  'the route must not reject a replay after the final batch soft-deletes its parent',
);

const atomicCareCompletionMigration = readFileSync(resolve(import.meta.dirname, '../supabase/migrations/202608090002_atomic_care_reminder_completion.sql'), 'utf8');
assert.match(routes, /rpc\('complete_care_reminder_with_recurrence'/);
assert.match(atomicCareCompletionMigration, /for update/);
assert.match(atomicCareCompletionMigration, /pg_advisory_xact_lock/);
assert.match(atomicCareCompletionMigration, /on conflict \(id\) do nothing/);
assert.match(atomicCareCompletionMigration, /resource_type, resource_id, response_status/);
assert.doesNotMatch(
  routes.slice(routes.indexOf("userRecordsRouter.patch('/care-reminders/:id'"), routes.indexOf("userRecordsRouter.delete('/care-reminders/:id'")),
  /current plan.*completed|当前计划已完成，但下一次循环计划没有生成成功/,
  'the API must not use the old two-write completion path',
);

console.log('business API contract verified: validation, case conversion, deterministic ids, safety invariants and protected routes');
