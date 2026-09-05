import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  careSeoHostedAcceptanceEvidenceSchema,
  careSeoReleaseDecisionSchema,
  careSeoStagingSnapshotSchema,
  type CareSeoHostedAcceptanceEvidence,
  type CareSeoReleaseDecision,
} from '../packages/contracts/src/index';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const DEFAULT_SNAPSHOT = 'content/care-seo/staging-snapshot.json';
const DEFAULT_ACCEPTANCE = 'content/care-seo/staging-acceptance.json';
const DEFAULT_DECISION = 'content/care-seo/release-decision.json';

export const careSeoSnapshotSha256 = (raw: string | Buffer) => (
  createHash('sha256').update(raw).digest('hex')
);

type ReadinessInput = {
  snapshotRaw: string;
  acceptance?: CareSeoHostedAcceptanceEvidence | null;
  decision?: CareSeoReleaseDecision | null;
};export const evaluateCareSeoReleaseReadiness = ({ snapshotRaw, acceptance, decision }: ReadinessInput) => {
  const snapshot = careSeoStagingSnapshotSchema.parse(JSON.parse(snapshotRaw));
  const snapshotSha256 = careSeoSnapshotSha256(snapshotRaw);
  const blockers: string[] = [];
  if (snapshot.environment !== 'staging') blockers.push('snapshot_environment_not_staging');
  if (snapshot.sourceEnvironment !== 'staging') blockers.push('snapshot_source_not_staging');

  const groups = new Map<string, typeof snapshot.records>();
  for (const record of snapshot.records) {
    if (record.editorial.reviewState !== 'approved') blockers.push('staging_record_not_approved');
    if (record.editorial.indexStrategy !== 'noindex') blockers.push('staging_record_not_noindex');
    const key = record.projection.sourceCareCatalogKey;
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  for (const [catalogKey, records] of groups) {
    const locales = new Set(records.map(record => record.projection.locale));
    const versions = new Set(records.map(record => record.projection.sourceCareVersion));
    const sourceIds = new Set(records.map(record => record.projection.sourceCareId));
    if (records.length !== 2 || !locales.has('en') || !locales.has('zh-CN') || versions.size !== 1 || sourceIds.size !== 1) {
      blockers.push(`bilingual_pair_invalid:${catalogKey}`);
    }
  }

  if (!acceptance) blockers.push('acceptance_evidence_missing');
  if (acceptance) {
    if (acceptance.snapshotSha256 !== snapshotSha256) blockers.push('acceptance_snapshot_hash_mismatch');
    if (acceptance.verification.pagesChecked !== snapshot.records.length) blockers.push('acceptance_page_count_mismatch');
    if (acceptance.verification.bilingualPairsChecked !== groups.size) blockers.push('acceptance_pair_count_mismatch');
  }
  if (!decision) blockers.push('explicit_human_release_decision_required');
  if (decision) {
    if (decision.decision !== 'approve_index_release') blockers.push('release_decision_hold');
    if (decision.snapshotSha256 !== snapshotSha256) blockers.push('release_decision_snapshot_mismatch');
    if (acceptance && decision.acceptanceDeploymentId !== acceptance.deployment.deploymentId) {
      blockers.push('release_decision_acceptance_mismatch');
    }
  }

  return {
    readyForProductionIndex: blockers.length === 0 && decision?.decision === 'approve_index_release',
    snapshotSha256,
    catalogKeys: [...groups.keys()].sort(),
    pages: snapshot.records.length,
    bilingualPairs: groups.size,
    acceptedDeploymentId: acceptance?.deployment.deploymentId || null,
    decision: decision?.decision || null,
    blockers: [...new Set(blockers)],
  };
};

const readOptionalJson = async <T>(relativePath: string, parser: { parse: (value: unknown) => T }) => {
  try {
    const raw = await readFile(path.resolve(repoRoot, relativePath), 'utf8');
    return parser.parse(JSON.parse(raw));
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};
const cli = async () => {
  const snapshotPath = process.env.CARE_SEO_RELEASE_SNAPSHOT_PATH || DEFAULT_SNAPSHOT;
  const acceptancePath = process.env.CARE_SEO_RELEASE_ACCEPTANCE_PATH || DEFAULT_ACCEPTANCE;
  const decisionPath = process.env.CARE_SEO_RELEASE_DECISION_PATH || DEFAULT_DECISION;
  const snapshotRaw = await readFile(path.resolve(repoRoot, snapshotPath), 'utf8');
  const acceptance = await readOptionalJson(acceptancePath, careSeoHostedAcceptanceEvidenceSchema);
  const decision = await readOptionalJson(decisionPath, careSeoReleaseDecisionSchema);
  const result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance, decision });
  console.log(JSON.stringify(result, null, 2));
  if (process.argv.includes('--require-ready') && !result.readyForProductionIndex) process.exitCode = 2;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
