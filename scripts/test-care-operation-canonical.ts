import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCompletedCareOperationsFromEvents } from '../src/services/care/care-activity.service';

const canonical = getCompletedCareOperationsFromEvents([
  {
    aquariumId: 'tank-a',
    eventType: 'care_operation_completed',
    title: 'Acclimation',
    label: '已完成过水',
    occurredAt: '2026-08-16T01:00:00.000Z',
    sourceType: 'care_operation',
    sourceId: 'guide_new_fish_acclimation',
  },
  {
    aquariumId: 'tank-b',
    eventType: 'care_operation_completed',
    title: 'Acclimation B',
    label: '已完成过水',
    occurredAt: '2026-08-16T02:00:00.000Z',
    sourceType: 'care_operation',
    sourceId: 'guide_new_fish_acclimation',
  },
  {
    aquariumId: 'tank-a',
    eventType: 'care_plan_completed',
    title: 'Wrong taxonomy',
    label: 'wrong',
    occurredAt: '2026-08-16T03:00:00.000Z',
    sourceType: 'care_operation',
    sourceId: 'guide_filter_cleaning',
  },
  {
    aquariumId: 'tank-a',
    eventType: 'care_operation_completed',
    title: 'Wrong source',
    label: 'wrong',
    occurredAt: '2026-08-16T04:00:00.000Z',
    sourceType: 'care_reminder',
    sourceId: 'guide_filter_cleaning',
  },
]);

assert.equal(canonical.length, 2, 'same guide completed in different tanks must remain two separate facts');
assert.equal(getCompletedCareOperationsFromEvents(canonical.map(item => ({
  aquariumId: item.aquariumId,
  eventType: 'care_operation_completed',
  title: item.title,
  label: item.label,
  occurredAt: item.completedAt,
  sourceType: 'care_operation',
  sourceId: item.id,
})), 'tank-a').length, 1, 'completion must be aquarium-scoped');

const carePage = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');
const contract = fs.readFileSync('packages/contracts/src/business.ts', 'utf8');
const databaseTypes = fs.readFileSync('src/types/database.ts', 'utf8');

const required = [
  "eventType: 'care_operation_completed'",
  "sourceType: 'care_operation'",
  'operationId: `care-operation:v1:${activeAquarium.id}:${topic.id}`',
  'await repository.saveCareEvent({',
  'const events = await repository.getCareEvents();',
  'patchLocalAppState({ careEvents: events });',
  "if (mode === 'cloud')",
  'setCompletedCareOperations(getCompletedCareOperationsFromEvents(events));',
  '!state.cloudMigrationConfirmed',
  'getCompletedCareOperationsFromEvents(state.careEvents || [], activeAquarium.id)',
  "'care_operation_completed'",
];

for (const snippet of required.slice(0, -1)) {
  if (!carePage.includes(snippet)) throw new Error(`Care operation canonical contract missing: ${snippet}`);
}
if (!contract.includes("'care_operation_completed'")) throw new Error('API contract does not allow care_operation_completed');
if (!databaseTypes.includes("| 'care_operation_completed'")) throw new Error('frontend CareEventType does not include care_operation_completed');

const forbidden = [
  "setIsOperationCompleted(getCompletedCareOperations().some(item => item.id === topic.id))",
  "label.includes('换水') || label.toLowerCase().includes('water')",
];
for (const snippet of forbidden) {
  if (carePage.includes(snippet)) throw new Error(`Care operation still uses legacy/factual shortcut: ${snippet}`);
}

console.log('Canonical care operation contract passed');
