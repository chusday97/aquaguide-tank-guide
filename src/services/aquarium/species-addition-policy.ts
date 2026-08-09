import type { SpeciesAdditionIntent, SpeciesAdditionPolicy } from '../../types';
import type { TankCompatibilityStatus } from '../../lib/tankCompatibilityEngine';

const recordPolicy: Record<TankCompatibilityStatus, SpeciesAdditionPolicy> = {
  compatible: 'save',
  caution: 'save_with_warning',
  insufficient_data: 'save_with_unknown',
  not_recommended: 'save_with_urgent_warning',
};

const plannedPolicy: Record<TankCompatibilityStatus, SpeciesAdditionPolicy> = {
  compatible: 'allow',
  caution: 'confirm',
  insufficient_data: 'complete_information',
  not_recommended: 'block',
};

export const getSpeciesAdditionPolicy = (input: {
  intent: SpeciesAdditionIntent;
  status: TankCompatibilityStatus;
}): SpeciesAdditionPolicy => input.intent === 'record_existing'
  ? recordPolicy[input.status]
  : plannedPolicy[input.status];
