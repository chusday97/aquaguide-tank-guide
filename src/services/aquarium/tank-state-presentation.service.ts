import type { Aquarium, Fish } from '../../types';
import type { CurrentTankStateEvidence } from './tank-state-evidence.service';

export type CurrentTankRiskItem = {
  group: '容量风险' | '水质参数冲突' | '混养风险' | '信息不足';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  detail: string;
  nextStep: string;
  subjects: Array<{ id: string; name: string; quantity: number }>;
  actionSteps: string[];
  avoidActions: string[];
  primaryAction: 'open_roster' | 'open_settings' | 'open_daily_check';
  primaryLabel: string;
};

const stockedSubjects = (aquarium: Aquarium, speciesCatalog: Fish[]) => aquarium.fishes.flatMap(record => {
  const species = speciesCatalog.find(item => item.id === record.fishId);
  return species ? [{ id: species.id, name: species.name, quantity: Math.max(1, record.quantity || 1) }] : [];
});

export const getCurrentTankRiskLevel = (evidence: CurrentTankStateEvidence | null) => {
  const state = evidence?.result.state;
  if (state === 'urgent') return 'high' as const;
  if (state === 'intervene') return 'medium' as const;
  if (state === 'watch') return 'low' as const;
  return 'none_recorded' as const;
};

export const getCurrentTankRiskCount = (evidence: CurrentTankStateEvidence | null) => (
  ['urgent', 'intervene', 'watch'].includes(evidence?.result.state || '') ? 1 : 0
);

export const buildCurrentTankRiskItems = ({
  aquarium,
  speciesCatalog,
  evidence,
}: {
  aquarium: Aquarium;
  speciesCatalog: Fish[];
  evidence: CurrentTankStateEvidence | null;
}): CurrentTankRiskItem[] => {
  if (!evidence) return [];
  const { result, hardConstraints } = evidence;
  const subjects = stockedSubjects(aquarium, speciesCatalog);

  if (hardConstraints.length > 0) {
    return [{
      group: '水质参数冲突',
      severity: 'danger',
      title: '当前存在不可折中的水体条件冲突',
      detail: result.reasons[0] || result.summary,
      nextStep: '优先把互斥水体需求拆分到不同稳定环境。',
      subjects,
      actionSteps: ['停止继续加入生物。', '确认哪些生物需要淡水、海水等互斥条件。', '准备稳定环境后再完成分缸，并更新缸内记录。'],
      avoidActions: ['不要用同一水体折中互斥条件', '不要快速来回调整盐度或其他关键参数', '不要放生'],
      primaryAction: 'open_roster',
      primaryLabel: '查看缸内生物',
    }];
  }

  if (result.state === 'urgent') {
    return [{
      group: '混养风险',
      severity: 'danger',
      title: '当前观察到需要优先处理的异常',
      detail: result.reasons[0] || result.summary,
      nextStep: '先处理当前异常，再根据复查结果决定是否调整组合。',
      subjects,
      actionSteps: ['先按当前异常的确定性处理建议行动。', '记录处理后的呼吸、活动、进食或伤情变化。', '异常未缓解时继续复查，不要只依据物种标签做决定。'],
      avoidActions: ['不要把理论混养风险当成唯一病因', '不要无证据盲目下药', '不要在未准备稳定环境时仓促转移全部生物'],
      primaryAction: 'open_daily_check',
      primaryLabel: '查看当前检查',
    }];
  }

  if (result.state === 'intervene') {
    return [{
      group: '混养风险',
      severity: 'danger',
      title: '当前异常已支持进行调整',
      detail: result.reasons[0] || result.summary,
      nextStep: '根据已观察到的追逐、躲藏、摄食受压或受伤事实降低冲突。',
      subjects,
      actionSteps: ['先确认被影响的具体个体与异常持续时间。', '优先增加有效躲避/视线遮挡，必要时使用稳定隔离或分缸。', '调整后继续记录 2-3 次观察，确认异常是否缓解。'],
      avoidActions: ['不要仅因为 Aggressive 标签直接移鱼', '不要把增加过滤当成领地冲突的解决方案', '不要放生'],
      primaryAction: 'open_roster',
      primaryLabel: '查看缸内生物',
    }];
  }

  if (result.state === 'watch') {
    return [{
      group: '混养风险',
      severity: 'warning',
      title: '当前建议继续观察',
      detail: result.summary,
      nextStep: result.observationTargets.length > 0 ? `重点观察：${result.observationTargets.slice(0, 3).join('、')}。` : '补充一次当前鱼缸检查，再决定是否需要调整。',
      subjects,
      actionSteps: ['完成一次当前状态检查。', '记录追逐、躲藏、摄食和伤情是否真实发生。', '只有异常持续或相互印证时再升级处理。'],
      avoidActions: ['不要把理论风险直接当成当前冲突', '不要仅因推荐缸容差距立即移鱼或换缸', '不要制造没有观察依据的精确负载结论'],
      primaryAction: 'open_daily_check',
      primaryLabel: '记录当前状态',
    }];
  }

  return [];
};

