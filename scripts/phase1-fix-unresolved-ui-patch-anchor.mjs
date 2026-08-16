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
const newBlock = `  {
    const functionStart = next.indexOf("  const openSpeciesAddition = (intent: SpeciesAdditionIntent, speciesId?: string) => {");
    const functionEnd = next.indexOf("\n  const buildAddFishCompatibilityReview", functionStart);
    if (functionStart < 0 || functionEnd < 0) throw new Error('openSpeciesAddition function scope not found');
    const scope = next.slice(functionStart, functionEnd);
    const reset = "    setFishSearchTerm('');\\n    setAddFishCategory('all');";
    const resetCount = scope.split(reset).length - 1;
    if (resetCount !== 1) throw new Error(\`openSpeciesAddition reset: expected one scoped reset, found \${resetCount}\`);
    const patchedScope = scope.replace(
      reset,
      "    setFishSearchTerm('');\\n    setUnresolvedLivestockQuantity(1);\\n    setAddFishCategory('all');",
    );
    next = next.slice(0, functionStart) + patchedScope + next.slice(functionEnd);
  }
`;
const count = source.split(oldBlock).length - 1;
if (count !== 1) throw new Error(`Expected one ambiguous reset patch block, found ${count}`);
await writeFile(path, source.replace(oldBlock, newBlock), 'utf8');
console.log('Scoped openSpeciesAddition reset patch to the function body without evaluating source templates');
