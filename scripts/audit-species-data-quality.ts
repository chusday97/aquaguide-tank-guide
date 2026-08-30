import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fishData } from '../src/data/fishData';

type QualityStatus = 'VERIFIED' | 'PARTIAL' | 'TEMPLATE_DERIVED' | 'CONFLICT' | 'AMBIGUOUS' | 'MISSING';

const binomialOf = (scientificName: string) => {
  const match = scientificName.trim().match(/^([A-Z][A-Za-z-]+)\s+([a-z][A-Za-z-]+)/);
  return match ? `${match[1]} ${match[2]}` : null;
};

const sourceDomainOf = (url?: string) => {
  if (!url) return 'missing';
  try { return new URL(url).hostname; } catch { return 'invalid'; }
};

const groupsBy = (key: 'name' | 'scientificName') => {
  const groups = new Map<string, string[]>();
  for (const species of fishData) {
    const value = species[key].trim();
    const ids = groups.get(value) || [];
    ids.push(species.id);
    groups.set(value, ids);
  }
  return [...groups].filter(([, ids]) => ids.length > 1);
};

const statusOf = (species: typeof fishData[number]): QualityStatus => {
  const scientificName = species.scientificName.trim();
  const profile = species.feedingProfile;
  if (!scientificName || /^(?:unknown|待定|未定)$/i.test(scientificName)) return 'MISSING';
  if (/\b(?:sp\.|spp\.|var\.)\s*$/i.test(scientificName)) return 'AMBIGUOUS';
  if (species.housingReason?.includes('斗鱼') && !/斗鱼|Betta/i.test(`${species.name} ${species.scientificName}`)) return 'CONFLICT';
  if (profile?.sourceUrl?.includes('google.com/search') || profile?.sourceName?.toLowerCase().includes('template')) return 'TEMPLATE_DERIVED';
  if (!species.waterType || profile?.needsReview || !profile?.sourceUrl) return 'PARTIAL';
  return 'VERIFIED';
};

const fieldStatusOf = (species: typeof fishData[number], field: 'identity' | 'water' | 'temperature' | 'ph' | 'evidence'): QualityStatus => {
  if (field === 'identity') {
    if (!species.scientificName.trim() || /^(?:unknown|待定|未定)$/i.test(species.scientificName.trim())) return 'MISSING';
    if (/\b(?:sp\.|spp\.|var\.)\s*$/i.test(species.scientificName)) return 'AMBIGUOUS';
    return 'VERIFIED';
  }
  if (field === 'water') return species.waterType ? 'VERIFIED' : 'MISSING';
  if (field === 'temperature') return species.waterTemperature?.trim() ? 'PARTIAL' : 'MISSING';
  if (field === 'ph') return species.phLevel?.trim() ? 'PARTIAL' : 'MISSING';
  const source = species.feedingProfile;
  if (!source?.sourceUrl) return 'MISSING';
  if (source.sourceUrl.includes('google.com/search') || source.sourceName?.toLowerCase().includes('template')) return 'TEMPLATE_DERIVED';
  return source.needsReview ? 'PARTIAL' : 'VERIFIED';
};

const statuses = Object.fromEntries((['VERIFIED', 'PARTIAL', 'TEMPLATE_DERIVED', 'CONFLICT', 'AMBIGUOUS', 'MISSING'] as QualityStatus[]).map(status => [
  status,
  fishData.filter(species => statusOf(species) === status).length,
]));

const sourceDomains = Object.fromEntries([...new Set(fishData.map(species => sourceDomainOf(species.feedingProfile?.sourceUrl)))].sort().map(domain => [
  domain,
  fishData.filter(species => sourceDomainOf(species.feedingProfile?.sourceUrl) === domain).length,
]));

assert.equal(fishData.length, 486, 'catalog audit expects all 486 catalog rows');
assert.equal(new Set(fishData.map(species => species.id)).size, fishData.length, 'catalog IDs must be unique');

const fieldAudit = fishData.map(species => ({
  speciesId: species.id,
  name: species.name,
  scientificName: species.scientificName,
  overallStatus: statusOf(species),
  fields: Object.fromEntries((['identity', 'water', 'temperature', 'ph', 'evidence'] as const).map(field => [field, fieldStatusOf(species, field)])),
  sourceDomain: sourceDomainOf(species.feedingProfile?.sourceUrl),
}));

const auditOutput = process.env.CATALOG_AUDIT_OUTPUT || 'build/catalog/audit/species-quality.json';
await mkdir(dirname(auditOutput), { recursive: true });
await writeFile(auditOutput, `${JSON.stringify({ generatedAt: new Date().toISOString(), total: fishData.length, records: fieldAudit }, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  total: fishData.length,
  uniqueNames: new Set(fishData.map(species => species.name)).size,
  uniqueScientificNames: new Set(fishData.map(species => species.scientificName)).size,
  duplicateNameGroups: groupsBy('name'),
  duplicateScientificNameGroups: groupsBy('scientificName'),
  statusCounts: statuses,
  missingExplicitWaterType: fishData.filter(species => !species.waterType).length,
  googleSearchSourceCount: fishData.filter(species => sourceDomainOf(species.feedingProfile?.sourceUrl) === 'www.google.com').length,
  googleSearchMarkedReviewed: fishData.filter(species => sourceDomainOf(species.feedingProfile?.sourceUrl) === 'www.google.com' && species.feedingProfile?.needsReview === false).length,
  sourceDomains,
  placeholderScientificNames: fishData.filter(species => /\b(?:sp\.|spp\.|var\.)\s*$/i.test(species.scientificName)).map(species => ({ id: species.id, name: species.name, scientificName: species.scientificName })),
  crossSpeciesHousingConflicts: fishData.filter(species => statusOf(species) === 'CONFLICT').map(species => ({ id: species.id, name: species.name })),
  researchKeys: new Set(fishData.map(species => binomialOf(species.scientificName)).filter(Boolean)).size,
  reportPath: auditOutput,
}, null, 2));
