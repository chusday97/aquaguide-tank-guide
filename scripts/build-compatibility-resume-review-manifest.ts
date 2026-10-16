import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputPath = arg('input') || 'evaluation/reports/compatibility-active-completion-batch.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-resume-review.v1.json';
const source = JSON.parse(readFileSync(inputPath, 'utf8')) as {
  generatedAt?: string;
  queueMode?: string;
  extractionMode?: string;
  providerPreflight?: { status?: string; model?: string };
  pages?: Array<{ results?: Array<Record<string, unknown>> }>;
};

const jobs = (source.pages || []).flatMap(page => page.results || []).flatMap(result => {
  const workItem = result.workItem as { queue?: string; reasonCodes?: string[] } | undefined;
  const resume = result.resumeBundle as {
    scientificName?: string;
    commonName?: string;
    targetFields?: string[];
    documents?: Array<{
      url?: string;
      title?: string;
      publisher?: string;
      sourceType?: string;
      contentSha256?: string;
    }>;
  } | undefined;
  if (workItem?.queue !== 'extraction_retry' || !resume) return [];
  const documents = (resume.documents || []).map(document => ({
    url: document.url || '',
    title: document.title || '',
    publisher: document.publisher || '',
    sourceType: document.sourceType || '',
    contentSha256: document.contentSha256 || '',
  }));
  return [{
    researchKey: String(result.researchKey || resume.scientificName || ''),
    scientificName: String(result.scientificName || resume.scientificName || ''),
    commonName: String(resume.commonName || ''),
    targetFields: [...(resume.targetFields || [])],
    currentQueue: 'extraction_retry' as const,
    reasonCodes: [...(workItem.reasonCodes || [])],
    verifiedDocumentCount: documents.length,
    verifiedDocuments: documents,
    retry: {
      status: 'pending_provider_recovery' as const,
      repeatsIdentityLookup: false as const,
      repeatsSourceDiscovery: false as const,
      repeatsSourceFetch: false as const,
      writesAuthority: false as const,
    },
  }];
});

const manifest = {
  version: 1,
  kind: 'compatibility_extraction_resume_review_manifest' as const,
  generatedFrom: inputPath,
  sourceReportGeneratedAt: source.generatedAt || null,
  sourceQueueMode: source.queueMode || null,
  sourceExtractionMode: source.extractionMode || null,
  providerStatusAtCapture: source.providerPreflight?.status || null,
  providerModelAtCapture: source.providerPreflight?.model || null,
  rawSourceTextCommitted: false as const,
  writesAuthority: false as const,
  resumableJobs: jobs.length,
  verifiedDocumentSnapshots: jobs.reduce((sum, job) => sum + job.verifiedDocumentCount, 0),
  jobs,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({
  output: outputPath,
  resumableJobs: manifest.resumableJobs,
  verifiedDocumentSnapshots: manifest.verifiedDocumentSnapshots,
  rawSourceTextCommitted: manifest.rawSourceTextCommitted,
  writesAuthority: manifest.writesAuthority,
}, null, 2));
