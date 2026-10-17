import type { CareTimelineItem } from './care-timeline.service';
import type { CareReminderRecord } from './care-activity.service';
import { getCanonicalRuntimeFish } from '../../data/runtimeRuleContent';
import { getDiagnosisProblemPresentation } from '../../modules/diagnosis/diagnosis.presentation';
import { isDiagnosisProblemType } from '../../modules/diagnosis/diagnosis.questionBank';
import { getObservationHistoryTitle, presentObservationNote } from '../aquarium/observation-presentation.service';

const asString = (value: unknown) => typeof value === 'string' ? value : '';
const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

const speciesEnglishName = (speciesId: unknown) => {
  if (typeof speciesId !== 'string') return '';
  const species = getCanonicalRuntimeFish(speciesId);
  return species?.scientificName || species?.name || '';
};

const problemTypeFromItem = (item: CareTimelineItem) => {
  const payloadType = asString(item.payload?.problemType);
  if (isDiagnosisProblemType(payloadType)) return payloadType;
  const candidates = [
    item.title.replace(/^完成/, ''),
    item.title.replace(/^Completed\s+/, ''),
  ];
  return candidates.find(isDiagnosisProblemType);
};

const riskLabelEnglish = (value: unknown) => {
  if (value === 'high') return 'High risk';
  if (value === 'medium') return 'Needs attention';
  if (value === 'unknown') return 'Insufficient information';
  if (value === 'low') return 'Low risk';
  return '';
};

const titleEnglish = (item: CareTimelineItem) => {
  if (item.eventType === 'observation') return getObservationHistoryTitle(true);
  if (item.eventType === 'aquarium_created') return 'Aquarium created';
  if (item.eventType === 'aquarium_deleted') return 'Aquarium record ended';
  if (item.eventType === 'life_stage_updated') return 'Updated livestock state';
  if (item.eventType === 'species_added') {
    const name = speciesEnglishName(item.payload?.speciesId);
    return name ? `Added ${name}` : 'Added livestock';
  }
  if (item.eventType === 'species_removed') {
    const name = speciesEnglishName(item.payload?.speciesId);
    return name ? `Removed ${name}` : 'Removed livestock';
  }
  if (item.eventType === 'water_change') {
    return item.sourceType === 'water_change_reversal' || item.payload?.reversed === true
      ? "Undid today's water-change record"
      : 'Logged water change';
  }
  if (item.eventType === 'feeding') return 'Logged feeding';
  if (item.eventType === 'daily_check') {
    const problemType = problemTypeFromItem(item);
    if (!problemType || problemType === '巡检') return 'Completed daily check';
    return `Completed ${getDiagnosisProblemPresentation(problemType, true).label}`;
  }
  if (item.eventType === 'care_plan_completed') return 'Completed care plan';
  if (item.eventType === 'checklist_completed') return 'Completed checklist';
  if (item.eventType === 'settings_updated') {
    if (item.sourceType === 'aquarium_rename') return 'Renamed aquarium';
    return 'Updated aquarium settings';
  }
  return hasCjk(item.title) ? 'Aquarium activity' : item.title;
};

const labelEnglish = (item: CareTimelineItem) => {
  if (item.eventType === 'observation') return presentObservationNote(item.label, true);
  if (item.eventType === 'aquarium_created') {
    return item.isInferred || item.label === '日期由旧记录推算' ? 'Date inferred from older records' : undefined;
  }
  if (item.eventType === 'life_stage_updated') return 'Quantity and state changes saved';
  if (item.eventType === 'species_added' || item.eventType === 'species_removed') {
    const quantity = asNumber(item.payload?.quantity);
    if (quantity != null) return `${quantity} animals`;
    const match = item.label?.match(/(\d+)/);
    return match ? `${match[1]} animals` : undefined;
  }
  if (item.eventType === 'settings_updated') {
    if (item.sourceType === 'aquarium_rename') {
      const name = asString(item.payload?.aquariumName)
        || item.label?.replace(/^Renamed to\s+/, '').replace(/^已改为[“"]|[”"]$/g, '');
      return name ? `Renamed to ${name}` : undefined;
    }
    return 'Environment and equipment settings saved';
  }
  if (item.eventType === 'feeding') {
    return item.label ? (hasCjk(item.label) || item.label === 'Feeding Record' ? 'Feeding record' : item.label) : undefined;
  }
  if (item.eventType === 'daily_check') {
    return riskLabelEnglish(item.payload?.riskLevel) || undefined;
  }
  if (item.eventType === 'care_plan_completed') {
    const title = asString(item.payload?.reminderTitle);
    return title && !hasCjk(title) ? title : undefined;
  }
  if (item.eventType === 'aquarium_deleted') return item.label;
  return item.label && !hasCjk(item.label) ? item.label : undefined;
};

export const presentCareTimelineItem = (
  item: CareTimelineItem,
  isEnglish: boolean,
): { title: string; label?: string } => {
  if (!isEnglish) {
    return {
      title: item.eventType === 'observation' ? getObservationHistoryTitle(false) : item.title,
      label: item.eventType === 'observation' ? presentObservationNote(item.label, false) : item.label,
    };
  }
  return { title: titleEnglish(item), label: labelEnglish(item) };
};

const recurringTitleEnglish: Record<string, string> = {
  feeding: 'Feeding reminder',
  water_change: 'Water change reminder',
  general: 'General care reminder',
};

export const getCareReminderTitlePresentation = (reminder: CareReminderRecord, isEnglish: boolean) => {
  if (!isEnglish) return reminder.title;
  return recurringTitleEnglish[reminder.type]
    || (hasCjk(reminder.title) ? 'Care reminder' : reminder.title);
};

export const getCanonicalRecurringReminderTitle = (type: 'feeding' | 'water_change' | 'general') => ({
  feeding: '喂食计划',
  water_change: '换水计划',
  general: '通用养护计划',
}[type]);
