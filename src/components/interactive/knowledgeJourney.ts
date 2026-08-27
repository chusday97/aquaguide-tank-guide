export type KnowledgeObjectId = 'water_surface' | 'water_body' | 'livestock' | 'filter' | 'substrate' | 'plants_equipment';
export type KnowledgeUrgency = 'routine' | 'watch' | 'urgent';
export type KnowledgeObservation = {
  id: string;
  label: string;
  urgency: KnowledgeUrgency;
  topicId?: string;
  searchQuery: string;
};
export type KnowledgeJourney = {
  id: string;
  objectId: KnowledgeObjectId;
  observationCodes: string[];
  urgency: KnowledgeUrgency;
  contextFacts: string[];
  emergencyActions: Array<{ id: string; title: string; instruction: string; reviewStatus: string; sourceIds: string[] }>;
  clarifyingQuestions: Array<{ id: string; prompt: string; options: Array<{ id: string; label: string }> }>;
  possibleCauses: string[];
  avoidActions: string[];
  recheck: { timing: string; signals: string[] };
  relatedArticleIds: string[];
};

const observations: Record<KnowledgeObjectId, KnowledgeObservation[]> = {
  water_surface: [
    { id: 'oil_film', label: '水面有油膜或不散的泡沫', urgency: 'watch', topicId: 'qa_gen_003', searchQuery: '油膜 泡沫' },
    { id: 'gasping', label: '鱼浮头或呼吸急促', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '浮头 呼吸急促' },
  ],
  water_body: [
    { id: 'cloudy', label: '水体发白、发绿或浑浊', urgency: 'watch', topicId: 'guide_water_deteriorate', searchQuery: '水质浑浊' },
    { id: 'odor', label: '闻到明显异味', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '异味 水质' },
  ],
  livestock: [
    { id: 'gasping', label: '多条鱼浮头或急促呼吸', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '浮头 呼吸急促' },
    { id: 'behavior', label: '拒食、躲藏或追咬', urgency: 'watch', searchQuery: '拒食' },
  ],
  filter: [
    { id: 'flow', label: '出水明显减弱或停止', urgency: 'watch', topicId: 'guide_water_deteriorate', searchQuery: '过滤 出水' },
    { id: 'noise', label: '过滤器出现异常噪音', urgency: 'routine', searchQuery: '过滤 噪音' },
  ],
  substrate: [
    { id: 'debris', label: '底床有大量残饵或污物', urgency: 'watch', topicId: 'guide_water_deteriorate', searchQuery: '残饵 底床' },
    { id: 'odor', label: '翻动底床后有明显异味', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '底床 异味' },
  ],
  plants_equipment: [
    { id: 'plants', label: '水草黄叶或融叶', urgency: 'routine', searchQuery: '水草 黄叶 融叶' },
    { id: 'heater', label: '灯光、加热或增氧设备异常', urgency: 'watch', searchQuery: '加热 增氧 设备' },
  ],
};

export function getKnowledgeObservations(objectId: KnowledgeObjectId) {
  return observations[objectId];
}

export function buildKnowledgeJourney(objectId: KnowledgeObjectId, observation: KnowledgeObservation): KnowledgeJourney {
  const isUrgent = observation.urgency === 'urgent';
  return {
    id: `${objectId}:${observation.id}`,
    objectId,
    observationCodes: [observation.id],
    urgency: observation.urgency,
    contextFacts: [],
    emergencyActions: isUrgent ? [{ id: 'open-priority-guide', title: '打开优先处理指引', instruction: '先查看现有的低风险检查步骤，再决定是否调整设备或水体。', reviewStatus: 'pending', sourceIds: observation.topicId ? [observation.topicId] : [] }] : [],
    clarifyingQuestions: [{ id: 'visible-observation', prompt: observation.label, options: [{ id: observation.id, label: observation.label }] }],
    possibleCauses: [],
    avoidActions: [],
    recheck: { timing: observation.urgency === 'urgent' ? '处理后尽快复查' : '完成下一步后再观察', signals: [] },
    relatedArticleIds: observation.topicId ? [observation.topicId] : [],
  };
}
