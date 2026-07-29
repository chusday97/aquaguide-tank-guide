import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium, DeceasedRecord } from '../../types';
import type { CareReminderRecord } from '../care/care-activity.service';

export type FavoriteMutation =
  | { type: 'species'; catalogKey: string; favorite: boolean }
  | { type: 'care'; catalogKey: string; title: string; favorite: boolean };

export type MemorialSaveInput = {
  aquariumId?: string;
  speciesCatalogKey: string;
  date: string;
  reason: string;
  observation?: string;
  improvement?: string;
};

export type MemorialUpdateInput = {
  id: string;
  date?: string;
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

export type CareReminderMutation =
  | { action: 'upsert'; record: Omit<CareReminderRecord, 'id' | 'createdAt'> }
  | { action: 'complete'; id: string; completedAt: string }
  | { action: 'reschedule'; id: string; scheduledFor: string; label?: string }
  | { action: 'delete'; id: string };

export interface AquaGuideRepository {
  getAquariums(): Promise<Aquarium[]>;
  saveAquarium(aquarium: Aquarium): Promise<Aquarium>;
  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;
  updateFavorite(input: FavoriteMutation): Promise<void>;
  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;
  saveMemorial(input: MemorialSaveInput): Promise<DeceasedRecord>;
  saveLivestockMemorial(input: LivestockMemorialSaveInput): Promise<{ record: DeceasedRecord; aquarium: Aquarium }>;
  updateMemorial(input: MemorialUpdateInput): Promise<DeceasedRecord>;
  updateCareReminder(input: CareReminderMutation): Promise<CareReminderRecord | null>;
}
