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
    \`    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setAddFishCategory('all');
\`,
    \`    setAddFishSuccess(null);
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
console.log('Disambiguated openSpeciesAddition reset anchor');
