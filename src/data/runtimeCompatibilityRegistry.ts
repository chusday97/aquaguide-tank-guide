import type {
  ReviewedCompatibilityPairRuleDto,
  ReviewedCompatibilityProfileDto,
  ReviewedCompatibilityStageRiskRuleDto,
} from '../../packages/contracts/src';
import {
  getCompatibilityEvidenceAudit,
  type ReviewedCompatibilityProfile,
  type ReviewedPairRule,
  type ReviewedStageRiskProfile,
} from './compatibilityEvidence';

export type CompatibilityBootstrapResponse = {
  profiles: ReviewedCompatibilityProfileDto[];
  pairRules: ReviewedCompatibilityPairRuleDto[];
  authority: 'reviewed-db' | 'reviewed-git';
  counts: { profiles: number; pairRules: number };
};

export type RuntimeCompatibilityStatus = {
  source: 'reviewed-db' | 'reviewed-git' | 'static-fallback';
  profiles: number;
  pairRules: number;
  stageRiskRules: number;
  authorityVersion: string;
  fallbackReason?: string;
};

const pairKey = (left: string, right: string) => [left, right].sort().join('__');
const cloneCitation = <T extends object>(source: T): T => ({ ...source });
const cloneStockingGuidance = (guidance: ReviewedCompatibilityProfile['stockingGuidance']) => guidance ? ({
  ...guidance,
  constraints: [...guidance.constraints],
  evidenceIds: [...guidance.evidenceIds],
}) : undefined;
const cloneProfile = (profile: ReviewedCompatibilityProfile): ReviewedCompatibilityProfile => ({
  ...profile,
  behaviorTraits: [...profile.behaviorTraits],
  predationTargets: [...profile.predationTargets],
  citations: profile.citations.map(source => cloneCitation(source)),
  ...(profile.requiredFacts ? { requiredFacts: [...profile.requiredFacts] } : {}),
  ...(profile.stockingGuidance ? { stockingGuidance: cloneStockingGuidance(profile.stockingGuidance) } : {}),
});
const clonePairRule = (rule: ReviewedPairRule): ReviewedPairRule => ({
  ...rule,
  speciesIds: [...rule.speciesIds] as [string, string],
  mitigation: [...rule.mitigation],
  affectedSpeciesIds: [...rule.affectedSpeciesIds],
  citations: rule.citations.map(source => cloneCitation(source)),
});
const cloneStageRisk = (rule: ReviewedStageRiskProfile): ReviewedStageRiskProfile => ({
  ...rule,
  youngerStages: [...rule.youngerStages],
  olderStages: [...rule.olderStages],
  mitigation: [...rule.mitigation],
  affectedSpeciesIds: [...rule.affectedSpeciesIds],
  citations: rule.citations.map(source => cloneCitation(source)),
});

const staticAudit = getCompatibilityEvidenceAudit();
const staticProfileKeys = new Set(staticAudit.reviewedProfiles.map(profile => profile.speciesId));
const staticPairKeys = new Set(staticAudit.reviewedPairRules.map(rule => pairKey(...rule.speciesIds)));
const STATIC_AUTHORITY_VERSION = 'tank-compatibility-v3-reviewed-evidence';

const hashAuthorityVersion = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
const stageRiskSignature = (rule: ReviewedCompatibilityStageRiskRuleDto) => {
  const citations = rule.citations.map(source => `${source.id}@${source.version}`).sort().join(',');
  return [
    rule.ruleKey,
    [...rule.youngerStages].sort().join(','),
    [...rule.olderStages].sort().join(','),
    rule.verdict,
    rule.riskType,
    rule.reason,
    [...rule.mitigation].sort().join(','),
    rule.basis,
    rule.confidence,
    citations,
  ].join('~');
};
const reviewedAuthorityVersion = (payload: CompatibilityBootstrapResponse) => {
  const profileVersions = payload.profiles.map(profile => {
    const citations = profile.citations.map(source => `${source.id}@${source.version}`).sort().join(',');
    const requiredFacts = [...profile.requiredFacts].sort().join(',');
    const stocking = profile.stockingGuidance ? JSON.stringify(profile.stockingGuidance) : '';
    const stageRisks = [...profile.stageRiskRules].sort((a, b) => a.ruleKey.localeCompare(b.ruleKey)).map(stageRiskSignature).join(';');
    return `profile:${profile.catalogKey}@${profile.version}[${citations}]<${requiredFacts}><${stocking}><${stageRisks}>`;
  }).sort();
  const pairVersions = payload.pairRules.map(rule => {
    const citations = rule.citations.map(source => `${source.id}@${source.version}`).sort().join(',');
    return `pair:${pairKey(...rule.catalogKeys)}@${rule.version}[${citations}]`;
  }).sort();
  const source = payload.authority === 'reviewed-git' ? 'git' : 'db';
  return `tank-compatibility-v3-reviewed-${source}-${hashAuthorityVersion([...profileVersions, ...pairVersions].join('|'))}`;
};

let runtimeProfiles = new Map<string, ReviewedCompatibilityProfile>();
let runtimePairRules = new Map<string, ReviewedPairRule>();
let runtimeStageRisks = new Map<string, ReviewedStageRiskProfile[]>();
let runtimeStatus: RuntimeCompatibilityStatus = {
  source: 'static-fallback',
  profiles: staticAudit.reviewedProfiles.length,
  pairRules: staticAudit.reviewedPairRules.length,
  stageRiskRules: staticAudit.reviewedStageRiskProfiles.length,
  authorityVersion: STATIC_AUTHORITY_VERSION,
};

const buildStaticStageRiskMap = () => {
  const map = new Map<string, ReviewedStageRiskProfile[]>();
  for (const rule of staticAudit.reviewedStageRiskProfiles) {
    map.set(rule.speciesId, [...(map.get(rule.speciesId) || []), cloneStageRisk(rule)]);
  }
  return map;
};

export const resetRuntimeCompatibilityEvidence = (reason?: string) => {
  runtimeProfiles = new Map(staticAudit.reviewedProfiles.map(profile => [profile.speciesId, cloneProfile(profile)]));
  runtimePairRules = new Map(staticAudit.reviewedPairRules.map(rule => [pairKey(...rule.speciesIds), clonePairRule(rule)]));
  runtimeStageRisks = buildStaticStageRiskMap();
  runtimeStatus = {
    source: 'static-fallback',
    profiles: runtimeProfiles.size,
    pairRules: runtimePairRules.size,
    stageRiskRules: Array.from(runtimeStageRisks.values()).reduce((sum, rules) => sum + rules.length, 0),
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
  if (!payload.profiles.every(profile => (
    profile.reviewStatus === 'reviewed'
    && reviewedCitations(profile.citations)
    && Array.isArray(profile.requiredFacts)
    && Array.isArray(profile.stageRiskRules)
    && profile.stageRiskRules.every(rule => rule.reviewStatus === 'reviewed' && reviewedCitations(rule.citations))
  ))) return false;
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
  requiredFacts: [...profile.requiredFacts],
  ...(profile.stockingGuidance ? { stockingGuidance: {
    ...profile.stockingGuidance,
    constraints: [...profile.stockingGuidance.constraints],
    evidenceIds: [...profile.stockingGuidance.evidenceIds],
  } } : {}),
});
const toRuntimeStageRisk = (catalogKey: string, rule: ReviewedCompatibilityStageRiskRuleDto): ReviewedStageRiskProfile => ({
  speciesId: catalogKey,
  youngerStages: [...rule.youngerStages],
  olderStages: [...rule.olderStages],
  verdict: rule.verdict,
  riskType: rule.riskType as ReviewedStageRiskProfile['riskType'],
  reason: rule.reason,
  mitigation: [...rule.mitigation],
  basis: rule.basis,
  confidence: rule.confidence,
  reviewStatus: rule.reviewStatus,
  affectedSpeciesIds: [catalogKey],
  citations: rule.citations.map(source => ({ ...source })),
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
    resetRuntimeCompatibilityEvidence('incomplete_or_mismatched_reviewed_authority');
    return getRuntimeCompatibilityStatus();
  }
  runtimeProfiles = new Map(payload.profiles.map(profile => [profile.catalogKey, toRuntimeProfile(profile)]));
  runtimePairRules = new Map(payload.pairRules.map(rule => [pairKey(...rule.catalogKeys), toRuntimePairRule(rule)]));
  runtimeStageRisks = new Map(payload.profiles.map(profile => [
    profile.catalogKey,
    profile.stageRiskRules.map(rule => toRuntimeStageRisk(profile.catalogKey, rule)),
  ]));
  runtimeStatus = {
    source: payload.authority,
    profiles: runtimeProfiles.size,
    pairRules: runtimePairRules.size,
    stageRiskRules: Array.from(runtimeStageRisks.values()).reduce((sum, rules) => sum + rules.length, 0),
    authorityVersion: reviewedAuthorityVersion(payload),
  };
  return getRuntimeCompatibilityStatus();
};

export const getRuntimeReviewedCompatibilityProfile = (speciesId: string) => runtimeProfiles.get(speciesId);
export const getRuntimeReviewedCompatibilityStageRisks = (speciesId: string) => (runtimeStageRisks.get(speciesId) || []).map(cloneStageRisk);
export const getRuntimeReviewedPairRule = (leftId: string, rightId: string) => runtimePairRules.get(pairKey(leftId, rightId));
export const getRuntimeCompatibilityStatus = () => ({ ...runtimeStatus });
export const getRuntimeCompatibilityEvidenceAudit = () => ({
  reviewedProfiles: Array.from(runtimeProfiles.values()).map(cloneProfile),
  reviewedStageRiskProfiles: Array.from(runtimeStageRisks.values()).flat().map(cloneStageRisk),
  reviewedPairRules: Array.from(runtimePairRules.values()).map(clonePairRule),
  reviewedSpeciesIds: Array.from(runtimeProfiles.keys()),
  status: getRuntimeCompatibilityStatus(),
});
export const resetRuntimeCompatibilityEvidenceForTest = () => resetRuntimeCompatibilityEvidence('test_reset');

resetRuntimeCompatibilityEvidence();
