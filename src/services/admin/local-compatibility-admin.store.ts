import {
  compatibilityPairRuleRevisionInputSchema,
  compatibilityProfileRevisionInputSchema,
  compatibilityRevisionReviewMutationSchema,
  type CompatibilityPairRuleRevisionInput,
  type ReviewedCompatibilityPairRuleDto,
  type ReviewedCompatibilityProfileDto,
} from '../../../packages/contracts/src';
import { getCompatibilityEvidenceAudit } from '../../data/compatibilityEvidence';
import { applyReviewedCompatibilityBootstrap, type CompatibilityBootstrapResponse } from '../../data/runtimeCompatibilityRegistry';
import { AquaGuideApiError } from '../api/api-client';
import type {
  AdminCompatibilityPairRuleRevision,
  AdminCompatibilityPairRuleRevisionWorkspace,
  AdminCompatibilityProfileRevision,
  AdminCompatibilityProfileRevisionWorkspace,
  CompatibilityProfileDraftInput,
} from './compatibility-admin.service';
import { localBusinessAdminStore } from './local-business-admin.store';
import { buildLocalPairRegression, buildLocalProfileRegression } from './local-compatibility-regression';

const STORAGE_KEY = 'aquaguide-local-compatibility-admin-v1';
const now = () => new Date().toISOString();
type LocalCompatibilityState = {
  schemaVersion: 1;
  profileRevisions: AdminCompatibilityProfileRevision[];
  pairRevisions: AdminCompatibilityPairRuleRevision[];
  reviewedProfiles: ReviewedCompatibilityProfileDto[];
  reviewedPairRules: ReviewedCompatibilityPairRuleDto[];
  authoritySequence: number;
  updatedAt: string;
};

const clone = <T>(value: T): T => structuredClone(value);
const pairKey = (left: string, right: string) => [left, right].sort().join('__');
const makeId = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const staticAudit = getCompatibilityEvidenceAudit();

const runtimeCitation = (source: (typeof staticAudit.reviewedProfiles)[number]['citations'][number]) => ({
  id: source.id, title: source.title, publisher: source.publisher, url: source.url,
  sourceType: source.sourceType, reviewStatus: 'reviewed' as const, version: 1,
});

const buildSeedState = (): LocalCompatibilityState => ({
  schemaVersion: 1,
  profileRevisions: [], pairRevisions: [], authoritySequence: 1, updatedAt: now(),
  reviewedProfiles: staticAudit.reviewedProfiles.map(profile => ({
    catalogKey: profile.speciesId,
    behaviorTraits: [...profile.behaviorTraits], minimumGroupSize: profile.minimumGroupSize,
    predationTargets: [...profile.predationTargets], confidence: profile.confidence,
    reviewStatus: 'reviewed', citations: profile.citations.map(runtimeCitation), version: 1,
  })),
  reviewedPairRules: staticAudit.reviewedPairRules.map(rule => ({
    catalogKeys: [...rule.speciesIds].sort() as [string, string], verdict: rule.verdict,
    riskType: rule.riskType, reason: rule.reason, mitigation: [...rule.mitigation], basis: rule.basis,
    confidence: rule.confidence, reviewStatus: 'reviewed', citations: rule.citations.map(runtimeCitation), version: 1,
  })),
});

const readState = (): LocalCompatibilityState => {
  if (typeof window === 'undefined') return buildSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as LocalCompatibilityState;
    if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.reviewedProfiles) || !Array.isArray(parsed.reviewedPairRules)) throw new Error('invalid local compatibility store');
    return parsed;
  } catch {
    const seeded = buildSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writeState = (state: LocalCompatibilityState) => {
  state.updatedAt = now();
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const bootstrapFromState = (state: LocalCompatibilityState): CompatibilityBootstrapResponse => ({
  authority: 'reviewed-db',
  profiles: clone(state.reviewedProfiles), pairRules: clone(state.reviewedPairRules),
  counts: { profiles: state.reviewedProfiles.length, pairRules: state.reviewedPairRules.length },
});

const assertVersion = (actual: number, expected: number) => {
  if (actual !== expected) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '本地 Compatibility revision 已变化，请刷新后重试。');
};
const impactReport = (kind: 'profile' | 'pair_rule', baselineVersion: number, draft: Record<string, unknown>, baseline: Record<string, unknown>, fields: string[]) => {
  const changes = fields.flatMap(field => JSON.stringify(draft[field] ?? null) === JSON.stringify(baseline[field] ?? null)
    ? [] : [{ field, before: baseline[field] ?? null, after: draft[field] ?? null }]);
  return { kind, baselineVersion, changedFields: changes.map(change => change.field), changes };
};

const resolveEvidence = (citations: Array<{ sourceKey: string }>) => citations.map(source => ({
  sourceKey: source.sourceKey, sourceId: source.sourceKey, version: 1,
}));

const speciesIdentity = async (catalogKey: string) => {
  const rows = await localBusinessAdminStore.listSpecies();
  const row = rows.find(item => item.catalogKey === catalogKey);
  if (!row) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', `本地 Product store 缺少 Compatibility 物种 ${catalogKey}。`);
  return { catalogKey: row.catalogKey, name: row.name, scientificName: row.scientificName };
};

const activeProfileRevision = (state: LocalCompatibilityState, catalogKey: string) => state.profileRevisions.find(item =>
  item.species.catalogKey === catalogKey && ['draft', 'pending_review', 'approved'].includes(item.status));
const activePairRevision = (state: LocalCompatibilityState, key: string) => state.pairRevisions.find(item =>
  pairKey(item.speciesA.catalogKey, item.speciesB.catalogKey) === key && ['draft', 'pending_review', 'approved'].includes(item.status));
const profileRegressionFor = async (state: LocalCompatibilityState, revision: AdminCompatibilityProfileRevision) => {
  const baseline = state.reviewedProfiles.find(item => item.catalogKey === revision.species.catalogKey);
  if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Profile baseline 不存在。');
  return buildLocalProfileRegression({
    authority: bootstrapFromState(state), fish: await localBusinessAdminStore.getPublishedCompatibilityFish(),
    authoritySequence: state.authoritySequence, catalogKey: revision.species.catalogKey,
    baselineVersion: baseline.version, behaviorTraits: revision.behaviorTraits,
    minimumGroupSize: revision.minimumGroupSize, predationTargets: revision.predationTargets,
    confidence: revision.confidence, sourceKeys: revision.citationSnapshots.map(source => source.sourceKey),
  });
};

const pairRegressionFor = async (state: LocalCompatibilityState, revision: AdminCompatibilityPairRuleRevision) => {
  const key = pairKey(revision.speciesA.catalogKey, revision.speciesB.catalogKey);
  const baseline = state.reviewedPairRules.find(item => pairKey(...item.catalogKeys) === key);
  if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Pair Rule baseline 不存在。');
  return buildLocalPairRegression({
    authority: bootstrapFromState(state), fish: await localBusinessAdminStore.getPublishedCompatibilityFish(),
    authoritySequence: state.authoritySequence, catalogKeys: [...baseline.catalogKeys] as [string, string],
    baselineVersion: baseline.version, verdict: revision.verdict, riskType: revision.riskType, reason: revision.reason,
    mitigation: revision.mitigation, basis: revision.basis, confidence: revision.confidence,
    sourceKeys: revision.citationSnapshots.map(source => source.sourceKey),
  });
};
const regressionFresh = (stored: AdminCompatibilityProfileRevision['regressionReport'] | AdminCompatibilityPairRuleRevision['regressionReport'] | undefined,
  fresh: NonNullable<AdminCompatibilityProfileRevision['regressionReport']>) => Boolean(stored
    && stored.kind === fresh.kind && stored.targetKey === fresh.targetKey
    && stored.baselineVersion === fresh.baselineVersion && stored.authoritySequence === fresh.authoritySequence
    && stored.engineVersion === fresh.engineVersion && stored.catalogFingerprint === fresh.catalogFingerprint
    && stored.regressionDigest === fresh.regressionDigest && stored.evaluatedScenarios === fresh.evaluatedScenarios
    && stored.changedScenarios === fresh.changedScenarios);

const assertReviewArtifacts = (revision: AdminCompatibilityProfileRevision | AdminCompatibilityPairRuleRevision) => {
  if (!revision.impactReport?.changedFields?.length) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 Compatibility 缺少有效 Impact 变更。');
  if (!revision.regressionReport?.evaluatedScenarios) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 Compatibility 缺少真实 Regression。');
  if (!revision.citationSnapshots.length || (revision.evidenceResolution?.length || 0) !== revision.citationSnapshots.length) {
    throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 Compatibility Evidence 尚未完整解析。');
  }
};

const assertRegressionFresh = async (state: LocalCompatibilityState, revision: AdminCompatibilityProfileRevision | AdminCompatibilityPairRuleRevision) => {
  const fresh = 'species' in revision ? await profileRegressionFor(state, revision) : await pairRegressionFor(state, revision);
  if (!regressionFresh(revision.regressionReport, fresh)) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '本地 Compatibility Regression 已过期，请重新提交审核。');
};

const runtimeCitations = (revision: AdminCompatibilityProfileRevision | AdminCompatibilityPairRuleRevision) => revision.citationSnapshots.map(source => ({
  id: source.sourceKey,
  title: source.title,
  publisher: source.publisher,
  url: source.url,
  sourceType: source.sourceType,
  reviewStatus: 'reviewed' as const,
  version: revision.evidenceResolution?.find(item => item.sourceKey === source.sourceKey)?.version || 1,
}));

const assertReviewedCitations = (citations: Array<{ reviewStatus: string }>) => {
  if (!citations.length || citations.some(source => source.reviewStatus !== 'reviewed')) {
    throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '提交审核前必须保留至少一项 reviewed evidence。');
  }
};

export const localCompatibilityAdminStore = {
  listProfileRevisions: async (): Promise<AdminCompatibilityProfileRevisionWorkspace> => ({
    revisions: clone(readState().profileRevisions),
    writableCatalogKeys: staticAudit.reviewedProfiles.map(profile => profile.speciesId),
  }),

  listPairRuleRevisions: async (): Promise<AdminCompatibilityPairRuleRevisionWorkspace> => ({
    revisions: clone(readState().pairRevisions),
    writablePairKeys: staticAudit.reviewedPairRules.map(rule => pairKey(...rule.speciesIds)),
  }),

  getBootstrap: async () => bootstrapFromState(readState()),

  createProfileRevision: async (raw: CompatibilityProfileDraftInput) => {
    const input = compatibilityProfileRevisionInputSchema.parse(raw);
    const state = readState();
    if (activeProfileRevision(state, input.catalogKey)) throw new AquaGuideApiError(409, 'DUPLICATE_RESOURCE', '该 Compatibility Profile 已有活动 revision。');
    const baseline = state.reviewedProfiles.find(item => item.catalogKey === input.catalogKey);
    if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Profile baseline 不存在。');
    const species = await speciesIdentity(input.catalogKey);
    const revisionNumber = Math.max(0, ...state.profileRevisions.filter(item => item.species.catalogKey === input.catalogKey).map(item => item.revisionNumber)) + 1;
    const revision: AdminCompatibilityProfileRevision = {
      id: makeId(), speciesId: input.catalogKey, revisionNumber, baseProfileVersion: baseline.version,
      behaviorTraits: [...input.behaviorTraits], minimumGroupSize: input.minimumGroupSize ?? null,
      predationTargets: [...input.predationTargets], confidence: input.confidence, status: 'draft',
      citationSnapshots: clone(input.citations), version: 1, species,
    };
    state.profileRevisions.unshift(revision); writeState(state); return clone(revision);
  },

  updateProfileRevision: async (id: string, version: number, input: Partial<CompatibilityProfileDraftInput>) => {
    const state = readState();
    const index = state.profileRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Profile revision 不存在。');
    const current = state.profileRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'draft') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有 Draft Profile revision 可以编辑。');
    const parsed = compatibilityProfileRevisionInputSchema.parse({
      catalogKey: current.species.catalogKey, behaviorTraits: current.behaviorTraits,
      minimumGroupSize: current.minimumGroupSize, predationTargets: current.predationTargets,
      confidence: current.confidence, citations: current.citationSnapshots, ...input,
    });
    const next: AdminCompatibilityProfileRevision = {
      ...current, behaviorTraits: [...parsed.behaviorTraits], minimumGroupSize: parsed.minimumGroupSize ?? null,
      predationTargets: [...parsed.predationTargets], confidence: parsed.confidence, citationSnapshots: clone(parsed.citations),
      impactReport: undefined, regressionReport: undefined, evidenceResolution: undefined, impactCheckedAt: undefined,
      version: current.version + 1,
    };
    state.profileRevisions[index] = next; writeState(state); return clone(next);
  },

  submitProfileRevision: async (id: string, version: number) => {
    const state = readState();
    const index = state.profileRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Profile revision 不存在。');
    const current = state.profileRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'draft') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有 Draft Profile revision 可以提交审核。');
    assertReviewedCitations(current.citationSnapshots);
    const baseline = state.reviewedProfiles.find(item => item.catalogKey === current.species.catalogKey);
    if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Profile baseline 不存在。');
    const report = impactReport('profile', baseline.version,
      { behavior_traits: current.behaviorTraits, minimum_group_size: current.minimumGroupSize, predation_targets: current.predationTargets, confidence: current.confidence },
      { behavior_traits: baseline.behaviorTraits, minimum_group_size: baseline.minimumGroupSize ?? null, predation_targets: baseline.predationTargets, confidence: baseline.confidence },
      ['behavior_traits', 'minimum_group_size', 'predation_targets', 'confidence']);
    if (!report.changedFields.length) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '没有实际 Profile 变更，不能提交审核。');
    const regressionReport = await profileRegressionFor(state, current);
    const next: AdminCompatibilityProfileRevision = {
      ...current, status: 'pending_review', impactReport: report, regressionReport,
      evidenceResolution: resolveEvidence(current.citationSnapshots), impactCheckedAt: now(), version: current.version + 1,
    };
    state.profileRevisions[index] = next; writeState(state); return clone(next);
  },

  reviewProfileRevision: async (id: string, raw: Parameters<typeof compatibilityRevisionReviewMutationSchema.parse>[0]) => {
    const input = compatibilityRevisionReviewMutationSchema.parse(raw);
    const state = readState();
    const index = state.profileRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Profile revision 不存在。');
    const current = state.profileRevisions[index];
    assertVersion(current.version, input.version);
    if (current.status !== 'pending_review') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有待审核 Profile revision 可以审核。');
    assertReviewArtifacts(current);
    if (input.decision === 'approve') await assertRegressionFresh(state, current);
    const next: AdminCompatibilityProfileRevision = {
      ...current, status: input.decision === 'approve' ? 'approved' : 'rejected',
      reviewNote: input.note?.trim() || null, version: current.version + 1,
    };
    state.profileRevisions[index] = next; writeState(state); return clone(next);
  },

  publishProfileRevision: async (id: string, version: number) => {
    const state = readState();
    const index = state.profileRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Profile revision 不存在。');
    const current = state.profileRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'approved') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有已批准 Profile revision 可以发布。');
    assertReviewArtifacts(current); await assertRegressionFresh(state, current);
    const baselineIndex = state.reviewedProfiles.findIndex(item => item.catalogKey === current.species.catalogKey);
    if (baselineIndex < 0) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Profile baseline 不存在。');
    const baseline = state.reviewedProfiles[baselineIndex];
    state.reviewedProfiles[baselineIndex] = {
      catalogKey: current.species.catalogKey, behaviorTraits: [...current.behaviorTraits],
      minimumGroupSize: current.minimumGroupSize ?? undefined, predationTargets: [...current.predationTargets],
      confidence: current.confidence, reviewStatus: 'reviewed', citations: runtimeCitations(current), version: baseline.version + 1,
    };
    state.profileRevisions = state.profileRevisions.map(item => item.id !== current.id && item.species.catalogKey === current.species.catalogKey && item.status === 'published'
      ? { ...item, status: 'superseded' as const, version: item.version + 1 } : item);
    const next = { ...current, status: 'published' as const, version: current.version + 1 };
    const updatedIndex = state.profileRevisions.findIndex(item => item.id === id);
    state.profileRevisions[updatedIndex] = next;
    state.authoritySequence += 1;
    const runtimeStatus = applyReviewedCompatibilityBootstrap(bootstrapFromState(state));
    if (runtimeStatus.source !== 'reviewed-db') throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed runtime 未接受新的 Profile authority。');
    writeState(state); return clone(next);
  },

  createPairRuleRevision: async (raw: CompatibilityPairRuleRevisionInput) => {
    const input = compatibilityPairRuleRevisionInputSchema.parse(raw);
    const state = readState();
    const key = pairKey(input.catalogKeyA, input.catalogKeyB);
    if (activePairRevision(state, key)) throw new AquaGuideApiError(409, 'DUPLICATE_RESOURCE', '该 Compatibility Pair 已有活动 revision。');
    const baseline = state.reviewedPairRules.find(item => pairKey(...item.catalogKeys) === key);
    if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Pair Rule baseline 不存在。');
    const [speciesA, speciesB] = await Promise.all([speciesIdentity(input.catalogKeyA), speciesIdentity(input.catalogKeyB)]);
    const revisionNumber = Math.max(0, ...state.pairRevisions.filter(item => pairKey(item.speciesA.catalogKey, item.speciesB.catalogKey) === key).map(item => item.revisionNumber)) + 1;
    const revision: AdminCompatibilityPairRuleRevision = {
      id: makeId(), speciesAId: input.catalogKeyA, speciesBId: input.catalogKeyB, revisionNumber, baseRuleVersion: baseline.version,
      verdict: input.verdict, riskType: input.riskType, reason: input.reason, mitigation: [...input.mitigation], basis: input.basis,
      confidence: input.confidence, status: 'draft', citationSnapshots: clone(input.citations), version: 1, speciesA, speciesB,
    };
    state.pairRevisions.unshift(revision); writeState(state); return clone(revision);
  },

  updatePairRuleRevision: async (id: string, version: number, input: Partial<CompatibilityPairRuleRevisionInput>) => {
    const state = readState();
    const index = state.pairRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Pair Rule revision 不存在。');
    const current = state.pairRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'draft') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有 Draft Pair Rule revision 可以编辑。');
    const parsed = compatibilityPairRuleRevisionInputSchema.parse({
      catalogKeyA: current.speciesA.catalogKey, catalogKeyB: current.speciesB.catalogKey,
      verdict: current.verdict, riskType: current.riskType, reason: current.reason, mitigation: current.mitigation,
      basis: current.basis, confidence: current.confidence, citations: current.citationSnapshots, ...input,
    });
    const next: AdminCompatibilityPairRuleRevision = {
      ...current, verdict: parsed.verdict, riskType: parsed.riskType, reason: parsed.reason,
      mitigation: [...parsed.mitigation], basis: parsed.basis, confidence: parsed.confidence,
      citationSnapshots: clone(parsed.citations), impactReport: undefined, regressionReport: undefined,
      evidenceResolution: undefined, impactCheckedAt: undefined, version: current.version + 1,
    };
    state.pairRevisions[index] = next; writeState(state); return clone(next);
  },

  submitPairRuleRevision: async (id: string, version: number) => {
    const state = readState();
    const index = state.pairRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Pair Rule revision 不存在。');
    const current = state.pairRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'draft') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有 Draft Pair Rule revision 可以提交审核。');
    assertReviewedCitations(current.citationSnapshots);
    const key = pairKey(current.speciesA.catalogKey, current.speciesB.catalogKey);
    const baseline = state.reviewedPairRules.find(item => pairKey(...item.catalogKeys) === key);
    if (!baseline) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Pair Rule baseline 不存在。');
    const report = impactReport('pair_rule', baseline.version,
      { verdict: current.verdict, risk_type: current.riskType, reason: current.reason, mitigation: current.mitigation, basis: current.basis, confidence: current.confidence },
      { verdict: baseline.verdict, risk_type: baseline.riskType, reason: baseline.reason, mitigation: baseline.mitigation, basis: baseline.basis, confidence: baseline.confidence },
      ['verdict', 'risk_type', 'reason', 'mitigation', 'basis', 'confidence']);
    if (!report.changedFields.length) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '没有实际 Pair Rule 变更，不能提交审核。');
    const regressionReport = await pairRegressionFor(state, current);
    const next: AdminCompatibilityPairRuleRevision = {
      ...current, status: 'pending_review', impactReport: report, regressionReport,
      evidenceResolution: resolveEvidence(current.citationSnapshots), impactCheckedAt: now(), version: current.version + 1,
    };
    state.pairRevisions[index] = next; writeState(state); return clone(next);
  },

  reviewPairRuleRevision: async (id: string, raw: Parameters<typeof compatibilityRevisionReviewMutationSchema.parse>[0]) => {
    const input = compatibilityRevisionReviewMutationSchema.parse(raw);
    const state = readState();
    const index = state.pairRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Pair Rule revision 不存在。');
    const current = state.pairRevisions[index];
    assertVersion(current.version, input.version);
    if (current.status !== 'pending_review') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有待审核 Pair Rule revision 可以审核。');
    assertReviewArtifacts(current);
    if (input.decision === 'approve') await assertRegressionFresh(state, current);
    const next: AdminCompatibilityPairRuleRevision = {
      ...current, status: input.decision === 'approve' ? 'approved' : 'rejected',
      reviewNote: input.note?.trim() || null, version: current.version + 1,
    };
    state.pairRevisions[index] = next; writeState(state); return clone(next);
  },

  publishPairRuleRevision: async (id: string, version: number) => {
    const state = readState();
    const index = state.pairRevisions.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Pair Rule revision 不存在。');
    const current = state.pairRevisions[index];
    assertVersion(current.version, version);
    if (current.status !== 'approved') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有已批准 Pair Rule revision 可以发布。');
    assertReviewArtifacts(current); await assertRegressionFresh(state, current);
    const key = pairKey(current.speciesA.catalogKey, current.speciesB.catalogKey);
    const baselineIndex = state.reviewedPairRules.findIndex(item => pairKey(...item.catalogKeys) === key);
    if (baselineIndex < 0) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed Pair Rule baseline 不存在。');
    const baseline = state.reviewedPairRules[baselineIndex];
    state.reviewedPairRules[baselineIndex] = {
      catalogKeys: [...baseline.catalogKeys] as [string, string], verdict: current.verdict,
      riskType: current.riskType, reason: current.reason, mitigation: [...current.mitigation], basis: current.basis,
      confidence: current.confidence, reviewStatus: 'reviewed', citations: runtimeCitations(current), version: baseline.version + 1,
    };
    state.pairRevisions = state.pairRevisions.map(item => item.id !== current.id && pairKey(item.speciesA.catalogKey, item.speciesB.catalogKey) === key && item.status === 'published'
      ? { ...item, status: 'superseded' as const, version: item.version + 1 } : item);
    const next = { ...current, status: 'published' as const, version: current.version + 1 };
    const updatedIndex = state.pairRevisions.findIndex(item => item.id === id);
    state.pairRevisions[updatedIndex] = next;
    state.authoritySequence += 1;
    const runtimeStatus = applyReviewedCompatibilityBootstrap(bootstrapFromState(state));
    if (runtimeStatus.source !== 'reviewed-db') throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', '本地 reviewed runtime 未接受新的 Pair Rule authority。');
    writeState(state); return clone(next);
  },

  reset: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  },
};
