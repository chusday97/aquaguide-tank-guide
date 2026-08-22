import fs from 'node:fs';

const aquarium = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');
const batchCard = fs.readFileSync('src/components/aquarium/LivestockBatchCard.tsx', 'utf8');
const batchService = fs.readFileSync('src/services/aquarium/species-batches.service.ts', 'utf8');
const i18n = fs.readFileSync('src/i18n/index.ts', 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(`Life-stage UI contract failed: ${message}`);
};

assert(
  batchCard.includes("const lifeStageOptions: LifeStage[] = ['unknown', 'fry', 'juvenile', 'subadult', 'adult'];"),
  'livestock batch editor must expose fry and subadult alongside existing stages',
);
assert(batchService.includes("fry: count(batch => batch.lifeStage === 'fry')"), 'batch summary must count fry separately');
assert(batchService.includes("subadult: count(batch => batch.lifeStage === 'subadult')"), 'batch summary must count subadult separately');
assert(batchService.includes('summary.fry') && batchService.includes('summary.subadult'), 'batch context/observation must consume fry and subadult summaries');

assert(i18n.includes("summaryFry: '鱼苗 {{count}}'"), 'Chinese livestock summary needs a fry label');
assert(i18n.includes("summarySubadult: '亚成 {{count}}'"), 'Chinese livestock summary needs a subadult label');
assert(i18n.includes("lifeStage: { unknown: '未确认', fry: '鱼苗', juvenile: '幼年', subadult: '亚成', adult: '成年' }"), 'Chinese stage selector must expose five stages');
assert(i18n.includes("summaryFry: 'Fry {{count}}'"), 'English livestock summary needs a fry label');
assert(i18n.includes("summarySubadult: 'Subadult {{count}}'"), 'English livestock summary needs a subadult label');
assert(i18n.includes("lifeStage: { unknown: 'Unknown', fry: 'Fry', juvenile: 'Juvenile', subadult: 'Subadult', adult: 'Adult' }"), 'English stage selector must expose five stages');

assert(aquarium.includes("type SelectedAddFishItem = { fishId: string; quantity: number; entryDate: string; lifeStage: LifeStage };"), 'add-species draft must carry lifeStage');
assert(aquarium.includes("Partial<{ quantity: number; entryDate: string; lifeStage: LifeStage }>"), 'add-species draft updater must allow lifeStage changes');
assert(aquarium.includes("lifeStage: 'unknown'"), 'newly selected species must begin with explicit unknown stage, not an inferred age');
assert(aquarium.includes('data-add-fish-life-stage={item.fishId}'), 'add-species review must expose a stable life-stage input');
assert(aquarium.includes("(['unknown', 'fry', 'juvenile', 'subadult', 'adult'] as LifeStage[]).map"), 'add-species stage input must offer the same five-stage contract');
assert(aquarium.includes("lifeStage: item.lifeStage"), 'normalized planned addition must preserve selected life stage into review/write');
assert(aquarium.includes("lifeStage: item.lifeStage ?? 'unknown'"), 'record-existing retry items must preserve normalized life stage');
assert(aquarium.includes("setSelectedAddFishItems(templateFish.map(({ fish, quantity }) => ({ fishId: fish.id, quantity, entryDate, lifeStage: 'unknown' })));"), 'build-template additions must start with explicit unknown stage');

console.log('Life-stage UI contract: PASS');
