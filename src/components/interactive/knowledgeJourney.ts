// Preview-only fixture: keep this journey isolated from production domain rules.
export type KnowledgeObjectId = 'water_surface' | 'water_body' | 'livestock' | 'filter' | 'substrate' | 'plants_equipment';
export type KnowledgeUrgency = 'routine' | 'watch' | 'urgent';
export type KnowledgeObservation = {
  id: string;
  label: string;
  labelEn?: string;
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
    { id: 'oil_film', label: '水面有油膜或不散的泡沫', labelEn: 'Oil film or persistent foam on the surface', urgency: 'watch', topicId: 'qa_gen_003', searchQuery: '油膜 泡沫' },
    { id: 'gasping', label: '鱼或螺集体浮头、急促呼吸', labelEn: 'Fish or snails are gasping at the surface', urgency: 'urgent', topicId: 'qa_gen_020', searchQuery: '浮头 呼吸急促 缺氧' },
  ],
  water_body: [
    { id: 'cloudy', label: '水体发白、发绿或持续浑浊', labelEn: 'Water turns milky, green, or persistently cloudy', urgency: 'watch', topicId: 'qa_gen_001', searchQuery: '水质浑浊 白浊' },
    { id: 'ammonia', label: '氨或亚硝酸盐升高，鱼红鳃浮头', labelEn: 'Ammonia or nitrite spikes with red gills or gasping', urgency: 'urgent', topicId: 'qa_gen_002', searchQuery: '氨 亚硝酸盐 红鳃 浮头' },
    { id: 'temperature', label: '换水后状态变差，怀疑温差刺激', labelEn: 'Fish worsen after a water change; temperature shock suspected', urgency: 'watch', topicId: 'qa_gen_006', searchQuery: '换水 温差' },
    { id: 'odor', label: '水体出现明显腥臭或腐败异味', labelEn: 'Water develops a strong fishy or rotten smell', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '异味 水质' },
  ],
  livestock: [
    { id: 'gasping', label: '多条鱼浮头或急促呼吸', labelEn: 'Multiple fish are gasping or breathing rapidly', urgency: 'urgent', topicId: 'qa_gen_020', searchQuery: '浮头 呼吸急促' },
    { id: 'aggression', label: '追咬、啄咬或持续打架', labelEn: 'Chasing, nipping, or persistent fighting', urgency: 'watch', topicId: 'qa_gen_008', searchQuery: '追咬 打架 求偶' },
    { id: 'crowding', label: '鱼缸明显拥挤，抢食或空间不足', labelEn: 'The tank looks crowded with competition for food or space', urgency: 'watch', topicId: 'qa_gen_010', searchQuery: '拥挤 饲养密度' },
    { id: 'white_spots', label: '体表白点、蹭缸或明显病灶', labelEn: 'White spots, flashing, or visible body lesions', urgency: 'watch', topicId: 'qa_gen_011', searchQuery: '白点 蹭缸' },
  ],
  filter: [
    { id: 'maintenance', label: '过滤器变脏、出水减弱或需要清洗', labelEn: 'Filter is dirty, flow is weaker, or cleaning is due', urgency: 'watch', topicId: 'qa_gen_016', searchQuery: '过滤器 清洗 出水' },
    { id: 'selection', label: '过滤流量或过滤器类型不适合当前鱼缸', labelEn: 'Filter type or flow does not fit the current tank', urgency: 'routine', topicId: 'qa_gen_026', searchQuery: '过滤器 选择 流量' },
    { id: 'aeration', label: '出水正常但仍担心缺氧或水面波动不足', labelEn: 'Flow seems normal but oxygen or surface agitation may be insufficient', urgency: 'watch', topicId: 'qa_gen_027', searchQuery: '增氧 水面波动' },
  ],
  substrate: [
    { id: 'leftovers', label: '底床残饵、粪便或有机物堆积', labelEn: 'Uneaten food, waste, or organics are building up on the substrate', urgency: 'watch', topicId: 'qa_gen_015', searchQuery: '残饵 底床 清洁' },
    { id: 'cleaning', label: '不知道底床和鱼缸该多久清理一次', labelEn: 'Not sure how often the substrate or tank should be cleaned', urgency: 'routine', topicId: 'qa_gen_014', searchQuery: '底床 清洁 换水' },
    { id: 'odor', label: '翻动底床后出现明显异味', labelEn: 'A strong smell appears when the substrate is disturbed', urgency: 'urgent', topicId: 'guide_water_deteriorate', searchQuery: '底床 异味' },
  ],
  plants_equipment: [
    { id: 'algae', label: '缸壁、沉木或水草爆藻', labelEn: 'Algae is spreading on glass, wood, or plants', urgency: 'watch', topicId: 'qa_gen_017', searchQuery: '水草 藻类 除藻' },
    { id: 'plant_melt', label: '水草黄叶、烂叶或融叶', labelEn: 'Plants are yellowing, rotting, or melting', urgency: 'routine', topicId: 'qa_gen_019', searchQuery: '水草 黄叶 融叶' },
    { id: 'heater', label: '加热棒位置、温控或安全性异常', labelEn: 'Heater placement, temperature control, or safety seems wrong', urgency: 'watch', topicId: 'qa_gen_025', searchQuery: '加热棒 温控' },
    { id: 'light', label: '光照时间或强度可能不合适', labelEn: 'Lighting duration or intensity may be inappropriate', urgency: 'routine', topicId: 'qa_gen_018', searchQuery: '灯光 光照 藻类' },
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
