import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`[${label}] exact anchor is not unique`);
  return source.slice(0, first) + after + source.slice(first + before.length);
};

const servicePath = new URL('../src/modules/species/species.service.ts', import.meta.url);
let service = await readFile(servicePath, 'utf8');
service = replaceOnce(
  service,
  'ambiguous-marine-token',
  '/小丑|倒吊|蓝魔鬼|雀鲷|蝶鱼|炮弹|狮子鱼|红利|泗水玫瑰|五彩青蛙|虾虎|Pseudochromis|Amphiprion|Zebrasoma|Paracanthurus|Chaetodon|Chrysiptera|Pterois|Lutjanus|Pterapogon|Xanthichthys|Centropyge|Pomacanthus|Synchiropus|Gobiodon/i.test(text)',
  '/小丑|倒吊|蓝魔鬼|雀鲷|炮弹|狮子鱼|红利|泗水玫瑰|五彩青蛙|虾虎|Pseudochromis|Amphiprion|Zebrasoma|Paracanthurus|Chaetodon|Chrysiptera|Pterois|Lutjanus|Pterapogon|Xanthichthys|Centropyge|Pomacanthus|Synchiropus|Gobiodon/i.test(text)',
);
await writeFile(servicePath, service, 'utf8');

const evidencePath = new URL('../src/modules/species/speciesWaterEvidence.ts', import.meta.url);
let evidence = await readFile(evidencePath, 'utf8');
evidence = replaceOnce(
  evidence,
  'hillstream-freshwater-evidence',
  "  { scientificName: 'Opsariichthys bidens', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },\n",
  "  { scientificName: 'Opsariichthys bidens', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },\n  { scientificName: 'Pseudogastromyzon fangi', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Freshwater hillstream loach; explicit evidence prevents the ambiguous common-name token 蝴蝶鱼 from creating marine certainty.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },\n",
);
await writeFile(evidencePath, evidence, 'utf8');

console.log('water-type ambiguity fix applied: removed bare 蝶鱼 marine trigger and added audited Pseudogastromyzon fangi freshwater evidence');
