import {
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  type CompatibilityRequiredFact,
} from '../../../packages/contracts/src';
import {
  getCatalogIdentityReadiness,
  isCompatibilityIdentityReady,
  type CatalogIdentityReadiness,
} from '../../data/catalogCanonicalIdentity';
import type { Fish } from '../../types';

export type CompatibilityOnboardingGateResult = {
  ready: boolean;
  identityReadiness: CatalogIdentityReadiness;
  missingDeclaredFacts: CompatibilityRequiredFact[];
  missingAuthoritativeFacts: CompatibilityRequiredFact[];
  reasons: string[];
};

export const assessCompatibilityOnboardingGate = (
  fish: Pick<Fish, 'id' | 'scientificName'>,
  input: {
    lifeType: string;
    hasReviewedCompatibilityProfile: boolean;
    declaredRequiredFacts: readonly CompatibilityRequiredFact[];
    authoritativeFacts: readonly CompatibilityRequiredFact[];
    catalogPersisted?: boolean;
    reviewedDirectIdentity?: boolean;
  },
): CompatibilityOnboardingGateResult => {
  const required = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityRequiredFact[];
  const declared = new Set(input.declaredRequiredFacts);
  const authoritative = new Set(input.authoritativeFacts);
  const identityReadiness = getCatalogIdentityReadiness(fish, {
    catalogPersisted: input.catalogPersisted,
    reviewedDirectIdentity: input.reviewedDirectIdentity,
    hasReviewedCompatibilityProfile: input.hasReviewedCompatibilityProfile,
  });
  const missingDeclaredFacts = required.filter(field => !declared.has(field));
  const missingAuthoritativeFacts = required.filter(field => !authoritative.has(field));
  const reasons: string[] = [];

  if (input.lifeType !== 'fish') reasons.push('unsupported_compatibility_domain');
  if (!isCompatibilityIdentityReady(identityReadiness)) reasons.push(identityReadiness);
  if (!input.hasReviewedCompatibilityProfile) reasons.push('reviewed_compatibility_profile_missing');
  if (missingDeclaredFacts.length) reasons.push('required_fact_contract_incomplete');
  if (missingAuthoritativeFacts.length) reasons.push('authoritative_core_facts_incomplete');

  return {
    ready: reasons.length === 0,
    identityReadiness,
    missingDeclaredFacts,
    missingAuthoritativeFacts,
    reasons,
  };
};
