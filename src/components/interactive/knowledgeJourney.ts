// Preview-only fixture: keep this journey isolated from production domain rules.
export type KnowledgeObjectId = 'water_surface' | 'water_body' | 'livestock' | 'filter' | 'substrate' | 'plants_equipment';
export type KnowledgeUrgency = 'routine' | 'watch' | 'urgent';
export type KnowledgeProblemGroupId = 'breathing' | 'body' | 'behavior' | 'condition' | 'breeding';
export type KnowledgeProblemGroup = { id: KnowledgeProblemGroupId; label: string; labelEn: string };
export type KnowledgeObservation = {
  id: string;
  label: string;
  labelEn?: string;
  urgency: KnowledgeUrgency;
  groupId?: KnowledgeProblemGroupId;
  topicId?: string;
  latestCareGuideId?: string;
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

const problemGroups: Partial<Record<KnowledgeObjectId, KnowledgeProblemGroup[]>> = {
  livestock: [
    { id: 'breathing', label: '呼吸与急症', labelEn: 'Breathing & urgent signs' },
    { id: 'body', label: '体表与鱼鳍', labelEn: 'Body, skin & fins' },
    { id: 'behavior', label: '游姿与行为', labelEn: 'Swimming & behavior' },
    { id: 'condition', label: '消化与体况', labelEn: 'Digestion & body condition' },
    { id: 'breeding', label: '繁殖与鱼苗', labelEn: 'Breeding & fry' },
  ],
};

const observations: Record<KnowledgeObjectId, KnowledgeObservation[]> = {
  water_surface: [
    { id: 'oil_film', label: '水面有油膜或不散的泡沫', labelEn: 'Oil film or persistent foam on the surface', urgency: 'watch', topicId: 'qa_gen_003', latestCareGuideId: 'care_06', searchQuery: '油膜 泡沫' },
    { id: 'gasping', label: '鱼或螺集体浮头、急促呼吸', labelEn: 'Fish or snails are gasping at the surface', urgency: 'urgent', topicId: 'qa_gen_020', latestCareGuideId: 'care_09', searchQuery: '浮头 呼吸急促 缺氧' },
  ],
  water_body: [
    { id: 'cloudy', label: '水体发白、发绿或持续浑浊', labelEn: 'Water turns milky, green, or persistently cloudy', urgency: 'watch', topicId: 'qa_gen_001', latestCareGuideId: 'care_04', searchQuery: '水质浑浊 白浊' },
    { id: 'ammonia', label: '氨或亚硝酸盐升高，鱼红鳃浮头', labelEn: 'Ammonia or nitrite spikes with red gills or gasping', urgency: 'urgent', topicId: 'qa_gen_002', searchQuery: '氨 亚硝酸盐 红鳃 浮头' },
    { id: 'temperature', label: '换水后状态变差，怀疑温差刺激', labelEn: 'Fish worsen after a water change; temperature shock suspected', urgency: 'watch', topicId: 'qa_gen_006', latestCareGuideId: 'care_05', searchQuery: '换水 温差' },
    { id: 'odor', label: '水体出现明显腥臭或腐败异味', labelEn: 'Water develops a strong fishy or rotten smell', urgency: 'urgent', topicId: 'guide_water_deteriorate', latestCareGuideId: 'care_04', searchQuery: '异味 水质' },
  ],
  livestock: [
    { id: 'gasping', groupId: 'breathing', label: '多条鱼浮头或急促呼吸', labelEn: 'Multiple fish are gasping or breathing rapidly', urgency: 'urgent', topicId: 'qa_gen_020', latestCareGuideId: 'care_09', searchQuery: '浮头 呼吸急促' },
    { id: 'gill_rot', groupId: 'breathing', label: '鳃丝发白腐烂、吞气或持续喘气', labelEn: 'Gills look pale or damaged with persistent gasping', urgency: 'urgent', latestCareGuideId: 'care_26', searchQuery: '烂鳃 鳃丝 呼吸急促' },
    { id: 'clamped_fins', groupId: 'breathing', label: '缩鳍夹尾、趴底不动', labelEn: 'Fins are clamped and the fish sits on the bottom', urgency: 'watch', latestCareGuideId: 'care_22', searchQuery: '夹尾 缩鳍 趴底' },

    { id: 'white_spots', groupId: 'body', label: '体表白点、蹭缸', labelEn: 'White spots or repeated flashing against objects', urgency: 'watch', topicId: 'qa_gen_011', latestCareGuideId: 'care_10', searchQuery: '白点 蹭缸' },
    { id: 'fin_rot', groupId: 'body', label: '鱼鳍破损、边缘发白腐烂', labelEn: 'Fins are frayed with pale or rotting edges', urgency: 'watch', latestCareGuideId: 'care_11', searchQuery: '烂尾 烂鳍' },
    { id: 'dropsy', groupId: 'body', label: '腹部肿大、鳞片像松果一样炸开', labelEn: 'Swollen abdomen with pinecone-like raised scales', urgency: 'urgent', latestCareGuideId: 'care_13', searchQuery: '炸鳞 腹水' },
    { id: 'cloudy_eye', groupId: 'body', label: '眼睛蒙白或向外突出', labelEn: 'Eyes look cloudy or protrude outward', urgency: 'watch', latestCareGuideId: 'care_14', searchQuery: '蒙眼 凸眼' },
    { id: 'flashing', groupId: 'body', label: '频繁蹭缸、擦身或疑似体外寄生虫', labelEn: 'Repeated flashing or rubbing suggests external parasites', urgency: 'watch', latestCareGuideId: 'care_15', searchQuery: '蹭缸 体外寄生虫' },
    { id: 'fungus', groupId: 'body', label: '体表出现白色棉絮状毛团', labelEn: 'White cotton-like growth appears on the body', urgency: 'watch', latestCareGuideId: 'care_23', searchQuery: '水霉 白色棉絮' },
    { id: 'popeye', groupId: 'body', label: '单眼或双眼明显突出充血', labelEn: 'One or both eyes are swollen or protruding', urgency: 'watch', latestCareGuideId: 'care_27', searchQuery: '凸眼 眼球突出' },

    { id: 'aggression', groupId: 'behavior', label: '追咬、啄咬或持续打架', labelEn: 'Chasing, nipping, or persistent fighting', urgency: 'watch', topicId: 'qa_gen_008', latestCareGuideId: 'care_18', searchQuery: '追咬 打架 求偶' },
    { id: 'crowding', groupId: 'behavior', label: '鱼缸明显拥挤，抢食或空间不足', labelEn: 'The tank looks crowded with competition for food or space', urgency: 'watch', topicId: 'qa_gen_010', searchQuery: '拥挤 饲养密度' },
    { id: 'swim_bladder', groupId: 'behavior', label: '翻肚、侧游、漂浮或沉底失衡', labelEn: 'Floating, sinking, rolling, or swimming off balance', urgency: 'watch', latestCareGuideId: 'care_12', searchQuery: '失鳔 翻肚 侧游' },
    { id: 'jumping', groupId: 'behavior', label: '突然乱撞、惊缸或跳出水面', labelEn: 'Sudden panic, crashing, or jumping from the tank', urgency: 'urgent', latestCareGuideId: 'care_25', searchQuery: '惊缸 跳缸' },
    { id: 'shimmies', groupId: 'behavior', label: '原地左右摇摆、像蛇一样扭动', labelEn: 'Fish shimmies in place with side-to-side body motion', urgency: 'watch', latestCareGuideId: 'care_28', searchQuery: '摇摆病 蛇游' },
    { id: 'whirling', groupId: 'behavior', label: '高速打转、螺旋翻滚、失去方向感', labelEn: 'Rapid spinning, corkscrewing, or loss of orientation', urgency: 'urgent', latestCareGuideId: 'care_29', searchQuery: '旋转病 打转' },
    { id: 'head_down', groupId: 'behavior', label: '头朝下、尾巴浮起异常悬停', labelEn: 'Head-down hovering with the tail raised', urgency: 'watch', latestCareGuideId: 'care_30', searchQuery: '头下尾上 倒立' },

    { id: 'white_poop', groupId: 'condition', label: '拖长白色透明便、疑似肠炎或内寄', labelEn: 'Long white stringy feces or suspected internal parasites', urgency: 'watch', latestCareGuideId: 'care_24', searchQuery: '白便 肠炎 内寄' },
    { id: 'wasting', groupId: 'condition', label: '明显消瘦、腹部凹陷或背脊像刀片', labelEn: 'Severe wasting with a sunken belly or knife-like back', urgency: 'urgent', latestCareGuideId: 'care_32', searchQuery: '消瘦 刀片背' },
    { id: 'scoliosis', groupId: 'condition', label: '身体呈 S 形弯曲、驼背或游动吃力', labelEn: 'S-shaped spine, hunching, or difficult swimming', urgency: 'watch', latestCareGuideId: 'care_34', searchQuery: '脊柱畸形 驼背' },

    { id: 'pregnant', groupId: 'breeding', label: '母鱼腹部变大、接近临产', labelEn: 'A pregnant livebearer looks close to giving birth', urgency: 'routine', latestCareGuideId: 'care_16', searchQuery: '母鱼 怀孕 临产' },
    { id: 'fry_feeding', groupId: 'breeding', label: '刚出生鱼苗需要开口喂食', labelEn: 'Newborn fry need their first feeding plan', urgency: 'routine', latestCareGuideId: 'care_17', searchQuery: '鱼苗 开口 喂食' },
    { id: 'needle_tail', groupId: 'breeding', label: '鱼苗尾鳍聚拢成针尖、批量衰弱', labelEn: 'Fry tails clamp into a needle shape with group decline', urgency: 'urgent', latestCareGuideId: 'care_31', searchQuery: '鱼苗 针尾病' },
    { id: 'dystocia', groupId: 'breeding', label: '母鱼腹大如鼓但迟迟未产', labelEn: 'A heavily pregnant livebearer is overdue and not giving birth', urgency: 'urgent', latestCareGuideId: 'care_33', searchQuery: '母鱼 难产' },
  ],
  filter: [
    { id: 'maintenance', label: '过滤器变脏、出水减弱或需要清洗', labelEn: 'Filter is dirty, flow is weaker, or cleaning is due', urgency: 'watch', topicId: 'qa_gen_016', latestCareGuideId: 'care_19', searchQuery: '过滤器 清洗 出水' },
    { id: 'selection', label: '过滤流量或过滤器类型不适合当前鱼缸', labelEn: 'Filter type or flow does not fit the current tank', urgency: 'routine', topicId: 'qa_gen_026', searchQuery: '过滤器 选择 流量' },
    { id: 'aeration', label: '出水正常但仍担心缺氧或水面波动不足', labelEn: 'Flow seems normal but oxygen or surface agitation may be insufficient', urgency: 'watch', topicId: 'qa_gen_027', latestCareGuideId: 'care_09', searchQuery: '增氧 水面波动' },
  ],
  substrate: [
    { id: 'leftovers', label: '底床残饵、粪便或有机物堆积', labelEn: 'Uneaten food, waste, or organics are building up on the substrate', urgency: 'watch', topicId: 'qa_gen_015', latestCareGuideId: 'care_21', searchQuery: '残饵 底床 清洁' },
    { id: 'cleaning', label: '不知道底床和鱼缸该多久清理一次', labelEn: 'Not sure how often the substrate or tank should be cleaned', urgency: 'routine', topicId: 'qa_gen_014', latestCareGuideId: 'care_21', searchQuery: '底床 清洁 换水' },
    { id: 'odor', label: '翻动底床后出现明显异味', labelEn: 'A strong smell appears when the substrate is disturbed', urgency: 'urgent', topicId: 'guide_water_deteriorate', latestCareGuideId: 'care_04', searchQuery: '底床 异味' },
  ],
  plants_equipment: [
    { id: 'algae', label: '缸壁、沉木或水草爆藻', labelEn: 'Algae is spreading on glass, wood, or plants', urgency: 'watch', topicId: 'qa_gen_017', latestCareGuideId: 'care_08', searchQuery: '水草 藻类 除藻' },
    { id: 'plant_melt', label: '水草黄叶、烂叶或融叶', labelEn: 'Plants are yellowing, rotting, or melting', urgency: 'routine', topicId: 'qa_gen_019', searchQuery: '水草 黄叶 融叶' },
    { id: 'heater', label: '加热棒位置、温控或安全性异常', labelEn: 'Heater placement, temperature control, or safety seems wrong', urgency: 'watch', topicId: 'qa_gen_025', latestCareGuideId: 'care_05', searchQuery: '加热棒 温控' },
    { id: 'light', label: '光照时间或强度可能不合适', labelEn: 'Lighting duration or intensity may be inappropriate', urgency: 'routine', topicId: 'qa_gen_018', searchQuery: '灯光 光照 藻类' },
  ],
};

export function getKnowledgeObservations(objectId: KnowledgeObjectId) {
  return observations[objectId];
}

export function getKnowledgeProblemGroups(objectId: KnowledgeObjectId) {
  return problemGroups[objectId] || [];
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
