import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { buildCompatibilityVariantActionableResearchQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

type ResearchReport = {
  round?: number;
  results?: Array<{
    speciesId?: string;
    targetFields?: string[];
    attemptedUrls?: string[];
    sources?: unknown[];
    fieldCandidates?: Array<{ field?: string }>;
    discoveryStatus?: string;
    discoveredUrlCount?: number;
    verifiedVariantDocumentCount?: number;
  }>;
};

const defaultReports = [
  'evaluation/reports/compatibility-variant-exact-evidence-research.v1.json',
  'evaluation/reports/compatibility-variant-exact-evidence-research-round2-goldfish.v1.json',
  'evaluation/reports/compatibility-variant-exact-evidence-research-round2-tail.v1.json',
];
const reportPaths = (arg('reports') || defaultReports.join(','))
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const outputPath = arg('output') || 'evaluation/product/compatibility-variant-exact-evidence-triage.v1.json';

const reports = reportPaths.map(path => ({
  path,
  report: JSON.parse(readFileSync(path, 'utf8')) as ResearchReport,
}));
const queue = buildCompatibilityVariantActionableResearchQueue();
const bySpecies = new Map<string, Array<{
  reportPath: string;
  round: number;
  attemptedUrls: number;
  verifiedDocuments: number;
  candidateFields: string[];
  discoveryStatus: string;
}>>();

for (const { path, report } of reports) {
  for (const result of report.results || []) {
    if (!result.speciesId) continue;
    const attempts = result.attemptedUrls?.length || 0;
    const verified = result.sources?.length || result.verifiedVariantDocumentCount || 0;
    const candidates = (result.fieldCandidates || []).flatMap(item => item.field ? [item.field] : []);
    const inferredStatus = result.discoveryStatus
      || (attempts === 0 ? 'discovery_empty'
        : verified === 0 ? 'no_verified_variant_documents'
          : 'verified_variant_documents');
    const bucket = bySpecies.get(result.speciesId) || [];
    bucket.push({
      reportPath: path,
      round: Math.max(1, Number(report.round || 1)),
      attemptedUrls: attempts,
      verifiedDocuments: verified,
      candidateFields: candidates,
      discoveryStatus: inferredStatus,
    });
    bySpecies.set(result.speciesId, bucket);
  }
}

const speciesIds = [...new Set(queue.items.map(item => item.speciesId))].sort();
const objects = speciesIds.map(speciesId => {
  const runs = (bySpecies.get(speciesId) || []).sort((a, b) => a.round - b.round);
  const slots = queue.items.filter(item => item.speciesId === speciesId);
  const supportedFields = [...new Set(runs.flatMap(run => run.candidateFields))].sort();
  const unresolvedFields = [...new Set(slots.map(item => item.field).filter(field => !supportedFields.includes(field)))].sort();
  const discoveryEmptyRounds = runs.filter(run => run.discoveryStatus === 'discovery_empty').length;
  const anyCandidates = supportedFields.length > 0;
  const status = anyCandidates
    ? 'draft_evidence_found'
    : discoveryEmptyRounds >= 2
      ? 'discovery_evidence_ceiling'
      : runs.length > 0
        ? 'discovery_retry_required'
        : 'not_run';
  return {
    speciesId,
    variantKey: slots[0]?.variantKey || '',
    canonicalScientificName: slots[0]?.canonicalScientificName || '',
    totalSlots: slots.length,
    supportedFields,
    unresolvedFields,
    researchRuns: runs,
    status,
    promotionAllowed: false,
    writesAuthority: false,
    grantsInheritance: false,
  };
});

const report = {
  version: 1,
  kind: 'compatibility_variant_exact_evidence_triage',
  generatedFrom: reportPaths,
  policy: {
    promotionAllowed: false,
    writesAuthority: false,
    grantsInheritance: false,
    discoveryEvidenceCeilingRequiresEmptyRounds: 2,
    discoveryEvidenceCeilingDoesNotMeanBiologicalUnknown: true,
    discoveryEvidenceCeilingMeaning: 'Current trusted-source discovery route produced no eligible URLs in two independent rounds; do not repeat the same route without changing source strategy.',
  },
  summary: {
    variantObjects: objects.length,
    totalResearchSlots: queue.summary.totalResearchSlots,
    draftEvidenceFoundObjects: objects.filter(item => item.status === 'draft_evidence_found').length,
    discoveryRetryRequiredObjects: objects.filter(item => item.status === 'discovery_retry_required').length,
    discoveryEvidenceCeilingObjects: objects.filter(item => item.status === 'discovery_evidence_ceiling').length,
    notRunObjects: objects.filter(item => item.status === 'not_run').length,
    supportedSlots: objects.reduce((sum, item) => sum + item.supportedFields.length, 0),
    unresolvedSlots: objects.reduce((sum, item) => sum + item.unresolvedFields.length, 0),
  },
  objects,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ outputPath, ...report.summary, ...report.policy }, null, 2));
