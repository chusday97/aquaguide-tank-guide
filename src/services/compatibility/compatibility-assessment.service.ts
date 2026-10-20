import { LOCAL_CATALOG_VERSION } from '../../data/catalogVersion';
import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import type { SpeciesAdditionItem } from '../aquarium/species-addition.service';
import { apiRequest } from '../api/api-client';
import { resolveRepositoryMode } from '../repository/repository-provider';
import type { CompatibilityAssessmentMode } from './compatibility-action.service';
import {
  buildCompatibilityDecisionPlan,
  type CompatibilityDecisionPlan,
} from './compatibility-decision-plan.service';
import { COMPATIBILITY_PRODUCT_SCHEMA_VERSION, type CompatibilityProductSchemaVersion } from './compatibility-product-contract';
import {
  buildCompatibilityReadableConclusion,
  isCompatibilityUserReadableText,
  type CompatibilityReadableConclusion,
} from './compatibility-readable-copy.service';

type GroundedItem = {
  text: string;
  ruleCodes: string[];
};

export type CompatibilityAssessmentUiModel = {
  assessmentMode: 'planned_addition';
  main: CompatibilityReadableConclusion;
  source: 'cloud_ai' | 'cloud_deterministic' | 'local_deterministic';
  decisionPlan: CompatibilityDecisionPlan;
  details: {
    label: '查看依据';
    reasons: GroundedItem[];
    adjustments: GroundedItem[];
    uncertainties: GroundedItem[];
    model: string | null;
    aiStatus: string | null;
    authorityStatus: CompatibilityDecision['status'];
  };
};

export type RemoteCompatibilityAssessment = {
  schemaVersion: CompatibilityProductSchemaVersion;
  assessmentMode: CompatibilityAssessmentMode;
  main: CompatibilityReadableConclusion;
  details: {
    label: '查看依据';
    reasons: GroundedItem[];
    adjustments: GroundedItem[];
    uncertainties: GroundedItem[];
    explanation: {
      source: 'ai_grounded' | 'deterministic_fallback';
      aiStatus: string;
      model: string | null;
    };
    authority: {
      status: CompatibilityDecision['status'];
      finalSource: 'deterministic';
    };
  };
};

const localAssessment = (decision: CompatibilityDecision): CompatibilityAssessmentUiModel => ({
  assessmentMode: 'planned_addition',
  main: buildCompatibilityReadableConclusion(decision),
  source: 'local_deterministic',
  decisionPlan: buildCompatibilityDecisionPlan(decision),
  details: {
    label: '查看依据',
    reasons: [],
    adjustments: [],
    uncertainties: [],
    model: null,
    aiStatus: null,
    authorityStatus: decision.status,
  },
});

const JUDGMENT_BY_STATUS: Record<CompatibilityDecision['status'], CompatibilityReadableConclusion['judgment']> = {
  compatible: '可以养',
  caution: '有条件可以',
  not_recommended: '不建议',
  insufficient_data: '暂时无法判断',
};

const isValidMain = (
  main: RemoteCompatibilityAssessment['main'],
  status: CompatibilityDecision['status'],
) => (
  main?.judgment === JUDGMENT_BY_STATUS[status]
  && Array.isArray(main?.why)
  && main.why.length > 0
  && main.why.length <= 2
  && main.why.every(text => isCompatibilityUserReadableText(text, 'reason'))
  && Array.isArray(main?.howTo)
  && main.howTo.length > 0
  && main.howTo.length <= 2
  && main.howTo.every(text => isCompatibilityUserReadableText(text, 'action'))
);

export const adaptRemoteCompatibilityAssessmentForPlan = (
  remote: RemoteCompatibilityAssessment,
  decision: CompatibilityDecision,
): CompatibilityAssessmentUiModel | null => {
  if (remote?.schemaVersion !== COMPATIBILITY_PRODUCT_SCHEMA_VERSION) return null;
  if (remote?.assessmentMode !== 'planned_addition') return null;
  if (!isValidMain(remote.main, decision.status)) return null;
  if (remote.details?.authority?.finalSource !== 'deterministic') return null;
  if (remote.details.authority.status !== decision.status) return null;

  return {
    assessmentMode: 'planned_addition',
    main: remote.main,
    source: remote.details.explanation?.source === 'ai_grounded'
      ? 'cloud_ai'
      : 'cloud_deterministic',
    decisionPlan: buildCompatibilityDecisionPlan(decision),
    details: {
      label: '查看依据',
      reasons: Array.isArray(remote.details.reasons) ? remote.details.reasons : [],
      adjustments: Array.isArray(remote.details.adjustments) ? remote.details.adjustments : [],
      uncertainties: Array.isArray(remote.details.uncertainties) ? remote.details.uncertainties : [],
      model: remote.details.explanation?.model || null,
      aiStatus: remote.details.explanation?.aiStatus || null,
      authorityStatus: remote.details.authority.status,
    },
  };
};

export const buildLocalCompatibilityAssessment = (
  decision: CompatibilityDecision,
): CompatibilityAssessmentUiModel => localAssessment(decision);

export const loadCompatibilityAssessmentForPlan = async ({
  aquariumId,
  plannedItems,
  decision,
}: {
  aquariumId: string;
  plannedItems: SpeciesAdditionItem[];
  decision: CompatibilityDecision;
}): Promise<CompatibilityAssessmentUiModel> => {
  const fallback = localAssessment(decision);

  let mode: 'local' | 'cloud';
  try {
    mode = await resolveRepositoryMode();
  } catch {
    return fallback;
  }
  if (mode !== 'cloud') return fallback;

  const query = new URLSearchParams({ catalogVersion: LOCAL_CATALOG_VERSION });
  plannedItems.forEach(item => query.append('planned', `${item.fishId}:${Math.max(1, Math.round(item.quantity || 1))}`));

  try {
    const remote = await apiRequest<RemoteCompatibilityAssessment>(
      `/aquariums/${encodeURIComponent(aquariumId)}/compatibility-assessment?${query.toString()}`,
    );
    return adaptRemoteCompatibilityAssessmentForPlan(remote, decision) || fallback;
  } catch {
    return fallback;
  }
};
