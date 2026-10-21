import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import type { CompatibilityAssessmentUiModel } from './compatibility-assessment.service';
import {
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
} from './compatibility-action.service';
import type { TankCompatibilityRule } from '../../lib/tankCompatibilityEngine';
import { getCompatibilityStatusLabelLocalized } from './compatibility-status-label.service';

export type CompatibilityAssessmentPresentation = {
  judgment: string;
  why: string[];
  howTo: string[];
  plan: {
    nextSteps: string[];
    expectedAfterAdjustment: string;
    reviewCheckpoint: string;
    stopCondition: string;
    actionSequence: Array<{
      state: 'current' | 'next' | 'deferred';
      riskFamily: string;
      action: string;
      sourceRuleCode: string;
      blockedByHardStop: boolean;
    }>;
  };
  details: {
    label: string;
    reasons: Array<{ text: string; ruleCodes: string[] }>;
  };
};

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

const rulesForDecision = (decision: CompatibilityDecision): TankCompatibilityRule[] => {
  if (decision.status === 'not_recommended') return prioritizeDistinctCompatibilityRules(decision.blockingRules).slice(0, 3);
  if (decision.status === 'caution') return prioritizeDistinctCompatibilityRules(decision.warningRules).slice(0, 3);
  if (decision.status === 'insufficient_data') return prioritizeDistinctCompatibilityRules(decision.missingData).slice(0, 3);
  return prioritizeDistinctCompatibilityRules(decision.passedRules).slice(0, 3);
};

const familyReason = (family: string, status: CompatibilityDecision['status']) => {
  const compatible = status === 'compatible';
  const reasons: Record<string, [string, string]> = {
    water_type: ['The reviewed water-type requirements are compatible.', 'The reviewed water-type requirements conflict.'],
    temperature: ['The reviewed long-term temperature requirements have a workable overlap.', 'The current or reviewed long-term temperature requirements need adjustment or separation.'],
    ph: ['The reviewed pH requirements have a workable shared range.', 'The reviewed pH requirements need a stable shared range before this combination is considered safe.'],
    space: ['The reviewed space requirement is currently met.', 'Tank length or usable space is below a reviewed requirement.'],
    predation: ['No reviewed predation conflict was found for this combination.', 'There is a reviewed predation or size-vulnerability risk.'],
    aggression: ['No reviewed aggression conflict was found for this combination.', 'There is a reviewed aggression or fin-nipping risk.'],
    territory: ['Territorial pressure is within the reviewed conditions.', 'Territorial pressure needs more cover, space, or separation.'],
    group_size: ['The reviewed group-size requirement is met.', 'The planned or current group size is below the reviewed minimum.'],
    housing: ['The reviewed housing mode is compatible with this plan.', 'A reviewed solitary-housing requirement conflicts with ordinary community keeping.'],
    bioload: ['The reviewed stocking load does not show a blocking issue.', 'The planned stocking load may put extra pressure on filtration and maintenance.'],
    equipment: ['The reviewed equipment conditions are adequate.', 'Equipment or environmental support needs to be addressed first.'],
    observed: ['Current observations do not show a blocking behavior signal.', 'Current observations show behavior or stress that needs attention before continuing.'],
    missing_information: ['The required information is available.', 'Required identity, evidence, or aquarium information is still missing.'],
  };
  return (reasons[family] || [
    'No reviewed conflict was found in this dimension.',
    status === 'insufficient_data'
      ? 'A required reviewed fact is still missing.'
      : 'A reviewed compatibility condition needs attention.',
  ])[compatible ? 0 : 1];
};

const familyAction = (family: string, status: CompatibilityDecision['status']) => {
  const blocked = status === 'not_recommended';
  const actions: Record<string, string> = {
    water_type: 'Keep species with conflicting water types in separate aquariums or choose a different combination.',
    temperature: blocked
      ? 'Do not force a midpoint temperature when the reviewed ranges do not safely overlap; separate tanks or change the combination.'
      : 'Set the aquarium temperature only within a reviewed shared range, then run the compatibility check again.',
    ph: 'Confirm a stable pH that sits inside the reviewed shared range, then run the compatibility check again.',
    space: 'Increase usable tank space or choose a species combination whose reviewed space requirement fits this aquarium.',
    predation: blocked
      ? 'Do not add the risky predator/prey combination; use separation or choose a different combination.'
      : 'Watch feeding and chasing closely and prepare an immediate separation option before continuing.',
    aggression: blocked
      ? 'Do not add the combination while the reviewed aggression conflict remains; separate or change the combination.'
      : 'Add cover and retreat routes, then recheck chasing, fin damage, hiding, and feeding.',
    territory: 'Add visual barriers and retreat routes; separate the animals if territorial pressure continues.',
    group_size: 'Meet the reviewed minimum group size before reassessing the plan.',
    housing: 'Keep the species with a reviewed solitary-housing requirement separately.',
    bioload: 'Reduce the planned stocking load or improve the reviewed filtration/maintenance capacity before adding more livestock.',
    equipment: 'Complete the required equipment or environmental support before adding livestock.',
    observed: 'Pause further additions and address the observed stress or conflict before reassessing.',
    missing_information: 'Provide the missing reviewed species or aquarium information, then run the compatibility check again.',
  };
  return actions[family] || (
    status === 'insufficient_data'
      ? 'Provide the missing reviewed information, then run the compatibility check again.'
      : 'Address this reviewed condition before adding livestock, then reassess.'
  );
};

const judgmentFor = (status: CompatibilityDecision['status']) => getCompatibilityStatusLabelLocalized(status, true);

const defaultReasonFor = (status: CompatibilityDecision['status']) => ({
  compatible: 'No blocking conflict was found in the reviewed water, temperature, space, and behavior conditions.',
  caution: 'The plan can work only after the surfaced conditions are addressed and monitored.',
  not_recommended: 'At least one reviewed condition creates a blocking compatibility risk.',
  insufficient_data: 'The available reviewed information is not yet enough for a reliable compatibility conclusion.',
}[status]);

const defaultActionFor = (status: CompatibilityDecision['status']) => ({
  compatible: 'Add gradually and keep observing breathing, feeding, hiding, and aggression.',
  caution: 'Make the required adjustment first, then recheck the affected condition before adding livestock.',
  not_recommended: 'Do not add this combination while the blocking risk remains; separate or change the plan.',
  insufficient_data: 'Complete the missing information first, then run the compatibility check again.',
}[status]);

const expectedFor = (status: CompatibilityDecision['status']) => ({
  compatible: 'The aquarium remains stable after the addition, with normal breathing, feeding, and behavior.',
  caution: 'The surfaced warning is removed or reduced to an acceptable reviewed condition before the plan continues.',
  not_recommended: 'The blocking conflict is removed through separation, replacement, or another deterministic clearance action.',
  insufficient_data: 'A new deterministic result can be issued after the missing information is supplied.',
}[status]);

const checkpointFor = (status: CompatibilityDecision['status']) => (
  status === 'insufficient_data'
    ? 'Re-run the compatibility check immediately after the missing information is added.'
    : 'Recheck after the adjustment and again after introduction for breathing, feeding, chasing, hiding, and injury.'
);

const stopFor = (status: CompatibilityDecision['status']) => (
  status === 'compatible'
    ? 'Separate and reassess if sustained chasing, injury, refusal to eat, prolonged hiding, or breathing distress appears.'
    : status === 'insufficient_data'
      ? 'Do not treat the risk as cleared until a new deterministic result is available.'
      : 'Stop the addition or separate the animals if the surfaced conflict remains or sustained chasing, injury, appetite loss, hiding, or breathing distress appears.'
);

const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

export const projectCompatibilityAssessmentForLocale = ({
  model,
  decision,
  isEnglish,
}: {
  model: CompatibilityAssessmentUiModel | null;
  decision: CompatibilityDecision | null | undefined;
  isEnglish: boolean;
}): CompatibilityAssessmentPresentation | null => {
  if (!model || !decision) return null;

  if (!isEnglish) {
    return {
      judgment: model.main.judgment,
      why: model.main.why.slice(0, 1),
      howTo: model.main.howTo.slice(0, 1),
      plan: {
        nextSteps: model.decisionPlan.nextSteps,
        expectedAfterAdjustment: model.decisionPlan.expectedAfterAdjustment,
        reviewCheckpoint: model.decisionPlan.reviewCheckpoint,
        stopCondition: model.decisionPlan.stopCondition,
        actionSequence: (model.decisionPlan.actionSequence || []).map(step => ({
          state: step.state,
          riskFamily: step.riskFamily,
          action: step.action,
          sourceRuleCode: step.sourceRuleCode,
          blockedByHardStop: step.blockedByHardStop,
        })),
      },
      details: {
        label: model.details.label,
        reasons: model.details.reasons,
      },
    };
  }

  const rules = rulesForDecision(decision);
  const families = unique(rules.map(rule => getCompatibilityRuleFamily(rule.code)));
  const why = unique((families.length ? families : ['missing_information'])
    .map(family => familyReason(family, decision.status)))
    .slice(0, 1);
  const howTo = unique((families.length ? families : ['missing_information'])
    .map(family => familyAction(family, decision.status)))
    .slice(0, 1);

  const englishAiReasons = model.details.reasons
    .filter(item => item.text && !hasCjk(item.text))
    .slice(0, 3);

  return {
    judgment: judgmentFor(decision.status),
    why: why.length ? why : [defaultReasonFor(decision.status)],
    howTo: howTo.length ? howTo : [defaultActionFor(decision.status)],
    plan: {
      nextSteps: howTo.length ? howTo : [defaultActionFor(decision.status)],
      expectedAfterAdjustment: expectedFor(decision.status),
      reviewCheckpoint: checkpointFor(decision.status),
      stopCondition: stopFor(decision.status),
      actionSequence: (model.decisionPlan.actionSequence || []).map(step => ({
        state: step.state,
        riskFamily: step.riskFamily,
        action: familyAction(
          step.riskFamily,
          step.state === 'deferred' ? 'caution' : decision.status,
        ),
        sourceRuleCode: step.sourceRuleCode,
        blockedByHardStop: step.blockedByHardStop,
      })),
    },
    details: {
      label: 'View evidence',
      reasons: englishAiReasons,
    },
  };
};

export { getCompatibilityStatusLabelLocalized } from './compatibility-status-label.service';

export const getCompatibilityRuleFamilyEnglishReason = familyReason;
