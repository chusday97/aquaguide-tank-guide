import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium, AquariumFish, AquariumSpeciesBatch, DeceasedRecord } from '../../types';
import type { CareReminderRecord } from '../care/care-activity.service';
import { apiRequest, createIdempotencyKey } from '../api/api-client';
import { decrementSpeciesBatch } from '../aquarium/species-batches.service';
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
} from './aquaguide.repository';

type ApiAquariumSpecies = {
  id: string;
  speciesCatalogKey: string;
  quantity: number;
  entryDate: string;
  lastWaterChangeAt?: string;
  version: number;
  batches: ApiAquariumSpeciesBatch[];
};

type ApiAquariumSpeciesBatch = AquariumSpeciesBatch & { version: number };

type ApiAquarium = {
  id: string;
  name: string;
  waterType?: 'Freshwater' | 'Saltwater';
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  targetTemperatureC?: number;
  lastWaterChangeAt?: string;
  lastWaterStoredAt?: string;
  startedAt?: string;
  startedAtSource?: 'created' | 'inferred' | 'user';
  startedAtConfirmedAt?: string;
  version: number;
  species: ApiAquariumSpecies[];
  equipment?: {
    id: string;
    filterType?: string;
    heater?: boolean;
    oxygen?: boolean;
    lightType?: string;
    version: number;
  };
  components: Array<{
    id: string;
    componentType: 'substrate' | 'plant' | 'hardscape';
    name: string;
    quantity?: number;
    version: number;
  }>;
};

type ApiDiagnosis = DiagnosisRecord & { id: string; version: number; localDate: string; diagnosisKey: string };
type ApiReminder = {
  id: string;
  sourceCatalogKey: string;
  title: string;
  reminderType: string;
  scheduledFor: string;
  aquariumId?: string;
  label?: string;
  completedAt?: string;
  seriesId?: string;
  repeatEnabled: boolean;
  repeatIntervalDays?: number;
  createdAt: string;
  version: number;
};
type ApiCareEvent = CareTimelineRecord & { version: number };

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const toLegacyAquarium = (record: ApiAquarium): Aquarium => {
  const components = record.components || [];
  const substrate = components.find(item => item.componentType === 'substrate')?.name;
  const plants = components.filter(item => item.componentType === 'plant').map(item => item.name);
  const hardscape = components.filter(item => item.componentType === 'hardscape').map(item => item.name);
  return {
    id: record.id,
    name: record.name,
    fishes: (record.species || []).map<ApiAquariumFish>(item => ({
      id: item.id,
      fishId: item.speciesCatalogKey,
      quantity: item.quantity,
      entryDate: item.entryDate,
      lastWaterChangeDate: item.lastWaterChangeAt,
      batches: (item.batches || []).map(batch => ({
        id: batch.id,
        quantity: batch.quantity,
        entryDate: batch.entryDate,
        lifeStage: batch.lifeStage,
        reproductiveState: batch.reproductiveState,
        stateUpdatedAt: batch.stateUpdatedAt,
      })),
    })),
    lastWaterChangeDate: record.lastWaterChangeAt,
    lastWaterStoredDate: record.lastWaterStoredAt,
    startedAt: record.startedAt,
    startedAtSource: record.startedAtSource,
    startedAtConfirmedAt: record.startedAtConfirmedAt,
    dimensions: record.lengthCm && record.widthCm && record.heightCm
      ? { length: String(record.lengthCm), width: String(record.widthCm), height: String(record.heightCm) }
      : undefined,
    waterType: record.waterType,
    targetTemperature: record.targetTemperatureC == null ? undefined : String(record.targetTemperatureC),
    substrate,
    plants,
    hardscape,
    equipment: record.equipment ? {
      filter: record.equipment.filterType as NonNullable<Aquarium['equipment']>['filter'],
      heater: record.equipment.heater,
      oxygen: record.equipment.oxygen,
      light: record.equipment.lightType as NonNullable<Aquarium['equipment']>['light'],
    } : undefined,
  };
};

type ApiAquariumFish = AquariumFish;

export class ApiAquaGuideRepository implements AquaGuideRepository {
  private aquariumVersions = new Map<string, number>();
  private speciesVersions = new Map<string, number>();
  private reminderVersions = new Map<string, number>();
  private contentIds = new Map<string, string>();
  private livestockMemorialAttempts = new Map<string, { aquarium: ApiAquarium; batchVersion: number }>();

  private rememberAquarium(record: ApiAquarium) {
    this.aquariumVersions.set(record.id, record.version);
    for (const item of record.species || []) this.speciesVersions.set(item.id, item.version);
    return toLegacyAquarium(record);
  }

  private async syncSpeciesBatches(aquariumId: string, current: ApiAquariumSpecies, desired: AquariumSpeciesBatch[]) {
    const currentById = new Map((current.batches || []).map(batch => [batch.id, batch]));
    const added = desired.filter(batch => !currentById.has(batch.id));
    const removed = (current.batches || []).filter(batch => !desired.some(item => item.id === batch.id));
    const reduced = desired
      .map(batch => ({ desired: batch, current: currentById.get(batch.id) }))
      .filter(item => item.current && item.desired.quantity < item.current.quantity);
    const increased = desired
      .map(batch => ({ desired: batch, current: currentById.get(batch.id) }))
      .filter(item => item.current && item.desired.quantity > item.current.quantity);
    if (added.length === 0 && removed.length === 1 && increased.length === 1) {
      const addedQuantity = increased[0].desired.quantity - increased[0].current!.quantity;
      if (addedQuantity === removed[0].quantity) {
        const mergeResult = await apiRequest<ApiAquariumSpeciesBatch[]>(`/aquariums/${aquariumId}/species/${current.id}/batches/${increased[0].current!.id}/merge`, {
          method: 'POST',
          body: {
            sourceBatchId: removed[0].id,
            targetEntryDate: increased[0].desired.entryDate.slice(0, 10),
            targetLifeStage: increased[0].desired.lifeStage,
            targetReproductiveState: increased[0].desired.reproductiveState,
            targetVersion: increased[0].current!.version,
            sourceVersion: removed[0].version,
          },
          idempotencyKey: `aquarium-species-batch-merge:${current.id}:${removed[0].id}:${increased[0].current!.id}:v${removed[0].version}-${increased[0].current!.version}`,
        });
        return this.syncSpeciesBatches(aquariumId, { ...current, batches: mergeResult }, desired);
      }
    }
    if (added.length === 1 && removed.length === 0 && reduced.length === 1) {
      const splitQuantity = reduced[0].current!.quantity - reduced[0].desired.quantity;
      if (splitQuantity === added[0].quantity) {
        const splitResult = await apiRequest<ApiAquariumSpeciesBatch[]>(`/aquariums/${aquariumId}/species/${current.id}/batches/${reduced[0].current!.id}/split`, {
          method: 'POST',
          body: {
            quantity: added[0].quantity,
            entryDate: added[0].entryDate.slice(0, 10),
            lifeStage: added[0].lifeStage,
            reproductiveState: added[0].reproductiveState,
            sourceVersion: reduced[0].current!.version,
          },
          idempotencyKey: `aquarium-species-batch-split:${current.id}:${reduced[0].current!.id}:${added[0].id}:v${reduced[0].current!.version}`,
        });
        const created = splitResult.find(batch => !currentById.has(batch.id));
        if (!created) throw new Error('批次已拆分，但没有返回新批次。');
        const remappedDesired = desired.map(batch => batch.id === added[0].id ? { ...batch, id: created.id } : batch);
        return this.syncSpeciesBatches(aquariumId, { ...current, batches: splitResult }, remappedDesired);
      }
    }
    const retained = new Set<string>();
    for (const batch of desired) {
      const existing = currentById.get(batch.id);
      if (existing) {
        retained.add(existing.id);
        if (
          existing.quantity !== batch.quantity
          || existing.entryDate.slice(0, 10) !== batch.entryDate.slice(0, 10)
          || existing.lifeStage !== batch.lifeStage
          || existing.reproductiveState !== batch.reproductiveState
        ) {
          await apiRequest(`/aquariums/${aquariumId}/species/${current.id}/batches/${existing.id}`, {
            method: 'PATCH',
            body: {
              quantity: batch.quantity,
              entryDate: batch.entryDate.slice(0, 10),
              lifeStage: batch.lifeStage,
              reproductiveState: batch.reproductiveState,
              version: existing.version,
            },
            idempotencyKey: `aquarium-species-batch-update:${current.id}:${existing.id}:${batch.stateUpdatedAt}:v${existing.version}`,
          });
        }
        continue;
      }
      const created = await apiRequest<ApiAquariumSpeciesBatch>(`/aquariums/${aquariumId}/species/${current.id}/batches`, {
        method: 'POST',
        body: {
          quantity: batch.quantity,
          entryDate: batch.entryDate.slice(0, 10),
          lifeStage: batch.lifeStage,
          reproductiveState: batch.reproductiveState,
        },
        idempotencyKey: `aquarium-species-batch-create:${current.id}:${batch.id}`,
      });
      retained.add(created.id);
    }
    for (const existing of current.batches || []) {
      if (!retained.has(existing.id)) {
        await apiRequest(`/aquariums/${aquariumId}/species/${current.id}/batches/${existing.id}?version=${existing.version}`, {
          method: 'DELETE',
          idempotencyKey: `aquarium-species-batch-delete:${current.id}:${existing.id}:v${existing.version}`,
        });
      }
    }
  }

  async getAquariums() {
    const records = await apiRequest<ApiAquarium[]>('/aquariums');
    return records.map(record => this.rememberAquarium(record));
  }

  async createAquarium(input: AquariumCreateCommand) {
    const saved = await apiRequest<ApiAquarium>('/aquariums', {
      method: 'POST',
      body: {
        name: input.name,
        startedAt: input.startedAt,
        startedAtSource: input.startedAtSource,
      },
      idempotencyKey: input.operationId,
    });
    return this.rememberAquarium(saved);
  }

  async addLivestock(input: LivestockAddCommand) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('记录数量必须是正整数。');
    await apiRequest(`/aquariums/${input.aquariumId}/species`, {
      method: 'POST',
      body: {
        speciesCatalogKey: input.speciesCatalogKey,
        quantity: input.quantity,
        entryDate: input.entryDate.slice(0, 10),
        lifeStage: input.lifeStage,
        reproductiveState: input.reproductiveState,
      },
      idempotencyKey: input.operationId,
    });
    const saved = await apiRequest<ApiAquarium>(`/aquariums/${input.aquariumId}`);
    return this.rememberAquarium(saved);
  }

  async saveAquarium(aquarium: Aquarium) {
    const dimensions = aquarium.dimensions;
    const baseInput = {
      name: aquarium.name,
      waterType: aquarium.waterType,
      lengthCm: dimensions?.length ? Number(dimensions.length) : undefined,
      widthCm: dimensions?.width ? Number(dimensions.width) : undefined,
      heightCm: dimensions?.height ? Number(dimensions.height) : undefined,
      targetTemperatureC: aquarium.targetTemperature ? Number(aquarium.targetTemperature) : undefined,
      lastWaterChangeAt: aquarium.lastWaterChangeDate,
      lastWaterStoredAt: aquarium.lastWaterStoredDate,
      startedAt: aquarium.startedAt,
      startedAtSource: aquarium.startedAtSource,
      startedAtConfirmedAt: aquarium.startedAtConfirmedAt,
    };

    const version = this.aquariumVersions.get(aquarium.id);
    let saved = version && isUuid(aquarium.id)
      ? await apiRequest<ApiAquarium>(`/aquariums/${aquarium.id}`, { method: 'PATCH', body: { ...baseInput, version }, idempotencyKey: createIdempotencyKey('aquarium-update') })
      : await apiRequest<ApiAquarium>('/aquariums', {
          method: 'POST',
          body: baseInput,
          idempotencyKey: createIdempotencyKey('aquarium'),
        });

    const currentById = new Map((saved.species || []).map(item => [item.id, item]));
    const currentByCatalogKey = new Map((saved.species || []).map(item => [item.speciesCatalogKey, item]));
    const retained = new Set<string>();

    for (const fish of aquarium.fishes) {
      const current = currentById.get(fish.id) || currentByCatalogKey.get(fish.fishId);
      if (current) {
        retained.add(current.id);
        const usesBatches = Boolean(fish.batches?.length);
        if ((!usesBatches && current.quantity !== fish.quantity) || current.entryDate !== fish.entryDate || current.lastWaterChangeAt !== fish.lastWaterChangeDate) {
          const updated = await apiRequest<ApiAquariumSpecies>(`/aquariums/${saved.id}/species/${current.id}`, {
            method: 'PATCH',
            body: {
              ...(!usesBatches ? { quantity: fish.quantity } : {}),
              entryDate: fish.entryDate.slice(0, 10),
              lastWaterChangeAt: fish.lastWaterChangeDate,
              version: current.version,
            },
            idempotencyKey: createIdempotencyKey('aquarium-species-update'),
          });
          this.speciesVersions.set(updated.id, updated.version);
        }
        if (usesBatches) await this.syncSpeciesBatches(saved.id, current, fish.batches!);
      } else {
        const desiredBatches = fish.batches || [];
        const initialBatch = desiredBatches[0];
        const created = await apiRequest<ApiAquariumSpecies>(`/aquariums/${saved.id}/species`, {
          method: 'POST',
          body: {
            speciesCatalogKey: fish.fishId,
            quantity: initialBatch?.quantity ?? fish.quantity,
            entryDate: (initialBatch?.entryDate ?? fish.entryDate).slice(0, 10),
            lastWaterChangeAt: fish.lastWaterChangeDate,
            lifeStage: initialBatch?.lifeStage,
            reproductiveState: initialBatch?.reproductiveState,
          },
          idempotencyKey: createIdempotencyKey('aquarium-species'),
        });
        retained.add(created.id);
        this.speciesVersions.set(created.id, created.version);
        for (const batch of desiredBatches.slice(1)) {
          await apiRequest(`/aquariums/${saved.id}/species/${created.id}/batches`, {
            method: 'POST',
            body: {
              quantity: batch.quantity,
              entryDate: batch.entryDate.slice(0, 10),
              lifeStage: batch.lifeStage,
              reproductiveState: batch.reproductiveState,
            },
            idempotencyKey: createIdempotencyKey('aquarium-species-batch'),
          });
        }
      }
    }

    for (const current of saved.species || []) {
      if (!retained.has(current.id)) {
        await apiRequest(`/aquariums/${saved.id}/species/${current.id}?version=${current.version}`, { method: 'DELETE', idempotencyKey: createIdempotencyKey('aquarium-species-delete') });
      }
    }

    if (aquarium.equipment) {
      await apiRequest(`/aquariums/${saved.id}/equipment`, {
        method: 'PUT',
        body: {
          filterType: aquarium.equipment.filter,
          heater: aquarium.equipment.heater,
          oxygen: aquarium.equipment.oxygen,
          lightType: aquarium.equipment.light,
          version: saved.equipment?.version,
        },
        idempotencyKey: createIdempotencyKey('aquarium-equipment'),
      });
    }

    saved = await apiRequest<ApiAquarium>(`/aquariums/${saved.id}`);
    return this.rememberAquarium(saved);
  }

  async deleteAquarium(aquariumId: string) {
    if (!isUuid(aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');
    let version = this.aquariumVersions.get(aquariumId);
    if (!version) {
      const current = await apiRequest<ApiAquarium>(`/aquariums/${aquariumId}`);
      this.rememberAquarium(current);
      version = current.version;
    }
    await apiRequest(`/aquariums/${aquariumId}?version=${version}`, {
      method: 'DELETE',
      idempotencyKey: `aquarium-delete:${aquariumId}:v${version}`,
    });
    this.aquariumVersions.delete(aquariumId);
  }

  async removeLivestock(input: LivestockRemovalInput) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('移出数量必须是正整数。');
    const aquarium = await apiRequest<ApiAquarium>(
      `/aquariums/${input.aquariumId}/species/${input.aquariumFishId}/batches/${input.batchId}/remove`,
      {
        method: 'POST',
        body: { quantity: input.quantity },
        idempotencyKey: input.operationId,
      },
    );
    return this.rememberAquarium(aquarium);
  }

  private async resolveContentId(type: 'species' | 'care', catalogKey: string) {
    const cacheKey = `${type}:${catalogKey}`;
    const cached = this.contentIds.get(cacheKey);
    if (cached) return cached;
    const path = type === 'species' ? `/species/${catalogKey}` : `/care-articles/${catalogKey}`;
    const content = await apiRequest<{ id: string }>(path, { authenticated: false });
    this.contentIds.set(cacheKey, content.id);
    return content.id;
  }

  async updateFavorite(input: FavoriteMutation) {
    const id = await this.resolveContentId(input.type, input.catalogKey);
    const path = `/favorites/${input.type}/${id}`;
    if (input.favorite) {
      await apiRequest(path, { method: 'PUT', idempotencyKey: createIdempotencyKey(`${input.type}-favorite`) });
    } else {
      await apiRequest(path, { method: 'DELETE', idempotencyKey: createIdempotencyKey(`${input.type}-favorite-delete`) });
    }
  }

  async saveDiagnosis(record: DiagnosisRecord) {
    const date = record.createdAt.slice(0, 10);
    const current = await apiRequest<ApiDiagnosis | null>(`/aquariums/${record.aquariumId}/daily-checks/${date}`);
    const saved = await apiRequest<ApiDiagnosis>(`/aquariums/${record.aquariumId}/daily-checks/${date}`, {
      method: 'PUT',
      idempotencyKey: createIdempotencyKey('daily-check'),
      body: {
        diagnosisKey: record.diagnosisId,
        problemType: record.problemType,
        sourceType: record.source?.type,
        sourceTitle: record.source?.title,
        answers: record.answers,
        structuredAnswers: record.structuredAnswers || [],
        resultSummary: record.resultSummary,
        riskLevel: record.riskLevel,
        riskCode: record.riskCode,
        conclusion: record.conclusion,
        keyMetrics: record.keyMetrics || [],
        suggestedActions: record.suggestedActions,
        avoidActions: record.avoidActions || [],
        observeItems: record.observeItems || [],
        missingInfo: record.missingInfo,
        optionalMissingInfo: record.optionalMissingInfo || [],
        nextCheckAt: record.nextCheckAt,
        followUpNotes: record.followUpNotes,
        version: current?.version,
      },
    });
    return { ...record, id: saved.id, diagnosisId: saved.diagnosisKey || record.diagnosisId };
  }

  async saveMemorial(input: MemorialSaveInput) {
    const saved = await apiRequest<{
      id: string;
      speciesCatalogKey: string;
      memorialDate: string;
      causeCodes?: DeceasedRecord['causeCodes'];
      reason?: string;
      observation?: string;
      improvement?: string;
      version: number;
    }>('/memorial-records', {
      method: 'POST',
      idempotencyKey: createIdempotencyKey('memorial'),
      body: {
        aquariumId: input.aquariumId && isUuid(input.aquariumId) ? input.aquariumId : undefined,
        speciesCatalogKey: input.speciesCatalogKey,
        memorialDate: input.date.slice(0, 10),
        causeCodes: input.causeCodes,
        reason: input.reason,
        observation: input.observation,
        improvement: input.improvement,
      },
    });
    return {
      id: saved.id,
      fishId: saved.speciesCatalogKey,
      date: new Date(`${saved.memorialDate}T12:00:00`).toISOString(),
      causeCodes: saved.causeCodes,
      reason: saved.reason,
      observation: saved.observation,
      improvement: saved.improvement,
      version: saved.version,
    } satisfies DeceasedRecord;
  }

  async updateMemorial(input: MemorialUpdateInput) {
    const saved = await apiRequest<{
      id: string;
      speciesCatalogKey: string;
      memorialDate: string;
      causeCodes?: DeceasedRecord['causeCodes'];
      reason?: string;
      observation?: string;
      improvement?: string;
      version: number;
    }>(`/memorial-records/${input.id}`, {
      method: 'PATCH',
      body: {
        memorialDate: input.date?.slice(0, 10),
        causeCodes: input.causeCodes,
        reason: input.reason,
        observation: input.observation,
        improvement: input.improvement,
        version: input.version || 1,
      },
    });
    return {
      id: saved.id,
      fishId: saved.speciesCatalogKey,
      date: new Date(`${saved.memorialDate}T12:00:00`).toISOString(),
      causeCodes: saved.causeCodes,
      reason: saved.reason,
      observation: saved.observation,
      improvement: saved.improvement,
      version: saved.version,
    } satisfies DeceasedRecord;
  }

  async saveLivestockMemorial(input: LivestockMemorialSaveInput) {
    let attempt = this.livestockMemorialAttempts.get(input.operationId);
    if (!attempt) {
      const aquarium = await apiRequest<ApiAquarium>(`/aquariums/${input.aquariumId}`);
      const species = aquarium.species.find(item => item.id === input.aquariumFishId && item.speciesCatalogKey === input.speciesCatalogKey);
      const batch = species?.batches.find(item => item.id === input.batchId);
      if (!batch) throw new Error('没有找到需要更新的缸内物种批次。');
      attempt = { aquarium, batchVersion: batch.version };
      this.livestockMemorialAttempts.set(input.operationId, attempt);
    }
    const raw = await apiRequest<{ id: string; speciesCatalogKey: string; memorialDate: string; causeCodes?: DeceasedRecord['causeCodes']; reason?: string; observation?: string; improvement?: string; version: number }>(
      `/aquariums/${input.aquariumId}/species/${input.aquariumFishId}/batches/${input.batchId}/memorial`,
      {
        method: 'POST',
        body: {
          speciesCatalogKey: input.speciesCatalogKey,
          memorialDate: input.date,
          causeCodes: input.causeCodes,
          reason: input.reason,
          observation: input.observation,
          improvement: input.improvement,
          batchVersion: attempt.batchVersion,
        },
        idempotencyKey: `livestock-memorial:${input.operationId}`,
      },
    );
    this.livestockMemorialAttempts.delete(input.operationId);
    const current = attempt.aquarium;
    const aquarium = toLegacyAquarium(current);
    const fish = aquarium.fishes.find(item => item.id === input.aquariumFishId)!;
    const nextFish = decrementSpeciesBatch(fish, input.batchId);
    const updatedAquarium = {
      ...aquarium,
      fishes: nextFish
        ? aquarium.fishes.map(item => item.id === fish.id ? nextFish : item)
        : aquarium.fishes.filter(item => item.id !== fish.id),
    };
    return {
      record: {
        id: raw.id,
        fishId: raw.speciesCatalogKey,
        date: raw.memorialDate,
        causeCodes: raw.causeCodes,
        reason: raw.reason,
        observation: raw.observation,
        improvement: raw.improvement,
        version: raw.version,
      },
      aquarium: updatedAquarium,
    };
  }

  private rememberReminder(record: ApiReminder): CareReminderRecord {
    this.reminderVersions.set(record.id, record.version);
    return {
      id: record.id,
      sourceTopicId: record.sourceCatalogKey,
      title: record.title,
      type: record.reminderType,
      createdAt: record.createdAt,
      scheduledFor: record.scheduledFor,
      aquariumId: record.aquariumId,
      label: record.label,
      completedAt: record.completedAt,
      seriesId: record.seriesId,
      repeatEnabled: record.repeatEnabled,
      repeatIntervalDays: record.repeatIntervalDays,
    };
  }

  private async ensureReminderVersion(id: string) {
    const existing = this.reminderVersions.get(id);
    if (existing) return existing;
    const records = await apiRequest<ApiReminder[]>('/care-reminders');
    for (const record of records) this.reminderVersions.set(record.id, record.version);
    const version = this.reminderVersions.get(id);
    if (!version) throw new Error('没有找到这条养护计划。');
    return version;
  }

  async getCareReminders() {
    const records = await apiRequest<ApiReminder[]>('/care-reminders');
    return records.map(record => this.rememberReminder(record));
  }

  async updateCareReminder(input: CareReminderMutation) {
    if (input.action === 'upsert') {
      const saved = await apiRequest<ApiReminder>('/care-reminders', {
        method: 'POST',
        idempotencyKey: input.record.seriesId
          ? `care-reminder-create:${input.record.seriesId}:${input.record.scheduledFor}`
          : createIdempotencyKey('care-reminder'),
        body: {
          aquariumId: input.record.aquariumId && isUuid(input.record.aquariumId) ? input.record.aquariumId : undefined,
          sourceCatalogKey: input.record.sourceTopicId,
          title: input.record.title,
          reminderType: input.record.type,
          scheduledFor: input.record.scheduledFor,
          label: input.record.label,
          seriesId: input.record.seriesId,
          repeatEnabled: input.record.repeatEnabled === true,
          repeatIntervalDays: input.record.repeatIntervalDays,
        },
      });
      return this.rememberReminder(saved);
    }

    const version = await this.ensureReminderVersion(input.id);
    if (input.action === 'delete') {
      await apiRequest(`/care-reminders/${input.id}?version=${version}`, { method: 'DELETE', idempotencyKey: `care-reminder-delete:${input.id}:v${version}` });
      this.reminderVersions.delete(input.id);
      return null;
    }

    const saved = await apiRequest<ApiReminder>(`/care-reminders/${input.id}`, {
      method: 'PATCH',
      body: input.action === 'complete'
        ? { completedAt: input.completedAt, version }
        : input.action === 'reschedule'
          ? { scheduledFor: input.scheduledFor, label: input.label, version }
          : { repeatEnabled: input.repeatEnabled, repeatIntervalDays: input.repeatEnabled ? input.repeatIntervalDays : null, version },
      idempotencyKey: `care-reminder-${input.action}:${input.id}:v${version}`,
    });
    return this.rememberReminder(saved);
  }

  async getCareEvents(aquariumId?: string) {
    const query = aquariumId ? `?aquariumId=${encodeURIComponent(aquariumId)}` : '';
    const result = await apiRequest<{ items: ApiCareEvent[] }>(`/care-events${query}`);
    return result.items;
  }

  async saveCareEvent(input: CareTimelineMutation) {
    const { operationId, ...body } = input;
    return apiRequest<ApiCareEvent>('/care-events', {
      method: 'POST',
      body,
      idempotencyKey: operationId,
    });
  }

  async removeCareEventBySource(input: { aquariumId: string; sourceType: string; sourceId: string; operationId: string }) {
    const query = new URLSearchParams({ aquariumId: input.aquariumId, sourceType: input.sourceType, sourceId: input.sourceId });
    await apiRequest(`/care-events/by-source?${query}`, { method: 'DELETE', idempotencyKey: input.operationId });
  }
}
