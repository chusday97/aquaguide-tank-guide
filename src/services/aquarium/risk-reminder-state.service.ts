export type RiskReminderStatusCode = 'observed_normal' | 'observed_abnormal' | 'reviewed';

const legacyStatusMap: Record<string, RiskReminderStatusCode> = {
  observed_normal: 'observed_normal',
  observed_abnormal: 'observed_abnormal',
  reviewed: 'reviewed',
  '已观察': 'observed_normal',
  '已发现异常': 'observed_abnormal',
  '已查看': 'reviewed',
  Observed: 'observed_normal',
  'Abnormality logged': 'observed_abnormal',
  Reviewed: 'reviewed',
};

export const normalizeRiskReminderStatus = (value: string | undefined): RiskReminderStatusCode | undefined => (
  value ? legacyStatusMap[value] : undefined
);

export const normalizeRiskReminderState = (state: Record<string, string> | undefined): Record<string, RiskReminderStatusCode> => {
  const normalized: Record<string, RiskReminderStatusCode> = {};
  Object.entries(state || {}).forEach(([key, value]) => {
    const code = normalizeRiskReminderStatus(value);
    if (code) normalized[key] = code;
  });
  return normalized;
};

export const getRiskReminderStatusLabel = (status: RiskReminderStatusCode | undefined, isEnglish: boolean) => {
  if (!status) return '';
  if (status === 'observed_normal') return isEnglish ? 'Observed' : '已观察';
  if (status === 'observed_abnormal') return isEnglish ? 'Abnormality logged' : '已发现异常';
  return isEnglish ? 'Reviewed' : '已查看';
};

export const isRiskReminderDone = (status: RiskReminderStatusCode | undefined) => Boolean(status);
