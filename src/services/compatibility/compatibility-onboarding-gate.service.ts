import {
  COMPATIBILITY_DECISION_REQUIRED_FACTS,
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  type CompatibilityRequiredFact,
} from '../../../packages/contracts/src';
import {
  getCatalogIdentityReadiness,
  isCompatibilityIdentityReady,
  type CatalogIdentityReadiness,
} from '../../data/catalogCanonicalIdentity';
import type { Fish } from '../../types';
import { isCompatibilitySupportedLifeType } from './compatibility-domain-scope.service';

export type CompatibilityOnboardingGateResult = {
  /** Strict 8/8 generic authority readiness. */
  ready: boolean;
  /** Enough reviewed hard facts to return a useful compatibility decision. */
  decisionReady: boolean;
  identityReadiness: CatalogIdentityReadiness;
  missingDeclaredFacts: CompatibilityRequiredFact[];
  missingAuthoritativeFacts: CompatibilityRequiredFact[];
  missingDecisionFacts: CompatibilityRequiredFact[];
  missingRiskCoverageFacts: CompatibilityRequiredFact[];
  reasons: string[];
  decisionReasons: string[];
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
  const decisionRequired = [...COMPATIBILITY_DECISION_REQUIRED_FACTS] as CompatibilityRequiredFact[];
  const missingDecisionFacts = decisionRequired.filter(field => !authoritative.has(field));
  const missingRiskCoverageFacts = required.filter(field => (
    !decisionRequired.includes(field) && !authoritative.has(field)
  ));
  const reasons: string[] = [];
  const decisionReasons: string[] = [];

  if (!isCompatibilitySupportedLifeType(input.lifeType)) {
    reasons.push('unsupported_compatibility_domain');
    decisionReasons.push('unsupported_compatibility_domain');
  }
  if (!isCompatibilityIdentityReady(identityReadiness)) {
    reasons.push(identityReadiness);
    decisionReasons.push(identityReadiness);
  }
  if (missingDeclaredFacts.length) reasons.push('required_fact_contract_incomplete');
  if (missingAuthoritativeFacts.length) reasons.push('authoritative_core_facts_incomplete');
  if (missingDecisionFacts.length) decisionReasons.push('authoritative_decision_facts_incomplete');

  return {
    ready: reasons.length === 0,
    decisionReady: decisionReasons.length === 0,
    identityReadiness,
    missingDeclaredFacts,
    missingAuthoritativeFacts,
    missingDecisionFacts,
    missingRiskCoverageFacts,
    reasons,
    decisionReasons,
  };
};
