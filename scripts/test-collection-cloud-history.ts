import assert from 'node:assert/strict';
import type { AquaGuideRepository } from '../src/services/repository/aquaguide.repository';
import { loadKeepingHistoryFromRepository } from '../src/services/collection/keeping-history.service';

const repository = {
  async getAquariums() {
    return [{
      id: 'cloud-tank',
      name: '云端履历缸',
      fishes: [{
        id: 'cloud-stock',
        fishId: 'cloud-fish-a',
        quantity: 2,
        entryDate: '2026-10-01T08:00:00.000Z',
        batches: [{
          id: 'cloud-batch',
          quantity: 2,
          entryDate: '2026-10-01T08:00:00.000Z',
          lifeStage: 'adult' as const,
        }],
      }],
    }];
  },
  async getCareReminders() { return []; },
  async getCareEvents() {
    return [{
      id: 'cloud-event-remove',
      aquariumId: 'deleted-cloud-tank',
      eventType: 'species_removed' as const,
      title: '云端移出记录',
      payload: { speciesId: 'cloud-fish-b', quantity: 1 },
      occurredAt: '2026-10-03T08:00:00.000Z',
      sourceType: 'livestock_removal',
      sourceId: 'cloud-remove-b',
      isInferred: false,
    }, {
      id: 'cloud-event-observation',
      aquariumId: 'cloud-tank',
      eventType: 'observation' as const,
      title: '记录观察',
      label: '呼吸正常',
      payload: {},
      occurredAt: '2026-10-04T08:00:00.000Z',
      sourceType: 'observation_record',
      sourceId: 'cloud-observation',
      isInferred: false,
    }, {
      id: 'cloud-tank:daily_check:diagnosis_record:diag-cloud-1',
      aquariumId: 'cloud-tank',
      eventType: 'daily_check' as const,
      title: '完成鱼只异常',
      label: '需要继续观察',
      payload: { riskLevel: 'medium' },
      occurredAt: '2026-10-04T09:00:00.000Z',
      sourceType: 'diagnosis_record',
      sourceId: 'diag-cloud-1',
      isInferred: false,
    }];
  },
  async getDiagnosisRecords(aquariumId: string) {
    if (aquariumId !== 'cloud-tank') return [];
    return [{
      id: 'db-diagnosis-1',
      diagnosisId: 'diag-cloud-1',
      createdAt: '2026-10-04T09:00:00.000Z',
      aquariumId: 'cloud-tank',
      source: { type: 'home' as const },
      problemType: '鱼只异常',
      answers: {},
      resultSummary: '需要继续观察',
      riskLevel: '中风险',
      riskCode: 'medium' as const,
      suggestedActions: ['继续观察'],
      missingInfo: [],
      followUpNotes: [],
    }];
  },
  async getMemorials() {
    return [{
      id: 'cloud-memorial',
      fishId: 'cloud-fish-c',
      date: '2026-10-05T12:00:00.000Z',
      reason: '云端纪念',
    }];
  },
} as AquaGuideRepository;

const result = await loadKeepingHistoryFromRepository(repository);

assert.equal(result.memorials.length, 1);
assert.equal(result.history.activeCohorts.length, 1);
assert.deepEqual(result.history.currentSpeciesIds, ['cloud-fish-a']);
assert.deepEqual(result.history.speciesEverKeptIds, ['cloud-fish-a', 'cloud-fish-b', 'cloud-fish-c']);
assert.equal(result.history.events.some(event => event.sourceId === 'cloud-observation'), true);
assert.equal(result.history.events.some(event => event.aquariumId === 'deleted-cloud-tank'), true, 'explicit history must survive removal of the current aquarium');
assert.equal(result.history.events.some(event => event.sourceType === 'compatibility_record'), false, 'cloud history must not mix stale local compatibility records');
assert.equal(result.history.events.filter(event => event.sourceType === 'diagnosis_record').length, 1, 'persisted diagnosis event must override the derived DB projection instead of appearing twice');
assert.equal(result.history.events.find(event => event.sourceType === 'diagnosis_record')?.isInferred, false, 'explicit diagnosis history must win over inferred projection');
assert.equal(result.history.events.filter(event => event.sourceType === 'observation_record').length, 1, 'cloud history must contain the cloud observation exactly once');

console.log('collection cloud history verified: repository aquariums, diagnoses, care events and memorials form isolated cloud husbandry history with diagnosis de-duplication and no stale local-state leakage');
