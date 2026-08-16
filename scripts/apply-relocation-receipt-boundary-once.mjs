import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (path, before, after) => {
  const content = readFileSync(path, 'utf8');
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one anchor, found ${count}`);
  writeFileSync(path, content.replace(before, after));
};

replaceOnce(
  'src/services/repository/aquaguide.repository.ts',
  `export type LivestockRelocationMutationResult = {\n  sourceAquarium: Aquarium;\n  destinationAquarium: Aquarium;\n  destinationFishId: string;\n  destinationBatchId: string;\n  replayed: boolean;\n};\n`,
  `export type LivestockRelocationMutationResult = {\n  committed: true;\n  replayed?: boolean;\n};\n`,
);

replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    const state = loadAppStateFromStorage();\n    const result = relocateLivestockInAquariums(state.aquariums, input);\n    const persisted = persistAquariums(result.aquariums, state.currentAquariumId || input.sourceAquariumId);\n    const sourceAquarium = persisted.aquariums.find(item => item.id === input.sourceAquariumId);\n    const destinationAquarium = persisted.aquariums.find(item => item.id === input.destinationAquariumId);\n    if (!sourceAquarium || !destinationAquarium) throw new Error('迁移后鱼缸状态无法确认。');\n    return {\n      sourceAquarium,\n      destinationAquarium,\n      destinationFishId: result.destinationFishId,\n      destinationBatchId: result.destinationBatchId,\n      replayed: result.replayed,\n    };\n  }\n`,
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    const state = loadAppStateFromStorage();\n    const result = relocateLivestockInAquariums(state.aquariums, input);\n    persistAquariums(result.aquariums, state.currentAquariumId || input.sourceAquariumId);\n    return { committed: true as const, replayed: result.replayed };\n  }\n`,
);

replaceOnce(
  'src/services/repository/api-aquaguide.repository.ts',
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('迁移数量必须是正整数。');\n    const result = await apiRequest<{\n      sourceAquarium: ApiAquarium;\n      destinationAquarium: ApiAquarium;\n      relocation: { destinationSpeciesRecordId: string; destinationBatchId: string; replayed: boolean };\n    }>(\`/aquariums/\${input.sourceAquariumId}/species/\${input.sourceAquariumFishId}/batches/\${input.sourceBatchId}/relocate\`, {\n      method: 'POST',\n      body: { destinationAquariumId: input.destinationAquariumId, quantity: input.quantity },\n      idempotencyKey: input.operationId,\n    });\n    return {\n      sourceAquarium: this.rememberAquarium(result.sourceAquarium),\n      destinationAquarium: this.rememberAquarium(result.destinationAquarium),\n      destinationFishId: result.relocation.destinationSpeciesRecordId,\n      destinationBatchId: result.relocation.destinationBatchId,\n      replayed: result.relocation.replayed,\n    };\n  }\n`,
  `  async relocateLivestock(input: LivestockRelocationInput) {\n    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('迁移数量必须是正整数。');\n    return apiRequest<{ committed: true; replayed?: boolean }>(\`/aquariums/\${input.sourceAquariumId}/species/\${input.sourceAquariumFishId}/batches/\${input.sourceBatchId}/relocate\`, {\n      method: 'POST',\n      body: { destinationAquariumId: input.destinationAquariumId, quantity: input.quantity },\n      idempotencyKey: input.operationId,\n    });\n  }\n`,
);

replaceOnce(
  'apps/api/src/routes/aquariums.ts',
  `  const relocation = data?.[0] as DbRow | undefined;\n  if (!relocation) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '迁移已经提交，但暂时无法确认结果。');\n\n  const [sourceResult, destinationResult] = await Promise.all([\n    client.from('aquariums').select(aquariumSelect).eq('id', sourceAquariumId).is('deleted_at', null).maybeSingle(),\n    client.from('aquariums').select(aquariumSelect).eq('id', parsed.data.destinationAquariumId).is('deleted_at', null).maybeSingle(),\n  ]);\n  if (sourceResult.error || destinationResult.error || !sourceResult.data || !destinationResult.data) {\n    throwDatabaseError(sourceResult.error || destinationResult.error, '迁移已完成，但最新鱼缸状态暂时无法读取。');\n  }\n\n  return sendData(request, response, {\n    sourceAquarium: mapAquarium(sourceResult.data),\n    destinationAquarium: mapAquarium(destinationResult.data),\n    relocation: {\n      destinationSpeciesRecordId: relocation.destination_species_record,\n      destinationBatchId: relocation.destination_batch,\n      replayed: Boolean(relocation.replayed),\n    },\n  });\n`,
  `  const relocation = data?.[0] as DbRow | undefined;\n  return sendData(request, response, {\n    committed: true,\n    ...(relocation ? { replayed: Boolean(relocation.replayed) } : {}),\n  });\n`,
);

replaceOnce(
  'scripts/test-livestock-relocation-wiring.mjs',
  `assert.match(apiRoute, /sourceAquarium:/);\nassert.match(apiRoute, /destinationAquarium:/);\n`,
  `assert.match(apiRoute, /committed: true/);\nassert.doesNotMatch(apiRoute, /sourceAquarium:/);\nassert.doesNotMatch(apiRoute, /destinationAquarium:/);\n`,
);

replaceOnce(
  'scripts/test-livestock-relocation-wiring.mjs',
  `console.log('livestock relocation wiring contract passed: shared contract, repository implementations, atomic API route, canonical dual-tank response');\n`,
  `console.log('livestock relocation wiring contract passed: shared contract, repository implementations, atomic API route, mutation receipt boundary');\n`,
);

console.log('relocation receipt boundary patch applied with unique anchors');
