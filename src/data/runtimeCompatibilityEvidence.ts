import type { ReviewedCompatibilityPairRuleDto, ReviewedCompatibilityProfileDto } from '../../packages/contracts/src';
import { apiRequest } from '../services/api/api-client';
import {
  getCompatibilityEvidenceAudit,
  type ReviewedCompatibilityProfile,
  type ReviewedPairRule,
} from './compatibilityEvidence';

type CompatibilityBootstrapResponse = {
  profiles: ReviewedCompatibilityProfileDto[];
  pairRules: ReviewedCompatibilityPairRuleDto[];
  authority: 'reviewed-db';
  counts: { profiles: number; pairRules: number };
};

export type RuntimeCompatibilityStatus = {
  source: 'reviewed-db' | 'static-fallback';
  profiles: number;
  pairRules: number;
  authorityVersion: string;
  fallbackReason?: string;
};

const pairKey = (left: string, right: string) => [left, right].sort().join('__');
const cloneCitation = <T extends object>(source: T): T => ({ ...source });
const cloneProfile = (profile: ReviewedCompatibilityProfile): ReviewedCompatibilityProfile => ({
  ...profile,
  behaviorTraits: [...profile.behaviorTraits],
  predationTargets: [...profile.predationTargets],
  citations: profile.citations.map(source => cloneCitation(source)),
});
const clonePairRule = (rule: ReviewedPairRule): ReviewedPairRule => ({
  ...rule,
  speciesIds: [...rule.speciesIds] as [string, string],
  mitigation: [...rule.mitigation],
  affectedSpeciesIds: [...rule.affectedSpeciesIds],
  citations: rule.citations.map(source => cloneCitation(source)),
});

const staticAudit = getCompatibilityEvidenceAudit();
const staticProfileKeys = new Set(staticAudit.reviewedProfiles.map(profile => profile.speciesId));
const staticPairKeys = new Set(staticAudit.reviewedPairRules.map(rule => pairKey(...rule.speciesIds)));

let runtimeProfiles = new Map<string, ReviewedCompatibilityProfile>();
let runtimePairRules = new Map<string, ReviewedPairRule>();
const STATIC_AUTHORITY_VERSION = 'tank-compatibility-v2-reviewed-evidence';
const hashAuthorityVersion = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
const reviewedDbAuthorityVersion = (payload: CompatibilityBootstrapResponse) => {
  const profileVersions = payload.profiles.map(profile => {
    const citations = profile.citations.map(source => `${source.id}@${source.version}`).sort().join(',');
    return `profile:${profile.catalogKey}@${profile.version}[${citations}]`;
  }).sort();
  const pairVersions = payload.pairRules.map(rule => {
    const citations = rule.citations.map(source => `${source.id}@${source.version}`).sort().join(',');
    return `pair:${pairKey(...rule.catalogKeys)}@${rule.version}[${citations}]`;
  }).sort();
  return `tank-compatibility-v2-reviewed-db-${hashAuthorityVersion([...profileVersions, ...pairVersions].join('|'))}`;
};

let runtimeStatus: RuntimeCompatibilityStatus = {
  source: 'static-fallback',
  profiles: staticAudit.reviewedProfiles.length,
  pairRules: staticAudit.reviewedPairRules.length,
  authorityVersion: STATIC_AUTHORITY_VERSION,
};

const resetRuntimeCompatibilityEvidence = (reason?: string) => {
  runtimeProfiles = new Map(staticAudit.reviewedProfiles.map(profile => [profile.speciesId, cloneProfile(profile)]));
  runtimePairRules = new Map(staticAudit.reviewedPairRules.map(rule => [pairKey(...rule.speciesIds), clonePairRule(rule)]));
  runtimeStatus = {
    source: 'static-fallback',
    profiles: runtimeProfiles.size,
    pairRules: runtimePairRules.size,
    authorityVersion: STATIC_AUTHORITY_VERSION,
    ...(reason ? { fallbackReason: reason } : {}),
  };
};
const reviewedCitations = (citations: Array<{ reviewStatus?: string }>) => (
  citations.length > 0 && citations.every(source => source.reviewStatus === 'reviewed')
);
const exactBaselineCoverage = (payload: CompatibilityBootstrapResponse) => {
  const profileKeys = payload.profiles.map(profile => profile.catalogKey);
  const pairKeys = payload.pairRules.map(rule => pairKey(...rule.catalogKeys));
  if (new Set(profileKeys).size !== profileKeys.length || new Set(pairKeys).size !== pairKeys.length) return false;
  if (profileKeys.length !== staticProfileKeys.size || pairKeys.length !== staticPairKeys.size) return false;
  if (!profileKeys.every(key => staticProfileKeys.has(key)) || !pairKeys.every(key => staticPairKeys.has(key))) return false;
  if (!payload.profiles.every(profile => profile.reviewStatus === 'reviewed' && reviewedCitations(profile.citations))) return false;
  return payload.pairRules.every(rule => rule.reviewStatus === 'reviewed' && reviewedCitations(rule.citations));
};

const toRuntimeProfile = (profile: ReviewedCompatibilityProfileDto): ReviewedCompatibilityProfile => ({
  speciesId: profile.catalogKey,
  behaviorTraits: [...profile.behaviorTraits],
  minimumGroupSize: profile.minimumGroupSize,
  predationTargets: [...profile.predationTargets],
  confidence: profile.confidence,
  reviewStatus: profile.reviewStatus,
  citations: profile.citations.map(source => ({ ...source })),
});

const toRuntimePairRule = (rule: ReviewedCompatibilityPairRuleDto): ReviewedPairRule => ({
  speciesIds: [...rule.catalogKeys] as [string, string],
  verdict: rule.verdict,
  riskType: rule.riskType,
  reason: rule.reason,
  mitigation: [...rule.mitigation],
  basis: rule.basis,
  confidence: rule.confidence,
  reviewStatus: rule.reviewStatus,
  affectedSpeciesIds: [...rule.catalogKeys],
  citations: rule.citations.map(source => ({ ...source })),
});

export const applyReviewedCompatibilityBootstrap = (payload: CompatibilityBootstrapResponse) => {
  if (!exactBaselineCoverage(payload)) {
    resetRuntimeCompatibilityEvidence('incomplete_or_mismatched_reviewed_db_baseline');
    return getRuntimeCompatibilityStatus();
  }
  runtimeProfiles = new Map(payload.profiles.map(profile => [profile.catalogKey, toRuntimeProfile(profile)]));
  runtimePairRules = new Map(payload.pairRules.map(rule => [pairKey(...rule.catalogKeys), toRuntimePairRule(rule)]));
  runtimeStatus = {
    source: 'reviewed-db',
    profiles: runtimeProfiles.size,
    pairRules: runtimePairRules.size,
    authorityVersion: reviewedDbAuthorityVersion(payload),
  };
  return getRuntimeCompatibilityStatus();
};

export const hydrateReviewedCompatibilityEvidence = async () => {
  try {
    const payload = await apiRequest<CompatibilityBootstrapResponse>('/compatibility-bootstrap', {
      authenticated: false,
      signal: AbortSignal.timeout(5000),
    });
    return applyReviewedCompatibilityBootstrap(payload);
  } catch {
    resetRuntimeCompatibilityEvidence('reviewed_db_unavailable');
    return getRuntimeCompatibilityStatus();
  }
};

export const getRuntimeReviewedCompatibilityProfile = (speciesId: string) => runtimeProfiles.get(speciesId);
export const getRuntimeReviewedPairRule = (leftId: string, rightId: string) => runtimePairRules.get(pairKey(leftId, rightId));
export const getRuntimeCompatibilityStatus = () => ({ ...runtimeStatus });
export const resetRuntimeCompatibilityEvidenceForTest = () => resetRuntimeCompatibilityEvidence('test_reset');

resetRuntimeCompatibilityEvidence();
