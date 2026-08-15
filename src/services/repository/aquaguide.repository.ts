import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium, DeceasedRecord, LifeStage, MemorialCauseCode, ReproductiveState } from '../../types';
import type { CareEventType } from '../../types/database';
import type { CareReminderRecord } from '../care/care-activity.service';

export type FavoriteMutation =
  | { type: 'species'; catalogKey: string; favorite: boolean }
  | { type: 'care'; catalogKey: string; title: string; favorite: boolean };

export type MemorialSaveInput = {
  aquariumId?: string;
  speciesCatalogKey: string;
  date: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
};

export type MemorialUpdateInput = {
  id: string;
  date?: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
  version?: number;
};

export type LivestockMemorialSaveInput = MemorialSaveInput & {
  aquariumId: string;
  aquariumFishId: string;
  batchId: string;
  operationId: string;
};

export type LivestockRemovalInput = {
  aquariumId: string;
  aquariumFishId: string;
  batchId: string;
  quantity: number;
  operationId: string;
};

export type AquariumCreateCommand = {
  name: string;
  startedAt: string;
  startedAtSource: 'created';
  operationId: string;
};

export type LivestockAddCommand = {
  aquariumId: string;
  speciesCatalogKey: string;
  quantity: number;
  entryDate: string;
  lifeStage?: LifeStage;
  reproductiveState?: ReproductiveState;
  operationId: string;
};

export type WaterChangeMutation = {
  aquariumId: string;
  date: string;
  recorded: boolean;
  operationId: string;
};

export type CareReminderMutation =
  | { action: 'upsert'; record: Omit<CareReminderRecord, 'id' | 'createdAt'> }
  | { action: 'complete'; id: string; completedAt: string }
  | { action: 'reschedule'; id: string; scheduledFor: string; label?: string }
  | { action: 'recurrence'; id: string; repeatEnabled: boolean; repeatIntervalDays?: number }
  | { action: 'delete'; id: string };

export type CareTimelineRecord = {
  id: string;
  aquariumId: string;
  eventType: CareEventType;
  title: string;
  label?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  sourceType?: string;
  sourceId?: string;
  isInferred: boolean;
};

export type CareTimelineMutation = Omit<CareTimelineRecord, 'id'> & { operationId: string };

export interface AquaGuideRepository {
  getAquariums(): Promise<Aquarium[]>;
  createAquarium(input: AquariumCreateCommand): Promise<Aquarium>;
  deleteAquarium(aquariumId: string): Promise<void>;
  addLivestock(input: LivestockAddCommand): Promise<Aquarium>;
  setWaterChange(input: WaterChangeMutation): Promise<Aquarium>;
  /** @deprecated Aggregate synchronization retained for legacy profile and batch editors. */
  saveAquarium(aquarium: Aquarium): Promise<Aquarium>;
  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;
  updateFavorite(input: FavoriteMutation): Promise<void>;
  getDiagnosisRecords(aquariumId: string): Promise<DiagnosisRecord[]>;
  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;
  saveMemorial(input: MemorialSaveInput): Promise<DeceasedRecord>;
  saveLivestockMemorial(input: LivestockMemorialSaveInput): Promise<{ record: DeceasedRecord; aquarium: Aquarium }>;
  updateMemorial(input: MemorialUpdateInput): Promise<DeceasedRecord>;
  getCareReminders(): Promise<CareReminderRecord[]>;
  updateCareReminder(input: CareReminderMutation): Promise<CareReminderRecord | null>;
  getCareEvents(aquariumId?: string): Promise<CareTimelineRecord[]>;
  saveCareEvent(input: CareTimelineMutation): Promise<CareTimelineRecord>;
  removeCareEventBySource(input: { aquariumId: string; sourceType: string; sourceId: string; operationId: string }): Promise<void>;
}