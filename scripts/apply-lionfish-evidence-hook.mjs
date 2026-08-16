import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`[${label}] exact anchor is not unique`);
  return source.slice(0, first) + after + source.slice(first + before.length);
};

const evidencePath = new URL('../src/data/compatibilityEvidence.ts', import.meta.url);
let evidenceSource = await readFile(evidencePath, 'utf8');

evidenceSource = replaceOnce(
  evidenceSource,
  'additional-profile-import',
  "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\n",
  "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\nimport {\n  getAdditionalReviewedCompatibilityProfile,\n  getAdditionalReviewedCompatibilityProfileIds,\n} from './compatibilityEvidenceReviewedPredators';\n",
);

evidenceSource = replaceOnce(
  evidenceSource,
  'profile-getter',
  "export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];\n",
  "export const getReviewedCompatibilityProfile = (speciesId: string) => (\n  profiles[speciesId] || getAdditionalReviewedCompatibilityProfile(speciesId)\n);\n",
);

evidenceSource = replaceOnce(
  evidenceSource,
  'audit-profile-ids',
  "  reviewedSpeciesIds: Object.keys(profiles),\n",
  "  reviewedSpeciesIds: [...Object.keys(profiles), ...getAdditionalReviewedCompatibilityProfileIds()],\n",
);

await writeFile(evidencePath, evidenceSource, 'utf8');

const severePath = new URL('./test-reviewed-severe-risk-regression.ts', import.meta.url);
let severeSource = await readFile(severePath, 'utf8');

severeSource = replaceOnce(
  severeSource,
  'scientific-name-helper',
  "const byId = (id: string) => {\n  const species = fishData.find(item => item.id === id);\n  assert.ok(species, `missing required catalog fixture ${id}`);\n  return species;\n};\n",
  "const byId = (id: string) => {\n  const species = fishData.find(item => item.id === id);\n  assert.ok(species, `missing required catalog fixture ${id}`);\n  return species;\n};\n\nconst byScientificName = (scientificName: string) => {\n  const species = fishData.find(item => item.scientificName === scientificName);\n  assert.ok(species, `missing required catalog fixture ${scientificName}`);\n  return species;\n};\n",
);

severeSource = replaceOnce(
  severeSource,
  'tank-water-type-param',
  "const makeTank = (id: string, livestock: Array<{ species: Fish; quantity: number }>): Aquarium => ({\n",
  "const makeTank = (\n  id: string,\n  livestock: Array<{ species: Fish; quantity: number }>,\n  waterType: Aquarium['waterType'] = 'Freshwater',\n): Aquarium => ({\n",
);

severeSource = replaceOnce(
  severeSource,
  'tank-water-type-value',
  "  waterType: 'Freshwater',\n",
  "  waterType,\n",
);

severeSource = replaceOnce(
  severeSource,
  'case-water-type-field',
  "  diagnosisIssue: 'aggression' | 'death';\n};\n",
  "  diagnosisIssue: 'aggression' | 'death';\n  tankWaterType?: Aquarium['waterType'];\n};\n",
);

severeSource = replaceOnce(
  severeSource,
  'lionfish-fixtures',
  "const oscar = byId('sp_0451');\nconst neon = byId('sp_0431');\n",
  "const oscar = byId('sp_0451');\nconst lionfish = byId('sp_0453');\nconst ocellarisClownfish = byScientificName('Amphiprion ocellaris');\nassert.equal(ocellarisClownfish.size, 'Small');\nconst neon = byId('sp_0431');\n",
);

severeSource = replaceOnce(
  severeSource,
  'lionfish-severe-case',
  "  {\n    id: 'reviewed-territory-behavior-conflict',\n",
  "  {\n    id: 'reviewed-lionfish-small-marine-predation',\n    left: lionfish,\n    leftQuantity: 1,\n    right: ocellarisClownfish,\n    rightQuantity: 1,\n    expectedRelation: 'predation',\n    expectedDirection: 'one_way',\n    expectedSourceSpeciesId: lionfish.id,\n    diagnosisIssue: 'death',\n    tankWaterType: 'Saltwater',\n  },\n  {\n    id: 'reviewed-territory-behavior-conflict',\n",
);

severeSource = replaceOnce(
  severeSource,
  'scenario-tank-water-type',
  "  const tank = makeTank(scenario.id, [\n    { species: scenario.left, quantity: scenario.leftQuantity },\n    { species: scenario.right, quantity: scenario.rightQuantity },\n  ]);\n",
  "  const tank = makeTank(\n    scenario.id,\n    [\n      { species: scenario.left, quantity: scenario.leftQuantity },\n      { species: scenario.right, quantity: scenario.rightQuantity },\n    ],\n    scenario.tankWaterType || 'Freshwater',\n  );\n",
);

await writeFile(severePath, severeSource, 'utf8');
console.log('lionfish canonical evidence hooked into profile getter and five-fixture severe-risk suite');
