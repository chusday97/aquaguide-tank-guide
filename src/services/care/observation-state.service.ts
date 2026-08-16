import type { CareTimelineRecord } from '../repository/aquaguide.repository';
import type { LocalEventRecord } from '../storage/local-app-state';
import { getLocalDateKey } from './feeding-state.service';

export const OBSERVATION_SOURCE_TYPE = 'observation_record';
export const NO_OBVIOUS_ABNORMALITY_CODE = 'no_obvious_abnormality' as const;

export const OBSERVATION_CHECK_OPTIONS = [
  { code: 'surface_gasping', zh: '鱼浮在水面', en: 'Fish floating at surface' },
  { code: 'rapid_breathing', zh: '呼吸明显急促', en: 'Rapid breathing' },
  { code: 'bottom_sitting_or_hiding', zh: '趴缸或躲藏', en: 'Lying at bottom or hiding' },
  { code: 'feeding_abnormality', zh: '拒食或抢食异常', en: 'Refusing food or abnormal feeding' },
  { code: NO_OBVIOUS_ABNORMALITY_CODE, zh: '没有明显异常', en: 'No obvious abnormalities' },
] as const;

export type ObservationCheckCode = typeof OBSERVATION_CHECK_OPTIONS[number]['code'];
export type ObservationStatus = 'normal' | 'abnormal';

const observationCodes = new Set<string>(OBSERVATION_CHECK_OPTIONS.map(option => option.code));

export const isObservationCheckCode = (value: unknown): value is ObservationCheckCode => (
  typeof value === 'string' && observationCodes.has(value)
);

export const toggleObservationCheck = (
  current: ObservationCheckCode[],
  code: ObservationCheckCode,
): ObservationCheckCode[] => {
  if (code === NO_OBVIOUS_ABNORMALITY_CODE) {
    return current.includes(code) ? [] : [code];
  }
  const withoutNormal = current.filter(item => item !== NO_OBVIOUS_ABNORMALITY_CODE);
  return withoutNormal.includes(code)
    ? withoutNormal.filter(item => item !== code)
    : [...withoutNormal, code];
};

export const normalizeObservationChecks = (
  status: ObservationStatus,
  checks: ObservationCheckCode[],
): ObservationCheckCode[] => {
  if (status === 'normal') return [NO_OBVIOUS_ABNORMALITY_CODE];
  return checks.filter(code => code !== NO_OBVIOUS_ABNORMALITY_CODE);
};

export const getObservationCheckLabel = (code: ObservationCheckCode, isEn: boolean): string => {
  const option = OBSERVATION_CHECK_OPTIONS.find(item => item.code === code);
  if (!option) return code;
  return isEn ? option.en : option.zh;
};

export const getObservationNote = (
  status: ObservationStatus,
  checks: ObservationCheckCode[],
  isEn: boolean,
): string => {
  if (status === 'normal') return isEn ? 'No obvious breathing abnormality observed' : '未发现明显呼吸异常';
  const normalized = normalizeObservationChecks(status, checks);
  if (normalized.length === 0) return isEn ? 'Abnormal condition observed' : '发现异常';
  return normalized.map(code => getObservationCheckLabel(code, isEn)).join(isEn ? ', ' : '、');
};

const getEventLocalDate = (event: CareTimelineRecord): string => {
  const payloadLocalDate = event.payload?.localDate;
  if (typeof payloadLocalDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payloadLocalDate)) return payloadLocalDate;
  return getLocalDateKey(event.occurredAt);
};

export const getObservationEventsForDate = (
  events: CareTimelineRecord[],
  aquariumId: string,
  dateKey: string,
): CareTimelineRecord[] => events.filter(event => (
  event.aquariumId === aquariumId
  && event.eventType === 'observation'
  && getEventLocalDate(event) === dateKey
));

export const getLocalObservationRecordsForDate = (
  records: LocalEventRecord[],
  aquariumId: string,
  dateKey: string,
): LocalEventRecord[] => records.filter(record => (
  record.type === 'observation'
  && record.aquariumId === aquariumId
  && getLocalDateKey(record.createdAt) === dateKey
));

const statusFromEvent = (event: CareTimelineRecord): ObservationStatus | undefined => {
  const status = event.payload?.status;
  return status === 'normal' || status === 'abnormal' ? status : undefined;
};

const statusFromLegacyLocalRecord = (record: LocalEventRecord): ObservationStatus => {
  const note = record.note || '';
  return /未发现|没有明显|no obvious|no abnormal/i.test(note) ? 'normal' : 'abnormal';
};

export const getLatestObservationStatusForDate = ({
  events,
  localRecords,
  aquariumId,
  dateKey,
}: {
  events: CareTimelineRecord[];
  localRecords: LocalEventRecord[];
  aquariumId: string;
  dateKey: string;
}): ObservationStatus | undefined => {
  const persisted = getObservationEventsForDate(events, aquariumId, dateKey)
    .filter(event => statusFromEvent(event))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
  if (persisted) return statusFromEvent(persisted);

  const local = getLocalObservationRecordsForDate(localRecords, aquariumId, dateKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return local ? statusFromLegacyLocalRecord(local) : undefined;
};
