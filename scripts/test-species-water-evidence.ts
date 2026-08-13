import { fishData } from '../src/data/fishData';
import { getSpeciesWaterEvidence, auditedWaterEvidenceTaxa } from '../src/modules/species/speciesWaterEvidence';
import { getSpeciesWaterType, matchesWaterTypeFilter } from '../src/modules/species/species.service';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const covered = fishData.filter(species => getSpeciesWaterEvidence(species));
assert(covered.length === 55, `expected explicit water evidence to cover the 55 audited fallback records, got ${covered.length}`);

for (const scientificName of auditedWaterEvidenceTaxa) {
  assert(
    fishData.some(species => {
      const normalized = species.scientificName.toLowerCase();
      const base = scientificName.toLowerCase();
      return normalized === base || normalized.startsWith(`${base} var.`);
    }),
    `water-evidence taxon has no catalog record: ${scientificName}`,
  );
}

for (const species of covered) {
  const evidence = getSpeciesWaterEvidence(species);
  assert(evidence?.primaryWaterType === 'freshwater', `${species.id} expected freshwater evidence`);
  assert(getSpeciesWaterType(species) === 'freshwater', `${species.id} must resolve freshwater from explicit evidence`);
  assert(matchesWaterTypeFilter(species, 'Freshwater'), `${species.id} must pass Freshwater filter`);
  assert(!matchesWaterTypeFilter(species, 'Saltwater'), `${species.id} must not pass Saltwater filter`);
}

for (const scientificName of ['Parambassis ranga', 'Vittina turrita']) {
  const species = fishData.find(item => item.scientificName === scientificName);
  assert(species, `missing mixed-habitat fixture ${scientificName}`);
  const evidence = species && getSpeciesWaterEvidence(species);
  assert(evidence?.note, `${scientificName} must retain its freshwater/brackish caveat`);
}

console.log(JSON.stringify({
  ok: true,
  auditedTaxa: auditedWaterEvidenceTaxa.length,
  coveredCatalogRecords: covered.length,
  mixedHabitatCaveats: ['Parambassis ranga', 'Vittina turrita'],
}, null, 2));
