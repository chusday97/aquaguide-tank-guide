import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  probeCompatibilityResearchProvider,
  researchCompatibilityVariantFields,
  type CompatibilityVariantFieldResearchResult,
} from '../apps/api/src/compatibility-species-research-provider';
import { buildCompatibilityVariantActionableResearchQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';
import type { CompatibilityOnboardingCoreField } from '../src/services/compatibility/species-onboarding-research.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const outputPath = arg('output') || 'evaluation/reports/compatibility-variant-exact-evidence-research.v1.json';
const maxJobs = Math.max(1, Number(arg('max-jobs') || 999));
const offset = Math.max(0, Number(arg('offset') || 0));
const round = Math.max(1, Number(arg('round') || 1));

const queue = buildCompatibilityVariantActionableResearchQueue();
const bySpecies = new Map<string, typeof queue.items>();
for (const item of queue.items) {
  const bucket = bySpecies.get(item.speciesId) || [];
  bucket.push(item);
  bySpecies.set(item.speciesId, bucket);
}
const jobs = [...bySpecies.entries()]
  .map(([speciesId, items]) => ({
    speciesId,
    commonName: items[0].name,
    baseScientificName: items[0].canonicalScientificName,
    variantKey: items[0].variantKey,
    relationshipType: items[0].relationshipType,
    targetFields: [...new Set(items.map(item => item.field))] as CompatibilityOnboardingCoreField[],
    queueSlots: items.length,
  }))
  .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

const selectedJobs = jobs.slice(offset, offset + maxJobs);
const preflight = await probeCompatibilityResearchProvider();
if (preflight.status !== 'ready') {
  throw new Error('compatibility_variant_exact_research_provider_not_ready:' + (preflight.reasonCode || preflight.status));
}

const results: CompatibilityVariantFieldResearchResult[] = [];
const errors: Array<{ speciesId: string; message: string }> = [];
mkdirSync(dirname(outputPath), { recursive: true });

const buildReport = (complete: boolean) => {
  const fieldCandidates = results.flatMap(result => result.fieldCandidates.map(candidate => ({
    speciesId: result.speciesId,
    field: candidate.field,
    proposedValue: candidate.proposedValue,
    sourceIds: candidate.sourceIds,
    confidence: candidate.confidence,
    evidenceText: candidate.evidenceText,
    note: candidate.note,
  })));
  const supportedKeys = new Set(fieldCandidates.map(item => item.speciesId + ':' + item.field));
  const selectedSlots = selectedJobs.reduce((sum, job) => sum + job.queueSlots, 0);
  return {
    version: 1,
    kind: 'compatibility_variant_exact_evidence_research',
    generatedAt: new Date().toISOString(),
    generatedFrom: 'evaluation/product/compatibility-variant-exact-evidence-queue.v1.json',
    providerPreflight: preflight,
    round,
    offset,
    selectedJobs: selectedJobs.length,
    selectedSlots,
    processedJobs: results.length + errors.length,
    complete,
    promotionAllowed: false,
    writesAuthority: false,
    grantsInheritance: false,
    summary: {
      candidateFields: fieldCandidates.length,
      distinctSupportedSlots: supportedKeys.size,
      unresolvedSlots: selectedSlots - supportedKeys.size,
      jobsWithCandidates: results.filter(result => result.fieldCandidates.length > 0).length,
      jobsWithoutCandidates: results.filter(result => result.fieldCandidates.length === 0).length,
      failedJobs: errors.length,
    },
    jobs: selectedJobs,
    results,
    errors,
  };
};

for (const [index, job] of selectedJobs.entries()) {
  try {
    const result = await researchCompatibilityVariantFields({
      speciesId: job.speciesId,
      baseScientificName: job.baseScientificName,
      variantKey: job.variantKey,
      commonName: job.commonName,
      targetFields: job.targetFields,
      round,
    });
    results.push(result);
  } catch (error) {
    errors.push({
      speciesId: job.speciesId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
  const checkpoint = buildReport(false);
  writeFileSync(outputPath, JSON.stringify(checkpoint, null, 2) + '\n');
  console.log(`VARIANT_EXACT_RESEARCH_CHECKPOINT ${index + 1}/${selectedJobs.length} species=${job.speciesId} candidates=${results.at(-1)?.speciesId === job.speciesId ? results.at(-1)?.fieldCandidates.length || 0 : 0}`);
}

const report = buildReport(true);
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  outputPath,
  selectedJobs: report.selectedJobs,
  selectedSlots: report.selectedSlots,
  ...report.summary,
  promotionAllowed: false,
  writesAuthority: false,
  grantsInheritance: false,
}, null, 2));
