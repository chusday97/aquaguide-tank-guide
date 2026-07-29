import { endOfWeek, format, isBefore, startOfDay, startOfWeek } from 'date-fns';
import type { Aquarium } from '../../types';
import type { DiagnosisOutput } from '../../modules/diagnosis/diagnosis.types';
import type { CareReminderRecord } from '../care/care-activity.service';
import type { ExportArtifactContent } from '../../components/export/ExportArtifactDialog';

export type AquariumArtifactSpecies = {
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

const fileName = (aquarium: Aquarium, label: string) =>
  `AquaGuide-${aquarium.name}-${label}-${format(new Date(), 'yyyy-MM-dd')}.png`;

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
): ExportArtifactContent => ({
  eyebrow: context.isEn ? 'Diagnosis result' : '诊断结果',
  title: context.aquarium.name,
  summary: diagnosis.summary,
  metric: diagnosis.riskLabel,
  sections: [
    { title: context.isEn ? 'Act now' : '立即动作', items: [diagnosis.currentAction, ...diagnosis.actions].filter(Boolean).slice(0, 3), tone: diagnosis.riskLevel === 'high' ? 'warning' : 'default' },
    { title: context.isEn ? 'Possible reasons' : '可能原因', items: diagnosis.possibleCauses.slice(0, 3) },
    { title: context.isEn ? 'Avoid' : '暂时不要做', items: diagnosis.avoidActions.slice(0, 3), tone: 'warning' },
    { title: context.isEn ? 'Review time' : '复查时间', items: [diagnosis.nextCheckAt || (context.isEn ? 'Follow the result instructions.' : '按结果页提示复查。')] },
  ],
  fileName: fileName(context.aquarium, context.isEn ? 'diagnosis' : '诊断结果'),
  disclaimer: disclaimer(Boolean(context.isEn)),
});

export const buildWeeklyCareArtifact = (context: AquariumArtifactContext): ExportArtifactContent => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const overdue: string[] = [];
  const weekly: string[] = [];
  context.careReminders.forEach(reminder => {
    const date = new Date(reminder.scheduledFor);
    const item = `${format(date, 'MM/dd')} · ${reminder.title} · ${reminder.completedAt ? (context.isEn ? 'Done' : '已完成') : (context.isEn ? 'Pending' : '待完成')}`;
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
    aquarium.equipment?.filter && `${context.isEn ? 'Filter' : '过滤'}：${aquarium.equipment.filter}`,
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
        context.latestDiagnosis?.summary || (context.isEn ? 'No recent diagnosis result.' : '暂无最近诊断结果。'),
        context.careReminders[0]?.title || (context.isEn ? 'No active care plan.' : '暂无待办养护计划。'),
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
