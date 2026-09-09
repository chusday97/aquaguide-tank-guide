import type {
  PublishedContentSection,
  PublishedFaqItem,
  SpeciesEditorialEvidence,
  SpeciesEditorialEvidenceField,
  SpeciesEditorialEvidenceScope,
  SpeciesEditorialEvidenceStatus,
} from '../types';
import { fingerprintSeoEvidence } from './seoEvidenceBindings';

export type SpeciesEditorialSourceType = 'peer-reviewed' | 'government-research' | 'authoritative-database' | 'project-product-truth';

export type SpeciesEditorialSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: SpeciesEditorialSourceType;
  locator: string;
  support: string;
  sourceQuality: 'eligible' | 'blocked';
};

export const speciesEditorialSources: SpeciesEditorialSource[] = [
  {
    id: 'fishbase-paracheirodon-axelrodi-2026',
    title: 'Paracheirodon axelrodi summary page',
    publisher: 'FishBase',
    url: 'https://fishbase.org/summary/Paracheirodon_axelrodi.html',
    sourceType: 'authoritative-database',
    locator: 'Environment; Distribution; Biology（FishBase 物种摘要）',
    support: '支持宝莲灯为淡水、分布于奥里诺科和内格罗河上游流域、主要在中层水域成群活动，以及取食蠕虫和小型甲壳类的物种资料记录。',
    sourceQuality: 'eligible',
  },
  {
    id: 'fishData.ts:sp_0001',
    title: 'AquaGuide Product Truth catalog — sp_0001',
    publisher: 'AquaGuide local catalog',
    url: 'src/data/fishData.ts',
    sourceType: 'project-product-truth',
    locator: 'species record sp_0001',
    support: '仅支持项目目录中极火虾的名称、学名、分类和参数；不支持外部生物习性结论。',
    sourceQuality: 'eligible',
  },
  {
    id: 'fishData.ts:sp_0030',
    title: 'AquaGuide Product Truth catalog — sp_0030',
    publisher: 'AquaGuide local catalog',
    url: 'src/data/fishData.ts',
    sourceType: 'project-product-truth',
    locator: 'species record sp_0030',
    support: '仅支持项目目录中该记录的名称、学名和参数；不支持外部生物习性结论。',
    sourceQuality: 'eligible',
  },
  {
    id: 'source-row-map:base_0147_neocaridina_davidi',
    title: 'AquaGuide source-row map — Neocaridina davidi',
    publisher: 'AquaGuide local source map',
    url: 'output/record_system/source_row_map.csv',
    sourceType: 'project-product-truth',
    locator: 'base_0147_neocaridina_davidi; morph_0162; morph_0164',
    support: '仅支持极火虾与黄金米虾归属于同一 Neocaridina davidi Base 的项目归组关系；不支持自然史结论。',
    sourceQuality: 'eligible',
  },
  {
    id: 'usgs-nas-neocaridina-davidi-2026',
    title: 'Cherry shrimp (Neocaridina davidi) — Species Profile',
    publisher: 'U.S. Geological Survey Nonindigenous Aquatic Species Database',
    url: 'https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=2257',
    sourceType: 'government-research',
    locator: 'Ecology section; cited ecology references',
    support: '支持其可占据多种环境，以及机会性杂食取食的概述。',
    sourceQuality: 'eligible',
  },
  {
    id: 'uf-ifas-neocaridina-davidi-2025',
    title: 'Cherry Shrimp Neocaridina davidi (Bouvier 1904)',
    publisher: 'University of Florida IFAS Extension',
    url: 'https://ask.ifas.ufl.edu/publication/IN1301/pdf',
    sourceType: 'government-research',
    locator: 'Introduction; Distribution; Description and Life Cycle; Behavior',
    support: '支持淡水物种身份、台湾淡水溪流分布、黄色 morph 记录、取食和行为概述。',
    sourceQuality: 'eligible',
  },
  {
    id: 'frontiers-neocaridina-davidi-noise-2023',
    title: 'Annoying noise: effect of anthropogenic underwater noise on the movement and feeding performance in the red cherry shrimp, Neocaridina davidi',
    publisher: 'Frontiers in Ecology and Evolution',
    url: 'https://doi.org/10.3389/fevo.2023.1091314',
    sourceType: 'peer-reviewed',
    locator: 'Abstract; Introduction; Methods and Results',
    support: '仅支持受控实验中的运动与取食反应，不直接支持日常饲养结论。',
    sourceQuality: 'eligible',
  },
];

const sourceMap = new Map(speciesEditorialSources.map(source => [source.id, source]));

const confirmed = (input: Omit<SpeciesEditorialEvidence, 'sourceFingerprint' | 'status'>): SpeciesEditorialEvidence => ({
  ...input,
  sourceFingerprint: fingerprintSpeciesEditorialEvidence(input),
  status: 'confirmed',
  confirmedBy: 'project-owner',
  confirmedAt: input.confirmedAt || '2026-09-01',
});

const base = (id: string, field: SpeciesEditorialEvidenceField, renderedClaim: string, sourceIds: string[]): SpeciesEditorialEvidence => confirmed({
  id,
  targetId: 'sp_0001',
  scope: 'base',
  field,
  renderedClaim,
  sourceIds,
});

export const speciesEditorialEvidence: SpeciesEditorialEvidence[] = [
  base(
    'sp_0001:editorial.signature:001',
    'signature',
    '极火虾是 Neocaridina davidi 的红色选育型；其基础物种是原生于台湾淡水溪流的小型淡水观赏虾。',
    ['fishData.ts:sp_0001', 'uf-ifas-neocaridina-davidi-2025'],
  ),
  base(
    'sp_0001:editorial.overview:001',
    'overview',
    '它常在底部叶屑等表面刮食生物膜，也会取食藻类和有机碎屑。',
    ['usgs-nas-neocaridina-davidi-2026', 'uf-ifas-neocaridina-davidi-2025'],
  ),
  base(
    'sp_0001:editorial.behavior:001',
    'behavior',
    '它大部分时间会在叶屑表面的生物膜上刮食。',
    ['uf-ifas-neocaridina-davidi-2025'],
  ),
  base(
    'sp_0001:editorial.habitat:001',
    'habitat',
    '其基础物种原生于淡水溪流，也能占据流速不同的多种淡水环境。',
    ['usgs-nas-neocaridina-davidi-2026', 'uf-ifas-neocaridina-davidi-2025'],
  ),
  base(
    'sp_0001:editorial.feeding:001',
    'feeding',
    '它属于碎屑食性、机会性取食者，会取食藻类、生物膜，以及底部的动植物残体。',
    ['usgs-nas-neocaridina-davidi-2026', 'uf-ifas-neocaridina-davidi-2025'],
  ),
  confirmed({
    id: 'sp_0001:faq:001',
    targetId: 'sp_0001',
    scope: 'faq',
    field: 'faq',
    renderedClaim: '问：极火虾属于淡水虾吗？答：是。极火虾所属的 Neocaridina davidi 是淡水观赏虾。',
    question: '极火虾属于淡水虾吗？',
    answer: '是。极火虾所属的 Neocaridina davidi 是淡水观赏虾。',
    sourceIds: ['fishData.ts:sp_0001', 'uf-ifas-neocaridina-davidi-2025'],
  }),
  confirmed({
    id: 'sp_0001:faq:002',
    targetId: 'sp_0001',
    scope: 'faq',
    field: 'faq',
    renderedClaim: '问：极火虾主要吃什么？答：现有物种资料记录其会取食藻类、生物膜、叶屑和有机碎屑。',
    question: '极火虾主要吃什么？',
    answer: '现有物种资料记录其会取食藻类、生物膜、叶屑和有机碎屑。',
    sourceIds: ['usgs-nas-neocaridina-davidi-2026', 'uf-ifas-neocaridina-davidi-2025'],
  }),
  confirmed({
    id: 'sp_0001:faq:003',
    targetId: 'sp_0001',
    scope: 'faq',
    field: 'faq',
    renderedClaim: '问：极火虾会蜕壳吗？答：会。Neocaridina davidi 通过蜕去外骨骼生长。',
    question: '极火虾会蜕壳吗？',
    answer: '会。Neocaridina davidi 通过蜕去外骨骼生长。',
    sourceIds: ['uf-ifas-neocaridina-davidi-2025'],
  }),
  confirmed({
    id: 'sp_0030:variantDifference:001',
    targetId: 'sp_0030',
    scope: 'variant',
    field: 'variantDifference',
    renderedClaim: '黄金米虾是 Neocaridina davidi 的黄色选育型；目前确认的品系差异是黄色外观。',
    sourceIds: ['fishData.ts:sp_0030', 'source-row-map:base_0147_neocaridina_davidi', 'uf-ifas-neocaridina-davidi-2025'],
  }),
  confirmed({
    id: 'sp_0001:life.activity:001',
    targetId: 'sp_0001',
    scope: 'base',
    field: 'activity',
    renderedClaim: '它主要在水底的叶屑等表面活动。',
    sourceIds: ['uf-ifas-neocaridina-davidi-2025'],
    confirmedAt: '2026-09-02',
  }),
  confirmed({
    id: 'sp_0432:life.activity:001',
    targetId: 'sp_0432',
    scope: 'base',
    field: 'activity',
    renderedClaim: '宝莲灯主要在水体中层活动。',
    sourceIds: ['fishbase-paracheirodon-axelrodi-2026'],
    confirmedAt: '2026-09-02',
  }),
  confirmed({
    id: 'sp_0432:editorial.habitat:001',
    targetId: 'sp_0432',
    scope: 'base',
    field: 'habitat',
    renderedClaim: '宝莲灯是淡水鱼，原产于奥里诺科和内格罗河上游流域。',
    sourceIds: ['fishbase-paracheirodon-axelrodi-2026'],
    confirmedAt: '2026-09-02',
  }),
  confirmed({
    id: 'sp_0432:life.foraging:001',
    targetId: 'sp_0432',
    scope: 'base',
    field: 'foraging',
    renderedClaim: '宝莲灯会取食蠕虫和小型甲壳类。',
    sourceIds: ['fishbase-paracheirodon-axelrodi-2026'],
    confirmedAt: '2026-09-02',
  }),
];

export const speciesEditorialEvidenceGaps = [
  { targetId: 'sp_0001', field: 'maintenance', reason: '当前来源不足以支持物种专属日常维护结论。' },
  { targetId: 'sp_0432', field: 'overview', reason: '本批只继承既有 reviewed 群游证据，不扩写其他章节。' },
] as const;

function sourceSnapshot(sourceIds: string[]) {
  return sourceIds.map(sourceId => {
    const source = sourceMap.get(sourceId);
    return source ? {
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      sourceType: source.sourceType,
      locator: source.locator,
      support: source.support,
      sourceQuality: source.sourceQuality,
    } : { id: sourceId, missing: true };
  });
}

export function fingerprintSpeciesEditorialEvidence(evidence: Pick<SpeciesEditorialEvidence, 'targetId' | 'scope' | 'field' | 'renderedClaim' | 'question' | 'answer' | 'sourceIds'>): string {
  return (
  fingerprintSeoEvidence({
    targetId: evidence.targetId,
    scope: evidence.scope,
    field: evidence.field,
    renderedClaim: evidence.renderedClaim,
    question: evidence.question,
    answer: evidence.answer,
    sources: sourceSnapshot(evidence.sourceIds),
  })
  );
}

export const getSpeciesEditorialEvidenceStatus = (evidence: SpeciesEditorialEvidence): SpeciesEditorialEvidenceStatus => {
  const sources = evidence.sourceIds.map(sourceId => sourceMap.get(sourceId));
  if (!evidence.renderedClaim || sources.length === 0 || sources.some(source => !source || source.sourceQuality !== 'eligible')) return 'blocked';
  if (fingerprintSpeciesEditorialEvidence(evidence) !== evidence.sourceFingerprint) return evidence.status === 'confirmed' ? 'stale' : 'candidate';
  return evidence.status;
};

export const getCurrentSpeciesEditorialEvidence = (evidence: SpeciesEditorialEvidence) => ({
  ...evidence,
  status: getSpeciesEditorialEvidenceStatus(evidence),
  currentFingerprint: fingerprintSpeciesEditorialEvidence(evidence),
});

export const getSpeciesEditorialEvidenceReport = (targetId?: string) => speciesEditorialEvidence
  .filter(evidence => !targetId || evidence.targetId === targetId)
  .map(getCurrentSpeciesEditorialEvidence);

export const getConfirmedSpeciesEditorialEvidence = (targetId: string) => speciesEditorialEvidence
  .filter(evidence => evidence.targetId === targetId)
  .filter(evidence => getSpeciesEditorialEvidenceStatus(evidence) === 'confirmed')
  .filter(evidence => evidence.sourceIds.every(sourceId => sourceMap.get(sourceId)?.sourceQuality === 'eligible'));

export const getSpeciesEditorialSource = (sourceId: string) => sourceMap.get(sourceId);

export const getSpeciesEditorialSourceIds = () => [...sourceMap.keys()];

export const isSpeciesEditorialEvidenceConfirmed = (targetId: string, field: string) => getConfirmedSpeciesEditorialEvidence(targetId)
  .some(evidence => evidence.field === field);

export const isSpeciesEditorialEvidenceScope = (scope: string): scope is SpeciesEditorialEvidenceScope => scope === 'base' || scope === 'variant' || scope === 'faq';

const sectionLabels: Record<Exclude<SpeciesEditorialEvidenceField, 'signature' | 'variantDifference' | 'faq' | 'activity' | 'social' | 'foraging'>, { heading: string }> = {
  overview: { heading: '一眼了解' },
  behavior: { heading: '它如何生活' },
  habitat: { heading: '适合怎样的环境' },
  feeding: { heading: '喂养方法' },
  maintenance: { heading: '日常维护' },
};

export const getPublishedSpeciesEditorial = (targetId: string): {
  signature?: string;
  overview?: PublishedContentSection;
  behavior?: PublishedContentSection;
  habitat?: PublishedContentSection;
  feeding?: PublishedContentSection;
  maintenance?: PublishedContentSection;
} | undefined => {
  const entries = getConfirmedSpeciesEditorialEvidence(targetId);
  const signature = entries.find(entry => entry.scope === 'base' && entry.field === 'signature')?.renderedClaim;
  const sections = entries
    .filter(entry => entry.scope === 'base' && ['overview', 'behavior', 'habitat', 'feeding', 'maintenance'].includes(entry.field))
    .reduce<Partial<Record<Exclude<SpeciesEditorialEvidenceField, 'signature' | 'variantDifference' | 'faq' | 'activity' | 'social' | 'foraging'>, PublishedContentSection>>>((result, entry) => {
      const field = entry.field as Exclude<SpeciesEditorialEvidenceField, 'signature' | 'variantDifference' | 'faq' | 'activity' | 'social' | 'foraging'>;
      result[field] = {
        id: field,
        heading: sectionLabels[field].heading,
        summary: entry.renderedClaim,
        sourceIds: entry.sourceIds,
      };
      return result;
    }, {});

  if (!signature && Object.keys(sections).length === 0) return undefined;
  return { ...(signature ? { signature } : {}), ...sections };
};

export const getPublishedSpeciesFaq = (targetId: string): PublishedFaqItem[] => getConfirmedSpeciesEditorialEvidence(targetId)
  .filter(entry => entry.scope === 'faq' && entry.field === 'faq' && entry.question && entry.answer)
  .map(entry => ({
    id: entry.id,
    question: entry.question!,
    answer: entry.answer!,
    sourceIds: entry.sourceIds,
  }));

export const getPublishedVariantDifference = (targetId: string): string | undefined => getConfirmedSpeciesEditorialEvidence(targetId)
  .find(entry => entry.scope === 'variant' && entry.field === 'variantDifference')?.renderedClaim;
