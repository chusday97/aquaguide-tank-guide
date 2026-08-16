import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`[${label}] exact anchor is not unique`);
  return source.slice(0, first) + after + source.slice(first + before.length);
};

const fishDataPath = new URL('../src/data/fishData.ts', import.meta.url);
let fishData = await readFile(fishDataPath, 'utf8');

for (const [id, name, scientificName] of [
  ['sp_0057', '珍珠虎', 'Altolamprologus calvus'],
  ['sp_0058', '九间贝', 'Neolamprologus multifasciatus'],
  ['sp_0266', '黄金珍珠虎 (改良)', 'Altolamprologus calvus var. Gold'],
]) {
  const before = `    \"id\": \"${id}\",\n    \"name\": \"${name}\",\n    \"scientificName\": \"${scientificName}\",\n    \"category\": \"海水鱼\",`;
  const after = `    \"id\": \"${id}\",\n    \"name\": \"${name}\",\n    \"scientificName\": \"${scientificName}\",\n    \"category\": \"慈鲷/斗鱼\",`;
  fishData = replaceOnce(fishData, `category-${id}`, before, after);
}
await writeFile(fishDataPath, fishData, 'utf8');

const evidencePath = new URL('../src/modules/species/speciesWaterEvidence.ts', import.meta.url);
let evidence = await readFile(evidencePath, 'utf8');
evidence = replaceOnce(
  evidence,
  'tanganyika-freshwater-evidence',
  "  { scientificName: 'Pseudogastromyzon fangi', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Freshwater hillstream loach; explicit evidence prevents the ambiguous common-name token 蝴蝶鱼 from creating marine certainty.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },\n",
  "  { scientificName: 'Pseudogastromyzon fangi', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Freshwater hillstream loach; explicit evidence prevents the ambiguous common-name token 蝴蝶鱼 from creating marine certainty.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },\n  { scientificName: 'Altolamprologus calvus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Endemic Lake Tanganyika cichlid; explicit taxon evidence overrides stale legacy marine category data, including catalog varieties.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },\n  { scientificName: 'Neolamprologus multifasciatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Endemic Lake Tanganyika shell-dwelling cichlid; explicit taxon evidence overrides stale legacy marine category data.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },\n",
);
await writeFile(evidencePath, evidence, 'utf8');

console.log('legacy marine-category contradictions fixed for sp_0057, sp_0058 and sp_0266 with explicit Tanganyika freshwater evidence');
