import fs from 'node:fs';

const roster = fs.readFileSync('src/components/aquarium/LivestockRosterDialog.tsx', 'utf8');
const card = fs.readFileSync('src/components/aquarium/LivestockBatchCard.tsx', 'utf8');
const plantEditor = fs.readFileSync('src/components/aquarium/PlantRecordEditor.tsx', 'utf8');
const detail = fs.readFileSync('src/components/SpeciesDetailDialogBase.tsx', 'utf8');
const aquarium = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');
const unit = fs.readFileSync('src/lib/speciesQuantityUnit.ts', 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(`Plant livestock contract failed: ${message}`);
};

assert(unit.includes("lifeType === 'plant'") && unit.includes("'株'"), 'plant quantity must use 株');
assert(card.includes("getLifeType(fish) === 'plant'") && card.includes('修改水草记录'), 'plant roster card must expose a plant-specific edit action');
assert(roster.includes('PlantRecordEditor') && roster.includes('quantitySummary'), 'roster must use the plant editor and unit-aware summary');
assert(plantEditor.includes('data-plant-record-editor') && plantEditor.includes('max={999}') && plantEditor.includes("reproductiveState: 'not_applicable'"), 'plant editor must support direct quantity/date edits without fish reproductive semantics');
assert(detail.includes('data-species-detail-edit-tank-record') && detail.includes('onEditInTank'), 'owned species detail must expose a tank-record edit entry');
assert(aquarium.includes('editRecordRequestId={livestockEditRequestId}') && aquarium.includes('setIsTankArchiveExpanded(true)'), 'detail edit must reopen the exact roster editor');

console.log('Plant livestock edit contract: PASS');
