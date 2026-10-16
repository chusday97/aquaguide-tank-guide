import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  retryCompatibilityDeterministicExtractionFromResume,
  type CompatibilityResearchResumeBundle,
} from '../apps/api/src/compatibility-species-research-provider';
import { assessCompatibilitySpeciesResearchPacket } from '../src/services/compatibility/species-onboarding-research.service';
import { buildCompatibilityOnboardingReviewPacket } from '../src/services/compatibility/onboarding-review-packet.service';

const inputPath = 'evaluation/reports/compatibility-active-completion-batch.json';
const outputPath = 'evaluation/product/compatibility-deterministic-resume-review.v1.json';
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as { pages?: Array<{ results?: Array<Record<string, unknown>> }> };
const candidates = (input.pages || []).flatMap(page => page.results || []).filter(result => (
  (result.workItem as { queue?: string } | undefined)?.queue === 'extraction_retry' && result.resumeBundle
));
const jobs = [] as Array<Record<string, unknown>>;
let supported = 0;
let unresolved = 0;
let reviewReady = 0;
for (const candidate of candidates) {
  const bundle = candidate.resumeBundle as CompatibilityResearchResumeBundle;
  const packet = await retryCompatibilityDeterministicExtractionFromResume(bundle);
  const assessment = assessCompatibilitySpeciesResearchPacket(packet);
  const resolutions = bundle.targetFields.map(field => {
    const resolution = assessment.fieldResolutions.find(item => item.field === field)!;
    const sourceUrls = resolution.sourceIds.map(sourceId => packet.sources.find(source => source.id === sourceId)?.url).filter(Boolean);
    return {
      field,
      status: resolution.status,
      proposedValue: resolution.proposedValue,
      sourceUrls,
      notes: resolution.notes,
    };
  });
  const supportedFields = resolutions.filter(item => item.status === 'supported').map(item => item.field);
  const unresolvedFields = resolutions.filter(item => item.status !== 'supported').map(item => item.field);
  supported += supportedFields.length;
  unresolved += unresolvedFields.length;
  if (unresolvedFields.length === 0) reviewReady += 1;
  const reviewPacket = buildCompatibilityOnboardingReviewPacket(assessment);
  jobs.push({
    researchKey: candidate.researchKey,
    scientificName: candidate.scientificName,
    targetFields: bundle.targetFields,
    verifiedDocumentSnapshots: bundle.documents.map(document => ({
      url: document.url,
      publisher: document.publisher,
      contentSha256: document.contentSha256,
    })),
    deterministicSupportedFields: supportedFields,
    modelOrManualRequiredFields: unresolvedFields,
    reviewReady: unresolvedFields.length === 0,
    resolutions,
    reviewGate: reviewPacket.gate,
    repeatedIdentityLookup: false,
    repeatedSourceDiscovery: false,
    repeatedSourceFetch: false,
    modelCalls: 0,
    writesAuthority: false,
  });
}
const report = {
  version: 1,
  kind: 'compatibility_deterministic_resume_review',
  generatedFrom: inputPath,
  resumableJobs: candidates.length,
  targetFields: supported + unresolved,
  deterministicSupportedFields: supported,
  modelOrManualRequiredFields: unresolved,
  fullyReviewableJobs: reviewReady,
  repeatedIdentityLookup: false,
  repeatedSourceDiscovery: false,
  repeatedSourceFetch: false,
  modelCalls: 0,
  writesAuthority: false,
  jobs,
};
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  outputPath,
  resumableJobs: report.resumableJobs,
  targetFields: report.targetFields,
  deterministicSupportedFields: report.deterministicSupportedFields,
  modelOrManualRequiredFields: report.modelOrManualRequiredFields,
  fullyReviewableJobs: report.fullyReviewableJobs,
  modelCalls: 0,
  writesAuthority: false,
}, null, 2));
