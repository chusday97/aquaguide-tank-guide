import { compatibilityVariantEnvironmentCandidateEvidence } from '../../data/compatibilityVariantEnvironmentCandidateEvidence';
import { buildCompatibilityTaxonResearchPlan } from './compatibility-field-coverage.service';

const candidateFields = ['water', 'temperature', 'ph'] as const;
const exactObjectFields = ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const buildCompatibilityVariantEnvironmentCandidateReview = () => {
  const plan = buildCompatibilityTaxonResearchPlan();
  const jobs = plan.map(job => {
    const evidence = compatibilityVariantEnvironmentCandidateEvidence
      .filter(item => item.researchKey === job.researchKey)
      .sort((a, b) => candidateFields.indexOf(a.field) - candidateFields.indexOf(b.field));
    if (evidence.length !== candidateFields.length) {
      throw new Error('compatibility_variant_environment_candidate_evidence_incomplete:' + job.researchKey);
    }
    return {
      researchKey: job.researchKey,
      speciesIds: job.catalogObjects.map(item => item.speciesId),
      objectCount: job.catalogObjectCount,
      fields: evidence.map(item => ({
        field: item.field,
        status: item.status,
        proposedValue: item.proposedValue,
        ...(item.reasonCode ? { reasonCode: item.reasonCode } : {}),
        ...(item.evidenceSummary ? { evidenceSummary: item.evidenceSummary } : {}),
        source: { ...item.source },
      })),
    };
  });

  const supportedTaxonFacts = jobs.flatMap(job => job.fields).filter(field => field.status === 'draft_candidate').length;
  const unresolvedTaxonFacts = jobs.flatMap(job => job.fields).filter(field => field.status !== 'draft_candidate').length;
  const supportedCandidateSlots = jobs.reduce((sum, job) => (
    sum + job.fields.filter(field => field.status === 'draft_candidate').length * job.objectCount
  ), 0);
  const unresolvedCandidateSlots = jobs.reduce((sum, job) => (
    sum + job.fields.filter(field => field.status !== 'draft_candidate').length * job.objectCount
  ), 0);

  return {
    version: 1,
    kind: 'compatibility_variant_environment_candidate_review',
    policy: {
      writesAuthority: false,
      promotionAllowed: false,
      grantsInheritance: false,
      scope: 'Reviewed identity-known zero-inheritance variants; base-taxon evidence discovery only for water, temperature, and pH.',
      promotionGate: 'Every supported candidate still requires an explicit reviewed field bridge or variant-specific evidence before Catalog/Compatibility authority can change.',
      exactObjectFieldsExcluded: [...exactObjectFields],
    },
    summary: {
      taxonJobs: jobs.length,
      variantObjects: plan.reduce((sum, job) => sum + job.catalogObjectCount, 0),
      candidateFieldsPerObject: candidateFields.length,
      requestedCandidateSlots: jobs.reduce((sum, job) => sum + candidateFields.length * job.objectCount, 0),
      supportedCandidateSlots,
      unresolvedCandidateSlots,
      supportedTaxonFacts,
      unresolvedTaxonFacts,
      exactObjectSlotsExcluded: plan.reduce((sum, job) => sum + exactObjectFields.length * job.catalogObjectCount, 0),
    },
    jobs,
  };
};
