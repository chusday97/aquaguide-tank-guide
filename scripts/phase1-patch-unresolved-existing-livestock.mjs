import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, search, replacement, label) => {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(search, replacement);
};

const replaceRegexOnce = (source, regex, replacement, label) => {
  const matches = source.match(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`)) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly one regex match, found ${matches.length}`);
  return source.replace(regex, replacement);
};

const patch = async (path, transform) => {
  const source = await readFile(path, 'utf8');
  const next = transform(source);
  if (next === source) throw new Error(`${path}: patch made no change`);
  await writeFile(path, next, 'utf8');
  console.log(`patched ${path}`);
};

await patch('src/types.ts', source => {
  let next = replaceOnce(
    source,
    'export interface AquariumFish {\n',
    "export type LivestockIdentityStatus = 'verified' | 'unresolved';\n\nexport interface AquariumFish {\n",
    'AquariumFish identity type',
  );
  next = replaceOnce(
    next,
    '  fishId: string;\n  quantity: number;\n',
    "  fishId: string; // canonical catalog key for verified records; explicit unresolved:* mirror key otherwise\n  identityStatus?: LivestockIdentityStatus;\n  rawName?: string;\n  quantity: number;\n",
    'AquariumFish identity fields',
  );
  return next;
});

await patch('src/types/database.ts', source => {
  let next = replaceOnce(
    source,
    "export type ReproductiveState = 'unknown' | 'not_applicable' | 'normal' | 'pregnant_or_gravid' | 'in_labor_or_spawning' | 'postpartum_recovery';\n",
    "export type ReproductiveState = 'unknown' | 'not_applicable' | 'normal' | 'pregnant_or_gravid' | 'in_labor_or_spawning' | 'postpartum_recovery';\nexport type LivestockIdentityStatus = 'verified' | 'unresolved';\n",
    'database identity type',
  );
  next = replaceOnce(
    next,
    'export interface AquariumSpeciesRecord extends SyncFields {\n  id: Uuid;\n  aquariumId: Uuid;\n  speciesId?: Uuid;\n  speciesCatalogKey: string;\n  quantity: number;\n',
    'export interface AquariumSpeciesRecord extends SyncFields {\n  id: Uuid;\n  aquariumId: Uuid;\n  speciesId?: Uuid;\n  speciesCatalogKey?: string;\n  identityStatus: LivestockIdentityStatus;\n  rawName?: string;\n  quantity: number;\n',
    'database AquariumSpeciesRecord',
  );
  return next;
});

await patch('src/services/repository/aquaguide.repository.ts', source => replaceOnce(
  source,
  "export type LivestockAddCommand = {\n  aquariumId: string;\n  speciesCatalogKey: string;\n  quantity: number;\n  entryDate: string;\n  lifeStage?: LifeStage;\n  reproductiveState?: ReproductiveState;\n  operationId: string;\n};\n",
  "type LivestockAddCommandBase = {\n  aquariumId: string;\n  quantity: number;\n  entryDate: string;\n  lifeStage?: LifeStage;\n  reproductiveState?: ReproductiveState;\n  operationId: string;\n};\n\nexport type LivestockAddCommand = LivestockAddCommandBase & (\n  | { identityStatus?: 'verified'; speciesCatalogKey: string; rawName?: never }\n  | { identityStatus: 'unresolved'; rawName: string; speciesCatalogKey?: never }\n);\n",
  'repository LivestockAddCommand',
));

await patch('packages/contracts/src/business.ts', source => replaceRegexOnce(
  source,
  /export const aquariumSpeciesCreateSchema = z\.object\(\{[\s\S]*?\n\}\);\n\nexport const aquariumSpeciesUpdateSchema/,
  `const aquariumSpeciesCreateBaseSchema = z.object({
  quantity: z.number().int().positive().max(100000),
  entryDate: isoDateSchema,
  lastWaterChangeAt: isoDateTimeSchema.optional(),
  lifeStage: lifeStageSchema.default('unknown'),
  reproductiveState: reproductiveStateSchema.default('unknown'),
});

export const aquariumSpeciesCreateSchema = z.union([
  aquariumSpeciesCreateBaseSchema.extend({
    identityStatus: z.literal('verified').default('verified'),
    speciesCatalogKey: z.string().trim().min(1).max(160),
    rawName: z.never().optional(),
  }),
  aquariumSpeciesCreateBaseSchema.extend({
    identityStatus: z.literal('unresolved'),
    rawName: z.string().trim().min(1).max(160),
    speciesCatalogKey: z.never().optional(),
    lastWaterChangeAt: z.never().optional(),
  }),
]);

export const aquariumSpeciesUpdateSchema`,
  'contract aquariumSpeciesCreateSchema',
));

await patch('src/services/repository/local-aquaguide.repository.ts', source => replaceRegexOnce(
  source,
  /  async addLivestock\(input: LivestockAddCommand\) \{[\s\S]*?\n  \}\n\n  async setWaterChange/,
  `  async addLivestock(input: LivestockAddCommand) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('记录数量必须是正整数。');
    const state = loadAppStateFromStorage();
    const aquarium = state.aquariums.find(item => item.id === input.aquariumId);
    if (!aquarium) throw new Error('没有找到需要记录生物的鱼缸。');
    const batchId = \`livestock_\${input.operationId}\`;
    if (aquarium.fishes.some(item => item.batches?.some(batch => batch.id === batchId))) return aquarium;

    const unresolved = input.identityStatus === 'unresolved';
    const current = unresolved ? undefined : aquarium.fishes.find(item => item.fishId === input.speciesCatalogKey);
    const recordId = \`species_\${input.operationId}\`;
    const mirrorFishId = unresolved ? \`unresolved:\${recordId}\` : input.speciesCatalogKey;
    const nextRecord = current
      ? appendSpeciesBatch(current, {
          id: batchId,
          quantity: input.quantity,
          entryDate: input.entryDate,
          lifeStage: input.lifeStage,
          reproductiveState: input.reproductiveState,
        })
      : {
          id: recordId,
          fishId: mirrorFishId,
          identityStatus: unresolved ? 'unresolved' as const : 'verified' as const,
          rawName: unresolved ? input.rawName.trim() : undefined,
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

  async setWaterChange`,
  'local repository addLivestock',
));

await patch('src/services/repository/api-aquaguide.repository.ts', source => {
  let next = replaceOnce(
    source,
    "type ApiAquariumSpecies = {\n  id: string;\n  speciesCatalogKey: string;\n  quantity: number;\n",
    "type ApiAquariumSpecies = {\n  id: string;\n  speciesCatalogKey?: string;\n  identityStatus?: 'verified' | 'unresolved';\n  rawName?: string;\n  quantity: number;\n",
    'API aquarium species shape',
  );
  next = replaceOnce(
    next,
    "    fishes: (record.species || []).map<ApiAquariumFish>(item => ({\n      id: item.id,\n      fishId: item.speciesCatalogKey,\n      quantity: item.quantity,\n",
    "    fishes: (record.species || []).map<ApiAquariumFish>(item => ({\n      id: item.id,\n      fishId: item.identityStatus === 'unresolved' || !item.speciesCatalogKey\n        ? `unresolved:${item.id}`\n        : item.speciesCatalogKey,\n      identityStatus: item.identityStatus || 'verified',\n      rawName: item.rawName,\n      quantity: item.quantity,\n",
    'API toLegacy aquarium species identity',
  );
  next = replaceRegexOnce(
    next,
    /  async addLivestock\(input: LivestockAddCommand\) \{[\s\S]*?\n  \}\n\n  async setWaterChange/,
    `  async addLivestock(input: LivestockAddCommand) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('记录数量必须是正整数。');
    await apiRequest(\`/aquariums/\${input.aquariumId}/species\`, {
      method: 'POST',
      body: input.identityStatus === 'unresolved'
        ? {
            identityStatus: 'unresolved',
            rawName: input.rawName,
            quantity: input.quantity,
            entryDate: input.entryDate.slice(0, 10),
            lifeStage: input.lifeStage,
            reproductiveState: input.reproductiveState,
          }
        : {
            identityStatus: 'verified',
            speciesCatalogKey: input.speciesCatalogKey,
            quantity: input.quantity,
            entryDate: input.entryDate.slice(0, 10),
            lifeStage: input.lifeStage,
            reproductiveState: input.reproductiveState,
          },
      idempotencyKey: input.operationId,
    });
    const saved = await apiRequest<ApiAquarium>(\`/aquariums/\${input.aquariumId}\`);
    return this.rememberAquarium(saved);
  }

  async setWaterChange`,
    'API repository addLivestock',
  );
  return next;
});

await patch('apps/api/src/routes/aquariums.ts', source => replaceRegexOnce(
  source,
  /aquariumsRouter\.post\('\/aquariums\/:id\/species',[\s\S]*?\n\}\)\);\n\naquariumsRouter\.patch\('\/aquariums\/:id\/species\/:recordId'/,
  `aquariumsRouter.post('/aquariums/:id/species', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const parsed = aquariumSpeciesCreateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '入缸物种信息无效。', parsed.error.flatten());
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;
  const operationKey = requireIdempotencyKey(request);
  const identityKey = parsed.data.identityStatus === 'unresolved'
    ? 'unresolved'
    : parsed.data.speciesCatalogKey;
  const recordId = deterministicUuid(\`\${userId}:\${aquariumId}:species:\${operationKey}\`);
  const batchId = deterministicUuid(\`\${userId}:\${aquariumId}:\${identityKey}:batch:\${operationKey}\`);

  const rpcResult = parsed.data.identityStatus === 'unresolved'
    ? await client.rpc('add_unresolved_aquarium_livestock', {
        target_aquarium_id: aquariumId,
        target_raw_name: parsed.data.rawName,
        target_quantity: parsed.data.quantity,
        target_entry_date: parsed.data.entryDate,
        target_life_stage: parsed.data.lifeStage,
        target_reproductive_state: parsed.data.reproductiveState,
        new_species_record_id: recordId,
        new_batch_id: batchId,
        operation_key: operationKey,
        operation_request_hash: getRequestHash(request),
      })
    : await client.rpc('add_aquarium_livestock', {
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

  if (rpcResult.error) {
    if (parsed.data.identityStatus === 'unresolved') {
      if (rpcResult.error.message?.includes('AQUARIUM_NOT_FOUND')) throw new ApiError(404, 'NOT_FOUND', '没有找到这个鱼缸。');
      if (rpcResult.error.message?.includes('DUPLICATE_OPERATION_KEY')) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一项修改。');
      if (rpcResult.error.message?.includes('INVALID_RAW_NAME')) throw new ApiError(400, 'VALIDATION_ERROR', '未确认生物名称无效。');
      throwDatabaseError(rpcResult.error, '未确认生物没有保存成功。');
    }
    throwLivestockAdditionRpcError(rpcResult.error);
  }

  const savedRecordId = rpcResult.data?.[0]?.species_record_id as string | undefined;
  if (!savedRecordId) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '物种记录已经提交，但暂时无法确认保存结果。');
  const created = await getOwnedSpeciesRecord(client, aquariumId, savedRecordId);
  return sendData(request, response, mapAquariumSpecies(created), 201);
}));

aquariumsRouter.patch('/aquariums/:id/species/:recordId'`,
  'aquarium species POST route',
));

await patch('src/lib/tankCompatibilityEngine.ts', source => {
  let next = replaceOnce(
    source,
    "  existingSpecies?: Array<Fish | { species?: Fish | null; record?: { quantity?: number } | null }>;\n  candidateSpecies?: Fish | null;\n",
    "  existingSpecies?: Array<Fish | { species?: Fish | null; record?: { quantity?: number } | null }>;\n  unresolvedExistingSpecies?: Array<{ id?: string; rawName?: string }>;\n  candidateSpecies?: Fish | null;\n",
    'compatibility unresolved input',
  );
  next = replaceOnce(
    next,
    "  existingSpecies = [],\n  candidateSpecies,\n",
    "  existingSpecies = [],\n  unresolvedExistingSpecies = [],\n  candidateSpecies,\n",
    'compatibility destructure unresolved input',
  );
  next = replaceOnce(
    next,
    "  const currentLivestock = normalizeExistingSpecies(existingSpecies);\n",
    "  if (unresolvedExistingSpecies.length > 0) {\n    const names = unresolvedExistingSpecies.map(item => item.rawName?.trim()).filter(Boolean) as string[];\n    const label = names.length > 0 ? names.join('、') : `${unresolvedExistingSpecies.length} 个未确认生物`;\n    missingData.push(asRule(\n      'unresolved_existing_livestock',\n      '缸内存在未确认生物',\n      `当前鱼缸包含 ${label}，其物种身份与行为资料尚未确认，不能据此给出完整混养结论。`,\n      'medium',\n      { basis: 'rule_inference', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [] },\n    ));\n  }\n\n  const currentLivestock = normalizeExistingSpecies(existingSpecies);\n",
    'compatibility missing-data rule',
  );
  return next;
});

await patch('src/services/aquarium/species-addition.service.ts', source => {
  let next = replaceOnce(
    source,
    "  const existingFromTank = aquarium.fishes.flatMap(record => {\n    const species = catalogById.get(record.fishId);\n    return species ? [{ species, record: { quantity: Math.max(1, record.quantity || 1) } }] : [];\n  });\n",
    "  const existingFromTank = aquarium.fishes.flatMap(record => {\n    const species = catalogById.get(record.fishId);\n    return species ? [{ species, record: { quantity: Math.max(1, record.quantity || 1) } }] : [];\n  });\n  const unresolvedExistingSpecies = aquarium.fishes\n    .filter(record => record.identityStatus === 'unresolved' || !catalogById.has(record.fishId))\n    .map(record => ({ id: record.id, rawName: record.rawName }));\n",
    'species addition unresolved current livestock',
  );
  next = replaceOnce(
    next,
    "        existingSpecies: [...existingFromTank, ...otherAdditions],\n        candidateSpecies: fish,\n",
    "        existingSpecies: [...existingFromTank, ...otherAdditions],\n        unresolvedExistingSpecies,\n        candidateSpecies: fish,\n",
    'species addition pass unresolved current livestock',
  );
  return next;
});

await patch('src/services/aquarium/livestock-recording.service.ts', source => {
  let next = replaceOnce(
    source,
    "export type FailedLivestockRecord = SpeciesAdditionItem & { message: string };\n\nexport type RecordExistingResult = {\n",
    "export type UnresolvedExistingLivestockItem = {\n  identityStatus: 'unresolved';\n  rawName: string;\n  quantity: number;\n  entryDate?: string;\n};\nexport type ExistingLivestockRecordItem = SpeciesAdditionItem | UnresolvedExistingLivestockItem;\nexport type FailedLivestockRecord = ExistingLivestockRecordItem & { message: string };\n\nexport type RecordExistingResult = {\n",
    'recording item types',
  );
  next = replaceOnce(
    next,
    "  savedItems: SpeciesAdditionItem[];\n",
    "  savedItems: ExistingLivestockRecordItem[];\n",
    'recording saved items type',
  );
  next = replaceOnce(
    next,
    "  items: SpeciesAdditionItem[];\n",
    "  items: ExistingLivestockRecordItem[];\n",
    'recording input items type',
  );
  next = replaceOnce(
    next,
    "  const items = normalizeSpeciesAdditionItems(input.items, input.speciesCatalog);\n  if (items.length === 0) throw new Error('请至少选择一种已在缸内的生物。');\n",
    "  const verifiedInput = input.items.filter((item): item is SpeciesAdditionItem => !('identityStatus' in item) || item.identityStatus !== 'unresolved');\n  const verifiedItems = normalizeSpeciesAdditionItems(verifiedInput, input.speciesCatalog);\n  const unresolvedItems = input.items\n    .filter((item): item is UnresolvedExistingLivestockItem => 'identityStatus' in item && item.identityStatus === 'unresolved')\n    .map(item => ({ ...item, rawName: item.rawName.trim(), quantity: Math.max(1, Math.round(Number(item.quantity) || 1)) }))\n    .filter(item => item.rawName.length > 0);\n  const items: ExistingLivestockRecordItem[] = [...verifiedItems, ...unresolvedItems];\n  if (items.length === 0) throw new Error('请至少选择或填写一种已在缸内的生物。');\n",
    'recording normalize items',
  );
  next = replaceOnce(
    next,
    "  const savedItems: SpeciesAdditionItem[] = [];\n",
    "  const savedItems: ExistingLivestockRecordItem[] = [];\n",
    'recording saved array',
  );
  next = replaceOnce(
    next,
    "      savedAquarium = await input.repository.addLivestock({\n        aquariumId: savedAquarium.id,\n        speciesCatalogKey: item.fishId,\n        quantity: item.quantity,\n        entryDate: item.entryDate || new Date().toISOString().slice(0, 10),\n        operationId: `${input.operationId}:${item.fishId}`,\n      });\n",
    "      const unresolved = 'identityStatus' in item && item.identityStatus === 'unresolved';\n      savedAquarium = await input.repository.addLivestock(unresolved ? {\n        aquariumId: savedAquarium.id,\n        identityStatus: 'unresolved',\n        rawName: item.rawName,\n        quantity: item.quantity,\n        entryDate: item.entryDate || new Date().toISOString().slice(0, 10),\n        operationId: `${input.operationId}:unresolved:${item.rawName}`,\n      } : {\n        aquariumId: savedAquarium.id,\n        identityStatus: 'verified',\n        speciesCatalogKey: item.fishId,\n        quantity: item.quantity,\n        entryDate: item.entryDate || new Date().toISOString().slice(0, 10),\n        operationId: `${input.operationId}:${item.fishId}`,\n      });\n",
    'recording repository write',
  );
  next = replaceOnce(
    next,
    "  try {\n    const assessment = assessSpeciesAddition({\n      aquarium: baselineAquarium,\n      items: savedItems,\n      speciesCatalog: input.speciesCatalog,\n    });\n",
    "  const savedUnresolved = savedItems.filter((item): item is UnresolvedExistingLivestockItem => 'identityStatus' in item && item.identityStatus === 'unresolved');\n  if (savedUnresolved.length > 0) {\n    return {\n      aquarium: savedAquarium,\n      assessment: null,\n      assessmentFailure: `已记录 ${savedUnresolved.length} 个未确认生物；身份补齐前不会给出完整混养结论。`,\n      policy: null,\n      savedItems,\n      failedItems,\n    };\n  }\n\n  try {\n    const assessment = assessSpeciesAddition({\n      aquarium: baselineAquarium,\n      items: savedItems as SpeciesAdditionItem[],\n      speciesCatalog: input.speciesCatalog,\n    });\n",
    'recording unresolved assessment boundary',
  );
  return next;
});

console.log('all unresolved existing-livestock patches applied');
