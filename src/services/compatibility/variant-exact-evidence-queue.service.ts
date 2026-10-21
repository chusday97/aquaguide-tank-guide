import { catalogCanonicalIdentities } from '../../data/catalogCanonicalIdentity';
import { getApprovedCatalogFieldReviews } from '../../data/catalogFieldReviews';
import { compatibilityVariantFieldResearchPolicies, getCompatibilityVariantFieldResearchPolicy } from '../../data/compatibilityVariantFieldResearchPolicy';
import { fishData } from '../../data/fishData';
import { buildCompatibilityCoreFieldCoverage } from './compatibility-field-coverage.service';
import { buildCompatibilityVariantEnvironmentBridgeReview } from './variant-bridge-review.service';

const fieldOrder = [
  'water',
  'temperature',
  'ph',
  'adult_size',
  'tank_size',
  'social_behavior',
  'territoriality',
  'predation',
] as const;

export type CompatibilityVariantExactEvidenceQueueItem = {
  speciesId: string;
  name: string;
  canonicalScientificName: string;
  variantKey: string;
  relationshipType: string;
  field: string;
  sourceLane: 'environment_bridge_hold' | 'exact_object_policy';
  reasonCode: string;
  researchGoal: string;
  promotionAllowed: false;
  writesAuthority: false;
};

export const buildCompatibilityVariantExactEvidenceQueue = () => {
  const bridge = buildCompatibilityVariantEnvironmentBridgeReview();
  const items: CompatibilityVariantExactEvidenceQueueItem[] = [];
  // This queue is the unresolved exact-evidence audit ledger. It intentionally
  // retains terminal holds as well as actionable gaps; execution must use the
  // actionable research queue below so stop conditions remain authoritative.
  const speciesIds = Object.keys(compatibilityVariantFieldResearchPolicies).sort();

  for (const speciesId of speciesIds) {
    const identity = catalogCanonicalIdentities[speciesId];
    const researchPolicy = getCompatibilityVariantFieldResearchPolicy(speciesId);
    const species = fishData.find(item => item.id === speciesId);
    if (!identity || !researchPolicy || !species) {
      throw new Error('compatibility_variant_exact_evidence_queue_authority_missing:' + speciesId);
    }
    const resolvedFields = new Set(
      getApprovedCatalogFieldReviews(speciesId).map(review => review.field),
    );

    for (const decision of bridge.decisions.filter(item => (
      item.speciesId === speciesId
      && item.decisionStatus === 'variant_specific_evidence_required'
      && !resolvedFields.has(item.field)
    ))) {
      items.push({
        speciesId,
        name: species.name,
        canonicalScientificName: identity.canonicalScientificName,
        variantKey: identity.variantKey,
        relationshipType: identity.relationshipType,
        field: decision.field,
        sourceLane: 'environment_bridge_hold',
        reasonCode: decision.reasonCode,
        researchGoal: 'Find exact variant/strain evidence that explicitly supports the ' + decision.field + ' field without relying only on the base taxon.',
        promotionAllowed: false,
        writesAuthority: false,
      });
    }

    for (const field of researchPolicy.exactObjectEvidenceFacts) {
      if (resolvedFields.has(field)) continue;
      items.push({
        speciesId,
        name: species.name,
        canonicalScientificName: identity.canonicalScientificName,
        variantKey: identity.variantKey,
        relationshipType: identity.relationshipType,
        field,
        sourceLane: 'exact_object_policy',
        reasonCode: 'exact_object_evidence_required',
        researchGoal: 'Find exact object/variant evidence for ' + field + '; base-taxon evidence is not sufficient for this field.',
        promotionAllowed: false,
        writesAuthority: false,
      });
    }
  }

  const uniqueKeys = new Set(items.map(item => item.speciesId + ':' + item.field));
  if (uniqueKeys.size !== items.length) {
    throw new Error('compatibility_variant_exact_evidence_queue_duplicate_slot');
  }

  items.sort((a, b) => (
    a.speciesId.localeCompare(b.speciesId)
    || fieldOrder.indexOf(a.field as typeof fieldOrder[number]) - fieldOrder.indexOf(b.field as typeof fieldOrder[number])
  ));

  const blockedCandidateContracts = bridge.decisions
    .filter(item => item.decisionStatus === 'blocked_by_candidate_contract')
    .map(item => ({
      speciesId: item.speciesId,
      field: item.field,
      reasonCode: item.reasonCode,
      candidateSourceId: item.candidateSourceId,
    }))
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId) || a.field.localeCompare(b.field));

  return {
    version: 1,
    kind: 'compatibility_variant_exact_evidence_queue',
    policy: {
      promotionAllowed: false,
      writesAuthority: false,
      baseTaxonEvidenceCanCloseQueuedSlots: false,
      wholeProfileInheritanceAllowed: false,
    },
    summary: {
      variantObjects: new Set(items.map(item => item.speciesId)).size,
      totalResearchSlots: items.length,
      environmentVariantSpecificSlots: items.filter(item => item.sourceLane === 'environment_bridge_hold').length,
      exactObjectCoreSlots: items.filter(item => item.sourceLane === 'exact_object_policy').length,
      contractBlockedSlotsNotQueued: blockedCandidateContracts.length,
    },
    items,
    blockedCandidateContracts,
  };
};

export const buildCompatibilityVariantActionableResearchQueue = () => {
  const ledger = buildCompatibilityVariantExactEvidenceQueue();
  const coverage = buildCompatibilityCoreFieldCoverage();
  const coverageRowById = new Map(coverage.rows.map(row => [row.speciesId, row]));
  const items = ledger.items.filter(item => {
    const row = coverageRowById.get(item.speciesId);
    return row?.fields[item.field as keyof typeof row.fields]?.disposition === 'targeted_source_expansion';
  });

  return {
    ...ledger,
    kind: 'compatibility_variant_exact_evidence_actionable_research_queue',
    policy: {
      ...ledger.policy,
      coverageDispositionRequired: 'targeted_source_expansion' as const,
      terminalHoldsExcluded: true,
    },
    summary: {
      ...ledger.summary,
      variantObjects: new Set(items.map(item => item.speciesId)).size,
      totalResearchSlots: items.length,
      environmentVariantSpecificSlots: items.filter(item => item.sourceLane === 'environment_bridge_hold').length,
      exactObjectCoreSlots: items.filter(item => item.sourceLane === 'exact_object_policy').length,
      auditLedgerSlots: ledger.items.length,
      excludedNonActionableSlots: ledger.items.length - items.length,
    },
    items,
  };
};
