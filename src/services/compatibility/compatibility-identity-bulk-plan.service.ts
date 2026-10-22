import { fishData } from '../../data/fishData';
import { isCompatibilityIdentityReady } from '../../data/catalogCanonicalIdentity';
import {
  getCompatibilityCoreFieldCoverageRow,
} from './compatibility-field-coverage.service';
import {
  detectVariantMorphologySignals,
} from './compatibility-variant-hold-classification.service';
import {
  isExactBinomialTaxon,
  type IdentityBulkQueueManifest,
} from './identity-bulk-research.service';
import {
  buildCompatibilityIdentityDebtRoutingReport,
} from './compatibility-identity-debt-routing.service';

export type CompatibilityIdentityBulkQueueReport = IdentityBulkQueueManifest & {
  kind: 'compatibility_identity_debt_bulk_queue';
  promotionAllowed: false;
  writesAuthority: false;
  policy: {
    exactParentRequired: true;
    reviewedReadyParentRequired: true;
    evidenceCeilingExcluded: true;
    humanReviewRequired: true;
    noAutomaticBridge: true;
    noAutomaticInheritance: true;
  };
  summary: {
    identityDebtSpecies: number;
    evidenceCeilingSpecies: number;
    automatedResearchEligible: number;
    manualOrStructuralReview: number;
    automatedParentGroups: number;
    morphologyRiskAutomatedSpecies: number;
  };
};

export const buildCompatibilityIdentityBulkQueue = (): CompatibilityIdentityBulkQueueReport => {
  const identityDebt = buildCompatibilityIdentityDebtRoutingReport();
  const items = identityDebt.items.map(item => {
    const parentName = item.identityForm === 'variant_like'
      && item.candidateBaseScientificName
      && isExactBinomialTaxon(item.candidateBaseScientificName)
      ? item.candidateBaseScientificName
      : null;
    const parentObjects = parentName
      ? fishData.filter(candidate => (
          candidate.id !== item.speciesId
          && candidate.scientificName.trim() === parentName
        ))
      : [];
    const readyBaseSpeciesIds = parentObjects
      .filter(parent => isCompatibilityIdentityReady(
        getCompatibilityCoreFieldCoverageRow(parent).identityReadiness,
      ))
      .map(parent => parent.id)
      .sort();
    const baseCandidateSpeciesIds = parentObjects.map(parent => parent.id).sort();
    const evidenceCeiling = item.stage === 'reviewed_evidence_ceiling';
    const automatedResearchAllowed = (
      !evidenceCeiling
      && item.identityForm === 'variant_like'
      && Boolean(parentName)
      && readyBaseSpeciesIds.length > 0
    );
    const morphologyRisk = detectVariantMorphologySignals(item.scientificName, item.name).length > 0;

    return {
      speciesId: item.speciesId,
      name: item.name,
      scientificName: item.scientificName,
      queue: evidenceCeiling
        ? 'evidence_ceiling_hold'
        : automatedResearchAllowed
          ? 'exact_object_identity_research'
          : 'manual_identity_review',
      automatedResearchAllowed,
      readyBaseSpeciesIds,
      baseCandidateSpeciesIds,
      morphologyRisk,
      soleBoundaryIdentityUnknownPairs: 0,
      affectedIdentityUnknownPairs: 0,
    };
  }).sort((left, right) => (
    Number(right.automatedResearchAllowed) - Number(left.automatedResearchAllowed)
    || left.speciesId.localeCompare(right.speciesId)
  ));

  const automated = items.filter(item => item.automatedResearchAllowed);
  const groupKeys = new Set(
    automated.flatMap(item => item.readyBaseSpeciesIds.map(id => (
      fishData.find(candidate => candidate.id === id)?.scientificName
    )).filter((value): value is string => Boolean(value))),
  );

  return {
    kind: 'compatibility_identity_debt_bulk_queue',
    promotionAllowed: false,
    writesAuthority: false,
    policy: {
      exactParentRequired: true,
      reviewedReadyParentRequired: true,
      evidenceCeilingExcluded: true,
      humanReviewRequired: true,
      noAutomaticBridge: true,
      noAutomaticInheritance: true,
    },
    summary: {
      identityDebtSpecies: items.length,
      evidenceCeilingSpecies: items.filter(item => item.queue === 'evidence_ceiling_hold').length,
      automatedResearchEligible: automated.length,
      manualOrStructuralReview: items.length - automated.length,
      automatedParentGroups: groupKeys.size,
      morphologyRiskAutomatedSpecies: automated.filter(item => item.morphologyRisk).length,
    },
    items,
  };
};
