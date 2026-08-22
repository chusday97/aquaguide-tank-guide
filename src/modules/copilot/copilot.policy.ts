import type {
  CopilotQuestion,
  TankCopilotAction,
  TankCopilotActionType,
  TankCopilotContext,
  TankCopilotResponse,
} from './copilot.types';

export type CopilotResponseCore = Omit<TankCopilotResponse, 'source' | 'generatedAt' | 'task' | 'failureReason'>;

const ACTION_LABELS: Record<TankCopilotActionType, string> = {
  complete_tank_info: '完善鱼缸信息',
  view_safe_candidates: '查看候选生物',
  start_addition_simulation: '进入模拟添加',
  restart_goal: '重新描述目标',
};

const getMissingInformationKey = (item: string): CopilotQuestion['informationKey'] | null => {
  const value = item.toLowerCase();
  if (/尺寸|容量|长|宽|高|size|volume/.test(value)) return 'tank_size';
  if (/水体|淡水|海水|water/.test(value)) return 'water_type';
  if (/温度|水温|temperature/.test(value)) return 'temperature';
  if (/过滤|filter/.test(value)) return 'filter';
  return null;
};

const buildLocalQuestions = (context: TankCopilotContext): CopilotQuestion[] => {
  const prompts: Partial<Record<CopilotQuestion['informationKey'], string>> = {
    tank_size: '请补充鱼缸容量或长宽高。',
    water_type: '这个鱼缸计划使用淡水还是海水？',
    temperature: '计划把水温稳定在多少度？',
    filter: '准备使用哪种过滤设备？',
  };
  const seen = new Set<CopilotQuestion['informationKey']>();

  return context.missingInformation.reduce<CopilotQuestion[]>((questions, item) => {
    const informationKey = getMissingInformationKey(item);
    if (!informationKey || seen.has(informationKey) || questions.length >= 3) return questions;
    seen.add(informationKey);
    questions.push({
      id: `missing-${informationKey}`,
      informationKey,
      prompt: prompts[informationKey] ?? `请补充：${item}`,
    });
    return questions;
  }, []);
};

const getLocalCandidateIds = (context: TankCopilotContext) => (
  [...context.safeCandidates, ...context.adjustableCandidates]
    .map(item => item.speciesId)
    .filter(Boolean)
    .slice(0, 6)
);

const fallbackAction = (context: TankCopilotContext, candidateIds: string[]): TankCopilotAction => {
  if (context.missingInformation.length > 0) {
    return { type: 'complete_tank_info', label: ACTION_LABELS.complete_tank_info };
  }
  if (candidateIds.length > 0) {
    return { type: 'view_safe_candidates', label: ACTION_LABELS.view_safe_candidates };
  }
  return { type: 'restart_goal', label: ACTION_LABELS.restart_goal };
};

export const buildLocalTankCopilotFallback = (context: TankCopilotContext): CopilotResponseCore => {
  const candidateIds = getLocalCandidateIds(context);
  const questions = buildLocalQuestions(context);

  return {
    goalUnderstanding: context.goal.trim()
      ? `目标：${context.goal.trim()}。当前先使用本地鱼缸资料与规则生成基础方向。`
      : '请先描述想建的鱼缸类型、维护投入和观赏偏好。',
    missingQuestions: questions,
    planSummary: questions.length > 0
      ? '补齐关键鱼缸信息后，系统才能给出可靠的物种组合。'
      : candidateIds.length > 0
        ? '本地规则已筛出可查看的候选，建议先查看候选并进行模拟添加。'
        : '当前没有可执行候选，请调整目标或补充鱼缸条件后重新评估。',
    recommendedActions: [fallbackAction(context, candidateIds)],
    selectedCandidateIds: candidateIds,
    blockedExplanation: context.blockedReasons.slice(0, 5),
  };
};

const isActionExecutable = (
  type: TankCopilotActionType,
  context: TankCopilotContext,
  candidateIds: string[],
) => {
  if (type === 'complete_tank_info') return context.missingInformation.length > 0;
  if (type === 'view_safe_candidates' || type === 'start_addition_simulation') return candidateIds.length > 0;
  return type === 'restart_goal';
};

const mergeQuestionsByInformationKey = (
  preferred: CopilotQuestion[],
  secondary: CopilotQuestion[],
) => {
  const seen = new Set<CopilotQuestion['informationKey']>();
  return [...preferred, ...secondary].reduce<CopilotQuestion[]>((questions, question) => {
    if (questions.length >= 3 || seen.has(question.informationKey)) return questions;
    seen.add(question.informationKey);
    questions.push(question);
    return questions;
  }, []);
};

export const sanitizeTankCopilotResponse = (
  response: CopilotResponseCore,
  context: TankCopilotContext,
): CopilotResponseCore => {
  const localCandidateIds = getLocalCandidateIds(context);
  const candidatePool = new Set(localCandidateIds);
  const modelCandidateIds = [...new Set(response.selectedCandidateIds)]
    .filter(id => candidatePool.has(id))
    .slice(0, 6);

  // A syntactically valid model response is still unusable if it throws away all
  // locally-approved candidates. Recover to the deterministic pool rather than
  // sending the user back to "restart goal" for no product reason.
  const selectedCandidateIds = context.missingInformation.length === 0
    && modelCandidateIds.length === 0
    && localCandidateIds.length > 0
      ? localCandidateIds
      : modelCandidateIds;

  const allowedQuestionKeys = new Set<CopilotQuestion['informationKey']>(['preference']);
  context.missingInformation.forEach((item) => {
    const key = getMissingInformationKey(item);
    if (key) allowedQuestionKeys.add(key);
  });

  const seenModelQuestionKeys = new Set<CopilotQuestion['informationKey']>();
  const modelQuestions = response.missingQuestions.filter((question) => {
    if (!allowedQuestionKeys.has(question.informationKey) || seenModelQuestionKeys.has(question.informationKey)) return false;
    seenModelQuestionKeys.add(question.informationKey);
    return true;
  }).slice(0, 3);

  // Deterministic missing tank facts must outrank preference chatter. If the
  // model ignores a required field, restore the product-owned clarification.
  const missingQuestions = context.missingInformation.length > 0
    ? mergeQuestionsByInformationKey(buildLocalQuestions(context), modelQuestions)
    : modelQuestions;

  const seenActions = new Set<TankCopilotActionType>();
  const modelActions = response.recommendedActions.reduce<TankCopilotAction[]>((actions, action) => {
    if (actions.length >= 2 || seenActions.has(action.type)) return actions;
    if (!isActionExecutable(action.type, context, selectedCandidateIds)) return actions;
    seenActions.add(action.type);
    actions.push({ type: action.type, label: ACTION_LABELS[action.type] });
    return actions;
  }, []);

  let recommendedActions: TankCopilotAction[];
  if (context.missingInformation.length > 0) {
    recommendedActions = [{ type: 'complete_tank_info', label: ACTION_LABELS.complete_tank_info }];
  } else if (selectedCandidateIds.length > 0) {
    const candidateAction = modelActions.find(action => (
      action.type === 'start_addition_simulation' || action.type === 'view_safe_candidates'
    ));
    recommendedActions = candidateAction
      ? [candidateAction]
      : [{ type: 'view_safe_candidates', label: ACTION_LABELS.view_safe_candidates }];
  } else {
    recommendedActions = modelActions.length > 0
      ? modelActions
      : [{ type: 'restart_goal', label: ACTION_LABELS.restart_goal }];
  }

  return {
    goalUnderstanding: response.goalUnderstanding,
    missingQuestions,
    planSummary: response.planSummary,
    recommendedActions,
    selectedCandidateIds,
    blockedExplanation: response.blockedExplanation.slice(0, 5),
  };
};
