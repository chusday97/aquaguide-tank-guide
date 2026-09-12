import type { Fish } from '../../types';
import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { getBaseSpeciesScientificName } from '../species/speciesTaxonomy';



const reviewedKnowledgeBySpeciesId: Partial<Record<string, SpeciesKnowledgeProfile['knowledge']>> = {
  sp_0011: {
    sexIdentification: {
      title: '成体公鱼可通过交接器识别',
      summary: 'FishBase 记录公鱼具有由臀鳍特化形成的交接器；雌鱼成体体型可更大。',
      points: ['公鱼：臀鳍特化形成交接器。', '母鱼：不具有公鱼的交接器，成体体型可更大。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'FishBase', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['臀鳍特化形成交接器'],
      femaleTraits: ['不具有公鱼的交接器', '成体体型可更大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '胎生型 / 直接产仔',
      summary: 'FishBase 将其记录为体内受精的胎生型鱼类，常见妊娠期约 24–30 天，随后直接产下幼鱼。',
      fertilization: 'internal',
      parentalCare: 'unknown',
      gestationOrIncubation: { minDays: 24, maxDays: 30, label: '常见妊娠期约 24–30 天' },
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 20, max: 26 },
      phRange: { min: 7.0, max: 8.2 },
      hardnessDgh: { min: 10, max: 30 },
      notes: ['偏好中等硬度或更硬的水；不要把旧 catalog 的更宽范围当作 reviewed 结论。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus', 'fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'none',
      finNipping: 'unknown',
      predationRisk: 'unknown',
      summary: '总体非常温和，适合多数和平社区鱼；Seriously Fish 明确记录公鱼之间也能互相容忍，因此不设置虚构的最低群体数量。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'TL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      spaceNotes: ['长期规划按至少 60 × 30 cm 缸底；约 54 L 仅作为规划参考，不做差 1 L 即失败的硬阈值。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus', 'fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0437: {
    sexIdentification: {
      title: '成体公鱼可通过交接器识别',
      summary: '成体公鱼通常更小、更鲜艳，并具有由臀鳍特化形成的交接器；母鱼不具交接器。',
      points: ['公鱼：臀鳍形成交接器，通常体型更小、颜色更强。', '母鱼：不具有公鱼的交接器。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['臀鳍特化为交接器', '通常体型更小、颜色更强'],
      femaleTraits: ['不具有公鱼的交接器'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '胎生型 / 直接产仔',
      summary: '按常见胎生鳉方式繁殖；公鱼会持续追逐母鱼，亲鱼也可能捕食刚出生的幼鱼。不同来源对妊娠时长记载不一致，本轮不提供单一固定天数。',
      fertilization: 'internal',
      parentalCare: 'none',
      breedingBehavior: ['公鱼可能持续追逐母鱼', '繁殖群体建议一公搭配多母以分散追逐压力'],
      fryCare: ['密植环境可为幼鱼提供躲避'],
      parentFryRisk: ['成鱼可能捕食刚出生的幼鱼'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 21, max: 28 },
      phRange: { min: 7.0, max: 8.5 },
      hardnessDgh: { min: 15, max: 30 },
      notes: ['长期更适合中硬到硬、偏碱性的水；不把“加盐”当作替代硬度管理的通用规则。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'variable',
      sexRatioGuidance: '繁殖群体建议一公搭配多母，减少单只母鱼被持续追逐。',
      territoriality: 'none',
      finNipping: 'unknown',
      predationRisk: 'low',
      summary: '总体温和，但长期混养对象也应能适应相同的硬、偏碱水环境；不设置没有直接证据支持的最低群体数量。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 8, measurement: 'SL' },
      minVolumeLiters: 81,
      minTankLengthCm: 90,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['标准型成体约 8 cm SL，长期规划参考至少 90 × 30 cm 缸底和约 81L 水体。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
  },
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
      finNipVulnerability: 'high',
      swimmingPace: 'unknown',
      predationRisk: 'low',
      summary: '总体温和，适合温和社区缸；成年公鱼和观赏品系常有延长鳍条，对追鳍鱼更脆弱；繁殖群体还需管理公鱼持续追逐母鱼的问题。',
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
  sp_0014: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '成熟母鱼通常更大、腹部更圆更宽；公鱼相对纤细。',
      points: ['母鱼：成熟后通常更大、更圆宽。', '公鱼：通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal', minimumGroupSize: 4, recommendedGroupSize: { min: 6 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', predationRisk: 'low',
      summary: '温和平和、明显群居，长期建议至少 4–6 条；主要在底层觅食，不应被当作“只吃残饵的清洁工具”。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 7.5, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'medium', swimmingZone: 'bottom', needsCover: true,
      spaceNotes: ['长期饲养优先按至少 80 × 30 cm 缸底规划，底床以细砂或保持洁净的圆润底材更合适。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0443: {
    sexIdentification: {
      title: '成熟后可从俯视体型辅助判断',
      summary: '成熟母鱼通常腹部更圆、体型略大；俯视时差异更容易观察。',
      points: ['母鱼：通常更圆、更宽，体型略大。', '公鱼：通常相对纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal', minimumGroupSize: 6, recommendedGroupSize: { min: 6 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', predationRisk: 'low',
      summary: '非常温和的底栖群居鱼，建议至少 6 条；不要和明显大型或攻击性强的鱼搭配。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 5, measurement: 'SL' }, minVolumeLiters: 41, minTankLengthCm: 45, activityLevel: 'medium', swimmingZone: 'bottom', needsCover: true,
      spaceNotes: ['小群可按至少 45 × 30 cm 缸底规划；细砂底床更符合其长期底栖觅食方式。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
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

  sp_0446: {
    sexIdentification: {
      title: '平时很难可靠分公母',
      summary: '普通体态差异不可靠；进入繁殖状态后，可结合生殖乳突和配对行为辅助判断。',
      points: ['繁殖期公鱼生殖乳突通常更小、更尖。', '非繁殖期不要只凭额头、体型或鳍形下结论。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      limitations: ['生殖乳突通常只有在繁殖时更容易观察，行为只能作为辅助。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', territoriality: 'medium', finNipping: 'low', finNipVulnerability: 'high', swimmingPace: 'moderate', predationRisk: 'medium',
      summary: '总体可做社区鱼，但成年后会有同类争斗和繁殖领地行为；长鳍使其不适合与习惯追鳍的鱼同缸，同时可能捕食很小的鱼。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare', 'tamu-pterophyllum-scalare-reproduction'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 15, measurement: 'SL' }, minVolumeLiters: 200, minTankLengthCm: 100, activityLevel: 'medium', needsCover: true,
      spaceNotes: ['成体按约 100 × 40 × 50 cm 以上规划；除了缸长，还要保留足够高度让背鳍和臀鳍舒展。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare'], reviewedAt: '2026-09-11' },
    },
  },
};

const reviewedKnowledgeByBaseSpeciesKey: Partial<Record<string, SpeciesKnowledgeProfile['knowledge']>> = {

  'Neocaridina davidi': {
    sexIdentification: {
      title: '成体公母可结合体型与腹部形态判断',
      summary: '几何形态研究显示，成体母虾整体更大，第二腹节侧板更宽更延长；但公虾体型与幼年母虾存在重叠，幼体阶段不宜只凭外形下结论。',
      points: ['成体母虾：通常更大，腹部第二节侧板更宽、更延长。', '公虾通常更小，但外形会与尚未成熟的母虾重叠。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Zootaxa', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['成体通常体型较小'],
      femaleTraits: ['成体整体更大', '第二腹节侧板更宽、更延长'],
      limitations: ['幼年母虾与公虾外形可重叠，未成熟个体不宜仅凭体型定性。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['zootaxa-neocaridina-sexual-dimorphism'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'other',
      plainLanguageLabel: '抱卵孵化',
      summary: 'Neocaridina davidi 可在完整淡水生命周期中繁殖；母虾完成卵巢成熟、抱卵和幼体孵化，成熟生物膜可为幼虾提供持续食物来源。',
      parentalCare: 'carrying',
      breedingAggression: 'none',
      fryCare: ['成熟生物膜和细密表面有助于幼虾取食与存活', '过滤进水口应避免吸入幼虾'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquaculture-research-neocaridina-life-cycle'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 6, recommendedGroupSize: { min: 6, max: 10 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow', predationVulnerability: 'high',
      summary: '该种属于高度群居、和平的淡水米虾。最低群体数量来自水族养护共识而非福利实验硬阈值，因此用于规划提醒，不作为差 1 只就失败的硬边界。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neocaridina-davidi', 'zootaxa-neocaridina-sexual-dimorphism'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 20, minTankLengthCm: 30, activityLevel: 'low', swimmingZone: 'bottom', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['成熟生物膜、植物和躲避结构比单纯追求更大的升数更重要。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neocaridina-davidi'], reviewedAt: '2026-09-11' },
    },
  },
  'Caridina cantonensis': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前纳入审核的来源足以支持群体和空间规划，但不足以把外观公母特征作为稳定的用户判断规则。',
      points: ['如需要繁殖配组，优先使用可靠繁育来源或成熟个体长期观察。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 10, recommendedGroupSize: { min: 10 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow', predationVulnerability: 'high',
      summary: '水晶虾属于和平、群居的淡水米虾；更重要的限制通常是软酸水、稳定温度与成熟环境，而不是与同类争斗。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquendium-caridina-cantonensis'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 19, activityLevel: 'low', swimmingZone: 'bottom', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['优先保证稳定、成熟的软酸水环境和生物膜；参考水体不是单一硬阈值。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquendium-caridina-cantonensis'], reviewedAt: '2026-09-11' },
    },
  },
  'Neritina natalensis': {
    sexIdentification: {
      title: '外观公母不适合日常快速判断',
      summary: '斑马螺雌雄分开，但日常外观辨别并不稳定；当前不把颜色或壳纹当作性别依据。',
      points: ['如果不是繁殖目的，无需为了日常饲养强行判断公母。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '外观性别判断不作为当前产品规则', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'variable', swimmingZone: 'all', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow',
      summary: '可单独或多只饲养，不设置最低群体数量；主要约束是成熟藻膜、硬度和足够的刮食表面。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neritina-natalensis'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 20, minTankLengthCm: 30, activityLevel: 'low', swimmingZone: 'all',
      spaceNotes: ['可用刮食面积和藻膜供给比“每只固定多少升”更重要。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neritina-natalensis'], reviewedAt: '2026-09-11' },
    },
  },
  'Amatitlania nigrofasciata': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前已审核资料足以确认领地与攻击行为，但不足以把外观性别特征作为稳定的用户判断规则。',
      points: ['如果需要繁殖配对，优先结合可靠繁育来源与成熟个体的持续行为观察。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'high',
      finNipping: 'medium',
      swimmingPace: 'unknown',
      predationRisk: 'unknown',
      summary: '领地性与攻击行为是主要混养边界；进入繁殖和护域状态后风险会进一步上升，因此不能把“平时暂时和平”当作长期兼容。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['convict-cichlid-territory-study'], reviewedAt: '2026-09-12' },
    },
  },
  'Channa asiatica': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前已审核资料足以支持捕食、单养和领地风险判断，但不足以把外观性别特征作为稳定的用户规则。',
      points: ['如果需要繁殖配对，优先使用有明确繁育记录的成熟个体来源，不凭颜色或头型猜测。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'solitary',
      territoriality: 'unknown',
      finNipping: 'unknown',
      swimmingPace: 'unknown',
      predationRisk: 'high',
      summary: '已审核 Compatibility authority 将其视为捕食性、需要单养且有领地行为的鱼；小型鱼属于明确捕食目标，因此不能用短期未追逐来推断长期安全。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['small-snakehead-fws-assessment'], reviewedAt: '2026-09-12' },
    },
  },
  'Betta splendens': {
    sexIdentification: {
      title: '成体公母通常较容易区分',
      summary: '成体公鱼通常颜色更强、鳍更延长；母鱼鳍通常较短。观赏品系差异很大，应结合多个特征判断。',
      points: ['公鱼：通常颜色更强，非成对鳍更延长。', '母鱼：通常鳍较短，体色表现相对收敛。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      limitations: ['短鳍品系会削弱“公鱼鳍更长”这一特征，不能只看鳍长。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'bubble_nester', plainLanguageLabel: '泡巢繁殖', summary: '公鱼会建立泡巢并在繁殖过程中照护巢区；繁殖配对需要单独管理和大量躲避。',
      fertilization: 'external', parentalCare: 'egg_guarding', breedingAggression: 'high',
      breedingBehavior: ['公鱼筑泡巢并守巢', '繁殖前后需要给母鱼足够躲避空间'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'solitary', territoriality: 'high', finNipping: 'medium', finNipVulnerability: 'high', swimmingPace: 'unknown', predationRisk: 'low',
      summary: '观赏斗鱼通常不适合作为普通社区鱼；同类和外形相似、长鳍对象都可能触发争斗，而自身延长鳍也容易成为追鳍目标。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 7, measurement: 'SL' }, minTankLengthCm: 45, activityLevel: 'low', needsCover: true,
      spaceNotes: ['至少按 45 × 30 cm 缸底作为基础空间参考，并优先使用缓流、带遮蔽的环境。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
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

export const getReviewedSpeciesKnowledgeForFish = (fish: Pick<Fish, 'id' | 'scientificName'>) => {
  const direct = reviewedKnowledgeBySpeciesId[fish.id];
  if (direct) return direct;
  const baseKey = getBaseSpeciesScientificName(fish.scientificName);
  return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
};

export const buildSpeciesKnowledgeProfile = (fish: Fish): SpeciesKnowledgeProfile => {
  const reviewedKnowledge = getReviewedSpeciesKnowledgeForFish(fish);
  const reviewedEnvironment = reviewedKnowledge?.environment?.evidence.reviewStatus === 'reviewed'
    ? reviewedKnowledge.environment
    : undefined;
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
      waterType: reviewedEnvironment?.waterType ?? getWaterType(fish),
      temperatureRange: reviewedEnvironment?.temperatureRangeC ?? parseRange(fish.waterTemperature),
      phRange: reviewedEnvironment?.phRange ?? parseRange(fish.phLevel),
      minVolumeLiters: parseMinLiters(fish.tankSize),
      temperament: fish.temperament || 'unknown',
      housingMode: fish.housingMode || 'unknown',
      difficulty: fish.difficulty || 'unknown',
    },
    knowledge: reviewedKnowledge || {
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
