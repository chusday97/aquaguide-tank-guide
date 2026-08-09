import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium } from '../../types';
import {
  completeCareReminder,
  configureCareReminderRecurrence,
  deleteCareReminder,
  getCareReminders,
  rescheduleCareReminder,
  upsertCareReminder,
} from '../care/care-activity.service';
import { recordCareTimelineEvent, removeCareTimelineEvent } from '../care/care-timeline.service';
import { recordSpeciesMemorial, recordSpeciesMemorialAndDecrementBatch, updateSpeciesMemorial } from '../collection/memorial.service';
import { persistDiagnosisRecords, upsertDiagnosisRecord } from '../diagnosis/diagnosis-records.service';
import {
  addSpeciesFavorite,
  getCareFavorites,
  getSpeciesFavoriteIds,
  setCareFavorites,
  setSpeciesFavoriteIds,
} from '../favorites/favorites.service';
import { loadAppStateFromStorage } from '../storage/local-app-state';
import { persistAquariums } from '../aquarium/aquarium-state.service';
import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';
import type {
  AquaGuideRepository,
  AquariumCreateCommand,
  CareReminderMutation,
  FavoriteMutation,
  MemorialSaveInput,
  MemorialUpdateInput,
  LivestockMemorialSaveInput,
  LivestockRemovalInput,
  LivestockAddCommand,
  CareTimelineMutation,
} from './aquaguide.repository';

export class LocalAquaGuideRepository implements AquaGuideRepository {
  async getAquariums() {
    return loadAppStateFromStorage().aquariums;
  }

  async createAquarium(input: AquariumCreateCommand) {
    const replayId = `aquarium_${input.operationId}`;
    const replay = loadAppStateFromStorage().aquariums.find(item => item.id === replayId);
    if (replay) return replay;
    return this.saveAquarium({
      id: replayId,
      name: input.name,
      fishes: [],
      startedAt: input.startedAt,
      startedAtSource: input.startedAtSource,
    });
  }

  async addLivestock(input: LivestockAddCommand) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('记录数量必须是正整数。');
    const state = loadAppStateFromStorage();
    const aquarium = state.aquariums.find(item => item.id === input.aquariumId);
    if (!aquarium) throw new Error('没有找到需要记录生物的鱼缸。');
    const batchId = `livestock_${input.operationId}`;
    if (aquarium.fishes.some(item => item.batches?.some(batch => batch.id === batchId))) return aquarium;
    const current = aquarium.fishes.find(item => item.fishId === input.speciesCatalogKey);
    const nextRecord = current
      ? appendSpeciesBatch(current, {
          id: batchId,
          quantity: input.quantity,
          entryDate: input.entryDate,
          lifeStage: input.lifeStage,
          reproductiveState: input.reproductiveState,
        })
      : {
          id: `species_${input.operationId}`,
          fishId: input.speciesCatalogKey,
          quantity: input.quantity,
          entryDate: input.entryDate,
          batches: [createSpeciesBatch({
            id: batchId,
            quantity: input.quantity,
            entryDate: input.entryDate,
            lifeStage: input.lifeStage,
            reproductiveState: input.reproductiveState,
          })],
        };
    return this.saveAquarium({
      ...aquarium,
      fishes: current
        ? aquarium.fishes.map(item => item.id === current.id ? nextRecord : item)
        : [...aquarium.fishes, nextRecord],
    });
  }

  async saveAquarium(aquarium: Aquarium) {
    const state = loadAppStateFromStorage();
    const exists = state.aquariums.some(item => item.id === aquarium.id);
    const aquariums = exists
      ? state.aquariums.map(item => item.id === aquarium.id ? aquarium : item)
      : [...state.aquariums, aquarium];
    return persistAquariums(aquariums, aquarium.id).aquariums.find(item => item.id === aquarium.id)!;
  }

  async removeLivestock(input: LivestockRemovalInput) {
    const state = loadAppStateFromStorage();
    const aquarium = state.aquariums.find(item => item.id === input.aquariumId);
    if (!aquarium) throw new Error('没有找到需要更新的鱼缸。');
    const current = aquarium.fishes.find(item => item.id === input.aquariumFishId);
    if (!current) throw new Error('没有找到需要移出的缸内物种。');
    const updated = removeSpeciesBatchQuantity(current, input.batchId, input.quantity);
    const nextAquarium = {
      ...aquarium,
      fishes: updated
        ? aquarium.fishes.map(item => item.id === current.id ? updated : item)
        : aquarium.fishes.filter(item => item.id !== current.id),
    };
    return this.saveAquarium(nextAquarium);
  }

  async updateFavorite(input: FavoriteMutation) {
    if (input.type === 'species') {
      if (input.favorite) addSpeciesFavorite(input.catalogKey);
      else setSpeciesFavoriteIds(getSpeciesFavoriteIds().filter(id => id !== input.catalogKey));
      return;
    }
    const favorites = getCareFavorites();
    if (input.favorite) favorites[input.catalogKey] = { id: input.catalogKey, title: input.title, favoritedAt: new Date().toISOString() };
    else delete favorites[input.catalogKey];
    setCareFavorites(favorites);
  }

  async saveDiagnosis(record: DiagnosisRecord) {
    const current = loadAppStateFromStorage().diagnosisRecords as DiagnosisRecord[];
    persistDiagnosisRecords(upsertDiagnosisRecord(current, record));
    return record;
  }

  async saveMemorial(input: MemorialSaveInput) {
    return recordSpeciesMemorial({
      fishId: input.speciesCatalogKey,
      date: input.date,
      causeCodes: input.causeCodes,
      reason: input.reason,
      observation: input.observation,
      improvement: input.improvement,
    }).record;
  }

  async saveLivestockMemorial(input: LivestockMemorialSaveInput) {
    const saved = recordSpeciesMemorialAndDecrementBatch({
      fishId: input.speciesCatalogKey,
      date: input.date,
      causeCodes: input.causeCodes,
      reason: input.reason,
      observation: input.observation,
      improvement: input.improvement,
      aquariumId: input.aquariumId,
      aquariumFishId: input.aquariumFishId,
      batchId: input.batchId,
    });
    return { record: saved.record, aquarium: saved.aquariums.find(item => item.id === input.aquariumId)! };
  }

  async updateMemorial(input: MemorialUpdateInput) {
    return updateSpeciesMemorial(input);
  }

  async getCareReminders() {
    return getCareReminders();
  }

  async updateCareReminder(input: CareReminderMutation) {
    if (input.action === 'upsert') return upsertCareReminder(input.record);
    if (input.action === 'complete') return completeCareReminder(input.id, input.completedAt);
    if (input.action === 'reschedule') return rescheduleCareReminder(input.id, input.scheduledFor, input.label);
    if (input.action === 'recurrence') return configureCareReminderRecurrence(input.id, input.repeatEnabled, input.repeatIntervalDays);
    deleteCareReminder(input.id);
    return null;
  }

  async getCareEvents(aquariumId?: string) {
    return (loadAppStateFromStorage().careEvents || []).filter(item => !aquariumId || item.aquariumId === aquariumId);
  }

  async saveCareEvent(input: CareTimelineMutation) {
    const { operationId: _operationId, ...record } = input;
    return recordCareTimelineEvent(record);
  }

  async removeCareEventBySource(input: { aquariumId: string; sourceType: string; sourceId: string; operationId?: string }) {
    removeCareTimelineEvent(input.aquariumId, input.sourceType, input.sourceId);
  }
}
