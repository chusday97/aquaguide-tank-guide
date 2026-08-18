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
    | 'unknown_planting_type'
    | 'missing_claim_evidence'
    | 'claim_source_not_profile_source'
    | 'orphan_claim_evidence'
    | 'high_confidence_single_source_claim';
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

const explicitKeys = (prefix: string, record?: Record<string, unknown>) => (
  Object.entries(record || {})
    .filter(([, value]) => value !== undefined)
    .map(([key]) => `${prefix}.${key}`)
);

const getSpeciesTraitKeys = (profile: SpeciesEnvironmentProfile) => [
  ...explicitKeys('environment', profile.environment),
  ...explicitKeys('habitat', profile.habitat),
];

const getPlantTraitKeys = (profile: PlantEnvironmentProfile) => [
  ...explicitKeys('environment', profile.environment),
  ...explicitKeys('planting', profile.planting),
  ...explicitKeys('habitatValue', profile.habitatValue),
];

const hasSpeciesExplicitTrait = (profile: SpeciesEnvironmentProfile) => getSpeciesTraitKeys(profile).length > 0;
const hasPlantExplicitTrait = (profile: PlantEnvironmentProfile) => getPlantTraitKeys(profile).length > 0;

const auditClaimEvidence = (
  profile: AuditableEnvironmentProfile,
  profileKind: 'species' | 'plant',
  traitKeys: string[],
): EnvironmentProfileAuditIssue[] => {
  if (profile.evidence.reviewStatus !== 'reviewed') return [];

  const issues: EnvironmentProfileAuditIssue[] = [];
  const claimRefs = profile.evidence.claimRefs || {};
  const traitKeySet = new Set(traitKeys);
  const profileSourceSet = new Set(profile.evidence.sourceRefs);

  traitKeys.forEach(traitKey => {
    const refs = claimRefs[traitKey] || [];
    if (!refs.length) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind,
        code: 'missing_claim_evidence',
        message: `Reviewed trait ${traitKey} requires explicit claim-level evidence.`,
      });
      return;
    }

    if (profile.evidence.confidence === 'high' && new Set(refs).size < 2) {
      issues.push({
        speciesId: profile.speciesId,
        profileKind,
        code: 'high_confidence_single_source_claim',
        message: `High-confidence trait ${traitKey} requires at least two independent evidence sources.`,
      });
    }

    refs.forEach(sourceRef => {
      if (!profileSourceSet.has(sourceRef)) {
        issues.push({
          speciesId: profile.speciesId,
          profileKind,
          code: 'claim_source_not_profile_source',
          message: `Claim ${traitKey} cites ${sourceRef}, but the source is not declared in profile sourceRefs.`,
        });
      }
      if (!environmentEvidenceSources[sourceRef]) {
        issues.push({
          speciesId: profile.speciesId,
          profileKind,
          code: 'missing_evidence_source',
          message: `Claim ${traitKey} cites unregistered evidence source ${sourceRef}.`,
        });
      }
    });
  });

  Object.keys(claimRefs).forEach(traitKey => {
    if (traitKeySet.has(traitKey)) return;
    issues.push({
      speciesId: profile.speciesId,
      profileKind,
      code: 'orphan_claim_evidence',
      message: `Claim evidence exists for ${traitKey}, but the profile does not expose that trait.`,
    });
  });

  return issues;
};

const auditEvidence = (
  profile: AuditableEnvironmentProfile,
  profileKind: 'species' | 'plant',
  traitKeys: string[],
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

  issues.push(...auditClaimEvidence(profile, profileKind, traitKeys));
  return issues;
};

export const auditSpeciesEnvironmentProfiles = (
  profiles: SpeciesEnvironmentProfile[] = speciesEnvironmentProfiles,
): EnvironmentProfileAuditIssue[] => {
  const issues: EnvironmentProfileAuditIssue[] = [];

  profiles.forEach(profile => {
    const traitKeys = getSpeciesTraitKeys(profile);
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

    issues.push(...auditEvidence(profile, 'species', traitKeys));
  });

  return issues;
};

export const auditPlantEnvironmentProfiles = (
  profiles: PlantEnvironmentProfile[] = plantEnvironmentProfiles,
): EnvironmentProfileAuditIssue[] => {
  const issues: EnvironmentProfileAuditIssue[] = [];

  profiles.forEach(profile => {
    const traitKeys = getPlantTraitKeys(profile);
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

    issues.push(...auditEvidence(profile, 'plant', traitKeys));
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
