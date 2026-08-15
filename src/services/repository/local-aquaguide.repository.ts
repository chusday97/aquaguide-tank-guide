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
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';
import { persistAquariums } from '../aquarium/aquarium-state.service';
import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';
import { applyWaterChangeHistory, isFutureWaterChangeDate, setWaterChangeDateRecorded, waterChangeDateToIso } from '../aquarium/water-change.service';
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
  CareTimelineRecord,
  WaterChangeMutation,
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

  async setWaterChange(input: WaterChangeMutation) {
    const state = loadAppStateFromStorage();
    const aquarium = state.aquariums.find(item => item.id === input.aquariumId);
    if (!aquarium) throw new Error('没有找到需要记录换水的鱼缸。');
    if (isFutureWaterChangeDate(input.date)) throw new Error('只能记录今天或过去实际发生的换水。');
    const occurredAt = waterChangeDateToIso(input.date);
    if (!occurredAt) throw new Error('换水日期无效。');
    const nextHistory = setWaterChangeDateRecorded(aquarium.waterChangeHistory || [], input.date, input.recorded);
    const nextAquarium = applyWaterChangeHistory(aquarium, nextHistory);
    const currentEvents = (state.careEvents || []) as CareTimelineRecord[];
    const sameDayEvent = (event: CareTimelineRecord) => event.aquariumId === input.aquariumId
      && event.eventType === 'water_change'
      && event.sourceType === 'water_change_day'
      && event.sourceId === input.date;
    const retainedEvents = currentEvents.filter(event => !sameDayEvent(event));
    const nextEvents: CareTimelineRecord[] = input.recorded
      ? [{
          id: `water-change:${input.aquariumId}:${input.date}`,
          aquariumId: input.aquariumId,
          eventType: 'water_change',
          title: '换水记录',
          label: input.date,
          payload: { localDate: input.date },
          occurredAt,
          sourceType: 'water_change_day',
          sourceId: input.date,
          isInferred: false,
        }, ...retainedEvents]
      : retainedEvents;
    const nextAquariums = state.aquariums.map(item => item.id === input.aquariumId ? nextAquarium : item);
    patchLocalAppState({ aquariums: nextAquariums, careEvents: nextEvents });
    return nextAquarium;
  }

  async saveAquarium(aquarium: Aquarium) {
    const state = loadAppStateFromStorage();
    const exists = state.aquariums.some(item => item.id === aquarium.id);
    const aquariums = exists
      ? state.aquariums.map(item => item.id === aquarium.id ? aquarium : item)
      : [...state.aquariums, aquarium];
    return persistAquariums(aquariums, aquarium.id).aquariums.find(item => item.id === aquarium.id)!;
  }

  async deleteAquarium(aquariumId: string) {
    const state = loadAppStateFromStorage();
    if (!state.aquariums.some(item => item.id === aquariumId)) return;
    const remaining = state.aquariums.filter(item => item.id !== aquariumId);
    if (remaining.length === 0) throw new Error('至少需要保留一个鱼缸。');
    const nextActiveId = state.currentAquariumId && remaining.some(item => item.id === state.currentAquariumId)
      ? state.currentAquariumId
      : remaining[0].id;
    persistAquariums(remaining, nextActiveId);
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
