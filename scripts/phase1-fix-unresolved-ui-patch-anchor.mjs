import { readFile, writeFile } from 'node:fs/promises';

const path = 'scripts/phase1-patch-unresolved-livestock-ui.mjs';
const source = await readFile(path, 'utf8');
const oldBlock = `  next = replaceOnce(
    next,
    \`    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setAddFishCategory('all');
\`,
    \`    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setUnresolvedLivestockQuantity(1);
    setAddFishCategory('all');
\`,
    'open species addition reset',
  );
`;
const newBlock = `  next = replaceOnce(
    next,
    \`  const openSpeciesAddition = (intent: SpeciesAdditionIntent, speciesId?: string) => {
    const selectedFish = speciesId ? fishData.find(item => item.id === speciesId) : undefined;
    setAdditionIntent(intent);
    addFishOperationIdRef.current = \\\`livestock-add:\\${crypto.randomUUID()}\\\`;
    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setAddFishCategory('all');
\`,
    \`  const openSpeciesAddition = (intent: SpeciesAdditionIntent, speciesId?: string) => {
    const selectedFish = speciesId ? fishData.find(item => item.id === speciesId) : undefined;
    setAdditionIntent(intent);
    addFishOperationIdRef.current = \\\`livestock-add:\\${crypto.randomUUID()}\\\`;
    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setUnresolvedLivestockQuantity(1);
    setAddFishCategory('all');
\`,
    'open species addition reset',
  );
`;
const count = source.split(oldBlock).length - 1;
if (count !== 1) throw new Error(`Expected one ambiguous reset patch block, found ${count}`);
await writeFile(path, source.replace(oldBlock, newBlock), 'utf8');
console.log('Anchored openSpeciesAddition reset patch to the full function prelude');
