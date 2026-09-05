import { Router } from 'express';
import {
  aquariumComponentCreateSchema,
  aquariumComponentUpdateSchema,
  aquariumCreateSchema,
  aquariumEquipmentUpsertSchema,
  aquariumSpeciesCreateSchema,
  aquariumSpeciesBatchCreateSchema,
  aquariumSpeciesBatchSplitSchema,
  aquariumSpeciesBatchMergeSchema,
  aquariumSpeciesBatchRemovalSchema,
  livestockMemorialCreateSchema,
  aquariumSpeciesBatchUpdateSchema,
  aquariumSpeciesUpdateSchema,
  aquariumUpdateSchema,
  uuidSchema,
  versionSchema,
} from '../../../../packages/contracts/src/index';
import { requireAuth } from '../auth';
import {
  authenticatedRequest,
  beginIdempotentWrite,
  camelize,
  deterministicUuid,
  finishIdempotentWrite,
  getRequestHash,
  requireIdempotencyKey,
  snakeize,
  throwDatabaseError,
  throwMissingOrVersionConflict,
  userClientFor,
} from '../data-utils';
import { ApiError, asyncRoute, sendData } from '../http';
import { resolveLivestockMemorialReplay } from '../livestock-memorial-replay';
import { throwLivestockAdditionRpcError } from '../livestock-addition-error';
import { evaluateCompatibility, type CompatibilityDecisionStatus, type DomainCompatibilityInput, type DomainSpeciesFact } from '../../../../packages/domain-rules/src';

type DbRow = Record<string, any>;

const parseId = (value: string, label: string) => {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', `${label}无效。`);
  return parsed.data;
};

const mapAquarium = (row: DbRow) => ({
  ...camelize<DbRow>(row),
  species: (row.aquarium_species || []).filter((item: DbRow) => !item.deleted_at).map(mapAquariumSpecies),
  equipment: (row.aquarium_equipment || []).find((item: DbRow) => !item.deleted_at)
    ? camelize((row.aquarium_equipment || []).find((item: DbRow) => !item.deleted_at))
    : undefined,
  components: (row.aquarium_components || []).filter((item: DbRow) => !item.deleted_at).map((item: DbRow) => camelize(item)),
  aquariumSpecies: undefined,
  aquariumEquipment: undefined,
  aquariumComponents: undefined,
});

const mapAquariumSpecies = (row: DbRow) => ({
  ...camelize<DbRow>(row),
  batches: (row.aquarium_species_batches || [])
    .filter((item: DbRow) => !item.deleted_at)
    .map((item: DbRow) => camelize(item)),
  aquariumSpeciesBatches: undefined,
});

const aquariumSpeciesSelect = '*,aquarium_species_batches(*)';
const aquariumSelect = `*,aquarium_species(${aquariumSpeciesSelect}),aquarium_equipment(*),aquarium_components(*)`;

const getOwnedSpeciesRecord = async (client: ReturnType<typeof userClientFor>, aquariumId: string, recordId: string) => {
  const { data, error } = await client
    .from('aquarium_species')
    .select(aquariumSpeciesSelect)
    .eq('id', recordId)
    .eq('aquarium_id', aquariumId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throwDatabaseError(error, '暂时无法读取缸内物种。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到这条缸内物种记录。');
  return data as DbRow;
};

export const normalizeCatalogWaterType = (value: unknown): DomainSpeciesFact['waterType'] => {
  if (typeof value !== 'string') return 'unknown';
  const normalized = value.trim().toLowerCase();
  return normalized === 'freshwater' || normalized === 'saltwater' || normalized === 'brackish' ? normalized : 'unknown';
};

export const readPublishedCatalogDecision = async ({
  client,
  aquariumId,
  speciesCatalogKey,
  catalogVersion,
}: {
  client: Pick<ReturnType<typeof userClientFor>, 'from'>;
  aquariumId: string;
  speciesCatalogKey: string;
  catalogVersion: string;
}) => {
  const { data: release, error: releaseError } = await client
    .from('catalog_releases')
    .select('version_key')
    .eq('status', 'published')
    .is('deleted_at', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (releaseError) throw new ApiError(503, 'COMPATIBILITY_INFORMATION_REQUIRED', '当前 Supabase 尚未提供可核验的 Catalog 版本，请先完成发布校验。');
  if (!release) throw new ApiError(503, 'COMPATIBILITY_INFORMATION_REQUIRED', '当前没有已发布的 Catalog 版本，暂不能规划加入。');
  if (release.version_key !== catalogVersion) throw new ApiError(409, 'VERSION_CONFLICT', '混养复核使用的 Catalog 已过期，请刷新后重新判断。');

  const { data: aquarium, error: aquariumError } = await client
    .from('aquariums')
    .select('water_type,length_cm,width_cm,height_cm,target_temperature_c,aquarium_species(species_catalog_key,quantity,deleted_at)')
    .eq('id', aquariumId)
    .is('deleted_at', null)
    .maybeSingle();
  if (aquariumError || !aquarium) throw new ApiError(aquariumError ? 503 : 404, aquariumError ? 'COMPATIBILITY_INFORMATION_REQUIRED' : 'NOT_FOUND', aquariumError ? '鱼缸事实暂时无法用于混养复核。' : '没有找到这个鱼缸。');

  const existingKeys = (aquarium.aquarium_species || [])
    .filter((item: DbRow) => !item.deleted_at && typeof item.species_catalog_key === 'string')
    .map((item: DbRow) => item.species_catalog_key as string);
  const keys = Array.from(new Set([...existingKeys, speciesCatalogKey]));
  const { data: speciesRows, error: speciesError } = await client
    .from('species')
    .select('id,catalog_key,water_type,water_temperature_min_c,water_temperature_max_c,ph_min,ph_max,status')
    .in('catalog_key', keys)
    .eq('status', 'published')
    .is('deleted_at', null);
  if (speciesError) throw new ApiError(503, 'COMPATIBILITY_INFORMATION_REQUIRED', '物种 Catalog 字段尚未完成 parity，暂不能规划加入。');
  const speciesByKey = new Map((speciesRows || []).map((row: DbRow) => [row.catalog_key as string, row]));
  if (keys.some(key => !speciesByKey.has(key))) throw new ApiError(400, 'COMPATIBILITY_INFORMATION_REQUIRED', '当前物种资料不完整，请刷新 Catalog 后重新判断。');

  const speciesIds = Array.from(speciesByKey.values()).map((row: DbRow) => row.id as string);
  const { data: reviewedLinks, error: linksError } = await client
    .from('species_reference_links')
    .select('species_id')
    .in('species_id', speciesIds)
    .eq('review_status', 'reviewed')
    .is('deleted_at', null);
  if (linksError) throw new ApiError(503, 'COMPATIBILITY_INFORMATION_REQUIRED', '物种证据引用尚未完成 parity，暂不能规划加入。');
  const reviewedIds = new Set((reviewedLinks || []).map((row: DbRow) => row.species_id as string));
  const toFact = (row: DbRow): DomainSpeciesFact => ({
    id: row.catalog_key,
    waterType: normalizeCatalogWaterType(row.water_type),
    temperatureMinC: row.water_temperature_min_c,
    temperatureMaxC: row.water_temperature_max_c,
    phMin: row.ph_min,
    phMax: row.ph_max,
    reviewed: reviewedIds.has(row.id),
  });
  let explicitPairStatus: CompatibilityDecisionStatus | undefined;
  const statusRank: Record<CompatibilityDecisionStatus, number> = {
    compatible: 0,
    caution: 1,
    insufficient_data: 2,
    not_recommended: 3,
  };
  for (const existingKey of existingKeys) {
    const existingRow = speciesByKey.get(existingKey);
    const candidateRow = speciesByKey.get(speciesCatalogKey);
    if (!existingRow || !candidateRow) continue;
    const { data: pairRule, error: pairRuleError } = await client
      .from('species_pair_compatibility_rules')
      .select('verdict')
      .or(`and(species_a_id.eq.${existingRow.id},species_b_id.eq.${candidateRow.id}),and(species_a_id.eq.${candidateRow.id},species_b_id.eq.${existingRow.id})`)
      .eq('review_status', 'reviewed')
      .is('deleted_at', null)
      .maybeSingle();
    if (pairRuleError) throw new ApiError(503, 'COMPATIBILITY_INFORMATION_REQUIRED', '混养配对证据尚未完成 parity，暂不能规划加入。');
    const verdict = pairRule?.verdict as CompatibilityDecisionStatus | undefined;
    if (verdict && (!explicitPairStatus || statusRank[verdict] > statusRank[explicitPairStatus])) explicitPairStatus = verdict;
  }
  const input: DomainCompatibilityInput = {
    intent: 'planned_addition',
    catalogVersion,
    tank: {
      waterType: normalizeCatalogWaterType(aquarium.water_type),
      volumeLiters: Number(aquarium.length_cm) > 0 && Number(aquarium.width_cm) > 0 && Number(aquarium.height_cm) > 0
        ? Number(aquarium.length_cm) * Number(aquarium.width_cm) * Number(aquarium.height_cm) / 1000
        : null,
      targetTemperatureC: aquarium.target_temperature_c,
    },
    existingSpecies: existingKeys.map(key => toFact(speciesByKey.get(key)!)),
    candidateSpecies: toFact(speciesByKey.get(speciesCatalogKey)!),
    explicitPairStatus,
  };
  return evaluateCompatibility(input);
};

export const aquariumsRouter = Router();
aquariumsRouter.use((request, response, next) => (
  request.path.startsWith('/aquariums') ? requireAuth(request, response, next) : next()
));
aquariumsRouter.use((request, _response, next) => {
  if (request.path.startsWith('/aquariums') && request.method !== 'GET') requireIdempotencyKey(request);
  next();
});

aquariumsRouter.get('/aquariums', asyncRoute(async (request, response) => {
  const client = userClientFor(request);
  const { data, error } = await client
    .from('aquariums')
    .select(aquariumSelect)
    .is('deleted_at', null)
    .order('created_at');
  if (error) throwDatabaseError(error, '鱼缸数据暂时无法加载。');
  return sendData(request, response, (data || []).map(mapAquarium));
}));

aquariumsRouter.post('/aquariums', asyncRoute(async (request, response) => {
  const parsed = aquariumCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '鱼缸信息不完整。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;

  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('aquariums').select(aquariumSelect).eq('id', idempotency.replay.resourceId).maybeSingle();
    if (data) return sendData(request, response, mapAquarium(data));
  }

  const id = deterministicUuid(`${userId}:aquarium:${idempotency.key}`);
  const { data, error } = await client
    .from('aquariums')
    .insert({ id, owner_id: userId, ...snakeize(parsed.data) })
    .select(aquariumSelect)
    .single();
  if (error || !data) throwDatabaseError(error, '鱼缸没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'aquarium', id, 201);
  return sendData(request, response, mapAquarium(data), 201);
}));

aquariumsRouter.get('/aquariums/:id', asyncRoute(async (request, response) => {
  const id = parseId(request.params.id, '鱼缸标识');
  const client = userClientFor(request);
  const { data, error } = await client.from('aquariums').select(aquariumSelect).eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throwDatabaseError(error, '鱼缸数据暂时无法加载。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到这个鱼缸。');
  return sendData(request, response, mapAquarium(data));
}));

aquariumsRouter.patch('/aquariums/:id', asyncRoute(async (request, response) => {
  const id = parseId(request.params.id, '鱼缸标识');
  const parsed = aquariumUpdateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '鱼缸更新内容无效。', parsed.error.flatten());
  const { version, ...updates } = parsed.data;
  const client = userClientFor(request);
  const { data, error } = await client
    .from('aquariums')
    .update(snakeize(updates))
    .eq('id', id)
    .eq('version', version)
    .is('deleted_at', null)
    .select(aquariumSelect)
    .maybeSingle();
  if (error) throwDatabaseError(error, '鱼缸没有更新成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquariums', id);
  return sendData(request, response, mapAquarium(data));
}));

aquariumsRouter.delete('/aquariums/:id', asyncRoute(async (request, response) => {
  const id = parseId(request.params.id, '鱼缸标识');
  const parsed = versionSchema.safeParse(Number(request.query.version));
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '删除鱼缸需要当前版本。');
  const client = userClientFor(request);
  const { data, error } = await client
    .from('aquariums')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('version', parsed.data)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();
  if (error) throwDatabaseError(error, '鱼缸没有删除成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquariums', id);
  return sendData(request, response, { deleted: true });
}));

aquariumsRouter.post('/aquariums/:id/species', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const parsed = aquariumSpeciesCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '入缸物种信息无效。', parsed.error.flatten());
  const client = userClientFor(request);
  if (parsed.data.intent === 'planned_addition') {
    const confirmation = parsed.data.compatibilityConfirmation;
    if (!confirmation || !parsed.data.catalogVersion || confirmation.catalogVersion !== parsed.data.catalogVersion) {
      throw new ApiError(400, 'COMPATIBILITY_INFORMATION_REQUIRED', '规划加入前需要同一 Catalog 版本的混养复核结果。');
    }
    const serverDecision = await readPublishedCatalogDecision({
      client,
      aquariumId,
      speciesCatalogKey: parsed.data.speciesCatalogKey,
      catalogVersion: parsed.data.catalogVersion,
    });
    if (serverDecision.status !== confirmation.status) {
      throw new ApiError(409, 'VERSION_CONFLICT', '混养复核结果已变化，请刷新后重新判断。');
    }
    if (serverDecision.status === 'not_recommended') {
      throw new ApiError(409, 'COMPATIBILITY_BLOCKED', '当前混养复核阻止规划加入该物种。');
    }
    if (serverDecision.status === 'insufficient_data') {
      throw new ApiError(400, 'COMPATIBILITY_INFORMATION_REQUIRED', '当前混养资料不足，请补充信息后重新判断。');
    }
    if (serverDecision.status === 'caution' && !confirmation.confirmedAt) {
      throw new ApiError(400, 'COMPATIBILITY_INFORMATION_REQUIRED', '谨慎混养需要明确确认后才能加入。');
    }
  }
  const userId = authenticatedRequest(request).authUser.id;
  const operationKey = requireIdempotencyKey(request);
  const recordId = deterministicUuid(`${userId}:${aquariumId}:species:${operationKey}`);
  const batchId = deterministicUuid(`${userId}:${aquariumId}:${parsed.data.speciesCatalogKey}:batch:${operationKey}`);
  const { data: operationRows, error: operationError } = await client.rpc('add_aquarium_livestock', {
    target_aquarium_id: aquariumId,
    target_species_catalog_key: parsed.data.speciesCatalogKey,
    target_quantity: parsed.data.quantity,
    target_entry_date: parsed.data.entryDate,
    target_last_water_change_at: parsed.data.lastWaterChangeAt ?? null,
    target_life_stage: parsed.data.lifeStage,
    target_reproductive_state: parsed.data.reproductiveState,
    new_species_record_id: recordId,
    new_batch_id: batchId,
    operation_key: operationKey,
    operation_request_hash: getRequestHash(request),
  });
  if (operationError) throwLivestockAdditionRpcError(operationError);
  const savedRecordId = operationRows?.[0]?.species_record_id as string | undefined;
  if (!savedRecordId) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '物种记录已经提交，但暂时无法确认保存结果。');

  const created = await getOwnedSpeciesRecord(client, aquariumId, savedRecordId);
  return sendData(request, response, mapAquariumSpecies(created), 201);
}));

aquariumsRouter.patch('/aquariums/:id/species/:recordId', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const parsed = aquariumSpeciesUpdateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '物种更新内容无效。', parsed.error.flatten());
  const { version, quantity, ...updates } = parsed.data;
  const client = userClientFor(request);
  const current = await getOwnedSpeciesRecord(client, aquariumId, recordId);
  if (current.version !== version) throw new ApiError(409, 'VERSION_CONFLICT', '这条物种记录已更新，请刷新后重试。');

  let parentVersion = version;
  if (quantity !== undefined) {
    const activeBatches = (current.aquarium_species_batches || []).filter((item: DbRow) => !item.deleted_at);
    if (activeBatches.length !== 1) {
      throw new ApiError(409, 'VERSION_CONFLICT', '这个物种已有多个批次，请调整具体批次的数量。');
    }
    const batch = activeBatches[0];
    const { data: updatedBatch, error: batchError } = await client
      .from('aquarium_species_batches')
      .update({ quantity })
      .eq('id', batch.id)
      .eq('version', batch.version)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();
    if (batchError) throwDatabaseError(batchError, '物种数量没有更新成功。');
    if (!updatedBatch) throw new ApiError(409, 'VERSION_CONFLICT', '这个体态批次已更新，请刷新后重试。');
    const refreshed = await getOwnedSpeciesRecord(client, aquariumId, recordId);
    parentVersion = refreshed.version;
    if (Object.keys(updates).length === 0) return sendData(request, response, mapAquariumSpecies(refreshed));
  }

  const { data, error } = await client.from('aquarium_species').update(snakeize(updates)).eq('id', recordId).eq('aquarium_id', aquariumId).eq('version', parentVersion).is('deleted_at', null).select('*').maybeSingle();
  if (error) throwDatabaseError(error, '物种数量没有更新成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_species', recordId);
  return sendData(request, response, mapAquariumSpecies(await getOwnedSpeciesRecord(client, request.params.id, recordId)));
}));

aquariumsRouter.delete('/aquariums/:id/species/:recordId', asyncRoute(async (request, response) => {
  parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const parsed = versionSchema.safeParse(Number(request.query.version));
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '删除物种需要当前版本。');
  const client = userClientFor(request);
  const { data, error } = await client.from('aquarium_species').update({ deleted_at: new Date().toISOString() }).eq('id', recordId).eq('aquarium_id', request.params.id).eq('version', parsed.data).is('deleted_at', null).select('id').maybeSingle();
  if (error) throwDatabaseError(error, '物种没有移出鱼缸。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_species', recordId);
  return sendData(request, response, { deleted: true });
}));

aquariumsRouter.post('/aquariums/:id/species/:recordId/batches', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const parsed = aquariumSpeciesBatchCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '体态批次信息无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;
  await getOwnedSpeciesRecord(client, aquariumId, recordId);

  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('aquarium_species_batches').select('*').eq('id', idempotency.replay.resourceId).maybeSingle();
    if (data) return sendData(request, response, camelize(data));
  }

  const id = deterministicUuid(`${userId}:${recordId}:batch:${idempotency.key}`);
  const { data, error } = await client.from('aquarium_species_batches').insert({
    id,
    aquarium_species_id: recordId,
    ...snakeize(parsed.data),
    state_updated_at: new Date().toISOString(),
  }).select('*').single();
  if (error || !data) throwDatabaseError(error, '体态批次没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'aquarium_species_batch', id, 201);
  return sendData(request, response, camelize(data), 201);
}));

aquariumsRouter.patch('/aquariums/:id/species/:recordId/batches/:batchId', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const batchId = parseId(request.params.batchId, '批次标识');
  const parsed = aquariumSpeciesBatchUpdateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '体态更新内容无效。', parsed.error.flatten());
  const client = userClientFor(request);
  await getOwnedSpeciesRecord(client, aquariumId, recordId);
  const { version, ...updates } = parsed.data;
  const stateChanged = updates.lifeStage !== undefined || updates.reproductiveState !== undefined;
  const { data, error } = await client.from('aquarium_species_batches').update({
    ...snakeize(updates),
    ...(stateChanged ? { state_updated_at: new Date().toISOString() } : {}),
  }).eq('id', batchId).eq('aquarium_species_id', recordId).eq('version', version).is('deleted_at', null).select('*').maybeSingle();
  if (error) throwDatabaseError(error, '体态批次没有更新成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_species_batches', batchId);
  return sendData(request, response, camelize(data));
}));

aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/split', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const batchId = parseId(request.params.batchId, '批次标识');
  const parsed = aquariumSpeciesBatchSplitSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '拆分批次信息无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;
  await getOwnedSpeciesRecord(client, aquariumId, recordId);

  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('aquarium_species_batches').select('*').eq('aquarium_species_id', recordId).is('deleted_at', null).order('created_at');
    return sendData(request, response, (data || []).map(item => camelize(item)));
  }

  const newId = deterministicUuid(`${userId}:${recordId}:split:${idempotency.key}`);
  const { data, error } = await client.rpc('split_aquarium_species_batch', {
    source_batch_id: batchId,
    expected_species_record_id: recordId,
    source_version: parsed.data.sourceVersion,
    split_quantity: parsed.data.quantity,
    split_entry_date: parsed.data.entryDate ?? null,
    split_life_stage: parsed.data.lifeStage,
    split_reproductive_state: parsed.data.reproductiveState,
    new_batch_id: newId,
  });
  if (error?.message?.includes('BATCH_VERSION_CONFLICT')) throw new ApiError(409, 'VERSION_CONFLICT', '这个批次已更新，请刷新后再拆分。');
  if (error?.message?.includes('INVALID_SPLIT_QUANTITY')) throw new ApiError(400, 'VALIDATION_ERROR', '拆分数量必须小于原批次数量。');
  if (error) throwDatabaseError(error, '批次没有拆分成功，数量保持不变。');
  await finishIdempotentWrite(request, idempotency, 'aquarium_species_batch', newId, 201);
  return sendData(request, response, (data || []).map(item => camelize(item)), 201);
}));

aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/merge', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const targetBatchId = parseId(request.params.batchId, '目标批次标识');
  const parsed = aquariumSpeciesBatchMergeSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '合并批次信息无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  await getOwnedSpeciesRecord(client, aquariumId, recordId);
  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('aquarium_species_batches').select('*').eq('aquarium_species_id', recordId).is('deleted_at', null).order('created_at');
    return sendData(request, response, (data || []).map(item => camelize(item)));
  }
  const { data, error } = await client.rpc('merge_aquarium_species_batches', {
    expected_species_record_id: recordId,
    target_batch_id: targetBatchId,
    source_batch_id: parsed.data.sourceBatchId,
    final_entry_date: parsed.data.targetEntryDate,
    final_life_stage: parsed.data.targetLifeStage,
    final_reproductive_state: parsed.data.targetReproductiveState,
    target_version: parsed.data.targetVersion,
    source_version: parsed.data.sourceVersion,
  });
  if (error?.message?.includes('BATCH_VERSION_CONFLICT')) throw new ApiError(409, 'VERSION_CONFLICT', '批次已更新，请刷新后再合并。');
  if (error) throwDatabaseError(error, '批次没有合并成功，数量保持不变。');
  await finishIdempotentWrite(request, idempotency, 'aquarium_species_batch', targetBatchId, 200);
  return sendData(request, response, (data || []).map(item => camelize(item)));
}));

aquariumsRouter.delete('/aquariums/:id/species/:recordId/batches/:batchId', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const batchId = parseId(request.params.batchId, '批次标识');
  const parsed = versionSchema.safeParse(Number(request.query.version));
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '删除批次需要当前版本。');
  const client = userClientFor(request);
  const parent = await getOwnedSpeciesRecord(client, aquariumId, recordId);
  const activeBatches = (parent.aquarium_species_batches || []).filter((item: DbRow) => !item.deleted_at);
  const { data, error } = await client.from('aquarium_species_batches').update({ deleted_at: new Date().toISOString() }).eq('id', batchId).eq('aquarium_species_id', recordId).eq('version', parsed.data).is('deleted_at', null).select('id').maybeSingle();
  if (error) throwDatabaseError(error, '批次没有删除成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_species_batches', batchId);
  return sendData(request, response, { deleted: true, speciesRemoved: activeBatches.length === 1 });
}));

aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/remove', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const batchId = parseId(request.params.batchId, '批次标识');
  const parsed = aquariumSpeciesBatchRemovalSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '移出数量必须是正整数。', parsed.error.flatten());
  const client = userClientFor(request);
  const operationKey = requireIdempotencyKey(request);
  const { error } = await client.rpc('remove_aquarium_species_batch_quantity', {
    expected_aquarium_id: aquariumId,
    expected_species_record_id: recordId,
    target_batch_id: batchId,
    removal_quantity: parsed.data.quantity,
    operation_key: operationKey,
    operation_request_hash: getRequestHash(request),
  });
  if (error?.message?.includes('INVALID_REMOVAL_QUANTITY')) throw new ApiError(400, 'VALIDATION_ERROR', '移出数量超出当前批次范围。');
  if (error?.message?.includes('INVALID_OPERATION_KEY') || error?.message?.includes('INVALID_REQUEST_HASH')) throw new ApiError(400, 'VALIDATION_ERROR', '移出操作标识无效。');
  if (error?.message?.includes('DUPLICATE_OPERATION_KEY')) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一项移出操作。');
  if (error?.message?.includes('BATCH_NOT_FOUND')) throw new ApiError(404, 'NOT_FOUND', '没有找到需要移出的批次。');
  if (error) throwDatabaseError(error, '缸内物种数量没有更新成功。');
  const { data: aquarium, error: aquariumError } = await client
    .from('aquariums')
    .select(aquariumSelect)
    .eq('id', aquariumId)
    .is('deleted_at', null)
    .maybeSingle();
  if (aquariumError) throwDatabaseError(aquariumError, '鱼缸数据暂时无法刷新。');
  if (!aquarium) throw new ApiError(404, 'NOT_FOUND', '没有找到当前鱼缸。');
  return sendData(request, response, mapAquarium(aquarium));
}));

aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const recordId = parseId(request.params.recordId, '物种记录标识');
  const batchId = parseId(request.params.batchId, '批次标识');
  const parsed = livestockMemorialCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '生命纪念内容无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;
  const memorialId = deterministicUuid(`${userId}:${recordId}:memorial:${idempotency.key}`);
  const replay = await resolveLivestockMemorialReplay({
    resourceId: idempotency.replay?.resourceId || memorialId,
    replayRequired: Boolean(idempotency.replay?.resourceId),
    loadReplay: async (resourceId) => {
      const { data, error } = await client.from('memorial_records').select('*').eq('id', resourceId).maybeSingle();
      if (error) throwDatabaseError(error, '已保存的生命纪念暂时无法读取。');
      if (data && (
        data.species_catalog_key !== parsed.data.speciesCatalogKey
        || data.memorial_date !== parsed.data.memorialDate
        || JSON.stringify(data.cause_codes || []) !== JSON.stringify(parsed.data.causeCodes)
        || (data.reason || undefined) !== parsed.data.reason
        || (data.observation || undefined) !== parsed.data.observation
        || (data.improvement || undefined) !== parsed.data.improvement
      )) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一条生命纪念。');
      return data;
    },
    assertOwnedSpecies: async () => { await getOwnedSpeciesRecord(client, aquariumId, recordId); },
  });
  if (replay) return sendData(request, response, camelize(replay), idempotency.replay?.responseStatus || 201);
  const { data, error } = await client.rpc('record_livestock_memorial', {
    target_aquarium_id: aquariumId,
    target_species_record_id: recordId,
    target_batch_id: batchId,
    target_batch_version: parsed.data.batchVersion,
    target_memorial_date: parsed.data.memorialDate,
    target_cause_codes: parsed.data.causeCodes,
    target_observation: parsed.data.observation ?? null,
    target_reason: parsed.data.reason ?? null,
    target_improvement: parsed.data.improvement ?? null,
    new_memorial_id: memorialId,
  }).single();
  if (error?.message?.includes('BATCH_VERSION_CONFLICT')) throw new ApiError(409, 'VERSION_CONFLICT', '这个批次已更新，请刷新后再记录。');
  if (error || !data) throwDatabaseError(error, '生命纪念没有保存成功，缸内数量保持不变。');
  await finishIdempotentWrite(request, idempotency, 'memorial_record', memorialId, 201);
  return sendData(request, response, camelize(data), 201);
}));

aquariumsRouter.put('/aquariums/:id/equipment', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const parsed = aquariumEquipmentUpsertSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '设备信息无效。', parsed.error.flatten());
  const client = userClientFor(request);
  const { version, ...updates } = parsed.data;

  if (version) {
    const { data, error } = await client.from('aquarium_equipment').update(snakeize(updates)).eq('aquarium_id', aquariumId).eq('version', version).is('deleted_at', null).select('*').maybeSingle();
    if (error) throwDatabaseError(error, '设备信息没有更新成功。');
    if (!data) {
      const { data: existing } = await client.from('aquarium_equipment').select('id').eq('aquarium_id', aquariumId).is('deleted_at', null).maybeSingle();
      if (!existing) throw new ApiError(404, 'NOT_FOUND', '没有找到鱼缸设备记录。');
      throw new ApiError(409, 'VERSION_CONFLICT', '设备信息已更新，请刷新后重试。');
    }
    return sendData(request, response, camelize(data));
  }

  const { data, error } = await client.from('aquarium_equipment').insert({ aquarium_id: aquariumId, ...snakeize(updates) }).select('*').single();
  if (error || !data) throwDatabaseError(error, '设备信息没有保存成功。');
  return sendData(request, response, camelize(data), 201);
}));

aquariumsRouter.post('/aquariums/:id/components', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const parsed = aquariumComponentCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '环境配置无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;
  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('aquarium_components').select('*').eq('id', idempotency.replay.resourceId).maybeSingle();
    if (data) return sendData(request, response, camelize(data));
  }
  const id = deterministicUuid(`${userId}:${aquariumId}:component:${idempotency.key}`);
  const { data, error } = await client.from('aquarium_components').insert({ id, aquarium_id: aquariumId, ...snakeize(parsed.data) }).select('*').single();
  if (error || !data) throwDatabaseError(error, '环境配置没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'aquarium_component', id, 201);
  return sendData(request, response, camelize(data), 201);
}));

aquariumsRouter.patch('/aquariums/:id/components/:componentId', asyncRoute(async (request, response) => {
  parseId(request.params.id, '鱼缸标识');
  const componentId = parseId(request.params.componentId, '配置标识');
  const parsed = aquariumComponentUpdateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '环境配置更新无效。', parsed.error.flatten());
  const { version, ...updates } = parsed.data;
  const client = userClientFor(request);
  const { data, error } = await client.from('aquarium_components').update(snakeize(updates)).eq('id', componentId).eq('aquarium_id', request.params.id).eq('version', version).is('deleted_at', null).select('*').maybeSingle();
  if (error) throwDatabaseError(error, '环境配置没有更新成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_components', componentId);
  return sendData(request, response, camelize(data));
}));

aquariumsRouter.delete('/aquariums/:id/components/:componentId', asyncRoute(async (request, response) => {
  parseId(request.params.id, '鱼缸标识');
  const componentId = parseId(request.params.componentId, '配置标识');
  const parsed = versionSchema.safeParse(Number(request.query.version));
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '删除配置需要当前版本。');
  const client = userClientFor(request);
  const { data, error } = await client.from('aquarium_components').update({ deleted_at: new Date().toISOString() }).eq('id', componentId).eq('aquarium_id', request.params.id).eq('version', parsed.data).is('deleted_at', null).select('id').maybeSingle();
  if (error) throwDatabaseError(error, '环境配置没有删除成功。');
  if (!data) await throwMissingOrVersionConflict(client, 'aquarium_components', componentId);
  return sendData(request, response, { deleted: true });
}));
