import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Box, Calculator, CheckCircle2, ChevronLeft, ChevronRight, Flame, Heart, HeartOff, Info, Share2, Skull, SlidersHorizontal, Thermometer, Waves, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { Aquarium, Fish, MemorialCauseCode } from '../types';
import { fishData } from '../data/fishData';
import { getCareTaxonomyPath, getLifeType, getSpeciesRoleLabel, getToolFunctions } from '../modules/species/species.service';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass } from '../lib/speciesVisual';
import { evaluateTankCompatibility, type TankCompatibilityResult } from '../lib/tankCompatibilityEngine';
import { buildSpeciesKnowledgeProfile } from '../modules/knowledge/speciesKnowledge';
import { getSpeciesHousingAuthority } from '../modules/knowledge/speciesHousingAuthority';
import { resolveKnowledgeSources } from '../modules/knowledge/knowledgeSources';
import { evaluateCompatibilityDecision } from '../modules/knowledge/compatibilityKnowledge';
import { buildSpeciesCarePresentation } from '../modules/knowledge/speciesCarePresentation';
import type { PreviewImage } from './common/ImagePreviewModal';
import { AdaptiveDetailContent } from './common/AdaptiveDetailContent';
import { SurfaceHeader } from './common/SurfaceHeader';
import { ResilientImage } from './common/ResilientImage';
import { VisualResultCard } from './visual-results/VisualResultCard';
import { buildCompatibilityVisualResult, mapFitStatus } from './visual-results/visual-result.adapters';
import type { VisualResultViewModel } from './visual-results/visual-result.types';
import { markSpeciesViewed } from '../services/onboarding/onboarding.service';
import { normalizeSpeciesBatches } from '../services/aquarium/species-batches.service';
import { deriveSpeciesGroups, findGroupForSpecies, getVariantLabel } from '../lib/speciesGrouping';
import { QuickDatePicker } from './forms/QuickDatePicker';
import { MemorialCauseSelector } from './memorial/MemorialCauseSelector';

const ImagePreviewModal = lazy(() => import('./common/ImagePreviewModal').then(module => ({ default: module.ImagePreviewModal })));

type FitStatus = 'ok' | 'warning' | 'danger' | 'info';
type DetailSource = 'atlas' | 'aquarium';
type FitDimension = {
  type: string;
  label: string;
  current: string;
  requirement: string;
  status: FitStatus;
  advice: string;
};
type FitAssessmentStatus = 'suitable' | 'alreadyInTank' | 'needConfirmation' | 'setupNeeded' | 'unsuitable' | 'conflictRisk' | 'unknown' | 'caution';
type RuleFitStatus = 'match' | 'warning' | 'mismatch' | 'unknown';
type SpeciesFitAssessment = {
  status: FitAssessmentStatus;
  title: string;
  conclusion: string;
  isEmptyTank: boolean;
  alreadyInTank: boolean;
  existingLivestockCount: number;
  environmentFit: FitDimension[];
  spaceFit: FitDimension[];
  equipmentFit: FitDimension[];
  compatibilityFit: FitDimension[];
  items: FitDimension[];
  ruleResult: TankCompatibilityResult;
  compatibilityResult: TankCompatibilityResult;
  risks: FitDimension[];
  confirmations: FitDimension[];
};

type SpeciesDetailDialogProps = {
  mode?: 'dialog' | 'panel';
  fish: Fish | null;
  open: boolean;
  source: DetailSource;
  aquariumContext?: Aquarium | null;
  imageSrc: string;
  owned: boolean;
  inCalculator: boolean;
  inWishlist: boolean;
  detailFeedback?: string;
  finalFocusElement?: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
  onSelectSpecies?: (fish: Fish) => void;
  onAddToTank?: (fish: Fish) => void;
  onAddToCalculator: (fish: Fish) => void;
  onToggleWishlist: (fishId: string) => void;
  onGoCalculator?: () => void;
  onViewInTank?: () => void;
  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;
  onRecordDeath?: (fish: Fish, input: { date: string; causeCodes: MemorialCauseCode[]; reason?: string; batchId?: string; operationId: string }) => void | Promise<void>;
};

const getLocalDateValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const parseRange = (value: string) => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
};

const getTankVolumeLiters = (aquarium?: Aquarium | null) => {
  if (!aquarium?.dimensions) return null;
  const length = Number(aquarium.dimensions.length);
  const width = Number(aquarium.dimensions.width);
  const height = Number(aquarium.dimensions.height);
  if (!length || !width || !height) return null;
  return Math.round((length * width * height * 0.85) / 1000);
};

const getReviewedSpaceKnowledge = (fish: Fish) => {
  const space = buildSpeciesKnowledgeProfile(fish).knowledge.spaceAndGrowth;
  return space?.evidence.reviewStatus === 'reviewed' ? space : undefined;
};

const getMinimumTankLiters = (fish: Fish) => {
  const reviewedSpace = getReviewedSpaceKnowledge(fish);
  if (reviewedSpace?.minVolumeLiters != null) return reviewedSpace.minVolumeLiters;
  const match = fish.tankSize.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const getTankSizeRequirementLabel = (fish: Fish, isEn = false) => {
  const reviewedSpace = getReviewedSpaceKnowledge(fish);
  if (!reviewedSpace) return fish.tankSize;
  const parts = [
    reviewedSpace.minVolumeLiters != null ? `≥${reviewedSpace.minVolumeLiters}L` : null,
    reviewedSpace.minTankLengthCm != null
      ? (isEn ? `tank length ≥${reviewedSpace.minTankLengthCm}cm` : `缸长 ≥${reviewedSpace.minTankLengthCm}cm`)
      : null,
  ].filter(Boolean);
  return parts.join(' · ') || fish.tankSize;
};

const getSwimmingZoneLabel = (zone: string | undefined, isEn = false) => {
  if (!zone) return '';
  const labels: Record<string, [string, string]> = {
    surface: ['表层', 'Surface'],
    upper: ['上层', 'Upper'],
    middle: ['中层', 'Midwater'],
    bottom: ['底层', 'Bottom'],
    all: ['全水层', 'All levels'],
    unknown: ['未知', 'Unknown'],
  };
  return labels[zone]?.[isEn ? 1 : 0] || zone;
};

const getActivityLevelLabel = (level: string | undefined, isEn = false) => {
  if (!level) return '';
  const labels: Record<string, [string, string]> = {
    low: ['较低', 'Low'],
    medium: ['中等', 'Moderate'],
    high: ['较高', 'High'],
    unknown: ['未知', 'Unknown'],
  };
  return labels[level]?.[isEn ? 1 : 0] || level;
};

const getRecommendedGroupLabel = (range: { min?: number; max?: number } | undefined, isEn = false) => {
  if (!range?.min && !range?.max) return '';
  if (range.min && range.max) return isEn ? `${range.min}–${range.max} individuals` : `${range.min}–${range.max} 条/只`;
  if (range.min) return isEn ? `${range.min}+ individuals` : `≥${range.min} 条/只`;
  return isEn ? `up to ${range.max} individuals` : `≤${range.max} 条/只`;
};

const getExistingLivestock = (aquarium?: Aquarium | null) => (
  (aquarium?.fishes || [])
    .map(item => ({ aqFish: item, fish: fishData.find(fish => fish.id === item.fishId) }))
    .filter((item): item is { aqFish: Aquarium['fishes'][number]; fish: Fish } => {
      if (!item.fish) return false;
      const lifeType = getLifeType(item.fish);
      return lifeType !== 'plant' && lifeType !== 'hardscape';
    })
);

const getDifficultyBadgeClass = (difficulty: Fish['difficulty']) => {
  if (difficulty === 'Easy') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (difficulty === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
};

const getFishTemperatureTheme = (tempString: string) => {
  const match = tempString.match(/(\d+)-(\d+)/);
  if (!match) return { needsHeater: false };
  return { needsHeater: parseInt(match[1], 10) >= 20 };
};

const getFitStatusClass = (status: FitStatus) => {
  if (status === 'ok') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (status === 'warning') return 'border-amber-100 bg-amber-50 text-amber-700';
  if (status === 'danger') return 'border-red-100 bg-red-50 text-red-600';
  return 'border-sky-100 bg-sky-50 text-sky-700';
};

const getCareSourceClass = (status: ReturnType<typeof buildSpeciesCarePresentation>['sourceStatus']) => {
  if (status === 'verified') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (status === 'derived') return 'border-sky-100 bg-sky-50 text-sky-700';
  if (status === 'generic') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-orange-100 bg-orange-50 text-orange-700';
};

const getFitCurrentClass = (status: FitStatus) => {
  if (status === 'warning') return 'text-amber-700';
  if (status === 'danger') return 'text-red-600';
  if (status === 'info') return 'text-sky-700';
  return 'text-emerald-700';
};

const getFitStatusLabel = (status: FitStatus, isEn = false) => {
  if (status === 'ok') return isEn ? 'Fit' : '匹配';
  if (status === 'warning') return isEn ? 'Adjust' : '需调整';
  if (status === 'danger') return isEn ? 'Risk' : '风险';
  return isEn ? 'Confirmed factors' : '当前可确认';
};

const mapCompatibilityStatusToDetailStatus = (
  compatibility: TankCompatibilityResult,
  options: { aquarium?: Aquarium | null; alreadyInTank: boolean },
): FitAssessmentStatus => {
  if (!options.aquarium) return 'unknown';
  if (options.alreadyInTank && compatibility.status !== 'not_recommended') return 'alreadyInTank';
  if (compatibility.status === 'compatible') return 'suitable';
  if (compatibility.status === 'insufficient_data') return 'needConfirmation';
  if (compatibility.status === 'caution') {
    const hasOnlyAdvisoryMissingData = compatibility.warningRules.length === 0
      && compatibility.missingData.length > 0
      && compatibility.missingData.every(item => item.severity === 'low' || item.severity === 'info');
    return hasOnlyAdvisoryMissingData ? 'suitable' : 'caution';
  }
  const hasCompatibilityBlock = compatibility.blockingRules.some(rule => (
    /predation|territorial|single|compat|attack|housing/i.test(rule.code)
  ));
  return hasCompatibilityBlock ? 'conflictRisk' : 'unsuitable';
};

const getCompatibilityTitle = (
  status: FitAssessmentStatus,
  options: { isEmptyTank: boolean },
  t: any,
) => {
  if (status === 'alreadyInTank') return t('encyclopedia.fitStatusInTank');
  if (status === 'suitable') return options.isEmptyTank ? t('encyclopedia.fitStatusNewTank') : t('encyclopedia.fitStatusSuitable');
  if (status === 'needConfirmation') return t('encyclopedia.fitStatusMatchConfirm');
  if (status === 'caution') return t('encyclopedia.fitStatusTryCaution');
  if (status === 'conflictRisk') return t('encyclopedia.fitStatusCautionMix');
  if (status === 'unsuitable') return t('encyclopedia.fitStatusUnsuitable');
  return t('encyclopedia.fitStatusSetupNeeded');
};

const toRuleFitStatus = (status: FitStatus): RuleFitStatus => {
  if (status === 'ok') return 'match';
  if (status === 'danger') return 'mismatch';
  if (status === 'warning') return 'warning';
  return 'unknown';
};

const getSpeciesRole = (fish: Fish, isEn = false) => {
  return getSpeciesRoleLabel(fish, isEn);
};

const getSecondaryCareType = (fish: Fish) => {
  const text = `${fish.name} ${fish.scientificName} ${fish.category}`;
  if (/水母|Aurelia|Chrysaora|Phyllorhiza|Cassiopea|Cotylorhiza|Sanderia/i.test(text)) return '水母';
  if (/海葵|anemone|Entacmaea|Stichodactyla|Heteractis/i.test(text)) return '海葵';
  return '';
};

const getSpeciesFitAssessment = (fish: Fish, aquarium: Aquarium | null | undefined, t: any, isEn = false): SpeciesFitAssessment => {
  const tempRange = parseRange(fish.waterTemperature);
  const phRange = parseRange(fish.phLevel);
  const tankLiters = getTankVolumeLiters(aquarium);
  const minLiters = getMinimumTankLiters(fish);
  const currentTemperature = aquarium?.targetTemperature ? Number(aquarium.targetTemperature) : null;
  const taxonomy = getCareTaxonomyPath(fish);
  const isSaltwaterSpecies = taxonomy.waterType.includes('海水');
  const waterTypeMismatch = !!aquarium && ((aquarium.waterType === 'Saltwater') !== isSaltwaterSpecies);
  const needsHeater = getFishTemperatureTheme(fish.waterTemperature).needsHeater;
  const heaterMissing = needsHeater && aquarium?.equipment?.heater === false;
  const existingLivestock = getExistingLivestock(aquarium);
  const isEmptyTank = existingLivestock.length === 0;
  const alreadyInTank = existingLivestock.some(item => item.fish.id === fish.id);
  const specialCareType = getSecondaryCareType(fish);
  const hasFilter = Boolean(aquarium?.equipment?.filter);

  const environmentFit: FitDimension[] = [
    {
      type: 'water_type',
      label: isEn ? "Water Type" : "水体类型",
      current: aquarium ? (aquarium.waterType === 'Saltwater' ? t('encyclopedia.saltwater_label') : t('encyclopedia.freshwater_label')) : t('encyclopedia.noTankSelected'),
      requirement: isSaltwaterSpecies ? t('encyclopedia.saltwater_label') : t('encyclopedia.freshwater_label'),
      status: !aquarium ? 'info' : waterTypeMismatch ? 'danger' : 'ok',
      advice: !aquarium
        ? t('encyclopedia.adviceWaterTypeNoTank')
        : waterTypeMismatch
          ? t('encyclopedia.adviceWaterTypeMismatch')
          : t('encyclopedia.waterTypeMatch'),
    },
    {
      type: 'temperature',
      label: isEn ? "Temperature" : "温度",
      current: currentTemperature ? `${currentTemperature}℃` : t('encyclopedia.noTankSelected'),
      requirement: fish.waterTemperature,
      status: !aquarium || !currentTemperature || !tempRange
        ? 'info'
        : currentTemperature >= tempRange.min && currentTemperature <= tempRange.max ? 'ok' : 'warning',
      advice: !aquarium || !currentTemperature
        ? t('encyclopedia.adviceTempNoTank')
        : currentTemperature >= (tempRange?.min || 0) && currentTemperature <= (tempRange?.max || 99)
          ? t('encyclopedia.tempMatch')
          : t('encyclopedia.tempWarning', { range: fish.waterTemperature, current: currentTemperature }),
    },
    {
      type: 'water_parameter',
      label: isEn ? "Water Parameters" : "水质参数",
      current: phRange ? t('encyclopedia.phMatch') : (isEn ? 'Not recorded' : '未记录'),
      requirement: phRange ? fish.phLevel : (isEn ? 'Review pending' : '待审核'),
      status: 'info',
      advice: phRange ? t('encyclopedia.phMatch') : t('encyclopedia.phWarning', { range: fish.phLevel, current: 'pH' }),
    },
  ];

  const spaceFit: FitDimension[] = [
    {
      type: 'space',
      label: isEn ? "Tank Size" : "缸体大小",
      current: tankLiters ? `~${tankLiters}L` : t('encyclopedia.noTankSelected'),
      requirement: getTankSizeRequirementLabel(fish, isEn),
      status: !tankLiters || !minLiters ? 'info' : tankLiters >= minLiters ? 'ok' : tankLiters < minLiters * 0.65 ? 'danger' : 'warning',
      advice: !tankLiters || !minLiters
        ? t('encyclopedia.adviceSpaceNoTank')
        : tankLiters >= minLiters
          ? t('encyclopedia.adviceSpaceSuitable')
          : t('encyclopedia.adviceSpaceWarning', { min: minLiters, current: tankLiters }),
    },
  ];

  const equipmentFit: FitDimension[] = [
    {
      type: 'care_difficulty',
      label: isEn ? "Care Difficulty" : "养护难度",
      current: t('encyclopedia.difficultyCategory'),
      requirement: fish.difficulty === 'Easy' ? t('encyclopedia.difficultyEasyShort') : fish.difficulty === 'Medium' ? t('encyclopedia.difficultyMediumShort') : t('encyclopedia.difficultyHardShort'),
      status: fish.difficulty === 'Hard' ? 'warning' : 'ok',
      advice: fish.difficulty === 'Easy' ? t('encyclopedia.adviceEasy') : fish.difficulty === 'Medium' ? t('encyclopedia.adviceMedium') : t('encyclopedia.adviceHard'),
    },
    {
      type: 'filter',
      label: isEn ? "Filtration" : "过滤",
      current: aquarium?.equipment?.filter || t('encyclopedia.noTankSelected'),
      requirement: specialCareType === '水母' ? (t('encyclopedia.freshwater') === '淡水' ? '专用水母缸 / 柔和循环水流' : 'Specialized Jellyfish Tank') : (t('encyclopedia.freshwater') === '淡水' ? '稳定过滤' : 'Stable Filtration'),
      status: !aquarium ? 'info' : specialCareType === '水母' ? 'warning' : hasFilter ? 'ok' : 'info',
      advice: !aquarium
        ? t('encyclopedia.adviceFilterNoTank')
        : specialCareType === '水母'
          ? (t('encyclopedia.freshwater') === '淡水' ? '水母需要专用缸体，并避免普通过滤产生强吸力。' : 'Jellyfish require specialized tanks to avoid strong suction from standard filters.')
          : hasFilter
            ? (t('encyclopedia.freshwater') === '淡水' ? '已记录过滤设备。' : 'Filter recorded.')
            : (t('encyclopedia.freshwater') === '淡水' ? '当前未确认过滤设备，建议补充过滤配置。' : 'No filter confirmed yet. Adding filtration is recommended.'),
    },
    {
      type: 'heater',
      label: isEn ? "Heater" : "加热",
      current: aquarium ? (aquarium.equipment?.heater ? t('encyclopedia.heaterYes') : t('encyclopedia.heaterNo')) : t('encyclopedia.noTankSelected'),
      requirement: needsHeater ? t('encyclopedia.heaterYes') : t('encyclopedia.heaterNo'),
      status: !aquarium ? 'info' : heaterMissing ? 'warning' : 'ok',
      advice: !aquarium
        ? t('encyclopedia.adviceHeaterNoTank')
        : heaterMissing
          ? t('encyclopedia.adviceHeaterWarning')
          : needsHeater
            ? (t('encyclopedia.freshwater') === '淡水' ? '已配置加热棒，建议同时使用温度计观察波动。' : 'Heater configured. Thermometer is recommended to monitor temp fluctuations.')
            : (t('encyclopedia.freshwater') === '淡水' ? '当前物种通常不强制配置加热棒。' : 'Heater not strictly required for this species.'),
    },
  ];

  const housingPresentation = getSpeciesHousingAuthority(fish, isEn);
  const compatibilityFit: FitDimension[] = isEmptyTank ? [] : [{
    type: alreadyInTank ? 'livestock_status' : 'compatibility',
    label: isEn ? "Compatibility" : "混养",
    current: alreadyInTank ? t('encyclopedia.inTankAlready') : t('encyclopedia.livestockCount', { count: existingLivestock.length }),
    requirement: housingPresentation.label,
    status: alreadyInTank ? 'ok' : housingPresentation.status,
    advice: alreadyInTank ? t('encyclopedia.adviceLivestockInTank') : housingPresentation.advice,
  }];
  const items = [...environmentFit, ...spaceFit, ...equipmentFit, ...compatibilityFit];
  const compatibilityResult = evaluateTankCompatibility({
    tank: aquarium,
    existingSpecies: existingLivestock
      .filter(item => item.fish.id !== fish.id)
      .map(item => ({ species: item.fish, record: { quantity: item.aqFish.quantity } })),
    candidateSpecies: fish,
    candidateQuantity: 1,
  });

  const dangerCount = items.filter(item => item.status === 'danger').length;
  const warningCount = items.filter(item => item.status === 'warning').length;
  const infoCount = items.filter(item => item.status === 'info').length;
  const status = mapCompatibilityStatusToDetailStatus(compatibilityResult, { aquarium, alreadyInTank });
  const firstIssue = items.find(item => item.status === 'danger') || items.find(item => item.status === 'warning') || items.find(item => item.status === 'info');
  const title = getCompatibilityTitle(status, { isEmptyTank }, t);
  const conclusion = status === 'alreadyInTank'
    ? t('encyclopedia.adviceAlreadyInTankPage')
    : compatibilityResult.summary || firstIssue?.advice || t('encyclopedia.fitPending');
  const ruleResult = compatibilityResult;

  return {
    status,
    title,
    conclusion,
    isEmptyTank,
    alreadyInTank,
    existingLivestockCount: existingLivestock.length,
    environmentFit,
    spaceFit,
    equipmentFit,
    compatibilityFit,
    items,
    ruleResult,
    compatibilityResult,
    risks: items.filter(item => item.status === 'warning' || item.status === 'danger'),
    confirmations: items.filter(item => item.status === 'info'),
  };
};

const roleLabelKeys: Record<string, string> = {
  '观赏生物 / 特殊缸体': 'roleSpecialTank',
  '观赏生物 / 海水特殊养护': 'roleMarineCare',
  '礁岩珊瑚 / 海水生态': 'roleReefCoral',
  '水草造景 / 环境植物': 'rolePlantedEnvironment',
  '造景素材 / 环境配置': 'roleSceneryConfig',
  '工具虾螺 / 除藻生物': 'roleAlgaeCrew',
  '工具生物 / 除藻辅助': 'roleAlgaeHelper',
  '底层生物 / 清残饵': 'roleBottomCrew',
  '水陆生物 / 独立规划': 'roleAmphibianIndy',
  '观赏主角 / 建议单养': 'roleSingleMain',
  '小型观赏鱼 / 群游搭配': 'roleSmallSchooling',
  '工具生物 / 生态搭配': 'roleEcoInvertebrate',
  '观赏无脊椎 / 生态搭配': 'roleEcoInvertebrate2',
  '观赏生物 / 鱼缸搭配': 'roleGeneralLivestock',
};

const translateTag = (tag: string, t: any) => {
  if (tag === '适合混养') return t('encyclopedia.compatible');
  if (tag === '谨慎混养') return t('encyclopedia.cautionMix');
  if (tag === '建议单养' || tag === '单独饲养') return t('encyclopedia.singleSpecimen');
  if (tag === '主题生物' || tag === '观赏主角') return t('encyclopedia.roleSingleMain');
  return tag;
};

const getLocalizedSpeciesRole = (fish: Fish, t: any) => {
  const role = getSpeciesRole(fish);
  return roleLabelKeys[role] ? t('encyclopedia.' + roleLabelKeys[role]) : role;
};

const getFishTemperamentLabel = (temperament?: string, isEn = false) => {
  if (!temperament) return isEn ? 'Peaceful' : '温和';
  const lower = temperament.toLowerCase();
  if (lower.includes('peaceful')) return isEn ? 'Peaceful' : '温和无争';
  if (lower.includes('semi')) return isEn ? 'Semi-aggressive' : '具一定领域性';
  if (lower.includes('aggressive')) return isEn ? 'Aggressive' : '强攻击性 / 建议单养';
  return temperament;
};

export function SpeciesDetailDialog({
  mode = 'dialog',
  fish,
  open,
  source,
  aquariumContext,
  imageSrc,
  owned,
  inCalculator,
  inWishlist,
  detailFeedback,
  finalFocusElement,
  onOpenChange,
  onSelectSpecies,
  onAddToTank,
  onAddToCalculator,
  onToggleWishlist,
  onGoCalculator,
  onViewInTank,
  onOpenTankSettings,
  onRecordDeath,
}: SpeciesDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const translateLabel = (label: string) => {
    if (label === '水体类型') return t('encyclopedia.waterType');
    if (label === '温度') return t('encyclopedia.tempLabelBasic');
    if (label === '水质参数') return t('encyclopedia.phRangeLabel');
    if (label === '空间' || label === '缸体大小') return t('encyclopedia.spaceLabel');
    if (label === '过滤') return t('encyclopedia.filterLabel');
    if (label === '加热') return t('encyclopedia.heaterLabel');
    if (label === '养护难度') return t('encyclopedia.difficultyLabel');
    if (label === '混养') return t('encyclopedia.temperamentMixing');
    return label;
  };
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'fit' | 'compatibility' | null>(null);
  const [inlineFeedback, setInlineFeedback] = useState('');
  const [isDeathFormOpen, setIsDeathFormOpen] = useState(false);
  const [deathDate, setDeathDate] = useState(getLocalDateValue);
  const [deathCauseCodes, setDeathCauseCodes] = useState<MemorialCauseCode[]>([]);
  const [deathReason, setDeathReason] = useState('');
  const ownedRecord = useMemo(() => aquariumContext?.fishes.find(item => item.fishId === fish?.id), [aquariumContext, fish?.id]);
  const deathBatches = useMemo(() => ownedRecord ? normalizeSpeciesBatches(ownedRecord) : [], [ownedRecord]);
  const [deathBatchId, setDeathBatchId] = useState('');
  const [deathOperationId, setDeathOperationId] = useState('');
  const [deathError, setDeathError] = useState('');
  const [isRecordingDeath, setIsRecordingDeath] = useState(false);
  const deathReasonRef = useRef<HTMLTextAreaElement | null>(null);
  const careSectionButtonRef = useRef<HTMLElement | null>(null);
  const selectedFit = useMemo(() => fish ? getSpeciesFitAssessment(fish, aquariumContext, t, isEn) : null, [fish, aquariumContext, isEn, t]);
  const displayFit = selectedFit;
  const selectedTaxonomy = fish ? getCareTaxonomyPath(fish) : null;
  const resolvedImageSrc = fish ? (imageSrc || getSpeciesDisplayImage(fish)) : '';
  const speciesGroup = useMemo(() => {
    if (!fish) return null;
    return findGroupForSpecies(fish.id, deriveSpeciesGroups(fishData));
  }, [fish, isEn]);
  const speciesGroupVariants = useMemo(() => {
    if (!speciesGroup) return [];
    const unique = new Map<string, Fish>();
    speciesGroup.variants.forEach(variant => {
      const key = `${variant.name.trim().toLowerCase()}|${variant.scientificName.trim().toLowerCase()}`;
      if (!unique.has(key) || variant.id === fish?.id) unique.set(key, variant);
    });
    return Array.from(unique.values());
  }, [fish?.id, speciesGroup]);
  const speciesGroupIndex = fish
    ? speciesGroupVariants.findIndex(variant => variant.id === fish.id)
    : -1;

  useEffect(() => {
    if (open && fish) markSpeciesViewed();
  }, [fish, open]);

  useEffect(() => {
    if (!open) return;
    setExpandedSection(null);
    setInlineFeedback('');
    setIsDeathFormOpen(false);
    setDeathDate(getLocalDateValue());
    setDeathCauseCodes([]);
    setDeathReason('');
    setDeathBatchId('');
    setDeathOperationId('');
    setDeathError('');
    setIsRecordingDeath(false);
  }, [open, fish?.id]);

  const openPreview = () => {
    if (!fish) return;
    setPreviewImages([{ src: resolvedImageSrc, title: fish.name }]);
    setPreviewIndex(0);
    setIsPreviewOpen(true);
  };

  const selectAdjacentSpecies = (direction: -1 | 1) => {
    if (!speciesGroup || speciesGroupIndex < 0 || !onSelectSpecies) return;
    const nextIndex = (speciesGroupIndex + direction + speciesGroupVariants.length) % speciesGroupVariants.length;
    onSelectSpecies(speciesGroupVariants[nextIndex]);
  };

  const metricCards = useMemo(() => {
    if (!displayFit) return [];
    const findItem = (type: FitDimension['type']) => displayFit.items.find(item => item.type === type);
    const water = findItem('water_type');
    const temp = findItem('temperature');
    const space = findItem('space');
    const filter = findItem('filter');
    const heater = findItem('heater');
    return [
      water && { ...water, icon: Waves },
      temp && { ...temp, icon: Thermometer },
      space && { ...space, icon: Box },
      filter && { ...filter, icon: SlidersHorizontal },
      heater && { ...heater, icon: Flame },
    ].filter(Boolean) as Array<FitDimension & { icon: typeof Waves }>;
  }, [displayFit]);

  const speciesKnowledge = useMemo(() => fish ? buildSpeciesKnowledgeProfile(fish) : null, [fish]);
  const effectiveHousing = useMemo(() => fish ? getSpeciesHousingAuthority(fish, isEn) : null, [fish, isEn]);
  const sexIdentificationGuide = speciesKnowledge?.knowledge.sexIdentification || null;
  const reproductionKnowledge = speciesKnowledge?.knowledge.reproduction || null;
  const environmentKnowledge = speciesKnowledge?.knowledge.environment || null;
  const socialKnowledge = speciesKnowledge?.knowledge.socialBehavior || null;
  const spaceKnowledge = speciesKnowledge?.knowledge.spaceAndGrowth || null;
  const sexIdentificationSources = useMemo(() => resolveKnowledgeSources(
    sexIdentificationGuide?.evidence?.sourceIds || [],
  ), [sexIdentificationGuide]);
  const reproductionSources = useMemo(() => resolveKnowledgeSources(
    reproductionKnowledge?.evidence.sourceIds || [],
  ), [reproductionKnowledge]);
  const environmentSources = useMemo(() => resolveKnowledgeSources(
    environmentKnowledge?.evidence.sourceIds || [],
  ), [environmentKnowledge]);
  const socialSources = useMemo(() => resolveKnowledgeSources(
    socialKnowledge?.evidence.sourceIds || [],
  ), [socialKnowledge]);
  const spaceSources = useMemo(() => resolveKnowledgeSources(
    spaceKnowledge?.evidence.sourceIds || [],
  ), [spaceKnowledge]);
  const carePresentation = useMemo(() => fish ? buildSpeciesCarePresentation(fish) : null, [fish]);
  const compatibilityDecision = useMemo(() => {
    if (!fish || !aquariumContext) return null;
    const selectedQuantity = aquariumContext.fishes.find(item => item.fishId === fish.id)?.quantity || 1;
    const fishAlreadyInTank = aquariumContext.fishes.some(record => record.fishId === fish.id);
    const existingItems = getExistingLivestock(aquariumContext)
      .filter(item => item.fish.id !== fish.id)
      .map(item => ({ species: item.fish, quantity: item.aqFish.quantity, origin: 'existing' as const }));
    return evaluateCompatibilityDecision({
      tank: aquariumContext,
      items: [
        { species: fish, quantity: selectedQuantity, origin: fishAlreadyInTank ? 'existing' : 'candidate' },
        ...existingItems,
      ],
    });
  }, [fish, aquariumContext]);
  const compatibilityPairs = compatibilityDecision?.pairResults || [];

  const mainActionLabel = useMemo(() => {
    if (!displayFit || !aquariumContext) return t('encyclopedia.btnGoSetTank');
    if (owned || displayFit.alreadyInTank || displayFit.status === 'alreadyInTank') {
      return source === 'aquarium' ? t('encyclopedia.viewCareEssentials') : t('aquarium.tankContentsTitle');
    }
    if (displayFit.status === 'suitable') return t('encyclopedia.btnJoinTank');
    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') return t('encyclopedia.viewTankRisk');
    return t('encyclopedia.btnCompleteSetup');
  }, [aquariumContext, displayFit, owned, source, t]);
  const verdictReasons = useMemo(() => {
    if (!displayFit || !aquariumContext) return [];
    const actionableConfirmations = displayFit.confirmations.filter(item => item.type !== 'water_parameter');
    const priorityItems = [...displayFit.risks, ...actionableConfirmations];
    const fallbackItems = displayFit.items.filter(item => item.status === 'ok');
    return [...priorityItems, ...fallbackItems]
      .map(item => ({
        label: translateLabel(item.label),
        text: item.advice || `${item.current} · ${item.requirement}`,
        status: item.status,
      }))
      .filter((item, index, list) => list.findIndex(other => other.label === item.label && other.text === item.text) === index)
      .slice(0, 3);
  }, [aquariumContext, displayFit]);
  const compatibilityVisualModel = useMemo<VisualResultViewModel | null>(() => {
    if (!fish || !compatibilityDecision) return null;
    const relatedSpecies = getExistingLivestock(aquariumContext)
      .map(item => item.fish)
      .filter(item => item.id !== fish.id);
    return buildCompatibilityVisualResult({
      decision: compatibilityDecision,
      species: [fish, ...relatedSpecies],
      focusSpeciesId: fish.id,
      primaryActionLabel: t('encyclopedia.compatibilityCalc'),
      primaryActionType: 'route',
    });
  }, [aquariumContext, compatibilityDecision, fish, t]);

  const getMetricSettingsPanel = (metric: FitDimension) => {
    if (metric.type === 'space') return 'size' as const;
    if (metric.type === 'filter' || metric.type === 'heater') return 'equipment' as const;
    if (metric.type === 'temperature' || metric.type === 'water_type') return 'parameters' as const;
    return null;
  };

  const handleMainAction = () => {
    if (!fish || !displayFit) return;
    if (!aquariumContext) {
      onOpenTankSettings?.('size');
      return;
    }
    const hasExistingLivestock = aquariumContext.fishes.some(item => Number(item.quantity) > 0);
    if ((displayFit.status === 'suitable') && onAddToTank && !owned && !displayFit.alreadyInTank) {
      // A planned addition to a non-empty tank must pass through the same
      // compatibility checkout as caution and conflict paths. Recording an
      // already-empty tank remains a direct add flow.
      if (hasExistingLivestock && onGoCalculator) {
        if (!inCalculator) onAddToCalculator(fish);
        onGoCalculator();
        return;
      }
      onAddToTank(fish);
      return;
    }
    if (owned || displayFit.alreadyInTank || displayFit.status === 'alreadyInTank') {
      if (source === 'aquarium') {
        window.requestAnimationFrame(() => {
          careSectionButtonRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          careSectionButtonRef.current?.focus({ preventScroll: true });
        });
      } else {
        onViewInTank?.();
      }
      return;
    }
    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      setExpandedSection('compatibility');
      return;
    }
    const firstIssue = metricCards.find(item => item.status !== 'ok' && getMetricSettingsPanel(item));
    if (firstIssue) {
      const panel = getMetricSettingsPanel(firstIssue);
      if (panel) onOpenTankSettings?.(panel);
    } else {
      onOpenTankSettings?.('parameters');
    }
  };

  const handleOpenCalculator = () => {
    if (!fish) return;
    if (!inCalculator) onAddToCalculator(fish);
    onGoCalculator?.();
  };

  const handleRecordDeath = async () => {
    if (!fish || !onRecordDeath || isRecordingDeath) return;
    if (!deathDate || (deathCauseCodes.length === 0 && !deathReason.trim())) {
      setDeathError(isEn ? 'Choose a possible cause or add your own.' : '请选择一个可能原因，或填写自定义原因。');
      return;
    }
    if (deathCauseCodes.includes('other') && !deathReason.trim()) {
      setDeathError(isEn ? 'Add a short note for “Other”.' : '选择“其他”后，请补充自定义原因。');
      deathReasonRef.current?.focus();
      return;
    }
    setIsRecordingDeath(true);
    setDeathError('');
    try {
      const selectedBatchId = deathBatchId || deathBatches[0]?.id;
      if (deathBatches.length > 0 && !selectedBatchId) throw new Error(t('livestock.selectMemorialBatch'));
      await onRecordDeath(fish, { date: deathDate, causeCodes: deathCauseCodes, reason: deathReason.trim() || undefined, batchId: selectedBatchId, operationId: deathOperationId });
      setIsDeathFormOpen(false);
      setDeathBatchId('');
      setDeathCauseCodes([]);
      setDeathOperationId('');
      setInlineFeedback(t('encyclopedia.freshwater') === '淡水' ? `已保存 ${fish.name} 的生命纪念。` : `Saved memorial for ${fish.name}.`);
    } catch (error) {
      setDeathError(t('encyclopedia.freshwater') === '淡水' ? '保存失败，请稍后重试。' : 'Save failed, please try again later.');
    } finally {
      setIsRecordingDeath(false);
    }
  };

  const handleShare = async () => {
    if (!fish) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: fish.name, text: `${fish.name}${t('encyclopedia.shareTextSuffix')}` });
      } else {
        await navigator.clipboard?.writeText(`${fish.name}${t('encyclopedia.shareTextSuffix')}`);
      }
      setInlineFeedback(t('encyclopedia.freshwater') === '淡水' ? '已复制分享信息' : 'Share info copied');
    } catch {
      setInlineFeedback(t('encyclopedia.freshwater') === '淡水' ? '暂时无法分享，可稍后再试' : 'Sharing unavailable now, try again later.');
    }
  };

  const detailContent = fish && displayFit ? (
    <div className={`species-detail-container flex min-h-0 flex-1 flex-col font-sans bg-white text-slate-900 ${mode === 'panel' ? 'h-full overflow-hidden' : ''}`}>
      <SurfaceHeader
        className="modalHeader species-detail-header border-b border-black/[0.06] bg-white/95 backdrop-blur-md"
        title={isEn ? 'Species profile' : '物种档案'}
        onClose={() => onOpenChange(false)}
                closeLabel={t('encyclopedia.dismiss')}
                actions={(
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-feature-building="sharing"
                      onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                      aria-label={t('encyclopedia.shareTextSuffix').trim()}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              />

              <div className="modalBody species-detail-body app-scrollbar-hidden p-0">
                <div className="p-3 min-[760px]:p-6" data-species-detail-layout="single-screen-profile">

                  {/* ========================================================
                      LEVEL 1: 核心画像与即时决策 (Specimen Hero & Immediate Verdict)
                      ======================================================== */}
                  <section className="species-detail-card overflow-hidden p-3.5 min-[760px]:p-5">
                    <div className={mode === 'panel' ? "flex flex-col gap-4" : "grid min-w-0 grid-cols-1 gap-4 min-[760px]:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] min-[760px]:gap-6"}>
                      {/* Specimen Visual Area */}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={openPreview}
                          data-species-detail-hero
                          className={`group relative flex w-full items-center justify-center rounded-[20px] border border-slate-100 bg-white ${mode === 'panel' ? 'h-[220px]' : 'h-[180px] min-[760px]:h-[270px]'} p-3 shadow-xs transition-transform duration-300 hover:scale-[1.01]`}
                          aria-label={isEn ? `Enlarge image of ${fish.name}` : `放大查看${fish.name}图片`}
                        >
                          <ResilientImage src={resolvedImageSrc} alt={fish.name} className={`h-[92%] w-[92%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105 ${getSpeciesImageClass(fish)}`} />
                          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-emerald-800/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs backdrop-blur-sm">
                            {isEn ? 'Enlarge' : '查看大图'}
                          </span>
                        </button>
                      </div>

                      {/* Specimen Profile & Fit Verdict */}
                      <div className="flex min-w-0 flex-col justify-between py-0.5">
                        <div>
                          {/* Taxonomy badge */}
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                            <span>🌿</span>
                            <span>{selectedTaxonomy?.variety || fish.category} · {selectedTaxonomy?.waterType || (isEn ? 'Aquatic' : '水族')}</span>
                          </div>

                          {/* Title & Latin */}
                          <div className="mt-1 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {mode === 'panel' ? (
                                <h2 className="break-words font-serif text-[22px] font-bold tracking-tight text-slate-900 min-[760px]:text-[26px]">
                                  {fish.name}
                                </h2>
                              ) : (
                                <DialogTitle className="break-words font-serif text-[26px] font-bold tracking-tight text-slate-900 min-[760px]:text-[32px]">
                                  {fish.name}
                                </DialogTitle>
                              )}
                              {mode === 'panel' ? (
                                <p className="mt-0.5 font-serif text-[12px] italic text-slate-500 min-[760px]:text-[13px]">
                                  {fish.scientificName}
                                </p>
                              ) : (
                                <DialogDescription className="mt-0.5 font-serif text-[13px] italic text-slate-500 min-[760px]:text-[14px]">
                                  {fish.scientificName}
                                </DialogDescription>
                              )}
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${getDifficultyBadgeClass(fish.difficulty)}`}>
                              {fish.difficulty === 'Easy' ? t('encyclopedia.difficultyEasyShort') : fish.difficulty === 'Medium' ? t('encyclopedia.difficultyMediumShort') : t('encyclopedia.difficultyHardShort')}
                            </span>
                          </div>

                          {/* Attribute Pills */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {[selectedTaxonomy?.variety, effectiveHousing?.label, ...getToolFunctions(fish)].filter(Boolean).slice(0, 3).map(tag => {
                              const displayTag = tag === effectiveHousing?.label ? tag : translateTag(tag, t);
                              return (
                                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                                  {displayTag}
                                </span>
                              );
                            })}
                          </div>

                          {/* Natural role note */}
                          <p className="mt-2.5 text-[12px] leading-relaxed text-slate-600">
                            {getLocalizedSpeciesRole(fish, t)}
                          </p>
                        </div>

                        {/* Tank Fit Assessment Capsule */}
                        <div
                          data-visual-result-status={mapFitStatus(displayFit.status)}
                          className={`mt-3.5 rounded-[16px] border p-3 shadow-xs ${
                            displayFit.status === 'suitable' || displayFit.status === 'alreadyInTank'
                              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
                              : displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk'
                                ? 'border-red-200 bg-red-50/90 text-red-950'
                                : displayFit.status === 'unknown' || displayFit.status === 'needConfirmation'
                                  ? 'border-sky-200 bg-sky-50/90 text-sky-950'
                                  : 'border-amber-200 bg-amber-50/90 text-amber-950'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
                              {displayFit.status === 'suitable' || displayFit.status === 'alreadyInTank' ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                              ) : displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' ? (
                                <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                              ) : (
                                <Info className="h-4.5 w-4.5 text-sky-600" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                {aquariumContext ? (isEn ? 'Tank Compatibility Verdict' : '与当前鱼缸匹配诊断') : (isEn ? 'No Tank Selected' : '尚未选择对比鱼缸')}
                              </div>
                              <p className="text-[14px] font-black leading-snug">
                                {displayFit.title}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-relaxed opacity-85">
                                {aquariumContext ? displayFit.conclusion : t('encyclopedia.conclusionNoTank')}
                              </p>
                            </div>
                          </div>

                          {verdictReasons.length > 0 && (
                            <div className="mt-2 grid gap-1 border-t border-black/5 pt-1.5" aria-label={isEn ? 'Key reasons' : '关键原因'}>
                              {verdictReasons.map(reason => (
                                <div key={`${reason.label}-${reason.text}`} className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium opacity-80">
                                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${reason.status === 'danger' ? 'bg-red-500' : reason.status === 'warning' ? 'bg-amber-500' : reason.status === 'ok' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                                  <span className="truncate"><strong>{reason.label}</strong> · {reason.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ========================================================
                      LEVEL 2 & 3: Bento HUD 仪表盘 (Vital Metrics & Care Profile)
                      ======================================================== */}
                  <div className="mt-3.5 grid grid-cols-1 gap-3.5">

                    {/* LEVEL 2: 黄金生存量化指标 (Vital Metrics Bento) */}
                    <section
                      ref={careSectionButtonRef}
                      tabIndex={-1}
                      data-species-environment-summary
                      className="species-detail-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                      aria-labelledby="species-vital-metrics-title"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-800">⚡</span>
                          <h3 id="species-vital-metrics-title" className="text-[12px] font-black uppercase tracking-wider text-emerald-800">
                            {isEn ? 'Vital Environmental Parameters' : '黄金生存量化指标'}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {isEn ? 'Keep Stable' : '日常稳定区间'}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        {/* Water Temp */}
                        <div className="species-detail-metric-tile">
                          <small className="block text-[10px] font-bold text-slate-500">{isEn ? 'Temperature' : '适宜水温'}</small>
                          <strong className="mt-1 block text-[15px] font-black text-slate-900 min-[760px]:text-[17px]">{fish.waterTemperature}</strong>
                          <span className="mt-0.5 block text-[10px] font-bold text-emerald-700">
                            {environmentKnowledge?.temperatureRangeC ? `${environmentKnowledge.temperatureRangeC.min}–${environmentKnowledge.temperatureRangeC.max}°C` : (isEn ? 'Target range' : '健康水温')}
                          </span>
                        </div>

                        {/* pH */}
                        <div className="species-detail-metric-tile">
                          <small className="block text-[10px] font-bold text-slate-500">{isEn ? 'Water pH' : '酸碱度 pH'}</small>
                          <strong className="mt-1 block text-[15px] font-black text-slate-900 min-[760px]:text-[17px]">{fish.phLevel || (environmentKnowledge?.phRange ? `${environmentKnowledge.phRange.min}-${environmentKnowledge.phRange.max}` : '6.5-7.5')}</strong>
                          <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                            {selectedTaxonomy?.waterType || (isEn ? 'Neutral' : '常规淡水')}
                          </span>
                        </div>

                        {/* Min Tank Size */}
                        <div className="species-detail-metric-tile">
                          <small className="block text-[10px] font-bold text-slate-500">{isEn ? 'Min Tank' : '推荐缸体'}</small>
                          <strong className="mt-1 block text-[15px] font-black text-slate-900 min-[760px]:text-[17px]">{getTankSizeRequirementLabel(fish, isEn)}</strong>
                          <span className="mt-0.5 block text-[10px] font-bold text-emerald-700">
                            {spaceKnowledge?.minVolumeLiters ? `≥${spaceKnowledge.minVolumeLiters}L` : (isEn ? 'Adequate' : '适宜水体')}
                          </span>
                        </div>

                        {/* Adult Size / Water Change */}
                        <div className="species-detail-metric-tile">
                          <small className="block text-[10px] font-bold text-slate-500">{isEn ? 'Adult Size / Care' : '成体 / 换水'}</small>
                          <strong className="mt-1 block text-[15px] font-black text-slate-900 min-[760px]:text-[17px]">
                            {spaceKnowledge?.adultLengthCm?.max ? `${spaceKnowledge.adultLengthCm.max} cm` : (t('encyclopedia.careWaterChangeValue', { days: fish.waterChangeCycle }))}
                          </strong>
                          <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                            {t('encyclopedia.careWaterChangeValue', { days: fish.waterChangeCycle })}
                          </span>
                        </div>
                      </div>

                      {fish.feedingProfile?.specialNotes && (
                        <p className="mt-2.5 rounded-[12px] bg-slate-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-slate-700 border border-slate-100">
                          <strong className="font-bold text-emerald-800">{isEn ? 'Care note: ' : '环境备忘：'}</strong>{fish.feedingProfile.specialNotes}
                        </p>
                      )}
                    </section>

                    {/* LEVEL 3: 投喂法则 (Feeding Profile Bento Card) */}
                    <section
                      data-species-feeding-summary
                      className="species-detail-card p-4"
                      aria-labelledby="species-feeding-title"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[11px] text-amber-700">🍽️</span>
                          <h3 id="species-feeding-title" className="text-[12px] font-black uppercase tracking-wider text-amber-900">
                            {isEn ? 'Feeding Profile' : '日常投喂法则'}
                          </h3>
                        </div>
                        {carePresentation && (
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black ${getCareSourceClass(carePresentation.sourceStatus)}`}>
                            {carePresentation.sourceStatus === 'pending' ? (isEn ? 'Pending' : '待审') : carePresentation.sourceStatus === 'verified' ? t('encyclopedia.fitStatusOkLabel') : t('encyclopedia.fitStatusMatchConfirm')}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Diet' : '食性与食物'}</span>
                          <strong className="text-right text-slate-900">{fish.feedingProfile?.recommendedFoods || fish.diet}</strong>
                        </div>
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Frequency' : '投喂频次'}</span>
                          <strong className="text-slate-900">{fish.feedingProfile?.feedingFrequency || (isEn ? 'Daily small' : '每日少量')}</strong>
                        </div>
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Portion' : '单次份量'}</span>
                          <strong className="text-slate-900">{fish.feedingProfile?.portionRule || (isEn ? 'Within minutes' : '数分钟内吃完')}</strong>
                        </div>
                      </div>

                      <div className="species-detail-care-quote mt-2.5">
                        <strong className="font-bold text-amber-900">{isEn ? 'Feeding Rule: ' : '投喂要点：'}</strong>
                        {fish.feedingProfile?.avoidFoods || (isEn ? 'Avoid overfeeding and uneaten food.' : '切忌过量投喂！未吃完残饵请及时捞出以防败水。')}
                      </div>
                    </section>

                    {/* LEVEL 3: 生态行为与习性 (Behavior & Habits Bento Card) */}
                    <section
                      className="species-detail-card p-4"
                      aria-labelledby="species-behavior-title"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-[11px] text-sky-700">🌊</span>
                        <h3 id="species-behavior-title" className="text-[12px] font-black uppercase tracking-wider text-emerald-800">
                          {isEn ? 'Ecological Behavior' : '生态与游动习性'}
                        </h3>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Zone' : '活动水层'}</span>
                          <strong className="text-slate-900">
                            {spaceKnowledge?.swimmingZone ? getSwimmingZoneLabel(spaceKnowledge.swimmingZone, isEn) : (isEn ? 'Middle/All' : '中层 / 全水域')}
                          </strong>
                        </div>
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Temperament' : '混养脾性'}</span>
                          <strong className="text-slate-900">
                            {getFishTemperamentLabel(fish.temperament, isEn)}
                          </strong>
                        </div>
                        <div className="species-detail-info-row">
                          <span className="text-slate-500">{isEn ? 'Schooling' : '群游需求'}</span>
                          <strong className="text-slate-900">
                            {socialKnowledge?.minimumGroupSize ? (isEn ? `≥${socialKnowledge.minimumGroupSize} fish` : `建议群养 (≥${socialKnowledge.minimumGroupSize}尾)`) : (isEn ? 'Peaceful social' : '群居或独处皆宜')}
                          </strong>
                        </div>
                      </div>
                    </section>

                    {/* LEVEL 4: 混养相容性快速洞察 (Compatibility Insight) */}
                    <section
                      className="species-detail-card p-4"
                      aria-labelledby="species-compatibility-title"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-800">🛡️</span>
                          <h3 id="species-compatibility-title" className="text-[12px] font-black uppercase tracking-wider text-emerald-800">
                            {isEn ? 'Tankroom Compatibility' : '缸内配伍与混养建议'}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenCalculator}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 hover:underline"
                        >
                          <Calculator className="h-3.5 w-3.5" />
                          {inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.compatibilityCalc')}
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <div className="rounded-[14px] border border-emerald-100 bg-emerald-50/40 p-3 text-[11px]">
                          <div className="font-bold text-emerald-900">
                            {isEn ? '✓ Safe Roommates' : '✓ 适宜配伍室友'}
                          </div>
                          <p className="mt-1 leading-relaxed text-slate-700">
                            {isEn ? 'Compatible with peaceful species of similar size, bottom dwellers, and gentle schooling fish.' : '适合与体型相当、性格温和的中下层鱼类、鼠鱼及清道夫等底栖生物和平共处。'}
                          </p>
                        </div>
                        <div className="rounded-[14px] border border-amber-100 bg-amber-50/40 p-3 text-[11px]">
                          <div className="font-bold text-amber-950">
                            {isEn ? '⚠️ Watch for Fin-nippers' : '⚠️ 规避与注意事项'}
                          </div>
                          <p className="mt-1 leading-relaxed text-slate-700">
                            {effectiveHousing?.advice || (isEn ? 'Avoid aggressive fin-nippers, predatory fish, and tiny ornamental shrimp that might be eaten.' : '切勿与虎皮鱼等爱咬鳍的强攻击性品种混养；避免微型米虾以免被误食。')}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* ========================================================
                      LEVEL 4: 变体滑动器与深度科学审核折叠 (Variants & Deep Evidence)
                      ======================================================== */}
                  {speciesGroup && speciesGroupVariants.length > 1 && onSelectSpecies && (
                    <section className="species-detail-card mt-3.5 p-3 min-[760px]:p-4 bg-slate-50/70 border border-slate-200/80" aria-label={isEn ? `Other ${speciesGroup.groupName} variants` : `${speciesGroup.groupName}的其他类型`}>
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectAdjacentSpecies(-1)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                          aria-label={isEn ? 'Previous variant' : '上一个类型'}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="app-scrollbar-hidden flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
                          {speciesGroupVariants.map((variant, index) => {
                            const active = variant.id === fish.id;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                aria-current={active ? 'true' : undefined}
                                onClick={() => !active && onSelectSpecies(variant)}
                                className={`flex min-w-[120px] flex-1 items-center gap-2 rounded-[14px] border px-2.5 py-1.5 text-left transition ${
                                  active
                                    ? 'border-emerald-700 bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-700'
                                    : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white'
                                }`}
                              >
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${getSpeciesImageSurfaceClass(variant)}`}>
                                  <ResilientImage src={getSpeciesDisplayImage(variant)} alt="" className={`h-full w-full object-contain p-0.5 ${getSpeciesImageClass(variant)}`} />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-[11px] font-black">{getVariantLabel(variant, speciesGroup)}</span>
                                  <span className="mt-0.5 block text-[9px] font-bold text-slate-400">{index + 1} / {speciesGroupVariants.length}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => selectAdjacentSpecies(1)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                          aria-label={isEn ? 'Next variant' : '下一个类型'}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Secondary Expandable Evidence Section */}
                  <div className="mt-3.5 space-y-2" data-species-detail-sections>
                    {/* Why? Detailed Tank Diagnostic Checklist */}
                    <section className="species-detail-card overflow-hidden">
                      <button
                        type="button"
                        data-disclosure-purpose="secondary_evidence"
                        aria-expanded={expandedSection === 'fit'}
                        onClick={() => setExpandedSection(current => current === 'fit' ? null : 'fit')}
                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="min-w-0">
                          <span className="block text-[13px] font-black text-slate-900">{isEn ? 'Why this verdict? (Detailed Diagnostic)' : '为什么得出该结论？(逐项诊断证据)'}</span>
                          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                            {aquariumContext
                              ? (() => { const count = metricCards.filter(item => item.status !== 'ok').length; return count === 0 ? (isEn ? 'All vital conditions pass' : '当前各项生存条件均良好匹配') : (isEn ? `${count} conditions require adjustment` : `${count} 项条件需关注或调整`); })()
                              : t('encyclopedia.noTankSelected')}
                          </span>
                        </span>
                        <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandedSection === 'fit' ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSection === 'fit' && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                          <div className="grid grid-cols-2 gap-2 min-[760px]:grid-cols-3">
                            {metricCards.map(metric => {
                              const settingsPanel = getMetricSettingsPanel(metric);
                              const canOpenSettings = metric.status !== 'ok' && Boolean(settingsPanel && onOpenTankSettings);
                              const content = (
                                <>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="min-w-0 break-words text-[11px] font-black text-slate-900">{translateLabel(metric.label)}</span>
                                    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${getFitStatusClass(metric.status)}`}>{getFitStatusLabel(metric.status, isEn)}</span>
                                  </div>
                                  <p className={`mt-1.5 break-words text-[11px] font-bold leading-relaxed ${getFitCurrentClass(metric.status)}`}>{metric.current || t('encyclopedia.noTankSelected')}</p>
                                  {metric.status !== 'ok' && <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">{metric.advice || metric.requirement}</p>}
                                </>
                              );
                              return canOpenSettings ? (
                                <button
                                  key={metric.type}
                                  type="button"
                                  data-species-fit-metric={`fit-${metric.type}`}
                                  onClick={() => settingsPanel && onOpenTankSettings?.(settingsPanel)}
                                  className="min-w-0 rounded-[12px] border border-slate-200 bg-white p-2.5 text-left shadow-xs outline-none ring-emerald-700/20 transition hover:bg-emerald-50 focus-visible:ring-2"
                                  aria-label={isEn ? `Adjust ${translateLabel(metric.label)} in tank settings` : `前往鱼缸设置调整${translateLabel(metric.label)}`}
                                >
                                  {content}
                                </button>
                              ) : (
                                <div key={metric.type} data-species-fit-metric={`fit-${metric.type}`} className="min-w-0 rounded-[12px] border border-slate-200 bg-white p-2.5 shadow-xs">
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Compatibility Relationships */}
                    <section className="species-detail-card overflow-hidden">
                      <button
                        type="button"
                        data-disclosure-purpose="secondary_evidence"
                        aria-expanded={expandedSection === 'compatibility'}
                        onClick={() => setExpandedSection(current => current === 'compatibility' ? null : 'compatibility')}
                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="min-w-0">
                          <span className="block text-[13px] font-black text-slate-900">{isEn ? 'Tankmate Compatibility Matrix' : '缸内生物混养矩阵'}</span>
                          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                            {compatibilityPairs.length > 0
                              ? (isEn ? `${compatibilityPairs.length} tank relationships evaluated` : `已评估缸内现有 ${compatibilityPairs.length} 组配伍关系`)
                              : t('encyclopedia.conclusionNoPairs')}
                          </span>
                        </span>
                        <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandedSection === 'compatibility' ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSection === 'compatibility' && (
                        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 p-3">
                          {!aquariumContext || compatibilityVisualModel?.presentationMode === 'unavailable' ? (
                            <div className="rounded-[14px] border border-sky-200 bg-sky-50/70 p-3" data-visual-result-presentation="unavailable">
                              <div className="text-[12px] font-black text-ink">{isEn ? 'Compatibility Matrix Pending' : '暂未开放这组混养建议'}</div>
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">{isEn ? 'Review species care first, then use the compatibility calculator when you want to evaluate a planned combination.' : '先查看物种养护；需要评估计划组合时，再使用下方混养计算器。'}</p>
                            </div>
                          ) : compatibilityVisualModel && <VisualResultCard model={compatibilityVisualModel} showPrimaryAction={false} onPrimaryAction={handleOpenCalculator} />}
                          <button type="button" data-action-id="species.open-compatibility" onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-800/30 bg-emerald-800/10 px-4 text-[12px] font-black text-emerald-800 transition hover:bg-emerald-800/15">
                            <Calculator className="h-4 w-4" />
                            {inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.compatibilityCalc')}
                          </button>
                        </div>
                      )}
                    </section>

                    {/* Reviewed Sex ID Guide */}
                    {sexIdentificationGuide && (
                      <details data-disclosure-purpose="secondary_evidence" className="species-detail-card p-3 bg-slate-50/50">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-slate-900">
                          <span>{sexIdentificationGuide.title === '暂无可靠的公母辨别资料' ? t('encyclopedia.sexTitlePlaceholder') : sexIdentificationGuide.title}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </summary>
                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-600">
                          {sexIdentificationGuide.summary === '当前图鉴没有经过人工审核的公母辨别字段，系统不会仅凭名称或品类猜测公母。' ? t('encyclopedia.sexSummaryPlaceholder') : sexIdentificationGuide.summary}
                        </p>
                        {sexIdentificationSources.length > 0 && (
                          <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isEn ? 'Reviewed sources' : '审核来源'}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {sexIdentificationSources.map(sourceItem => (
                                <a key={sourceItem.id} href={sourceItem.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-emerald-800 hover:underline">
                                  {sourceItem.publisher}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </details>
                    )}

                    {/* Reviewed Environmental Conditions */}
                    {environmentKnowledge && (
                      <details data-disclosure-purpose="secondary_evidence" data-species-knowledge="environment" className="species-detail-card p-3 bg-slate-50/50">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-slate-900">
                          <span>{isEn ? 'Reviewed water conditions' : '已审核水质环境标准'}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </summary>
                        <div className="mt-2 grid gap-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                          <div className="grid grid-cols-2 gap-1.5 rounded-[10px] bg-white p-2 border border-slate-200">
                            {environmentKnowledge.temperatureRangeC ? <p><strong className="text-slate-900">{isEn ? 'Temperature: ' : '水温：'}</strong>{environmentKnowledge.temperatureRangeC.min}–{environmentKnowledge.temperatureRangeC.max}°C</p> : null}
                            {environmentKnowledge.phRange ? <p><strong className="text-slate-900">pH: </strong>{environmentKnowledge.phRange.min}–{environmentKnowledge.phRange.max}</p> : null}
                            {environmentKnowledge.hardnessDgh ? <p><strong className="text-slate-900">{isEn ? 'Hardness: ' : '硬度：'}</strong>{environmentKnowledge.hardnessDgh.min}–{environmentKnowledge.hardnessDgh.max} dGH</p> : null}
                          </div>
                          {environmentKnowledge.notes?.length ? <p>{environmentKnowledge.notes.join('；')}</p> : null}
                        </div>
                        {environmentSources.length > 0 && (
                          <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isEn ? 'Reviewed sources' : '审核来源'}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {environmentSources.map(sourceItem => <a key={sourceItem.id} href={sourceItem.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-emerald-800 hover:underline">{sourceItem.publisher}</a>)}
                            </div>
                          </div>
                        )}
                      </details>
                    )}

                    {/* Reviewed Space & Growth */}
                    {spaceKnowledge && (
                      <details data-disclosure-purpose="secondary_evidence" data-species-knowledge="space" className="species-detail-card p-3 bg-slate-50/50">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-slate-900">
                          <span>{isEn ? 'Adult size & space growth' : '成体规格与生长空间'}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </summary>
                        <div className="mt-2 grid gap-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                          <div className="grid grid-cols-2 gap-1.5 rounded-[10px] bg-white p-2 border border-slate-200">
                            {spaceKnowledge.adultLengthCm?.max != null ? <p><strong className="text-slate-900">{isEn ? 'Adult size: ' : '成体体长：'}</strong>{spaceKnowledge.adultLengthCm.max} cm</p> : null}
                            {spaceKnowledge.minVolumeLiters != null ? <p><strong className="text-slate-900">{isEn ? 'Min volume: ' : '参考水体：'}</strong>≥{spaceKnowledge.minVolumeLiters}L</p> : null}
                            {spaceKnowledge.minTankLengthCm != null ? <p><strong className="text-slate-900">{isEn ? 'Tank length: ' : '参考缸长：'}</strong>≥{spaceKnowledge.minTankLengthCm}cm</p> : null}
                          </div>
                          {spaceKnowledge.spaceNotes?.length ? <p>{spaceKnowledge.spaceNotes.join('；')}</p> : null}
                        </div>
                        {spaceSources.length > 0 && (
                          <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isEn ? 'Reviewed sources' : '审核来源'}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {spaceSources.map(sourceItem => <a key={sourceItem.id} href={sourceItem.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-emerald-800 hover:underline">{sourceItem.publisher}</a>)}
                            </div>
                          </div>
                        )}
                      </details>
                    )}

                    {/* Reproduction Knowledge */}
                    {reproductionKnowledge && (
                      <details data-disclosure-purpose="secondary_evidence" className="species-detail-card p-3 bg-slate-50/50">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-slate-900">
                          <span>{isEn ? 'Reproduction & Breeding' : '繁殖与幼鱼照护'}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </summary>
                        <div className="mt-2 grid gap-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                          <p><strong className="text-slate-900">{reproductionKnowledge.plainLanguageLabel}</strong> · {reproductionKnowledge.summary}</p>
                          {reproductionKnowledge.gestationOrIncubation?.label && (
                            <p className="rounded-[10px] bg-white p-2 border border-slate-200"><strong className="text-slate-900">{isEn ? 'Timing: ' : '孵化/繁殖周期：'}</strong>{reproductionKnowledge.gestationOrIncubation.label}</p>
                          )}
                          {reproductionKnowledge.fryCare?.length ? (
                            <p><strong className="text-slate-900">{isEn ? 'Fry care: ' : '幼鱼照护：'}</strong>{reproductionKnowledge.fryCare.join('；')}</p>
                          ) : null}
                        </div>
                        {reproductionSources.length > 0 && (
                          <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isEn ? 'Reviewed sources' : '审核来源'}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {reproductionSources.map(sourceItem => <a key={sourceItem.id} href={sourceItem.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-emerald-800 hover:underline">{sourceItem.publisher}</a>)}
                            </div>
                          </div>
                        )}
                      </details>
                    )}

                    {/* Social & Group Knowledge */}
                    {socialKnowledge && (
                      <details data-disclosure-purpose="secondary_evidence" data-species-knowledge="social" className="species-detail-card p-3 bg-slate-50/50">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-slate-900">
                          <span>{isEn ? 'Social & Group Needs' : '群体与社群习性'}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </summary>
                        <div className="mt-2 grid gap-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                          <p>{socialKnowledge.summary}</p>
                          {socialKnowledge.minimumGroupSize && (
                            <p className="rounded-[10px] bg-white p-2 border border-slate-200">
                              <strong className="text-slate-900">{isEn ? 'Minimum group: ' : '建议最低成群：'}</strong>{socialKnowledge.minimumGroupSize} {isEn ? 'individuals' : '尾'}
                            </p>
                          )}
                        </div>
                        {socialSources.length > 0 && (
                          <div className="mt-2.5 border-t border-slate-200/80 pt-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isEn ? 'Reviewed sources' : '审核来源'}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {socialSources.map(sourceItem => <a key={sourceItem.id} href={sourceItem.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-emerald-800 hover:underline">{sourceItem.publisher}</a>)}
                            </div>
                          </div>
                        )}
                      </details>
                    )}
                  </div>

                  {/* Inline Feedback Banner */}
                  {(detailFeedback || inlineFeedback) && (
                    <div className="mt-3.5 rounded-[14px] border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12px] font-bold text-emerald-900 shadow-xs">
                      {detailFeedback || inlineFeedback}
                      {detailFeedback && onGoCalculator && (
                        <button type="button" className="ml-2.5 rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[10px] font-black text-emerald-800" onClick={onGoCalculator}>
                          {t('encyclopedia.goToCalcBtn')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================
                  LEVEL 5: 底部常驻悬浮行动坞 (Docked Action Bar)
                  ======================================================== */}
              <div className="modalFooter shrink-0 border-t border-slate-100 bg-white/95 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl min-[760px]:px-6">
                <div className="flex flex-col gap-2 w-full">
                  {/* Primary CTA Action - Full width, dominant, never squished */}
                  <Button
                    data-action-id={(displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') ? 'species.view-tank-risk' : 'species.primary-action'}
                    className="min-h-11 w-full rounded-full bg-emerald-800 hover:bg-emerald-900 px-5 text-sm font-black text-white shadow-sm transition"
                    onClick={handleMainAction}
                  >
                    {mainActionLabel}
                  </Button>

                  {/* Secondary Actions (Wishlist & Memorial) - 1 or 2 equal-width columns */}
                  <div className={`grid gap-2 w-full ${onRecordDeath ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(fish.id)}
                      aria-pressed={inWishlist}
                      className={`flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border px-3 text-[11px] font-black transition ${
                        inWishlist
                          ? 'border-rose-200 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      {inWishlist ? <Heart className="h-4 w-4 fill-current text-rose-600" /> : <HeartOff className="h-4 w-4" />}
                      {inWishlist ? t('encyclopedia.inWishlistBtn') : t('encyclopedia.addToWishlistBtn')}
                    </button>

                    {onRecordDeath && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeathBatchId('');
                          setDeathOperationId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
                          setIsDeathFormOpen(true);
                        }}
                        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-700 shadow-xs transition hover:border-slate-900 hover:text-slate-900"
                      >
                        <Skull className="h-4 w-4 text-slate-400" />
                        {isEn ? 'Record Exit / Memorial' : '生命纪念'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isDeathFormOpen && (
                <div className="absolute inset-0 z-[180] flex flex-col overflow-y-auto bg-[#f7faf8]" aria-labelledby="death-record-title">
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur min-[760px]:px-6">
                    <button type="button" disabled={isRecordingDeath} onClick={() => setIsDeathFormOpen(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" />{isEn ? 'Back' : '返回详情'}</button>
                    <span className="text-xs font-black text-ink/40">{isEn ? 'Memorial record' : '生命纪念'}</span>
                  </div>
                  <div className="mx-auto w-full max-w-[640px] flex-1 p-4 min-[760px]:p-6">
                    <h3 id="death-record-title" className="text-[18px] font-black text-ink">{t('encyclopedia.recordMemorialTitle')}</h3>
                    <p className="mt-1 text-[12px] font-medium leading-relaxed text-ink/58">{t('encyclopedia.memorialSubtitle')}</p>
                    <div className="mt-5 grid gap-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                      <QuickDatePicker value={deathDate} onChange={setDeathDate} disabled={isRecordingDeath} isEn={isEn} />
                      <MemorialCauseSelector value={deathCauseCodes} onChange={(value) => { setDeathCauseCodes(value); setDeathError(''); }} disabled={isRecordingDeath} isEn={isEn} />
                      {(deathCauseCodes.includes('other') || Boolean(deathReason)) && <label className="grid gap-2 text-[12px] font-black text-ink" htmlFor="death-reason">{isEn ? 'Custom note' : '补充自定义原因'}<textarea ref={deathReasonRef} id="death-reason" value={deathReason} onChange={event => setDeathReason(event.target.value)} disabled={isRecordingDeath} rows={3} placeholder={isEn ? 'Use your own words when none of the options fit' : '没有合适选项时，用自己的话补充'} className="w-full resize-y rounded-[14px] border border-border bg-white p-3 text-[14px] font-medium leading-relaxed text-ink outline-none focus:border-accent" /></label>}
                      {deathBatches.length > 1 && <fieldset className="grid gap-2"><legend className="text-[12px] font-black text-ink">{t('livestock.memorialBatch')}</legend><div className="grid gap-2 sm:grid-cols-2">{deathBatches.map((batch, index) => { const selected = (deathBatchId || deathBatches[0]?.id) === batch.id; return <button type="button" key={batch.id} aria-pressed={selected} disabled={isRecordingDeath} onClick={() => setDeathBatchId(batch.id)} className={`min-h-11 rounded-2xl border px-3 text-left text-xs font-black ${selected ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-ink/60'}`}>{t('livestock.groupOption', { index: index + 1, count: batch.quantity })}</button>; })}</div></fieldset>}
                    </div>
                    {deathError && <p className="mt-2 rounded-[12px] bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700" role="alert">{deathError}</p>}
                    <div className="sticky bottom-3 mt-5 grid grid-cols-2 gap-2 rounded-[18px] border border-white/80 bg-white/95 p-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                      <Button variant="outline" className="h-11 rounded-full border-border text-sm font-black" disabled={isRecordingDeath} onClick={() => setIsDeathFormOpen(false)}>{t('encyclopedia.btnCancel')}</Button>
                      <Button className="h-11 rounded-full bg-ink text-sm font-black text-white hover:bg-ink/90" disabled={isRecordingDeath} onClick={handleRecordDeath}>{isRecordingDeath ? t('encyclopedia.btnSaving') : t('encyclopedia.btnSave')}</Button>
                    </div>
                  </div>
                </div>
              )}

                    </div>
  ) : null;

  return (
    <>
      {mode === 'panel' ? (
        open && detailContent
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <AdaptiveDetailContent showCloseButton={false} finalFocus={finalFocusElement ? () => finalFocusElement : undefined}>
            {detailContent}
          </AdaptiveDetailContent>
        </Dialog>
      )}

      {isPreviewOpen && (
        <Suspense fallback={null}>
          <ImagePreviewModal images={previewImages} index={previewIndex} open onClose={() => setIsPreviewOpen(false)} onIndexChange={setPreviewIndex} />
        </Suspense>
      )}
    </>
  );
}
