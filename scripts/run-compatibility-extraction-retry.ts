import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  probeCompatibilityResearchProvider,
  retryCompatibilityDeterministicExtractionFromResume,
  retryCompatibilityExtractionFromResume,
  type CompatibilityResearchResumeBundle,
} from '../apps/api/src/compatibility-species-research-provider';
import { buildCompatibilityResearchBatchWorkItem } from '../apps/api/src/compatibility-research-batch';
import { assessCompatibilitySpeciesResearchPacket } from '../src/services/compatibility/species-onboarding-research.service';
import { buildCompatibilityOnboardingReviewPacket } from '../src/services/compatibility/onboarding-review-packet.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};
const inputPath = arg('input') || 'evaluation/reports/compatibility-active-completion-batch.json';
const outputPath = arg('output') || 'evaluation/reports/compatibility-extraction-retry.json';
const maxJobs = Math.max(1, Number(arg('max-jobs') || 999));
const providerMode = arg('provider-mode') === 'ai' ? 'ai' : 'deterministic';
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as {
  pages?: Array<{ results?: Array<Record<string, unknown>> }>;
};
const candidates = (input.pages || []).flatMap(page => page.results || []).filter(result => (
  (result.workItem as { queue?: string } | undefined)?.queue === 'extraction_retry'
  && result.resumeBundle
)).slice(0, maxJobs);
const preflight = providerMode === 'ai'
  ? await probeCompatibilityResearchProvider()
  : {
      status: 'skipped' as const,
      configured: false,
      providerId: 'bailian-web-research-v1',
      host: null,
      model: '',
      httpStatus: null,
      reasonCode: 'deterministic_mode',
    };
const results: Array<Record<string, unknown>> = [];

for (const candidate of candidates) {
    const resumeBundle = candidate.resumeBundle as CompatibilityResearchResumeBundle;
    try {
      const packet = providerMode === 'ai' && preflight.status === 'ready'
        ? await retryCompatibilityExtractionFromResume(resumeBundle)
        : await retryCompatibilityDeterministicExtractionFromResume(resumeBundle);
      const assessment = assessCompatibilitySpeciesResearchPacket(packet);
      const unresolvedFields = resumeBundle.targetFields.filter(field => (
        assessment.fieldResolutions.find(item => item.field === field)?.status !== 'supported'
      ));
      const researchScope = {
        fields: resumeBundle.targetFields,
        unresolvedFields,
        complete: resumeBundle.targetFields.length > 0 && unresolvedFields.length === 0,
      };
      const reviewPacket = buildCompatibilityOnboardingReviewPacket(assessment);
      const resourceLabel = ((candidate.catalogObjects as Array<{ name?: string }> | undefined)?.[0]?.name)
        || resumeBundle.commonName
        || resumeBundle.scientificName;
      const workItem = buildCompatibilityResearchBatchWorkItem({
        status: 'research_assessed',
        resourceLabel,
        reviewPacket,
        queueMode: 'active_completion',
        researchScopeComplete: researchScope.complete,
        requestedGapFields: resumeBundle.targetFields,
      });
      results.push({
        researchKey: candidate.researchKey,
        scientificName: candidate.scientificName,
        requestedGapFields: candidate.requestedGapFields,
        catalogObjects: candidate.catalogObjects,
        researchDisposition: candidate.researchDisposition,
        identity: candidate.identity,
        resumeBundle,
        status: 'research_assessed',
        packet,
        assessment,
        researchScope,
        reviewPacket,
        workItem,
        reusedVerifiedDocuments: resumeBundle.documents.length,
        repeatedIdentityLookup: false,
        repeatedSourceDiscovery: false,
        repeatedSourceFetch: false,
        writesAuthority: false,
      });
    } catch (error) {
      results.push({
        researchKey: candidate.researchKey,
        scientificName: candidate.scientificName,
        catalogObjects: candidate.catalogObjects,
        researchDisposition: candidate.researchDisposition,
        identity: candidate.identity,
        resumeBundle,
        status: 'retry_error',
        reasonCode: error instanceof Error ? error.message : 'compatibility_extraction_retry_failed',
        repeatedIdentityLookup: false,
        repeatedSourceDiscovery: false,
        repeatedSourceFetch: false,
        writesAuthority: false,
      });
    }
  }

const report = {
  generatedAt: new Date().toISOString(),
  sourceReport: inputPath,
  providerPreflight: preflight,
  status: providerMode === 'ai' && preflight.status === 'ready' ? 'retry_completed' : 'deterministic_fallback_completed',
  resumableJobs: candidates.length,
  attemptedJobs: results.length,
  providerMode,
  modelCallsEnabled: providerMode === 'ai' && preflight.status === 'ready',
  reusedVerifiedDocuments: results.reduce((sum, item) => sum + Number(item.reusedVerifiedDocuments || 0), 0),
  repeatedIdentityLookup: false,
  repeatedSourceDiscovery: false,
  repeatedSourceFetch: false,
  writesAuthority: false,
  results,
};
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  status: report.status,
  providerPreflight: report.providerPreflight,
  resumableJobs: report.resumableJobs,
  attemptedJobs: report.attemptedJobs,
  reusedVerifiedDocuments: report.reusedVerifiedDocuments,
  repeatedIdentityLookup: false,
  repeatedSourceDiscovery: false,
  repeatedSourceFetch: false,
  writesAuthority: false,
}, null, 2));
console.log(`EXTRACTION_RETRY_REPORT=${outputPath}`);
