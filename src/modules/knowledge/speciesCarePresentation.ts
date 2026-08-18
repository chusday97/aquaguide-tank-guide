import type { Fish } from '../../types';
import { isAquaticPlantSpecies } from '../../lib/speciesClassification';
import { getReviewedPlantEnvironmentProfile } from '../environment/environmentProfileRegistry';

export type CareSourceStatus = 'verified' | 'derived' | 'generic' | 'pending';

export type CarePresentationItem = {
  label: string;
  value: string;
};

export type SpeciesCarePresentation = {
  sourceStatus: CareSourceStatus;
  sourceLabel: string;
  sourceDetail: string;
  feedingItems: CarePresentationItem[];
  environmentItems: CarePresentationItem[];
  hasStructuredProfile: boolean;
};

const clean = (value?: string) => value?.trim() || '';

const lightLabel = (value?: 'low' | 'medium' | 'high' | 'unknown') => {
  if (value === 'low') return '低光';
  if (value === 'medium') return '中等光照';
  if (value === 'high') return '高光';
  return '资料不足';
};

const co2Label = (value?: 'none' | 'optional' | 'recommended' | 'unknown') => {
  if (value === 'none') return '不需要额外 CO₂';
  if (value === 'optional') return '可选，不作为基础存活前提';
  if (value === 'recommended') return '建议补充 CO₂';
  return '资料不足';
};

const plantingTypeLabel = (value: 'rooted' | 'epiphyte' | 'floating' | 'free' | 'unknown') => {
  if (value === 'rooted') return '扎根型';
  if (value === 'epiphyte') return '附生型，固定在石材或沉木等硬景上';
  if (value === 'floating') return '浮水型';
  if (value === 'free') return '自由生长型';
  return '资料不足';
};

const substrateLabel = (value?: 'none' | 'soil' | 'sand' | 'nutrient_substrate' | 'unknown') => {
  if (value === 'none') return '不依赖底床';
  if (value === 'soil') return '土壤型底床';
  if (value === 'sand') return '砂质底床';
  if (value === 'nutrient_substrate') return '营养底床';
  return '资料不足';
};

const leafDurabilityLabel = (value?: 'delicate' | 'medium' | 'tough' | 'unknown') => {
  if (value === 'delicate') return '叶片较脆弱';
  if (value === 'medium') return '叶片韧性中等';
  if (value === 'tough') return '叶片较耐受';
  return '资料不足';
};

const getSourcePresentation = (fish: Fish) => {
  const profile = fish.feedingProfile;
  if (!profile) {
    return {
      sourceStatus: 'pending' as const,
      sourceLabel: '资料待核验',
      sourceDetail: '暂无经过复核的物种专属喂养资料。',
    };
  }

  if (profile.needsReview) {
    return {
      sourceStatus: 'pending' as const,
      sourceLabel: '资料待核验',
      sourceDetail: clean(profile.reviewReason) || '当前资料仍在人工复核队列中。',
    };
  }

  const sourceName = clean(profile.sourceName).toLowerCase();
  if (!sourceName || sourceName.includes('fallback') || sourceName.includes('template')) {
    return {
      sourceStatus: 'generic' as const,
      sourceLabel: '通用参考',
      sourceDetail: '当前内容来自类别规则模板，不代表物种专属事实。',
    };
  }

  if (sourceName.includes('manual') || sourceName.includes('verified') || sourceName.includes('reviewed')) {
    return {
      sourceStatus: 'verified' as const,
      sourceLabel: '已核验资料',
      sourceDetail: '当前内容来自人工核验资料。',
    };
  }

  return {
    sourceStatus: 'derived' as const,
    sourceLabel: '资料字段整理',
    sourceDetail: '当前内容由本地资料字段整理，仍应结合个体状态观察。',
  };
};

const pushIfPresent = (items: CarePresentationItem[], label: string, value?: string) => {
  const cleaned = clean(value);
  if (cleaned) items.push({ label, value: cleaned });
};

const buildPlantCarePresentation = (fish: Fish): SpeciesCarePresentation => {
  const reviewedProfile = getReviewedPlantEnvironmentProfile(fish.id);

  if (!reviewedProfile) {
    return {
      sourceStatus: 'pending',
      sourceLabel: '植物资料待核验',
      sourceDetail: '已识别为水生植物，但当前尚无通过复核的结构化植物养护资料；不会使用动物投喂模板补齐。',
      feedingItems: [],
      environmentItems: [],
      hasStructuredProfile: false,
    };
  }

  const environmentItems: CarePresentationItem[] = [];
  if (reviewedProfile.environment.light) {
    environmentItems.push({ label: '光照', value: lightLabel(reviewedProfile.environment.light) });
  }
  if (reviewedProfile.environment.co2) {
    environmentItems.push({ label: 'CO₂', value: co2Label(reviewedProfile.environment.co2) });
  }
  environmentItems.push({ label: '种植方式', value: plantingTypeLabel(reviewedProfile.planting.type) });
  if (reviewedProfile.planting.substrateRequired) {
    environmentItems.push({ label: '底床', value: substrateLabel(reviewedProfile.planting.substrateRequired) });
  }
  if (reviewedProfile.planting.leafDurability) {
    environmentItems.push({ label: '叶片特性', value: leafDurabilityLabel(reviewedProfile.planting.leafDurability) });
  }

  return {
    sourceStatus: 'verified',
    sourceLabel: '已核验植物资料',
    sourceDetail: '当前内容来自通过 evidence gate 的结构化植物资料；未被来源支持的字段保持未提供。',
    feedingItems: [],
    environmentItems,
    hasStructuredProfile: true,
  };
};

export const buildSpeciesCarePresentation = (fish: Fish): SpeciesCarePresentation => {
  if (isAquaticPlantSpecies(fish)) return buildPlantCarePresentation(fish);

  const profile = fish.feedingProfile;
  const feedingItems: CarePresentationItem[] = [];
  const environmentItems: CarePresentationItem[] = [];

  if (profile) {
    pushIfPresent(feedingItems, '推荐食物', profile.recommendedFoods);
    pushIfPresent(feedingItems, '投喂频率', profile.feedingFrequency);
    pushIfPresent(feedingItems, '单次份量', profile.portionRule);
    pushIfPresent(feedingItems, '投喂水层', profile.feedingLayer);
    pushIfPresent(feedingItems, '避免食物', profile.avoidFoods);
    pushIfPresent(feedingItems, '特别提醒', profile.specialNotes);
  } else {
    pushIfPresent(feedingItems, '基础资料', fish.diet);
  }

  environmentItems.push(
    { label: '换水周期', value: `约 ${fish.waterChangeCycle} 天，根据实际水质稳定调整。` },
    { label: '温度范围', value: fish.waterTemperature },
  );

  return {
    ...getSourcePresentation(fish),
    feedingItems,
    environmentItems,
    hasStructuredProfile: Boolean(profile),
  };
};
