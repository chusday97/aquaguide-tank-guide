import { fishData } from '../../data/fishData';
import { getApprovedCatalogFieldReviews } from '../../data/catalogFieldReviews';
import { getCatalogCanonicalIdentity, isReviewedColorOnlyVariantKey } from '../../data/catalogCanonicalIdentity';
import { getCompatibilityVariantFieldResearchPolicy } from '../../data/compatibilityVariantFieldResearchPolicy';
import {
  COMPATIBILITY_HARD_DECISION_FIELDS,
  buildCompatibilityCoreFieldCoverage,
} from './compatibility-field-coverage.service';

export type VariantHoldClass =
  | 'color_only_identity_candidate'
  | 'morphology_variant'
  | 'trade_or_lineage_label'
  | 'size_grade_or_trade_label';

export type VariantMorphologySignal =
  | 'fin_shape'
  | 'body_shape'
  | 'head_or_eye_structure';

export type VariantIdentityReviewState =
  | 'missing'
  | 'reviewed_supported'
  | 'reviewed_unknown';

export type VariantIntakePipelineStage =
  | 'identity_review_pending'
  | 'identity_evidence_ceiling'
  | 'canonical_bridge_pending'
  | 'field_policy_pending'
  | 'field_review_pending';

const variantIntakeStageOrder: VariantIntakePipelineStage[] = [
  'identity_review_pending',
  'identity_evidence_ceiling',
  'canonical_bridge_pending',
  'field_policy_pending',
  'field_review_pending',
];

const authoritativeStatuses = new Set(['reviewed_supported', 'reviewed_neutral_or_negative']);

const variantSuffix = (scientificName: string) => (
  scientificName.split(/\bvar\.\s*/i)[1]?.trim() ?? ''
);

export const extractVariantBaseTaxonCandidate = (scientificName: string) => {
  const [base] = scientificName.split(/\bvar\.\s*/i);
  return base?.trim() || scientificName.trim();
};

export const detectVariantMorphologySignals = (
  scientificName: string,
  name: string,
): VariantMorphologySignal[] => {
  const suffix = variantSuffix(scientificName);
  const normalized = `${suffix} ${name}`.toLowerCase();
  const signals: VariantMorphologySignal[] = [];

  if (/longfin|long fin|high fin|halfmoon|crowntail|crown|dumbo|butterfly|长鳍|大帆|高鳍|半月|冠尾|蝶尾|大耳/.test(normalized)) {
    signals.push('fin_shape');
  }
  if (/ranchu|oranda|telescope|tigerhead|black moor|balloon|jellybean|兰寿|狮头|龙睛|虎头|球形|皮球|短身|短尾/.test(normalized)) {
    signals.push('body_shape');
  }
  if (/ranchu|oranda|telescope|tigerhead|black moor|兰寿|狮头|龙睛|虎头/.test(normalized)) {
    signals.push('head_or_eye_structure');
  }

  return signals;
};

const hasColorLikeModifier = (scientificName: string, name: string) => {
  const suffix = variantSuffix(scientificName);
  const normalized = `${suffix} ${name}`.toLowerCase();
  return /albino|gold|green|red|blue|black|white|platinum|calico|panda|chocolate|orange|kohaku|glo|白|黑|红|蓝|金|五花|熊猫|巧克力|荧光/.test(normalized);
};

const getVariantIdentityReviewState = (speciesId: string): VariantIdentityReviewState => {
  const latestIdentityReview = getApprovedCatalogFieldReviews(speciesId)
    .filter(review => review.field === 'identity')
    .at(-1);
  if (!latestIdentityReview) return 'missing';
  return latestIdentityReview.resolution === 'supported'
    ? 'reviewed_supported'
    : 'reviewed_unknown';
};

export const classifyCompatibilityVariantHold = (
  scientificName: string,
  name: string,
): VariantHoldClass => {
  const suffix = variantSuffix(scientificName);
  const normalized = `${suffix} ${name}`.toLowerCase();

  // Morphology-sensitive labels always win over color tokens. Inspect both the
  // scientific variant suffix and localized catalog name: commercial names may
  // encode body/fin form only in Chinese (for example 半月 or 皮球).
  if (/longfin|long fin|high fin|halfmoon|crowntail|crown|dumbo|ranchu|oranda|telescope|tigerhead|butterfly|black moor|balloon|jellybean|长鳍|大帆|高鳍|半月|冠尾|狮头|兰寿|龙睛|蝶尾|虎头|球形|皮球|短身/.test(normalized)) {
    return 'morphology_variant';
  }
  if (/^xl$/i.test(suffix)) return 'size_grade_or_trade_label';

  // A color-looking suffix is not enough when the catalog/common name signals
  // a commercial lineage or hybrid identity. These stay fail-closed until the
  // lineage itself is reviewed.
  if (/鹦鹉|parrot|hybrid|crossbreed|cross-bred/.test(normalized)) {
    return 'trade_or_lineage_label';
  }

  if (isReviewedColorOnlyVariantKey(suffix)) return 'color_only_identity_candidate';
  return 'trade_or_lineage_label';
};

export const buildCompatibilityVariantHoldClassification = () => {
  const coverage = buildCompatibilityCoreFieldCoverage();
  const rowById = new Map(coverage.rows.map(row => [row.speciesId, row]));

  const held = coverage.backlog
    .filter(item => item.field === 'predation')
    .flatMap(item => {
      const row = rowById.get(item.speciesId);
      const species = fishData.find(entry => entry.id === item.speciesId);
      if (!row || !species) return [];

      const unresolvedHard = COMPATIBILITY_HARD_DECISION_FIELDS
        .filter(field => !authoritativeStatuses.has(row.fields[field].status))
        .map(field => row.fields[field]);

      const identityOrVariantHeld = unresolvedHard.length > 0
        && unresolvedHard.every(cell => (
          cell.authoritySource === 'identity_boundary'
          || cell.authoritySource === 'variant_evidence_ceiling'
        ));
      if (!identityOrVariantHeld) return [];

      const suffix = variantSuffix(species.scientificName);
      const classification = classifyCompatibilityVariantHold(species.scientificName, species.name);
      const identityReviewState = getVariantIdentityReviewState(species.id);
      const canonicalIdentity = getCatalogCanonicalIdentity(species.id);
      const researchPolicy = getCompatibilityVariantFieldResearchPolicy(species.id);
      const pipelineStage: VariantIntakePipelineStage = identityReviewState === 'missing'
        ? 'identity_review_pending'
        : identityReviewState === 'reviewed_unknown'
          ? 'identity_evidence_ceiling'
          : !canonicalIdentity
            ? 'canonical_bridge_pending'
            : !researchPolicy
              ? 'field_policy_pending'
              : 'field_review_pending';
      const morphologySignals = classification === 'morphology_variant'
        ? detectVariantMorphologySignals(species.scientificName, species.name)
        : [];
      const compoundVariantLabel = classification === 'morphology_variant'
        && (morphologySignals.length > 1 || hasColorLikeModifier(species.scientificName, species.name));

      return [{
        speciesId: species.id,
        name: species.name,
        scientificName: species.scientificName,
        variantSuffix: suffix,
        candidateBaseScientificName: extractVariantBaseTaxonCandidate(species.scientificName),
        classification,
        morphologySignals,
        compoundVariantLabel,
        identityReviewState,
        canonicalBridgePresent: Boolean(canonicalIdentity),
        researchPolicyPresent: Boolean(researchPolicy),
        pipelineStage,
        activeFieldReviewFields: pipelineStage === 'field_review_pending'
          ? Object.entries(row.fields)
            .filter(([, cell]) => cell.disposition === 'targeted_source_expansion')
            .map(([field]) => field)
          : [],
        deferredFieldReviewFields: pipelineStage === 'field_review_pending'
          ? Object.entries(row.fields)
            .filter(([, cell]) => cell.disposition === 'terminal_hold')
            .map(([field]) => field)
          : [],
        candidateForAutomaticInheritance: false,
        nextAction: pipelineStage === 'identity_review_pending'
          ? 'review_exact_variant_identity_before_field_research'
          : pipelineStage === 'identity_evidence_ceiling'
            ? 'resolve_identity_evidence_conflict_or_keep_terminal_hold'
            : pipelineStage === 'canonical_bridge_pending'
              ? 'wire_supported_identity_into_reviewed_canonical_bridge'
              : pipelineStage === 'field_policy_pending'
                ? 'define_reviewed_field_research_policy_after_identity_bridge'
                : 'execute_reviewed_field_research_policy_without_granting_inheritance',
      }];
    })
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

  const byClass = held.reduce<Record<VariantHoldClass, number>>((acc, item) => {
    acc[item.classification] += 1;
    return acc;
  }, {
    color_only_identity_candidate: 0,
    morphology_variant: 0,
    trade_or_lineage_label: 0,
    size_grade_or_trade_label: 0,
  });

  const stageSummary = variantIntakeStageOrder.reduce<Record<VariantIntakePipelineStage, number>>((acc, stage) => {
    acc[stage] = held.filter(item => item.pipelineStage === stage).length;
    return acc;
  }, {
    identity_review_pending: 0,
    identity_evidence_ceiling: 0,
    canonical_bridge_pending: 0,
    field_policy_pending: 0,
    field_review_pending: 0,
  });

  const taxonClusterMap = new Map<string, typeof held>();
  for (const item of held) {
    const current = taxonClusterMap.get(item.candidateBaseScientificName) ?? [];
    current.push(item);
    taxonClusterMap.set(item.candidateBaseScientificName, current);
  }
  const taxonClusters = [...taxonClusterMap.entries()]
    .map(([candidateBaseScientificName, items]) => ({
      candidateBaseScientificName,
      catalogObjectCount: items.length,
      speciesIds: items.map(item => item.speciesId).sort(),
      classifications: items.reduce<Record<VariantHoldClass, number>>((acc, item) => {
        acc[item.classification] += 1;
        return acc;
      }, {
        color_only_identity_candidate: 0,
        morphology_variant: 0,
        trade_or_lineage_label: 0,
        size_grade_or_trade_label: 0,
      }),
      missingIdentityReviewCatalogObjects: items.filter(item => item.identityReviewState === 'missing').length,
      reviewedSupportedIdentityCatalogObjects: items.filter(item => item.identityReviewState === 'reviewed_supported').length,
      canonicalBridgeCatalogObjects: items.filter(item => item.canonicalBridgePresent).length,
      pipelineStages: variantIntakeStageOrder.reduce<Record<VariantIntakePipelineStage, number>>((acc, stage) => {
        acc[stage] = items.filter(item => item.pipelineStage === stage).length;
        return acc;
      }, {
        identity_review_pending: 0,
        identity_evidence_ceiling: 0,
        canonical_bridge_pending: 0,
        field_policy_pending: 0,
        field_review_pending: 0,
      }),
      nextAction: items.some(item => item.pipelineStage === 'identity_review_pending')
        ? 'batch_exact_object_identity_review_with_parent_taxon_context'
        : items.some(item => item.pipelineStage === 'identity_evidence_ceiling')
          ? 'review_identity_evidence_ceiling_before_any_field_work'
          : items.some(item => item.pipelineStage === 'canonical_bridge_pending')
            ? 'wire_reviewed_identity_bridges_before_field_work'
            : items.some(item => item.pipelineStage === 'field_policy_pending')
              ? 'define_reviewed_field_policies_without_runtime_inheritance'
              : 'execute_field_review_queue_without_runtime_inheritance',
    }))
    .sort((a, b) => b.catalogObjectCount - a.catalogObjectCount
      || a.candidateBaseScientificName.localeCompare(b.candidateBaseScientificName));

  const stageQueue = variantIntakeStageOrder
    .map(stage => {
      const stageItems = held.filter(item => item.pipelineStage === stage);
      const parentTaxonBatches = taxonClusters
        .map(cluster => {
          const speciesIds = cluster.speciesIds.filter(speciesId => (
            stageItems.some(item => item.speciesId === speciesId)
          ));
          return {
            candidateBaseScientificName: cluster.candidateBaseScientificName,
            catalogObjectCount: speciesIds.length,
            reviewedSupportedIdentityContext: cluster.reviewedSupportedIdentityCatalogObjects,
            canonicalBridgeContext: cluster.canonicalBridgeCatalogObjects,
            speciesIds,
          };
        })
        .filter(batch => batch.catalogObjectCount > 0)
        .sort((a, b) => b.reviewedSupportedIdentityContext - a.reviewedSupportedIdentityContext
          || b.canonicalBridgeContext - a.canonicalBridgeContext
          || b.catalogObjectCount - a.catalogObjectCount
          || a.candidateBaseScientificName.localeCompare(b.candidateBaseScientificName));
      return {
        stage,
        catalogObjectCount: stageItems.length,
        speciesIds: stageItems.map(item => item.speciesId),
        parentTaxonBatches,
      };
    })
    .filter(stage => stage.catalogObjectCount > 0);

  return {
    version: 3,
    invariant: 'Variant intake may batch research by candidate parent taxon and morphology signal, but parsed labels never grant canonical identity, field inheritance, or safety authority.',
    policy: {
      colorOnlyRequiresReviewedIdentityBridge: true,
      morphologyAutoInheritanceAllowed: false,
      tradeLabelAutoInheritanceAllowed: false,
      sizeGradeAutoInheritanceAllowed: false,
      parsedBaseTaxonIsCandidateOnly: true,
      morphologySignalsAreTriageOnly: true,
      exactObjectIdentityEvidenceRequired: true,
      clusterResearchNeverGrantsSharedVariantIdentity: true,
      pairPrecomputationRequired: false,
    },
    summary: {
      heldCatalogObjects: held.length,
      ...byClass,
      missingIdentityReviewCatalogObjects: held.filter(item => item.identityReviewState === 'missing').length,
      reviewedSupportedIdentityCatalogObjects: held.filter(item => item.identityReviewState === 'reviewed_supported').length,
      canonicalBridgeCatalogObjects: held.filter(item => item.canonicalBridgePresent).length,
      fieldResearchPolicyCatalogObjects: held.filter(item => item.researchPolicyPresent).length,
      pipelineStages: stageSummary,
      candidateBaseTaxonClusters: taxonClusters.length,
      multiObjectCandidateBaseTaxonClusters: taxonClusters.filter(cluster => cluster.catalogObjectCount > 1).length,
    },
    priority: [
      'color_only_identity_candidate',
      'trade_or_lineage_label',
      'morphology_variant',
      'size_grade_or_trade_label',
    ] as VariantHoldClass[],
    stageQueue,
    taxonClusters,
    items: held,
  };
};
