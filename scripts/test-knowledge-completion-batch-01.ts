import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { phase2Batch01Sources } from '../src/data/phase2Batch01Sources';
import { phase2Batch01Authority } from '../src/modules/knowledge/phase2Batch01Authority';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const ids = ['sp_0016', 'sp_0224', 'sp_0475'];
const sourceIds = new Set(phase2Batch01Sources.map(source => source.id));
const existingSourceIds = new Set(['batch03-fishbase-channa-argus', 'batch03-fishbase-rhodeus-ocellatus', 'j-morph-rhodeus-ocellatus-husbandry-2021']);
const allSourceIds = new Set([...sourceIds, ...existingSourceIds]);
const failures: string[] = [];
for (const id of ids) {
  if (!fishData.some(item => item.id === id)) failures.push(`${id}: missing catalog object`);
  if (!getReviewedSpeciesKnowledge(id)) failures.push(`${id}: missing direct Species Knowledge`);
  if (getReviewedCompatibilityProfile(id)) failures.push(`${id}: unexpected Compatibility Profile without general behavior evidence`);
  for (const authority of Object.values(phase2Batch01Authority[id] ?? {})) {
    if (!authority || authority.citationIds.length === 0 || authority.factEvidence.trim().length === 0) failures.push(`${id}: missing citation provenance/factEvidence`);
    for (const citationId of authority?.citationIds ?? []) if (!allSourceIds.has(citationId)) failures.push(`${id}: unregistered citation ${citationId}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('knowledge completion batch 01 contract: PASS');
