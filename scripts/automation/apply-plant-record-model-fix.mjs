import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content);

const replaceOnce = (source, search, replacement, label) => {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`${label}: marker not found`);
  if (source.indexOf(search, first + search.length) >= 0) throw new Error(`${label}: marker not unique`);
  return source.slice(0, first) + replacement + source.slice(first + search.length);
};

const replaceBetween = (source, startMarker, endMarker, replacement, label) => {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker not found`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`${label}: end marker not found`);
  return source.slice(0, start) + replacement + source.slice(end);
};

{
  const path = 'src/pages/Aquarium.tsx';
  let source = read(path);

  source = replaceOnce(
    source,
    "} from '../services/aquarium/species-batches.service';\n",
    "} from '../services/aquarium/species-batches.service';\nimport {\n  applyPlantSettingsToAquarium,\n  getAquariumAnimalRecords,\n  normalizeAquariumPlantRecords,\n  removePlantMirrorForSpecies,\n} from '../services/aquarium/plant-record-sync.service';\nimport { formatSpeciesQuantity } from '../lib/speciesQuantityUnit';\n",
    'Aquarium plant sync imports',
  );

  source = replaceBetween(
    source,
    'const normalizeAquariumPlants = (aquariums: Partial<Aquarium>[]) => aquariums.map((rawAquarium, index) => {',
    'const parseLiters = (value: string | undefined, fallback = 0) => {',
    `const normalizeAquariumPlants = (aquariums: Partial<Aquarium>[]) => aquariums.map((rawAquarium, index) => {\n  const normalized = normalizeAquariumRecord(rawAquarium, index);\n  const inferredCandidates = [\n    normalized.lastWaterChangeDate,\n    ...(normalized.waterChangeHistory || []),\n    ...normalized.fishes.map(item => item.entryDate),\n  ].filter(Boolean).map(value => new Date(value as string)).filter(value => !Number.isNaN(value.getTime()));\n  const inferredStartedAt = inferredCandidates.length\n    ? new Date(Math.min(...inferredCandidates.map(value => value.getTime()))).toISOString().slice(0, 10)\n    : undefined;\n  const aquarium: Aquarium = normalized.startedAt || !inferredStartedAt\n    ? normalized\n    : { ...normalized, startedAt: inferredStartedAt, startedAtSource: 'inferred', startedAtConfirmedAt: undefined };\n  return normalizeAquariumPlantRecords(aquarium, fishData);\n});\n\n`,
    'normalizeAquariumPlants',
  );

  source = replaceOnce(
    source,
    `    const curFishes = aquarium.fishes.map(aqf => fishData.find(f => f.id === aqf.fishId)).filter(f => f !== undefined) as Fish[];\n    const stockedItems = aquarium.fishes\n      .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))\n      .filter(item => item.fish) as { aqFish: AquariumFish; fish: Fish }[];\n    const animalItems = stockedItems.filter(({ fish }) => {\n      const lifeType = getLifeType(fish);\n      return lifeType !== 'plant' && lifeType !== 'hardscape';\n    });\n`,
    `    const stockedItems = aquarium.fishes\n      .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))\n      .filter(item => item.fish) as { aqFish: AquariumFish; fish: Fish }[];\n    const animalItems = stockedItems.filter(({ fish }) => {\n      const lifeType = getLifeType(fish);\n      return lifeType !== 'plant' && lifeType !== 'hardscape';\n    });\n    const curFishes = animalItems.map(({ fish }) => fish);\n`,
    'animal-only risk species',
  );

  source = replaceBetween(
    source,
    '  const saveLivestockBatches = async (recordId: string, nextRecord: AquariumFish | null) => {',
    '  const removeLivestockQuantity = async (input: { aquariumFishId: string; batchId: string; quantity: number; operationId: string }) => {',
    `  const saveLivestockBatches = async (recordId: string, nextRecord: AquariumFish | null) => {\n    const active = aquariums.find(aquarium => aquarium.id === activeId);\n    if (!active) throw new Error(isEn ? 'No active aquarium was found.' : '没有找到当前鱼缸。');\n    const previousRecord = active.fishes.find(record => record.id === recordId);\n    const previousSpecies = previousRecord ? fishData.find(species => species.id === previousRecord.fishId) : undefined;\n    const baseNextAquarium: Aquarium = {\n      ...active,\n      fishes: nextRecord\n        ? active.fishes.map(record => record.id === recordId ? nextRecord : record)\n        : active.fishes.filter(record => record.id !== recordId),\n    };\n    const mirrorSyncedAquarium = !nextRecord && previousSpecies && isAquaticPlantSpecies(previousSpecies)\n      ? removePlantMirrorForSpecies(baseNextAquarium, previousSpecies.id, fishData)\n      : baseNextAquarium;\n    const nextAquarium = normalizeAquariumPlantRecords(mirrorSyncedAquarium, fishData);\n    const repository = await getCurrentAquaGuideRepository();\n    const savedAquariumRaw = await repository.saveAquarium(nextAquarium);\n    const savedAquarium = normalizeAquariumPlantRecords(savedAquariumRaw, fishData);\n    setAquariums(current => current.map(aquarium => aquarium.id === activeId ? savedAquarium : aquarium));\n    if (nextRecord) {\n      const latestStateUpdate = nextRecord.batches?.map(batch => batch.stateUpdatedAt).sort().at(-1) || new Date().toISOString();\n      const nextSpecies = previousSpecies || fishData.find(species => species.id === nextRecord.fishId);\n      const isPlantRecord = Boolean(nextSpecies && isAquaticPlantSpecies(nextSpecies));\n      await persistCareTimelineEvent({\n        aquariumId: active.id,\n        eventType: 'life_stage_updated',\n        title: isPlantRecord ? (isEn ? 'Updated plant record' : '修改水草记录') : (isEn ? 'Updated livestock state' : '调整缸内物种体态'),\n        label: isPlantRecord ? (isEn ? 'Plant quantity and added date saved' : '已保存植株数量与加入日期') : (isEn ? 'Quantity and state changes saved' : '已保存数量与体态变化'),\n        payload: { speciesRecordId: recordId, recordKind: isPlantRecord ? 'plant' : 'animal' },\n        occurredAt: new Date().toISOString(),\n        sourceType: 'livestock_state',\n        sourceId: \`${'${recordId}:${latestStateUpdate}'}\`,\n        isInferred: false,\n      });\n    }\n    showToast(nextRecord\n      ? (previousSpecies && isAquaticPlantSpecies(previousSpecies)\n        ? (isEn ? 'Plant record updated' : '水草记录已更新')\n        : (isEn ? 'Livestock group states updated' : '体态与数量已更新'))\n      : (isEn ? 'Species removed from this tank' : '该物种已移出鱼缸'));\n  };\n\n`,
    'saveLivestockBatches',
  );

  source = replaceBetween(
    source,
    '  const removeLivestockQuantity = async (input: { aquariumFishId: string; batchId: string; quantity: number; operationId: string }) => {',
    '  const [isCreatingAquarium, setIsCreatingAquarium] = useState(false);',
    `  const removeLivestockQuantity = async (input: { aquariumFishId: string; batchId: string; quantity: number; operationId: string }) => {\n    const active = aquariums.find(aquarium => aquarium.id === activeId);\n    if (!active) throw new Error('没有找到当前鱼缸。');\n    const targetRecord = active.fishes.find(record => record.id === input.aquariumFishId);\n    const targetSpecies = targetRecord ? fishData.find(species => species.id === targetRecord.fishId) : undefined;\n    const repository = await getCurrentAquaGuideRepository();\n    let savedAquarium = await repository.removeLivestock({\n      aquariumId: active.id,\n      aquariumFishId: input.aquariumFishId,\n      batchId: input.batchId,\n      quantity: input.quantity,\n      operationId: input.operationId,\n    });\n    const plantRemovedCompletely = Boolean(\n      targetSpecies\n      && isAquaticPlantSpecies(targetSpecies)\n      && !savedAquarium.fishes.some(record => record.fishId === targetSpecies.id),\n    );\n    if (plantRemovedCompletely && targetSpecies) {\n      savedAquarium = await repository.saveAquarium(removePlantMirrorForSpecies(savedAquarium, targetSpecies.id, fishData));\n    }\n    savedAquarium = normalizeAquariumPlantRecords(savedAquarium, fishData);\n    setAquariums(current => current.map(aquarium => aquarium.id === active.id ? savedAquarium : aquarium));\n    const quantityLabel = targetSpecies\n      ? formatSpeciesQuantity(targetSpecies, input.quantity, Boolean(isEn))\n      : (isEn ? \`${'${input.quantity} animals'}\` : \`${'${input.quantity} 只/条'}\`);\n    await persistCareTimelineEvent({\n      aquariumId: active.id,\n      eventType: 'species_removed',\n      title: targetSpecies && isAquaticPlantSpecies(targetSpecies) ? (isEn ? 'Removed plant' : '移出水草') : (isEn ? 'Removed livestock' : '移出缸内生物'),\n      label: quantityLabel,\n      payload: { aquariumFishId: input.aquariumFishId, quantity: input.quantity },\n      occurredAt: new Date().toISOString(),\n      sourceType: 'livestock_removal',\n      sourceId: input.operationId,\n      isInferred: false,\n    });\n    showToast(isEn ? \`Removed ${'${quantityLabel}'} from aquarium log\` : \`已从鱼缸记录中移出 ${'${quantityLabel}'}\`);\n  };\n`,
    'removeLivestockQuantity',
  );

  source = replaceOnce(
    source,
    `      const repository = await getCurrentAquaGuideRepository();\n      const savedAquarium = await repository.saveAquarium({ ...activeAquarium, ...settingsForm });\n      setAquariums(current => current.map(aquarium => aquarium.id === savedAquarium.id ? savedAquarium : aquarium));\n`,
    `      const repository = await getCurrentAquaGuideRepository();\n      const nextAquarium = applyPlantSettingsToAquarium(\n        { ...activeAquarium, ...settingsForm },\n        settingsForm.plants ?? activeAquarium.plants,\n        fishData,\n      );\n      const savedAquariumRaw = await repository.saveAquarium(nextAquarium);\n      const savedAquarium = normalizeAquariumPlantRecords(savedAquariumRaw, fishData);\n      setAquariums(current => current.map(aquarium => aquarium.id === savedAquarium.id ? savedAquarium : aquarium));\n`,
    'handleSaveAquariumSettings plant sync',
  );

  source = replaceOnce(
    source,
    `  const currentFishesDetails = activeAquarium.fishes.map(af => fishData.find(f => f.id === af.fishId)).filter(Boolean) as Fish[];\n`,
    `  const activeAnimalRecords = getAquariumAnimalRecords(activeAquarium, fishData);\n  const currentFishesDetails = activeAnimalRecords.map(af => fishData.find(f => f.id === af.fishId)).filter(Boolean) as Fish[];\n`,
    'active animal records',
  );

  source = replaceOnce(
    source,
    `  const heaterStockedItems = activeAquarium.fishes\n    .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))\n    .filter((item): item is { aqFish: AquariumFish; fish: Fish } => Boolean(item.fish) && needsHeaterForSpecies(item.fish));\n`,
    `  const heaterStockedItems = activeAnimalRecords\n    .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))\n    .filter((item): item is { aqFish: AquariumFish; fish: Fish } => Boolean(item.fish) && needsHeaterForSpecies(item.fish));\n`,
    'heater animal records',
  );

  source = replaceOnce(
    source,
    `  const totalStockedQuantity = activeAquarium.fishes.reduce((sum, fish) => sum + Math.max(1, fish.quantity || 1), 0);\n  const stockedSpeciesCount = new Set(activeAquarium.fishes.map(fish => fish.fishId)).size;\n  const hasStockedAnimals = totalStockedQuantity > 0;\n`,
    `  const totalStockedQuantity = activeAnimalRecords.reduce((sum, record) => sum + Math.max(1, record.quantity || 1), 0);\n  const stockedSpeciesCount = new Set(activeAnimalRecords.map(record => record.fishId)).size;\n  const hasStockedAnimals = totalStockedQuantity > 0;\n`,
    'animal-only stocked counts',
  );

  const cameraReplacements = [
    ["activeAquarium && activeAquarium.fishes.length > 0", "activeAquarium && activeAnimalRecords.length > 0"],
    ["Array.from(new Set(activeAquarium.fishes.map(f => f.fishId)))", "Array.from(new Set(activeAnimalRecords.map(f => f.fishId)))"],
    ["activeAquarium.fishes.filter(f => f.fishId === uId)", "activeAnimalRecords.filter(f => f.fishId === uId)"],
    ["Array.from(new Set(activeAquarium.fishes.map(item => item.fishId)))", "Array.from(new Set(activeAnimalRecords.map(item => item.fishId)))"],
    ["activeAquarium.fishes.filter(item => item.fishId === fishId)", "activeAnimalRecords.filter(item => item.fishId === fishId)"],
    ["{activeAquarium.fishes.length === 0 &&", "{activeAnimalRecords.length === 0 &&"],
    ["`${activeAquarium.fishes.length} 条记录 · ${totalStockedQuantity} 只/条活体`", "`${activeAnimalRecords.length} 条记录 · ${totalStockedQuantity} 只/条活体`"],
  ];
  for (const [search, replacement] of cameraReplacements) {
    if (!source.includes(search)) throw new Error(`camera animal filter marker not found: ${search}`);
    source = source.split(search).join(replacement);
  }

  write(path, source);
}

{
  const path = 'src/components/ThreeAquarium.tsx';
  let source = read(path);
  source = replaceOnce(
    source,
    "import { getAquariumHardscapeSpecies, getAquariumPlantSpecies } from '../lib/speciesClassification';\n",
    "import { getAquariumHardscapeSpecies, getAquariumPlantSpecies, isAquaticPlantSpecies, isHardscapeSpecies } from '../lib/speciesClassification';\n",
    'ThreeAquarium classification import',
  );
  source = replaceOnce(
    source,
    `      const fishInfo = fishData.find((fish) => fish.id === aqFish.fishId);\n      if (!fishInfo) return;\n\n      for (let index = 0; index < (aqFish.quantity || 1); index += 1) {\n`,
    `      const fishInfo = fishData.find((fish) => fish.id === aqFish.fishId);\n      if (!fishInfo || isAquaticPlantSpecies(fishInfo) || isHardscapeSpecies(fishInfo)) return;\n\n      for (let index = 0; index < (aqFish.quantity || 1); index += 1) {\n`,
    'ThreeAquarium swimmer filter',
  );
  write(path, source);
}

console.log('Plant record model guarded patch applied.');
