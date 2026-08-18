import { environmentEvidenceSources } from '../../data/environmentEvidence';
import { plantEnvironmentProfiles } from '../../data/plantEnvironmentProfiles';
import { speciesEnvironmentProfiles } from '../../data/speciesEnvironmentProfiles';
import type {
  PlantEnvironmentProfile,
  Range,
  SpeciesEnvironmentProfile,
} from './environment.types';

export type EnvironmentProfileAuditIssue = {
  speciesId: string;
  profileKind: 'species' | 'plant';
  code:
    | 'reviewed_without_sources'
    | 'reviewed_with_weak_confidence'
    | 'missing_evidence_source'
    | 'invalid_range'
    | 'empty_profile'
    | 'unknown_planting_type';
  message: string;
};

type AuditableEnvironmentProfile = SpeciesEnvironmentProfile | PlantEnvironmentProfile;

const isValidRange = (range?: Range) => (
  !range || (
    Number.isFinite(range.min)
    && Number.isFinite(range.max)
    && range.min <= range.max
  )
);

const hasSpeciesExplicitTrait = (profile: SpeciesEnvironmentProfile) => (
  Object.values(profile.environment).some(value => value !== undefined)
  || Object.values(profile.habitat || {}).some(value => value !== undefined)
);

const hasPlantExplicitTrait = (profile: PlantEnvironmentProfile) => (
  Object.values(profile.environment).some(value => value !== undefined)
  || Object.values(profile.planting).some(value => value !== undefined)
  || Object.values(profile.habitatValue || {}).some(value => value !== undefined)
);

const auditEvidence = (
  profile: AuditableEnvironmentProfile,
  profileKind: 'species' | 'plant',
): EnvironmentProfileAuditIssue[] => {
  if (profile.evidence.reviewStatus !== 'reviewed') return [];

  const issues: EnvironmentProfileAuditIssue[] = [];
  if (profile.evidence.sourceRefs.length < 2) {
    issues.push({
      speciesId: profile.speciesId,
      profileKind,
      code: 'reviewed_without_sources',
      message: 'Reviewed profiles require at least two independent source references.',
    });
  }

  if (profile.evidence.confidence === 'low' || profile.evidence.confidence === 'unknown') {
    issues.push({
      speciesId: profile.speciesId,
      profileKind,
      code: 'reviewed_with_weak_confidence',
      message: 'Reviewed profiles cannot carry low or unknown evidence confidence.',
    });
  }

  profile.evidence.sourceRefs.forEach(sourceRef => {
    if (environmentEvidenceSources[sourceRef]) return;
    issues.push({
      speciesId: profile.speciesId,
      profileKind,
      code: 'missing_evidence_source',
      message: `Evidence source ${sourceRef} is not registered.`,
    });
  });

  return issues;
};

export const auditSpeciesEnvironmentProfiles = (
  profiles: SpeciesEnvironmentProfile[] = speciesEnvironmentProfiles,
): EnvironmentProfileAuditIssue[] => {
  const issues: EnvironmentProfileAuditIssue[] = [];

  profiles.forEach(profile => {
    if (!hasSpeciesExplicitTrait(profile)) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind: 'species',
        code: 'empty_profile',
        message: 'Species environment profile must contain at least one explicit environment or habitat trait.',
      });
    }

    if (!isValidRange(profile.environment.temperature) || !isValidRange(profile.environment.ph)) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind: 'species',
        code: 'invalid_range',
        message: 'Temperature and pH ranges must be finite and min <= max.',
      });
    }

    issues.push(...auditEvidence(profile, 'species'));
  });

  return issues;
};

export const auditPlantEnvironmentProfiles = (
  profiles: PlantEnvironmentProfile[] = plantEnvironmentProfiles,
): EnvironmentProfileAuditIssue[] => {
  const issues: EnvironmentProfileAuditIssue[] = [];

  profiles.forEach(profile => {
    if (!hasPlantExplicitTrait(profile)) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind: 'plant',
        code: 'empty_profile',
        message: 'Plant environment profile must contain at least one explicit environment, planting or habitat-value trait.',
      });
    }

    if (!isValidRange(profile.environment.temperature) || !isValidRange(profile.environment.ph)) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind: 'plant',
        code: 'invalid_range',
        message: 'Temperature and pH ranges must be finite and min <= max.',
      });
    }

    if (profile.evidence.reviewStatus === 'reviewed' && profile.planting.type === 'unknown') {
      issues.push({
        speciesId: profile.speciesId,
        profileKind: 'plant',
        code: 'unknown_planting_type',
        message: 'Reviewed plant profiles must resolve planting type before production use.',
      });
    }

    issues.push(...auditEvidence(profile, 'plant'));
  });

  return issues;
};

const reviewedSpeciesEnvironmentProfileById = new Map(
  speciesEnvironmentProfiles
    .filter(profile => profile.evidence.reviewStatus === 'reviewed')
    .filter(profile => !auditSpeciesEnvironmentProfiles([profile]).length)
    .map(profile => [profile.speciesId, profile]),
);

const reviewedPlantEnvironmentProfileById = new Map(
  plantEnvironmentProfiles
    .filter(profile => profile.evidence.reviewStatus === 'reviewed')
    .filter(profile => !auditPlantEnvironmentProfiles([profile]).length)
    .map(profile => [profile.speciesId, profile]),
);

export const getReviewedSpeciesEnvironmentProfile = (speciesId: string) => (
  reviewedSpeciesEnvironmentProfileById.get(speciesId) || null
);

export const getReviewedPlantEnvironmentProfile = (speciesId: string) => (
  reviewedPlantEnvironmentProfileById.get(speciesId) || null
);

export const getEnvironmentProfileCoverage = () => {
  const speciesAuditIssues = auditSpeciesEnvironmentProfiles();
  const plantAuditIssues = auditPlantEnvironmentProfiles();
  return {
    totalProfiles: speciesEnvironmentProfiles.length + plantEnvironmentProfiles.length,
    reviewedProfiles: reviewedSpeciesEnvironmentProfileById.size + reviewedPlantEnvironmentProfileById.size,
    speciesTotalProfiles: speciesEnvironmentProfiles.length,
    speciesReviewedProfiles: reviewedSpeciesEnvironmentProfileById.size,
    plantTotalProfiles: plantEnvironmentProfiles.length,
    plantReviewedProfiles: reviewedPlantEnvironmentProfileById.size,
    auditIssues: [...speciesAuditIssues, ...plantAuditIssues],
  };
};
