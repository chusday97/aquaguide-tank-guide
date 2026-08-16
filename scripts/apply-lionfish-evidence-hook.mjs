import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/data/compatibilityEvidence.ts', import.meta.url);
let source = await readFile(path, 'utf8');

const replaceOnce = (label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`[${label}] exact anchor is not unique`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
};

replaceOnce(
  'additional-profile-import',
  "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\n",
  "import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';\nimport {\n  getAdditionalReviewedCompatibilityProfile,\n  getAdditionalReviewedCompatibilityProfileIds,\n} from './compatibilityEvidenceReviewedPredators';\n",
);

replaceOnce(
  'profile-getter',
  "export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];\n",
  "export const getReviewedCompatibilityProfile = (speciesId: string) => (\n  profiles[speciesId] || getAdditionalReviewedCompatibilityProfile(speciesId)\n);\n",
);

replaceOnce(
  'audit-profile-ids',
  "  reviewedSpeciesIds: Object.keys(profiles),\n",
  "  reviewedSpeciesIds: [...Object.keys(profiles), ...getAdditionalReviewedCompatibilityProfileIds()],\n",
);

await writeFile(path, source, 'utf8');
console.log('canonical lionfish reviewed evidence hooked into profile getter and audit');
