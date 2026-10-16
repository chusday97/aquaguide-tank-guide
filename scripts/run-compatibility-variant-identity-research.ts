import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  researchCompatibilityVariantIdentities,
  type CompatibilityVariantIdentityResearchResult,
} from '../apps/api/src/compatibility-species-research-provider';

type VariantReviewManifest = {
  groups: Array<{
    researchKey: string;
    baseScientificName: string;
    objects: Array<{
      speciesId: string;
      name: string;
      scientificName: string;
      status: string;
    }>;
  }>;
};

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputPath = arg('input') || 'evaluation/product/compatibility-variant-bridge-review.v1.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-variant-identity-research.v1.json';
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as VariantReviewManifest;
const groups = input.groups
  .map(group => ({
    ...group,
    objects: group.objects.filter(object => object.status === 'identity_review_required'),
  }))
  .filter(group => group.objects.length > 0);

const results: CompatibilityVariantIdentityResearchResult[] = [];
for (const group of groups) {
  console.log(`VARIANT_IDENTITY_RESEARCH_START ${group.baseScientificName} objects=${group.objects.length}`);
  const result = await researchCompatibilityVariantIdentities({
    baseScientificName: group.baseScientificName,
    variants: group.objects.map(object => ({
      speciesId: object.speciesId,
      scientificName: object.scientificName,
      commonName: object.name,
    })),
  });
  results.push(result);
  console.log(`VARIANT_IDENTITY_RESEARCH_DONE ${group.baseScientificName} candidates=${result.candidates.length} unresolved=${result.unresolvedSpeciesIds.length}`);
}

const report = {
  version: 1,
  kind: 'compatibility_variant_identity_research',
  generatedAt: new Date().toISOString(),
  generatedFrom: inputPath,
  promotionAllowed: false,
  writesAuthority: false,
  summary: {
    groupCount: results.length,
    objectCount: groups.reduce((sum, group) => sum + group.objects.length, 0),
    candidateCount: results.reduce((sum, result) => sum + result.candidates.length, 0),
    unresolvedCount: results.reduce((sum, result) => sum + result.unresolvedSpeciesIds.length, 0),
  },
  groups: results,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: outputPath, ...report.summary, promotionAllowed: false, writesAuthority: false }, null, 2));
