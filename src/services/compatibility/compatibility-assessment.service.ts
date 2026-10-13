import { LOCAL_CATALOG_VERSION } from '../../data/catalogVersion';
import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import type { SpeciesAdditionItem } from '../aquarium/species-addition.service';
import { apiRequest } from '../api/api-client';
import { resolveRepositoryMode } from '../repository/repository-provider';
import {
  buildCompatibilityReadableConclusion,
  type CompatibilityReadableConclusion,
} from './compatibility-readable-copy.service';

type GroundedItem = {
  text: string;
  ruleCodes: string[];
};

export type CompatibilityAssessmentUiModel = {
  main: CompatibilityReadableConclusion;
  source: 'cloud_ai' | 'cloud_deterministic' | 'local_deterministic';
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

type RemoteAssessment = {
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
  main: buildCompatibilityReadableConclusion(decision),
  source: 'local_deterministic',
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

const isValidMain = (main: RemoteAssessment['main']) => (
  ['可以养', '有条件可以', '不建议', '暂时无法判断'].includes(main?.judgment)
  && Array.isArray(main?.why)
  && main.why.length > 0
  && Array.isArray(main?.howTo)
  && main.howTo.length > 0
);

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
    const remote = await apiRequest<RemoteAssessment>(
      `/aquariums/${encodeURIComponent(aquariumId)}/compatibility-assessment?${query.toString()}`,
    );
    if (!isValidMain(remote.main)) return fallback;
    if (remote.details?.authority?.finalSource !== 'deterministic') return fallback;
    if (remote.details.authority.status !== decision.status) return fallback;

    return {
      main: remote.main,
      source: remote.details.explanation?.source === 'ai_grounded'
        ? 'cloud_ai'
        : 'cloud_deterministic',
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
  } catch {
    return fallback;
  }
};
