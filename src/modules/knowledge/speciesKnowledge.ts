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
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'SL' },
      minVolumeLiters: 41,
      minTankLengthCm: 45,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['以成体约 6 cm 标准体长和至少 45 × 30 cm 缸底作为空间规划参考。'],
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
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      swimmingZone: 'middle',
      needsCover: true,
      spaceNotes: ['成体约 3 cm 标准体长，但群游与水平活动空间使 60 × 30 cm 缸底比单看体长更重要。'],
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
    spaceAndGrowth: {
      adultLengthCm: { max: 3.5, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      swimmingZone: 'middle',
      needsCover: true,
      spaceNotes: ['成体约 3.5 cm 标准体长，长期群养按至少 60 × 30 cm 缸底规划。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0434: {
    sexIdentification: {
      title: '成熟后可通过体型和颜色辅助判断',
      summary: '成熟母鱼通常腹部更圆、略大；公鱼更纤细，繁殖状态下颜色往往更鲜明。',
      points: ['母鱼：成熟后腹部通常更圆、体型略大。', '公鱼：通常更纤细，竞争展示时颜色更明显。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常更纤细', '繁殖展示时颜色更明显'],
      femaleTraits: ['成熟后腹部更圆', '通常略大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '持续散卵型', summary: '状态良好时可频繁散卵，不护卵也不护幼。',
      fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 2, maxDays: 3, label: '卵通常约 48–60 小时孵化' },
      parentFryRisk: ['成鱼可能吃卵，应使用密植、网格或产卵拖把降低损失。'],
      fryCare: ['初期开口需要微小饵料，之后再过渡到微虫或丰年虾无节幼体。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'school', minimumGroupSize: 10, recommendedGroupSize: { min: 10 }, swimmingZone: 'middle', territoriality: 'none', finNipping: 'low', predationRisk: 'low',
      summary: '天然群游，建议 10 条以上；足够群体能减少紧张并让公鱼呈现更自然的展示行为。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 4, measurement: 'SL' }, minVolumeLiters: 54, minTankLengthCm: 60, activityLevel: 'medium', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['长期群养按至少 60 × 30 cm 缸底规划。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0435: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断', summary: '成熟母鱼通常腹部更圆、略大且颜色稍淡；公鱼相对纤细，繁殖状态下颜色更强。',
      points: ['母鱼：成熟后腹部更圆，通常略大。', '公鱼：相对纤细，繁殖状态下颜色更强。'], confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' }, reliableFromLifeStage: 'adult',
      maleTraits: ['相对纤细', '繁殖状态下颜色更强'], femaleTraits: ['腹部更圆', '通常略大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '散卵型', summary: '散卵繁殖且不护卵，成鱼会吃掉找到的卵。', fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '常见孵化约 24–36 小时' },
      parentFryRisk: ['成鱼会吃卵，繁殖时应使用网格、细叶植物或在产卵后移走成鱼。'],
      fryCare: ['初期使用极细小饵料，幼鱼长大后再过渡到丰年虾无节幼体等。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'school', minimumGroupSize: 8, recommendedGroupSize: { min: 8, max: 10 }, swimmingZone: 'middle', territoriality: 'none', finNipping: 'low', predationRisk: 'low',
      summary: '活跃群游鱼，建议至少 8–10 条；足够群体能降低紧张并呈现更自然的活动。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 5, measurement: 'SL' }, minVolumeLiters: 81, minTankLengthCm: 90, activityLevel: 'high', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['斑马鱼活动量高，即使小群也优先保证至少 90 × 30 cm 的水平游动空间。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0439: {
    sexIdentification: {
      title: '成体公母通常可通过体型和颜色辅助判断', summary: '成年公鱼通常更小、更纤细且颜色更强；母鱼通常更丰满。',
      points: ['公鱼：通常更小、更纤细、颜色更强。', '母鱼：通常腹部更丰满。'], confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' }, reliableFromLifeStage: 'adult',
      maleTraits: ['更小、更纤细', '颜色通常更强'], femaleTraits: ['腹部通常更丰满'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '散卵型', summary: '自由散卵且不护卵，繁殖后应避免成鱼继续接触鱼卵。', fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '卵通常约 24–48 小时孵化' },
      parentFryRisk: ['成鱼会吃卵，产卵后应移出成鱼或使用隔离结构。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 8, recommendedGroupSize: { min: 8, max: 10 }, swimmingZone: 'middle', territoriality: 'low', finNipping: 'medium', predationRisk: 'low',
      summary: '群体内会形成松散等级并互相追逐；至少 8–10 条更能把注意力留在同类之间，减少骚扰同缸鱼。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'high', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['按至少 80 × 30 cm 缸底规划，并为群体追逐和等级互动留出水平空间。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
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

export const getReviewedSpeciesKnowledge = (speciesId: string) => reviewedKnowledgeBySpeciesId[speciesId];

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
