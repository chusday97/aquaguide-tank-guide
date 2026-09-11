import type { Fish } from '../../types';
import type { SpeciesKnowledgeProfile } from './knowledge.types';



const reviewedKnowledgeBySpeciesId: Partial<Record<string, SpeciesKnowledgeProfile['knowledge']>> = {
  sp_0436: {
    sexIdentification: {
      title: '成体公母较容易区分',
      summary: '成年公鱼通常更鲜艳，并具有由臀鳍特化形成的交接器；母鱼通常体型更大、更丰满。',
      points: ['公鱼：颜色通常更鲜艳，臀鳍形成细长的交接器。', '母鱼：通常更大、更丰满，腹部后方可见孕斑。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish + FishBase', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['颜色通常更鲜艳', '臀鳍特化为交接器'],
      femaleTraits: ['通常体型更大、更丰满', '腹部后方可见孕斑'],
      limitations: ['人工选育品系的颜色差异可能弱化“公鱼更鲜艳”这一特征，应优先看交接器。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata', 'fishbase-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '卵胎生 / 直接产仔',
      summary: '孔雀鱼为内受精的胎生型鳉鱼，母鱼可储存精子，并在妊娠后直接产下可游动幼鱼。',
      fertilization: 'internal',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 28, maxDays: 42, label: '常见妊娠期约 4–6 周' },
      breedingBehavior: ['公鱼会持续追逐求偶', '建议避免单只母鱼长期承受高频追逐'],
      breedingAggression: 'low',
      fryCare: ['提供密植或浮水植物可提高幼鱼存活率'],
      parentFryRisk: ['亲鱼可能捕食幼鱼'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata', 'fishbase-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      sexRatioGuidance: '繁殖群体中建议一公搭配多母，减少单只母鱼被持续追逐。',
      territoriality: 'low',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '总体温和，适合温和社区缸；繁殖群体需重点管理公鱼持续追逐母鱼的问题。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0431: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '性成熟母鱼通常腹部更圆、体型略大；幼鱼阶段不建议仅凭体型判断。',
      points: ['成熟母鱼通常更圆润、略大。', '公鱼通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常相对更纤细'],
      femaleTraits: ['成熟后腹部更圆', '通常略大于公鱼'],
      limitations: ['饱食、健康状态和个体差异会影响体型判断，不能单凭一次观察确认。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '繁殖时会将卵散落在细叶植物、产卵拖把或网格附近；成鱼有吃卵风险。',
      fertilization: 'external',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '卵通常约 24–36 小时孵化' },
      breedingTriggers: ['繁殖缸通常使用较暗环境和偏软、偏酸的水'],
      fryCare: ['刚开口阶段需要非常细小的初生饵料，随后再过渡到微虫或丰年虾无节幼体'],
      parentFryRisk: ['亲鱼可能吃卵，应在发现卵后移出亲鱼或提供隔离结构'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      minimumGroupSize: 8,
      recommendedGroupSize: { min: 8, max: 10 },
      swimmingZone: 'middle',
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '温和群游鱼，建议至少 8–10 条成群饲养，并避免与明显更大的捕食性鱼混养。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0432: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '性成熟母鱼通常腹部更圆、体型略大；幼鱼阶段不建议仅凭体型判断。',
      points: ['成熟母鱼通常更圆润、略大。', '公鱼通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常相对更纤细'],
      femaleTraits: ['成熟后腹部更圆', '通常略大于公鱼'],
      limitations: ['体型只能作为成熟个体的辅助判断，不应当作绝对性别结论。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '繁殖需要单独、偏暗的环境，并提供细叶植物、产卵拖把或网格作为产卵位置。',
      fertilization: 'external',
      parentalCare: 'unknown',
      breedingTriggers: ['繁殖环境通常需要较暗光线'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      minimumGroupSize: 8,
      recommendedGroupSize: { min: 8, max: 10 },
      swimmingZone: 'middle',
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '温和群游鱼，建议至少 8–10 条成群饲养，并选择体型相近、非捕食性的混养对象。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
  },
};

const parseRange = (value?: string) => {
  const matches = value?.match(/(\d+(?:\.\d+)?)/g);
  if (!matches?.length) return undefined;
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return undefined;
  return { min: Math.min(...values), max: Math.max(...values) };
};

const parseMinLiters = (value?: string) => {
  const range = parseRange(value);
  return range?.min;
};

const getWaterType = (fish: Fish): SpeciesKnowledgeProfile['facts']['waterType'] => {
  const text = `${fish.name} ${fish.scientificName} ${fish.category} ${fish.description}`;
  if (/汽水|brackish/i.test(text)) return 'brackish';
  if (/海水|珊瑚|海葵|水母|marine|coral|anemone|jellyfish/i.test(text)) return 'saltwater';
  if (/淡水|水草|虾|螺|鱼|freshwater/i.test(text)) return 'freshwater';
  return 'unknown';
};

export const buildSpeciesKnowledgeProfile = (fish: Fish): SpeciesKnowledgeProfile => {
  const topTags = [
    fish.category,
    fish.housingMode,
    fish.difficulty === 'Easy' ? '新手友好' : fish.difficulty === 'Hard' ? '困难' : '中等',
  ].filter(Boolean).slice(0, 3) as string[];

  return {
    speciesId: fish.id,
    displayName: fish.name,
    scientificName: fish.scientificName,
    category: fish.category,
    topTags,
    facts: {
      waterType: getWaterType(fish),
      temperatureRange: parseRange(fish.waterTemperature),
      phRange: parseRange(fish.phLevel),
      minVolumeLiters: parseMinLiters(fish.tankSize),
      temperament: fish.temperament || 'unknown',
      housingMode: fish.housingMode || 'unknown',
      difficulty: fish.difficulty || 'unknown',
    },
    knowledge: reviewedKnowledgeBySpeciesId[fish.id] || {
      sexIdentification: {
        title: '暂无可靠的公母辨别资料',
        summary: '当前图鉴没有经过人工审核的公母辨别字段，系统不会仅凭名称或品类猜测公母。',
        points: [
          '可先按健康状态、体型完整度和活性挑选个体。',
          '如果确实需要配对繁殖，建议向可靠商家确认性别来源。',
          '后续补充人工审核资料后，这里会显示具体辨别要点。',
        ],
        confidence: 'unknown',
        source: {
          type: 'unknown',
          label: '缺少结构化公母辨别字段',
          confidence: 'unknown',
        },
      },
    },
    source: {
      type: 'species_data',
      label: '本地图鉴物种字段',
      confidence: 'derived',
    },
  };
};

export const getSpeciesKnowledgeTags = (profile: SpeciesKnowledgeProfile) => profile.topTags.slice(0, 3);
