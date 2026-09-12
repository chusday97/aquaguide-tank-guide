import type { CareArticleAdminInput, SpeciesAdminInput } from './content-admin.service';

export type ContentImpactKind =
  | 'display_only'
  | 'decision_critical_product'
  | 'care_workflow'
  | 'compatibility_rule'
  | 'seo_only';

export type ContentConsumerId =
  | 'encyclopedia'
  | 'care'
  | 'aquarium'
  | 'identify'
  | 'search_collection'
  | 'compatibility'
  | 'seo';

export type ContentConsumerImpact = {
  id: ContentConsumerId;
  mode: 'direct' | 'review';
};

export type ContentFieldImpact = {
  label: string;
  kind: ContentImpactKind;
  consumers: ContentConsumerImpact[];
};
export type ContentFieldChange = ContentFieldImpact & {
  field: string;
  before: unknown;
  after: unknown;
};

export type ContentImpactResult = {
  changes: ContentFieldChange[];
  directConsumers: ContentConsumerId[];
  reviewConsumers: ContentConsumerId[];
  highestKind: ContentImpactKind | null;
};

const direct = (...ids: ContentConsumerId[]): ContentConsumerImpact[] => ids.map(id => ({ id, mode: 'direct' }));
const review = (...ids: ContentConsumerId[]): ContentConsumerImpact[] => ids.map(id => ({ id, mode: 'review' }));

const speciesImpact: Record<keyof SpeciesAdminInput, ContentFieldImpact> = {
  catalogKey: { label: '目录 ID', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('search_collection', 'compatibility', 'seo')] },
  name: { label: '中文名', kind: 'display_only', consumers: [...direct('encyclopedia'), ...review('search_collection', 'seo')] },
  scientificName: { label: '学名', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('search_collection', 'compatibility', 'seo')] },
  category: { label: '分类', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('search_collection', 'compatibility', 'seo')] },
  difficulty: { label: '饲养难度', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'seo')] },
  waterTemperatureText: { label: '温度范围', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  waterTemperatureMinC: { label: '最低温度', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  waterTemperatureMaxC: { label: '最高温度', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  phLevelText: { label: 'pH 范围', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  phMin: { label: '最低 pH', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  phMax: { label: '最高 pH', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  waterChangeCycleDays: { label: '换水周期', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'care', 'seo')] },
  description: { label: '物种说明', kind: 'display_only', consumers: [...direct('encyclopedia'), ...review('search_collection', 'seo')] },
  diet: { label: '喂养说明', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'care', 'seo')] },
  tankSizeText: { label: '鱼缸要求', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  minTankLiters: { label: '最低缸体容量', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('aquarium', 'compatibility', 'seo')] },
  temperament: { label: '性情', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('compatibility', 'aquarium', 'seo')] },
  sizeClass: { label: '体型', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('compatibility', 'aquarium', 'seo')] },
  housingMode: { label: '混养倾向', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('compatibility', 'aquarium', 'seo')] },
  housingReason: { label: '混养说明', kind: 'decision_critical_product', consumers: [...direct('encyclopedia'), ...review('compatibility', 'aquarium', 'seo')] },
  isCustom: { label: '自定义标记', kind: 'display_only', consumers: [...direct('encyclopedia'), ...review('search_collection')] },
  searchTerms: { label: '搜索词', kind: 'display_only', consumers: review('search_collection') },
};
const careImpact: Record<keyof CareArticleAdminInput, ContentFieldImpact> = {
  catalogKey: { label: '目录 ID', kind: 'care_workflow', consumers: [...direct('care', 'aquarium', 'identify'), ...review('search_collection', 'seo')] },
  title: { label: '标题', kind: 'display_only', consumers: [...direct('care'), ...review('search_collection', 'seo')] },
  category: { label: '分类', kind: 'display_only', consumers: [...direct('care'), ...review('search_collection')] },
  urgency: { label: '优先级', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  summary: { label: '摘要', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  symptoms: { label: '适用症状', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  steps: { label: '操作步骤', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  avoidActions: { label: '禁止动作', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  observeItems: { label: '观察项', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  diagnoseWhen: { label: '进一步诊断条件', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  nextStep: { label: '下一步', kind: 'care_workflow', consumers: direct('care', 'aquarium', 'identify') },
  keywords: { label: '关键词', kind: 'display_only', consumers: [...direct('identify'), ...review('search_collection', 'seo')] },
};

const kindPriority: Record<ContentImpactKind, number> = {
  display_only: 1,
  seo_only: 1,
  care_workflow: 2,
  decision_critical_product: 3,
  compatibility_rule: 4,
};
const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
  }
  if (typeof value === 'string') return value.trim();
  return value ?? null;
};

const sameValue = (before: unknown, after: unknown) => JSON.stringify(normalize(before)) === JSON.stringify(normalize(after));
const unique = <T extends string>(items: T[]) => [...new Set(items)];

export function buildContentImpact(
  type: 'species',
  before: SpeciesAdminInput,
  after: SpeciesAdminInput,
): ContentImpactResult;
export function buildContentImpact(
  type: 'care',
  before: CareArticleAdminInput,
  after: CareArticleAdminInput,
): ContentImpactResult;
export function buildContentImpact(
  type: 'species' | 'care',
  before: SpeciesAdminInput | CareArticleAdminInput,
  after: SpeciesAdminInput | CareArticleAdminInput,
): ContentImpactResult {
  const map = type === 'species' ? speciesImpact : careImpact;
  const fields = Object.keys(map);
  const changes = fields.flatMap(field => {
    const beforeValue = (before as Record<string, unknown>)[field];
    const afterValue = (after as Record<string, unknown>)[field];
    if (sameValue(beforeValue, afterValue)) return [];
    return [{ field, before: beforeValue, after: afterValue, ...(map as Record<string, ContentFieldImpact>)[field] }];
  });
  const directConsumers = unique(changes.flatMap(change => change.consumers.filter(item => item.mode === 'direct').map(item => item.id)));
  const reviewConsumers = unique(changes.flatMap(change => change.consumers.filter(item => item.mode === 'review').map(item => item.id)))
    .filter(id => !directConsumers.includes(id));
  const highestKind = changes.reduce<ContentImpactKind | null>((current, change) => (
    !current || kindPriority[change.kind] > kindPriority[current] ? change.kind : current
  ), null);
  return { changes, directConsumers, reviewConsumers, highestKind };
}

export const contentImpactLabels = {
  kinds: {
    display_only: '展示内容',
    decision_critical_product: '决策关键 Product Data',
    care_workflow: 'Care 流程',
    compatibility_rule: 'Compatibility 规则',
    seo_only: 'SEO 内容',
  } satisfies Record<ContentImpactKind, string>,
  consumers: {
    encyclopedia: 'Encyclopedia', care: 'Care Guide', aquarium: 'Aquarium', identify: 'Identify',
    search_collection: 'Search / Collection', compatibility: 'Compatibility', seo: 'SEO',
  } satisfies Record<ContentConsumerId, string>,
};
