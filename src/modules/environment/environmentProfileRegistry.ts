import { environmentEvidenceSources } from '../../data/environmentEvidence';
import { speciesEnvironmentProfiles } from '../../data/speciesEnvironmentProfiles';
import type { Range, SpeciesEnvironmentProfile } from './environment.types';

export type EnvironmentProfileAuditIssue = {
  speciesId: string;
  code:
    | 'reviewed_without_sources'
    | 'reviewed_with_weak_confidence'
    | 'missing_evidence_source'
    | 'invalid_range'
    | 'empty_profile';
  message: string;
};

const isValidRange = (range?: Range) => (
  !range || (
    Number.isFinite(range.min)
    && Number.isFinite(range.max)
    && range.min <= range.max
  )
);

const hasExplicitTrait = (profile: SpeciesEnvironmentProfile) => (
  Object.values(profile.environment).some(value => value !== undefined)
  || Object.values(profile.habitat || {}).some(value => value !== undefined)
);

export const auditSpeciesEnvironmentProfiles = (
  profiles: SpeciesEnvironmentProfile[] = speciesEnvironmentProfiles,
): EnvironmentProfileAuditIssue[] => {
  const issues: EnvironmentProfileAuditIssue[] = [];

  profiles.forEach(profile => {
    if (!hasExplicitTrait(profile)) {
      issues.push({
        speciesId: profile.speciesId,
        code: 'empty_profile',
        message: 'Environment profile must contain at least one explicit environment or habitat trait.',
      });
    }

    if (!isValidRange(profile.environment.temperature) || !isValidRange(profile.environment.ph)) {
      issues.push({
        speciesId: profile.speciesId,
        code: 'invalid_range',
        message: 'Temperature and pH ranges must be finite and min <= max.',
      });
    }

    if (profile.evidence.reviewStatus !== 'reviewed') return;

    if (profile.evidence.sourceRefs.length < 2) {
      issues.push({
        speciesId: profile.speciesId,
        code: 'reviewed_without_sources',
        message: 'Reviewed profiles require at least two independent source references.',
      });
    }

    if (profile.evidence.confidence === 'low' || profile.evidence.confidence === 'unknown') {
      issues.push({
        speciesId: profile.speciesId,
        code: 'reviewed_with_weak_confidence',
        message: 'Reviewed profiles cannot carry low or unknown evidence confidence.',
      });
    }

    profile.evidence.sourceRefs.forEach(sourceRef => {
      if (environmentEvidenceSources[sourceRef]) return;
      issues.push({
        speciesId: profile.speciesId,
        code: 'missing_evidence_source',
        message: `Evidence source ${sourceRef} is not registered.`,
      });
    });
  });

  return issues;
};

const reviewedSpeciesEnvironmentProfileById = new Map(
  speciesEnvironmentProfiles
    .filter(profile => profile.evidence.reviewStatus === 'reviewed')
    .filter(profile => !auditSpeciesEnvironmentProfiles([profile]).length)
    .map(profile => [profile.speciesId, profile]),
);

export const getReviewedSpeciesEnvironmentProfile = (speciesId: string) => (
  reviewedSpeciesEnvironmentProfileById.get(speciesId) || null
);

export const getEnvironmentProfileCoverage = () => ({
  totalProfiles: speciesEnvironmentProfiles.length,
  reviewedProfiles: reviewedSpeciesEnvironmentProfileById.size,
  auditIssues: auditSpeciesEnvironmentProfiles(),
});
