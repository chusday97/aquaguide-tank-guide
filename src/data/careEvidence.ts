import type { CareTopic } from './careTopicsData';

export type CareReferenceReviewStatus = 'reviewed' | 'draft';

export interface CareReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  supports: string;
  reviewStatus: CareReferenceReviewStatus;
}

export type CareActionKind = 'immediate' | 'avoid' | 'observe' | 'recheck' | 'next';

export interface CareActionEvidence {
  id: string;
  kind: CareActionKind;
  text: string;
  supportSummary: string;
  reviewStatus: CareReferenceReviewStatus;
  citations: CareReference[];
}

const sources = {
  aquariumManagement: {
    id: 'merck-aquarium-management',
    title: 'Management of Aquarium Fish',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/aquarium-fish/management-of-aquarium-fish',
    supports: '水质排查、生物过滤、隔离观察，以及原因未明时避免盲目用药。',
    reviewStatus: 'reviewed',
  },
  fishHome: {
    id: 'merck-providing-fish-home',
    title: 'Providing a Home for Fish',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/all-other-pets/fish/providing-a-home-for-fish',
    supports: '新水除氯、常规水质检测、温度与鱼缸环境管理。',
    reviewStatus: 'reviewed',
  },
  rspcaEnvironment: {
    id: 'rspca-fish-environment',
    title: 'Creating a suitable environment for fish',
    publisher: 'RSPCA',
    url: 'https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment',
    supports: '过滤、换水、除氯、温度匹配和新缸循环的基础操作。',
    reviewStatus: 'reviewed',
  },
  fishNutrition: {
    id: 'merck-fish-nutrition',
    title: 'Nutrition in Fish',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-exotic-and-zoo-animals/nutrition-in-fish',
    supports: '根据物种选择食物、控制投喂并避免营养或残饵问题。',
    reviewStatus: 'reviewed',
  },
  routineHealth: {
    id: 'merck-routine-fish-health',
    title: 'Routine Health Care of Fish',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/all-other-pets/fish/routine-health-care-of-fish',
    supports: '先检查水质、营养、清洁和隔离，再决定是否需要专业诊疗。',
    reviewStatus: 'reviewed',
  },
  marineGuide: {
    id: 'uf-ifas-marine-aquarium-guide',
    title: 'Marine Aquarium Project Book',
    publisher: 'UF/IFAS Extension',
    url: 'https://edis.ifas.ufl.edu/publication/4H433/pdf',
    supports: '海水缸用水、盐度、过滤、基础维护和常见藻类问题。',
    reviewStatus: 'reviewed',
  },
  aquaticPlants: {
    id: 'uf-ifas-aquatic-plants',
    title: 'Freshwater Ornamental Aquatic Plant Production in Florida',
    publisher: 'UF/IFAS Extension',
    url: 'https://edis.ifas.ufl.edu/publication/FA251/pdf',
    supports: '水生植物基础背景；家庭草缸具体处理步骤仍需专项园艺来源复核。',
    reviewStatus: 'draft',
  },
} satisfies Record<string, CareReference>;

const uniqueReferences = (items: CareReference[]) => (
  items.filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index)
);

const getActionReferences = (topic: CareTopic, actionText: string): CareReference[] => {
  const text = `${topic.title} ${topic.category} ${topic.summary} ${topic.keywords.join(' ')} ${actionText}`;
  const references: CareReference[] = [];

  if (/海缸|海水|盐度|比重|珊瑚|海葵|小丑鱼/.test(text)) references.push(sources.marineGuide, sources.aquariumManagement);
  if (/水草|藻|黄叶|烂叶|CO2|光照|肥料/.test(text)) references.push(sources.aquaticPlants, sources.rspcaEnvironment);
  if (/喂|饲料|拒食|开口|残饵|营养/.test(text)) references.push(sources.fishNutrition, sources.routineHealth);
  if (/水质|白浊|水浑|氨|亚硝酸|硝酸|换水|自来水|除氯|过滤|滤材|油膜|浮头|增氧|打氧|气泵|温度|加热|新缸/.test(text)) {
    references.push(sources.aquariumManagement, sources.fishHome, sources.rspcaEnvironment);
  }
  if (/死亡|白点|烂尾|白毛|红鳃|异常|检疫|隔离|呼吸|兽医|用药|药浴/.test(text)) {
    references.push(sources.aquariumManagement, sources.routineHealth);
  }
  if (/混养|打架|追咬|密度|领地|躲避/.test(text)) references.push(sources.fishHome, sources.aquariumManagement);
  if (/怀孕|繁殖|鱼苗|母鱼|产后|生产|卵黄囊/.test(text)) references.push(sources.routineHealth);

  return uniqueReferences(references.length > 0 ? references : [sources.aquariumManagement]);
};

const needsSpecialistReview = (topic: CareTopic, actionText: string) => {
  const text = `${topic.title} ${topic.category} ${actionText}`;
  return /水草|藻|黄叶|烂叶|CO2|肥料|怀孕|繁殖|鱼苗|母鱼|产后|生产|卵黄囊|珊瑚|海葵/.test(text);
};

const buildActionEvidence = (
  topic: CareTopic,
  kind: CareActionKind,
  text: string,
  index: number,
): CareActionEvidence => {
  const citations = getActionReferences(topic, text);
  const reviewStatus = citations.every(reference => reference.reviewStatus === 'reviewed') && !needsSpecialistReview(topic, text)
    ? 'reviewed'
    : 'draft';
  return {
    id: `${topic.id}:${kind}:${index + 1}`,
    kind,
    text: text.trim(),
    supportSummary: reviewStatus === 'reviewed'
      ? `这些来源直接支持“${text.trim()}”所采用的基础养护原则。`
      : `“${text.trim()}”已绑定基础资料，但具体家庭操作仍需专项人工复核。`,
    reviewStatus,
    citations,
  };
};

export const getCareActionEvidenceForText = (
  topic: CareTopic,
  kind: CareActionKind,
  text: string,
  index = 0,
) => buildActionEvidence(topic, kind, text, index);

export const getCareActionEvidence = (topic: CareTopic): CareActionEvidence[] => {
  const actions: CareActionEvidence[] = [
    ...topic.firstSteps.map((text, index) => buildActionEvidence(topic, 'immediate', text, index)),
    ...topic.avoid.map((text, index) => buildActionEvidence(topic, 'avoid', text, index)),
    ...topic.observe.map((text, index) => buildActionEvidence(topic, 'observe', text, index)),
    ...topic.diagnoseWhen.map((text, index) => buildActionEvidence(topic, 'recheck', text, index)),
  ];
  const nextText = getCareFollowUpAction(topic);
  if (nextText) actions.push(buildActionEvidence(topic, 'next', nextText, 0));
  return actions;
};

export const getCareReferences = (topic: CareTopic): CareReference[] => {
  return uniqueReferences(getCareActionEvidence(topic).flatMap(action => action.citations));
};

export const getCareReferenceReviewStatus = (topic: CareTopic): CareReferenceReviewStatus => (
  getCareActionEvidence(topic).every(action => action.reviewStatus === 'reviewed') ? 'reviewed' : 'draft'
);

export const getCareFollowUpAction = (topic: CareTopic, isEn = false): string => {
  if (topic.nextStep?.trim()) return topic.nextStep.trim();
  const text = `${topic.title} ${topic.category} ${topic.summary} ${topic.keywords.join(' ')}`;

  if (/白点|烂尾|白毛|红鳃|死亡|异常/.test(text)) {
    return isEn
      ? 'After basic checks, record breathing, skin, and activity. If signs spread or deaths continue, isolate affected animals and consult an aquatic veterinarian.'
      : '完成基础排查后记录呼吸、体表和活动变化；若异常扩大或继续死亡，隔离异常个体并咨询水生动物兽医。';
  }
  if (/水质|白浊|水浑|氨|亚硝酸|换水|自来水|过滤|油膜|浮头|气泵|加热|新缸/.test(text)) {
    return isEn
      ? 'Keep filtration and aeration stable, then recheck water, temperature, and breathing within 24 hours.'
      : '完成操作后保持过滤与供氧稳定，并在 24 小时内复查水体、温度和鱼只呼吸。';
  }
  if (/喂|饲料|拒食|开口/.test(text)) {
    return isEn
      ? 'At the next feeding, offer a smaller portion, record whether it is eaten within 3 minutes, and remove leftovers.'
      : '下一次投喂时减少份量，记录 3 分钟内是否进食，并清理未吃完的饲料。';
  }
  if (/混养|打架|追咬|领地|密度/.test(text)) {
    return isEn
      ? 'Observe for 30 minutes after the change and record repeated targeting and whether affected animals can feed normally.'
      : '调整后观察 30 分钟，记录是否仍固定追咬同一对象以及被追个体能否正常进食。';
  }
  if (/水草|藻|黄叶|烂叶|CO2|光照/.test(text)) {
    return isEn
      ? 'Photograph the same area, keep other conditions unchanged, and compare new leaves, decay, and algae after 3 days.'
      : '拍下同一位置作为基线，保持其它条件不变，3 天后比较新叶、烂叶和藻量变化。';
  }
  if (/怀孕|繁殖|鱼苗|公母|生产/.test(text)) {
    return isEn
      ? 'Keep conditions stable and record appetite, hiding, chasing, and fry condition at the next observation.'
      : '保持环境稳定，并在下一次观察时记录食欲、躲藏、追咬和幼体状态。';
  }
  if (/海缸|海水|盐度|比重|珊瑚|海葵/.test(text)) {
    return isEn
      ? 'Keep salinity and temperature stable, then recheck extension, activity, and water changes within 24 hours.'
      : '完成操作后保持盐度和温度稳定，并在 24 小时内复查生物伸展、活动和水体变化。';
  }
  return isEn
    ? 'After one action, keep other conditions unchanged and recheck the same sign within 24 hours.'
    : '完成一项操作后保持其它条件不变，24 小时内复查同一现象并记录变化。';
};
