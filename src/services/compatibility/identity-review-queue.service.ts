export type CompatibilityIdentityMigrationPath =
  | 'identity_only_after_exact_evidence'
  | 'partial_inheritance_review'
  | 'exact_variant_label_disambiguation'
  | 'base_authority_or_parent_resolution'
  | 'taxonomic_review'
  | 'trade_name_disambiguation'
  | 'hybrid_object_specific_hold'
  | 'catalog_structure_correction';

export type CompatibilityIdentityResearchDebtStatus =
  | 'catalog_label_disambiguation_required'
  | 'exact_object_evidence_not_found';

export type CompatibilityIdentityMigrationAuditRow = {
  speciesId: string;
  name: string;
  scientificName: string;
  boundaryCode: string;
  migrationPath: CompatibilityIdentityMigrationPath;
  nextAction: string;
  candidateTaxa: string[];
  morphologyRisk: boolean;
  readyBaseCandidateCount: number;
  readyBaseCandidates: Array<{ speciesId: string; scientificName: string }>;
  baseCandidates: Array<{ speciesId: string; scientificName: string }>;
  identityEvidenceStatus: string;
  researchDebtStatus: CompatibilityIdentityResearchDebtStatus | null;
  researchDebtBlockingReason: string | null;
  researchDebtReopenRequirement: string | null;
  identityResearchDebt?: {
    searchedObjectLabels?: string[];
  } | null;
  affectedIdentityUnknownPairs: number;
  soleBoundaryIdentityUnknownPairs: number;
  sharedBoundaryIdentityUnknownPairs: number;
};

export type CompatibilityIdentityMigrationAudit = {
  schemaVersion: number;
  activeIdentityBoundaries: number;
  identityUnknownPairs: number;
  rows: CompatibilityIdentityMigrationAuditRow[];
};

export type CompatibilityIdentityReviewQueueKind =
  | 'exact_object_identity_research'
  | 'partial_inheritance_review'
  | 'manual_label_disambiguation'
  | 'base_or_parent_resolution'
  | 'taxonomic_review'
  | 'trade_name_disambiguation'
  | 'evidence_ceiling_hold'
  | 'hybrid_object_hold'
  | 'catalog_structure_correction';

export type CompatibilityIdentityReviewGate =
  | 'research_required'
  | 'identity_then_partial_inheritance_review'
  | 'manual_disambiguation'
  | 'evidence_ceiling'
  | 'object_specific_hold'
  | 'catalog_correction';

export type CompatibilityIdentityReviewQueueItem = {
  speciesId: string;
  name: string;
  scientificName: string;
  boundaryCode: string;
  migrationPath: CompatibilityIdentityMigrationPath;
  queue: CompatibilityIdentityReviewQueueKind;
  gate: CompatibilityIdentityReviewGate;
  automatedResearchAllowed: boolean;
  requiresHumanReview: true;
  fullInheritanceAllowed: false;
  promotionAllowed: false;
  writesAuthority: false;
  morphologyRisk: boolean;
  readyBaseCandidateCount: number;
  readyBaseSpeciesIds: string[];
  baseCandidateSpeciesIds: string[];
  identityEvidenceStatus: string;
  researchDebtStatus: CompatibilityIdentityResearchDebtStatus | null;
  researchBlockedReason: string | null;
  reopenRequirement: string | null;
  researchLabels: string[];
  nextAction: string;
  affectedIdentityUnknownPairs: number;
  soleBoundaryIdentityUnknownPairs: number;
  sharedBoundaryIdentityUnknownPairs: number;
};

export type CompatibilityIdentityReviewQueueManifest = {
  version: 1;
  kind: 'compatibility_identity_review_queue';
  generatedAt: string;
  generatedFrom: string;
  sourceSchemaVersion: number;
  promotionAllowed: false;
  writesAuthority: false;
  policy: {
    unitOfWork: 'catalog_object_identity';
    noPairPrecompute: true;
    noAutomaticPromotion: true;
    researchDebtIsTerminalUntilNewEvidence: true;
  };
  summary: {
    total: number;
    sourceActiveIdentityBoundaries: number;
    sourceIdentityUnknownPairs: number;
    automatedResearchEligible: number;
    manualReviewOnly: number;
    evidenceCeilingHolds: number;
    partialInheritanceReview: number;
    byQueue: Record<CompatibilityIdentityReviewQueueKind, number>;
    soleBoundaryPairImpactByQueue: Record<CompatibilityIdentityReviewQueueKind, number>;
  };
  items: CompatibilityIdentityReviewQueueItem[];
};

const queueKinds: CompatibilityIdentityReviewQueueKind[] = [
  'exact_object_identity_research',
  'partial_inheritance_review',
  'manual_label_disambiguation',
  'base_or_parent_resolution',
  'taxonomic_review',
  'trade_name_disambiguation',
  'evidence_ceiling_hold',
  'hybrid_object_hold',
  'catalog_structure_correction',
];

export const hasStructurallyOpenScientificLabel = (scientificName: string) => (
  /(?:^|\s)(?:sp\.|cf\.|aff\.)(?:\s|$)/i.test(scientificName.trim())
);

const isStructurallyOpenParentResolution = (row: CompatibilityIdentityMigrationAuditRow) => (
  row.migrationPath === 'base_authority_or_parent_resolution'
  && hasStructurallyOpenScientificLabel(row.scientificName)
);

const routeFor = (
  row: CompatibilityIdentityMigrationAuditRow,
): {
  queue: CompatibilityIdentityReviewQueueKind;
  gate: CompatibilityIdentityReviewGate;
  automatedResearchAllowed: boolean;
} => {
  if (row.researchDebtStatus === 'exact_object_evidence_not_found') {
    return { queue: 'evidence_ceiling_hold', gate: 'evidence_ceiling', automatedResearchAllowed: false };
  }
  if (row.researchDebtStatus === 'catalog_label_disambiguation_required') {
    return { queue: 'manual_label_disambiguation', gate: 'manual_disambiguation', automatedResearchAllowed: false };
  }
  if (isStructurallyOpenParentResolution(row)) {
    return { queue: 'trade_name_disambiguation', gate: 'manual_disambiguation', automatedResearchAllowed: false };
  }

  switch (row.migrationPath) {
    case 'identity_only_after_exact_evidence':
      return { queue: 'exact_object_identity_research', gate: 'research_required', automatedResearchAllowed: true };
    case 'partial_inheritance_review':
      return {
        queue: 'partial_inheritance_review',
        gate: 'identity_then_partial_inheritance_review',
        automatedResearchAllowed: true,
      };
    case 'exact_variant_label_disambiguation':
      return { queue: 'manual_label_disambiguation', gate: 'manual_disambiguation', automatedResearchAllowed: false };
    case 'base_authority_or_parent_resolution':
      return { queue: 'base_or_parent_resolution', gate: 'research_required', automatedResearchAllowed: true };
    case 'taxonomic_review':
      return { queue: 'taxonomic_review', gate: 'research_required', automatedResearchAllowed: true };
    case 'trade_name_disambiguation':
      return { queue: 'trade_name_disambiguation', gate: 'manual_disambiguation', automatedResearchAllowed: false };
    case 'hybrid_object_specific_hold':
      return { queue: 'hybrid_object_hold', gate: 'object_specific_hold', automatedResearchAllowed: false };
    case 'catalog_structure_correction':
      return { queue: 'catalog_structure_correction', gate: 'catalog_correction', automatedResearchAllowed: false };
  }
};

const uniqueStrings = (values: Array<string | null | undefined>) => (
  [...new Set(values.map(value => value?.trim()).filter((value): value is string => Boolean(value)))]
);

export const buildCompatibilityIdentityReviewQueue = (
  audit: CompatibilityIdentityMigrationAudit,
  generatedAt = new Date().toISOString(),
  generatedFrom = 'docs/compatibility_identity_migration_audit.json',
): CompatibilityIdentityReviewQueueManifest => {
  const seen = new Set<string>();
  const items = audit.rows.map(row => {
    if (seen.has(row.speciesId)) {
      throw new Error('Duplicate identity migration row: ' + row.speciesId);
    }
    seen.add(row.speciesId);

    const route = routeFor(row);
    const structuralOpenParentResolution = isStructurallyOpenParentResolution(row);
    const searchedObjectLabels = row.identityResearchDebt?.searchedObjectLabels || [];
    const researchLabels = uniqueStrings([
      row.scientificName,
      row.name,
      ...row.candidateTaxa,
      ...searchedObjectLabels,
    ]);

    return {
      speciesId: row.speciesId,
      name: row.name,
      scientificName: row.scientificName,
      boundaryCode: row.boundaryCode,
      migrationPath: row.migrationPath,
      queue: route.queue,
      gate: route.gate,
      automatedResearchAllowed: route.automatedResearchAllowed,
      requiresHumanReview: true as const,
      fullInheritanceAllowed: false as const,
      promotionAllowed: false as const,
      writesAuthority: false as const,
      morphologyRisk: row.morphologyRisk,
      readyBaseCandidateCount: row.readyBaseCandidateCount,
      readyBaseSpeciesIds: row.readyBaseCandidates.map(candidate => candidate.speciesId),
      baseCandidateSpeciesIds: row.baseCandidates.map(candidate => candidate.speciesId),
      identityEvidenceStatus: row.identityEvidenceStatus,
      researchDebtStatus: row.researchDebtStatus,
      researchBlockedReason: row.researchDebtBlockingReason
        ?? (structuralOpenParentResolution
          ? 'Catalog scientific label is structurally open (sp./cf./aff.) and does not identify one accepted parent species.'
          : null),
      reopenRequirement: row.researchDebtReopenRequirement
        ?? (structuralOpenParentResolution
          ? 'Provide lineage/provenance or an authoritative exact-object source that links this catalog object to one accepted parent taxon.'
          : null),
      researchLabels,
      nextAction: structuralOpenParentResolution
        ? 'Keep fail-closed until exact lineage/provenance identifies one accepted parent taxon; do not repeat generic automated parent search.'
        : row.nextAction,
      affectedIdentityUnknownPairs: row.affectedIdentityUnknownPairs,
      soleBoundaryIdentityUnknownPairs: row.soleBoundaryIdentityUnknownPairs,
      sharedBoundaryIdentityUnknownPairs: row.sharedBoundaryIdentityUnknownPairs,
    } satisfies CompatibilityIdentityReviewQueueItem;
  }).sort((left, right) => (
    right.soleBoundaryIdentityUnknownPairs - left.soleBoundaryIdentityUnknownPairs
    || right.affectedIdentityUnknownPairs - left.affectedIdentityUnknownPairs
    || left.speciesId.localeCompare(right.speciesId)
  ));

  const byQueue = Object.fromEntries(queueKinds.map(queue => [queue, 0])) as Record<CompatibilityIdentityReviewQueueKind, number>;
  const soleBoundaryPairImpactByQueue = Object.fromEntries(queueKinds.map(queue => [queue, 0])) as Record<CompatibilityIdentityReviewQueueKind, number>;
  for (const item of items) {
    byQueue[item.queue] += 1;
    soleBoundaryPairImpactByQueue[item.queue] += item.soleBoundaryIdentityUnknownPairs;
  }

  return {
    version: 1,
    kind: 'compatibility_identity_review_queue',
    generatedAt,
    generatedFrom,
    sourceSchemaVersion: audit.schemaVersion,
    promotionAllowed: false,
    writesAuthority: false,
    policy: {
      unitOfWork: 'catalog_object_identity',
      noPairPrecompute: true,
      noAutomaticPromotion: true,
      researchDebtIsTerminalUntilNewEvidence: true,
    },
    summary: {
      total: items.length,
      sourceActiveIdentityBoundaries: audit.activeIdentityBoundaries,
      sourceIdentityUnknownPairs: audit.identityUnknownPairs,
      automatedResearchEligible: items.filter(item => item.automatedResearchAllowed).length,
      manualReviewOnly: items.filter(item => !item.automatedResearchAllowed).length,
      evidenceCeilingHolds: items.filter(item => item.queue === 'evidence_ceiling_hold').length,
      partialInheritanceReview: items.filter(item => item.queue === 'partial_inheritance_review').length,
      byQueue,
      soleBoundaryPairImpactByQueue,
    },
    items,
  };
};
