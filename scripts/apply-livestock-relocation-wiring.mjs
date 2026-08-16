import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (path, before, after) => {
  const content = readFileSync(path, 'utf8');
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one anchor, found ${count}`);
  writeFileSync(path, content.replace(before, after));
};

replaceOnce(
  'packages/contracts/src/index.ts',
  "export * from './business';\n",
  "export * from './business';\nexport * from './livestock-relocation';\n",
);

replaceOnce(
  'src/services/repository/aquaguide.repository.ts',
  `export type LivestockRemovalInput = {\n  aquariumId: string;\n  aquariumFishId: string;\n  batchId: string;\n  quantity: number;\n  operationId: string;\n};\n`,
  `export type LivestockRemovalInput = {\n  aquariumId: string;\n  aquariumFishId: string;\n  batchId: string;\n  quantity: number;\n  operationId: string;\n};\n\nexport type LivestockRelocationInput = {\n  sourceAquariumId: string;\n  sourceAquariumFishId: string;\n  sourceBatchId: string;\n  destinationAquariumId: string;\n  quantity: number;\n  operationId: string;\n};\n\nexport type LivestockRelocationMutationResult = {\n  sourceAquarium: Aquarium;\n  destinationAquarium: Aquarium;\n  destinationFishId: string;\n  destinationBatchId: string;\n  replayed: boolean;\n};\n`,
);

replaceOnce(
  'src/services/repository/aquaguide.repository.ts',
  `  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;\n`,
  `  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;\n  relocateLivestock(input: LivestockRelocationInput): Promise<LivestockRelocationMutationResult>;\n`,
);

replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  `import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';\n`,
  `import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';\nimport { relocateLivestockInAquariums } from '../aquarium/livestock-relocation.service';\n`,
);

replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  `  LivestockRemovalInput,\n  LivestockAddCommand,\n`,
  `  LivestockRemovalInput,\n  LivestockRelocationInput,\n  LivestockAddCommand,\n`,
);

replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  `  async getFavorites() {\n`,
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    const state = loadAppStateFromStorage();\n    const result = relocateLivestockInAquariums(state.aquariums, input);\n    const persisted = persistAquariums(result.aquariums, state.currentAquariumId || input.sourceAquariumId);\n    const sourceAquarium = persisted.aquariums.find(item => item.id === input.sourceAquariumId);\n    const destinationAquarium = persisted.aquariums.find(item => item.id === input.destinationAquariumId);\n    if (!sourceAquarium || !destinationAquarium) throw new Error('迁移后鱼缸状态无法确认。');\n    return {\n      sourceAquarium,\n      destinationAquarium,\n      destinationFishId: result.destinationFishId,\n      destinationBatchId: result.destinationBatchId,\n      replayed: result.replayed,\n    };\n  }\n\n  async getFavorites() {\n`,
);

replaceOnce(
  'src/services/repository/api-aquaguide.repository.ts',
  `  LivestockRemovalInput,\n  LivestockAddCommand,\n`,
  `  LivestockRemovalInput,\n  LivestockRelocationInput,\n  LivestockAddCommand,\n`,
);

replaceOnce(
  'src/services/repository/api-aquaguide.repository.ts',
  `  private async resolveContentId(type: 'species' | 'care', catalogKey: string) {\n`,
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('迁移数量必须是正整数。');\n    const result = await apiRequest<{\n      sourceAquarium: ApiAquarium;\n      destinationAquarium: ApiAquarium;\n      relocation: { destinationSpeciesRecordId: string; destinationBatchId: string; replayed: boolean };\n    }>(\`/aquariums/\${input.sourceAquariumId}/species/\${input.sourceAquariumFishId}/batches/\${input.sourceBatchId}/relocate\`, {\n      method: 'POST',\n      body: { destinationAquariumId: input.destinationAquariumId, quantity: input.quantity },\n      idempotencyKey: input.operationId,\n    });\n    return {\n      sourceAquarium: this.rememberAquarium(result.sourceAquarium),\n      destinationAquarium: this.rememberAquarium(result.destinationAquarium),\n      destinationFishId: result.relocation.destinationSpeciesRecordId,\n      destinationBatchId: result.relocation.destinationBatchId,\n      replayed: result.relocation.replayed,\n    };\n  }\n\n  private async resolveContentId(type: 'species' | 'care', catalogKey: string) {\n`,
);

replaceOnce(
  'apps/api/src/routes/aquariums.ts',
  `  livestockMemorialCreateSchema,\n`,
  `  livestockMemorialCreateSchema,\n  livestockRelocationSchema,\n`,
);

replaceOnce(
  'apps/api/src/routes/aquariums.ts',
  `aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial', asyncRoute(async (request, response) => {\n`,
  `aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/relocate', asyncRoute(async (request, response) => {\n  const sourceAquariumId = parseId(request.params.id, '源鱼缸标识');\n  const sourceRecordId = parseId(request.params.recordId, '源物种记录标识');\n  const sourceBatchId = parseId(request.params.batchId, '源批次标识');\n  const parsed = livestockRelocationSchema.safeParse(request.body);\n  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '迁移信息无效。', parsed.error.flatten());\n  if (parsed.data.destinationAquariumId === sourceAquariumId) throw new ApiError(400, 'VALIDATION_ERROR', '源鱼缸和目标鱼缸必须不同。');\n\n  const client = userClientFor(request);\n  const userId = authenticatedRequest(request).authUser.id;\n  const operationKey = requireIdempotencyKey(request);\n  const newDestinationSpeciesRecordId = deterministicUuid(\`\${userId}:\${parsed.data.destinationAquariumId}:relocation-species:\${operationKey}\`);\n  const newDestinationBatchId = deterministicUuid(\`\${userId}:\${parsed.data.destinationAquariumId}:relocation-batch:\${operationKey}\`);\n\n  const { data, error } = await client.rpc('relocate_verified_aquarium_livestock', {\n    source_aquarium_id: sourceAquariumId,\n    source_species_record_id: sourceRecordId,\n    source_batch_id: sourceBatchId,\n    destination_aquarium_id: parsed.data.destinationAquariumId,\n    relocation_quantity: parsed.data.quantity,\n    new_destination_species_record_id: newDestinationSpeciesRecordId,\n    new_destination_batch_id: newDestinationBatchId,\n    operation_key: operationKey,\n    operation_request_hash: getRequestHash(request),\n  });\n\n  const message = error?.message || '';\n  if (message.includes('SAME_AQUARIUM') || message.includes('INVALID_RELOCATION_QUANTITY')) throw new ApiError(400, 'VALIDATION_ERROR', '迁移鱼缸或数量无效。');\n  if (message.includes('DUPLICATE_OPERATION_KEY')) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一项迁移。');\n  if (message.includes('UNRESOLVED_SOURCE_SPECIES')) throw new ApiError(409, 'VERSION_CONFLICT', '这个生物的身份尚未确认，不能使用已验证物种迁移。');\n  if (message.includes('SOURCE_AQUARIUM_NOT_FOUND') || message.includes('SOURCE_SPECIES_NOT_FOUND') || message.includes('SOURCE_BATCH_NOT_FOUND')) throw new ApiError(404, 'NOT_FOUND', '没有找到需要迁移的源记录。');\n  if (message.includes('DESTINATION_AQUARIUM_NOT_FOUND')) throw new ApiError(404, 'NOT_FOUND', '没有找到目标鱼缸。');\n  if (error) throwDatabaseError(error, '迁移没有完成，源鱼缸和目标鱼缸均保持原状态。');\n\n  const relocation = data?.[0] as DbRow | undefined;\n  if (!relocation) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '迁移已经提交，但暂时无法确认结果。');\n\n  const [sourceResult, destinationResult] = await Promise.all([\n    client.from('aquariums').select(aquariumSelect).eq('id', sourceAquariumId).is('deleted_at', null).maybeSingle(),\n    client.from('aquariums').select(aquariumSelect).eq('id', parsed.data.destinationAquariumId).is('deleted_at', null).maybeSingle(),\n  ]);\n  if (sourceResult.error || destinationResult.error || !sourceResult.data || !destinationResult.data) {\n    throwDatabaseError(sourceResult.error || destinationResult.error, '迁移已完成，但最新鱼缸状态暂时无法读取。');\n  }\n\n  return sendData(request, response, {\n    sourceAquarium: mapAquarium(sourceResult.data),\n    destinationAquarium: mapAquarium(destinationResult.data),\n    relocation: {\n      destinationSpeciesRecordId: relocation.destination_species_record,\n      destinationBatchId: relocation.destination_batch,\n      replayed: Boolean(relocation.replayed),\n    },\n  });\n}));\n\naquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial', asyncRoute(async (request, response) => {\n`,
);

console.log('relocation repository/API wiring patch applied with unique anchors');
