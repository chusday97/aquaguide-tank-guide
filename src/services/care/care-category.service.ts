import type { CareTopic } from '../../data/careTopicsData';

export type CareCategoryId =
  | 'all'
  | 'fish_health'
  | 'water_quality'
  | 'new_stock'
  | 'feeding'
  | 'maintenance'
  | 'breeding'
  | 'death'
  | 'equipment'
  | 'beginner';

type CanonicalCareTopic = CareTopic & {
  _originalTitle?: string;
  _originalCategory?: string;
  _originalSummary?: string;
  _originalKeywords?: string[];
};

const getCanonicalText = (topic: CareTopic) => {
  const canonical = topic as CanonicalCareTopic;
  return [
    topic.id,
    canonical._originalTitle || topic.title,
    canonical._originalCategory || topic.category,
    canonical._originalSummary || topic.summary,
    ...(canonical._originalKeywords || topic.keywords),
  ].join(' ');
};

export const matchesCareCategory = (topic: CareTopic, categoryId: CareCategoryId) => {
  if (categoryId === 'all') return true;
  const text = getCanonicalText(topic);

  switch (categoryId) {
    case 'fish_health':
      return /鱼只异常|疾病|生病|白点|烂尾|趴缸|拒食|浮头|呼吸|喘|追咬|打架/.test(text);
    case 'water_quality':
      return /水质|水浑|白浊|发白|发绿|异味|油膜|氨氮|亚硝酸盐|绿水/.test(text);
    case 'new_stock':
      return topic.id === 'guide_new_fish_acclimation'
        || topic.id === 'qa_gen_013'
        || /新鱼|入缸过水|过水流程|检疫/.test(text);
    case 'feeding':
      return /日常喂食|喂食|饲料|残饵|拒食/.test(text);
    case 'maintenance':
      return /换水维护|换水|困水|除氯|清洁|日常养护/.test(text);
    case 'breeding':
      return /怀孕|鱼苗|繁殖|母鱼|临产|产后|开口|平游/.test(text);
    case 'death':
      return /死亡处理|死亡|死鱼|暴毙|连续死/.test(text);
    case 'equipment':
      return /设备问题|设备维护|设备|过滤|滤材|加热棒|气泵|灯光|水泵/.test(text);
    case 'beginner':
      return /新手|新缸|开缸|新鱼|入缸|过水|换水|白浊/.test(text);
    default:
      return false;
  }
};

export const getCareCategoryTopicIds = (topics: CareTopic[], categoryId: CareCategoryId) => (
  topics.filter(topic => matchesCareCategory(topic, categoryId)).map(topic => topic.id)
);
