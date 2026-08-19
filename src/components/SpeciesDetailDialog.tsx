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
import { evaluateCompatibilityDecision } from '../modules/knowledge/compatibilityKnowledge';
import { buildSpeciesCarePresentation } from '../modules/knowledge/speciesCarePresentation';
import type { PairCompatibilityResult } from '../modules/knowledge/knowledge.types';
import type { PreviewImage } from './common/ImagePreviewModal';
import { AdaptiveDetailContent } from './common/AdaptiveDetailContent';
import { SurfaceHeader } from './common/SurfaceHeader';
import { ResilientImage } from './common/ResilientImage';
import { VisualResultCard } from './visual-results/VisualResultCard';
import { getVisualEmphasis, mapFitStatus } from './visual-results/visual-result.adapters';
import type { VisualResultViewModel } from './visual-results/visual-result.types';
import { markSpeciesViewed } from '../services/onboarding/onboarding.service';
import { normalizeSpeciesBatches } from '../services/aquarium/species-batches.service';
import { deriveSpeciesGroups, findGroupForSpecies, getVariantLabel } from '../lib/speciesGrouping';
import { QuickDatePicker } from './forms/QuickDatePicker';
import { MemorialCauseSelector } from './memorial/MemorialCauseSelector';

const ImagePreviewModal = lazy(() => import('./common/ImagePreviewModal').then(module => ({ default: module.ImagePreviewModal })));
const Interactive3DFishWrapper = lazy(() => import('./Interactive3DFishWrapper'));

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

const getMinimumTankLiters = (fish: Fish) => {
  const match = fish.tankSize.match(/(\d+)/);
  return match ? Number(match[1]) : null;
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
  return isEn ? 'Limited Data' : '信息不足';
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

const getSexIdentificationGuide = (fish: Fish) => {
  return buildSpeciesKnowledgeProfile(fish).knowledge.sexIdentification;
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
      current: phRange ? t('encyclopedia.phMatch') : t('encyclopedia.fitInsufficient'),
      requirement: phRange ? fish.phLevel : t('encyclopedia.fitInsufficient'),
      status: 'info',
      advice: phRange ? t('encyclopedia.phMatch') : t('encyclopedia.phWarning', { range: fish.phLevel, current: 'pH' }),
    },
  ];

  const spaceFit: FitDimension[] = [
    {
      type: 'space',
      label: isEn ? "Tank Size" : "缸体大小",
      current: tankLiters ? `~${tankLiters}L` : t('encyclopedia.noTankSelected'),
      requirement: fish.tankSize,
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

  const compatibilityFit: FitDimension[] = isEmptyTank ? [] : [{
    type: alreadyInTank ? 'livestock_status' : 'compatibility',
    label: isEn ? "Compatibility" : "混养",
    current: alreadyInTank ? t('encyclopedia.inTankAlready') : t('encyclopedia.livestockCount', { count: existingLivestock.length }),
    requirement: fish.housingMode ? translateTag(fish.housingMode, t) : t('encyclopedia.fitCaution'),
    status: alreadyInTank ? 'ok' : fish.housingMode === '建议单养' ? 'danger' : fish.housingMode === '谨慎混养' ? 'warning' : 'ok',
    advice: alreadyInTank ? t('encyclopedia.adviceLivestockInTank') : fish.housingReason || t('encyclopedia.adviceHousingDefault'),
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

export function SpeciesDetailDialog({
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

  const sexIdentificationGuide = useMemo(() => fish ? getSexIdentificationGuide(fish) : null, [fish]);
  const carePresentation = useMemo(() => fish ? buildSpeciesCarePresentation(fish) : null, [fish]);
  const compatibilityPairs = useMemo(() => {
    if (!fish || !aquariumContext) return [];
    const selectedQuantity = aquariumContext.fishes.find(item => item.fishId === fish.id)?.quantity || 1;
    return getExistingLivestock(aquariumContext)
      .filter(item => item.fish.id !== fish.id)
      .map(item => evaluateCompatibilityDecision({
        tank: aquariumContext,
        items: [
          { species: fish, quantity: selectedQuantity, origin: aquariumContext.fishes.some(record => record.fishId === fish.id) ? 'existing' : 'candidate' },
          { species: item.fish, quantity: item.aqFish.quantity, origin: 'existing' },
        ],
      }).pairResults[0])
      .filter((pair): pair is PairCompatibilityResult => Boolean(pair));
  }, [fish, aquariumContext]);

  const mainActionLabel = useMemo(() => {
    if (!displayFit || !aquariumContext) return t('encyclopedia.btnGoSetTank');
    if (owned || displayFit.alreadyInTank || displayFit.status === 'alreadyInTank') {
      return source === 'aquarium' ? t('encyclopedia.viewCareEssentials') : t('aquarium.tankContentsTitle');
    }
    if (displayFit.status === 'suitable') return t('encyclopedia.btnJoinTank');
    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      return t('encyclopedia.goToCalcBtn');
    }
    return t('encyclopedia.btnCompleteSetup');
  }, [aquariumContext, displayFit, inCalculator, owned, source, t]);
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
    if (!fish) return null;
    const statusRank = { compatible: 0, caution: 1, insufficient_data: 2, not_recommended: 3 } as const;
    const status = compatibilityPairs.length === 0
      ? 'insufficient_data'
      : compatibilityPairs.reduce<PairCompatibilityResult['status']>((current, pair) => (
        statusRank[pair.status] > statusRank[current] ? pair.status : current
      ), 'compatible');
    const primaryPair = [...compatibilityPairs].sort((a, b) => statusRank[b.status] - statusRank[a.status])[0];
    const conclusion = primaryPair?.primaryReason?.evidence || primaryPair?.rawResult.summary || t('encyclopedia.conclusionNoPairs');
    return {
      status,
      title: t('encyclopedia.compatibilityCalc'),
      conclusion,
      emphasis: getVisualEmphasis(conclusion),
      subjects: [{
        id: fish.id,
        name: fish.name,
        image: getSpeciesDisplayImage(fish),
        role: 'focus',
        status,
        shortReason: conclusion,
        badgeLabel: t('encyclopedia.currentSpec'),
      }, ...compatibilityPairs.map(pair => {
        const other = pair.speciesA.id === fish.id ? pair.speciesB : pair.speciesA;
        const reason = pair.primaryReason?.evidence || pair.rawResult.summary;
        return {
          id: other.id,
          name: other.name,
          image: getSpeciesDisplayImage(other),
          role: 'related' as const,
          status: pair.status,
          shortReason: reason,
          badgeLabel: pair.primaryReason?.title || (pair.status === 'compatible' ? t('encyclopedia.housingBehaviorMatch') : pair.status === 'caution' ? t('encyclopedia.fitCaution') : pair.status === 'not_recommended' ? t('encyclopedia.fitNotRecommended') : t('encyclopedia.fitInsufficient')),
          emphasis: getVisualEmphasis(reason),
        };
      })],
      currentAction: primaryPair?.actions[0] || t('encyclopedia.actionNoPairs'),
      primaryAction: { label: t('encyclopedia.compatibilityCalc'), actionType: 'route' },
      detailSections: compatibilityPairs.map(pair => {
        const other = pair.speciesA.id === fish.id ? pair.speciesB : pair.speciesA;
        return {
          id: pair.pairId,
          title: t('encyclopedia.withSpecies', { name: other.name }),
          items: [pair.primaryReason?.evidence, ...pair.secondaryReasons.map(item => item.evidence)].filter((item): item is string => Boolean(item)),
        };
      }).filter(section => section.items.length > 0),
    };
  }, [compatibilityPairs, fish, t]);

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
    if ((displayFit.status === 'suitable') && onAddToTank && !owned && !displayFit.alreadyInTank) {
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
      onGoCalculator?.();
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <AdaptiveDetailContent desktopSize="wide" data-detail-kind="species" showCloseButton={false} finalFocus={finalFocusElement ? () => finalFocusElement : undefined}>
          {fish && displayFit && (
            <div className="flex min-h-0 flex-1 flex-col bg-white">
              <SurfaceHeader
                className="modalHeader species-detail-header"
                title={isEn ? 'Species profile' : '物种档案'}
                onClose={() => onOpenChange(false)}
                closeLabel={t('encyclopedia.dismiss')}
                actions={(
                  <>
                                    <button type="button" data-feature-building="sharing" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300" aria-label={t('encyclopedia.shareTextSuffix').trim()}>
                    <Share2 className="h-5 w-5" />
                  </button>
                  </>
                )}
              />

              <div className="modalBody species-detail-body app-scrollbar-hidden p-0">
                <div className="p-3 min-[760px]:p-5" data-species-detail-layout="single-screen-profile">
                  <section className="overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-white via-sky-50/45 to-emerald-50/55 shadow-sm">
                    <div className="grid min-w-0 grid-cols-1 min-[760px]:grid-cols-[minmax(280px,1.05fr)_minmax(0,0.95fr)]">
                      <div className="min-w-0 p-2 min-[760px]:p-4">
                      {fish.id === 'sp_0260' ? (
                        <Suspense fallback={<div className="flex h-[140px] items-center justify-center rounded-[18px] border border-border/70 bg-slate-50 text-[11px] text-slate-400 min-[760px]:h-[310px] min-[760px]:rounded-[20px]">{isEn ? 'Loading 3D...' : '3D 加载中...'}</div>}>
                          <Interactive3DFishWrapper
                            imageUrl={resolvedImageSrc}
                            className={`flex h-[140px] items-center justify-center overflow-hidden rounded-[18px] border border-border/70 min-[760px]:h-[310px] min-[760px]:rounded-[20px] ${getSpeciesImageSurfaceClass(fish)} p-0 shadow-sm`}
                          />
                        </Suspense>
                      ) : (
                        <button type="button" onClick={openPreview} data-species-detail-hero className={`relative flex h-[140px] w-full items-center justify-center rounded-[18px] border border-border/70 min-[760px]:h-[310px] min-[760px]:rounded-[20px] ${getSpeciesImageSurfaceClass(fish)} p-2 min-[760px]:p-3 shadow-sm`} aria-label={isEn ? `Enlarge image of ${fish.name}` : `放大查看${fish.name}图片`}>
                          <ResilientImage src={resolvedImageSrc} alt={fish.name} className={`h-[88%] w-[88%] object-contain ${getSpeciesImageClass(fish)}`} />
                          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-black text-white backdrop-blur-sm min-[760px]:bottom-3 min-[760px]:right-3 min-[760px]:px-2.5 min-[760px]:text-[10px]">{isEn ? 'View image' : '查看大图'}</span>
                        </button>
                      )}
                      </div>
                      <div className="flex min-w-0 flex-col p-3 min-[760px]:justify-center min-[760px]:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <DialogTitle className="break-words font-serif text-[21px] font-bold italic leading-tight text-ink min-[760px]:text-[30px]">{fish.name}</DialogTitle>
                            <DialogDescription className="mt-0.5 text-[11px] font-medium leading-tight text-ink/55 min-[760px]:mt-1 min-[760px]:text-[12px]">{fish.scientificName}</DialogDescription>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${getDifficultyBadgeClass(fish.difficulty)}`}>{fish.difficulty === 'Easy' ? t('encyclopedia.difficultyEasyShort') : fish.difficulty === 'Medium' ? t('encyclopedia.difficultyMediumShort') : t('encyclopedia.difficultyHardShort')}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1 min-[760px]:mt-3 min-[760px]:gap-1.5">
                          {[selectedTaxonomy?.variety, fish.housingMode, ...getToolFunctions(fish)].filter(Boolean).slice(0, 3).map(tag => {
                            const displayTag = translateTag(tag, t);
                            return <span key={tag} className="rounded-full border border-border bg-white px-2 py-1 text-[10px] font-bold text-ink/60">{displayTag}</span>;
                          })}
                        </div>
                        <p className="mt-3 hidden text-[12px] font-bold leading-relaxed text-ink/62 min-[760px]:block">{getLocalizedSpeciesRole(fish, t)}</p>

                        <section data-species-feeding-summary className="mt-2 rounded-[16px] border border-amber-100 bg-amber-50/72 p-2.5 min-[760px]:mt-3 min-[760px]:p-3" aria-labelledby="species-feeding-summary-title">
                          <div className="flex items-center justify-between gap-2">
                            <h3 id="species-feeding-summary-title" className="text-[11px] font-black text-amber-900">{isEn ? 'Feeding at a glance' : '喂养速览'}</h3>
                            {carePresentation && (
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black ${getCareSourceClass(carePresentation.sourceStatus)}`}>
                                {carePresentation.sourceStatus === 'pending' ? t('encyclopedia.fitInsufficient') : carePresentation.sourceStatus === 'verified' ? t('encyclopedia.fitStatusOkLabel') : t('encyclopedia.fitStatusMatchConfirm')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 break-words text-[11px] font-bold leading-4 text-ink/70">{fish.feedingProfile?.recommendedFoods || fish.diet}</p>
                          <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[10px] font-semibold leading-4 text-ink/58">
                            <div className="rounded-[10px] bg-white/80 px-2 py-1.5"><strong className="block text-ink/72">{isEn ? 'Frequency' : '频率'}</strong>{fish.feedingProfile?.feedingFrequency || (isEn ? 'Feed a small amount daily' : '每日少量投喂')}</div>
                            <div className="rounded-[10px] bg-white/80 px-2 py-1.5"><strong className="block text-ink/72">{isEn ? 'Portion' : '单次份量'}</strong>{fish.feedingProfile?.portionRule || (isEn ? 'Finish within a few minutes' : '以数分钟内吃完为准')}</div>
                          </div>
                          <p className="mt-1.5 break-words text-[10px] font-semibold leading-4 text-amber-950/62"><strong>{isEn ? 'Avoid: ' : '避免：'}</strong>{fish.feedingProfile?.avoidFoods || (isEn ? 'Overfeeding and uneaten food' : '过量投喂和长期残饵')}</p>
                        </section>

                        <div data-visual-result-status={mapFitStatus(displayFit.status)} className={`mt-2 rounded-[16px] border p-2.5 min-[760px]:mt-4 min-[760px]:rounded-[18px] min-[760px]:p-3 ${
                          displayFit.status === 'suitable' || displayFit.status === 'alreadyInTank'
                            ? 'border-emerald-100 bg-emerald-50/85'
                            : displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk'
                              ? 'border-red-100 bg-red-50/85'
                              : displayFit.status === 'unknown' || displayFit.status === 'needConfirmation'
                                ? 'border-sky-100 bg-sky-50/85'
                                : 'border-amber-100 bg-amber-50/85'
                        }`}>
                          <div className="flex items-start gap-2 min-[760px]:gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm min-[760px]:h-8 min-[760px]:w-8">
                              {displayFit.status === 'suitable' || displayFit.status === 'alreadyInTank' ? <CheckCircle2 className="h-4.5 w-4.5" /> : displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' ? <AlertTriangle className="h-4.5 w-4.5 text-red-600" /> : <Info className="h-4.5 w-4.5" />}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/42">{aquariumContext ? (isEn ? 'Fits my tank?' : '适合我的鱼缸吗？') : (isEn ? 'Tank not selected' : '尚未选择鱼缸')}</div>
                              <p className="mt-0.5 text-[15px] font-black leading-snug text-ink min-[760px]:mt-1 min-[760px]:text-[17px]">{displayFit.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-snug text-ink/64 min-[760px]:mt-1 min-[760px]:text-[12px] min-[760px]:leading-relaxed">{aquariumContext ? displayFit.conclusion : t('encyclopedia.conclusionNoTank')}</p>
                            </div>
                          </div>
                        </div>

                        {verdictReasons.length > 0 && (
                          <div className="mt-2 grid gap-1 min-[760px]:mt-3 min-[760px]:gap-1.5" aria-label={isEn ? 'Key reasons' : '关键原因'}>
                            {verdictReasons.map(reason => (
                              <div key={`${reason.label}-${reason.text}`} className="flex min-w-0 items-start gap-1.5 rounded-[10px] bg-white/75 px-2 py-1 text-[10px] leading-snug text-ink/62 min-[760px]:gap-2 min-[760px]:rounded-[12px] min-[760px]:px-3 min-[760px]:py-2 min-[760px]:text-[11px] min-[760px]:leading-relaxed">
                                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full min-[760px]:mt-1.5 min-[760px]:h-2 min-[760px]:w-2 ${reason.status === 'danger' ? 'bg-red-500' : reason.status === 'warning' ? 'bg-amber-500' : reason.status === 'ok' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                                <span className="min-w-0"><strong className="text-ink">{reason.label}</strong> · {reason.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2 min-[760px]:mt-3">
                          <button
                            type="button"
                            onClick={() => onToggleWishlist(fish.id)}
                            aria-pressed={inWishlist}
                            className={`flex min-h-10 items-center gap-2 rounded-full border px-3 text-[11px] font-black ${
                              inWishlist ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-border bg-white text-ink/60 hover:border-rose-200'
                            }`}
                          >
                            {inWishlist ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
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
                              className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-3 text-[11px] font-black text-ink/60 hover:border-ink/20"
                            >
                              <Skull className="h-4 w-4" />
                              {isEn ? 'Record exit / death' : '记录离缸 / 死亡'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section
                    ref={careSectionButtonRef}
                    tabIndex={-1}
                    data-species-environment-summary
                    className="mt-3 rounded-[18px] border border-border bg-white p-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    aria-labelledby="species-environment-summary-title"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 id="species-environment-summary-title" className="text-[13px] font-black text-ink">{isEn ? 'Environment at a glance' : '环境速览'}</h3>
                        <p className="mt-0.5 text-[10px] font-semibold text-ink/45">{isEn ? 'The essential conditions to keep stable' : '日常需要保持稳定的基础条件'}</p>
                      </div>
                      <Waves className="h-5 w-5 shrink-0 text-sky-600" />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 min-[760px]:grid-cols-4">
                      {[
                        { label: isEn ? 'Temperature' : '水温', value: fish.waterTemperature },
                        { label: isEn ? 'Water' : '水体', value: selectedTaxonomy?.waterType || fish.category },
                        { label: isEn ? 'Space' : '空间', value: fish.tankSize },
                        { label: isEn ? 'Water change' : '换水', value: t('encyclopedia.careWaterChangeValue', { days: fish.waterChangeCycle }) },
                      ].map(item => (
                        <div key={item.label} className="min-w-0 rounded-[13px] bg-bg p-2.5">
                          <div className="text-[9px] font-black text-ink/40">{item.label}</div>
                          <div className="mt-1 break-words text-[11px] font-black leading-4 text-ink/72">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    {fish.feedingProfile?.specialNotes && (
                      <p className="mt-2 rounded-[12px] bg-emerald-50 px-3 py-2 text-[10px] font-semibold leading-4 text-emerald-950/68">
                        <strong>{isEn ? 'Observe: ' : '观察：'}</strong>{fish.feedingProfile.specialNotes}
                      </p>
                    )}
                  </section>

                  {speciesGroup && speciesGroupVariants.length > 1 && onSelectSpecies && (
                    <section className="mt-3 rounded-[18px] border border-border bg-[#F8F7F2] p-2.5 min-[760px]:p-3" aria-label={isEn ? `Other ${speciesGroup.groupName} variants` : `${speciesGroup.groupName}的其他类型`}>
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectAdjacentSpecies(-1)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink/60 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          aria-label={isEn ? 'Previous variant' : '上一个类型'}
                        >
                          <ChevronLeft className="h-5 w-5" />
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
                                className={`flex min-w-[112px] flex-1 items-center gap-2 rounded-[14px] border px-2 py-1.5 text-left transition-colors ${
                                  active
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                    : 'border-transparent bg-white text-ink/58 hover:border-emerald-100'
                                }`}
                              >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[11px] ${getSpeciesImageSurfaceClass(variant)}`}>
                                  <ResilientImage src={getSpeciesDisplayImage(variant)} alt="" className={`h-full w-full object-contain p-1 ${getSpeciesImageClass(variant)}`} />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-[10px] font-black">{getVariantLabel(variant, speciesGroup)}</span>
                                  <span className="mt-0.5 block text-[9px] font-bold text-ink/38">{index + 1} / {speciesGroupVariants.length}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => selectAdjacentSpecies(1)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink/60 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          aria-label={isEn ? 'Next variant' : '下一个类型'}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </section>
                  )}

                  <div className="mt-4 grid gap-2" data-species-detail-sections>
                    <section className="overflow-hidden rounded-[18px] border border-border bg-white">
                      <button
                        type="button"
                        data-disclosure-purpose="secondary_evidence"
                        aria-expanded={expandedSection === 'fit'}
                        onClick={() => setExpandedSection(current => current === 'fit' ? null : 'fit')}
                        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14px] font-black text-ink">{isEn ? 'Why?' : '为什么？'}</span>
                          <span className="mt-0.5 block text-[11px] font-bold text-ink/45">
                            {aquariumContext
                              ? (() => { const count = metricCards.filter(item => item.status !== 'ok').length; return count === 0 ? (isEn ? 'No obvious issues' : '目前没有明显问题') : (isEn ? `${count} items need attention` : `${count} 项需要留意`); })()
                              : t('encyclopedia.noTankSelected')}
                          </span>
                        </span>
                        <ChevronRight className={`h-5 w-5 shrink-0 text-ink/35 transition-transform ${expandedSection === 'fit' ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSection === 'fit' && (
                        <div className="border-t border-border/70 p-3">
                          <div className="grid grid-cols-2 gap-2 min-[760px]:grid-cols-3">
                            {metricCards.map(metric => {
                              const settingsPanel = getMetricSettingsPanel(metric);
                              const canOpenSettings = metric.status !== 'ok' && Boolean(settingsPanel && onOpenTankSettings);
                              const content = (
                                <>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="min-w-0 break-words text-[11px] font-black text-ink">{translateLabel(metric.label)}</span>
                                    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${getFitStatusClass(metric.status)}`}>{getFitStatusLabel(metric.status, isEn)}</span>
                                  </div>
                                  <p className={`mt-2 break-words text-[11px] font-bold leading-relaxed ${getFitCurrentClass(metric.status)}`}>{metric.current || t('encyclopedia.noTankSelected')}</p>
                                  {metric.status !== 'ok' && <p className="mt-1 text-[10px] font-medium leading-relaxed text-ink/48">{metric.advice || metric.requirement}</p>}
                                </>
                              );
                              return canOpenSettings ? (
                                <button
                                  key={metric.type}
                                  type="button"
                                  data-species-fit-metric={`fit-${metric.type}`}
                                  onClick={() => settingsPanel && onOpenTankSettings?.(settingsPanel)}
                                  className="min-w-0 rounded-[14px] bg-bg p-3 text-left outline-none ring-accent/25 transition hover:bg-emerald-50 focus-visible:ring-2"
                                  aria-label={isEn ? `Adjust ${translateLabel(metric.label)} in tank settings` : `前往鱼缸设置调整${translateLabel(metric.label)}`}
                                >
                                  {content}
                                </button>
                              ) : (
                                <div key={metric.type} data-species-fit-metric={`fit-${metric.type}`} className="min-w-0 rounded-[14px] bg-bg p-3">
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="overflow-hidden rounded-[18px] border border-border bg-white">
                      <button
                        type="button"
                        data-disclosure-purpose="secondary_evidence"
                        aria-expanded={expandedSection === 'compatibility'}
                        onClick={() => setExpandedSection(current => current === 'compatibility' ? null : 'compatibility')}
                        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14px] font-black text-ink">{isEn ? 'Compatibility' : '混养关系'}</span>
                          <span className="mt-0.5 block text-[11px] font-bold text-ink/45">
                            {compatibilityPairs.length > 0
                              ? (isEn ? `${compatibilityPairs.length} tank relationships` : `已判断缸内 ${compatibilityPairs.length} 组关系`)
                              : t('encyclopedia.conclusionNoPairs')}
                          </span>
                        </span>
                        <ChevronRight className={`h-5 w-5 shrink-0 text-ink/35 transition-transform ${expandedSection === 'compatibility' ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSection === 'compatibility' && (
                        <div className="grid gap-3 border-t border-border/70 p-3">
                          {compatibilityVisualModel && <VisualResultCard model={compatibilityVisualModel} showPrimaryAction={false} onPrimaryAction={handleOpenCalculator} />}
                          {(fish.housingMode || fish.housingReason) && (
                            <div className="rounded-[14px] bg-bg p-3 text-[12px] font-medium leading-relaxed text-ink/60">
                              <div className="font-black text-ink">{fish.housingMode ? translateTag(fish.housingMode, t) : t('encyclopedia.adviceHousingDefault')}</div>
                              {fish.housingReason && <p className="mt-1">{fish.housingReason}</p>}
                            </div>
                          )}
                          {!['caution', 'unsuitable', 'conflictRisk'].includes(displayFit.status) && (
                            <button type="button" data-species-detail-compatibility-action="open-calculator" onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 text-[12px] font-black text-accent">
                              <Calculator className="h-4 w-4" />
                              {t('encyclopedia.goToCalcBtn')}
                            </button>
                          )}
                        </div>
                      )}
                    </section>

                    {sexIdentificationGuide && (
                      <details data-disclosure-purpose="secondary_evidence" className="rounded-[18px] border border-emerald-100 bg-emerald-50/55 p-3">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-black text-ink">
                          {sexIdentificationGuide.title === '暂无可靠的公母辨别资料' ? t('encyclopedia.sexTitlePlaceholder') : sexIdentificationGuide.title}
                          <ChevronRight className="h-4 w-4 text-ink/35" />
                        </summary>
                        <p className="mt-2 text-[11px] font-bold leading-relaxed text-ink/58">
                          {sexIdentificationGuide.summary === '当前图鉴没有经过人工审核的公母辨别字段，系统不会仅凭名称或品类猜测公母。' ? t('encyclopedia.sexSummaryPlaceholder') : sexIdentificationGuide.summary}
                        </p>
                      </details>
                    )}
                  </div>

                  {(detailFeedback || inlineFeedback) && (
                    <div className="mt-3 rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
                      {detailFeedback || inlineFeedback}
                      {detailFeedback && onGoCalculator && <button type="button" className="ml-2 rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700" onClick={onGoCalculator}>{t('encyclopedia.goToCalcBtn')}</button>}
                    </div>
                  )}
                </div>
              </div>

              <div className="modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6">
                <Button className="min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base" onClick={handleMainAction}>{mainActionLabel}</Button>
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
          )}
        </AdaptiveDetailContent>
      </Dialog>

      {isPreviewOpen && (
        <Suspense fallback={null}>
          <ImagePreviewModal images={previewImages} index={previewIndex} open onClose={() => setIsPreviewOpen(false)} onIndexChange={setPreviewIndex} />
        </Suspense>
      )}
    </>
  );
}
