import type { CareActionEvidence } from '../../data/careEvidence';
import type { TankCompatibilityRule, TankCompatibilityRiskLevel, TankCompatibilityStatus } from '../../lib/tankCompatibilityEngine';
import type { DecisionResultTone, DecisionSource } from '../../components/result/DecisionResultSurface';

export const riskTone = (risk: 'low' | 'medium' | 'high' | 'unknown'): DecisionResultTone => (
  risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : risk === 'unknown' ? 'info' : 'success'
);

export const compatibilityTone = (status: TankCompatibilityStatus): DecisionResultTone => (
  status === 'not_recommended' ? 'danger' : status === 'caution' ? 'warning' : status === 'insufficient_data' ? 'info' : 'success'
);

export const careEvidenceSource = (evidence?: CareActionEvidence): DecisionSource | undefined => {
  const reference = evidence?.citations[0];
  if (!reference) return undefined;
  return {
    id: reference.id,
    label: reference.publisher,
    href: reference.url,
    detail: reference.title,
    status: evidence?.reviewStatus === 'reviewed' ? 'reviewed' : 'candidate',
  };
};

export const careEvidenceSources = (items: CareActionEvidence[]): DecisionSource[] => {
  const sources = items.flatMap(evidence => evidence.citations.map(reference => ({
    id: reference.id,
    label: reference.publisher,
    href: reference.url,
    detail: reference.title,
    status: evidence.reviewStatus === 'reviewed' ? 'reviewed' as const : 'candidate' as const,
  })));
  return Array.from(new Map(sources.map(source => [source.id, source])).values());
};

export const compatibilityRuleSources = (rules: TankCompatibilityRule[]): DecisionSource[] => {
  const sources = rules.flatMap(rule => rule.citations.map(reference => ({
    id: reference.id,
    label: reference.publisher,
    href: reference.url,
    detail: reference.title,
    status: rule.reviewStatus === 'reviewed' && reference.reviewStatus === 'reviewed' ? 'reviewed' as const : 'candidate' as const,
  })));
  return Array.from(new Map(sources.map(source => [source.id, source])).values());
};

export const diagnosisEscalationSignals = (risk: 'low' | 'medium' | 'high' | 'unknown', isEn: boolean): string[] => {
  if (risk === 'high') {
    return isEn
      ? ['Breathing or activity keeps worsening after the first intervention', 'More animals develop the same sign', 'Loss of balance, collapse, or a new death appears']
      : ['处理后呼吸或活动仍继续恶化', '更多生物开始出现同样异常', '出现失衡、侧卧或新的死亡'];
  }
  if (risk === 'medium') {
    return isEn
      ? ['No improvement after 2–4 hours', 'The same sign spreads to more animals']
      : ['处理 2–4 小时后没有改善', '同样异常扩大到更多生物'];
  }
  if (risk === 'unknown') {
    return isEn
      ? ['You cannot confirm key observations', 'A severe sign appears while information is still missing']
      : ['关键观察仍无法确认', '信息未补全时出现明显严重症状'];
  }
  return isEn
    ? ['The sign becomes obvious or keeps returning', 'A second symptom appears']
    : ['异常变明显或反复出现', '开始出现第二种异常症状'];
};

export const compatibilityEscalationSignals = (status: TankCompatibilityStatus, riskLevel: TankCompatibilityRiskLevel, isEn: boolean): string[] => {
  if (status === 'not_recommended') return [];
  if (status === 'insufficient_data') {
    return isEn
      ? ['Do not stock before the missing tank or pair evidence is completed']
      : ['缺失的鱼缸或配对证据补齐前不要入缸'];
  }
  if (status === 'caution' || riskLevel === 'medium') {
    return isEn
      ? ['Repeated chasing or one animal cannot feed normally', 'Fin damage, hiding, or sustained stress appears']
      : ['出现持续追咬或某个体无法正常进食', '出现伤鳍、持续躲藏或明显应激'];
  }
  return isEn
    ? ['Repeated chasing, feeding exclusion, or injury appears after stocking']
    : ['入缸后出现持续追咬、抢不到食物或受伤'];
};
