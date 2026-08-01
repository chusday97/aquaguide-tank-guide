import { endOfWeek, format, isBefore, startOfDay, startOfWeek } from 'date-fns';
import type { Aquarium } from '../../types';
import type { DiagnosisOutput } from '../../modules/diagnosis/diagnosis.types';
import type { CareReminderRecord } from '../care/care-activity.service';
import type { ExportArtifactContent } from '../../components/export/ExportArtifactDialog';
import type { SanitizedAquariumReport } from '../../../packages/contracts/src/share-reports';

export type AquariumArtifactSpecies = {
  catalogKey?: string;
  name: string;
  quantity: number;
};

export type AquariumArtifactContext = {
  aquarium: Aquarium;
  healthScore: number;
  healthStatus: string;
  healthReasons: string[];
  missingData: string[];
  nextAction: string;
  species: AquariumArtifactSpecies[];
  careReminders: CareReminderRecord[];
  latestDiagnosis?: DiagnosisOutput;
  isEn?: boolean;
};

const disclaimer = (isEn: boolean) => isEn
  ? 'Generated only from records entered in AquaGuide. This is not real-time monitoring from a smart device.'
  : '仅根据用户在 AquaGuide 中的记录生成，并非智能设备实时检测。';

const containsCjk = (value: string) => /[\u3400-\u9fff]/u.test(value);

const englishSystemText = (value: string | undefined, fallback: string) =>
  value && !containsCjk(value) ? value : fallback;

const localizedReminderTitle = (reminder: CareReminderRecord, isEn: boolean) =>
  isEn ? englishSystemText(reminder.title, 'Aquarium care task') : reminder.title;

const localizedFilterLabel = (value: string, isEn: boolean) => {
  if (!isEn) return value;
  const known: Record<string, string> = {
    瀑布过滤: 'Hang-on-back filter',
    海绵过滤: 'Sponge filter',
    内置过滤: 'Internal filter',
    外置过滤桶: 'Canister filter',
    底滤: 'Sump filter',
    无过滤: 'No filter',
  };
  return known[value] || englishSystemText(value, 'Configured filter');
};

const fileName = (aquarium: Aquarium, label: string) =>
  `AquaGuide-${aquarium.name}-${label}-${format(new Date(), 'yyyy-MM-dd')}.png`;

export const buildStarterChecklistArtifact = ({ labels, states, isEn = false }: { labels: string[]; states: boolean[]; isEn?: boolean }): ExportArtifactContent => {
  const completed = states.filter(Boolean).length;
  const nextIndex = states.findIndex(done => !done);
  return {
    eyebrow: isEn ? 'Starter checklist' : '新手开缸清单',
    title: isEn ? 'My first aquarium' : '我的第一口鱼缸',
    summary: isEn ? `${completed} of ${labels.length} steps complete.` : `已完成 ${completed} / ${labels.length} 项。`,
    metric: `${completed}/${labels.length}`,
    sections: [
      { title: isEn ? 'Checklist' : '开缸清单', items: labels.map((label, index) => `${states[index] ? '✓' : '○'} ${label}`) },
      { title: isEn ? 'Next step' : '下一步', items: [labels[nextIndex] || (isEn ? 'Keep observing the aquarium.' : '继续每天观察鱼缸。')], tone: 'success' },
    ],
    fileName: `AquaGuide-${isEn ? 'starter-checklist' : '新手开缸清单'}-${format(new Date(), 'yyyy-MM-dd')}.png`,
    disclaimer: isEn ? 'Generated from your recorded progress.' : '仅根据你在 AquaGuide 中的真实完成记录生成。',
  };
};

export const buildHealthScoreArtifact = (context: AquariumArtifactContext): ExportArtifactContent => ({
  eyebrow: context.isEn ? 'Health score' : '鱼缸健康评分',
  title: context.aquarium.name,
  summary: context.isEn ? `Current status: ${context.healthStatus}` : `当前状态：${context.healthStatus}`,
  metric: String(context.healthScore),
  sections: [
    {
      title: context.isEn ? 'Main evidence' : '主要依据',
      items: context.healthReasons.slice(0, 3),
      tone: context.healthScore >= 80 ? 'success' : 'warning',
    },
    {
      title: context.isEn ? 'Missing records' : '缺失信息',
      items: context.missingData.length ? context.missingData : [context.isEn ? 'No key gaps recorded.' : '当前没有关键缺失项。'],
    },
    { title: context.isEn ? 'Next action' : '下一步', items: [context.nextAction] },
  ],
  fileName: fileName(context.aquarium, context.isEn ? 'health-score' : '健康评分'),
  disclaimer: disclaimer(Boolean(context.isEn)),
});

export const buildDiagnosisArtifact = (
  context: AquariumArtifactContext,
  diagnosis: DiagnosisOutput,
): ExportArtifactContent => {
  const isEn = Boolean(context.isEn);
  const actionFallback = diagnosis.riskLevel === 'high'
    ? 'Follow the urgent care steps shown in AquaGuide.'
    : 'Follow the recommended care step shown in AquaGuide.';
  return {
    eyebrow: isEn ? 'Diagnosis result' : '诊断结果',
    title: context.aquarium.name,
    summary: isEn
      ? englishSystemText(diagnosis.summary, 'Review the structured aquarium check result.')
      : diagnosis.summary,
    metric: isEn
      ? ({ low: 'Routine', medium: 'Watch', high: 'Urgent', unknown: 'More information needed' }[diagnosis.riskLevel])
      : diagnosis.riskLabel,
    sections: [
      {
        title: isEn ? 'Act now' : '立即动作',
        items: isEn
          ? [englishSystemText(diagnosis.currentAction, actionFallback)]
          : [diagnosis.currentAction, ...diagnosis.actions].filter(Boolean).slice(0, 3),
        tone: diagnosis.riskLevel === 'high' ? 'warning' : 'default',
      },
      {
        title: isEn ? 'Possible reasons' : '可能原因',
        items: isEn
          ? diagnosis.possibleCauses.slice(0, 3).map((item, index) => englishSystemText(item, `Possible factor ${index + 1}`))
          : diagnosis.possibleCauses.slice(0, 3),
      },
      {
        title: isEn ? 'Avoid' : '暂时不要做',
        items: isEn
          ? diagnosis.avoidActions.slice(0, 3).map(item => englishSystemText(item, 'Avoid unverified medication or abrupt environmental changes.'))
          : diagnosis.avoidActions.slice(0, 3),
        tone: 'warning',
      },
      {
        title: isEn ? 'Review time' : '复查时间',
        items: [isEn
          ? englishSystemText(diagnosis.nextCheckAt, 'Follow the review timing shown in the result.')
          : diagnosis.nextCheckAt || '按结果页提示复查。'],
      },
    ],
    fileName: fileName(context.aquarium, isEn ? 'diagnosis' : '诊断结果'),
    disclaimer: disclaimer(isEn),
  };
};

export const buildWeeklyCareArtifact = (context: AquariumArtifactContext): ExportArtifactContent => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const overdue: string[] = [];
  const weekly: string[] = [];
  context.careReminders.forEach(reminder => {
    const date = new Date(reminder.scheduledFor);
    const item = `${format(date, 'MM/dd')} · ${localizedReminderTitle(reminder, Boolean(context.isEn))} · ${reminder.completedAt ? (context.isEn ? 'Done' : '已完成') : (context.isEn ? 'Pending' : '待完成')}`;
    if (!reminder.completedAt && isBefore(date, startOfDay(weekStart))) overdue.push(item);
    else if (date >= weekStart && date <= weekEnd) weekly.push(item);
  });
  return {
    eyebrow: context.isEn ? 'Weekly care plan' : '本周养护计划',
    title: context.aquarium.name,
    summary: `${format(weekStart, 'MM/dd')} – ${format(weekEnd, 'MM/dd')}`,
    sections: [
      { title: context.isEn ? 'Do first' : '优先补做', items: overdue, tone: overdue.length ? 'warning' : 'default' },
      { title: context.isEn ? 'Monday to Sunday' : '周一至周日', items: weekly },
    ],
    fileName: fileName(context.aquarium, context.isEn ? 'weekly-care' : '本周养护计划'),
    disclaimer: disclaimer(Boolean(context.isEn)),
  };
};

export const buildAquariumArchiveArtifact = (context: AquariumArtifactContext): ExportArtifactContent => {
  const aquarium = context.aquarium;
  const dimensions = aquarium.dimensions
    ? `${aquarium.dimensions.length} × ${aquarium.dimensions.width} × ${aquarium.dimensions.height} cm`
    : (context.isEn ? 'Not recorded' : '未记录');
  const equipment = [
    aquarium.equipment?.filter && `${context.isEn ? 'Filter' : '过滤'}：${localizedFilterLabel(aquarium.equipment.filter, Boolean(context.isEn))}`,
    aquarium.equipment?.heater != null && `${context.isEn ? 'Heater' : '加热'}：${aquarium.equipment.heater ? (context.isEn ? 'On' : '有') : (context.isEn ? 'Off' : '无')}`,
    aquarium.equipment?.oxygen != null && `${context.isEn ? 'Aeration' : '增氧'}：${aquarium.equipment.oxygen ? (context.isEn ? 'On' : '有') : (context.isEn ? 'Off' : '无')}`,
  ].filter(Boolean) as string[];
  return {
    eyebrow: context.isEn ? 'Aquarium archive' : '鱼缸档案',
    title: aquarium.name,
    summary: context.isEn ? `${context.healthStatus} · score ${context.healthScore}` : `${context.healthStatus} · 健康评分 ${context.healthScore}`,
    sections: [
      { title: context.isEn ? 'Environment' : '基础环境', items: [dimensions, `${aquarium.waterType === 'Saltwater' ? (context.isEn ? 'Saltwater' : '海水') : (context.isEn ? 'Freshwater' : '淡水')} · ${aquarium.targetTemperature || '—'}℃`] },
      { title: context.isEn ? 'Equipment' : '设备概况', items: equipment },
      { title: context.isEn ? 'Livestock' : '全部物种汇总', items: context.species.map(item => `${item.name} × ${item.quantity}`) },
      { title: context.isEn ? 'Recent care' : '最近养护', items: [
        context.latestDiagnosis
          ? (context.isEn ? englishSystemText(context.latestDiagnosis.summary, 'A recent structured check is available.') : context.latestDiagnosis.summary)
          : (context.isEn ? 'No recent diagnosis result.' : '暂无最近诊断结果。'),
        context.careReminders[0]
          ? localizedReminderTitle(context.careReminders[0], Boolean(context.isEn))
          : (context.isEn ? 'No active care plan.' : '暂无待办养护计划。'),
      ] },
    ],
    fileName: fileName(aquarium, context.isEn ? 'aquarium-archive' : '鱼缸档案'),
    disclaimer: disclaimer(Boolean(context.isEn)),
  };
};

export const buildHundredDayArtifact = (context: AquariumArtifactContext, days: number): ExportArtifactContent => ({
  eyebrow: context.isEn ? 'Aquarium milestone' : '鱼缸纪念',
  title: context.isEn ? `My aquarium is ${days} days old` : `我的鱼缸养了 ${days} 天`,
  summary: context.isEn ? 'A record of patient care and daily observation.' : '把每天的观察和照料，积累成一口稳定的鱼缸。',
  metric: `${days}`,
  sections: [
    { title: context.isEn ? 'Today' : '今天的鱼缸', items: [
      context.isEn ? `${context.species.length} species recorded` : `已记录 ${context.species.length} 种生物`,
      context.isEn ? `Health status: ${context.healthStatus}` : `健康状态：${context.healthStatus}`,
    ], tone: 'success' },
    { title: context.isEn ? 'Keep going' : '继续守护', items: [context.nextAction] },
  ],
  fileName: fileName(context.aquarium, context.isEn ? `${days}-day-milestone` : `${days}天纪念`),
  disclaimer: disclaimer(Boolean(context.isEn)),
});

export const buildSanitizedAquariumReport = (context: AquariumArtifactContext): SanitizedAquariumReport => {
  const generatedAt = new Date();
  const length = Number(context.aquarium.dimensions?.length || 0);
  const width = Number(context.aquarium.dimensions?.width || 0);
  const height = Number(context.aquarium.dimensions?.height || 0);
  const volumeLiters = length > 0 && width > 0 && height > 0
    ? Math.round((length * width * height / 1000) * 0.85)
    : undefined;
  return {
    snapshotVersion: 1,
    generatedAt: generatedAt.toISOString(),
    expiresAt: new Date(generatedAt.getTime() + 7 * 86_400_000).toISOString(),
    health: {
      score: context.healthScore,
      status: context.healthStatus,
      reasons: context.healthReasons.slice(0, 3),
      nextAction: context.nextAction,
      missingData: context.missingData.slice(0, 8),
    },
    environment: {
      waterType: context.aquarium.waterType,
      volumeLiters,
      targetTemperatureC: context.aquarium.targetTemperature ? Number(context.aquarium.targetTemperature) : undefined,
      equipment: [
        context.aquarium.equipment?.filter && `${context.isEn ? 'Filter' : '过滤'}：${localizedFilterLabel(context.aquarium.equipment.filter, Boolean(context.isEn))}`,
        context.aquarium.equipment?.heater != null && `${context.isEn ? 'Heater' : '加热'}：${context.aquarium.equipment.heater ? (context.isEn ? 'On' : '有') : (context.isEn ? 'Off' : '无')}`,
        context.aquarium.equipment?.oxygen != null && `${context.isEn ? 'Aeration' : '增氧'}：${context.aquarium.equipment.oxygen ? (context.isEn ? 'On' : '有') : (context.isEn ? 'Off' : '无')}`,
      ].filter(Boolean) as string[],
    },
    species: context.species.map(item => ({
      catalogKey: item.catalogKey || item.name,
      name: item.name,
      quantity: item.quantity,
    })),
    latestDiagnosis: context.latestDiagnosis ? {
      riskLevel: context.isEn
        ? ({ low: 'Routine', medium: 'Watch', high: 'Urgent', unknown: 'More information needed' }[context.latestDiagnosis.riskLevel])
        : context.latestDiagnosis.riskLabel,
      conclusion: context.isEn
        ? englishSystemText(context.latestDiagnosis.summary, 'A structured aquarium check found an item to review.')
        : context.latestDiagnosis.summary,
      actions: context.isEn
        ? [englishSystemText(
          context.latestDiagnosis.currentAction,
          context.latestDiagnosis.riskLevel === 'high'
            ? 'Follow the urgent care steps shown in AquaGuide.'
            : 'Follow the recommended care step shown in AquaGuide.',
        )]
        : [context.latestDiagnosis.currentAction, ...context.latestDiagnosis.actions].filter(Boolean).slice(0, 8),
    } : undefined,
    weeklyCarePlan: context.careReminders.slice(0, 50).map(reminder => ({
      title: localizedReminderTitle(reminder, Boolean(context.isEn)),
      dayLabel: format(new Date(reminder.scheduledFor), 'MM/dd'),
      status: reminder.completedAt ? 'completed' : new Date(reminder.scheduledFor) < startOfDay(new Date()) ? 'overdue' : 'pending',
    })),
    disclaimer: disclaimer(Boolean(context.isEn)),
  };
};
