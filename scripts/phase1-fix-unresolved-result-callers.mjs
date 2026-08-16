import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, search, replacement, label) => {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(search, replacement);
};

const replaceRegexOnce = (source, regex, replacement, label) => {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const matches = source.match(new RegExp(regex.source, flags)) || [];
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

await patch('src/services/aquarium/livestock-recording.service.ts', source => {
  let next = replaceOnce(
    source,
    "export type ExistingLivestockRecordItem = SpeciesAdditionItem | UnresolvedExistingLivestockItem;\nexport type FailedLivestockRecord = ExistingLivestockRecordItem & { message: string };\n",
    `export type ExistingLivestockRecordItem = SpeciesAdditionItem | UnresolvedExistingLivestockItem;
export type FailedLivestockRecord = ExistingLivestockRecordItem & { message: string };

export const isUnresolvedExistingLivestockItem = (
  item: ExistingLivestockRecordItem,
): item is UnresolvedExistingLivestockItem => (
  'identityStatus' in item && item.identityStatus === 'unresolved'
);

export const isVerifiedExistingLivestockItem = (
  item: ExistingLivestockRecordItem,
): item is SpeciesAdditionItem => !isUnresolvedExistingLivestockItem(item);

export const getExistingLivestockItemKey = (item: ExistingLivestockRecordItem) => (
  isUnresolvedExistingLivestockItem(item)
    ? \`unresolved-name:\${encodeURIComponent(item.rawName.trim())}\`
    : item.fishId
);

export const getExistingLivestockItemLabel = (
  item: ExistingLivestockRecordItem,
  speciesCatalog: Fish[],
) => isUnresolvedExistingLivestockItem(item)
  ? item.rawName
  : speciesCatalog.find(fish => fish.id === item.fishId)?.name || item.fishId;
`,
    'livestock result helpers',
  );

  next = replaceRegexOnce(
    next,
    /  for \(const item of items\) \{\n    try \{\n      const unresolved = 'identityStatus' in item && item\.identityStatus === 'unresolved';\n      savedAquarium = await input\.repository\.addLivestock\(unresolved \? \{[\s\S]*?\n      \}\);\n      savedItems\.push\(item\);/,
    `  for (const item of items) {
    try {
      if (isUnresolvedExistingLivestockItem(item)) {
        savedAquarium = await input.repository.addLivestock({
          aquariumId: savedAquarium.id,
          identityStatus: 'unresolved',
          rawName: item.rawName,
          quantity: item.quantity,
          entryDate: item.entryDate || new Date().toISOString().slice(0, 10),
          operationId: \`${input.operationId}:unresolved:\${item.rawName}\`,
        });
      } else {
        savedAquarium = await input.repository.addLivestock({
          aquariumId: savedAquarium.id,
          identityStatus: 'verified',
          speciesCatalogKey: item.fishId,
          quantity: item.quantity,
          entryDate: item.entryDate || new Date().toISOString().slice(0, 10),
          operationId: \`${input.operationId}:\${item.fishId}\`,
        });
      }
      savedItems.push(item);`,
    'repository write narrowing',
  );

  next = replaceOnce(
    next,
    "  const savedUnresolved = savedItems.filter((item): item is UnresolvedExistingLivestockItem => 'identityStatus' in item && item.identityStatus === 'unresolved');\n",
    "  const savedUnresolved = savedItems.filter(isUnresolvedExistingLivestockItem);\n",
    'saved unresolved helper use',
  );
  return next;
});

await patch('src/pages/Aquarium.tsx', source => {
  let next = replaceOnce(
    source,
    "import { recordExistingLivestock, type RecordExistingResult } from '../services/aquarium/livestock-recording.service';\n",
    `import {
  getExistingLivestockItemKey,
  getExistingLivestockItemLabel,
  isVerifiedExistingLivestockItem,
  recordExistingLivestock,
  type RecordExistingResult,
} from '../services/aquarium/livestock-recording.service';
`,
    'Aquarium livestock result helpers import',
  );
  next = replaceOnce(
    next,
    `      const successItems = result.savedItems.map(item => {
        const fish = fishData.find(candidate => candidate.id === item.fishId);
        return {
          fishId: item.fishId,
          name: fish?.name || '生物',
          image: fish ? getSpeciesDisplayImage(fish) : '',
          quantity: item.quantity,
          entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
        };
      });
`,
    `      const successItems = result.savedItems.map(item => {
        const fish = isVerifiedExistingLivestockItem(item)
          ? fishData.find(candidate => candidate.id === item.fishId)
          : undefined;
        return {
          fishId: getExistingLivestockItemKey(item),
          name: getExistingLivestockItemLabel(item, fishData) || '生物',
          image: fish ? getSpeciesDisplayImage(fish) : '',
          quantity: item.quantity,
          entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
        };
      });
`,
    'Aquarium success item mapping',
  );
  next = replaceOnce(
    next,
    `      setSelectedAddFishItems(result.failedItems.map(item => ({
        fishId: item.fishId,
        quantity: item.quantity,
        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
      })));
`,
    `      setSelectedAddFishItems(result.failedItems
        .filter(isVerifiedExistingLivestockItem)
        .map(item => ({
          fishId: item.fishId,
          quantity: item.quantity,
          entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
        })));
`,
    'Aquarium retry verified-only selection',
  );
  next = replaceOnce(
    next,
    "        .map(item => fishData.find(fish => fish.id === item.fishId)?.name || item.fishId)\n",
    "        .map(item => getExistingLivestockItemLabel(item, fishData))\n",
    'Aquarium compatibility failure labels',
  );
  next = replaceOnce(
    next,
    `                      {addFishSuccess.result.failedItems.map(item => (
                        <div key={item.fishId}>{fishData.find(fish => fish.id === item.fishId)?.name || item.fishId}：{item.message}</div>
                      ))}
`,
    `                      {addFishSuccess.result.failedItems.map(item => (
                        <div key={getExistingLivestockItemKey(item)}>{getExistingLivestockItemLabel(item, fishData)}：{item.message}</div>
                      ))}
`,
    'Aquarium failed item display',
  );
  return next;
});

await patch('src/pages/Encyclopedia.tsx', source => {
  let next = replaceOnce(
    source,
    "import { recordExistingLivestock } from '../services/aquarium/livestock-recording.service';\n",
    `import {
  getExistingLivestockItemLabel,
  isVerifiedExistingLivestockItem,
  recordExistingLivestock,
} from '../services/aquarium/livestock-recording.service';
`,
    'Encyclopedia livestock result helpers import',
  );
  next = replaceOnce(
    next,
    "      recorded.savedItems.forEach(item => next.add(item.fishId));\n",
    "      recorded.savedItems.filter(isVerifiedExistingLivestockItem).forEach(item => next.add(item.fishId));\n",
    'Encyclopedia verified ownership update',
  );
  next = replaceOnce(
    next,
    "        .map(item => fishData.find(fish => fish.id === item.fishId)?.name || item.fishId)\n",
    "        .map(item => getExistingLivestockItemLabel(item, fishData))\n",
    'Encyclopedia failure labels',
  );
  return next;
});

await patch('scripts/test-livestock-recording.ts', source => {
  let next = replaceOnce(
    source,
    "assert.deepEqual(partialResult.savedItems.map(item => item.fishId), [freshwater.id]);\n",
    "assert.deepEqual(partialResult.savedItems.flatMap(item => 'fishId' in item ? [item.fishId] : []), [freshwater.id]);\n",
    'livestock test saved verified IDs',
  );
  next = replaceOnce(
    next,
    "assert.deepEqual(partialResult.failedItems.map(item => item.fishId), [freshwaterCompanion.id]);\n",
    "assert.deepEqual(partialResult.failedItems.flatMap(item => 'fishId' in item ? [item.fishId] : []), [freshwaterCompanion.id]);\n",
    'livestock test failed verified IDs',
  );
  return next;
});

await patch('scripts/test-core-flow-state-eval-v1.ts', source => {
  let next = replaceOnce(
    source,
    "assert.deepEqual(partial.savedItems.map(item => item.fishId), [freshwater.id]);\n",
    "assert.deepEqual(partial.savedItems.flatMap(item => 'fishId' in item ? [item.fishId] : []), [freshwater.id]);\n",
    'core flow saved verified IDs',
  );
  next = replaceOnce(
    next,
    "assert.deepEqual(partial.failedItems.map(item => item.fishId), [companion.id]);\n",
    "assert.deepEqual(partial.failedItems.flatMap(item => 'fishId' in item ? [item.fishId] : []), [companion.id]);\n",
    'core flow failed verified IDs',
  );
  return next;
});

console.log('unresolved result union callsites now narrow identity explicitly');
