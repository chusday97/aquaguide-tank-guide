import fs from 'node:fs';

const path = 'src/components/aquarium/LivestockBatchCard.tsx';
const source = fs.readFileSync(path, 'utf8');
const before = `  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(record);\n  const hasUnsavedChanges = hasPendingSelection || hasDraftChanges;`;
const after = `  // Dirty state follows user-visible selection changes, not internal metadata such as stateUpdatedAt.\n  const hasDraftChanges = hasPendingSelection;\n  const hasUnsavedChanges = hasPendingSelection;`;

if (source.includes(after)) {
  console.log('Livestock semantic dirty-state fix already applied.');
  process.exit(0);
}
if (!source.includes(before)) throw new Error('Livestock semantic dirty-state anchor not found.');
fs.writeFileSync(path, source.replace(before, after));
console.log('PASS: livestock dirty/save state now follows semantic user changes.');
