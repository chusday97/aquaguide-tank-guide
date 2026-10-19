import { catalogCanonicalIdentities } from '../../data/catalogCanonicalIdentity';
import { getCompatibilityVariantFieldResearchPolicy } from '../../data/compatibilityVariantFieldResearchPolicy';
import { fishData } from '../../data/fishData';
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
  const speciesIds = [...new Set(bridge.decisions.map(item => item.speciesId))].sort();

  for (const speciesId of speciesIds) {
    const identity = catalogCanonicalIdentities[speciesId];
    const researchPolicy = getCompatibilityVariantFieldResearchPolicy(speciesId);
    const species = fishData.find(item => item.id === speciesId);
    if (!identity || !researchPolicy || !species) {
      throw new Error('compatibility_variant_exact_evidence_queue_authority_missing:' + speciesId);
    }

    for (const decision of bridge.decisions.filter(item => (
      item.speciesId === speciesId
      && item.decisionStatus === 'variant_specific_evidence_required'
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
      variantObjects: speciesIds.length,
      totalResearchSlots: items.length,
      environmentVariantSpecificSlots: items.filter(item => item.sourceLane === 'environment_bridge_hold').length,
      exactObjectCoreSlots: items.filter(item => item.sourceLane === 'exact_object_policy').length,
      contractBlockedSlotsNotQueued: blockedCandidateContracts.length,
    },
    items,
    blockedCandidateContracts,
  };
};
