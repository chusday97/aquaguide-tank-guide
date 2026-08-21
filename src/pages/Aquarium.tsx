import { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Aquarium, AquariumFish, Fish, type SpeciesAdditionIntent } from '../types';
import { fishData } from '../data/fishData';
import i18n from '../i18n';
import { getLocalizedAquariumName, englishTranslations } from '../i18n/localizeData';
import { autoTranslations } from '../i18n/localizeDataAuto';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInDays, addDays, isPast, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameDay } from 'date-fns';
import { Plus, Trash2, AlertTriangle, Edit2, Calendar, Droplets, Sparkles, Search, ChevronDown, ChevronLeft, ChevronRight, Settings, BookOpen, Info, Crown, Activity, HelpCircle, Skull, Heart, HeartOff, RefreshCw, X, Layers3, Maximize2, CheckCircle2, Download, MoreHorizontal, History, Loader2 } from 'lucide-react';
import { DeceasedRecord } from '../types';
import { useLayoutMode } from '../components/layout/LayoutModeProvider';
import {
  generateTankBuildCopilot,
  generateTankDailyCheckInterpretation,
  type TankBuildCopilotData,
  type TankDailyCheckInterpretationData,
} from '../lib/aiClient';
import { isAquaticPlantSpecies, isHardscapeSpecies } from '../lib/speciesClassification';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import { getLifeType, getToolFunctions, isSpeciesCompatibleWithWaterType } from '../modules/species/species.service';
import type { DiscoveryDeckState, RecommendationCandidate, RecommendationMode, SimulationResult, SmartRecommendationOutput } from '../modules/recommendation/recommendation.schema';
import { careTopicsData } from '../data/careTopicsData';
import { buildDiagnosisResult } from '../modules/diagnosis/diagnosis.rules';
import {
  diagnosisProblemTypes,
  getDiagnosisQuestions,
  getEstimatedQuestionCount,
  isDiagnosisProblemType,
} from '../modules/diagnosis/diagnosis.questionBank';
import type { DiagnosisAnswerMap, DiagnosisOutput, DiagnosisProblemType, DiagnosisQuestion, DiagnosisRecord, TankDailyCheckContext } from '../modules/diagnosis/diagnosis.types';
import {
  DISCOVERY_DAILY_LIMIT,
  DISCOVERY_STORAGE_KEY,
  normalizeDiscoveryState,
  recommendationService,
} from '../modules/recommendation/recommendation.service';
import { buildTankCopilotContext, getTankCopilotMissingInfo } from '../modules/copilot/tankBuildCopilot';
import { weatherService } from '../services/weather/weather.service';
import type { LocalWeatherOutput } from '../services/weather/weather.schema';
import {
  clearLocalAppState,
  exportLocalAppState,
  importLocalAppState,
  loadAppStateFromStorage,
  patchLocalAppState,
  saveAppStateToStorage,
  type LocalEventRecord,
} from '../services/storage/local-app-state';
import {
  StatusSummaryCard,
  type AquariumStatusLevel,
  type CarePlanSummaryViewModel,
  type DailyActionTask,
  type DailyActionViewModel,
} from '../components/product/StatusSummaryCard';
import type { TodayTaskStatus } from '../components/product/TodayTaskCard';
import { SectionHeader } from '../components/product/SectionHeader';
import { TagPill } from '../components/product/TagPill';
import { ConfigSection } from '../components/product/ConfigSection';
import { SelectableOptionCard } from '../components/product/SelectableOptionCard';
import { ConfigSummaryCard } from '../components/product/ConfigSummaryCard';
import { TemplatePlanCard } from '../components/product/TemplatePlanCard';
import { ActionCenterCard, type ActionCenterStatus } from '../components/product/ActionCenterCard';
import { QuickActionGrid } from '../components/product/QuickActionGrid';
import { ResilientImage } from '../components/common/ResilientImage';
import { AdaptiveTaskContent } from '../components/common/AdaptiveTaskContent';
import { SurfaceHeader } from '../components/common/SurfaceHeader';
import { SpeciesDetailDialog } from '../components/SpeciesDetailDialog';
import { OnboardingTaskCard } from '../components/onboarding/OnboardingTaskCard';
import { getOnboardingState, getOnboardingTaskProgress, getOnboardingTasks, markAquariumConfigured } from '../services/onboarding/onboarding.service';
import { LivestockRosterDialog } from '../components/aquarium/LivestockRosterDialog';
import { AquariumTimeline } from '../components/aquarium/AquariumTimeline';
import { VisualResultCard } from '../components/visual-results/VisualResultCard';
import { buildDiagnosisVisualResult } from '../components/visual-results/visual-result.adapters';
import {
  getTankCompatibilityAddPolicy,
  getTankCompatibilityStatusLabel,
} from '../lib/tankCompatibilityEngine';
import {
  reviewSpeciesAdditions,
  type SpeciesAdditionItem,
  type SpeciesAdditionReview,
} from '../services/aquarium/species-addition.service';
import { recordExistingLivestock, type RecordExistingResult } from '../services/aquarium/livestock-recording.service';
import { createAquariumDraft, getAquariumSetupStatus, normalizeAquariumRecord } from '../services/aquarium/aquarium-setup.service';
import { getSpeciesFavoriteIds, setSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';
import { useToast } from '../components/common/ToastProvider';
import { ExportArtifactDialog, type ExportArtifactContent } from '../components/export/ExportArtifactDialog';
import { AquariumExportCenter, type ExportCenterItem } from '../components/export/AquariumExportCenter';
import {
  buildAquariumArchiveArtifact,
  buildDiagnosisArtifact,
  buildHealthScoreArtifact,
  buildHundredDayArtifact,
  buildWeeklyCareArtifact,
  buildStarterChecklistArtifact,
  buildSanitizedAquariumReport,
  type AquariumArtifactContext,
} from '../services/export/aquarium-artifact.service';
import { createAquariumShareReport } from '../services/share/aquarium-share-report.service';
import { AquaGuideApiError } from '../services/api/api-client';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import type { WorkspaceNavigationContext } from '../types/navigation';
import { findDailyPatrolRecord, persistDiagnosisRecords, upsertDiagnosisRecord } from '../services/diagnosis/diagnosis-records.service';
import { isAquariumTaskAction, taskRoutes } from '../services/navigation/task-routes';
import { trackSessionEvent } from '../services/analytics/session-events.service';
import { getCompatibilitySelection, setCompatibilitySelection } from '../services/compatibility/compatibility-selection.service';
import { getAquaGuideRepository, getCurrentAquaGuideRepository, resolveRepositoryMode, subscribeToRepositoryMode } from '../services/repository/repository-provider';
import { persistAquariums } from '../services/aquarium/aquarium-state.service';
import { publishAquariumNavigation } from '../services/aquarium/aquarium-navigation.service';
import {
  getCareReminders,
  getCareReminderStatus,
  subscribeToCareActivity,
  type CareReminderRecord,
} from '../services/care/care-activity.service';
import { buildAquariumTimeline } from '../services/care/care-timeline.service';
import type { CareTimelineMutation, CareTimelineRecord } from '../services/repository/aquaguide.repository';
import {
  appendSpeciesBatch,
  createSpeciesBatch,
  getAquariumBatchCareSignal,
  getSpeciesBatchContextLabel,
  withNormalizedSpeciesBatches,
  type SpeciesBatchCareSignal,
} from '../services/aquarium/species-batches.service';

const ThreeAquarium = lazy(() => import('../components/ThreeAquarium').then(module => ({ default: module.ThreeAquarium })));


const getSpeciesNameLocalized = (species: any, isEn = false): string => {
  if (!species) return '';
  if (!isEn) return species.name || '';
  const id = species.id || '';
  if (autoTranslations[id]?.name) return autoTranslations[id].name;
  if (englishTranslations[id]?.name) return englishTranslations[id].name;
  if (species.scientificName) return species.scientificName;
  return species.name || '';
};

const getSubstrateLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'None' : '无';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '河沙': 'River Sand',
    '溪流砂': 'Stream Sand',
    '化妆砂': 'Cosmetic Sand',
    '水草泥': 'Aqua Soil',
    '黑金沙': 'Black Quartz Sand',
    '陶粒': 'Ceramsite Substrate',
    '碎石': 'Gravel Pebbles',
    '鹅卵石': 'Smooth Cobblestone',
    '珊瑚砂': 'Coral Sand',
    '无': 'None',
  };
  return map[val] || val;
};

const getFilterLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'None' : '无';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '瀑布过滤': 'Hang-on-Back Filter',
    '桶滤': 'Canister Filter',
    '上滤': 'Top Filter',
    '海绵过滤': 'Sponge Filter',
    '无': 'None',
  };
  return map[val] || val;
};

const getLightLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'None' : '无';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '普通灯': 'Standard LED Light',
    '水草灯': 'Planted Spectrum Light',
    '海水灯': 'Reef Coral Light',
    '无': 'None',
  };
  return map[val] || val;
};

const getTemperamentLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'Peaceful' : '温和';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '温和': 'Peaceful',
    '有领地意识': 'Territorial',
    '具攻击性': 'Aggressive',
    '谨慎': 'Cautious',
  };
  return map[val] || val;
};

const getHousingModeLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'Compatible' : '适合混养';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '适合混养': 'Compatible',
    '谨慎混养': 'Caution Mix',
    '建议单养': 'Single Specimen',
  };
  return map[val] || val;
};

const getCareLevelLocalized = (val: string | undefined, isEn = false): string => {
  if (!val) return isEn ? 'Easy' : '简单';
  if (!isEn) return val;
  const map: Record<string, string> = {
    '简单': 'Easy',
    '中等': 'Moderate',
    '困难': 'Advanced',
  };
  return map[val] || val;
};

function AquariumZoneHeader({ index, title, subtitle, titleId }: { index: number; title: string; subtitle: string; titleId: string }) {
  return (
    <header className="aquarium-zone-header">
      <span className="aquarium-zone-index" aria-hidden="true">{index}</span>
      <span className="min-w-0">
        <h2 id={titleId} className="block text-[14px] font-black leading-tight text-ink">{title}</h2>
        <span className="mt-0.5 block text-[10px] font-bold leading-4 text-ink/45">{subtitle}</span>
      </span>
    </header>
  );
}

function AquariumWorkspace({
  observeTitle,
  observeSubtitle,
  manageTitle,
  manageSubtitle,
  tank,
  status,
  actions,
}: {
  observeTitle: string;
  observeSubtitle: string;
  manageTitle: string;
  manageSubtitle: string;
  learnTitle?: string;
  learnSubtitle?: string;
  tank: ReactNode;
  status: ReactNode;
  archive?: ReactNode;
  actions: ReactNode;
  discovery?: ReactNode;
}) {
  const location = useLocation();

  useEffect(() => {
    const target = `${location.hash} ${location.search}`;
    const targetId = /manage|add-species|settings|livestock/i.test(target)
      ? 'aquarium-manage-zone'
      : /learn|care|discovery|recommend/i.test(target)
        ? 'aquarium-learn-zone'
        : '';
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (!element) return;
      element.classList.add('aquarium-zone-target');
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
      element.focus({ preventScroll: true });
      window.setTimeout(() => element.classList.remove('aquarium-zone-target'), 1200);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.search]);

  return (
    <section className="aquarium-workspace-zone aquarium-observe-zone aquarium-dashboard" aria-labelledby="aquarium-observe-title">
        <AquariumZoneHeader index={1} title={observeTitle} subtitle={observeSubtitle} titleId="aquarium-observe-title" />
        <div className="aquarium-dashboard-stage">
          <div className="aquarium-dashboard-tank">
            {tank}
            <aside className="aquarium-dashboard-rail" aria-label={observeTitle}>
              {status}
            </aside>
            <section id="aquarium-manage-zone" tabIndex={-1} className="aquarium-dashboard-actions" aria-labelledby="aquarium-manage-title">
              <AquariumZoneHeader index={2} title={manageTitle} subtitle={manageSubtitle} titleId="aquarium-manage-title" />
              {actions}
            </section>
          </div>
        </div>
    </section>
  );
}


const getSubstrateLabelLocalized = (value: string, isEn = false) => {
  if (!isEn) return value;
  const map: Record<string, string> = {
    '无': 'None (Bare Bottom)',
    '裸缸': 'Bare Bottom',
    '河沙': 'River Sand',
    '溪流砂': 'Creek Sand',
    '化妆砂': 'Cosmetic Sand',
    '水草泥': 'Aquarium Soil',
    '黑金沙': 'Black Quartz Sand',
    '陶粒': 'Ceramic Gravel',
    '碎石': 'Gravel',
    '鹅卵石': 'Stream Pebbles',
    '珊瑚砂': 'Coral Sand',
  };
  return map[value] || value;
};

const getSubstrateHintLocalized = (hint: string, isEn = false) => {
  if (!isEn) return hint;
  const map: Record<string, string> = {
    '方便清洁': 'Easy to clean',
    '自然浅色': 'Natural light color',
    '原生溪流': 'Natural river style',
    '明亮前景': 'Bright foreground',
    '草缸首选': 'Best for planted tanks',
    '显色强烈': 'Strong color contrast',
    '透气颗粒': 'Porous clay pebbles',
    '粗颗粒': 'Coarse texture',
    '溪流大石': 'Stream river stones',
    '海水/硬水': 'Marine / hard water',
  };
  return map[hint] || hint;
};

const getArchiveCategoryLocalized = (cat: string, isEn = false) => {
  if (!isEn) return cat;
  const map: Record<string, string> = {
    '全部': 'All',
    '鱼类': 'Fish',
    '虾螺': 'Shrimp & Snails',
    '水草': 'Plants',
    '底砂': 'Substrate',
    '造景': 'Hardscape',
    '设备': 'Equipment',
  };
  return map[cat] || cat;
};

const getEmptyArchiveMessageLocalized = (categoryKey: string, isEn = false) => {
  if (!isEn) {
    const map: Record<string, string> = {
      全部: '当前还没有配置鱼缸内容，可以先完善配置或套用搭建方案。',
      鱼类: '暂无鱼类。',
      虾螺: '暂无虾螺蟹。',
      水草: '暂无水草配置。',
      底砂: '暂无底砂配置。',
      造景: '暂无造景配置。',
    };
    return map[categoryKey] || '暂无内容。';
  }
  const mapEn: Record<string, string> = {
    全部: 'No tank content configured yet. Complete setup or apply a template plan.',
    鱼类: 'No fish added yet.',
    虾螺: 'No shrimp or snails added yet.',
    水草: 'No plants configured.',
    底砂: 'No substrate configured.',
    造景: 'No hardscape configured.',
  };
  return mapEn[categoryKey] || 'No items.';
};

const getRecommendationTagLocalized = (tag: string, isEn = false) => {
  if (!isEn) return tag;
  const map: Record<string, string> = {
    '新手友好': 'Beginner Friendly',
    '小型温和': 'Small & Peaceful',
    '后续好搭配': 'Easy Companion',
    '低维护绿意': 'Low Maintenance Greenery',
    '适合第一缸': 'Great First Tank',
    '维护压力低': 'Low Maintenance',
    '桌面缸友好': 'Desktop Friendly',
    '群游草景': 'Schooling Planted',
    '群游鱼效果好': 'Stunning Schooling',
    '观赏性强': 'High Visual Appeal',
    '草缸入门': 'Planted Tank Starter',
    '虾类观察': 'Shrimp Observation',
    '虾类友好': 'Shrimp Friendly',
    '适合观察': 'Great to Observe',
    '小缸稳定': 'Stable Small Tank',
    '暗色原生': 'Dark Biotope',
    '氛围感强': 'Immersive Atmosphere',
    '南美主题': 'South American Biotope',
    '状态展示': 'Prime Condition Display',
    '新手阴性草缸': 'Beginner Low-Tech Tank',
    '灯鱼草缸': 'Tetra Planted Tank',
    '虾缸': 'Dwarf Shrimp Tank',
    '南美黑水缸': 'South American Blackwater Tank',
  };
  return map[tag] || tag;
};

const substrateOptions = [
  { value: '无', label: '裸缸', labelEn: 'Bare Bottom', hint: '方便清洁', hintEn: 'Easy to clean' },
  { value: '河沙', label: '河沙', labelEn: 'River Sand', hint: '自然浅色', hintEn: 'Natural light color' },
  { value: '溪流砂', label: '溪流砂', labelEn: 'Creek Sand', hint: '原生溪流', hintEn: 'Natural river style' },
  { value: '化妆砂', label: '化妆砂', labelEn: 'Cosmetic Sand', hint: '明亮前景', hintEn: 'Bright foreground' },
  { value: '水草泥', label: '水草泥', labelEn: 'Aquarium Soil', hint: '草缸首选', hintEn: 'Best for planted tanks' },
  { value: '黑金沙', label: '黑金沙', labelEn: 'Black Quartz Sand', hint: '显色强烈', hintEn: 'Strong color contrast' },
  { value: '陶粒', label: '陶粒', labelEn: 'Ceramic Gravel', hint: '透气颗粒', hintEn: 'Porous clay pebbles' },
  { value: '碎石', label: '碎石', labelEn: 'Gravel', hint: '粗颗粒', hintEn: 'Coarse texture' },
  { value: '鹅卵石', label: '鹅卵石', labelEn: 'Pebbles', hint: '溪流大石', hintEn: 'Stream river stones' },
  { value: '珊瑚砂', label: '珊瑚砂', labelEn: 'Coral Sand', hint: '海水/硬水', hintEn: 'Marine / hard water' },
];

const plantOptions = fishData
  .filter(isAquaticPlantSpecies)
  .filter((plant, index, plants) => plants.findIndex(item => item.scientificName === plant.scientificName && item.name === plant.name) === index)
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

const hardscapeOptions = fishData
  .filter(isHardscapeSpecies)
  .filter((item, index, items) => items.findIndex(next => next.scientificName === item.scientificName && next.name === item.name) === index)
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

type AquariumSettingsPanel = 'size' | 'parameters' | 'substrate' | 'plants' | 'lighting' | 'equipment';

const speciesHealthDiagnosisTypes = new Set<DiagnosisProblemType>([
  '鱼只异常',
  '鱼浮头 / 呼吸急促',
  '拒食',
  '躲藏不动',
  '追咬打架',
  '新鱼入缸',
  '死亡处理',
  '死亡 / 异常死亡',
]);

const dimensionFields: Array<{ key: keyof NonNullable<Aquarium['dimensions']>; label: string }> = [
  { key: 'length', label: '长' },
  { key: 'width', label: '宽' },
  { key: 'height', label: '高' },
];

const getSettingsPanelForMissingInfo = (missingInfo: string[]): AquariumSettingsPanel => {
  const text = missingInfo.join(' ');
  if (/尺寸|容量|水量|长|宽|高/.test(text)) return 'size';
  if (/过滤|设备|加热/.test(text)) return 'equipment';
  if (/灯/.test(text)) return 'lighting';
  if (/水草|植物/.test(text)) return 'plants';
  if (/底砂|底床|硬景/.test(text)) return 'substrate';
  return 'parameters';
};

type TankBuildTemplate = {
  id: string;
  name: string;
  tagline: string;
  bestFor: string;
  difficulty: '新手' | '进阶';
  minVolumeLiters: number;
  recommendedVolumeLiters: number;
  minLengthCm: number;
  waterType: NonNullable<Aquarium['waterType']>;
  temperatureRange: [number, number];
  baseEquipment: string[];
  baseSubstrate: string;
  basePlants: string[];
  baseHardscape: string[];
  speciesRecommendations: Array<{
    name: string;
    role: 'schooling' | 'bottom' | 'shrimp' | 'snail' | 'centerpiece';
    minQuantity: number;
    recommendedQuantity: number;
  }>;
  visualLabel: string;
  visualGradient: string;
  benefitTags: string[];
  tankSize: string;
  temperature: string;
  substrate: string;
  plants: string[];
  hardscape: string[];
  equipment: string[];
  equipmentSettings: Aquarium['equipment'];
  livestock: string[];
  capacityGuidance: {
    recommendedLiters: string;
    maxLivestock: string;
    suitableTypes: string[];
    avoidTypes: string[];
  };
  stockedSpecies: { name: string; quantity: number }[];
  maintenance: string[];
  caution: string;
};

type AdaptedBuildPlan = {
  template: TankBuildTemplate;
  status: 'suitable' | 'caution' | 'unsuitable';
  statusLabel: string;
  statusTone: string;
  currentVolumeLiters: number;
  currentLengthCm: number;
  volumeRatio: number;
  summary: string;
  coreConfigSummary: string;
  livestockSummary: string;
  appliedSpecies: { name: string; quantity: number; role: TankBuildTemplate['speciesRecommendations'][number]['role']; fish?: Fish }[];
  riskItems: string[];
  autoFixes: string[];
  canApply: boolean;
  ctaLabel: string;
};

const findSpeciesValueByName = (name: string, matcher: (fish: Fish) => boolean) => {
  const species = fishData.find(fish => matcher(fish) && (fish.name === name || fish.name.includes(name) || name.includes(fish.name)));
  return species?.id || name;
};

const findStockSpeciesByName = (name: string) => {
  return fishData.find(fish => (
    !isAquaticPlantSpecies(fish)
    && !isHardscapeSpecies(fish)
    && (fish.name === name || fish.name.includes(name) || name.includes(fish.name))
  ));
};

const tankBuildTemplates: TankBuildTemplate[] = ([
  {
    id: 'beginner-low-tech',
    name: '新手阴性草缸',
    tagline: '低光、低 CO2 依赖，先把稳定养成习惯。',
    bestFor: '30-60cm 新手缸、办公室桌面缸',
    difficulty: '新手',
    minVolumeLiters: 30,
    recommendedVolumeLiters: 60,
    minLengthCm: 30,
    waterType: 'Freshwater',
    temperatureRange: [23, 26],
    baseEquipment: ['瀑布过滤或小桶滤', '普通灯/入门水草灯', '可选加热棒'],
    baseSubstrate: '水草泥',
    basePlants: ['小水榕', '铁皇冠', '黑木蕨', '三角莫斯'],
    baseHardscape: ['沉木 (流木)', '杜鹃根'],
    speciesRecommendations: [
      { name: '红绿灯', role: 'schooling', minQuantity: 8, recommendedQuantity: 10 },
      { name: '咖啡鼠', role: 'bottom', minQuantity: 3, recommendedQuantity: 4 },
      { name: '斑马螺', role: 'snail', minQuantity: 1, recommendedQuantity: 1 },
    ],
    visualLabel: '低维护绿意',
    visualGradient: 'linear-gradient(135deg,#DCEFE4 0%,#F7F3DF 52%,#B9D8C2 100%)',
    benefitTags: ['适合第一缸', '维护压力低', '桌面缸友好'],
    tankSize: '30L 起步，60cm 缸更稳定',
    temperature: '24',
    substrate: '水草泥',
    plants: ['小水榕', '铁皇冠', '黑木蕨', '三角莫斯'],
    hardscape: ['沉木 (流木)', '杜鹃根'],
    equipment: ['瀑布过滤或小桶滤', '普通灯/入门水草灯', '可选加热棒'],
    equipmentSettings: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
    livestock: ['红绿灯 8-12 条', '咖啡鼠 3-5 条', '斑马螺 1-2 只'],
    capacityGuidance: {
      recommendedLiters: '30-60L',
      maxLivestock: '小型群游鱼 8-12 条；底层鼠鱼 3-5 条；螺 1-2 只',
      suitableTypes: ['小型灯科鱼', '温和底栖鱼', '少量工具螺'],
      avoidTypes: ['大型鱼', '高排泄鱼', '强领地鱼'],
    },
    stockedSpecies: [{ name: '红绿灯', quantity: 10 }, { name: '咖啡鼠', quantity: 4 }, { name: '斑马螺', quantity: 1 }],
    maintenance: ['每周换水 20%-30%', '每周擦缸壁和修剪老叶', '每天开灯 6-7 小时，爆藻时先减光'],
    caution: '水榕、铁皇冠和黑木蕨不要把根茎埋进泥里，绑在沉木或石头上更稳。',
  },
  {
    id: 'tetra-planted',
    name: '灯鱼草缸',
    tagline: '用群游灯鱼做视觉中心，水草负责层次和安全感。',
    bestFor: '45-90cm 中小型观赏草缸',
    difficulty: '新手',
    minVolumeLiters: 45,
    recommendedVolumeLiters: 82,
    minLengthCm: 45,
    waterType: 'Freshwater',
    temperatureRange: [24, 26],
    baseEquipment: ['水草灯', '桶滤或强瀑布过滤', '可选 CO2', '加热棒'],
    baseSubstrate: '水草泥',
    basePlants: ['迷你矮珍珠', '牛毛毡', '宫廷草', '红宫廷'],
    baseHardscape: ['青龙石', 'ADA风格化妆砂'],
    speciesRecommendations: [
      { name: '宝莲灯', role: 'schooling', minQuantity: 10, recommendedQuantity: 16 },
      { name: '红鼻剪刀', role: 'schooling', minQuantity: 8, recommendedQuantity: 10 },
      { name: '咖啡鼠', role: 'bottom', minQuantity: 3, recommendedQuantity: 4 },
      { name: '黑壳虾', role: 'shrimp', minQuantity: 4, recommendedQuantity: 6 },
    ],
    visualLabel: '群游草景',
    visualGradient: 'linear-gradient(135deg,#CFE9F8 0%,#DFF4DB 48%,#A7D8C6 100%)',
    benefitTags: ['群游鱼效果好', '观赏性强', '草缸入门'],
    tankSize: '45L 起步，建议 60cm 以上',
    temperature: '25',
    substrate: '水草泥',
    plants: ['迷你矮珍珠', '牛毛毡', '宫廷草', '红宫廷'],
    hardscape: ['青龙石', 'ADA风格化妆砂'],
    equipment: ['水草灯', '桶滤或强瀑布过滤', '可选 CO2', '加热棒'],
    equipmentSettings: { filter: '桶滤', heater: true, oxygen: false, light: '水草灯' },
    livestock: ['宝莲灯 12-20 条', '红鼻剪刀/红绿灯 10-15 条', '咖啡鼠 4-6 条', '黑壳虾少量'],
    capacityGuidance: {
      recommendedLiters: '45-90L',
      maxLivestock: '小型群游鱼 18-28 条；底层鼠鱼 4-6 条；工具虾 5-10 只',
      suitableTypes: ['小型群游灯鱼', '温和鼠鱼', '少量工具虾'],
      avoidTypes: ['大型鱼', '强攻击鱼', '偏硬水鱼'],
    },
    stockedSpecies: [{ name: '宝莲灯', quantity: 16 }, { name: '红鼻剪刀', quantity: 10 }, { name: '咖啡鼠', quantity: 4 }, { name: '黑壳虾', quantity: 6 }],
    maintenance: ['每周换水 30%', '每 2 周修剪一次茎类草', '开灯 7 小时起步，CO2 不稳定时减少红草比例'],
    caution: '前景草和红草对灯光、肥力和 CO2 更敏感，新手可先减少迷你矮珍珠面积。',
  },
  {
    id: 'shrimp-tank',
    name: '虾缸',
    tagline: '给米虾留足躲避和啃食面，重点控制稳定水质。',
    bestFor: '30-45cm 小缸、繁殖观察缸',
    difficulty: '新手',
    minVolumeLiters: 20,
    recommendedVolumeLiters: 35,
    minLengthCm: 30,
    waterType: 'Freshwater',
    temperatureRange: [20, 24],
    baseEquipment: ['海绵过滤', '普通灯', '加热棒视室温决定'],
    baseSubstrate: '水草泥',
    basePlants: ['三角莫斯', '青丝绒莫斯', '小水榕', '辣椒榕'],
    baseHardscape: ['沉木 (流木)', '火山石板'],
    speciesRecommendations: [
      { name: '极火虾', role: 'shrimp', minQuantity: 10, recommendedQuantity: 15 },
      { name: '斑马螺', role: 'snail', minQuantity: 1, recommendedQuantity: 1 },
    ],
    visualLabel: '虾类观察',
    visualGradient: 'linear-gradient(135deg,#E6F4E8 0%,#F8E7D2 55%,#D2E6D1 100%)',
    benefitTags: ['虾类友好', '适合观察', '小缸稳定'],
    tankSize: '20L 起步，30L 以上更稳',
    temperature: '23',
    substrate: '水草泥',
    plants: ['三角莫斯', '青丝绒莫斯', '小水榕', '辣椒榕'],
    hardscape: ['沉木 (流木)', '火山石板'],
    equipment: ['海绵过滤', '普通灯', '加热棒视室温决定'],
    equipmentSettings: { filter: '海绵过滤', heater: false, oxygen: true, light: '普通灯' },
    livestock: ['极火虾 10-20 只', '黄金米虾/蓝丝绒米虾单色群', '斑马螺 1 只'],
    capacityGuidance: {
      recommendedLiters: '20-45L',
      maxLivestock: '米虾 10-20 只；螺 1 只；不建议加鱼',
      suitableTypes: ['米虾', '单只工具螺', '莫斯/阴性草'],
      avoidTypes: ['会捕食虾的鱼', '大型鱼', '需要频繁下药的组合'],
    },
    stockedSpecies: [{ name: '极火虾', quantity: 15 }, { name: '斑马螺', quantity: 1 }],
    maintenance: ['每周小换水 10%-20%', '补水和换水温差控制在 1-2°C 内', '避免铜药和强力除藻剂'],
    caution: '不同颜色米虾混养后代容易返祖，想保色建议单色单缸。',
  },
  {
    id: 'south-america-blackwater',
    name: '南美黑水缸',
    tagline: '弱酸软水、沉木落叶和暗色环境，突出南美鱼的状态。',
    bestFor: '60cm 以上观赏缸、短鲷/神仙主题缸',
    difficulty: '进阶',
    minVolumeLiters: 70,
    recommendedVolumeLiters: 120,
    minLengthCm: 60,
    waterType: 'Freshwater',
    temperatureRange: [26, 28],
    baseEquipment: ['桶滤', '弱光灯', '加热棒', '可加黑水素/榄仁叶'],
    baseSubstrate: '河沙',
    basePlants: ['大叶皇冠', '细叶皇冠', '黑木蕨'],
    baseHardscape: ['沉木 (流木)', '杜鹃根'],
    speciesRecommendations: [
      { name: '宝莲灯', role: 'schooling', minQuantity: 12, recommendedQuantity: 20 },
      { name: '阿卡西短鲷', role: 'centerpiece', minQuantity: 2, recommendedQuantity: 2 },
      { name: '神仙鱼', role: 'centerpiece', minQuantity: 0, recommendedQuantity: 2 },
      { name: '咖啡鼠', role: 'bottom', minQuantity: 4, recommendedQuantity: 4 },
    ],
    visualLabel: '暗色原生',
    visualGradient: 'linear-gradient(135deg,#8A6A45 0%,#D5B981 48%,#5B4636 100%)',
    benefitTags: ['氛围感强', '南美主题', '状态展示'],
    tankSize: '60L 起步，神仙鱼建议高缸',
    temperature: '27',
    substrate: '河沙',
    plants: ['大叶皇冠', '细叶皇冠', '黑木蕨'],
    hardscape: ['沉木 (流木)', '杜鹃根'],
    equipment: ['桶滤', '弱光灯', '加热棒', '可加黑水素/榄仁叶'],
    equipmentSettings: { filter: '桶滤', heater: true, oxygen: false, light: '普通灯' },
    livestock: ['宝莲灯 15-30 条', '阿卡西短鲷 1 对', '神仙鱼 2-4 条', '咖啡鼠 4-6 条'],
    capacityGuidance: {
      recommendedLiters: '60L 起步，神仙鱼建议更高水体',
      maxLivestock: '灯鱼 15-25 条；短鲷 1 对；神仙鱼 2 条；鼠鱼 4-6 条',
      suitableTypes: ['弱酸南美灯鱼', '短鲷', '少量神仙鱼', '温和底栖鱼'],
      avoidTypes: ['偏硬水卵胎生鱼', '大型捕食鱼', '高流速溪流鱼'],
    },
    stockedSpecies: [{ name: '宝莲灯', quantity: 20 }, { name: '阿卡西短鲷', quantity: 2 }, { name: '神仙鱼', quantity: 2 }, { name: '咖啡鼠', quantity: 4 }],
    maintenance: ['每周换水 20%', '定期补充落叶或黑水材料', '保持水流柔和，避免频繁大幅调 pH'],
    caution: '黑水缸追求稳定弱酸，不建议同时混入偏硬水或高流速需求的鱼。',
  },
  {
    id: 'seiryu-iwagumi',
    name: '青龙石岩组缸',
    tagline: '石组构图强，视觉干净，但更考验控藻和硬度管理。',
    bestFor: '45-90cm 岩组草缸、极简风格缸',
    difficulty: '进阶',
    minVolumeLiters: 45,
    recommendedVolumeLiters: 90,
    minLengthCm: 45,
    waterType: 'Freshwater',
    temperatureRange: [23, 26],
    baseEquipment: ['强水草灯', '桶滤', 'CO2 强烈建议', '加热棒'],
    baseSubstrate: '水草泥',
    basePlants: ['迷你矮珍珠', '牛毛毡', '南美叉柱花'],
    baseHardscape: ['青龙石', '青龙石景观组', 'ADA风格化妆砂'],
    speciesRecommendations: [
      { name: '红莲灯', role: 'schooling', minQuantity: 10, recommendedQuantity: 16 },
      { name: '红绿灯', role: 'schooling', minQuantity: 8, recommendedQuantity: 15 },
      { name: '黑壳虾', role: 'shrimp', minQuantity: 4, recommendedQuantity: 8 },
      { name: '斑马螺', role: 'snail', minQuantity: 1, recommendedQuantity: 1 },
    ],
    visualLabel: '极简石组',
    visualGradient: 'linear-gradient(135deg,#D9E4DF 0%,#F1F0E8 50%,#AEB9B3 100%)',
    benefitTags: ['视觉层次强', '极简风格', '进阶造景'],
    tankSize: '45L 起步，60cm 以上更容易做纵深',
    temperature: '24',
    substrate: '水草泥',
    plants: ['迷你矮珍珠', '牛毛毡', '南美叉柱花'],
    hardscape: ['青龙石', '青龙石景观组', 'ADA风格化妆砂'],
    equipment: ['强水草灯', '桶滤', 'CO2 强烈建议', '加热棒'],
    equipmentSettings: { filter: '桶滤', heater: true, oxygen: false, light: '水草灯' },
    livestock: ['红莲灯 12-20 条', '红绿灯 15-25 条', '黑壳虾少量', '斑马螺 1-2 只'],
    capacityGuidance: {
      recommendedLiters: '45-90L',
      maxLivestock: '小型灯鱼 20-30 条；工具虾 5-10 只；螺 1-2 只',
      suitableTypes: ['小型群游灯鱼', '少量工具虾', '工具螺'],
      avoidTypes: ['大型鱼', '强翻砂鱼', '偏软水敏感且不耐硬度波动的组合'],
    },
    stockedSpecies: [{ name: '红莲灯', quantity: 16 }, { name: '红绿灯', quantity: 15 }, { name: '黑壳虾', quantity: 8 }, { name: '斑马螺', quantity: 1 }],
    maintenance: ['每周换水 30%-40%', '前 4 周重点控光和勤换水', '前景草爬满后定期薄剪'],
    caution: '青龙石可能提高硬度，搭配偏软水灯鱼时要观察 GH/KH 和鱼只状态。',
  },
] satisfies TankBuildTemplate[]).map(template => ({
  ...template,
  plants: template.plants.map(name => findSpeciesValueByName(name, isAquaticPlantSpecies)),
  hardscape: template.hardscape.map(name => findSpeciesValueByName(name, isHardscapeSpecies)),
}));

const getLocalizedTemplates = (isEn: boolean): TankBuildTemplate[] => {
  if (!isEn) return tankBuildTemplates;
  
  const translations: Record<string, Partial<TankBuildTemplate>> = {
    'beginner-low-tech': {
      name: 'Beginner Low-Tech Planted Tank',
      tagline: 'Low light, low CO2 dependency. Form good stability habits first.',
      bestFor: '30-60cm starter tanks, office desktop setups',
      difficulty: '新手',
      baseEquipment: ['Hang-on-back or small canister filter', 'Standard/entry-level light', 'Optional heater'],
      baseSubstrate: 'Aquarium soil',
      basePlants: ['Anubias Nana', 'Java Fern', 'Bolbitis', 'Christmas Moss'],
      baseHardscape: ['Driftwood', 'Spider Wood'],
      visualLabel: 'Low Maintenance Greenery',
      benefitTags: ['Perfect for first tank', 'Low maintenance pressure', 'Desktop friendly'],
      tankSize: 'At least 30L, 60cm tank is more stable',
      substrate: 'Aquarium soil',
      plants: ['Anubias Nana', 'Java Fern', 'Bolbitis', 'Christmas Moss'],
      hardscape: ['Driftwood', 'Spider Wood'],
      equipment: ['Hang-on-back or small canister filter', 'Standard/entry-level light', 'Optional heater'],
      livestock: ['Cardinal Tetra 8-12 pcs', 'Bronze Corydoras 3-5 pcs', 'Zebra Snail 1-2 pcs'],
      capacityGuidance: {
        recommendedLiters: '30-60L',
        maxLivestock: 'Small schooling fish 8-12; bottom corydoras 3-5; snail 1-2',
        suitableTypes: ['Small tetras', 'Peaceful bottom dwellers', 'A few utility snails'],
        avoidTypes: ['Large fish', 'High-waste fish', 'Strong territorial fish'],
      },
      maintenance: ['Weekly water change of 20%-30%', 'Weekly glass cleaning & pruning old leaves', 'Light 6-7 hours daily; reduce light if algae blooms'],
      caution: 'Do not bury the rhizomes of Anubias and Java Fern in soil; tie them to driftwood or stones instead.',
    },
    'tetra-planted': {
      name: 'Tetra Planted Tank',
      tagline: 'Schooling tetras as the visual center, with plants providing depth and safety.',
      bestFor: '45-90cm small and medium planted tanks',
      difficulty: '新手',
      baseEquipment: ['Planted tank light', 'Canister or strong HOB filter', 'Optional CO2', 'Heater'],
      baseSubstrate: 'Aquarium soil',
      basePlants: ['Dwarf Hairgrass', 'Rotala Rotundifolia', 'Rotala Green', 'Anubias'],
      baseHardscape: ['Seiryu Stones', 'Cosmetic Sand'],
      visualLabel: 'Schooling Nature Scape',
      benefitTags: ['Great schooling effect', 'Highly ornamental', 'Planted tank starter'],
      tankSize: 'At least 45L, 60cm or larger recommended',
      substrate: 'Aquarium soil',
      plants: ['Dwarf Hairgrass', 'Rotala Rotundifolia', 'Rotala Green', 'Anubias'],
      hardscape: ['Seiryu Stones', 'Cosmetic Sand'],
      equipment: ['Planted tank light', 'Canister or strong HOB filter', 'Optional CO2', 'Heater'],
      livestock: ['Cardinal Tetra 12-20 pcs', 'Rummy-nose Tetra 10-15 pcs', 'Bronze Corydoras 4-6 pcs', 'Cherry Shrimp'],
      capacityGuidance: {
        recommendedLiters: '45-90L',
        maxLivestock: 'Small schooling tetras 18-28; bottom corydoras 4-6; utility shrimp 5-10',
        suitableTypes: ['Small schooling tetras', 'Peaceful corydoras', 'Utility shrimps'],
        avoidTypes: ['Large fish', 'Aggressive fish', 'Hard-water sensitive fish'],
      },
      maintenance: ['Weekly water change of 30%', 'Prune stem plants every 2 weeks', 'Light 7+ hours daily; reduce red plants if CO2 is unstable'],
      caution: 'Foreground and red plants are sensitive to light, nutrients, and CO2. Starters can reduce dwarf hairgrass area.',
    },
    'shrimp-tank': {
      name: 'Shrimp Breeding Tank',
      tagline: 'Provide plenty of hiding spots and biofilms. Focus on water parameter stability.',
      bestFor: '30-45cm nano tanks, breeding observation setups',
      difficulty: '新手',
      baseEquipment: ['Sponge filter', 'Standard light', 'Heater (depending on room temperature)'],
      baseSubstrate: 'Aquarium soil',
      basePlants: ['Christmas Moss', 'Flame Moss', 'Anubias Nana', 'Bucephalandra'],
      baseHardscape: ['Driftwood', 'Lava Rock Slabs'],
      visualLabel: 'Shrimp Observation',
      benefitTags: ['Shrimp friendly', 'Easy to observe', 'Stable nano setup'],
      tankSize: 'At least 20L, 30L+ is more stable',
      substrate: 'Aquarium soil',
      plants: ['Christmas Moss', 'Flame Moss', 'Anubias Nana', 'Bucephalandra'],
      hardscape: ['Driftwood', 'Lava Rock Slabs'],
      equipment: ['Sponge filter', 'Standard light', 'Heater (depending on room temp)'],
      livestock: ['Cherry Shrimp 10-20 pcs', 'Yellow/Blue Velvet Shrimp (single color group)', 'Zebra Snail 1 pc'],
      capacityGuidance: {
        recommendedLiters: '20-40L',
        maxLivestock: 'Neocaridina shrimp 10-20; snail 1; fish not recommended',
        suitableTypes: ['Neocaridina/Caridina shrimp', 'Single utility snail', 'Moss/low-light plants'],
        avoidTypes: ['Fish that prey on shrimp', 'Large fish', 'Combinations requiring frequent medications'],
      },
      maintenance: ['Weekly small water change of 10%-20%', 'Keep water temp difference within 1-2°C during changes', 'Avoid copper meds and strong algaecides'],
      caution: 'Mixing different color shrimp will result in wild-type (brownish) offspring. Keep single colors to preserve breed.',
    },
    'south-american-blackwater': {
      name: 'Amazon Blackwater Tank',
      tagline: 'Soft, acidic water with driftwood, leaf litter, and dim lighting to show fish colors.',
      bestFor: '60cm+ display tanks, Apistogramma/Angelfish theme setups',
      difficulty: '进阶',
      baseEquipment: ['Canister filter', 'Dim light', 'Heater', 'Blackwater extract / Almond leaves'],
      baseSubstrate: 'River sand',
      basePlants: ['Amazon Sword', 'Chain Sword', 'Bolbitis'],
      baseHardscape: ['Driftwood', 'Spider Wood'],
      visualLabel: 'Amazon Native',
      benefitTags: ['Strong atmospheric feel', 'Amazon theme', 'Excellent state display'],
      tankSize: 'At least 60L, Angelfish requires taller tank',
      substrate: 'River sand',
      plants: ['Amazon Sword', 'Chain Sword', 'Bolbitis'],
      hardscape: ['Driftwood', 'Spider Wood'],
      equipment: ['Canister filter', 'Dim light', 'Heater', 'Blackwater extract / Almond leaves'],
      livestock: ['Cardinal Tetra 15-30 pcs', 'Apistogramma 1 pair', 'Angelfish 2-4 pcs', 'Bronze Corydoras 4-6 pcs'],
      capacityGuidance: {
        recommendedLiters: '60-120L',
        maxLivestock: 'Tetras 15-25; Apistogramma 1 pair; Angelfish 2; corydoras 4-6',
        suitableTypes: ['Acidic Amazon tetras', 'Apistogramma pairs', 'Angelfish', 'Peaceful bottom dwellers'],
        avoidTypes: ['Hard-water livebearers', 'Large predatory fish', 'High-current stream fish'],
      },
      maintenance: ['Weekly water change of 20%', 'Periodically add leaf litter or blackwater extract', 'Keep flow gentle; avoid frequent large pH adjustments'],
      caution: 'Blackwater setups target stable soft acidic parameters. Do not mix hard-water or high-flow demanding species.',
    },
    'seiryu-stone-iwagumi': {
      name: 'Seiryu Stone Iwagumi Scape',
      tagline: 'Strong stone composition and clean aesthetics, but tests algae control and hardness management.',
      bestFor: '45-90cm stone Iwagumi layouts, minimalist planted tanks',
      difficulty: '进阶',
      baseEquipment: ['High-power planted light', 'Canister filter', 'CO2 system highly recommended', 'Heater'],
      baseSubstrate: 'Aquarium soil',
      basePlants: ['Dwarf Baby Tears', 'Hairgrass', 'Staurogyne Repens'],
      baseHardscape: ['Seiryu Stones', 'ADA style cosmetic sand'],
      visualLabel: 'Minimalist Iwagumi',
      benefitTags: ['Strong visual depth', 'Minimalist style', 'Advanced aquascaping'],
      tankSize: 'At least 45L, 60cm+ makes it easier to create depth',
      substrate: 'Aquarium soil',
      plants: ['Dwarf Baby Tears', 'Hairgrass', 'Staurogyne Repens'],
      hardscape: ['Seiryu Stones', 'ADA style cosmetic sand'],
      equipment: ['High-power planted light', 'Canister filter', 'CO2 system highly recommended', 'Heater'],
      livestock: ['Cardinal Tetra 12-20 pcs', 'Neon Tetra 15-25 pcs', 'Cherry Shrimp', 'Zebra Snail 1-2 pcs'],
      capacityGuidance: {
        recommendedLiters: '45-90L',
        maxLivestock: 'Small tetras 20-30; utility shrimp 5-10; snail 1-2',
        suitableTypes: ['Small schooling tetras', 'A few utility shrimps', 'Utility snails'],
        avoidTypes: ['Large fish', 'Bottom-digging fish', 'Sensitive species vulnerable to hardness fluctuations'],
      },
      maintenance: ['Weekly water change of 30%-40%', 'Focus on light control and water changes in the first 4 weeks', 'Prune foreground carpet once fully covered'],
      caution: 'Seiryu stones leach calcium and raise hardness. Monitor GH/KH when keeping soft-water tetras.',
    },
  };

  return tankBuildTemplates.map(template => {
    const tr = translations[template.id];
    if (!tr) return template;
    return {
      ...template,
      ...tr,
      capacityGuidance: {
        ...template.capacityGuidance,
        ...tr.capacityGuidance,
      },
    };
  });
};

const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse localStorage value', error);
    return fallback;
  }
};

const normalizeAquariumPlants = (aquariums: Partial<Aquarium>[]) => aquariums.map((rawAquarium, index) => {
  const normalized = normalizeAquariumRecord(rawAquarium, index);
  const inferredCandidates = [
    normalized.lastWaterChangeDate,
    ...(normalized.waterChangeHistory || []),
    ...normalized.fishes.map(item => item.entryDate),
  ].filter(Boolean).map(value => new Date(value as string)).filter(value => !Number.isNaN(value.getTime()));
  const inferredStartedAt = inferredCandidates.length
    ? new Date(Math.min(...inferredCandidates.map(value => value.getTime()))).toISOString().slice(0, 10)
    : undefined;
  const aquarium: Aquarium = normalized.startedAt || !inferredStartedAt
    ? normalized
    : { ...normalized, startedAt: inferredStartedAt, startedAtSource: 'inferred', startedAtConfirmedAt: undefined };
  const plantIdsFromFishes = aquarium.fishes
    .map(item => fishData.find(fish => fish.id === item.fishId))
    .filter((fish): fish is Fish => Boolean(fish) && isAquaticPlantSpecies(fish))
    .map(fish => fish.id);
  const hardscapeIdsFromFishes = aquarium.fishes
    .map(item => fishData.find(fish => fish.id === item.fishId))
    .filter((fish): fish is Fish => Boolean(fish) && isHardscapeSpecies(fish))
    .map(fish => fish.id);

  if (plantIdsFromFishes.length === 0 && hardscapeIdsFromFishes.length === 0) return aquarium;

  return {
    ...aquarium,
    fishes: aquarium.fishes.filter(item => {
      const fish = fishData.find(species => species.id === item.fishId);
      return !fish || (!isAquaticPlantSpecies(fish) && !isHardscapeSpecies(fish));
    }),
    plants: Array.from(new Set([...(aquarium.plants || []), ...plantIdsFromFishes])),
    hardscape: Array.from(new Set([...(aquarium.hardscape || []), ...hardscapeIdsFromFishes])),
  };
});

const parseLiters = (value: string | undefined, fallback = 0) => {
  const match = (value || '').match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : fallback;
};

const getTankGrossVolumeLiters = (dimensions?: Aquarium['dimensions']) => {
  if (!dimensions?.length || !dimensions.width || !dimensions.height) return 0;
  const length = parseFloat(dimensions.length);
  const width = parseFloat(dimensions.width);
  const height = parseFloat(dimensions.height);
  if ([length, width, height].some(value => Number.isNaN(value) || value <= 0)) return 0;
  return Math.round((length * width * height) / 1000);
};

const getEstimatedWaterVolumeLiters = (dimensions?: Aquarium['dimensions']) => {
  const grossVolume = getTankGrossVolumeLiters(dimensions);
  return grossVolume > 0 ? Math.round(grossVolume * 0.85) : 0;
};

const getTankVolumeLiters = (aquarium: Aquarium) => {
  return getEstimatedWaterVolumeLiters(aquarium.dimensions);
};

const needsHeaterForSpecies = (fish: Fish) => {
  const match = fish.waterTemperature.match(/(\d+)-(\d+)/);
  if (!match) return false;
  return parseInt(match[1], 10) >= 20;
};

const loadDiscoveryState = () => {
  try {
    const state = normalizeDiscoveryState(JSON.parse(localStorage.getItem(DISCOVERY_STORAGE_KEY) || 'null'));
    return { ...state, queueIds: [] };
  } catch {
    return normalizeDiscoveryState();
  }
};

const saveDiscoveryState = (state: DiscoveryDeckState) => {
  localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(state));
  patchLocalAppState({ discoveryState: state }, { debounce: true });
};

const getDiscoveryPositioning = (fish: Fish, isEn = false) => {
  const primaryTool = getToolFunctions(fish)[0];
  if (isEn) {
    if (primaryTool) return 'Useful tank helper · check the full care profile before adding';
    if (fish.difficulty === 'Easy') return 'Great for beginners and daily observation';
    return 'Review its care needs and tank fit before deciding';
  }
  if (primaryTool) return `${primaryTool} · ${fish.housingMode || '适合继续观察'}`;
  if (fish.difficulty === 'Easy') return '适合新手观察和入门搭配';
  if (fish.housingMode) return fish.housingMode;
  return '可以先看详情，再决定是否加入鱼缸';
};

const getBioLoadLiters = (fish: Fish) => {
  const lifeType = getLifeType(fish);
  if (lifeType === 'plant' || lifeType === 'hardscape') return 0;
  if (lifeType === 'invertebrate') {
    if (/螺|snail|Neritina|Pomacea|Clithon|Anentome/i.test(`${fish.name} ${fish.scientificName}`)) return 1.5;
    return 0.5;
  }
  if (lifeType === 'coral') return 8;
  if (lifeType === 'reptile') return 60;

  const base = fish.size === 'Large' ? 35 : fish.size === 'Medium' ? 9 : 2.5;
  const temperamentMultiplier = fish.temperament === 'Aggressive' || fish.temperament === 'Territorial' ? 1.35 : 1;
  return base * temperamentMultiplier;
};

const getArchiveCategory = (fish: Fish) => {
  const lifeType = getLifeType(fish);
  if (lifeType === 'plant') return '水草';
  if (lifeType === 'hardscape') {
    return /砂|泥|底床|substrate|soil|sand/i.test(`${fish.name} ${fish.scientificName}`) ? '底砂' : '造景';
  }
  if (lifeType === 'invertebrate') return '虾螺';
  return '鱼类';
};

const getSubstrateArchiveSpecies = (substrate?: string) => {
  if (!substrate || substrate === '无') return null;
  const hardscapeSpecies = fishData.filter(isHardscapeSpecies);
  return (
    hardscapeSpecies.find(item => item.name === substrate || item.name.includes(substrate) || substrate.includes(item.name))
    || (substrate.includes('化妆砂') ? hardscapeSpecies.find(item => item.name.includes('化妆砂')) : undefined)
    || (substrate.includes('水草泥') ? hardscapeSpecies.find(item => item.name.includes('水草泥')) : undefined)
    || (/砂|河沙|黑金沙|珊瑚砂/.test(substrate) ? hardscapeSpecies.find(item => item.name.includes('溪流砂') || item.name.includes('化妆砂')) : undefined)
    || null
  );
};

type DiagnosisMode = 'home' | 'quiz' | 'result' | 'history';

type DiagnosisQuizQuestion = DiagnosisQuestion;

type DiagnosisResult = {
  verdict: string;
  risk: string;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  currentAction: string;
  keyMetrics: Array<{ label: string; value: string }>;
  reasons: string[];
  actions: string[];
  avoid: string[];
  observe: string[];
  missing: string[];
  evidence: string[];
  nextCheckAt?: string;
};

const toDiagnosisOutput = (result: DiagnosisResult): DiagnosisOutput => ({
  riskLevel: result.riskLevel,
  riskLabel: result.risk,
  summary: result.verdict,
  currentAction: result.currentAction,
  actions: result.actions,
  avoidActions: result.avoid,
  possibleCauses: result.reasons,
  observeItems: result.observe,
  missingInfo: result.missing,
  evidence: result.evidence,
  keyMetrics: result.keyMetrics,
  matchedRules: [],
  matchedArticles: [],
  nextCheckAt: result.nextCheckAt,
});

type CareDiagnosisContext = {
  source: 'care';
  topicId: string;
  title: string;
  category: string;
  diagnosisType: string;
  summary: string;
  selectedSymptoms: string[];
  completedSteps: string[];
  prepInfo: string[];
};

type SelectedAddFishItem = { fishId: string; quantity: number; entryDate: string };

const loadWishlistFishIds = () => {
  return new Set(getSpeciesFavoriteIds());
};

export default function AquariumManager() {
  const { t, i18n } = useTranslation();
  const { isPhoneLayout } = useLayoutMode();
  const isEn = i18n.language?.startsWith('en');
  const localizedTemplates = useMemo(() => getLocalizedTemplates(isEn), [isEn]);
  const filterOptionKeys: Record<string, string> = {
    '无': 'none',
    '瀑布过滤': 'filterCascade',
    '桶滤': 'filterCanister',
    '上滤': 'filterTop',
    '海绵过滤': 'filterSponge',
  };
  const lightOptionKeys: Record<string, string> = {
    '无': 'none',
    '普通灯': 'lightNormal',
    '水草灯': 'lightPlanted',
    '海水灯': 'lightMarine',
  };
  const { captureContext, navigateToRoute, navigateToSection, navigateToView, restoreContext } = useWorkspaceNavigation();
  const routeLocation = useLocation();
  const routeNavigate = useNavigate();
  const { showToast } = useToast();
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [pendingDeleteAquariumId, setPendingDeleteAquariumId] = useState<string | null>(null);
  
  // UI States
  const [isAquariumMenuOpen, setIsAquariumMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isAddFishOpen, setIsAddFishOpen] = useState(false);
  const [additionIntent, setAdditionIntent] = useState<SpeciesAdditionIntent>('record_existing');
  const [isAddFishSaving, setIsAddFishSaving] = useState(false);
  const addFishOperationIdRef = useRef('');
  const createAquariumOperationIdRef = useRef('');
  const compatibilityRecordOperationRef = useRef<{ key: string; id: string }>({ key: '', id: '' });
  const smartSimulationOperationRef = useRef<{ key: string; id: string }>({ key: '', id: '' });
  const [isSmartRecommendOpen, setIsSmartRecommendOpen] = useState(false);
  const [smartRecommendMode, setSmartRecommendMode] = useState<RecommendationMode>('existing_livestock');
  const [smartPreference, setSmartPreference] = useState('新手友好 低维护');
  const [smartSimulation, setSmartSimulation] = useState<SimulationResult | null>(null);
  const [smartAddQuantity, setSmartAddQuantity] = useState(1);
  const [isSmartSimulationSaving, setIsSmartSimulationSaving] = useState(false);
  const [smartCandidateScopeIds, setSmartCandidateScopeIds] = useState<string[] | null>(null);
  const [isTankCopilotOpen, setIsTankCopilotOpen] = useState(false);
  const [tankCopilotGoal, setTankCopilotGoal] = useState('');
  const [tankCopilotResult, setTankCopilotResult] = useState<TankBuildCopilotData | null>(null);
  const [isTankCopilotLoading, setIsTankCopilotLoading] = useState(false);
  const [tankCopilotError, setTankCopilotError] = useState('');
  const [tankCopilotAnswers, setTankCopilotAnswers] = useState<Record<string, string>>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [selectedAqFish, setSelectedAqFish] = useState<{fish: Fish, aqFish: AquariumFish} | null>(null);
  const speciesDetailNavigationContextRef = useRef<WorkspaceNavigationContext | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBuildPlanOpen, setIsBuildPlanOpen] = useState(false);
  const [isTankPreviewOpen, setIsTankPreviewOpen] = useState(false);
  const [shouldLoadThreeAquarium, setShouldLoadThreeAquarium] = useState(false);
  const [requiresManualThreeLoad, setRequiresManualThreeLoad] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isDiagnosisExitConfirmOpen, setIsDiagnosisExitConfirmOpen] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [diagnosisFullText, setDiagnosisFullText] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisIssueType, setDiagnosisIssueType] = useState('巡检');
  const [diagnosisMode, setDiagnosisMode] = useState<DiagnosisMode>('home');
  const [diagnosisQuestionIndex, setDiagnosisQuestionIndex] = useState(0);
  const diagnosisAdvanceTimerRef = useRef<number | null>(null);
  const diagnosisQuestionRefs = useRef<Record<string, HTMLElement | null>>({});
  const diagnosisSubmitRef = useRef<HTMLButtonElement | null>(null);
  const [diagnosisQuizAnswers, setDiagnosisQuizAnswers] = useState<Record<string, string>>({});
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [diagnosisAquariumId, setDiagnosisAquariumId] = useState('');
  const [diagnosisRecords, setDiagnosisRecords] = useState<DiagnosisRecord[]>([]);
  const [selectedDiagnosisRecord, setSelectedDiagnosisRecord] = useState<DiagnosisRecord | null>(null);
  const [diagnosisSaveMessage, setDiagnosisSaveMessage] = useState('');
  const [isDiagnosisRecordSaved, setIsDiagnosisRecordSaved] = useState(false);
  const [diagnosisBatchCareFocus, setDiagnosisBatchCareFocus] = useState<SpeciesBatchCareSignal | null>(null);
  const [dailyCheckInterpretation, setDailyCheckInterpretation] = useState<TankDailyCheckInterpretationData | null>(null);
  const [dailyCheckArticles, setDailyCheckArticles] = useState<typeof careTopicsData>([]);
  const [selectedDailyCheckArticle, setSelectedDailyCheckArticle] = useState<(typeof careTopicsData)[number] | null>(null);
  const [careDiagnosisContext, setCareDiagnosisContext] = useState<CareDiagnosisContext | null>(null);
  const [selectedBuildTemplateId, setSelectedBuildTemplateId] = useState(localizedTemplates[0].id);
  const [isTankArchiveExpanded, setIsTankArchiveExpanded] = useState(false);
  const [exportArtifact, setExportArtifact] = useState<ExportArtifactContent | null>(null);
  const [isSavingStartedAt, setIsSavingStartedAt] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [settingsForm, setSettingsForm] = useState<Partial<Aquarium>>({});
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<'size' | 'parameters' | 'substrate' | 'plants' | 'lighting' | 'equipment' | null>(null);
  const [isPlantListExpanded, setIsPlantListExpanded] = useState(false);
  const [isScapeListExpanded, setIsScapeListExpanded] = useState(false);
  const settingsBodyRef = useRef<HTMLDivElement | null>(null);
  const settingPanelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handledAddSpeciesRequestRef = useRef('');
  const handledOnboardingActionRef = useRef('');
  
  // 3D Highlight state
  const [active3DSpecies, setActive3DSpecies] = useState<string | null>(null);

  // New fish form state
  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [selectedAddFishItems, setSelectedAddFishItems] = useState<SelectedAddFishItem[]>([]);
  const [addFishSuccess, setAddFishSuccess] = useState<{
    aquariumName: string;
    items: Array<{ fishId: string; name: string; quantity: number; entryDate: string; image: string }>;
    result: RecordExistingResult;
  } | null>(null);
  const [addFishCompatibilityReview, setAddFishCompatibilityReview] = useState<SpeciesAdditionReview | null>(null);
  const [addFishDatePicker, setAddFishDatePicker] = useState<{ fishId: string; month: Date } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedWaterChangeDate, setSelectedWaterChangeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [waterChangeFeedback, setWaterChangeFeedback] = useState('');

  const [wishlistFishIds, setWishlistFishIds] = useState<Set<string>>(() => loadWishlistFishIds());
  const [careReminders, setCareRemindersState] = useState<CareReminderRecord[]>(() => getCareReminders());
  const [careTimelineEvents, setCareTimelineEvents] = useState<CareTimelineRecord[]>(() => loadAppStateFromStorage().careEvents || []);
  const [careTimelineRevision, setCareTimelineRevision] = useState(0);
  const [pendingReminderDelete, setPendingReminderDelete] = useState<CareReminderRecord | null>(null);
  const [pendingReminderReschedule, setPendingReminderReschedule] = useState<CareReminderRecord | null>(null);
  const [discoveryState, setDiscoveryState] = useState<DiscoveryDeckState>(() => loadDiscoveryState());
  const [discoveryMessage, setDiscoveryMessage] = useState('');
  const [isDiscoveryFavoritePending, setIsDiscoveryFavoritePending] = useState(false);
  const [selectedWishlistFish, setSelectedWishlistFish] = useState<Fish | null>(null);

  const persistCareTimelineEvent = async (input: Omit<CareTimelineMutation, 'operationId'>) => {
    const repository = await getCurrentAquaGuideRepository();
    const saved = await repository.saveCareEvent({
      ...input,
      operationId: `care-event:${input.aquariumId || 'general'}:${input.eventType}:${input.sourceType || 'manual'}:${input.sourceId || input.occurredAt}`,
    });
    setCareTimelineEvents(current => [saved, ...current.filter(item => item.id !== saved.id)]);
    setCareTimelineRevision(value => value + 1);
    return saved;
  };

  const removeCareTimelineEventBySource = async (aquariumId: string, sourceType: string, sourceId: string) => {
    const repository = await getCurrentAquaGuideRepository();
    await repository.removeCareEventBySource({
      aquariumId,
      sourceType,
      sourceId,
      operationId: `care-event-delete:${aquariumId}:${sourceType}:${sourceId}`,
    });
    setCareTimelineEvents(current => current.filter(item => !(item.aquariumId === aquariumId && item.sourceType === sourceType && item.sourceId === sourceId)));
    setCareTimelineRevision(value => value + 1);
  };

  const openAquariumSpeciesDetail = (fish: Fish, aqFish: AquariumFish, sourceId?: string) => {
    speciesDetailNavigationContextRef.current = captureContext(sourceId);
    setSelectedWishlistFish(null);
    setSelectedAqFish({ fish, aqFish });
  };

  const openWishlistSpeciesDetail = (fish: Fish, sourceId?: string) => {
    speciesDetailNavigationContextRef.current = captureContext(sourceId);
    setSelectedAqFish(null);
    setSelectedWishlistFish(fish);
  };

  const closeAquariumSpeciesDetail = (restoreReturnContext = true) => {
    setSelectedAqFish(null);
    setSelectedWishlistFish(null);
    const context = speciesDetailNavigationContextRef.current;
    speciesDetailNavigationContextRef.current = null;
    if (restoreReturnContext && context) void restoreContext(context);
  };
  const [deceasedRecords, setDeceasedRecords] = useState<DeceasedRecord[]>([]);
  const [tankActionMessage, setTankActionMessage] = useState<string>('');
  const [fedToday, setFedToday] = useState(false);
  const [priorityTaskStatus, setPriorityTaskStatus] = useState<Record<string, string>>({});
  const [isCarePlanExpanded, setIsCarePlanExpanded] = useState(false);
  const [isRiskReminderOpen, setIsRiskReminderOpen] = useState(false);
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [observationChecks, setObservationChecks] = useState<string[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<LocalEventRecord[]>([]);
  const [observationRecords, setObservationRecords] = useState<LocalEventRecord[]>([]);
  const [isLocalDataOpen, setIsLocalDataOpen] = useState(false);
  const [localDataText, setLocalDataText] = useState('');
  const [localDataMessage, setLocalDataMessage] = useState('');
  const [localWeather, setLocalWeather] = useState<LocalWeatherOutput | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slowConnection = Boolean(connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType || ''));
    if (slowConnection) {
      setRequiresManualThreeLoad(true);
      return;
    }
    let idleId: number | undefined;
    const fallbackTimer = typeof window.requestIdleCallback === 'function'
      ? undefined
      : window.setTimeout(() => setShouldLoadThreeAquarium(true), 900);
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => setShouldLoadThreeAquarium(true), { timeout: 1400 });
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadRepositoryAquariums = async (mode?: 'local' | 'cloud') => {
      try {
        const resolvedMode = mode ?? await resolveRepositoryMode();
        const repository = getAquaGuideRepository(resolvedMode);
        const [repositoryAquariums, repositoryReminders, repositoryEvents] = resolvedMode === 'cloud'
          ? await Promise.all([repository.getAquariums(), repository.getCareReminders(), repository.getCareEvents()])
          : [loadAppStateFromStorage().aquariums, await repository.getCareReminders(), await repository.getCareEvents()];
        if (!active) return;
        if (resolvedMode === 'cloud') patchLocalAppState({ cloudMigrationConfirmed: true });
        const normalized = normalizeAquariumPlants(repositoryAquariums);
        setAquariums(normalized);
        setCareRemindersState(repositoryReminders);
        setCareTimelineEvents(repositoryEvents);
        setActiveId(current => normalized.some(item => item.id === current) ? current : normalized[0]?.id || '');
      } catch (error) {
        if (active) showToast(error instanceof Error ? error.message : (isEn ? 'Cloud aquarium data could not be loaded.' : '云端鱼缸暂时无法读取。'), 'error');
      }
    };
    void loadRepositoryAquariums();
    const unsubscribe = subscribeToRepositoryMode(mode => void loadRepositoryAquariums(mode));
    return () => { active = false; unsubscribe(); };
  }, [isEn, showToast]);

  useEffect(() => {
    const appState = loadAppStateFromStorage();
    setWishlistFishIds(loadWishlistFishIds());
    setDeceasedRecords(Array.isArray(appState.deceasedRecords) ? appState.deceasedRecords as DeceasedRecord[] : []);
    setDiagnosisRecords(Array.isArray(appState.diagnosisRecords) ? appState.diagnosisRecords as DiagnosisRecord[] : []);
    setFeedingRecords(appState.feedingRecords);
    setObservationRecords(appState.observationRecords);
    setPriorityTaskStatus(appState.riskReminderState || {});
  }, []);

  useEffect(() => subscribeToCareActivity(() => {
    void resolveRepositoryMode()
      .then(mode => {
        if (mode === 'local') setCareRemindersState(getCareReminders());
      })
      .catch(error => showToast(error instanceof Error ? error.message : (isEn ? 'Care plans could not be refreshed.' : '养护计划暂时无法刷新。'), 'error'));
  }), [isEn, showToast]);

  useEffect(() => {
    let isMounted = true;
    setWeatherStatus('loading');

    weatherService.getLocalWeather({ timeoutMs: 8000 }).then((weather) => {
      if (!isMounted) return;
      setLocalWeather(weather);
      setWeatherStatus(weather.ok ? 'ready' : 'unavailable');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) {
      setActiveSettingsPanel(null);
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!diagnosisFullText) {
      setDiagnosisText('');
      return;
    }

    setDiagnosisText('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setDiagnosisText(diagnosisFullText.slice(0, index));
      if (index >= diagnosisFullText.length) {
        window.clearInterval(timer);
        setIsDiagnosing(false);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [diagnosisFullText]);

  const syncWishlistFishIds = (next: Set<string>) => {
    setWishlistFishIds(next);
    setSpeciesFavoriteIds(next);
  };

  useEffect(() => {
    const refreshWishlist = () => setWishlistFishIds(loadWishlistFishIds());
    window.addEventListener('focus', refreshWishlist);
    const unsubscribe = subscribeToFavorites(refreshWishlist);
    return () => {
      window.removeEventListener('focus', refreshWishlist);
      unsubscribe();
    };
  }, []);

  const toggleWishlist = (id: string) => {
    const next = new Set(wishlistFishIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    syncWishlistFishIds(next);
  };

  useEffect(() => {
    let active = true;
    const loadLocalAquariums = async () => {
      const mode = await resolveRepositoryMode();
      if (!active || mode === 'cloud') return;
      const appState = loadAppStateFromStorage();
      if (appState.aquariums.length > 0) {
        const parsed = normalizeAquariumPlants(appState.aquariums);
        setAquariums(parsed);
        setActiveId(appState.currentAquariumId && parsed.some(item => item.id === appState.currentAquariumId) ? appState.currentAquariumId : parsed[0]?.id || '');
        saveAppStateToStorage({ ...appState, aquariums: parsed, currentAquariumId: appState.currentAquariumId || parsed[0]?.id || '' });
        return;
      }
      const oldSaved = localStorage.getItem('myAquarium');
      const oldAquarium = safeJsonParse<Partial<Aquarium> | null>(oldSaved, null);
      const initialAquariums = normalizeAquariumPlants(oldAquarium ? [oldAquarium] : []);
      setAquariums(initialAquariums);
      setActiveId(initialAquariums[0]?.id || '');
      if (oldAquarium) {
        saveAppStateToStorage({ ...appState, aquariums: initialAquariums, currentAquariumId: initialAquariums[0].id });
      }
    };
    void loadLocalAquariums().catch(error => {
      if (active) showToast(error instanceof Error ? error.message : (isEn ? 'Local aquarium data could not be loaded.' : '本地鱼缸数据暂时无法读取。'), 'error');
    });
    return () => { active = false; };
  }, [isEn, showToast]);

  const saveAquariums = (newAquariums: Aquarium[]) => {
    const saved = persistAquariums(newAquariums, activeId || newAquariums[0]?.id || '');
    setAquariums(saved.aquariums);
  };

  const saveLivestockBatches = async (recordId: string, nextRecord: AquariumFish | null) => {
    const active = aquariums.find(aquarium => aquarium.id === activeId);
    if (!active) throw new Error(isEn ? 'No active aquarium was found.' : '没有找到当前鱼缸。');
    const nextAquarium = {
      ...active,
      fishes: nextRecord
        ? active.fishes.map(record => record.id === recordId ? nextRecord : record)
        : active.fishes.filter(record => record.id !== recordId),
    };
    const repository = await getCurrentAquaGuideRepository();
    const savedAquarium = await repository.saveAquarium(nextAquarium);
    setAquariums(current => current.map(aquarium => aquarium.id === activeId ? savedAquarium : aquarium));
    if (nextRecord) {
      const latestStateUpdate = nextRecord.batches?.map(batch => batch.stateUpdatedAt).sort().at(-1) || new Date().toISOString();
      await persistCareTimelineEvent({
        aquariumId: active.id,
        eventType: 'life_stage_updated',
        title: isEn ? 'Updated livestock state' : '调整缸内物种体态',
        label: isEn ? 'Quantity and state changes saved' : '已保存数量与体态变化',
        payload: { speciesRecordId: recordId },
        occurredAt: new Date().toISOString(),
        sourceType: 'livestock_state',
        sourceId: `${recordId}:${latestStateUpdate}`,
        isInferred: false,
      });
    }
    showToast(nextRecord
      ? (isEn ? 'Livestock group states updated' : '体态与数量已更新')
      : (isEn ? 'Species removed from this tank' : '该物种已移出鱼缸'));
  };

  const removeLivestockQuantity = async (input: { aquariumFishId: string; batchId: string; quantity: number; operationId: string }) => {
    const active = aquariums.find(aquarium => aquarium.id === activeId);
    if (!active) throw new Error('没有找到当前鱼缸。');
    const repository = await getCurrentAquaGuideRepository();
    const savedAquarium = await repository.removeLivestock({
      aquariumId: active.id,
      aquariumFishId: input.aquariumFishId,
      batchId: input.batchId,
      quantity: input.quantity,
      operationId: input.operationId,
    });
    setAquariums(current => current.map(aquarium => aquarium.id === active.id ? savedAquarium : aquarium));
    await persistCareTimelineEvent({
      aquariumId: active.id,
      eventType: 'species_removed',
      title: isEn ? 'Removed livestock' : '移出缸内生物',
      label: isEn ? `${input.quantity} animals` : `${input.quantity} 只/条`,
      payload: { aquariumFishId: input.aquariumFishId, quantity: input.quantity },
      occurredAt: new Date().toISOString(),
      sourceType: 'livestock_removal',
      sourceId: input.operationId,
      isInferred: false,
    });
    showToast(isEn ? `Removed ${input.quantity} livestock from aquarium log` : `已从鱼缸记录中移出 ${input.quantity} 只/条`);
  };
  const [isCreatingAquarium, setIsCreatingAquarium] = useState(false);
  const handleAddAquarium = async () => {
    if (isCreatingAquarium) return null;
    setIsCreatingAquarium(true);
    const draft = createAquariumDraft(`我的鱼缸 ${aquariums.length + 1}`);
    if (!createAquariumOperationIdRef.current) {
      createAquariumOperationIdRef.current = `aquarium-create:${crypto.randomUUID()}`;
    }
    try {
      const repository = await getCurrentAquaGuideRepository();
      const created = await repository.createAquarium({
        name: draft.name,
        startedAt: draft.startedAt!,
        startedAtSource: 'created',
        operationId: createAquariumOperationIdRef.current,
      });
      createAquariumOperationIdRef.current = '';
      setAquariums(current => [...current.filter(item => item.id !== created.id), created]);
      setActiveId(created.id);
      showToast(Boolean(i18n.language?.startsWith('en')) ? `Created new aquarium "${created.name}"` : `已新建“${created.name}”`);
      return created;
    } catch (error) {
      showToast(error instanceof Error ? error.message : (isEn ? 'Could not create the aquarium.' : '鱼缸没有创建成功。'), 'error');
      return null;
    } finally {
      setIsCreatingAquarium(false);
    }
  };

  const openTankArchive = () => {
    setIsTankArchiveExpanded(true);
  };

  const handleCompleteReminder = async (reminder: CareReminderRecord) => {
    try {
      const repository = await getCurrentAquaGuideRepository();
      const completedAt = new Date().toISOString();
      const completed = await repository.updateCareReminder({ action: 'complete', id: reminder.id, completedAt });
      if (!completed) throw new Error(isEn ? 'The care plan was not found.' : '没有找到这条养护计划。');
      await persistCareTimelineEvent({
        aquariumId: reminder.aquariumId || activeId,
        eventType: 'care_plan_completed',
        title: isEn ? `Completed care plan: ${reminder.title}` : `完成养护计划：${reminder.title}`,
        payload: {},
        occurredAt: completed.completedAt || completedAt,
        sourceType: 'care_reminder',
        sourceId: reminder.id,
        isInferred: false,
      });
      setCareRemindersState(await repository.getCareReminders());
      showToast(completed.repeatEnabled
        ? (Boolean(i18n.language?.startsWith('en')) ? `Completed. Next task is in ${completed.repeatIntervalDays} days.` : `已完成，下一次将在 ${completed.repeatIntervalDays} 天后提醒。`)
        : (Boolean(i18n.language?.startsWith('en')) ? 'Care plan task marked completed' : '养护计划已完成'));
    } catch (error) {
      showToast(error instanceof Error ? error.message : (Boolean(i18n.language?.startsWith('en')) ? 'Failed to update care plan.' : '养护计划没有更新成功。'), 'error');
    }
  };

  const handleCreateRecurrence = async (type: 'feeding' | 'water_change' | 'general', days: number) => {
    const labels = {
      feeding: isEn ? 'Feeding reminder' : '喂食计划',
      water_change: isEn ? 'Water change reminder' : '换水计划',
      general: isEn ? 'General care reminder' : '通用养护计划',
    };
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + days);
    try {
      const repository = await getCurrentAquaGuideRepository();
      const reminder = await repository.updateCareReminder({ action: 'upsert', record: {
        sourceTopicId: `routine-${type}`,
        title: labels[type],
        type,
        scheduledFor: scheduled.toISOString(),
        aquariumId: activeId,
        label: `${days} 天循环`,
        seriesId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `series-${Date.now()}`,
        repeatEnabled: true,
        repeatIntervalDays: days,
      } });
      if (!reminder) throw new Error(isEn ? 'The recurring care plan was not saved.' : '循环养护没有保存成功。');
      setCareRemindersState(await repository.getCareReminders());
      showToast(isEn ? `${reminder.title} repeats every ${days} days.` : `已设置“${reminder.title}”每 ${days} 天循环。`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : (isEn ? 'Could not save recurring care.' : '循环养护没有保存成功。'), 'error');
    }
  };

  const handleChangeRecurrence = async (reminder: CareReminderRecord, enabled: boolean, days?: number) => {
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateCareReminder({ action: 'recurrence', id: reminder.id, repeatEnabled: enabled, repeatIntervalDays: days });
      setCareRemindersState(await repository.getCareReminders());
      showToast(enabled ? (isEn ? 'Recurring care updated.' : '循环养护已更新。') : (isEn ? 'Recurring care turned off.' : '已关闭循环，历史记录仍会保留。'));
    } catch (error) {
      showToast(error instanceof Error ? error.message : (isEn ? 'Could not update recurring care.' : '循环养护没有更新成功。'), 'error');
    }
  };

  const handleRescheduleReminder = async (reminder: CareReminderRecord, days: number) => {
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + days);
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateCareReminder({ action: 'reschedule', id: reminder.id, scheduledFor: scheduled.toISOString(), label: `${days} 天后提醒` });
      setCareRemindersState(await repository.getCareReminders());
      setPendingReminderReschedule(null);
      showToast(Boolean(i18n.language?.startsWith('en')) ? `Rescheduled to remind in ${days} days` : `已改为 ${days} 天后提醒`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : (Boolean(i18n.language?.startsWith('en')) ? 'Failed to reschedule care plan.' : '养护计划没有改期成功。'), 'error');
    }
  };

  const handleDeleteReminder = async () => {
    if (!pendingReminderDelete) return;
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateCareReminder({ action: 'delete', id: pendingReminderDelete.id });
      setCareRemindersState(await repository.getCareReminders());
      setPendingReminderDelete(null);
      showToast(Boolean(i18n.language?.startsWith('en')) ? 'Care plan task deleted' : '养护计划已删除');
    } catch (error) {
      showToast(error instanceof Error ? error.message : (Boolean(i18n.language?.startsWith('en')) ? 'Failed to delete care plan.' : '养护计划没有删除成功。'), 'error');
    }
  };

  const requestDeleteAquarium = (id: string) => {
    setPendingDeleteAquariumId(id);
  };

  const confirmDeleteAquarium = () => {
    if (!pendingDeleteAquariumId || aquariums.length <= 1) return;
    const updated = aquariums.filter(a => a.id !== pendingDeleteAquariumId);
    saveAquariums(updated);
    if (activeId === pendingDeleteAquariumId) {
      setActiveId(updated[0]?.id || '');
    }
    setPendingDeleteAquariumId(null);
  };

  const openLocalDataManager = () => {
    setLocalDataText('');
    setLocalDataMessage('');
    setIsLocalDataOpen(true);
  };

  const openAquariumSettings = (panel: typeof activeSettingsPanel = null) => {
    if (!activeAquarium) {
      showToast(Boolean(i18n.language?.startsWith('en')) ? 'Cannot open settings, please select an aquarium first.' : '暂时无法打开设置，请先选择一个鱼缸。', 'error');
      return;
    }
    setSettingsForm(activeAquarium);
    setIsPlantListExpanded(panel === 'plants');
    setIsScapeListExpanded(panel === 'substrate');
    setActiveSettingsPanel(panel);
    setIsSettingsOpen(true);
  };

  const openSettingsPanel = (panel: NonNullable<typeof activeSettingsPanel>) => {
    const nextPanel = activeSettingsPanel === panel ? null : panel;
    setActiveSettingsPanel(nextPanel);
    if (panel === 'plants') setIsPlantListExpanded(true);
    if (panel === 'substrate') setIsScapeListExpanded(true);
    if (!nextPanel) return;
    window.setTimeout(() => {
      const body = settingsBodyRef.current;
      const target = settingPanelRefs.current[panel];
      if (!body || !target) return;
      body.scrollTo({ top: Math.max(0, target.offsetTop - 10), behavior: 'smooth' });
    }, 80);
  };

  useEffect(() => {
    if (!isSettingsOpen || !activeSettingsPanel) return;
    window.setTimeout(() => {
      const body = settingsBodyRef.current;
      const target = settingPanelRefs.current[activeSettingsPanel];
      if (!body || !target) return;
      body.scrollTo({ top: Math.max(0, target.offsetTop - 10), behavior: 'smooth' });
    }, 140);
  }, [activeSettingsPanel, isSettingsOpen]);

  const handleExportLocalData = () => {
    setLocalDataText(exportLocalAppState());
    setLocalDataMessage(Boolean(i18n.language?.startsWith('en')) ? 'Local data generated, copy to save.' : '已生成本地数据，可复制保存。');
  };

  const handleImportLocalData = () => {
    try {
      importLocalAppState(localDataText);
      setLocalDataMessage(Boolean(i18n.language?.startsWith('en')) ? 'Import successful, reloading...' : '导入成功，正在重新加载。');
      window.setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      setLocalDataMessage(error instanceof Error ? error.message : (Boolean(i18n.language?.startsWith('en')) ? 'Import failed, please check JSON format.' : '导入失败，请检查 JSON 格式。'));
    }
  };

  const handleClearLocalData = () => {
    const confirmed = window.confirm(Boolean(i18n.language?.startsWith('en')) ? 'Are you sure you want to clear local data? Tank, stocking, diagnosis, and logs cannot be recovered.' : '确认清除本地数据吗？清除后鱼缸、种草、诊断和记录都不会恢复。');
    if (!confirmed) return;
    clearLocalAppState();
    setLocalDataMessage(Boolean(i18n.language?.startsWith('en')) ? 'Local data cleared. Returning to the empty aquarium state...' : '已清除本地数据，正在返回空鱼缸状态。');
    window.setTimeout(() => window.location.reload(), 300);
  };

  const activeAquarium = aquariums.find(a => a.id === activeId);

  useEffect(() => {
    const params = new URLSearchParams(routeLocation.search);
    const requestedTankId = params.get('tank');
    if (requestedTankId && aquariums.some(aquarium => aquarium.id === requestedTankId) && requestedTankId !== activeId) {
      setActiveId(requestedTankId);
    }
    const action = params.get('action');
    const additionAction = action === 'record-existing' || action === 'plan-species' || action === 'add-species';
    if (!additionAction) {
      handledAddSpeciesRequestRef.current = '';
      return;
    }
    if (!activeAquarium) return;
    const intent: SpeciesAdditionIntent = action === 'record-existing' ? 'record_existing' : 'planned_addition';
    const speciesId = params.get('species') || '';
    const requestKey = `${activeAquarium.id}:${intent}:${speciesId}`;
    if (handledAddSpeciesRequestRef.current === requestKey) return;
    handledAddSpeciesRequestRef.current = requestKey;
    if (!speciesId) {
      openSpeciesAddition(intent);
      routeNavigate('/aquarium', { replace: true });
      return;
    }
    const fish = fishData.find(item => item.id === speciesId);
    if (!fish) {
      showToast(Boolean(i18n.language?.startsWith('en')) ? 'No corresponding species found for this memorial' : '没有找到这条生命纪念对应的物种', 'error');
      routeNavigate('/aquarium', { replace: true });
      return;
    }
    openSpeciesAddition(intent, fish.id);
    showToast(intent === 'record_existing'
      ? (isEn ? `Pre-selected "${fish.name}". It will be saved before risk guidance.` : `已预选“${fish.name}”，会先保存现实记录，再显示风险提示`)
      : (isEn ? `Pre-selected "${fish.name}". It will be assessed before recording.` : `已预选“${fish.name}”，会先完成规划判断，不会直接写入鱼缸`));
    routeNavigate('/aquarium', { replace: true });
  }, [activeAquarium, activeId, aquariums, routeLocation.search, routeNavigate, showToast]);

  useEffect(() => {
    if (typeof window === 'undefined' || !activeAquarium) return;
    if (window.location.hash === '#local-data') {
      openLocalDataManager();
      return;
    }
    const settingsPanel = window.location.hash.match(/^#settings-(size|parameters|equipment)$/)?.[1];
    if (settingsPanel) openAquariumSettings(settingsPanel as 'size' | 'parameters' | 'equipment');
  }, [activeAquarium?.id]);
  const diagnosisAquarium = aquariums.find(a => a.id === (diagnosisAquariumId || activeId)) || activeAquarium;
  const pendingDeleteAquarium = aquariums.find(a => a.id === pendingDeleteAquariumId);

  useEffect(() => {
    if (!activeId) return;
    patchLocalAppState({ currentAquariumId: activeId }, { debounce: true });
  }, [activeId]);

  useEffect(() => {
    if (aquariums.length === 0) return;
    publishAquariumNavigation({ aquariums, currentAquariumId: activeId });
  }, [activeId, aquariums]);

  useEffect(() => {
    if (!activeId) return;
    setDiagnosisAquariumId(prev => prev || activeId);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    setFedToday(feedingRecords.some(record => record.aquariumId === activeId && record.createdAt.startsWith(today)));
  }, [activeId, feedingRecords]);

  type TankRiskItem = {
    group: '容量风险' | '水质参数冲突' | '混养风险' | '信息不足';
    severity: 'info' | 'warning' | 'danger';
    title: string;
    detail: string;
    nextStep: string;
    subjects: Array<{ id: string; name: string; quantity: number }>;
    actionSteps: string[];
    avoidActions: string[];
    primaryAction: 'open_roster' | 'open_settings';
    primaryLabel: string;
  };

  // --- COMPATIBILITY LOGIC ---
  const getTankRiskItems = (aquarium: Aquarium | undefined): TankRiskItem[] => {
    if (!aquarium || aquarium.fishes.length === 0) return [];
    const risks: TankRiskItem[] = [];
    
    const curFishes = aquarium.fishes.map(aqf => fishData.find(f => f.id === aqf.fishId)).filter(f => f !== undefined) as Fish[];
    const stockedItems = aquarium.fishes
      .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))
      .filter(item => item.fish) as { aqFish: AquariumFish; fish: Fish }[];
    const animalItems = stockedItems.filter(({ fish }) => {
      const lifeType = getLifeType(fish);
      return lifeType !== 'plant' && lifeType !== 'hardscape';
    });

    // 1. Temperament
    const hasAggressive = curFishes.some(f => f.temperament === 'Aggressive');
    const hasPeaceful = curFishes.some(f => f.temperament === 'Peaceful');
    const hasSmall = curFishes.some(f => f.size === 'Small');
    const hasLarge = curFishes.some(f => f.size === 'Large');

    const isEn = i18n.language?.startsWith('en');
    if (hasAggressive && hasPeaceful) {
      const aggressiveItems = animalItems.filter(({ fish }) => fish.temperament === 'Aggressive');
      const aggressiveNames = aggressiveItems.map(({ fish }) => fish.name).slice(0, 3).join(isEn ? ', ' : '、');
      risks.push({
        group: isEn ? '混养风险' : '混养风险', // Keep internal key matching if needed, or map display
        severity: 'danger',
        title: isEn ? 'Aggressive & Peaceful Species Mixed' : '攻击性和温和生物同缸',
        detail: isEn 
          ? `${aggressiveNames || 'Aggressive species'} housed with peaceful small species carries a high risk of nipping, chasing, or predation.`
          : `${aggressiveNames || '攻击性生物'} 与温和小型生物同缸，发生撕咬、追逐或吞食的风险较高。`,
        nextStep: isEn ? 'Prioritize removing aggressive species or setup a separate theme tank.' : '优先移除攻击性生物，或单独规划主题缸。',
        subjects: aggressiveItems.map(({ fish, aqFish }) => ({ id: fish.id, name: fish.name, quantity: aqFish.quantity })),
        actionSteps: ['先暂停继续加鱼，并观察是否正在追咬或堵住食物。', `为 ${aggressiveNames || '攻击性生物'} 准备已循环的独立缸、隔离区或可靠接收人。`, '现实中完成转移后，再在缸内物种中更新移出数量。'],
        avoidActions: ['不要直接放生', '不要为压制攻击行为盲目加药', '不要在未循环的小容器里长期隔离'],
        primaryAction: 'open_roster',
        primaryLabel: '选择需要移出的生物',
      });
    }
    if (hasLarge && hasSmall && !hasAggressive) { // if aggressive already marked, avoid spam
      const largeItems = animalItems.filter(({ fish }) => fish.size === 'Large');
      risks.push({
        group: isEn ? '混养风险' : '混养风险',
        severity: 'danger',
        title: isEn ? 'Extremely Large Size Difference' : '体型差异过大',
        detail: isEn
          ? 'Large and small species co-exist; small fish or shrimp may be chased, outcompeted, or eaten.'
          : '当前同时存在大型和小型生物，小型鱼虾可能被追逐、抢食或吞食。',
        nextStep: isEn ? 'Reduce large fish or build a separate tank for small species.' : '减少大型鱼，或为小型生物单独开缸。',
        subjects: largeItems.map(({ fish, aqFish }) => ({ id: fish.id, name: fish.name, quantity: aqFish.quantity })),
        actionSteps: ['先确认小型鱼虾有没有躲藏、拒食或被追赶。', '为大型鱼或小型生物准备尺寸合适且已循环的接收缸。', '完成转移后更新缸内数量，并连续观察 3 天。'],
        avoidActions: ['不要仅靠增加躲避物维持明显捕食组合', '不要把小型生物临时放进未循环容器', '不要放生'],
        primaryAction: 'open_roster',
        primaryLabel: '调整缸内数量',
      });
    }

    // 2. Water Type. pH is intentionally excluded here: without a measured
    // value, species reference ranges must not create a second blocking rule.
    const waterTypes = new Set(curFishes.map(f => f.category === '海水鱼' ? 'Saltwater' : 'Freshwater'));
    if (waterTypes.size > 1) {
      const waterConflictSubjects = animalItems.map(({ fish, aqFish }) => ({ id: fish.id, name: fish.name, quantity: aqFish.quantity }));
      risks.push({
        group: isEn ? '水质参数冲突' : '水质参数冲突',
        severity: 'danger',
        title: isEn ? 'Water Type Conflict' : '水体类型冲突',
        detail: isEn ? 'Both saltwater and freshwater species are present; water conditions cannot satisfy both.' : '当前同时存在海水与淡水生物，水体类型无法同时满足。',
        nextStep: isEn ? 'Separate saltwater and freshwater species into different tanks.' : '把海水生物和淡水生物分缸管理。',
        subjects: waterConflictSubjects,
        actionSteps: ['立即停止继续加入生物，不要尝试用同一水体折中。', '按淡水与海水需求准备两个稳定、已循环的环境。', '完成转移后更新缸内记录，再分别观察呼吸和活动状态。'],
        avoidActions: ['不要把盐度快速来回调整', '不要让淡水与海水生物长期共用同一水体', '不要放生'],
        primaryAction: 'open_roster',
        primaryLabel: '选择需要分缸的生物',
      });
    }

    // 4. Tank volume / stocking density
    const tankLiters = getTankVolumeLiters(aquarium);
    if (tankLiters > 0 && animalItems.length > 0) {
      const minRequiredLiters = Math.max(...animalItems.map(({ fish }) => parseLiters(fish.tankSize, 30)));
      const bioLoadLiters = animalItems.reduce((sum, { aqFish, fish }) => {
        return sum + getBioLoadLiters(fish) * Math.max(aqFish.quantity || 1, 1);
      }, 0);
      const totalQuantity = animalItems.reduce((sum, { aqFish }) => sum + Math.max(aqFish.quantity || 1, 1), 0);
      const loadSources = animalItems
        .map(({ aqFish, fish }) => ({
          id: fish.id,
          name: fish.name,
          load: getBioLoadLiters(fish) * Math.max(aqFish.quantity || 1, 1),
          unitLoad: getBioLoadLiters(fish),
          quantity: Math.max(aqFish.quantity || 1, 1),
        }))
        .sort((a, b) => b.load - a.load);
      const loadSourceLabel = loadSources.slice(0, 3).map(item => `${item.name}×${item.quantity}`).join('、');

      if (tankLiters < minRequiredLiters) {
        risks.push({
          group: '容量风险',
          severity: 'warning',
          title: '空间需求偏紧',
          detail: `鱼缸有效水体约 ${tankLiters}L，小于当前动物最低建议缸容 ${Math.round(minRequiredLiters)}L。`,
          nextStep: '优先减少空间需求最高的生物，或升级缸体。',
          subjects: loadSources.slice(0, 3).map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
          actionSteps: ['先暂停添加新生物，并确认是否已有追咬、拒食或活动受限。', `优先为 ${loadSources[0]?.name || '空间需求最高的生物'} 准备更大的已循环鱼缸或可靠接收人。`, '转移完成后更新数量，并重新运行混养判断。'],
          avoidActions: ['不要只靠增加过滤解决活动空间不足', '不要长期使用过小隔离盒代替鱼缸', '不要放生'],
          primaryAction: 'open_roster',
          primaryLabel: '查看空间需求最高的生物',
        });
      }
      if (bioLoadLiters > tankLiters) {
        const primarySource = loadSources[0];
        const excessLoad = bioLoadLiters - tankLiters;
        const suggestedRemoval = primarySource
          ? Math.min(primarySource.quantity, Math.max(1, Math.ceil(excessLoad / Math.max(primarySource.unitLoad, 1))))
          : 1;
        risks.push({
          group: '容量风险',
          severity: 'danger',
          title: '动物负载超过当前水体',
          detail: `当前约 ${totalQuantity} 只/条动物，估算动物负载需要约 ${Math.round(bioLoadLiters)}L，当前有效水体 ${tankLiters}L。主要负载来源：${loadSourceLabel || '当前动物记录'}。`,
          nextStep: '先减少数量最多或负载最高的动物，再加强过滤和换水。',
          subjects: loadSources.slice(0, 3).map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
          actionSteps: [`先停止加鱼和过量喂食，检查是否浮头、浑浊或异味。`, `建议优先为 ${primarySource?.name || '负载最高的生物'} 转移约 ${suggestedRemoval} 只/条，接收环境需已循环。`, '转移后分次换水并观察 3 天，再决定是否继续调整。'],
          avoidActions: ['不要一次性全换水', '不要只增加过滤后继续加鱼', '不要把生物放生'],
          primaryAction: 'open_roster',
          primaryLabel: `调整 ${primarySource?.name || '缸内生物'} 数量`,
        });
      } else if (bioLoadLiters > tankLiters * 0.75) {
        risks.push({
          group: '容量风险',
          severity: 'warning',
          title: '动物负载接近上限',
          detail: `当前约 ${totalQuantity} 只/条动物，估算动物负载需要约 ${Math.round(bioLoadLiters)}L，鱼缸有效水体约 ${tankLiters}L。`,
          nextStep: '暂缓继续加生物，观察氨氮、亚硝酸盐和溶氧。',
          subjects: loadSources.slice(0, 3).map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
          actionSteps: ['暂停继续添加生物和过量喂食。', '连续 3 天观察浮头、异味、浑浊和食欲。', '若出现异常，先执行增氧和分次换水，再考虑转移高负载生物。'],
          avoidActions: ['不要因暂时正常就继续加鱼', '不要一次性清洗全部滤材', '不要盲目加药'],
          primaryAction: 'open_roster',
          primaryLabel: '查看当前负载来源',
        });
      }
    }

    const severityRank = { danger: 0, warning: 1, info: 2 } as const;
    return risks.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  };

  const tankRiskItems = getTankRiskItems(activeAquarium);
  const conflicts = tankRiskItems.filter(item => item.severity !== 'info').map(item => `${item.title}：${item.detail}`);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [activeTankRiskIndex, setActiveTankRiskIndex] = useState(0);
  const activeTankRisk = tankRiskItems[Math.min(activeTankRiskIndex, Math.max(tankRiskItems.length - 1, 0))];

  const handleRenameSubmit = async () => {
    if (!activeAquarium || !editNameValue.trim()) {
      setIsEditingName(false);
      return;
    }
    const nextName = editNameValue.trim();
    if (nextName === activeAquarium.name) {
      setIsEditingName(false);
      return;
    }
    setIsRenamingName(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium({ ...activeAquarium, name: nextName });
      setAquariums(current => current.map(aquarium => aquarium.id === activeId ? savedAquarium : aquarium));
      await persistCareTimelineEvent({
        aquariumId: savedAquarium.id,
        eventType: 'settings_updated',
        title: isEn ? 'Renamed aquarium' : '重命名鱼缸',
        label: isEn ? `Renamed to ${savedAquarium.name}` : `已改为“${savedAquarium.name}”`,
        payload: {},
        occurredAt: new Date().toISOString(),
        sourceType: 'aquarium_rename',
        sourceId: `${savedAquarium.id}:${Date.now()}`,
        isInferred: false,
      });
      setIsEditingName(false);
      showToast(`鱼缸已重命名为“${savedAquarium.name}”`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '鱼缸名称没有保存成功，请重试。', 'error');
    } finally {
      setIsRenamingName(false);
    }
  };

  const normalizeSelectedAddFishItems = () => selectedAddFishItems
      .filter(item => fishData.some(fish => fish.id === item.fishId))
      .map(item => ({
        ...item,
        quantity: Math.max(1, item.quantity || 1),
        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
      }));

  const openSpeciesAddition = (intent: SpeciesAdditionIntent, speciesId?: string) => {
    const selectedFish = speciesId ? fishData.find(item => item.id === speciesId) : undefined;
    setAdditionIntent(intent);
    addFishOperationIdRef.current = `livestock-add:${crypto.randomUUID()}`;
    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setSelectedAddFishItems(selectedFish
      ? [{ fishId: selectedFish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd') }]
      : []);
    setIsAddFishOpen(true);
  };

  const buildAddFishCompatibilityReview = (items: SelectedAddFishItem[]) => (
    activeAquarium
      ? reviewSpeciesAdditions({ aquarium: activeAquarium, items, speciesCatalog: fishData })
      : null
  );

  const recordAddedSpeciesBatches = async (before: Aquarium, after: Aquarium) => {
    const previousBatchIds = new Set(before.fishes.flatMap(record => record.batches?.map(batch => batch.id) || [record.id]));
    const operations: Array<Promise<CareTimelineRecord>> = [];
    after.fishes.forEach(record => {
      const speciesName = fishData.find(item => item.id === record.fishId)?.name || '缸内生物';
      (record.batches || []).filter(batch => !previousBatchIds.has(batch.id)).forEach(batch => {
        operations.push(persistCareTimelineEvent({
          aquariumId: after.id,
          eventType: 'species_added',
          title: isEn ? `Added ${speciesName}` : `加入${speciesName}`,
          label: isEn ? `${batch.quantity} animals` : `${batch.quantity} 只/条`,
          payload: { speciesId: record.fishId, quantity: batch.quantity },
          occurredAt: batch.entryDate,
          sourceType: 'livestock_batch',
          sourceId: batch.id,
          isInferred: false,
        }));
      });
    });
    await Promise.all(operations);
  };

  const recordSelectedFishItems = async (normalizedItems: SpeciesAdditionItem[]) => {
    if (!activeAquarium || normalizedItems.length === 0 || isAddFishSaving) return false;
    setIsAddFishSaving(true);
    if (!addFishOperationIdRef.current) addFishOperationIdRef.current = `livestock-add:${crypto.randomUUID()}`;
    const before = activeAquarium;
    try {
      const repository = await getCurrentAquaGuideRepository();
      const result = await recordExistingLivestock({
        repository,
        aquarium: before,
        items: normalizedItems,
        speciesCatalog: fishData,
        operationId: addFishOperationIdRef.current,
      });
      setAquariums(current => current.map(aquarium => aquarium.id === result.aquarium.id ? result.aquarium : aquarium));
      try {
        await recordAddedSpeciesBatches(before, result.aquarium);
      } catch (error) {
        showToast(error instanceof Error ? error.message : '入缸时间线没有保存成功。', 'error');
      }
      const successItems = result.savedItems.map(item => {
        const fish = fishData.find(candidate => candidate.id === item.fishId);
        return {
          fishId: item.fishId,
          name: fish?.name || '生物',
          image: fish ? getSpeciesDisplayImage(fish) : '',
          quantity: item.quantity,
          entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
        };
      });
      setAddFishCompatibilityReview(null);
      setAddFishSuccess({ aquariumName: result.aquarium.name, items: successItems, result });
      if (result.failedItems.length === 0) addFishOperationIdRef.current = '';
      setSelectedAddFishItems(result.failedItems.map(item => ({
        fishId: item.fishId,
        quantity: item.quantity,
        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
      })));
      setFishSearchTerm('');
      setAddFishDatePicker(null);
      showToast(result.failedItems.length > 0
        ? `已记录 ${result.savedItems.length} 项，${result.failedItems.length} 项需要重试`
        : (isEn ? 'Livestock recorded. Risk guidance is ready.' : '已记录缸内生物，并生成风险提示'));
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : (isEn ? 'Livestock was not recorded.' : '缸内生物没有保存成功。'), 'error');
      return false;
    } finally {
      setIsAddFishSaving(false);
    }
  };

  const handleAddFish = async () => {
    if (!activeAquarium) {
      setTankActionMessage(Boolean(i18n.language?.startsWith('en')) ? 'Please select an aquarium first.' : '请先选择当前鱼缸。');
      return;
    }
    if (selectedAddFishItems.length === 0) return;

    const normalizedItems = normalizeSelectedAddFishItems();
    if (normalizedItems.length === 0) return;

    if (additionIntent === 'record_existing') {
      await recordSelectedFishItems(normalizedItems);
      return;
    }
    const review = buildAddFishCompatibilityReview(normalizedItems);
    if (!review) {
      showToast(isEn ? 'Could not assess this plan.' : '暂时无法判断这个规划，请检查选择后重试。', 'error');
      return;
    }
    setAddFishCompatibilityReview(review);
  };

  const handleConfirmAddFishAfterReview = async () => {
    if (!addFishCompatibilityReview) return;
    const addPolicy = getTankCompatibilityAddPolicy(addFishCompatibilityReview.status);
    if (addPolicy === 'block') {
      setTankActionMessage(Boolean(i18n.language?.startsWith('en')) ? 'Current stocking mix is not recommended, please adjust.' : '当前组合不建议加入，请先返回调整。');
      return;
    }
    if (addPolicy === 'complete_information') {
      const missingCodes = addFishCompatibilityReview.keyRules.map(rule => rule.code);
      const settingsPanel = missingCodes.some(code => /volume|size|tank/.test(code))
        ? 'size'
        : missingCodes.some(code => /filter|heater|equipment/.test(code))
          ? 'equipment'
          : 'parameters';
      setIsAddFishOpen(false);
      setAddFishCompatibilityReview(null);
      openAquariumSettings(settingsPanel);
      setTankActionMessage(Boolean(i18n.language?.startsWith('en')) ? 'Please fill in aquarium details before evaluating.' : '请先补充鱼缸信息，再评估是否可以加入。');
      return;
    }
    await recordSelectedFishItems(addFishCompatibilityReview.items);
  };

  const handleRecordExistingFromPlan = async () => {
    const items = addFishCompatibilityReview?.items || normalizeSelectedAddFishItems();
    setAdditionIntent('record_existing');
    await recordSelectedFishItems(items);
  };

  const handleAddCompatibilitySpeciesToTank = async (items: { fishId: string; quantity: number }[]) => {
    if (!activeAquarium) {
      throw new Error(Boolean(i18n.language?.startsWith('en')) ? 'Please select an aquarium first.' : '请先选择当前鱼缸。');
    }

    const entryDate = format(new Date(), 'yyyy-MM-dd');
    const normalizedItems = items
      .filter(item => fishData.some(fish => fish.id === item.fishId))
      .map(item => ({
        fishId: item.fishId,
        quantity: Math.max(1, item.quantity || 1),
        entryDate,
      }));

    if (normalizedItems.length === 0) {
      throw new Error(Boolean(i18n.language?.startsWith('en')) ? 'No species to add to the active aquarium.' : '没有可加入当前鱼缸的生物。');
    }

    const review = reviewSpeciesAdditions({ aquarium: activeAquarium, items: normalizedItems, speciesCatalog: fishData });
    const addPolicy = review ? getTankCompatibilityAddPolicy(review.status) : null;
    if (!review || addPolicy === 'block' || addPolicy === 'complete_information') {
      throw new Error(addPolicy === 'complete_information'
        ? (Boolean(i18n.language?.startsWith('en')) ? 'Please complete aquarium details before adding.' : '请先补充鱼缸信息后再添加。')
        : addPolicy === 'block'
          ? (Boolean(i18n.language?.startsWith('en')) ? 'Stocking mix is not recommended for this aquarium.' : '当前组合不建议加入鱼缸。')
          : (Boolean(i18n.language?.startsWith('en')) ? 'Could not assess this addition.' : '暂时无法评估这次加入。'));
    }
    const operationKey = `${activeAquarium.id}:${normalizedItems
      .map(item => `${item.fishId}:${item.quantity}`)
      .sort()
      .join('|')}`;
    if (compatibilityRecordOperationRef.current.key !== operationKey) {
      compatibilityRecordOperationRef.current = {
        key: operationKey,
        id: `compatibility-add:${crypto.randomUUID()}`,
      };
    }
    const repository = await getCurrentAquaGuideRepository();
    const result = await recordExistingLivestock({
      repository,
      aquarium: activeAquarium,
      items: normalizedItems,
      speciesCatalog: fishData,
      operationId: compatibilityRecordOperationRef.current.id,
    });
    setAquariums(current => current.map(aquarium => aquarium.id === result.aquarium.id ? result.aquarium : aquarium));
    await recordAddedSpeciesBatches(activeAquarium, result.aquarium);
    if (result.failedItems.length > 0) {
      const failedNames = result.failedItems
        .map(item => fishData.find(fish => fish.id === item.fishId)?.name || item.fishId)
        .join('、');
      throw new Error(Boolean(i18n.language?.startsWith('en'))
        ? `${result.savedItems.length} species were recorded; ${result.failedItems.length} still need retrying.`
        : `已记录 ${result.savedItems.length} 种；${failedNames || `${result.failedItems.length} 种生物`}尚未记录，请重试。`);
    }
    compatibilityRecordOperationRef.current = { key: '', id: '' };
    const addedNames = normalizedItems
      .map(item => fishData.find(fish => fish.id === item.fishId)?.name)
      .filter(Boolean)
      .join('、');
    const message = Boolean(i18n.language?.startsWith('en')) ? `Added ${normalizedItems.length} species to active aquarium${addedNames ? `: ${addedNames}` : ''}.` : `已加入 ${normalizedItems.length} 种生物到当前鱼缸${addedNames ? `：${addedNames}` : ''}。`;
    setTankActionMessage(message);
    return { message };
  };

  const handlePostRecordPrimaryAction = () => {
    const status = addFishSuccess?.result.assessment?.status;
    setIsAddFishOpen(false);
    setAddFishSuccess(null);
    if (status === 'insufficient_data') {
      const hasDimensions = Boolean(activeAquarium?.dimensions?.length && activeAquarium.dimensions.width && activeAquarium.dimensions.height);
      openAquariumSettings(hasDimensions ? 'parameters' : 'size');
      return;
    }
    if (status === 'not_recommended') {
      setIsConflictDialogOpen(true);
      return;
    }
    openTankArchive();
  };

  const handleContinueAddFish = () => {
    addFishOperationIdRef.current = `livestock-add:${crypto.randomUUID()}`;
    setAddFishSuccess(null);
    setFishSearchTerm('');
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
  };

  const handleUpdateEntryDate = (fishId: string, newDate: string) => {
    if (!activeAquarium) return;
    const updated = aquariums.map(a => 
      a.id === activeId ? {
        ...a,
        fishes: a.fishes.map(f => f.id === fishId ? { ...f, entryDate: new Date(newDate).toISOString() } : f)
      } : a
    );
    saveAquariums(updated);
    if (selectedAqFish && selectedAqFish.aqFish.id === fishId) {
      setSelectedAqFish({ ...selectedAqFish, aqFish: { ...selectedAqFish.aqFish, entryDate: new Date(newDate).toISOString() } });
    }
  };

  const handleUpdateQuantity = (fishId: string, newQty: number) => {
    if (!activeAquarium || newQty < 1) return;
    const updated = aquariums.map(a => 
      a.id === activeId ? {
        ...a,
        fishes: a.fishes.map(f => f.id === fishId ? { ...f, quantity: newQty } : f)
      } : a
    );
    saveAquariums(updated);
    if (selectedAqFish && selectedAqFish.aqFish.id === fishId) {
      setSelectedAqFish({ ...selectedAqFish, aqFish: { ...selectedAqFish.aqFish, quantity: newQty } });
    }
  };

  const handleTankWaterChange = async () => {
    if (!activeAquarium) return;
    const now = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = activeAquarium.waterChangeHistory || [];
    const hasTodayRecord = history.includes(todayStr);
    const newHistory = hasTodayRecord ? history.filter(date => date !== todayStr) : [...history, todayStr];
    const previousChangeDate = newHistory.length > 0
      ? new Date(newHistory[newHistory.length - 1]).toISOString()
      : activeAquarium.lastWaterChangeDate;

    const updated = aquariums.map(a => 
      a.id === activeId ? { 
        ...a, 
        lastWaterChangeDate: hasTodayRecord ? previousChangeDate : now,
        waterChangeHistory: newHistory,
        fishes: a.fishes.map(f => ({ ...f, lastWaterChangeDate: hasTodayRecord ? (previousChangeDate || f.lastWaterChangeDate) : now }))
      } : a
    );
    saveAquariums(updated);
    if (hasTodayRecord) {
      await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
      await persistCareTimelineEvent({
        aquariumId: activeAquarium.id,
        eventType: 'water_change',
        title: isEn ? 'Undid today\'s water-change record' : '撤回今日换水记录',
        payload: { reversed: true },
        occurredAt: now,
        sourceType: 'water_change_reversal',
        sourceId: todayStr,
        isInferred: false,
      });
    } else {
      await persistCareTimelineEvent({
        aquariumId: activeAquarium.id,
        eventType: 'water_change',
        title: isEn ? 'Logged water change' : '记录换水',
        payload: {},
        occurredAt: now,
        sourceType: 'water_change_day',
        sourceId: todayStr,
        isInferred: false,
      });
    }
    setTankActionMessage(hasTodayRecord ? (Boolean(i18n.language?.startsWith('en')) ? 'Recalled today\'s water change record' : '已撤回今日换水记录') : (Boolean(i18n.language?.startsWith('en')) ? `Logged water change: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` : `已记录换水：${format(new Date(), 'yyyy-MM-dd HH:mm')}`));
  };

  const handleDailyActionPrimary = () => {
    const task = dailyActionViewModel.task;
    if (task.actionType === 'urgent_recovery') {
      if (todayDailyCheckRecord) {
        setSelectedDiagnosisRecord(todayDailyCheckRecord);
        setDiagnosisMode('history');
        setIsDiagnosisOpen(true);
      } else {
        handleOpenDailyCheck();
      }
      return;
    }
    if (task.actionType === 'compatibility_review') {
      setIsConflictDialogOpen(true);
      return;
    }
    if (task.actionType === 'care_plan') {
      const reminder = activeCareReminders.find(item => item.id === task.targetId);
      if (reminder) navigateToRoute(`/care?topic=${encodeURIComponent(reminder.sourceTopicId)}`);
      else showToast(Boolean(i18n.language?.startsWith('en')) ? 'This care task has been updated, please view latest tasks.' : '这条养护计划已经更新，请查看最新任务。', 'error');
      return;
    }
    if (task.actionType === 'water_change') {
      void handleTankWaterChange().catch(error => showToast(error instanceof Error ? error.message : '换水记录没有保存成功。', 'error'));
      return;
    }
    if (task.actionType === 'daily_check') {
      handleOpenDailyCheck(batchCareSignal);
      return;
    }
    if (task.actionType === 'life_stage_observation') {
      setIsTankArchiveExpanded(true);
    }
  };

  const handleApplyBuildTemplate = (adaptedPlan: AdaptedBuildPlan) => {
    if (!activeAquarium) return;
    if (!adaptedPlan.canApply) {
      setTankActionMessage(Boolean(i18n.language?.startsWith('en')) ? 'Active aquarium size is smaller than the minimum setup requirement.' : '当前鱼缸低于该方案最低要求，无法直接应用。');
      return;
    }
    const template = adaptedPlan.template;
    const entryDate = format(new Date(), 'yyyy-MM-dd');
    const templateFish = adaptedPlan.appliedSpecies
      .map(item => ({ name: item.name, quantity: item.quantity, fish: item.fish || findStockSpeciesByName(item.name) }))
      .filter((item): item is { name: string; quantity: number; fish: Fish } => Boolean(item.fish));
    setIsBuildPlanOpen(false);
    if (templateFish.length === 0) {
      setTankActionMessage(isEn
        ? `"${template.name}" remains a reference plan. No livestock was recorded.`
        : `「${template.name}」仅作为参考方案，当前没有可进入混养判断的生物。`);
      return;
    }
    setAdditionIntent('planned_addition');
    addFishOperationIdRef.current = `livestock-add:${crypto.randomUUID()}`;
    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setSelectedAddFishItems(templateFish.map(({ fish, quantity }) => ({ fishId: fish.id, quantity, entryDate })));
    setIsAddFishOpen(true);
    setTankActionMessage(isEn
      ? `Reviewing livestock planned in "${template.name}". The environment and livestock have not been written to the aquarium.`
      : `正在评估「${template.name}」里的规划生物；环境和生物都尚未写入真实鱼缸。`);
  };

  const handleToggleWaterChangeDate = (dateStr: string) => {
    if (!activeAquarium) return;
    const history = activeAquarium.waterChangeHistory || [];
    let newHistory;
    if (history.includes(dateStr)) {
      newHistory = history.filter(d => d !== dateStr);
    } else {
      newHistory = [...history, dateStr];
    }
    newHistory.sort();
    
    // Update lastWaterChangeDate if needed
    let newLastDate = activeAquarium.lastWaterChangeDate;
    if (newHistory.length > 0) {
      const latest = newHistory[newHistory.length - 1];
      newLastDate = new Date(latest).toISOString();
    } else {
      newLastDate = new Date().toISOString(); // fallback
    }

    const updated = aquariums.map(a => 
      a.id === activeId ? { 
        ...a, 
        waterChangeHistory: newHistory,
        lastWaterChangeDate: newLastDate
      } : a
    );
    saveAquariums(updated);
  };

  const getConflicts = (_fishes: AquariumFish[]): string[] => {
    return tankRiskItems.filter(item => item.severity !== 'info').map(item => `${item.title}：${item.detail}`);
  };

  const openSmartRecommendation = (
    mode: RecommendationMode = activeAquarium.fishes.length > 0 ? 'existing_livestock' : 'empty_tank',
    candidateIds: string[] | null = null,
  ) => {
    setSmartRecommendMode(mode);
    setSmartCandidateScopeIds(candidateIds);
    setSmartSimulation(null);
    setSmartAddQuantity(1);
    setIsSmartRecommendOpen(true);
  };

  const openTankBuildCopilot = () => {
    setTankCopilotError('');
    setTankCopilotResult(null);
    setTankCopilotAnswers({});
    setTankCopilotGoal(prev => prev || (activeAquarium.fishes.length > 0 ? (Boolean(i18n.language?.startsWith('en')) ? 'Plan safe additions based on active tank' : '基于当前鱼缸规划下一步安全搭配') : (Boolean(i18n.language?.startsWith('en')) ? 'Beginner small freshwater tank' : '新手小型淡水缸')));
    setIsTankCopilotOpen(true);
  };

  const handleTankCopilotGenerate = async (goalOverride?: string, answerOverride?: Record<string, string>) => {
    const nextGoal = (goalOverride ?? tankCopilotGoal).trim();
    if (!nextGoal) {
      setTankCopilotError('先写一句目标，例如“新手小型淡水缸”。');
      return;
    }

    const nextAnswers = answerOverride ?? (goalOverride ? {} : tankCopilotAnswers);

    setTankCopilotGoal(nextGoal);
    if (goalOverride) setTankCopilotAnswers({});
    setTankCopilotError('');
    setIsTankCopilotLoading(true);
    try {
      const context = buildTankCopilotContext({
        aquarium: activeAquarium,
        userGoal: nextGoal,
        answers: nextAnswers,
        smartRecommendation,
      });
      const result = await generateTankBuildCopilot(context);
      setTankCopilotResult(result);
      setTankCopilotError('');
    } catch {
      setTankCopilotError(isEn ? 'AI Tank Copilot is temporarily unavailable, please try again later.' : 'AI 建缸助手暂时不可用，请稍后重试。');
    } finally {
      setIsTankCopilotLoading(false);
    }
  };

  const handleTankCopilotNextAction = () => {
    if (!tankCopilotResult) {
      void handleTankCopilotGenerate();
      return;
    }

    const nextAction = tankCopilotResult.recommendedActions[0];

    if (nextAction?.type === 'complete_tank_info') {
      const missingInfo = getTankCopilotMissingInfo(activeAquarium);
      const targetPanel = getSettingsPanelForMissingInfo([
        ...missingInfo,
        ...tankCopilotMissingQuestions.map(question => question.prompt),
      ]);
      setIsTankCopilotOpen(false);
      openAquariumSettings(targetPanel);
      return;
    }

    if (nextAction?.type === 'view_safe_candidates') {
      if (tankCopilotAllowedCandidates.length === 0) {
        setTankCopilotResult(null);
        setTankCopilotAnswers({});
        setTankCopilotError('当前本地规则没有可执行候选，请换一个目标或先完善鱼缸信息。');
        return;
      }
      setIsTankCopilotOpen(false);
      openSmartRecommendation(
        activeAquarium.fishes.length > 0 ? 'existing_livestock' : 'empty_tank',
        tankCopilotAllowedCandidates.map(candidate => candidate.speciesId),
      );
      return;
    }

    if (nextAction?.type === 'start_addition_simulation') {
      if (!tankCopilotPrimaryCandidate) {
        setTankCopilotResult(null);
        setTankCopilotAnswers({});
        setTankCopilotError('当前没有能进入模拟添加的安全候选，请重新描述目标。');
        return;
      }
      setIsTankCopilotOpen(false);
      openSmartRecommendation(
        activeAquarium.fishes.length > 0 ? 'existing_livestock' : 'empty_tank',
        tankCopilotAllowedCandidates.map(candidate => candidate.speciesId),
      );
      openSmartSimulation(tankCopilotPrimaryCandidate);
      return;
    }

    setTankCopilotResult(null);
    setTankCopilotAnswers({});
    setTankCopilotError('可以重新描述目标，生成更具体的建缸方案。');
  };

  const openSmartSimulation = (candidate: RecommendationCandidate) => {
    const simulation = recommendationService.simulateSmartAdd({
      candidate,
      quantity: candidate.recommendedQuantity,
      profile: smartRecommendation.profile,
      speciesPool: fishData,
    });
    setSmartSimulation(simulation);
    setSmartAddQuantity(candidate.recommendedQuantity);
    smartSimulationOperationRef.current = { key: '', id: '' };
  };

  const updateSmartSimulationQuantity = (quantity: number) => {
    if (!smartSimulation) return;
    const nextQuantity = Math.max(1, quantity);
    setSmartAddQuantity(nextQuantity);
    smartSimulationOperationRef.current = { key: '', id: '' };
    setSmartSimulation(recommendationService.simulateSmartAdd({
      candidate: smartSimulation.candidate,
      quantity: nextQuantity,
      profile: smartRecommendation.profile,
      speciesPool: fishData,
    }));
  };

  const confirmSmartSimulationAdd = async () => {
    if (isSmartSimulationSaving) return;
    if (!activeAquarium || !smartSimulation) {
      showToast('当前没有可确认的模拟方案。', 'error');
      return;
    }
    const species = fishData.find(item => item.id === smartSimulation.candidate.speciesId);
    if (!species) {
      showToast('候选物种资料不存在，无法加入鱼缸。', 'error');
      return;
    }
    const items = [{ fishId: species.id, quantity: smartAddQuantity, entryDate: format(new Date(), 'yyyy-MM-dd') }];
    const review = reviewSpeciesAdditions({ aquarium: activeAquarium, items, speciesCatalog: fishData });
    const policy = review ? getTankCompatibilityAddPolicy(review.status) : null;
    if (!review || policy === 'block' || policy === 'complete_information') {
      const message = policy === 'complete_information'
        ? '请先补充鱼缸信息，再确认模拟添加。'
        : policy === 'block'
          ? '规则复核后仍不建议加入该物种。'
          : '当前模拟无法写入鱼缸，请重新评估。';
      showToast(message, 'error');
      return;
    }
    setIsSmartSimulationSaving(true);
    try {
      const operationKey = `${activeAquarium.id}:${species.id}:${smartAddQuantity}`;
      if (smartSimulationOperationRef.current.key !== operationKey) {
        smartSimulationOperationRef.current = {
          key: operationKey,
          id: `smart-simulation:${crypto.randomUUID()}`,
        };
      }
      const repository = await getCurrentAquaGuideRepository();
      const result = await recordExistingLivestock({
        repository,
        aquarium: activeAquarium,
        items,
        speciesCatalog: fishData,
        operationId: smartSimulationOperationRef.current.id,
      });
      smartSimulationOperationRef.current = { key: '', id: '' };
      setAquariums(current => current.map(aquarium => aquarium.id === result.aquarium.id ? result.aquarium : aquarium));
      try {
        await recordAddedSpeciesBatches(activeAquarium, result.aquarium);
      } catch {
        showToast(Boolean(i18n.language?.startsWith('en'))
          ? 'Livestock was recorded, but the timeline will refresh later.'
          : '生物已经记录；时间线暂未更新，稍后可再查看。', 'error');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '当前模拟没有记录成功。', 'error');
      return;
    } finally {
      setIsSmartSimulationSaving(false);
    }
    setTankActionMessage(Boolean(i18n.language?.startsWith('en')) ? `Added ${species.name} x${smartAddQuantity}, recommend to observe for 3-7 days.` : `已加入 ${species.name} x${smartAddQuantity}，建议观察 3-7 天。`);
    showToast(Boolean(i18n.language?.startsWith('en')) ? `Added ${species.name} x${smartAddQuantity}` : `已加入 ${species.name} x${smartAddQuantity}`, 'success');
    setSmartSimulation(null);
    setSmartCandidateScopeIds(null);
    setIsSmartRecommendOpen(false);
  };

  const diagnosisIconMap = {
    巡检: <Activity className="h-4 w-4" />,
    换水: <Droplets className="h-4 w-4" />,
    水质异常: <Droplets className="h-4 w-4" />,
    鱼只异常: <AlertTriangle className="h-4 w-4" />,
    新鱼入缸: <Plus className="h-4 w-4" />,
    喂食问题: <Heart className="h-4 w-4" />,
    '怀孕/鱼苗': <Sparkles className="h-4 w-4" />,
    死亡处理: <Skull className="h-4 w-4" />,
    设备异常: <Settings className="h-4 w-4" />,
  };

  const diagnosisIssueTypes = diagnosisProblemTypes.map(type => ({
    ...type,
    icon: diagnosisIconMap[type.id] || <Activity className="h-4 w-4" />,
  }));

  const getDiagnosisLivestock = (aquarium: Aquarium | undefined) => (
    (aquarium?.fishes || [])
      .map(aqFish => ({ aqFish, fish: fishData.find(item => item.id === aqFish.fishId) }))
      .filter((item): item is { aqFish: AquariumFish; fish: Fish } => {
        if (!item.fish) return false;
        const lifeType = getLifeType(item.fish);
        return lifeType !== 'plant' && lifeType !== 'hardscape';
      })
  );

  const getDiagnosisTankSummary = () => {
    const targetAquarium = diagnosisAquarium;
    const stockedFishes = targetAquarium?.fishes || [];
    const currentLivestock = getDiagnosisLivestock(targetAquarium);
    const stocked = currentLivestock
      .map(({ aqFish, fish }) => `${fish.name} x${aqFish.quantity || 1} (${getSpeciesBatchContextLabel(aqFish, isEn)})`)
      .join(i18n.language === 'zh-CN' ? '、' : ', ') || t('aquarium.noLivestock');
    const latestAdded = [...stockedFishes]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0];
    const latestAddedFish = latestAdded ? fishData.find(item => item.id === latestAdded.fishId) : null;
    const latestFeeding = feedingRecords
      .filter(record => record.aquariumId === targetAquarium?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      aquariumId: targetAquarium?.id || '',
      name: targetAquarium?.name || t('aquarium.switchTank'),
      water: targetAquarium?.waterType
        ? (targetAquarium.waterType === 'Saltwater' ? t('aquarium.saltwater') : t('aquarium.freshwater'))
        : (isEn ? 'Unknown' : '未记录'),
      temperature: targetAquarium?.targetTemperature ? `${isEn ? 'Target ' : '目标 '}${targetAquarium.targetTemperature}°C` : (isEn ? 'Unknown' : '未记录'),
      volume: targetAquarium && getTankVolumeLiters(targetAquarium) > 0 ? `约 ${getTankVolumeLiters(targetAquarium)}L` : (isEn ? 'Unknown' : '未记录'),
      dimensions: targetAquarium?.dimensions
        ? `${targetAquarium.dimensions.length}×${targetAquarium.dimensions.width}×${targetAquarium.dimensions.height}cm`
        : (isEn ? 'Unknown' : '未记录'),
      stocked,
      livestockCount: currentLivestock.reduce((sum, item) => sum + (item.aqFish.quantity || 1), 0),
      waterChange: targetAquarium?.lastWaterChangeDate ? format(new Date(targetAquarium.lastWaterChangeDate), 'MM/dd') : t('aquarium.none'),
      recentFeeding: latestFeeding ? format(new Date(latestFeeding.createdAt), 'MM/dd HH:mm') : t('aquarium.none'),
      recentAddedSpecies: latestAddedFish ? `${latestAddedFish.name} · ${format(new Date(latestAdded.entryDate), 'MM/dd')}` : t('aquarium.none'),
      equipment: targetAquarium?.equipment ? [
        targetAquarium.equipment?.filter ? `${t('aquarium.filterSystem')}：${t(`aquarium.${filterOptionKeys[targetAquarium.equipment.filter] || 'none'}`)}` : '',
        typeof targetAquarium.equipment?.heater === 'boolean' ? `${t('aquarium.heater')}：${targetAquarium.equipment.heater ? t('aquarium.yes') : t('aquarium.no')}` : '',
        typeof targetAquarium.equipment?.oxygen === 'boolean' ? `${t('aquarium.oxygen')}：${targetAquarium.equipment.oxygen ? t('aquarium.yes') : t('aquarium.no')}` : '',
      ].filter(Boolean).join(' / ') : t('aquarium.none'),
      missing: [t('aquarium.missingInfoDesc')],
    };
  };

  const buildStructuredDiagnosis = (): DiagnosisResult => {
    const targetAquarium = diagnosisAquarium;
    if (!targetAquarium) {
      return {
        verdict: '请先选择一个鱼缸，再进行诊断。',
        risk: '信息不足',
        riskLevel: 'unknown',
        currentAction: '先选择鱼缸',
        keyMetrics: [],
        reasons: [],
        actions: ['先选择或创建一个鱼缸'],
        avoid: ['不要在没有鱼缸数据时判断'],
        observe: [],
        missing: ['鱼缸数据'],
        evidence: [],
      };
    }

    const currentLivestock = getDiagnosisLivestock(targetAquarium);
    const livestockNames = currentLivestock.map(({ aqFish, fish }) => `${fish.name} x${aqFish.quantity || 1}`);
    const hasShrimp = currentLivestock.some(({ fish }) => /虾|shrimp|neocaridina|caridina/i.test(`${fish.name} ${fish.scientificName}`));
    const hasPlants = (targetAquarium.plants || []).length > 0;
    const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
    const makeStaticResult = (
      verdict: string,
      currentAction: string,
      actions: string[],
      avoid: string[],
      observe: string[],
      missing: string[] = ['活体生物记录', '水质数据'],
    ): DiagnosisResult => ({
      verdict,
      risk: '信息不足',
      riskLevel: 'unknown',
      currentAction,
      keyMetrics: [
        { label: '问题类型', value: problemType },
        { label: '当前鱼缸', value: targetAquarium.name },
        { label: '活体数量', value: `${currentLivestock.reduce((sum, item) => sum + (item.aqFish.quantity || 1), 0)} 只/条` },
      ],
      reasons: ['当前数据不足，不能生成鱼只状态判断'],
      actions,
      avoid,
      observe,
      missing,
      evidence: [
        `当前鱼缸：${targetAquarium.name}`,
        `当前活体：${livestockNames.join('、') || '暂无活体生物'}`,
        `水体：${diagnosisTankSummary.water} · ${diagnosisTankSummary.volume} · ${diagnosisTankSummary.temperature}`,
      ],
    });

    const livestockProblemTypes: DiagnosisProblemType[] = [
      '鱼浮头 / 呼吸急促',
      '拒食',
      '躲藏不动',
      '追咬打架',
      '死亡 / 异常死亡',
      '鱼只异常',
      '新鱼入缸',
      '喂食问题',
      '怀孕/鱼苗',
      '死亡处理',
    ];
    if (currentLivestock.length === 0 && (problemType === '巡检' || livestockProblemTypes.includes(problemType))) {
      return makeStaticResult(
        '当前鱼缸暂无活体生物，无法诊断鱼只状态。',
        '先添加生物，或仅查看水质/设备排查建议',
        ['先确认鱼缸过滤、温度和水体是否稳定', '如果只是水浑或设备异常，请选择对应问题类型', '添加活体后再进行鱼只状态诊断'],
        ['不要在没有活体记录时判断鱼病', '不要套用其他鱼种的固定建议'],
        ['过滤是否正常出水', '水体是否浑浊或有异味', '温度是否稳定'],
        ['活体生物记录'],
      );
    }
    if (problemType === '虾类死亡' && !hasShrimp) {
      return makeStaticResult(
        '当前鱼缸没有虾类记录，无法生成虾类死亡诊断。',
        '先确认是否已把虾类添加到当前鱼缸',
        ['检查当前鱼缸活体列表是否选对', '如果实际有虾，请先添加到鱼缸记录', '如果只是水质异常，请切换到水质诊断'],
        ['不要套用虾类蜕壳或铜药风险判断到没有虾的鱼缸'],
        ['当前真实活体是否完整记录', '水体是否有异味或浑浊'],
      );
    }
    if (problemType === '水草黄叶 / 烂叶' && !hasPlants) {
      return makeStaticResult(
        '当前鱼缸没有水草配置记录，无法判断水草黄叶或烂叶。',
        '先补充水草配置，或切换到水质/设备排查',
        ['确认当前鱼缸是否已经记录水草', '检查灯光时长和过滤是否稳定', '如果实际有水草，请先添加到设备配置'],
        ['不要把水草黄叶原因套用到无水草鱼缸'],
        ['灯光是否正常', '水体是否浑浊', '底床是否近期翻动'],
        ['水草配置记录'],
      );
    }

    const snapshot = {
      aquariumId: targetAquarium.id,
      waterType: diagnosisTankSummary.water,
      temperature: diagnosisTankSummary.temperature,
      volume: diagnosisTankSummary.volume,
      stocked: diagnosisTankSummary.stocked,
      recentWaterChange: diagnosisTankSummary.waterChange,
      recentFeeding: diagnosisTankSummary.recentFeeding,
      recentAddedSpecies: diagnosisTankSummary.recentAddedSpecies,
      healthScore,
      riskCount: riskReminderCount,
    };
    const output: DiagnosisOutput = buildDiagnosisResult({
      aquarium: targetAquarium,
      snapshot,
      problemType,
      answers: diagnosisQuizAnswers as DiagnosisAnswerMap,
      careTopics: careTopicsData,
      previousDiagnosisRecords: recentDiagnosisRecords,
      sourceContext: careDiagnosisContext
        ? { source: 'care_article', title: careDiagnosisContext.title, category: careDiagnosisContext.category }
        : { source: 'home' },
    });

    return {
      verdict: output.summary,
      risk: output.riskLabel,
      riskLevel: output.riskLevel,
      currentAction: output.currentAction,
      keyMetrics: output.keyMetrics,
      reasons: output.possibleCauses,
      actions: output.actions,
      avoid: output.avoidActions,
      observe: output.observeItems,
      missing: output.missingInfo,
      evidence: Array.from(new Set([
        `当前鱼缸：${targetAquarium.name}`,
        `当前真实活体：${livestockNames.join('、') || '暂无活体生物'}`,
        ...(diagnosisBatchCareFocus ? [`体态观察重点：${diagnosisBatchCareFocus.reason}`] : []),
        ...output.evidence,
      ].filter(Boolean))).slice(0, 6),
      nextCheckAt: output.nextCheckAt,
    };
  };

  const handleOpenDiagnosis = () => {
    if (!activeAquarium) return;
    setDiagnosisAquariumId(activeAquarium.id);
    setIsDiagnosisOpen(true);
    setDiagnosisMode('home');
    setSelectedDiagnosisRecord(null);
    setCareDiagnosisContext(null);
    setDiagnosisResult(null);
    setIsDiagnosing(false);
    setDiagnosisFullText('');
    setDiagnosisText('');
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDiagnosisBatchCareFocus(null);
    setDailyCheckInterpretation(null);
    setDailyCheckArticles([]);
  };

  const handleOpenDailyCheck = (focus: SpeciesBatchCareSignal | null = null) => {
    if (!activeAquarium) return;
    setDiagnosisAquariumId(activeAquarium.id);
    setIsDiagnosisOpen(true);
    setDiagnosisIssueType('巡检');
    setDiagnosisMode('quiz');
    setDiagnosisQuestionIndex(0);
    setDiagnosisQuizAnswers({});
    setDiagnosisResult(null);
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDiagnosisBatchCareFocus(focus);
    setSelectedDiagnosisRecord(null);
    setCareDiagnosisContext(null);
    setIsDiagnosing(false);
    setDailyCheckInterpretation(null);
    setDailyCheckArticles([]);
    trackSessionEvent('daily_check_started', { action: 'start', status: 'started', entry: 'aquarium' });
  };

  const handleOpenDiagnosisWithType = (typeId: string) => {
    if (!activeAquarium) return;
    const safeType: DiagnosisProblemType = isDiagnosisProblemType(typeId) ? typeId : '巡检';
    if (speciesHealthDiagnosisTypes.has(safeType)) {
      setIsDiagnosisOpen(false);
      navigateToRoute('/identify');
      return;
    }
    setDiagnosisAquariumId(activeAquarium.id);
    setIsDiagnosisOpen(true);
    setDiagnosisIssueType(safeType);
    setDiagnosisMode('quiz');
    setDiagnosisQuestionIndex(0);
    setDiagnosisQuizAnswers({});
    setDiagnosisResult(null);
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDiagnosisBatchCareFocus(null);
    setSelectedDiagnosisRecord(null);
    setCareDiagnosisContext(null);
    setIsDiagnosing(false);
    setDiagnosisFullText('');
    setDiagnosisText('');
    setDailyCheckInterpretation(null);
    setDailyCheckArticles([]);
  };

  const handleStartDiagnosisQuiz = (typeId: string) => {
    const safeType: DiagnosisProblemType = isDiagnosisProblemType(typeId) ? typeId : '巡检';
    if (speciesHealthDiagnosisTypes.has(safeType)) {
      setIsDiagnosisOpen(false);
      navigateToRoute('/identify');
      return;
    }
    setDiagnosisIssueType(safeType);
    setDiagnosisMode('quiz');
    setDiagnosisQuestionIndex(0);
    setDiagnosisQuizAnswers({});
    setDiagnosisResult(null);
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDiagnosisBatchCareFocus(null);
    setSelectedDiagnosisRecord(null);
    setCareDiagnosisContext(null);
    setDailyCheckInterpretation(null);
    setDailyCheckArticles([]);
  };

  useEffect(() => {
    const params = new URLSearchParams(routeLocation.search);
    const action = params.get('action');
    if (!isAquariumTaskAction(action) || ['add-species', 'record-existing', 'plan-species'].includes(action)) {
      if (!['add-species', 'record-existing', 'plan-species'].includes(action || '')) handledOnboardingActionRef.current = '';
      return;
    }
    const requestKey = action === 'create'
      ? `create:${params.get('source') ?? ''}`
      : `${activeAquarium?.id ?? 'none'}:${action}:${params.get('source') ?? ''}`;
    if (handledOnboardingActionRef.current === requestKey) return;
    handledOnboardingActionRef.current = requestKey;

    if (action === 'create') {
      void handleAddAquarium().then(created => {
        if (created) routeNavigate('/aquarium', { replace: true });
      });
      return;
    }
    if (!activeAquarium) return;
    if (action === 'daily-check') {
      setIsDiagnosisOpen(true);
      handleStartDiagnosisQuiz('巡检');
      routeNavigate('/aquarium', { replace: true });
      return;
    }
    if (action === 'livestock') {
      setIsTankArchiveExpanded(true);
      routeNavigate('/aquarium', { replace: true });
      return;
    }
    if (action === 'water-change') {
      setSelectedWaterChangeDate(format(new Date(), 'yyyy-MM-dd'));
      setWaterChangeFeedback('');
      setIsCalendarOpen(true);
      routeNavigate('/aquarium', { replace: true });
      return;
    }
    openAquariumSettings('size');
    routeNavigate('/aquarium', { replace: true });
  }, [activeAquarium?.id, routeLocation.search]);

  const handleDiagnosisAnswer = (questionId: string, answer: string) => {
    setDiagnosisQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
    setDiagnosisResult(null);
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
  };

  const handleDiagnosisChoice = (questionId: string, answer: string) => {
    handleDiagnosisAnswer(questionId, answer);
    if (diagnosisAdvanceTimerRef.current !== null) window.clearTimeout(diagnosisAdvanceTimerRef.current);
    diagnosisAdvanceTimerRef.current = window.setTimeout(() => {
      diagnosisAdvanceTimerRef.current = null;
      const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
      const nextAnswers = { ...diagnosisQuizAnswers, [questionId]: answer };
      const questions = getDiagnosisQuestions(problemType, nextAnswers);

      if (problemType === '巡检') {
        const currentIndex = questions.findIndex(question => question.id === questionId);
        const requiredQuestions = questions.filter(question => !question.optionalText);
        const nextQuestion = questions
          .slice(Math.max(0, currentIndex + 1))
          .find(question => !question.optionalText && !nextAnswers[question.id])
          || requiredQuestions.find(question => !nextAnswers[question.id]);
        if (nextQuestion) {
          const target = diagnosisQuestionRefs.current[nextQuestion.id];
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
          target?.focus({ preventScroll: true });
          return;
        }
        diagnosisSubmitRef.current?.focus();
        return;
      }

      if (diagnosisQuestionIndex < questions.length - 1) {
        const nextQuestion = questions[diagnosisQuestionIndex + 1];
        setDiagnosisQuestionIndex(index => Math.min(index + 1, questions.length - 1));
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => diagnosisQuestionRefs.current[nextQuestion.id]?.focus());
        });
        return;
      }
      diagnosisSubmitRef.current?.focus();
    }, 200);
  };

  useEffect(() => () => {
    if (diagnosisAdvanceTimerRef.current !== null) window.clearTimeout(diagnosisAdvanceTimerRef.current);
  }, []);

  const handleRunDiagnosis = async () => {
    const result = buildStructuredDiagnosis();
    setDiagnosisResult(result);
    setDiagnosisMode('result');
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDailyCheckInterpretation(null);
    setDailyCheckArticles([]);

    if (diagnosisIssueType !== '巡检' || !diagnosisAquarium) return;
    const summary = getDiagnosisTankSummary();
    const snapshot = {
      aquariumId: diagnosisAquarium.id,
      waterType: summary.water,
      temperature: summary.temperature,
      volume: summary.volume,
      stocked: summary.stocked,
      recentWaterChange: summary.waterChange,
      recentFeeding: summary.recentFeeding,
      recentAddedSpecies: summary.recentAddedSpecies,
      dimensions: summary.dimensions,
      equipment: summary.equipment,
      livestockCount: summary.livestockCount,
      healthScore,
      riskCount: riskReminderCount,
    };
    const localOutput = buildDiagnosisResult({
      aquarium: diagnosisAquarium,
      snapshot,
      problemType: '巡检',
      answers: diagnosisQuizAnswers,
      careTopics: careTopicsData,
      previousDiagnosisRecords: recentDiagnosisRecords,
      sourceContext: { source: 'home', title: '每日鱼缸检查' },
    });
    const deterministicResult: DiagnosisOutput = {
      ...localOutput,
      riskLevel: result.riskLevel,
      riskLabel: result.risk,
      summary: result.verdict,
      currentAction: result.currentAction,
      actions: result.actions,
      avoidActions: result.avoid,
      possibleCauses: result.reasons,
      observeItems: result.observe,
      missingInfo: result.missing,
      evidence: result.evidence,
      keyMetrics: result.keyMetrics,
    };
    const candidateArticles = deterministicResult.matchedArticles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
    }));
    setDailyCheckArticles(candidateArticles
      .map(article => careTopicsData.find(topic => topic.id === article.id))
      .filter((topic): topic is (typeof careTopicsData)[number] => Boolean(topic)));

    const userDescription = diagnosisQuizAnswers.userDescription?.trim();
    const observedKeys = ['breathing', 'waterLook', 'surfaceLook', 'odor', 'behavior'];
    const normalAnswers = new Set(['正常', '清澈', '没有泡沫或油膜', '没有异味', '正常游动和进食']);
    const hasAbnormalAnswer = observedKeys.some(key => {
      const answer = diagnosisQuizAnswers[key];
      return Boolean(answer && !normalAnswers.has(answer));
    });
    if (!hasAbnormalAnswer && (!userDescription || userDescription === '跳过')) return;

    const context: TankDailyCheckContext = {
      aquariumSnapshot: snapshot,
      answers: diagnosisQuizAnswers,
      userDescription: userDescription && userDescription !== '跳过' ? userDescription : undefined,
      deterministicResult,
      candidateArticles,
    };
    setIsDiagnosing(true);
    try {
      const interpretation = await generateTankDailyCheckInterpretation(context);
      setDailyCheckInterpretation(interpretation);
      if (interpretation.recommendedArticleIds.length > 0) {
        const recommended = interpretation.recommendedArticleIds
          .map(id => careTopicsData.find(topic => topic.id === id))
          .filter((topic): topic is (typeof careTopicsData)[number] => Boolean(topic));
        if (recommended.length > 0) setDailyCheckArticles(recommended);
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDiagnosisNext = () => {
    const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
    const questions = getDiagnosisQuestions(problemType, diagnosisQuizAnswers);
    if (diagnosisQuestionIndex < questions.length - 1) {
      setDiagnosisQuestionIndex(prev => prev + 1);
      return;
    }
    void handleRunDiagnosis();
  };

  const handleDiagnosisPrevious = () => {
    if (diagnosisQuestionIndex > 0) {
      setDiagnosisQuestionIndex(prev => prev - 1);
      return;
    }
    setDiagnosisMode('home');
  };

  const handleSaveDiagnosisRecord = () => {
    const targetAquarium = diagnosisAquarium;
    if (!targetAquarium) return;
    const result = diagnosisResult || buildStructuredDiagnosis();
    const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
    const activeQuestions = getDiagnosisQuestions(problemType, diagnosisQuizAnswers);
    const structuredAnswers = activeQuestions
      .filter(question => diagnosisQuizAnswers[question.id])
      .map(question => ({
        questionId: question.id,
        question: question.question,
        answer: diagnosisQuizAnswers[question.id],
      }));
    const existingDailyRecord = problemType === '巡检'
      ? findDailyPatrolRecord(diagnosisRecords, targetAquarium.id)
      : undefined;
    const id = existingDailyRecord?.diagnosisId || Math.random().toString(36).substring(2, 10);
    const record: DiagnosisRecord = {
      diagnosisId: id,
      id,
      createdAt: new Date().toISOString(),
      aquariumId: targetAquarium.id,
      source: careDiagnosisContext
        ? { type: 'care_article', title: careDiagnosisContext.title }
        : { type: 'home' },
      problemType,
      answers: diagnosisQuizAnswers,
      structuredAnswers,
      resultSummary: result.verdict,
      riskLevel: result.risk,
      riskCode: result.riskLevel,
      conclusion: result.verdict,
      keyMetrics: result.keyMetrics,
      suggestedActions: result.actions,
      avoidActions: result.avoid,
      observeItems: result.observe,
      missingInfo: result.missing,
      optionalMissingInfo: result.missing,
      nextCheckAt: result.nextCheckAt,
      followUpNotes: careDiagnosisContext ? [`来自百科：${careDiagnosisContext.title}`] : [],
    };
    const nextRecords = upsertDiagnosisRecord(diagnosisRecords, record);
    setDiagnosisRecords(persistDiagnosisRecords(nextRecords));
    void persistCareTimelineEvent({
      aquariumId: targetAquarium.id,
      eventType: 'daily_check',
      title: problemType === '巡检' ? (isEn ? 'Completed daily check' : '完成每日检查') : (isEn ? `Completed ${problemType}` : `完成${problemType}`),
      label: result.verdict,
      payload: { riskLevel: result.riskLevel },
      occurredAt: record.createdAt,
      sourceType: 'diagnosis_record',
      sourceId: id,
      isInferred: false,
    }).catch(error => showToast(error instanceof Error ? error.message : '巡检时间线没有保存成功。', 'error'));
    setDiagnosisSaveMessage(problemType === '巡检'
      ? existingDailyRecord ? '已更新今天的检查记录。' : '已保存今天的检查记录。'
      : '已保存到诊断记录，下次诊断会参考最近记录。');
    setIsDiagnosisRecordSaved(true);
    showToast(problemType === '巡检'
      ? existingDailyRecord ? '已更新今天的检查记录' : '已保存今天的检查记录'
      : '已保存本次诊断');
    if (problemType === '巡检') {
      trackSessionEvent('daily_check_completed', { action: existingDailyRecord ? 'update' : 'complete', status: result.riskLevel, entry: 'aquarium' });
    }
  };

  useEffect(() => {
    if (!activeAquarium) return;
    const rawContext = sessionStorage.getItem('aquaguide_pending_diagnosis');
    if (!rawContext) return;

    const context = safeJsonParse<CareDiagnosisContext | null>(rawContext, null);
    sessionStorage.removeItem('aquaguide_pending_diagnosis');
    if (!context?.title) return;

    const issueType = isDiagnosisProblemType(context.diagnosisType)
      ? context.diagnosisType
      : /换水|安全换水/.test(`${context.title}${context.summary}${context.category}`)
        ? '换水'
        : /鱼苗|怀孕|繁殖/.test(`${context.title}${context.summary}${context.category}`)
          ? '怀孕/鱼苗'
          : '巡检';
    setCareDiagnosisContext(context);
    setDiagnosisAquariumId(activeAquarium.id);
    setDiagnosisIssueType(issueType);
    setDiagnosisMode('quiz');
    setDiagnosisQuestionIndex(0);
    setDiagnosisQuizAnswers({});
    setDiagnosisResult(null);
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setSelectedDiagnosisRecord(null);
    setIsDiagnosisOpen(true);
  }, [activeAquarium?.id]);

  const discoveryPool = useMemo(() => (
    fishData
      .filter(fish => !isAquaticPlantSpecies(fish) && !isHardscapeSpecies(fish))
      .map(fish => ({
        ...fish,
        housingMode: ((fish as Fish & { _originalHousingMode?: Fish['housingMode'] })._originalHousingMode || fish.housingMode),
      }))
  ), []);

  useEffect(() => {
    setDiscoveryState(previous => {
      const output = recommendationService.createDiscoveryDeck({
        speciesPool: discoveryPool,
        wishlistIds: Array.from(wishlistFishIds),
        state: previous,
      });
      saveDiscoveryState(output.state);
      return output.state;
    });
  }, [discoveryPool, wishlistFishIds]);

  const discoveryFish = useMemo(
    () => discoveryPool.find(fish => fish.id === discoveryState.queueIds[0]) || null,
    [discoveryPool, discoveryState.queueIds],
  );
  const discoveryImageSrc = discoveryFish ? getSpeciesVisualSources(discoveryFish).thumbnail : '';
  const discoveryUsedToday = discoveryState.consumedIds.length;
  const discoveryRemainingToday = Math.max(0, DISCOVERY_DAILY_LIMIT - discoveryUsedToday);
  const isDiscoveryDailyLimitReached = discoveryRemainingToday === 0;
  const discoveryPositionToday = discoveryFish
    ? Math.min(DISCOVERY_DAILY_LIMIT, discoveryUsedToday + 1)
    : Math.min(DISCOVERY_DAILY_LIMIT, discoveryUsedToday);

  useEffect(() => {
    if (discoveryImageSrc) {
      const currentImage = new Image();
      currentImage.decoding = 'async';
      currentImage.src = discoveryImageSrc;
    }
    discoveryState.queueIds.slice(1, 5).forEach(id => {
      const fish = discoveryPool.find(item => item.id === id);
      if (!fish) return;
      const preload = new Image();
      preload.decoding = 'async';
      preload.src = getSpeciesVisualSources(fish).thumbnail;
    });
  }, [discoveryImageSrc, discoveryPool, discoveryState.queueIds]);

  const advanceDiscoveryCard = () => {
    if (!discoveryFish) return;
    const output = recommendationService.advanceDiscoveryDeck({
      speciesId: discoveryFish.id,
      action: 'skip',
      speciesPool: discoveryPool,
      wishlistIds: Array.from(wishlistFishIds),
      state: discoveryState,
    });
    setDiscoveryMessage(output.message);
    saveDiscoveryState(output.state);
    setDiscoveryState(output.state);
  };

  const handleDiscoveryFavorite = async () => {
    if (!discoveryFish || isDiscoveryFavoritePending) return;
    const targetFishId = discoveryFish.id;
    const previous = new Set(wishlistFishIds);
    const next = new Set(previous);
    const willSave = !next.has(targetFishId);
    if (willSave) next.add(targetFishId);
    else next.delete(targetFishId);

    setWishlistFishIds(next);
    setIsDiscoveryFavoritePending(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateFavorite({ type: 'species', catalogKey: targetFishId, favorite: willSave });
      setDiscoveryMessage(
        willSave
          ? (isEn ? 'Saved to My Collection' : '已收录到水族册')
          : (isEn ? 'Removed from My Collection' : '已从水族册移除'),
      );
    } catch (error) {
      setWishlistFishIds(previous);
      setDiscoveryMessage(
        error instanceof Error
          ? error.message
          : (isEn ? 'Could not update the collection. Try again.' : '收藏没有保存成功，请重试。'),
      );
    } finally {
      setIsDiscoveryFavoritePending(false);
    }
  };

  const handleAquariumSpeciesSelect = (fishId: string | null) => {
    setActive3DSpecies(fishId);
    if (!fishId) return;

    const aqFish = activeAquarium.fishes.find(item => item.fishId === fishId);
    const fish = fishData.find(item => item.id === fishId);
    if (!aqFish || !fish) return;

    openAquariumSpeciesDetail(
      fish,
      aqFish,
      isTankPreviewOpen ? 'aquarium-tank-preview' : 'aquarium-tank',
    );
  };

  const handleTankCopilotPrimaryAction = () => {
    if (tankCopilotResult?.missingQuestions.length) {
      void handleTankCopilotGenerate(undefined, tankCopilotAnswers);
      return;
    }
    handleTankCopilotNextAction();
  };

  const tankCopilotMissingQuestions = tankCopilotResult?.missingQuestions.slice(0, 3) ?? [];
  const tankCopilotNeedsAnswers = tankCopilotMissingQuestions.length > 0;
  const tankCopilotHasAnswer = tankCopilotMissingQuestions.some(question => (tankCopilotAnswers[question.id] || '').trim().length > 0);
  const tankCopilotStep = !tankCopilotResult ? 1 : tankCopilotNeedsAnswers ? 2 : 3;

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return isEn ? 'Beginner' : '极易';
      case 'Medium': return isEn ? 'Intermediate' : '中等';
      case 'Hard': return isEn ? 'Advanced' : '困难';
      default: return difficulty;
    }
  };

  if (!activeAquarium) {
    return (
      <div className="page-frame-wide flex min-h-[70dvh] min-w-0 items-center justify-center px-3 py-8">
        <section className="grid w-full max-w-[720px] gap-5 rounded-[28px] border border-white/80 bg-white/82 p-6 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-50 text-emerald-700">
            <Droplets className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-ink">{isEn ? 'Start with what is true today' : '从今天真实的鱼缸开始'}</h1>
            <p className="mx-auto mt-2 max-w-[520px] text-sm font-medium leading-relaxed text-ink/58">
              {isEn
                ? 'Creating a tank only saves its name and start date. Size, water type, temperature and equipment stay unknown until you record them.'
                : '新建鱼缸只保存名称和建缸日期；尺寸、水体、目标温度和设备在你实际记录前都会保持“未知”。'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => void handleAddAquarium()}
              disabled={isCreatingAquarium}
              className="min-h-12 rounded-full bg-emerald-700 px-5 font-black text-white hover:bg-emerald-800"
            >
              {isCreatingAquarium ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {isEn ? 'Create my first aquarium' : '创建第一个鱼缸'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateToRoute('/encyclopedia?mode=browse')}
              className="min-h-12 rounded-full px-5 font-black"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {isEn ? 'Browse species first' : '先浏览物种'}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const aquariumSetupStatus = getAquariumSetupStatus(activeAquarium);

  const currentFishesDetails = activeAquarium.fishes.map(af => fishData.find(f => f.id === af.fishId)).filter(Boolean) as Fish[];
  const activeCareReminders = careReminders
    .filter(reminder => !reminder.completedAt && (!reminder.aquariumId || reminder.aquariumId === activeAquarium.id))
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  const dueCareReminders = activeCareReminders.filter(reminder => ['overdue', 'today'].includes(getCareReminderStatus(reminder)));
  const carePlanSummary: CarePlanSummaryViewModel = {
    activeCount: activeCareReminders.length,
    dueCount: dueCareReminders.length,
    overdueCount: activeCareReminders.filter(reminder => getCareReminderStatus(reminder) === 'overdue').length,
    visibleItems: activeCareReminders.slice(0, 3).map(reminder => {
      const status = getCareReminderStatus(reminder);
      return {
        id: reminder.id,
        title: reminder.title,
        dateLabel: format(new Date(reminder.scheduledFor), 'MM月dd日'),
        detail: reminder.label || '复查养护状态',
        status: status === 'completed' ? 'upcoming' : status,
      };
    }),
  };
  const heaterStockedItems = activeAquarium.fishes
    .map(aqFish => ({ aqFish, fish: fishData.find(f => f.id === aqFish.fishId) }))
    .filter((item): item is { aqFish: AquariumFish; fish: Fish } => Boolean(item.fish) && needsHeaterForSpecies(item.fish));
  const heaterSpeciesCount = new Set(heaterStockedItems.map(item => item.fish.id)).size;
  const recommendationItems = recommendationService.recommendForAquarium(activeAquarium, fishData, 10).items;
  const recommendationReasonById = new Map(recommendationItems.map(item => [item.speciesId, item.reason]));
  const recommendations = recommendationItems
    .map(item => fishData.find(fish => fish.id === item.speciesId))
    .filter(Boolean) as Fish[];
  const smartRecommendation: SmartRecommendationOutput = recommendationService.recommendSmartForAquarium({
    aquarium: activeAquarium,
    speciesPool: fishData,
    mode: smartRecommendMode,
    preference: {
      experience: smartPreference.includes('新手') ? 'beginner' : 'intermediate',
      maintenance: smartPreference.includes('低维护') ? 'low' : 'balanced',
      naturalLanguage: smartPreference,
    },
  });
  const smartCandidateScope = smartCandidateScopeIds ? new Set(smartCandidateScopeIds) : null;
  const visibleSmartDirect = smartCandidateScope
    ? smartRecommendation.direct.filter(candidate => smartCandidateScope.has(candidate.speciesId))
    : smartRecommendation.direct;
  const visibleSmartAdjustable = smartCandidateScope
    ? smartRecommendation.adjustable.filter(candidate => smartCandidateScope.has(candidate.speciesId))
    : smartRecommendation.adjustable;
  const visibleSmartBlocked = smartCandidateScope ? [] : smartRecommendation.blocked;
  const tankCopilotLocalCandidatePool = [
    ...smartRecommendation.direct,
    ...smartRecommendation.adjustable,
  ].filter(candidate => candidate.status !== 'blocked');
  const tankCopilotAllowedCandidates = (() => {
    if (!tankCopilotResult || tankCopilotNeedsAnswers) return [];
    const localById = new Map(tankCopilotLocalCandidatePool.map(candidate => [candidate.speciesId, candidate]));
    const matched = new Map<string, RecommendationCandidate>();

    tankCopilotResult.selectedCandidateIds.forEach(speciesId => {
      const localCandidate = localById.get(speciesId);
      if (localCandidate) matched.set(localCandidate.speciesId, localCandidate);
    });

    return Array.from(matched.values());
  })();
  const tankCopilotHiddenCandidateCount = tankCopilotResult && !tankCopilotNeedsAnswers
    ? Math.max(0, tankCopilotResult.selectedCandidateIds.length - tankCopilotAllowedCandidates.length)
    : 0;
  const tankCopilotPrimaryCandidate = tankCopilotAllowedCandidates[0] || null;
  const tankCopilotActionView = (() => {
    const actionType = tankCopilotResult?.recommendedActions[0]?.type;
    if (actionType === 'complete_tank_info') {
      return {
        label: '完善鱼缸信息',
        description: '打开鱼缸设置，并定位到最可能缺失的尺寸、水质或设备区域。',
      };
    }
    if (actionType === 'view_safe_candidates') {
      if (tankCopilotAllowedCandidates.length === 0) {
        return {
          label: '重新描述目标',
          description: '本地规则暂时没有可执行候选。换一个更具体的目标，或先完善鱼缸信息。',
        };
      }
      return {
        label: '查看候选生物',
        description: `打开 ${tankCopilotAllowedCandidates.length} 个本地规则允许的候选，不写入真实鱼缸。`,
      };
    }
    if (actionType === 'start_addition_simulation') {
      if (!tankCopilotPrimaryCandidate) {
        return {
          label: '重新描述目标',
          description: '当前没有可以模拟添加的安全候选。请换一个目标，或先完善鱼缸信息。',
        };
      }
      return {
        label: '进入模拟添加',
        description: `先模拟 ${tankCopilotPrimaryCandidate.name} 的负载和兼容变化，确认后再进入真实添加。`,
      };
    }
    return {
      label: '重新描述目标',
      description: '当前没有明确可执行动作，重新描述目标会生成新的方案。',
    };
  })();
  const tankCopilotPrimaryLabel = !tankCopilotResult
    ? (isTankCopilotLoading ? '生成中...' : '生成建缸方案')
    : tankCopilotNeedsAnswers
      ? (isTankCopilotLoading ? '重新生成中...' : '带着补充信息重新生成')
      : tankCopilotActionView.label;
  const isTankCopilotPrimaryDisabled = isTankCopilotLoading || (tankCopilotNeedsAnswers && !tankCopilotHasAnswer);
  const smartCandidateIds = new Set([
    ...smartRecommendation.direct,
    ...smartRecommendation.adjustable,
  ].map(candidate => candidate.speciesId));
  const wishlistFishes = Array.from(wishlistFishIds)
    .map(id => fishData.find(fish => fish.id === id))
    .filter(Boolean) as Fish[];
  const selectedBuildTemplate = localizedTemplates.find(template => template.id === selectedBuildTemplateId) || localizedTemplates[0];
  const currentTankVolumeLiters = getTankVolumeLiters(activeAquarium);
  const currentTankLengthCm = parseFloat(activeAquarium.dimensions?.length || '0') || 0;
  const getSpeciesDisplayName = (value: string) => fishData.find(fish => fish.id === value)?.name || value;
  const getRoleLoadBudgetRatio = (role: TankBuildTemplate['speciesRecommendations'][number]['role']) => {
    if (role === 'schooling') return 0.55;
    if (role === 'bottom') return 0.18;
    if (role === 'shrimp') return 0.06;
    if (role === 'snail') return 0.04;
    return 0.22;
  };
  const adaptBuildTemplate = (template: TankBuildTemplate, aquarium: Aquarium): AdaptedBuildPlan => {
    const volumeLiters = getTankVolumeLiters(aquarium);
    const tankLengthCm = parseFloat(aquarium.dimensions?.length || '0') || 0;
    const volumeRatio = template.recommendedVolumeLiters > 0
      ? Math.max(0, Math.min(1, volumeLiters / template.recommendedVolumeLiters))
      : 1;
    const belowMinimum = volumeLiters < template.minVolumeLiters || tankLengthCm < template.minLengthCm || aquarium.waterType !== template.waterType;
    const atRecommended = volumeLiters >= template.recommendedVolumeLiters && tankLengthCm >= template.minLengthCm;
    const status: AdaptedBuildPlan['status'] = belowMinimum ? 'unsuitable' : atRecommended ? 'suitable' : 'caution';
    const safeLoadBudget = Math.max(0, volumeLiters * (status === 'suitable' ? 0.78 : 0.58));
    const existingAnimalLoad = aquarium.fishes.reduce((sum, aqFish) => {
      const fish = fishData.find(item => item.id === aqFish.fishId);
      if (!fish) return sum;
      const lifeType = getLifeType(fish);
      if (lifeType === 'plant' || lifeType === 'hardscape') return sum;
      return sum + getBioLoadLiters(fish) * Math.max(1, aqFish.quantity || 1);
    }, 0);
    let remainingBudget = Math.max(0, safeLoadBudget - existingAnimalLoad);
    let usedPrimarySchool = false;

    const appliedSpecies = template.speciesRecommendations
      .map(rec => {
        const fish = findStockSpeciesByName(rec.name);
        if (!fish || status === 'unsuitable') return null;
        if (rec.role === 'schooling' && usedPrimarySchool && status === 'caution') return null;
        const perAnimalLoad = Math.max(0.5, getBioLoadLiters(fish));
        const roleBudget = Math.max(0, safeLoadBudget * getRoleLoadBudgetRatio(rec.role));
        const scaledTarget = status === 'suitable'
          ? rec.recommendedQuantity
          : Math.max(rec.minQuantity, Math.floor(rec.recommendedQuantity * Math.max(0.45, volumeRatio)));
        const budgetCap = Math.floor(Math.min(roleBudget, remainingBudget) / perAnimalLoad);
        let quantity = Math.min(rec.recommendedQuantity, scaledTarget, budgetCap);
        if (rec.role === 'schooling') {
          if (quantity < rec.minQuantity) return null;
          usedPrimarySchool = true;
        } else if (quantity < Math.max(1, rec.minQuantity)) {
          return null;
        }
        if (rec.role === 'snail') quantity = Math.min(quantity, volumeLiters >= 60 ? 2 : 1);
        remainingBudget -= quantity * perAnimalLoad;
        return { name: rec.name, quantity, role: rec.role, fish };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item && item.quantity > 0));

    const riskItems: string[] = [];
    if (belowMinimum) {
      riskItems.push(isEn 
        ? `Current water: ~${volumeLiters}L / ${tankLengthCm || 'Not Set'}cm, below minimum requirement ${template.minVolumeLiters}L / ${template.minLengthCm}cm.`
        : `当前约 ${volumeLiters}L / ${tankLengthCm || '未设置'}cm，低于 ${template.name} 的最低要求 ${template.minVolumeLiters}L / ${template.minLengthCm}cm。`);
    }
    if (existingAnimalLoad > safeLoadBudget * 0.8) {
      riskItems.push(isEn ? 'Current livestock bioload is high; not recommended to add full stocking list.' : '当前已有动物负载偏高，应用方案时不建议继续加入完整生物组合。');
    }
    if (status !== 'unsuitable' && appliedSpecies.length === 0 && template.speciesRecommendations.length > 0) {
      riskItems.push(isEn ? 'Insufficient remaining space; only environment settings recommended, no new species added.' : '当前鱼缸剩余承载空间不足，方案只建议应用环境配置，暂不新增生物。');
    }

    const school = appliedSpecies.find(item => item.role === 'schooling');
    const omittedSecondSchool = template.speciesRecommendations.filter(item => item.role === 'schooling').length > 1 && status === 'caution';
    const autoFixes = [
      status === 'caution' && school ? (isEn ? `Adjusted for your ${volumeLiters}L tank: recommend ${school.name} ${school.quantity} pcs.` : `已根据你的 ${volumeLiters}L 鱼缸调整：建议 ${school.name} ${school.quantity} 条。`) : '',
      omittedSecondSchool ? (isEn ? 'Do not add a second schooling fish group to avoid overstocking multiple schools.' : '不建议同时加入第二种群游鱼，避免满配多个鱼群。') : '',
      existingAnimalLoad > 0 ? (isEn ? 'Reserved space for existing livestock in the tank.' : '已预留当前已有生物的承载空间。') : '',
    ].filter(Boolean);
    const statusLabel = status === 'suitable' 
      ? (isEn ? 'Suitable for active tank' : '适合当前鱼缸') 
      : status === 'caution' 
        ? (isEn ? 'Available, scaled list' : '可用，已缩减生物') 
        : (isEn ? 'Unsuitable for active tank' : '不适合当前鱼缸');
    const ctaLabel = status === 'suitable'
      ? (isEn ? 'Review planned livestock' : '评估方案内生物')
      : status === 'caution'
        ? (isEn ? 'Review adjusted livestock' : '评估调整后的生物')
        : (isEn ? 'Tank size too small' : '当前鱼缸偏小');

    return {
      template,
      status,
      statusLabel,
      statusTone: status === 'suitable' ? 'bg-emerald-100 text-emerald-700' : status === 'caution' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600',
      currentVolumeLiters: volumeLiters,
      currentLengthCm: tankLengthCm,
      volumeRatio,
      summary: status === 'unsuitable'
        ? (isEn ? 'Current tank size is below requirements. Larger tank or smaller plan recommended.' : '当前鱼缸低于最低要求，建议更换更大鱼缸或选择更小方案。')
        : autoFixes.join(' ') || (isEn ? `Tank suitable, safe stocking combination generated for ${volumeLiters}L.` : `当前鱼缸可承接该方案，按 ${volumeLiters}L 水体生成安全组合。`),
      coreConfigSummary: `${template.baseSubstrate} · ${template.baseEquipment.slice(0, 2).join(' · ')}`,
      livestockSummary: appliedSpecies.length > 0 
        ? appliedSpecies.map(item => `${item.name} ${item.quantity}`).join(' · ') 
        : (isEn ? 'Environment setup only, no new species added' : '仅应用环境配置，暂不新增生物'),
      appliedSpecies,
      riskItems,
      autoFixes,
      canApply: status !== 'unsuitable',
      ctaLabel,
    };
  };
  const adaptedBuildPlans = localizedTemplates.map(template => adaptBuildTemplate(template, activeAquarium));
  const selectedAdaptedBuildPlan = adaptedBuildPlans.find(plan => plan.template.id === selectedBuildTemplate.id) || adaptedBuildPlans[0];
  const getTemplateEnvironmentSummary = (template: TankBuildTemplate) => {
    const heatText = template.equipmentSettings.heater ? (isEn ? 'Stable Heated' : '稳定加热') : (isEn ? 'Room Temp' : '室温可养');
    return `${template.waterType === 'Saltwater' ? (isEn ? 'Marine' : '海水') : (isEn ? 'Freshwater' : '淡水')} · ${template.temperatureRange[0]}-${template.temperatureRange[1]}°C · ${heatText}`;
  };
  const getTemplateLayoutSummary = (template: TankBuildTemplate) => {
    const plantNames = template.plants.map(getSpeciesDisplayName).slice(0, 2).join(isEn ? ', ' : '、') || (isEn ? 'Few plants' : '少量水草');
    const hardscapeNames = template.hardscape.map(getSpeciesDisplayName).slice(0, 2).join(isEn ? ', ' : '、') || (isEn ? 'Natural scape' : '自然造景');
    return `${template.substrate} · ${hardscapeNames} · ${plantNames}`;
  };
  const getTemplateLivestockSummary = (template: TankBuildTemplate) => (
    template.livestock.slice(0, 3).join(' · ') || (isEn ? 'Select species by plan' : '按方案选择生物')
  );
  const getTemplateEquipmentSummary = (template: TankBuildTemplate) => {
    const translateEquip = (name: string) => {
      if (!isEn) return name;
      if (name === '瀑布过滤') return 'HOB Filter';
      if (name === '桶滤') return 'Canister Filter';
      if (name === '上滤') return 'Top Filter';
      if (name === '海绵过滤') return 'Sponge Filter';
      if (name === '普通灯') return 'Standard Light';
      if (name === '水草灯') return 'Planted Light';
      if (name === '海水灯') return 'Marine Light';
      return name;
    };
    const equipment = [
      template.equipmentSettings.filter ? translateEquip(template.equipmentSettings.filter) : null,
      template.equipmentSettings.light ? translateEquip(template.equipmentSettings.light) : null,
      template.equipmentSettings.heater ? (isEn ? 'Heater' : '加热棒') : null,
      template.equipmentSettings.oxygen ? (isEn ? 'Aeration' : '氧气/气泡石') : null,
    ].filter(Boolean);
    return equipment.join(' · ') || template.equipment.slice(0, 2).map(translateEquip).join(' · ');
  };
  const getTemplateVisualImages = (template: TankBuildTemplate) => [
    ...template.hardscape,
    ...template.plants,
    ...(template.stockedSpecies.map(item => findStockSpeciesByName(item.name)?.id).filter(Boolean) as string[]),
  ]
    .map(value => fishData.find(fish => fish.id === value || fish.name === value)?.image)
    .filter(Boolean) as string[];

  // Search logic for Add Fish
  const searchResults = fishSearchTerm.trim() 
    ? fishData
      .filter(f => !isAquaticPlantSpecies(f) && !isHardscapeSpecies(f))
      .filter(f => f.name.toLowerCase().includes(fishSearchTerm.toLowerCase()) || f.scientificName.toLowerCase().includes(fishSearchTerm.toLowerCase()))
      .slice(0, 8)
    : [];

  const recommendedFishes = recommendations.slice(0, 6);
  const addFishList = fishSearchTerm.trim() ? searchResults : recommendedFishes;
  const selectedAddFishDetails = selectedAddFishItems
    .map(item => {
      const fish = fishData.find(candidate => candidate.id === item.fishId);
      return fish ? { ...item, fish } : null;
    })
    .filter((item): item is { fishId: string; quantity: number; entryDate: string; fish: Fish } => Boolean(item));
  const selectedAddSpeciesCount = selectedAddFishDetails.length;
  const selectedAddTotalQuantity = selectedAddFishItems.reduce((sum, item) => sum + Math.max(1, item.quantity || 1), 0);
  const todayAddFishDate = format(new Date(), 'yyyy-MM-dd');
  const formatAddFishDateLabel = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '今天';
    const formatted = format(date, 'yyyy/MM/dd');
    return dateValue === todayAddFishDate ? `今天 · ${formatted}` : formatted;
  };
  const updateSelectedAddFishItem = (fishId: string, patch: Partial<{ quantity: number; entryDate: string }>) => {
    setAddFishCompatibilityReview(null);
    addFishOperationIdRef.current = '';
    setSelectedAddFishItems(prev => prev.map(item => (
      item.fishId === fishId
        ? { ...item, ...patch, quantity: Math.max(1, patch.quantity ?? item.quantity) }
        : item
    )));
  };
  const toggleSelectedAddFish = (fish: Fish) => {
    setAddFishSuccess(null);
    setAddFishDatePicker(null);
    setAddFishCompatibilityReview(null);
    addFishOperationIdRef.current = '';
    setSelectedAddFishItems(prev => {
      if (prev.some(item => item.fishId === fish.id)) {
        return prev.filter(item => item.fishId !== fish.id);
      }
      return [...prev, { fishId: fish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd') }];
    });
  };
  const addFishIntro = additionIntent === 'record_existing'
    ? '选择现实中已经在这个鱼缸里的生物；保存后再显示风险，不会因判断结果阻止记录。'
    : activeAquarium.fishes.length === 0
      ? '当前为空缸，先选择想养的生物查看规划判断；此步骤不会写入鱼缸。'
      : '根据当前鱼缸状态评估想养的生物；只有实际入缸后才记录。';
  const getAddFishTags = (fish: Fish) => {
    const tags: string[] = [];
    if (fish.difficulty === 'Easy') tags.push('新手友好');
    if (fish.size === 'Small') tags.push('小型温和');
    if (fish.housingMode === '适合混养') tags.push('后续好搭配');
    const toolTags = getToolFunctions(fish);
    tags.push(...toolTags.slice(0, 2));
    if (tags.length === 0) tags.push(fish.category);
    return Array.from(new Set(tags)).slice(0, 3);
  };
  const getAddFishReason = (fish: Fish) => {
    const recommendationReason = recommendationReasonById.get(fish.id);
    if (recommendationReason) return recommendationReason;
    if (fish.size === 'Small' && fish.housingMode === '适合混养') return '适合作为起步搭配生物，建议先少量加入观察状态。';
    if (getLifeType(fish) === 'invertebrate') return '适合作为清洁或观察生物，但仍需要稳定水质。';
    return '建议先少量加入，观察 3-7 天后再决定是否补充数量。';
  };
  const recommendationNames = currentFishesDetails.slice(0, 2).map(fish => fish.name).join('、');
  const singleOnlyFishes = currentFishesDetails.filter(fish => fish.housingMode === '建议单养' || getLifeType(fish) === 'reptile');
  const tankVolumeLiters = getTankVolumeLiters(activeAquarium);
  const currentBioLoadLiters = activeAquarium.fishes.reduce((sum, aqFish) => {
    const fish = fishData.find(item => item.id === aqFish.fishId);
    return sum + (fish ? getBioLoadLiters(fish) * Math.max(1, aqFish.quantity || 1) : 0);
  }, 0);
  const selectedPlantCount = settingsForm.plants?.length || 0;
  const settingsGrossVolumeLiters = getTankGrossVolumeLiters(settingsForm.dimensions);
  const settingsEstimatedWaterLiters = getEstimatedWaterVolumeLiters(settingsForm.dimensions);
  const settingsWaterType = settingsForm.waterType || 'Freshwater';
  const availablePlantOptions = settingsWaterType === 'Freshwater'
    ? plantOptions.filter(item => isSpeciesCompatibleWithWaterType(item, 'Freshwater'))
    : plantOptions;
  const availableHardscapeOptions = settingsWaterType === 'Freshwater'
    ? hardscapeOptions.filter(item => isSpeciesCompatibleWithWaterType(item, 'Freshwater'))
    : hardscapeOptions;
  const availableSubstrateOptions = settingsWaterType === 'Freshwater'
    ? substrateOptions.filter(option => option.value !== '珊瑚砂')
    : substrateOptions;
  const updateSettingsWaterType = (waterType: NonNullable<Aquarium['waterType']>) => {
    const keepFreshwaterOnly = waterType === 'Freshwater';
    setSettingsForm({
      ...settingsForm,
      waterType,
      substrate: keepFreshwaterOnly && settingsForm.substrate === '珊瑚砂' ? '无' : settingsForm.substrate,
      plants: keepFreshwaterOnly
        ? (settingsForm.plants || []).filter(value => {
            const species = fishData.find(item => item.id === value || item.name === value);
            return !species || isSpeciesCompatibleWithWaterType(species, 'Freshwater');
          })
        : settingsForm.plants,
      hardscape: keepFreshwaterOnly
        ? (settingsForm.hardscape || []).filter(value => {
            const species = fishData.find(item => item.id === value || item.name === value);
            return !species || isSpeciesCompatibleWithWaterType(species, 'Freshwater');
          })
        : settingsForm.hardscape,
    });
  };
  const visiblePlantOptions = isPlantListExpanded ? availablePlantOptions : availablePlantOptions.slice(0, 4);
  const hiddenPlantCount = Math.max(availablePlantOptions.length - visiblePlantOptions.length, 0);
  const selectedHardscapeCount = settingsForm.hardscape?.length || 0;
  const currentSubstrate = settingsForm.substrate || '无';
  const scapeOptions = [
    ...availableSubstrateOptions.map(option => ({
      type: 'substrate' as const,
      id: `substrate-${option.value}`,
      value: option.value,
      label: isEn ? option.labelEn : option.label,
      hint: isEn ? option.hintEn : option.hint,
    })),
    ...availableHardscapeOptions.map(item => ({
      type: 'hardscape' as const,
      id: `hardscape-${item.id}`,
      value: item.id,
      label: item.name,
      hint: item.scientificName,
      image: item.image,
    })),
  ];
  const selectedScapeCount = (currentSubstrate !== '无' ? 1 : 0) + selectedHardscapeCount;
  const sortedScapeOptions = [...scapeOptions].sort((a, b) => {
    const aSelected = a.type === 'substrate'
      ? a.value === currentSubstrate
      : (settingsForm.hardscape || []).includes(a.value);
    const bSelected = b.type === 'substrate'
      ? b.value === currentSubstrate
      : (settingsForm.hardscape || []).includes(b.value);
    return Number(bSelected) - Number(aSelected);
  });
  const visibleScapeOptions = isScapeListExpanded ? sortedScapeOptions : sortedScapeOptions.slice(0, 4);
  const hiddenScapeCount = Math.max(sortedScapeOptions.length - visibleScapeOptions.length, 0);
  const selectedPlantNames = (settingsForm.plants || [])
    .map(value => fishData.find(item => item.id === value || item.name === value)?.name || value)
    .slice(0, 3);
  const selectedHardscapeNames = (settingsForm.hardscape || [])
    .map(value => fishData.find(item => item.id === value || item.name === value)?.name || value)
    .slice(0, 3);
  const configuredSettingCount = [
    settingsForm.waterType,
    settingsForm.targetTemperature,
    settingsEstimatedWaterLiters > 0,
    currentSubstrate !== '无',
    selectedPlantCount > 0,
    selectedHardscapeCount > 0,
    settingsForm.equipment?.filter,
    settingsForm.equipment?.light,
    settingsForm.equipment?.heater,
    settingsForm.equipment?.oxygen,
  ].filter(Boolean).length;
  const settingItems: Array<{
    id: NonNullable<typeof activeSettingsPanel>;
    title: string;
    summary: string;
    configured: boolean;
  }> = [
    {
      id: 'size',
      title: isEn ? 'Dimensions' : '尺寸',
      summary: settingsEstimatedWaterLiters > 0
        ? `${settingsForm.dimensions?.length || '--'}x${settingsForm.dimensions?.width || '--'}x${settingsForm.dimensions?.height || '--'}cm · ${isEn ? `~${Math.round(settingsEstimatedWaterLiters)}L` : `约 ${settingsEstimatedWaterLiters}L`}`
        : (isEn ? 'Incomplete dimensions' : '长宽高未完整填写'),
      configured: Boolean(settingsForm.dimensions?.length && settingsForm.dimensions?.width && settingsForm.dimensions?.height),
    },
    {
      id: 'parameters',
      title: isEn ? 'Parameters' : '参数',
      summary: `${settingsForm.waterType ? (settingsForm.waterType === 'Saltwater' ? (isEn ? 'Marine' : '海水') : (isEn ? 'Freshwater' : '淡水')) : (isEn ? 'Water type unknown' : '水体未记录')} · ${settingsForm.targetTemperature ? `${isEn ? 'Target ' : '目标 '}${settingsForm.targetTemperature}°C` : (isEn ? 'Target temperature unknown' : '目标温度未记录')}`,
      configured: Boolean(settingsForm.waterType && settingsForm.targetTemperature),
    },
    {
      id: 'substrate',
      title: isEn ? 'Substrate' : '底砂',
      summary: currentSubstrate !== '无' || selectedHardscapeNames.length > 0
        ? [currentSubstrate !== '无' ? (isEn ? (substrateOptions.find(opt => opt.value === currentSubstrate)?.labelEn || currentSubstrate) : currentSubstrate) : null, ...selectedHardscapeNames].filter(Boolean).join(isEn ? ', ' : '、')
        : (isEn ? 'No substrate or hardscape selected' : '未选择底砂或造景'),
      configured: currentSubstrate !== '无' || selectedHardscapeCount > 0,
    },
    {
      id: 'plants',
      title: isEn ? 'Plants' : '水草',
      summary: selectedPlantNames.length > 0 ? selectedPlantNames.join(isEn ? ', ' : '、') : (isEn ? 'No plants selected' : '未选择水草'),
      configured: selectedPlantCount > 0,
    },
    {
      id: 'lighting',
      title: isEn ? 'Lighting' : '灯光',
      summary: settingsForm.equipment?.light && settingsForm.equipment.light !== '无' 
        ? (isEn ? (t(`aquarium.${lightOptionKeys[settingsForm.equipment.light] || 'none'}`) || settingsForm.equipment.light) : settingsForm.equipment.light) 
        : (isEn ? 'No lighting selected' : '未选择灯光'),
      configured: Boolean(settingsForm.equipment?.light && settingsForm.equipment.light !== '无'),
    },
    {
      id: 'equipment',
      title: isEn ? 'Equipment' : '设备',
      summary: [
        settingsForm.equipment?.filter && settingsForm.equipment.filter !== '无' 
          ? (isEn ? (t(`aquarium.${filterOptionKeys[settingsForm.equipment.filter] || 'none'}`) || settingsForm.equipment.filter) : settingsForm.equipment.filter) 
          : null,
        settingsForm.equipment?.heater ? (isEn ? 'Heater' : '加热棒') : null,
        settingsForm.equipment?.oxygen ? (isEn ? 'Aeration' : '氧气/气泡石') : null,
      ].filter(Boolean).join(isEn ? ', ' : '、') || (isEn ? 'No filter or auxiliary equipment selected' : '未选择过滤或辅助设备'),
      configured: Boolean(
        (settingsForm.equipment?.filter && settingsForm.equipment.filter !== '无')
        || settingsForm.equipment?.heater
        || settingsForm.equipment?.oxygen
      ),
    },
  ];
  const renderSettingsPanel = (panel: NonNullable<typeof activeSettingsPanel>) => {
    if (panel === 'size') {
      return (
        <ConfigSection title={isEn ? "Dimensions" : "尺寸"} subtitle={isEn ? "Used for volume estimation and care advice." : "用于估算容量和后续养护建议。"}>
          <div className="grid grid-cols-3 gap-2">
            {dimensionFields.map(item => (
              <div key={item.key} className="grid gap-1.5">
                <Label className="text-[11px] font-bold text-ink/55">{item.label} (cm)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={(settingsForm.dimensions as any)?.[item.key] || ''}
                  onChange={e => setSettingsForm({
                    ...settingsForm,
                    dimensions: {
                      length: settingsForm.dimensions?.length || '',
                      width: settingsForm.dimensions?.width || '',
                      height: settingsForm.dimensions?.height || '',
                      [item.key]: e.target.value,
                    }
                  })}
                  className="h-10 rounded-[12px] bg-bg text-sm font-bold md:w-[220px]"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] bg-emerald-50/70 p-3">
            <div>
              <div className="text-[10px] font-black text-ink/45">{isEn ? 'Gross Capacity' : '理论容量'}</div>
              <div className="mt-1 text-2xl font-black text-ink">{settingsGrossVolumeLiters > 0 ? `${settingsGrossVolumeLiters}L` : '--'}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-ink/45">{isEn ? 'Estimated Water Volume' : '估算实际水量'}</div>
              <div className="mt-1 text-2xl font-black text-emerald-700">{settingsEstimatedWaterLiters > 0 ? `${settingsEstimatedWaterLiters}L` : '--'}</div>
            </div>
          </div>
        </ConfigSection>
      );
    }

    if (panel === 'parameters') {
      return (
        <ConfigSection title={isEn ? "Parameters" : "参数"} subtitle={isEn ? "Keep water parameters stable. Avoid frequent drastic changes." : "新手优先保持稳定，不要频繁大幅调整。"}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'Freshwater', label: '淡水', description: '常见观赏鱼' },
              { value: 'Saltwater', label: '海水', description: '海水生物' },
              { value: 'Brackish', label: '汽水', description: '暂未支持', disabled: true },
            ].map(option => (
              <SelectableOptionCard
                key={option.value}
                label={option.label}
                description={option.description}
                selected={settingsForm.waterType === option.value}
                disabled={option.disabled}
                onClick={() => updateSettingsWaterType(option.value as NonNullable<Aquarium['waterType']>)}
              />
            ))}
          </div>
          <div className="mt-3 grid gap-1.5">
            <Label className="text-[11px] font-bold text-ink/55">{isEn ? 'Target Temp (°C)' : '目标温度 (°C)'}</Label>
            <Input
              type="number"
              value={settingsForm.targetTemperature || ''}
              onChange={e => setSettingsForm({ ...settingsForm, targetTemperature: e.target.value })}
              className="h-10 rounded-[12px] bg-bg text-sm font-bold md:w-[220px]"
            />
          </div>
        </ConfigSection>
      );
    }

    if (panel === 'substrate') {
      return (
        <ConfigSection
          title={isEn ? "Substrate / Hardscape" : "底砂 / 造景"}
          subtitle={isEn ? "Select one substrate type. Hardscape items can be multi-selected." : "底砂单选，硬景可多选。"}
          actionText={isScapeListExpanded ? '收起' : '查看全部'}
          onAction={() => setIsScapeListExpanded(prev => !prev)}
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {visibleScapeOptions.map(option => {
              const currentHardscape = settingsForm.hardscape || [];
              const isSelected = option.type === 'substrate'
                ? option.value === currentSubstrate
                : currentHardscape.includes(option.value);
              return (
                <SelectableOptionCard
                  key={option.id}
                label={option.label}
                description={option.type === 'substrate' ? (isEn ? `Substrate · ${option.hint}` : `底砂 · ${option.hint}`) : (isEn ? `Hardscape · ${option.hint}` : `硬景 · ${option.hint}`)}
                  selected={isSelected}
                  mode={option.type === 'substrate' ? 'single' : 'multi'}
                  visual={option.type === 'hardscape' ? (
                    <ResilientImage src={getSpeciesDisplayImage(option)} alt={option.label} className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <span className={`h-6 w-6 rounded-full border ${
                      option.value === '无' ? 'border-dashed border-ink/30 bg-white' :
                      option.value === '水草泥' || option.value === '黑金沙' ? 'border-stone-700 bg-stone-800' :
                      option.value === '溪流砂' || option.value === '碎石' || option.value === '鹅卵石' ? 'border-stone-400 bg-stone-300' :
                      option.value === '珊瑚砂' || option.value === '化妆砂' ? 'border-amber-100 bg-amber-50' :
                      option.value === '陶粒' ? 'border-orange-600 bg-orange-500' :
                      'border-amber-300 bg-amber-200'
                    }`} />
                  )}
                  onClick={() => {
                    if (option.type === 'substrate') {
                      setSettingsForm({ ...settingsForm, substrate: option.value });
                      return;
                    }
                    setSettingsForm({
                      ...settingsForm,
                      hardscape: isSelected
                        ? currentHardscape.filter(value => value !== option.value)
                        : [...currentHardscape, option.value]
                    });
                  }}
                />
              );
            })}
          </div>
        </ConfigSection>
      );
    }

    if (panel === 'plants') {
      return (
        <ConfigSection
          title={isEn ? "Aquatic Plants" : "水草"}
          subtitle={isEn ? "Select aquatic plant species currently in the tank." : "选择当前鱼缸里的水草种类。"}
          actionText={isPlantListExpanded ? '收起' : '查看全部'}
          onAction={() => setIsPlantListExpanded(prev => !prev)}
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {visiblePlantOptions.map(plant => {
              const current = settingsForm.plants || [];
              const isSelected = current.includes(plant.id) || current.includes(plant.name);
              return (
                <SelectableOptionCard
                  key={plant.id}
                  label={plant.name}
                  description={plant.scientificName}
                  selected={isSelected}
                  mode="multi"
                  visual={<ResilientImage src={getSpeciesDisplayImage(plant)} alt={plant.name} className="h-full w-full object-contain p-0.5" />}
                  onClick={() => {
                    setSettingsForm({
                      ...settingsForm,
                      plants: isSelected
                        ? current.filter(p => p !== plant.id && p !== plant.name)
                        : [...current, plant.id]
                    });
                  }}
                />
              );
            })}
          </div>
        </ConfigSection>
      );
    }

    if (panel === 'lighting') {
      return (
        <ConfigSection title={isEn ? "Lighting" : "灯光"} subtitle={isEn ? "Select lighting for planted tank or reef display." : "选择草缸和观赏所需灯光。"}>
          <div className="grid grid-cols-2 gap-2">
            {['无', '普通灯', '水草灯', '海水灯'].map(option => (
              <SelectableOptionCard
                key={option}
                label={option}
                selected={(settingsForm.equipment?.light || '普通灯') === option}
                onClick={() => setSettingsForm({
                  ...settingsForm,
                  equipment: { ...(settingsForm.equipment || {}), light: option as any }
                })}
              />
            ))}
          </div>
        </ConfigSection>
      );
    }

    return (
      <ConfigSection title={isEn ? "Equipment" : "设备"} subtitle={isEn ? "Select one filter. Enable heater & aeration as needed." : "过滤单选，加热与氧气按需开启。"}>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {['无', '瀑布过滤', '桶滤', '上滤', '海绵过滤'].map(option => (
              <SelectableOptionCard
                key={option}
                label={option}
                selected={(settingsForm.equipment?.filter || '瀑布过滤') === option}
                onClick={() => setSettingsForm({
                  ...settingsForm,
                  equipment: { ...(settingsForm.equipment || {}), filter: option as any }
                })}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'heater', label: '加热棒', description: '低温或热带鱼建议开启' },
              { key: 'oxygen', label: '氧气 / 气泡石', description: '高密度或虾缸可开启' },
            ].map(device => {
              const isSelected = Boolean((settingsForm.equipment as any)?.[device.key]);
              return (
                <SelectableOptionCard
                  key={device.key}
                  label={device.label}
                  description={device.description}
                  selected={isSelected}
                  mode="multi"
                  onClick={() => setSettingsForm({
                    ...settingsForm,
                    equipment: {
                      ...(settingsForm.equipment || {}),
                      [device.key]: !isSelected
                    }
                  })}
                />
              );
            })}
          </div>
        </div>
      </ConfigSection>
    );
  };
  const recommendationHint = singleOnlyFishes.length > 0
    ? `缸内有${singleOnlyFishes.slice(0, 2).map(fish => fish.name).join('、')}这类更适合单养的生物，以下只作为同水体低风险参考。`
    : tankVolumeLiters > 0 && currentBioLoadLiters >= tankVolumeLiters * 0.9
      ? `当前鱼缸约 ${tankVolumeLiters}L，负载偏高，以下仅展示较低风险候选，添加前建议先减密度或升级鱼缸。`
      : currentFishesDetails.length > 0
        ? `已根据缸内${recommendationNames}${currentFishesDetails.length > 2 ? '等生物' : ''}的水温、pH、体型、性格和鱼缸容量筛选。`
        : '当前为空缸，优先推荐新手友好、后续好混养的起步生物。';
  const noRecommendationHint = singleOnlyFishes.length > 0
    ? `${singleOnlyFishes.slice(0, 2).map(fish => fish.name).join('、')}更适合单独饲养，当前不建议继续新增混养生物。`
    : tankVolumeLiters > 0 && currentBioLoadLiters >= tankVolumeLiters * 0.9
      ? `当前鱼缸约 ${tankVolumeLiters}L，生物负载已经偏高，先不要继续加鱼会更安全。`
      : '当前鱼缸的水质区间或体型性格组合比较敏感，暂时没有足够安全的新增候选。';
  const archiveOwnedById = new Map<string, {
    fish: Fish;
    quantity: number;
    acquiredDate: string;
    source: 'stocked' | 'plant' | 'hardscape' | 'substrate';
  }>();

  activeAquarium.fishes.forEach(aqFish => {
    const fish = fishData.find(item => item.id === aqFish.fishId);
    if (!fish) return;
    const existing = archiveOwnedById.get(fish.id);
    archiveOwnedById.set(fish.id, {
      fish,
      quantity: (existing?.quantity || 0) + Math.max(1, aqFish.quantity || 1),
      acquiredDate: existing?.acquiredDate || aqFish.entryDate,
      source: 'stocked',
    });
  });

  (activeAquarium.plants || []).forEach(value => {
    const plant = fishData.find(item => (item.id === value || item.name === value) && isAquaticPlantSpecies(item));
    if (!plant || archiveOwnedById.has(plant.id)) return;
    archiveOwnedById.set(plant.id, {
      fish: plant,
      quantity: 1,
      acquiredDate: activeAquarium.lastWaterChangeDate || new Date().toISOString(),
      source: 'plant',
    });
  });

  const substrateSpecies = getSubstrateArchiveSpecies(activeAquarium.substrate);
  if (substrateSpecies && !archiveOwnedById.has(substrateSpecies.id)) {
    archiveOwnedById.set(substrateSpecies.id, {
      fish: substrateSpecies,
      quantity: 1,
      acquiredDate: activeAquarium.lastWaterChangeDate || new Date().toISOString(),
      source: 'substrate',
    });
  }

  (activeAquarium.hardscape || []).forEach(value => {
    const hardscape = fishData.find(item => (item.id === value || item.name === value) && isHardscapeSpecies(item));
    if (!hardscape || archiveOwnedById.has(hardscape.id)) return;
    archiveOwnedById.set(hardscape.id, {
      fish: hardscape,
      quantity: 1,
      acquiredDate: activeAquarium.lastWaterChangeDate || new Date().toISOString(),
      source: 'hardscape',
    });
  });

  const activeConfiguredSettingCount = [
    activeAquarium.dimensions?.length && activeAquarium.dimensions?.width && activeAquarium.dimensions?.height,
    activeAquarium.waterType,
    activeAquarium.targetTemperature,
    activeAquarium.substrate,
    (activeAquarium.plants || []).length > 0,
    (activeAquarium.hardscape || []).length > 0,
    activeAquarium.equipment?.filter,
    activeAquarium.equipment?.light,
    typeof activeAquarium.equipment?.heater === 'boolean',
    typeof activeAquarium.equipment?.oxygen === 'boolean',
  ].filter(Boolean).length;
  type TankConfiguredContentItem = {
    id: string;
    fish: Fish | null;
    name: string;
    category: string;
    quantity: number;
    acquiredDate: string;
    source: 'stocked' | 'plant' | 'hardscape' | 'substrate' | 'equipment';
    description: string;
  };
  const tankConfiguredContentItems: TankConfiguredContentItem[] = Array.from(archiveOwnedById.values()).map(item => ({
    id: `${item.source}-${item.fish.id}`,
    fish: item.fish,
    name: item.fish.name,
    category: getArchiveCategory(item.fish),
    quantity: item.quantity,
    acquiredDate: item.acquiredDate,
    source: item.source,
    description: item.source === 'stocked'
      ? `数量 ${item.quantity}`
      : item.source === 'plant'
        ? '已配置水草'
        : item.source === 'substrate'
          ? (isEn ? 'Current Substrate' : '当前底砂')
          : (isEn ? 'Configured Hardscape' : '已配置造景'),
  }));
  if (activeAquarium.substrate && activeAquarium.substrate !== '无' && !tankConfiguredContentItems.some(item => item.category === '底砂' || item.category === 'Substrate')) {
    const substrateMeta = substrateOptions.find(item => item.value === activeAquarium.substrate);
    tankConfiguredContentItems.push({
      id: `substrate-${activeAquarium.substrate}`,
      fish: null,
      name: isEn ? (substrateMeta?.labelEn || activeAquarium.substrate) : (substrateMeta?.label || activeAquarium.substrate),
      category: isEn ? 'Substrate' : '底砂',
      quantity: 1,
      acquiredDate: activeAquarium.lastWaterChangeDate || new Date().toISOString(),
      source: 'substrate',
      description: substrateMeta ? (isEn ? `Current Substrate · ${substrateMeta.hintEn}` : `当前底砂 · ${substrateMeta.hint}`) : (isEn ? 'Current substrate setup' : '当前底砂配置'),
    });
  }
  const equipmentSummaryItems = [
    activeAquarium.equipment?.filter && (isEn 
      ? `Filter: ${t(`aquarium.${filterOptionKeys[activeAquarium.equipment.filter] || 'none'}`) || activeAquarium.equipment.filter}`
      : (isEn ? `Filter: ${getFilterLocalized(activeAquarium.equipment.filter, true)}` : `过滤：${activeAquarium.equipment.filter}`)),
    activeAquarium.equipment?.light && (isEn 
      ? `Lighting: ${t(`aquarium.${lightOptionKeys[activeAquarium.equipment.light] || 'none'}`) || activeAquarium.equipment.light}`
      : (isEn ? `Light: ${getLightLocalized(activeAquarium.equipment.light, true)}` : `灯光：${activeAquarium.equipment.light}`)),
    typeof activeAquarium.equipment?.heater === 'boolean' && (activeAquarium.equipment.heater 
      ? (isEn ? 'Heater: On' : '加热棒：已开启') 
      : (isEn ? 'Heater: Off' : '加热棒：未开启')),
    typeof activeAquarium.equipment?.oxygen === 'boolean' && (activeAquarium.equipment.oxygen 
      ? (isEn ? 'Aeration: On' : '氧气：已开启') 
      : (isEn ? 'Aeration: Off' : '氧气：未开启')),
  ].filter(Boolean) as string[];
  if (equipmentSummaryItems.length > 0) {
    tankConfiguredContentItems.push({
      id: 'equipment-summary',
      fish: null,
      name: isEn ? 'Equipment Setup' : '设备配置',
      category: isEn ? 'Equipment' : '设备',
      quantity: equipmentSummaryItems.length,
      acquiredDate: activeAquarium.lastWaterChangeDate || new Date().toISOString(),
      source: 'equipment',
      description: equipmentSummaryItems.slice(0, 2).join(' · '),
    });
  }
  const ownedArchivePreviewItems = tankConfiguredContentItems
    .filter(item => item.fish)
    .slice(0, 4);
  const hasEnvironmentContent = tankConfiguredContentItems.some(item => ['水草', '底砂', '造景', '设备'].includes(item.category));
  // Water change calculation
  const shortestCycle = currentFishesDetails.length > 0 ? Math.min(...currentFishesDetails.map(f => f.waterChangeCycle)) : 7;
  const lastChangeDate = activeAquarium.lastWaterChangeDate ? new Date(activeAquarium.lastWaterChangeDate) : null;
  const nextChangeDate = lastChangeDate ? addDays(lastChangeDate, shortestCycle) : null;
  const daysUntilChange = nextChangeDate ? differenceInDays(nextChangeDate, new Date()) : null;
  const isChangeOverdue = daysUntilChange !== null && daysUntilChange < 0;
  const scorePatrolRecord = findDailyPatrolRecord(diagnosisRecords, activeAquarium.id);

  const calculateHealthScore = () => {
    if (!activeAquarium) return 100;
    let score = 100;
    
    // Deduct for overdue water change
    if (isChangeOverdue) {
      score -= Math.min(Math.abs(daysUntilChange || 0) * 5, 30); // up to 30 points
    }

    // Deduct for conflicts
    if (conflicts.length > 0) {
      score -= conflicts.length * 15;
    }

    // Deduct for temperature mismatch (simplified)
    if (activeAquarium.targetTemperature) {
      const temp = parseInt(activeAquarium.targetTemperature);
      if (temp < 20 || temp > 30) {
        score -= 10;
      }
    }

    if (scorePatrolRecord?.riskCode === 'high') score -= 25;
    else if (scorePatrolRecord?.riskCode === 'medium') score -= 10;
    else if (scorePatrolRecord?.riskCode === 'unknown') score -= 5;

    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();
  const waterChangedToday = (activeAquarium.waterChangeHistory || []).includes(format(new Date(), 'yyyy-MM-dd'));
  const waterChangeHistory = activeAquarium.waterChangeHistory || [];
  const latestWaterChangeDate = waterChangeHistory.length > 0
    ? waterChangeHistory[waterChangeHistory.length - 1]
    : activeAquarium.lastWaterChangeDate
      ? format(new Date(activeAquarium.lastWaterChangeDate), 'yyyy-MM-dd')
      : '';
  const nextSuggestedWaterChangeDate = latestWaterChangeDate
    ? format(addDays(new Date(latestWaterChangeDate), shortestCycle), 'yyyy/MM/dd')
    : '暂无';
  const selectedWaterDateHasRecord = waterChangeHistory.includes(selectedWaterChangeDate);
  const totalStockedQuantity = activeAquarium.fishes.reduce((sum, fish) => sum + Math.max(1, fish.quantity || 1), 0);
  const stockedSpeciesCount = new Set(activeAquarium.fishes.map(fish => fish.fishId)).size;
  const hasStockedAnimals = totalStockedQuantity > 0;
  const hasDimensionConfig = Boolean(
    activeAquarium.dimensions?.length
    && activeAquarium.dimensions?.width
    && activeAquarium.dimensions?.height
  );
  const hasWaterConfig = Boolean(activeAquarium.waterType && activeAquarium.targetTemperature);
  const hasEquipmentConfig = Boolean(
    activeAquarium.equipment?.filter
    || activeAquarium.equipment?.light
    || typeof activeAquarium.equipment?.heater === 'boolean'
    || typeof activeAquarium.equipment?.oxygen === 'boolean'
  );
  const isBasicConfigComplete = hasDimensionConfig && hasWaterConfig && hasEquipmentConfig;
  const hasAppliedBuildPlan = Boolean(
    activeAquarium.substrate
    || (activeAquarium.plants?.length || 0) > 0
    || (activeAquarium.hardscape?.length || 0) > 0
  );
  const configSummaryText = isBasicConfigComplete
    ? `${activeAquarium.dimensions?.length}x${activeAquarium.dimensions?.width}x${activeAquarium.dimensions?.height}cm · ${activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · ${activeAquarium.targetTemperature}℃`
    : '先确认尺寸、水体、温度和设备。';
  const hasFishLikeSpecies = currentFishesDetails.some(fish => ['freshwaterFish', 'saltwaterFish', 'reptile'].includes(getLifeType(fish)));
  const hasOnlyInvertebrates = hasStockedAnimals && !hasFishLikeSpecies && currentFishesDetails.some(fish => getLifeType(fish) === 'invertebrate');
  const tankHealthStatus = healthScore < 60 || conflicts.length > 0 ? '风险' : healthScore < 80 || isChangeOverdue || (daysUntilChange !== null && daysUntilChange <= 1) ? '提醒' : '正常';
  const waterTaskStatus: TodayTaskStatus = waterChangedToday ? '已完成' : isChangeOverdue ? '建议处理' : daysUntilChange !== null && daysUntilChange <= 1 ? '待处理' : '观察';
  const feedingTaskStatus: TodayTaskStatus = !hasStockedAnimals ? '观察' : fedToday ? '已完成' : '观察';
  const heaterNeedsAttention = heaterSpeciesCount > 0 && !activeAquarium.equipment?.heater;
  const equipmentTaskStatus: TodayTaskStatus = heaterNeedsAttention ? '建议处理' : '已完成';
  const observeTaskStatus: TodayTaskStatus = conflicts.length > 0 ? '建议处理' : '观察';
  const diagnosisTankSummary = getDiagnosisTankSummary();
  const activeDiagnosisProblemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
  const activeDiagnosisQuestions = getDiagnosisQuestions(activeDiagnosisProblemType, diagnosisQuizAnswers);
  const activeDiagnosisQuestion = activeDiagnosisQuestions[diagnosisQuestionIndex];
  const currentDiagnosisAnswer = activeDiagnosisQuestion ? diagnosisQuizAnswers[activeDiagnosisQuestion.id] || '' : '';
  const isDailyCheckQuiz = diagnosisMode === 'quiz' && activeDiagnosisProblemType === '巡检';
  const dailyCheckRequiredQuestions = activeDiagnosisQuestions.filter(question => !question.optionalText);
  const dailyCheckAnsweredCount = dailyCheckRequiredQuestions.filter(question => Boolean(diagnosisQuizAnswers[question.id])).length;
  const isDailyCheckReady = dailyCheckRequiredQuestions.length > 0
    && dailyCheckAnsweredCount === dailyCheckRequiredQuestions.length;
  const hasUnsavedDiagnosisDraft = !isDiagnosisRecordSaved
    && Object.values(diagnosisQuizAnswers).some(value => value.trim().length > 0);
  const requestDiagnosisClose = () => {
    if (hasUnsavedDiagnosisDraft) {
      setIsDiagnosisExitConfirmOpen(true);
      return;
    }
    setIsDiagnosisOpen(false);
  };
  const discardDiagnosisDraftAndClose = () => {
    setDiagnosisQuizAnswers({});
    setDiagnosisText('');
    setDiagnosisFullText('');
    setDiagnosisSaveMessage('');
    setIsDiagnosisRecordSaved(false);
    setDiagnosisMode('home');
    setIsDiagnosisExitConfirmOpen(false);
    setIsDiagnosisOpen(false);
  };
  const diagnosisProgressPercent = activeDiagnosisQuestions.length > 0
    ? ((diagnosisQuestionIndex + 1) / activeDiagnosisQuestions.length) * 100
    : 0;
  const recentDiagnosisRecords = diagnosisRecords
    .filter(record => record.aquariumId === diagnosisTankSummary.aquariumId)
    .slice(0, 3);
  const todayTaskCount = [
    waterTaskStatus,
    equipmentTaskStatus,
    observeTaskStatus,
  ]
    .filter(status => status === '待处理' || status === '建议处理').length;
  const waterChangeOverdueDays = isChangeOverdue ? Math.abs(daysUntilChange || 0) : 0;
  const dailyAdviceMissingData = [
    ...(!latestWaterChangeDate ? ['上次换水记录'] : []),
    ...(!activeAquarium.targetTemperature ? ['当前水温'] : []),
  ];
  const knownRiskLevel = conflicts.length >= 3 ? 'high' : conflicts.length > 0 ? 'medium' : 'none_recorded';
  const todayDailyCheckRecord = scorePatrolRecord;
  const unresolvedPatrol = todayDailyCheckRecord && ['high', 'medium', 'unknown'].includes(todayDailyCheckRecord.riskCode || 'unknown')
    ? todayDailyCheckRecord
    : null;
  const blockingCompatibilityRisk = tankRiskItems.find(item => item.severity === 'danger');
  const overdueCareReminder = activeCareReminders.find(reminder => getCareReminderStatus(reminder) === 'overdue');
  const todayCareReminder = activeCareReminders.find(reminder => getCareReminderStatus(reminder) === 'today');
  const batchCareSignal = getAquariumBatchCareSignal(activeAquarium.fishes, Boolean(isEn));
  const batchCareSpecies = batchCareSignal
    ? fishData.find(item => item.id === activeAquarium.fishes.find(record => record.id === batchCareSignal.speciesRecordId)?.fishId)
    : undefined;
  const batchCareSpeciesName = batchCareSpecies ? getSpeciesNameLocalized(batchCareSpecies, Boolean(isEn)) : '';
  const batchCareReason = batchCareSignal
    ? `${batchCareSpeciesName ? `${batchCareSpeciesName}：` : ''}${batchCareSignal.reason}`
    : '';

  let dailyActionTask: DailyActionTask;
  if (unresolvedPatrol) {
    dailyActionTask = {
      id: unresolvedPatrol.diagnosisId,
      actionType: 'urgent_recovery',
      title: '继续处理今天发现的异常',
      priority: 'high',
      reason: unresolvedPatrol.resultSummary || '今天的巡检仍有需要继续观察或处理的异常。',
      evidence: '来自今天保存的每日鱼缸检查',
      primaryLabel: '继续处理异常',
      targetId: unresolvedPatrol.diagnosisId,
      trigger: { type: 'user_reported_abnormality', source: 'user_observation' },
    };
  } else if (blockingCompatibilityRisk) {
    dailyActionTask = {
      id: `compatibility-${activeAquarium.id}`,
      actionType: 'compatibility_review',
      title: '先处理缸内混养风险',
      priority: 'high',
      reason: blockingCompatibilityRisk.title,
      evidence: blockingCompatibilityRisk.detail,
      primaryLabel: '查看混养风险',
      trigger: { type: 'new_species_added', source: 'aquarium_stock' },
    };
  } else if (overdueCareReminder) {
    dailyActionTask = {
      id: overdueCareReminder.id,
      actionType: 'care_plan',
      title: overdueCareReminder.title,
      priority: 'high',
      reason: '这项养护计划已经逾期，今天先完成并记录结果。',
      evidence: `计划日期：${format(new Date(overdueCareReminder.scheduledFor), 'yyyy/MM/dd')}`,
      primaryLabel: '查看操作指引',
      targetId: overdueCareReminder.id,
      trigger: { type: 'maintenance_overdue', source: 'maintenance_schedule' },
    };
  } else if (!waterChangedToday && isChangeOverdue) {
    dailyActionTask = {
      id: `water-change-${activeAquarium.id}`,
      actionType: 'water_change',
      title: '记录本次换水',
      priority: 'high',
      reason: `换水计划已逾期 ${waterChangeOverdueDays} 天。`,
      evidence: latestWaterChangeDate ? `上次换水：${latestWaterChangeDate}` : '还没有可用的上次换水记录',
      primaryLabel: '记录本次换水',
      trigger: { type: 'maintenance_overdue', source: latestWaterChangeDate ? 'water_change_record' : 'maintenance_schedule' },
    };
  } else if (todayCareReminder) {
    dailyActionTask = {
      id: todayCareReminder.id,
      actionType: 'care_plan',
      title: todayCareReminder.title,
      priority: 'medium',
      reason: '这项养护计划今天到期。',
      evidence: `计划日期：${format(new Date(todayCareReminder.scheduledFor), 'yyyy/MM/dd')}`,
      primaryLabel: '查看操作指引',
      targetId: todayCareReminder.id,
      trigger: { type: 'maintenance_due', source: 'maintenance_schedule' },
    };
  } else if (!waterChangedToday && daysUntilChange !== null && daysUntilChange <= 1) {
    dailyActionTask = {
      id: `water-change-${activeAquarium.id}`,
      actionType: 'water_change',
      title: '记录本次换水',
      priority: 'medium',
      reason: '换水计划今天需要处理。',
      evidence: latestWaterChangeDate ? `上次换水：${latestWaterChangeDate}` : '还没有可用的上次换水记录',
      primaryLabel: '记录本次换水',
      trigger: { type: 'maintenance_due', source: latestWaterChangeDate ? 'water_change_record' : 'maintenance_schedule' },
    };
  } else if (!todayDailyCheckRecord) {
    dailyActionTask = {
      id: `daily-check-${activeAquarium.id}`,
      actionType: 'daily_check',
      title: batchCareSignal
        ? (isEn ? `Check ${batchCareSpeciesName || 'livestock'} today` : `今天重点观察${batchCareSpeciesName || '缸内生物'}`)
        : (isEn ? 'Complete today’s aquarium check' : '完成今天的鱼缸检查'),
      priority: batchCareSignal?.priority === 'important' ? 'medium' : 'normal',
      reason: batchCareSignal
        ? batchCareReason
        : (isEn ? 'No aquarium check has been recorded for today.' : '今天还没有记录鱼群、水面和气味是否正常。'),
      evidence: batchCareSignal
        ? (isEn ? 'Based on the recorded life or reproductive stage and today’s missing check.' : '基于已记录体态与今天尚未完成的巡检')
        : (isEn ? 'No aquarium check is recorded for this tank today.' : '当前鱼缸今天没有巡检记录'),
      primaryLabel: batchCareSignal
        ? (isEn ? 'Start focused check' : '开始重点观察')
        : (isEn ? 'Start today’s check' : '开始今日检查'),
      trigger: {
        type: 'scheduled_task',
        source: 'user_observation',
        value: batchCareSignal ? { lifeStageSignal: batchCareSignal.code } : undefined,
      },
    };
  } else if (batchCareSignal) {
    dailyActionTask = {
      id: `life-stage-${batchCareSignal.speciesRecordId}-${batchCareSignal.code}`,
      actionType: 'life_stage_observation',
      title: batchCareSignal.title,
      priority: batchCareSignal.priority === 'important' ? 'medium' : 'normal',
      reason: batchCareReason,
      evidence: isEn ? 'Based on the life and reproductive states you recorded.' : '基于你记录的生长阶段与繁殖状态',
      primaryLabel: isEn ? 'View observation focus' : '查看观察重点',
      targetId: batchCareSignal.speciesRecordId,
      trigger: {
        type: 'scheduled_task',
        source: 'aquarium_stock',
        value: { lifeStageSignal: batchCareSignal.code },
      },
    };
  } else {
    dailyActionTask = {
      id: `routine-${activeAquarium.id}`,
      actionType: 'routine',
      title: '今天没有必须处理',
      priority: 'normal',
      reason: '今日检查已完成，当前没有到期计划或阻断级风险。',
      evidence: '基于今天的巡检、养护计划和混养规则记录',
      trigger: { type: 'scheduled_task', source: 'aquarium_stock' },
    };
  }

  const dailyActionLevel: AquariumStatusLevel = ['urgent_recovery', 'compatibility_review'].includes(dailyActionTask.actionType)
    ? 'urgent'
    : dailyActionTask.priority === 'high' || dailyActionTask.priority === 'medium'
      ? 'needs_attention'
      : 'normal';
  const dailyActionViewModel: DailyActionViewModel = {
    level: dailyActionLevel,
    label: dailyActionLevel === 'urgent' ? '优先处理' : dailyActionLevel === 'needs_attention' ? '今天完成' : dailyActionTask.actionType === 'routine' ? '已完成' : '今日待办',
    sourceLabel: dailyActionTask.actionType === 'care_plan' || dailyActionTask.actionType === 'water_change' ? '基于养护记录' : dailyActionTask.actionType === 'urgent_recovery' || dailyActionTask.actionType === 'daily_check' ? '基于巡检记录' : '基于鱼缸规则',
    status: {
      pendingTaskCount: dailyActionTask.actionType === 'routine' ? 0 : 1,
      maintenanceStatus: waterChangedToday ? 'normal' : isChangeOverdue ? 'overdue' : daysUntilChange !== null && daysUntilChange <= 1 ? 'due' : 'normal',
      knownRiskLevel,
      dataStatus: dailyAdviceMissingData.length === 0 ? 'sufficient' : dailyAdviceMissingData.length >= 2 ? 'insufficient' : 'partial',
      missingData: dailyAdviceMissingData,
    },
    task: dailyActionTask,
    reasoning: [
      dailyActionTask.evidence,
      conflicts.length > 0 ? `当前记录了 ${conflicts.length} 条混养提醒。` : '当前没有阻断级混养记录。',
      dailyAdviceMissingData.length > 0 ? `尚缺：${dailyAdviceMissingData.join('、')}。` : '关键维护信息已有记录。',
    ],
  };
  const aquariumAgeDays = activeAquarium.startedAt
    ? Math.max(0, differenceInDays(new Date(), new Date(activeAquarium.startedAt)))
    : 0;
  const artifactHealthStatus = isEn
    ? tankHealthStatus === '风险' ? 'Risk' : tankHealthStatus === '提醒' ? 'Attention' : 'Normal'
    : tankHealthStatus;
  const artifactMissingData = isEn
    ? [
      ...(!latestWaterChangeDate ? ['Last water change record'] : []),
      ...(!activeAquarium.targetTemperature ? ['Current water temperature'] : []),
    ]
    : dailyAdviceMissingData;
  const artifactNextAction = isEn
    ? ({
      urgent_recovery: 'Continue handling the issue found today',
      compatibility_review: 'Review the aquarium compatibility risk',
      care_plan: 'Complete the due care plan',
      water_change: 'Record this water change',
      daily_check: 'Complete today’s aquarium check',
      life_stage_observation: 'Review the recorded life-stage observation focus',
      routine: 'Continue routine observation',
    } satisfies Record<DailyActionTask['actionType'], string>)[dailyActionTask.actionType]
    : dailyActionTask.title;
  const artifactHealthReasons = isEn
    ? [
      dailyActionTask.actionType === 'urgent_recovery'
        ? 'Based on today’s saved aquarium check.'
        : dailyActionTask.actionType === 'compatibility_review'
          ? 'A blocking compatibility risk is recorded.'
          : dailyActionTask.actionType === 'care_plan'
            ? 'Based on the current care plan schedule.'
            : dailyActionTask.actionType === 'water_change'
              ? 'Based on the recorded water-change schedule.'
              : dailyActionTask.actionType === 'daily_check'
                ? 'No aquarium check has been recorded today.'
                : 'Today’s aquarium check and care schedule are up to date.',
      conflicts.length > 0
        ? `${conflicts.length} compatibility ${conflicts.length === 1 ? 'notice is' : 'notices are'} recorded.`
        : 'No blocking compatibility risk is recorded.',
      artifactMissingData.length > 0
        ? `Missing: ${artifactMissingData.join(', ')}.`
        : 'Key care information is recorded.',
    ]
    : dailyActionViewModel.reasoning;
  const artifactContext: AquariumArtifactContext = {
    aquarium: activeAquarium,
    healthScore,
    healthStatus: artifactHealthStatus,
    healthReasons: artifactHealthReasons,
    missingData: artifactMissingData,
    nextAction: artifactNextAction,
    species: activeAquarium.fishes.map(record => {
      const fish = fishData.find(item => item.id === record.fishId);
      return { catalogKey: record.fishId, name: fish ? getSpeciesNameLocalized(fish, isEn) : record.fishId, quantity: record.quantity };
    }),
    careReminders,
    latestDiagnosis: diagnosisResult ? toDiagnosisOutput(diagnosisResult) : undefined,
    isEn,
  };
  const openExportArtifact = (content: ExportArtifactContent) => setExportArtifact(content);
  const confirmAquariumStartedAt = async (startedAt: string) => {
    if (!startedAt || isSavingStartedAt) return;
    setIsSavingStartedAt(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      const saved = await repository.saveAquarium({
        ...activeAquarium,
        startedAt,
        startedAtSource: 'user',
        startedAtConfirmedAt: new Date().toISOString(),
      });
      setAquariums(current => current.map(item => item.id === saved.id ? saved : item));
      showToast(isEn ? 'Aquarium start date confirmed.' : '建缸日期已确认。');
    } finally {
      setIsSavingStartedAt(false);
    }
  };
  const createPrivateShare = async () => {
    if (isCreatingShare) return;
    setIsCreatingShare(true);
    try {
      const created = await createAquariumShareReport(activeAquarium.id, buildSanitizedAquariumReport(artifactContext));
      if (!created.shareUrl) throw new Error('分享链接没有生成成功。');
      setShareUrl(created.shareUrl);
      showToast(isEn ? 'Privacy-safe report created.' : '脱敏分享报告已生成。');
    } catch (error) {
      if (error instanceof AquaGuideApiError && error.code === 'AUTH_REQUIRED') {
        showToast(isEn ? 'Sign in to create a share link.' : '登录后才能生成分享链接。', 'error');
        navigateToRoute('/login');
        return;
      }
      showToast(error instanceof Error ? error.message : '分享报告暂时没有生成成功。', 'error');
    } finally {
      setIsCreatingShare(false);
    }
  };
  const localTemperatureHint = weatherStatus === 'ready' && localWeather?.temperatureC !== undefined
    ? `室外约 ${Math.round(localWeather.temperatureC)}°C，`
    : '';
  const feedingDescription = fedToday
    ? `已记录今日喂食，继续观察抢食和残饵。`
    : hasOnlyInvertebrates
      ? '以藻类和残饵为主，少量补充即可，避免过量坏水。'
      : '按鱼只状态少量投喂，2-3 分钟内吃完即可，不必机械固定每天同量。';
  const recommendedActionCandidates: Array<{
    id: string;
    title: string;
    status: ActionCenterStatus;
    description: string;
    actionText: string;
    icon: ReactNode;
    onAction: () => void;
    tone?: 'normal' | 'warning' | 'danger' | 'info' | 'muted';
  }> = hasStockedAnimals
    ? []
    : [
        ...(!isBasicConfigComplete ? [{
          id: 'setupAquarium',
          title: '完善鱼缸配置',
          status: '建议处理' as ActionCenterStatus,
          description: '补齐尺寸、温度和设备。',
          actionText: '去设置',
          icon: <Settings className="h-4 w-4" />,
          onAction: () => openAquariumSettings(),
          tone: 'warning' as const,
        }] : []),
        ...(isBasicConfigComplete ? [{
          id: 'buildPlan',
          title: hasAppliedBuildPlan ? '查看当前方案' : '选择搭建方案',
          status: hasAppliedBuildPlan ? '已完成' as ActionCenterStatus : '观察' as ActionCenterStatus,
          description: hasAppliedBuildPlan ? '可更换或调整方案。' : '先确定底床、设备和生物上限。',
          actionText: hasAppliedBuildPlan ? '查看方案' : '选方案',
          icon: <Layers3 className="h-4 w-4" />,
          onAction: () => setIsBuildPlanOpen(true),
        }] : []),
      ].slice(0, 1);
  const nextStepMessage = !hasStockedAnimals
    ? isBasicConfigComplete && hasAppliedBuildPlan
      ? '当前只保留一个最该做的动作。'
      : isBasicConfigComplete
        ? '先选一个安全搭建方向。'
        : '先把基础配置补齐。'
    : todayTaskCount > 0
      ? `今天有 ${todayTaskCount} 项建议处理。`
      : '今天暂无紧急任务，可以正常观察。';
  const dailyCheckStatus = !todayDailyCheckRecord
    ? (isEn ? 'Not Checked Today' : '今日未检查')
    : todayDailyCheckRecord.riskCode === 'high' || todayDailyCheckRecord.riskCode === 'medium' || todayDailyCheckRecord.riskCode === 'unknown'
      ? (isEn ? 'Re-check Recommended' : '建议重新检查')
      : (isEn ? 'Checked Today' : '今日已检查');
  const commonActions = [
    {
      id: 'dailyTankCheck',
      label: isEn ? 'Daily Tank Check' : '每日鱼缸检查',
      description: dailyCheckStatus,
      icon: <Activity className="h-4 w-4" />,
      onClick: handleOpenDailyCheck,
      tone: dailyCheckStatus === '建议重新检查' || dailyCheckStatus === 'Re-check Recommended' ? 'warning' as const : todayDailyCheckRecord ? 'normal' as const : 'info' as const,
      active: Boolean(todayDailyCheckRecord),
    },
    {
      id: 'recordWaterChange',
      label: isEn ? (waterChangedToday ? 'Undo Water Change' : 'Record Water Change') : (waterChangedToday ? '撤回换水记录' : '记录本次换水'),
      description: isEn ? (waterChangedToday ? 'Recorded Today' : 'Update Change Cycle') : (waterChangedToday ? '今日已记录' : '更新换水周期'),
      icon: <Droplets className="h-4 w-4" />,
      onClick: () => void handleTankWaterChange().catch(error => showToast(error instanceof Error ? error.message : '换水记录没有保存成功。', 'error')),
      tone: waterChangedToday ? 'normal' as const : waterTaskStatus === '建议处理' || waterTaskStatus === '待处理' ? 'warning' as const : 'info' as const,
      active: waterChangedToday,
    },
    {
      id: 'recordFeeding',
      label: isEn ? (fedToday ? 'Undo Feeding Record' : 'Record Feeding') : (fedToday ? '撤回喂食记录' : '记录本次喂食'),
      description: isEn ? (hasStockedAnimals ? (fedToday ? 'Recorded Today' : 'Light Feeding') : 'Add Livestock First') : (hasStockedAnimals ? (fedToday ? '今日已记录' : '少量投喂') : '添加生物后使用'),
      icon: <Heart className="h-4 w-4" />,
      onClick: () => {
        if (!hasStockedAnimals) {
          showToast(isEn ? 'No livestock in tank yet, add animals to record feeding.' : '鱼缸内还没有生物，添加后才能记录喂食', 'error');
          return;
        }
        setFedToday(prev => {
          const next = !prev;
          const today = format(new Date(), 'yyyy-MM-dd');
          const todayRecords = feedingRecords.filter(record => record.aquariumId === activeId && record.createdAt.startsWith(today));
          const createdRecord: LocalEventRecord = {
            id: Math.random().toString(36).substring(2, 9),
            aquariumId: activeId,
            createdAt: new Date().toISOString(),
            type: 'feeding',
            note: isEn ? 'Feeding Record' : '喂食记录',
          };
          const nextRecords = next
            ? [...feedingRecords, createdRecord]
            : feedingRecords.filter(record => !(record.aquariumId === activeId && record.createdAt.startsWith(today)));
          setFeedingRecords(nextRecords);
          patchLocalAppState({ feedingRecords: nextRecords });
          if (next) {
            void persistCareTimelineEvent({
              aquariumId: activeId,
              eventType: 'feeding',
              title: isEn ? 'Logged feeding' : '记录喂食',
              payload: {},
              occurredAt: createdRecord.createdAt,
              sourceType: 'feeding_record',
              sourceId: createdRecord.id,
              isInferred: false,
            }).catch(error => showToast(error instanceof Error ? error.message : '喂食时间线没有保存成功。', 'error'));
          } else {
            todayRecords.forEach(record => void removeCareTimelineEventBySource(activeId, 'feeding_record', record.id).catch(error => showToast(error instanceof Error ? error.message : '喂食时间线没有撤回成功。', 'error')));
          }
          setCareTimelineRevision(value => value + 1);
          setTankActionMessage(next ? (isEn ? `Recorded feeding: ${format(new Date(), 'HH:mm')}` : `已记录喂食：${format(new Date(), 'HH:mm')}`) : (isEn ? 'Undid feeding record' : '已撤回今日喂食记录'));
          return next;
        });
      },
      tone: !hasStockedAnimals ? 'muted' as const : fedToday ? 'normal' as const : 'info' as const,
      active: fedToday,
    },
    {
      id: 'recordExistingSpecies',
      label: isEn ? 'Record Existing Livestock' : '记录已有生物',
      description: isEn ? 'Save what is already in the tank' : '先保存现实情况，再看风险',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => openSpeciesAddition('record_existing'),
      tone: 'normal' as const,
    },
    {
      id: 'planSpecies',
      label: isEn ? 'Plan Livestock' : '规划想养的生物',
      description: isEn ? 'Assess before an actual addition' : '先判断，不直接写入鱼缸',
      icon: <BookOpen className="h-4 w-4" />,
      onClick: () => openSpeciesAddition('planned_addition'),
      tone: 'info' as const,
    },
    {
      id: 'smartRecommend',
      label: isEn ? 'AI Tank Copilot' : 'AI 建缸助手',
      description: isEn ? 'Set goal, fill info, view plan' : '说目标，补条件，看方案',
      icon: <Sparkles className="h-4 w-4" />,
      onClick: () => openTankBuildCopilot(),
      tone: 'normal' as const,
    },
    {
      id: 'viewRecords',
      label: isEn ? 'View Care Logs' : '查看养护记录',
      description: isEn ? 'History Logs' : '养护历史',
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => setIsCalendarOpen(true),
      tone: 'info' as const,
    },
  ];
  const visibleAquariumActions = commonActions
    .filter(action => action.id !== 'smartRecommend')
    .map(action => ({
    ...action,
    onClick: () => {
      trackSessionEvent('aquarium_primary_action_clicked', { action: action.id, status: action.active ? 'active' : 'available', entry: 'aquarium-home' });
      action.onClick();
    },
    }));
  const markPriorityTask = (id: string, status: string) => {
    setPriorityTaskStatus(prev => {
      const next = { ...prev, [id]: status };
      patchLocalAppState({ riskReminderState: next }, { debounce: true });
      return next;
    });
  };
  const riskReminderCount = Math.max(1, conflicts.length || todayTaskCount || (healthScore < 85 ? 1 : 0));
  const riskReminders = [
    ...(hasStockedAnimals ? [{
      id: 'observeBreathing',
      level: healthScore < 60 ? '紧急' : '建议观察',
      title: '观察鱼的呼吸状态',
      reason: '如果鱼浮头、急促呼吸或趴缸，可能需要处理。',
      actionText: priorityTaskStatus.observeBreathing || '开始观察',
      tone: healthScore < 60 ? 'danger' : 'warning',
      onClick: () => setIsObservationOpen(true),
    }] : []),
    ...(conflicts.length > 0 ? [{
      id: 'viewMixingRisk',
      level: '配置提醒',
      title: '查看混养风险',
      reason: `当前鱼缸内已有 ${totalStockedQuantity} 只/条生物，建议检查体型、性情或空间冲突。`,
      actionText: priorityTaskStatus.viewMixingRisk || '查看混养风险',
      tone: 'warning',
      onClick: () => {
        setIsConflictDialogOpen(true);
        markPriorityTask('viewMixingRisk', '已查看');
      },
    }] : []),
    ...((healthScore < 85 || isChangeOverdue) ? [{
      id: 'checkWater',
      level: '可选排查',
      title: '检查水体状态',
      reason: '如果水发白、发绿、有异味，再进入水质诊断。',
      actionText: priorityTaskStatus.checkWater || '开始水质自查',
      tone: 'info',
      onClick: () => {
        handleOpenDiagnosisWithType('水质异常');
      },
    }] : []),
  ];
  const structuredDiagnosis = diagnosisResult;
  const diagnosisVisualModel = structuredDiagnosis ? (() => {
    const deterministicResult: DiagnosisOutput = {
      riskLevel: structuredDiagnosis.riskLevel,
      riskLabel: structuredDiagnosis.risk,
      summary: structuredDiagnosis.verdict,
      currentAction: structuredDiagnosis.currentAction,
      actions: structuredDiagnosis.actions,
      avoidActions: structuredDiagnosis.avoid,
      possibleCauses: structuredDiagnosis.reasons,
      observeItems: structuredDiagnosis.observe,
      missingInfo: structuredDiagnosis.missing,
      evidence: structuredDiagnosis.evidence,
      keyMetrics: structuredDiagnosis.keyMetrics,
      matchedRules: [],
      matchedArticles: [],
      nextCheckAt: structuredDiagnosis.nextCheckAt,
    };
    const model = buildDiagnosisVisualResult({
      result: deterministicResult,
      answers: diagnosisQuizAnswers,
      aquariumName: diagnosisAquarium?.name || '当前鱼缸',
      livestock: getDiagnosisLivestock(diagnosisAquarium).map(item => item.fish),
      primaryActionLabel: diagnosisIssueType === '巡检' && dailyCheckArticles[0]
        ? '查看补救步骤'
        : diagnosisIssueType === '巡检'
          ? todayDailyCheckRecord ? '更新今天记录' : '保存今天记录'
          : '保存本次诊断',
      primaryActionType: diagnosisIssueType === '巡检' && dailyCheckArticles[0] ? 'dialog' : 'mutation',
    });
    if (dailyCheckInterpretation) {
      model.detailSections.push({
        id: 'interpretation',
        title: dailyCheckInterpretation.source === 'model' ? 'AI 补充解读' : '本地补充解读',
        items: [dailyCheckInterpretation.summary, ...dailyCheckInterpretation.reasoning, dailyCheckInterpretation.disclaimer].filter(Boolean),
      });
    }
    return model;
  })() : null;
  const handleVisualDiagnosisPrimary = () => {
    handleSaveDiagnosisRecord();
    if (diagnosisIssueType === '巡检' && dailyCheckArticles[0] && structuredDiagnosis) {
      setSelectedDailyCheckArticle(dailyCheckArticles[0]);
      trackSessionEvent('remedy_article_opened', { action: 'open', status: structuredDiagnosis.riskLevel, entry: 'daily-check-result' });
    }
  };
  const isTimelineOpen = new URLSearchParams(routeLocation.search).get('action') === 'timeline';
  if (isTimelineOpen) {
    void careTimelineRevision;
    const timelineItems = buildAquariumTimeline({
      aquarium: activeAquarium,
      species: fishData,
      diagnosisRecords,
      feedingRecords,
      reminders: careReminders,
      persistedEvents: careTimelineEvents,
    });
    return (
      <AquariumTimeline
        aquariumName={activeAquarium.name}
        items={timelineItems}
        reminders={careReminders.filter(reminder => !reminder.aquariumId || reminder.aquariumId === activeAquarium.id)}
        isEn={Boolean(isEn)}
        onBack={() => navigateToRoute('/aquarium')}
        onCreateRecurrence={handleCreateRecurrence}
        onChangeRecurrence={handleChangeRecurrence}
      />
    );
  }
  const isExportCenterOpen = new URLSearchParams(routeLocation.search).get('action') === 'exports';
  if (isExportCenterOpen) {
    const onboardingProgress = getOnboardingTaskProgress();
    const onboardingTasks = getOnboardingTasks(getOnboardingState()?.goal ?? 'build_tank', onboardingProgress);
    const checklistLabels = onboardingTasks.map(task => t(task.labelKey));
    const checklistStates = onboardingTasks.map(task => task.done);
    const items: ExportCenterItem[] = [
      { id: 'health', icon: 'health', title: isEn ? 'Aquarium health score' : '鱼缸健康评分卡', description: isEn ? 'Score, evidence, missing records and the next action.' : '健康分、主要依据、缺失记录和下一步。', content: buildHealthScoreArtifact(artifactContext) },
      { id: 'diagnosis', icon: 'diagnosis', title: isEn ? 'Diagnosis result' : '诊断结果图片', description: isEn ? 'Structured risk, actions, possible factors and review timing.' : '结构化风险、应急动作、可能原因和复查时间。', content: artifactContext.latestDiagnosis ? buildDiagnosisArtifact(artifactContext, artifactContext.latestDiagnosis) : undefined, unavailableReason: artifactContext.latestDiagnosis ? undefined : (isEn ? 'Complete an aquarium check first.' : '完成一次鱼缸检查后即可生成。') },
      { id: 'plan', icon: 'plan', title: isEn ? 'Weekly care plan' : '本周养护计划', description: isEn ? 'Monday-to-Sunday tasks and overdue items.' : '周一至周日任务和优先补做项目。', content: buildWeeklyCareArtifact(artifactContext) },
      { id: 'checklist', icon: 'checklist', title: isEn ? 'Starter checklist' : '新手开缸清单', description: isEn ? 'Your four real onboarding steps and the next task.' : '四项真实新手进度和唯一下一步。', content: buildStarterChecklistArtifact({ labels: checklistLabels, states: checklistStates, isEn }) },
      { id: 'archive', icon: 'archive', title: isEn ? 'Aquarium archive' : '鱼缸档案页', description: isEn ? 'Environment, equipment, livestock and recent care summary.' : '环境、设备、全部物种和近期养护摘要。', content: buildAquariumArchiveArtifact(artifactContext) },
      { id: 'milestone', icon: 'milestone', title: isEn ? 'Aquarium milestone' : '“我的鱼缸养了100天”记录', description: isEn ? 'A milestone card based on the confirmed aquarium start date.' : '根据已确认建缸日期生成的纪念卡。', content: activeAquarium.startedAtConfirmedAt && aquariumAgeDays >= 100 ? buildHundredDayArtifact(artifactContext, aquariumAgeDays) : undefined, unavailableReason: activeAquarium.startedAtConfirmedAt ? (isEn ? `Available after day 100. Current: ${aquariumAgeDays} days.` : `满 100 天后可生成，当前 ${aquariumAgeDays} 天。`) : (isEn ? 'Confirm the aquarium start date in the archive first.' : '请先在鱼缸档案确认建缸日期。') },
    ];
    return (
      <div className="page-frame-wide min-w-0 overflow-x-hidden">
        <AquariumExportCenter items={items} isEn={isEn} onBack={() => navigateToRoute('/aquarium')} onPreview={openExportArtifact} onCreateShare={() => void createPrivateShare()} isCreatingShare={isCreatingShare} shareUrl={shareUrl} onCopyShare={() => { void navigator.clipboard.writeText(shareUrl).then(() => showToast(isEn ? 'Link copied.' : '链接已复制。')).catch(() => showToast(isEn ? 'Could not copy the link.' : '暂时无法复制链接。', 'error')); }} />
        <ExportArtifactDialog open={Boolean(exportArtifact)} onOpenChange={open => { if (!open) setExportArtifact(null); }} content={exportArtifact} isEn={isEn} />
      </div>
    );
  }

  return (
    <div className="page-frame-wide aquarium-desktop-layout flex min-w-0 flex-col gap-4 overflow-x-hidden text-[13px] leading-relaxed">
      <aside className="aquarium-side hidden">
        <div className="grid gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAquariumMenuOpen(prev => !prev)}
              className="w-full rounded-[22px] bg-accent px-3 py-3 text-left text-white shadow-[0_14px_30px_rgba(27,77,62,0.18)]"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-white/14">
                  <Droplets className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-black">{activeAquarium?.name || t('aquarium.switchTank')}</span>
                  <span className="block text-[10px] font-bold text-white/62">{t('aquarium.tankCount', { count: aquariums.length })}</span>
                </span>
              </span>
            </button>
            {isAquariumMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-[70] w-[260px] overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-ink/5">
                <div className="border-b border-border/60 px-3 py-2">
                  <div className="text-[11px] font-black text-ink">{t('aquarium.switchTank')}</div>
                  <div className="mt-0.5 text-[9px] font-bold text-ink/42">{t('aquarium.selectTankHint')}</div>
                </div>
                <div className="max-h-[240px] overflow-y-auto p-1.5">
                  {aquariums.map(aq => {
                    const isActiveAquarium = activeId === aq.id;
                    return (
                      <button
                        key={aq.id}
                        type="button"
                        onClick={() => {
                          setActiveId(aq.id);
                          setIsAquariumMenuOpen(false);
                        }}
                        className={`flex w-full min-w-0 items-center gap-2 rounded-[15px] p-1.5 text-left transition-colors ${
                          isActiveAquarium ? 'bg-emerald-50' : 'hover:bg-bg'
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isActiveAquarium ? 'bg-emerald-700 text-white' : 'bg-bg text-ink/45'
                        }`}>
                          <Droplets className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-black text-ink">{aq.name}</span>
                          <span className="block text-[9px] font-bold text-ink/42">
                            {aq.fishes.length > 0 ? t('aquarium.livestockCount', { count: aq.fishes.length }) : t('aquarium.noLivestock')}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigateToRoute('/collection/wishlist')}
            className="rounded-[20px] bg-white/70 px-3 py-3 text-left text-rose-500 transition-colors hover:bg-white"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${wishlistFishes.length > 0 ? 'fill-current' : ''}`} />
                <span className="text-[13px] font-black">{t('nav.wishlist')}</span>
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black">{wishlistFishes.length}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={openLocalDataManager}
            className="rounded-[20px] bg-white/70 px-3 py-3 text-left text-ink/58 transition-colors hover:bg-white hover:text-ink"
          >
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="text-[13px] font-black">{t('aquarium.dataSavingTitle')}</span>
            </span>
          </button>
        </div>
      </aside>
      <section className="aquarium-desktop-header relative hidden min-w-0 items-center gap-3 rounded-[20px] border border-white/80 bg-white/72 px-4 py-3 shadow-sm md:flex">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-700"><Droplets className="h-4 w-4" /></span>
          {isEditingName ? (
            <form
              className="flex min-w-0 items-center gap-2"
              onSubmit={event => {
                event.preventDefault();
                void handleRenameSubmit();
              }}
            >
              <Input
                autoFocus
                value={editNameValue}
                onChange={event => setEditNameValue(event.target.value)}
                maxLength={40}
                aria-label={isEn ? "Aquarium Name" : "鱼缸名称"}
                className="h-10 min-w-0 max-w-[280px] rounded-[14px] bg-white text-[13px] font-black"
                disabled={isRenamingName}
              />
              <Button type="submit" disabled={isRenamingName || !editNameValue.trim()} className="h-10 rounded-full px-4 text-[12px] font-black">
                {isRenamingName ? '保存中…' : '保存'}
              </Button>
              <Button type="button" variant="ghost" disabled={isRenamingName} onClick={() => setIsEditingName(false)} className="h-10 rounded-full px-3 text-[12px] font-black">
                取消
              </Button>
            </form>
          ) : (
            <div className="min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700/55">{isEn ? 'Current aquarium' : '当前鱼缸'}</span>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[14px] font-black text-ink">{activeAquarium.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditNameValue(activeAquarium.name);
                    setIsEditingName(true);
                  }}
                  aria-label={isEn ? "Rename Aquarium" : "重命名鱼缸"}
                  title={isEn ? "Rename Aquarium" : "重命名鱼缸"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink/42 transition-colors hover:bg-white hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <span className="block text-[10px] font-bold text-ink/42">
                {activeAquarium.waterType
                  ? (activeAquarium.waterType === 'Saltwater' ? t('aquarium.saltwater') : t('aquarium.freshwater'))
                  : (isEn ? 'Water type unknown' : '水体未记录')}
                {' · '}{tankVolumeLiters > 0 ? (isEn ? `About ${tankVolumeLiters} L` : `约 ${tankVolumeLiters} L`) : (isEn ? 'Size unknown' : '尺寸未记录')}
                {' · '}{isEn ? `Profile ${aquariumSetupStatus}` : ({ empty: '空白档案', incomplete: '资料不完整', usable: '资料可用', complete: '资料完整' }[aquariumSetupStatus])}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigateToRoute(taskRoutes.aquarium.timeline(activeAquarium.id))}
          className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 text-xs font-black text-emerald-800 shadow-sm hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <History className="h-4 w-4" />{isEn ? 'Aquarium timeline' : '鱼缸记录'}
        </button>
        <div className="aquarium-mode-indicator" aria-label={isEn ? 'Aquarium mode: standard' : '鱼缸模式：普通'}>
          <span className="aquarium-mode-current">{isEn ? 'Standard' : '普通模式'}</span>
          <span className="aquarium-mode-planned">{isEn ? 'Breeding · planned' : '怀孕模式 · 规划中'}</span>
        </div>
      </section>
      {/* Aquarium Tabs */}
      <section className="aquarium-toolbar order-[0] min-w-0 pb-1 pt-[58px] md:pt-0 md:hidden">
        <div className="fixed inset-x-0 top-0 z-[60] mx-auto flex w-full max-w-[430px] min-w-0 items-center gap-2 bg-bg/95 px-3 pb-2 pt-[calc(8px+env(safe-area-inset-top))] shadow-sm backdrop-blur-md md:sticky md:inset-auto md:top-0 md:z-40 md:max-w-[760px] md:rounded-[28px] md:border md:border-white/80 md:bg-white/78 md:px-4 md:py-3 md:shadow-sm">
          <div className="relative min-w-0 flex-1 md:max-w-[360px] md:flex-none">
            <button
              type="button"
              onClick={() => setIsAquariumMenuOpen(prev => !prev)}
              className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-white/80 bg-white px-2.5 text-left shadow-sm ring-1 ring-ink/5 transition-colors hover:border-emerald-100"
              aria-expanded={isAquariumMenuOpen}
              data-transient-control="menu"
              title={isEn ? 'Switch Tank' : '切换鱼缸'}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Droplets className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-black leading-tight text-ink">
                    {getLocalizedAquariumName(activeAquarium?.name, isEn)}
                  </span>
                  <span className="block text-[9px] font-bold leading-tight text-ink/42">
                    {isEn ? `${aquariums.length} ${aquariums.length === 1 ? 'Tank' : 'Tanks'}` : `${aquariums.length} 个鱼缸`}
                  </span>
                </span>
              </span>
              <ChevronRight className={`h-4 w-4 shrink-0 text-ink/38 transition-transform ${isAquariumMenuOpen ? 'rotate-90' : ''}`} />
            </button>

            {isAquariumMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-[70] w-[min(300px,calc(100vw-112px))] overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-ink/5">
                <div className="border-b border-border/60 px-3 py-2">
                  <div className="text-[11px] font-black text-ink">{isEn ? 'Switch Tank' : '切换鱼缸'}</div>
                  <div className="mt-0.5 text-[9px] font-bold text-ink/42">{isEn ? 'Select active aquarium to manage' : '选择当前正在管理的鱼缸'}</div>
                </div>
                <div className="max-h-[240px] overflow-y-auto p-1.5">
                  {aquariums.map(aq => {
                    const isActiveAquarium = activeId === aq.id;
                    const localizedAqName = getLocalizedAquariumName(aq.name, isEn);
                    return (
                      <div
                        key={aq.id}
                        className={`group flex items-center gap-2 rounded-[15px] p-1.5 transition-colors ${
                          isActiveAquarium ? 'bg-emerald-50' : 'hover:bg-bg'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveId(aq.id);
                            setIsAquariumMenuOpen(false);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isActiveAquarium ? 'bg-emerald-700 text-white' : 'bg-bg text-ink/45'
                          }`}>
                            <Droplets className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-black text-ink">{localizedAqName}</span>
                            <span className="block text-[9px] font-bold text-ink/42">
                              {aq.fishes.length > 0 
                                ? (isEn ? `${aq.fishes.length} ${aq.fishes.length === 1 ? 'item' : 'items'}` : `${aq.fishes.length} 种内容`) 
                                : (isEn ? 'No species' : '暂无生物')}
                            </span>
                          </span>
                        </button>
                        {isActiveAquarium && (
                          <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-emerald-700 shadow-sm">
                            {isEn ? 'Active' : '当前'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigateToRoute(taskRoutes.aquarium.timeline(activeAquarium.id))}
              aria-label={isEn ? 'Aquarium timeline' : '鱼缸记录'}
              title={isEn ? 'Aquarium timeline' : '鱼缸记录'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleAddAquarium}
              disabled={isCreatingAquarium}
              aria-busy={isCreatingAquarium}
              aria-label={isEn ? 'New aquarium' : '新建鱼缸'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-sm disabled:cursor-wait disabled:opacity-55"
              title={isEn ? 'New aquarium' : '新建鱼缸'}
            >
              {isCreatingAquarium ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMobileMoreOpen(open => !open)}
                aria-expanded={isMobileMoreOpen}
                aria-label={isEn ? 'More aquarium actions' : '更多鱼缸操作'}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-ink/55 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {isMobileMoreOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[240px] rounded-[18px] border border-white/80 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-ink/5">
                  {isEditingName ? (
                    <form className="grid gap-2 p-1" onSubmit={event => { event.preventDefault(); void handleRenameSubmit().then(() => setIsMobileMoreOpen(false)); }}>
                      <Input autoFocus value={editNameValue} onChange={event => setEditNameValue(event.target.value)} maxLength={40} aria-label={isEn ? 'Aquarium name' : '鱼缸名称'} className="h-11 rounded-[14px]" />
                      <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setIsEditingName(false)} className="h-11 rounded-full">{isEn ? 'Cancel' : '取消'}</Button><Button type="submit" disabled={!editNameValue.trim() || isRenamingName} className="h-11 rounded-full">{isRenamingName ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save' : '保存')}</Button></div>
                    </form>
                  ) : (
                    <div className="grid gap-1">
                      <button type="button" onClick={() => { setEditNameValue(activeAquarium.name); setIsEditingName(true); }} className="flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-left text-xs font-black hover:bg-bg"><Edit2 className="h-4 w-4 text-emerald-700" />{isEn ? 'Rename aquarium' : '重命名鱼缸'}</button>
                      <button type="button" onClick={() => { setIsMobileMoreOpen(false); navigateToRoute('/settings'); }} className="flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-left text-xs font-black hover:bg-bg"><Settings className="h-4 w-4 text-emerald-700" />{isEn ? 'Settings' : '设置'}</button>
                      <button type="button" onClick={() => { setIsMobileMoreOpen(false); openLocalDataManager(); }} className="flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-left text-xs font-black hover:bg-bg"><Info className="h-4 w-4 text-sky-700" />{isEn ? 'Data & backup' : '数据与备份'}</button>
                      <button type="button" onClick={() => { setIsMobileMoreOpen(false); requestDeleteAquarium(activeAquarium.id); }} className="flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-left text-xs font-black text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />{isEn ? 'Delete aquarium' : '删除鱼缸'}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      {isPhoneLayout && <OnboardingTaskCard />}

      <AquariumWorkspace
        observeTitle={t('aquarium.zoneObserve')}
        observeSubtitle={t('aquarium.zoneObserveHint')}
        manageTitle={t('aquarium.zoneManage')}
        manageSubtitle={t('aquarium.zoneManageHint')}
        learnTitle={t('aquarium.zoneLearn')}
        learnSubtitle={t('aquarium.zoneLearnHint')}
        status={(
          <div id="aquarium-overview" className="aquarium-status order-[2] scroll-mt-4 md:order-none">
            <StatusSummaryCard
              action={dailyActionViewModel}
              carePlan={carePlanSummary}
              showCarePlan={isCarePlanExpanded}
              onPrimaryAction={handleDailyActionPrimary}
              onToggleCarePlan={() => setIsCarePlanExpanded(open => !open)}
              onOpenCarePlan={(id) => {
                const reminder = activeCareReminders.find(item => item.id === id);
                if (reminder) navigateToRoute(`/care?topic=${encodeURIComponent(reminder.sourceTopicId)}`);
              }}
              onCompleteCarePlan={(id) => {
                const reminder = activeCareReminders.find(item => item.id === id);
                if (reminder) handleCompleteReminder(reminder);
              }}
              onRescheduleCarePlan={(id) => {
                const reminder = activeCareReminders.find(item => item.id === id);
                if (reminder) setPendingReminderReschedule(reminder);
              }}
              onDeleteCarePlan={(id) => {
                const reminder = activeCareReminders.find(item => item.id === id);
                if (reminder) setPendingReminderDelete(reminder);
              }}
              onBrowseCare={() => navigateToRoute('/care')}
            />
          </div>
        )}
        discovery={(
      <section id="aquarium-discovery" tabIndex={-1} className="aquarium-discovery order-[1] scroll-mt-4 overflow-hidden rounded-[18px] border border-white/80 bg-white/65 p-3 shadow-sm md:order-none">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[13px] font-black text-ink">
              <Sparkles className="h-4 w-4 text-rose-500" />
              {isEn ? 'Daily Discovery' : '今日推荐'}
            </div>
            <div className="mt-0.5 text-[10px] font-bold text-ink/45">{isEn ? 'One visual idea at a time. You decide whether to save it.' : '一次看清一个物种，再决定是否收藏。'}</div>
          </div>
          <span
            className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black tabular-nums text-emerald-800"
            aria-label={isEn
              ? `Daily recommendation ${discoveryPositionToday} of ${DISCOVERY_DAILY_LIMIT}`
              : `今日推荐第 ${discoveryPositionToday} 个，共 ${DISCOVERY_DAILY_LIMIT} 个`}
          >
            {discoveryPositionToday} / {DISCOVERY_DAILY_LIMIT}
          </span>
        </div>
        {discoveryFish ? (
          <article className="aquarium-discovery-card relative grid min-h-[160px] min-w-0 grid-cols-[minmax(108px,36%)_minmax(0,1fr)] overflow-hidden rounded-[18px] border border-white/80 bg-[#FBFAF6] shadow-sm">
            <div className={`aquarium-discovery-visual relative flex min-h-[160px] min-w-0 items-center justify-center overflow-hidden p-2 ${getSpeciesImageSurfaceClass(discoveryFish)}`}>
              <ResilientImage
                src={discoveryImageSrc}
                srcSet={`${getSpeciesVisualSources(discoveryFish).thumbnail} 256w, ${getSpeciesVisualSources(discoveryFish).detail} 768w`}
                sizes="(max-width: 430px) 36vw, 240px"
                alt={getSpeciesNameLocalized(discoveryFish, isEn)}
                className={`h-full max-h-[160px] w-full object-contain p-1 ${getSpeciesImageClass(discoveryFish)}`}
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
              />
              <button
                type="button"
                aria-label={wishlistFishIds.has(discoveryFish.id)
                  ? (isEn ? 'Remove saved species' : '取消收藏物种')
                  : (isEn ? 'Save species' : '收藏物种')}
                title={wishlistFishIds.has(discoveryFish.id)
                  ? (isEn ? 'Remove from My Collection' : '取消收藏')
                  : (isEn ? 'Save species' : '收藏物种')}
                className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white/95 shadow-sm ${
                  wishlistFishIds.has(discoveryFish.id)
                    ? 'border-rose-100 text-rose-600'
                    : 'border-white text-rose-500'
                }`}
                onClick={() => void handleDiscoveryFavorite()}
                disabled={isDiscoveryFavoritePending}
                aria-busy={isDiscoveryFavoritePending}
              >
                {isDiscoveryFavoritePending
                  ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  : <Heart className={`h-4 w-4 ${wishlistFishIds.has(discoveryFish.id) ? 'fill-current' : ''}`} />}
              </button>
            </div>
            <div className="flex min-w-0 flex-col p-2.5">
              <h3 className="break-words font-serif text-[18px] italic font-bold leading-tight text-ink">{getSpeciesNameLocalized(discoveryFish, isEn)}</h3>
              <span className="mt-1.5 w-fit rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                {discoveryFish.difficulty === 'Easy' ? (isEn ? 'Beginner' : '新手友好') : getDifficultyLabel(discoveryFish.difficulty)}
              </span>
              <p className="mt-1.5 line-clamp-1 text-[11px] font-bold leading-4 text-ink/64">{getDiscoveryPositioning(discoveryFish, isEn)}</p>
              <Button
                type="button"
                className="mt-auto min-h-11 min-w-0 rounded-full bg-emerald-800 px-3 text-[10px] font-black text-white hover:bg-emerald-900"
                onClick={() => routeNavigate(
                  `/encyclopedia?species=${encodeURIComponent(discoveryFish.id)}&source=daily-discovery`,
                  { state: { dailyDiscoveryReturn: true } },
                )}
              >
                {isEn ? 'View species details' : '查看物种详情'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <button
              type="button"
              aria-label={isEn ? 'Show another species' : '换一个物种'}
              title={isEn ? 'Another one' : '换一个'}
              className="absolute bottom-2 left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/95 text-ink/58 shadow-sm"
              onClick={advanceDiscoveryCard}
              disabled={isDiscoveryFavoritePending}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </article>
        ) : (
          <div className="rounded-[16px] border border-rose-100 bg-[#FBFAF6] p-4 text-center">
            <Heart className="mx-auto mb-2 h-7 w-7 fill-rose-400 text-rose-400" />
            <h3 className="font-serif text-base italic font-bold text-ink">
              {isDiscoveryDailyLimitReached
                ? (isEn ? 'You have viewed today’s 10 picks' : '今天的 10 款已经看完啦')
                : (isEn ? 'No new picks right now' : '暂时没有新的推荐')}
            </h3>
            <p className="mt-1 text-xs font-medium text-ink/55">
              {isDiscoveryDailyLimitReached
                ? (isEn ? 'Come back tomorrow for a new set.' : '明天再来看看新的灵感。')
                : (isEn ? 'Check again later for another species idea.' : '稍后再来看看，也许会遇到新的心动物种。')}
            </p>
          </div>
        )}
        {discoveryMessage && (
          <div role="status" className="mt-2 rounded-full bg-ink px-3 py-2 text-center text-[11px] font-bold text-white shadow-sm">
            {discoveryMessage}
          </div>
        )}
      </section>
        )}
        actions={(
      <section id="aquarium-actions" className="aquarium-actions order-[3] scroll-mt-4 overflow-hidden rounded-[20px] border border-white/80 bg-white/65 p-3 shadow-sm md:order-none">
        <SectionHeader title={isEn ? "Quick Actions" : "常用操作"} subtitle={isEn ? "Quickly log daily care tasks." : "快速记录日常养护。"} />
        <div className="mt-3">
          <QuickActionGrid actions={visibleAquariumActions} />
        </div>
      </section>
        )}
        tank={(
      <div id="aquarium-tank" tabIndex={-1} className="aquarium-tank order-[6] relative h-72 w-full scroll-mt-4 overflow-hidden rounded-[18px] border border-white/80 shadow-sm group md:order-none md:h-[min(50dvh,470px)] md:min-h-[360px]">
        {shouldLoadThreeAquarium ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 text-xs font-bold text-accent">
                正在加载鱼缸画面...
              </div>
            }
          >
            <ThreeAquarium
              aquarium={activeAquarium}
              activeSpecies={active3DSpecies}
              onSpeciesSelect={handleAquariumSpeciesSelect}
            />
          </Suspense>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#dff4f6,#a9d7cf)]">
            {currentFishesDetails[0] ? (
              <div className="h-40 w-56 opacity-85"><ResilientImage src={getSpeciesVisualSources(currentFishesDetails[0]).thumbnail} alt={currentFishesDetails[0].name} className="h-full w-full object-contain" /></div>
            ) : <span className="text-xs font-black text-emerald-900/55">{isEn ? 'Aquarium view will load when idle' : '鱼缸画面将在空闲时加载'}</span>}
            {requiresManualThreeLoad && (
              <Button type="button" onClick={() => { setShouldLoadThreeAquarium(true); setRequiresManualThreeLoad(false); }} className="absolute bottom-3 left-1/2 h-9 -translate-x-1/2 rounded-full bg-white px-4 text-[11px] font-black text-emerald-800 shadow-sm hover:bg-white">
                加载 3D 鱼缸
              </Button>
            )}
          </div>
        )}

        <div data-aquarium-stage-intro className="aquarium-stage-intro pointer-events-none absolute left-5 top-5 z-10 max-w-[min(72%,500px)] md:left-8 md:top-8">
          <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950/62">
            {isEn ? `My Aquarium · ${format(new Date(), 'MMM d')}` : `我的鱼缸 · ${format(new Date(), 'M 月 d 日')}`}
          </span>
          <h1 className="mt-2 font-serif text-[clamp(25px,3.1vw,48px)] font-semibold leading-[1.02] tracking-[-0.04em] text-emerald-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.28)]">
            {dailyActionViewModel.level === 'urgent'
              ? dailyActionViewModel.task.title
              : (isEn ? 'Start with one calm observation' : '今天先完成一次观察')}
          </h1>
          <p className="mt-2 max-w-[43ch] text-[11px] font-bold leading-5 text-emerald-950/64 md:text-[12px]">
            {dailyActionViewModel.level === 'urgent'
              ? dailyActionViewModel.task.reason
              : (isEn ? 'A quick check helps you notice changes before they become a problem.' : '先看看呼吸、水面和活动状态；没有异常，就不需要额外操作。')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black text-emerald-900">
            <span className="rounded-full bg-white/78 px-3 py-2 shadow-sm backdrop-blur-sm">
              {hasStockedAnimals
                ? (isEn ? `${stockedSpeciesCount} species · ${totalStockedQuantity} total` : `${stockedSpeciesCount} 种 · ${totalStockedQuantity} 条/只`)
                : (isEn ? 'No livestock recorded' : '尚未记录缸内生物')}
            </span>
            <span className="rounded-full bg-white/78 px-3 py-2 shadow-sm backdrop-blur-sm">
              {dailyActionViewModel.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTankArchiveExpanded(true)}
          aria-haspopup="dialog"
          data-tank-species-entry
          className="absolute bottom-4 left-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/75 bg-white/84 px-4 text-[11px] font-black text-emerald-900 shadow-[0_8px_24px_rgba(15,77,62,0.16)] backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:bottom-5 md:left-6"
        >
          {isEn ? 'View tank species' : '查看缸内物种'}
          <span className="rounded-full bg-emerald-900 px-1.5 py-0.5 text-[9px] text-white">{stockedSpeciesCount}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        {/* Species Sidebar Overlay for 3D navigation */}
        {activeAquarium && activeAquarium.fishes.length > 0 && (
          <div className="absolute top-12 left-2 z-10 hidden bg-white/80 backdrop-blur-md border border-white/50 rounded-sm shadow-sm p-1.5 max-h-[60%] overflow-y-auto w-24 sm:w-28 custom-scrollbar flex-col gap-1">
            <span className="text-[9px] font-bold text-ink/50 uppercase tracking-wider px-1 text-center mb-1">{isEn ? 'Switch Camera' : '切换镜头'}</span>
            {Array.from(new Set(activeAquarium.fishes.map(f => f.fishId))).map(uId => {
              const fishInfo = fishData.find(f => f.id === uId);
              if (!fishInfo) return null;
              const qty = activeAquarium.fishes.filter(f => f.fishId === uId).reduce((sum, item) => sum + (item.quantity||1), 0);
              const isActive = active3DSpecies === uId;
              return (
                <button 
                  key={uId} 
                  className={`flex items-center gap-1.5 p-1 rounded transition-colors text-left ${isActive ? 'bg-accent/10 border-accent/30 border text-accent' : 'hover:bg-white/50 border border-transparent blur-0'}`}
                  onClick={() => setActive3DSpecies(isActive ? null : uId)}
                >
                  <img src={getSpeciesDisplayImage(fishInfo)} alt={fishInfo.name} className={`w-4 h-4 rounded-full object-contain ${getSpeciesImageSurfaceClass(fishInfo)} ${getSpeciesImageClass(fishInfo)}`} />
                  <div className="flex flex-col flex-1 truncate">
                    <span className="text-[10px] font-bold truncate pr-1 whitespace-nowrap leading-none">{fishInfo.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tank Action Toolbar */}
        <div className="absolute right-2 top-2 z-20 hidden flex-col gap-2">
          <Button
            aria-label={isEn ? 'Record Existing Livestock' : '记录已有生物'}
            title={isEn ? 'Record Existing Livestock' : '记录已有生物'}
            onClick={() => openSpeciesAddition('record_existing')}
            className="h-11 w-11 rounded-full border border-white/50 bg-white/55 p-0 text-ink/55 shadow-none backdrop-blur-sm hover:bg-white hover:text-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            aria-label={isEn ? 'Plan Livestock' : '规划想养的生物'}
            title={isEn ? 'Plan Livestock' : '规划想养的生物'}
            onClick={() => openSpeciesAddition('planned_addition')}
            className="h-11 w-11 rounded-full border border-white/50 bg-white/55 p-0 text-ink/55 shadow-none backdrop-blur-sm hover:bg-white hover:text-accent"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            aria-label={isEn ? "Fullscreen Preview" : "全屏预览"}
            title={isEn ? "Fullscreen Preview" : "全屏预览"}
            onClick={() => { setShouldLoadThreeAquarium(true); setRequiresManualThreeLoad(false); setIsTankPreviewOpen(true); }}
            className="h-11 w-11 rounded-full border border-white/50 bg-white/55 p-0 text-ink/55 shadow-none backdrop-blur-sm hover:bg-white hover:text-accent"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            aria-label={isEn ? 'Tank Settings' : '鱼缸设置'}
            title={isEn ? 'Tank Settings' : '鱼缸设置'}
            onClick={() => openAquariumSettings()}
            className="h-11 w-11 rounded-full border border-white/50 bg-white/55 p-0 text-ink/55 shadow-none backdrop-blur-sm hover:bg-white hover:text-accent"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Floating Conflict Warning Trigger */}
        {conflicts.length > 0 && (
          <div className="absolute bottom-2 right-2 z-10">
            <Button
              variant="destructive"
              className="h-8 rounded-full border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-black text-amber-700 shadow-sm hover:bg-amber-100"
              onClick={() => setIsConflictDialogOpen(true)}
            >
              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
              <span className="font-bold text-xs">{isEn ? "Risk Warnings" : "风险警告"}</span>
            </Button>
          </div>
        )}
      </div>
        )}
        archive={(
      <section id="aquarium-records" className="aquarium-archive scroll-mt-4 overflow-hidden rounded-[18px] border border-white/80 bg-[#F8F7F2] shadow-sm">
        <div className="flex w-full items-center justify-between gap-3 bg-[#E9E8E2] px-3 py-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[14px] font-black text-ink">
              <BookOpen className="h-4 w-4 text-accent" />
              {t('aquarium.tankContentsTitle')}
            </div>
            <div className="mt-0.5 text-[10px] font-bold text-ink/45">
              {hasStockedAnimals
                ? t('aquarium.tankContentsCount', { species: stockedSpeciesCount, quantity: totalStockedQuantity })
                : hasEnvironmentContent
                  ? t('aquarium.tankContentsEnvironmentOnly')
                  : t('aquarium.tankContentsEmpty')}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {ownedArchivePreviewItems.length > 0 && (
              <div className="flex -space-x-2">
                {ownedArchivePreviewItems.map(item => (
                  <span key={item.fish.id} className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-sm">
                    <img src={getSpeciesDisplayImage(item.fish)} alt={item.fish.name} className={`h-full w-full object-contain p-0.5 ${getSpeciesImageClass(item.fish)}`} referrerPolicy="no-referrer" />
                  </span>
                ))}
              </div>
            )}
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-emerald-800 shadow-sm">
              {isEn ? 'Tank summary' : '缸内摘要'}
            </span>
          </div>
        </div>
        <div className="aquarium-archive-preview border-t border-white/70 bg-[#F4F2EC] p-3">
          {ownedArchivePreviewItems.length > 0 ? (
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              {ownedArchivePreviewItems.slice(0, 3).map(item => (
                <span key={`preview-${item.id}`} className="flex min-w-0 items-center gap-2 rounded-[14px] bg-white/75 p-2">
                  <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${getSpeciesImageSurfaceClass(item.fish)}`}>
                    <img src={getSpeciesDisplayImage(item.fish)} alt={getSpeciesNameLocalized(item.fish, isEn)} className={`h-full w-full object-contain p-1 ${getSpeciesImageClass(item.fish)}`} referrerPolicy="no-referrer" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-black text-ink">{getSpeciesNameLocalized(item.fish, isEn)}</span>
                    <span className="mt-0.5 block text-[9px] font-bold text-ink/45">{isEn ? `${item.quantity} in tank` : `${item.quantity} 条/只`}</span>
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => openSpeciesAddition('record_existing')} className="min-h-11 w-full rounded-xl border border-dashed border-emerald-200 bg-white text-xs font-black text-emerald-800">
              记录第一种已有生物
            </button>
          )}
        </div>
      </section>
        )}
      />

      <Dialog open={Boolean(pendingReminderReschedule)} onOpenChange={(open) => !open && setPendingReminderReschedule(null)}>
        <DialogContent className="w-[90vw] max-w-[380px] rounded-[22px] border-border bg-white p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-ink">{t('aquarium.rescheduleReminderTitle')}</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">{t('aquarium.rescheduleReminderDesc')}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-2">
            {[1, 3, 7].map(days => (
              <Button key={days} type="button" variant="outline" onClick={() => pendingReminderReschedule && handleRescheduleReminder(pendingReminderReschedule, days)} className="h-11 justify-start rounded-[16px] border-border bg-bg px-4 text-[12px] font-black text-ink/70">
                {days === 1 ? t('aquarium.tomorrow') : t('aquarium.daysLater', { count: days })}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingReminderDelete)} onOpenChange={(open) => !open && setPendingReminderDelete(null)}>
        <DialogContent showCloseButton={false} className="w-[90vw] max-w-[380px] rounded-[22px] border-red-100 bg-white p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-ink">{t('aquarium.deleteReminderTitle')}</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">{t('aquarium.deleteReminderDesc', { title: pendingReminderDelete?.title })}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => setPendingReminderDelete(null)} className="h-11 rounded-full">{t('aquarium.cancel')}</Button>
            <Button type="button" onClick={handleDeleteReminder} className="h-11 rounded-full bg-red-600 text-white hover:bg-red-700">{t('aquarium.deleteReminderBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingDeleteAquariumId} onOpenChange={(open) => !open && setPendingDeleteAquariumId(null)}>
        <DialogContent showCloseButton={false} className="w-[90vw] max-w-[380px] rounded-[22px] border-red-100 bg-white p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-ink">
              <X className="h-5 w-5 rounded-full bg-red-50 p-1 text-red-600" />
              {t('aquarium.deleteTank')}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">
              {aquariums.length <= 1
                ? t('aquarium.deleteTankDescSingle')
                : t('aquarium.deleteTankDescConfirm', { name: pendingDeleteAquarium?.name || t('aquarium.switchTank') })}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-bold leading-relaxed text-red-700">
            {aquariums.length <= 1
              ? t('aquarium.deleteTankHintSingle')
              : t('aquarium.deleteTankHintConfirm')}
          </div>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full text-sm font-bold"
              onClick={() => setPendingDeleteAquariumId(null)}
            >
              {t('aquarium.cancel')}
            </Button>
            <Button
              type="button"
              className="min-h-11 rounded-full bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:bg-red-100 disabled:text-red-300"
              disabled={aquariums.length <= 1}
              onClick={confirmDeleteAquarium}
            >
              {t('aquarium.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLocalDataOpen} onOpenChange={setIsLocalDataOpen}>
        <DialogContent className="flex max-h-[86dvh] w-[92vw] max-w-[430px] md:max-w-[600px] flex-col overflow-hidden rounded-[22px] border-border bg-bg p-0">
          <DialogHeader className="shrink-0 border-b border-white bg-white px-5 py-4 text-left">
            <DialogTitle className="text-xl font-black text-ink">{t('aquarium.dataSavingTitle')}</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">
              {t('aquarium.dataSavingDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-3 text-[13px] font-medium leading-relaxed text-ink/64">
              <div className="rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-2 text-[14px] font-black text-emerald-800">
                  <Info className="h-4 w-4" />
                  {t('aquarium.dataSavingDetailTitle1')}
                </div>
                <p className="mt-2">
                  {t('aquarium.dataSavingDetailDesc1')}
                </p>
              </div>
              <div className="rounded-[18px] border border-amber-100 bg-amber-50/70 p-4">
                <div className="text-[14px] font-black text-amber-900">{t('aquarium.dataSavingDetailTitle2')}</div>
                <p className="mt-2">
                  {t('aquarium.dataSavingDetailDesc2')}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTankPreviewOpen} onOpenChange={setIsTankPreviewOpen}>
        <DialogContent className="h-[92dvh] w-[96vw] max-w-[1180px] overflow-hidden rounded-[24px] border-border p-0 md:h-[calc(100dvh-24px)] md:w-[calc(100vw-32px)] md:max-w-[1480px]">
          <DialogHeader className="sr-only">
            <DialogTitle>{isEn ? 'Full Screen Preview' : '鱼缸全屏预览'}</DialogTitle>
            <DialogDescription>{isEn ? 'Enlarge to view current 3D tank scene.' : '放大查看当前鱼缸 3D 画面。'}</DialogDescription>
          </DialogHeader>
          <div className="grid h-full w-full bg-[#DDEAE8] md:grid-cols-[minmax(0,1fr)_280px]">
            <div id="aquarium-tank-preview" tabIndex={-1} className="relative min-h-0">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 text-xs font-bold text-accent">
                  正在加载鱼缸画面...
                </div>
              }
            >
              <ThreeAquarium
                aquarium={activeAquarium}
                activeSpecies={active3DSpecies}
                onSpeciesSelect={handleAquariumSpeciesSelect}
              />
            </Suspense>
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
              <div className="bg-white/82 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[10px] font-bold text-ink shadow-sm border border-white/60">
                {activeAquarium.name}
              </div>
              <div className="bg-white/82 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[10px] font-bold text-ink shadow-sm border border-white/60">
                {activeAquarium.waterType === 'Saltwater' ? '海水' : activeAquarium.waterType === 'Freshwater' ? '淡水' : '水体未记录'} · {activeAquarium.targetTemperature ? `目标 ${activeAquarium.targetTemperature}°C` : '目标温度未记录'} · {tankVolumeLiters > 0 ? `约${tankVolumeLiters}L` : '尺寸未记录'}
              </div>
            </div>
            <div className="app-scrollbar-hidden absolute inset-x-3 bottom-3 z-20 flex gap-2 overflow-x-auto rounded-[18px] bg-white/82 p-2 shadow-lg backdrop-blur-md md:hidden">
              {Array.from(new Set(activeAquarium.fishes.map(item => item.fishId))).map(fishId => {
                const fishInfo = fishData.find(fish => fish.id === fishId);
                if (!fishInfo) return null;
                const quantity = activeAquarium.fishes.filter(item => item.fishId === fishId).reduce((sum, item) => sum + (item.quantity || 1), 0);
                return (
                  <button
                    key={fishId}
                    type="button"
                    onClick={() => setActive3DSpecies(active3DSpecies === fishId ? null : fishId)}
                    className={`flex min-w-[128px] items-center gap-2 rounded-[14px] border p-2 text-left ${active3DSpecies === fishId ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-white bg-white/88 text-ink/65'}`}
                  >
                    <img src={getSpeciesDisplayImage(fishInfo)} alt={fishInfo.name} className={`h-9 w-9 object-contain ${getSpeciesImageClass(fishInfo)}`} />
                    <span className="min-w-0"><span className="block truncate text-[11px] font-black">{fishInfo.name}</span><span className="text-[9px] font-bold opacity-55">{quantity} 只/条</span></span>
                  </button>
                );
              })}
              {activeAquarium.fishes.length === 0 && <div className="px-3 py-2 text-[11px] font-bold text-ink/45">{isEn ? 'No species in tank yet.' : '还没有缸内物种。'}</div>}
            </div>
            </div>
            <aside className="hidden min-h-0 border-l border-white/70 bg-white/78 p-4 backdrop-blur md:block">
              <div className="text-[18px] font-black text-ink">{activeAquarium.name}</div>
              <div className="mt-1 text-[12px] font-bold text-ink/48">{isEn ? 'Immersive Tank View' : '沉浸式鱼缸视图'}</div>
              <div className="mt-4 grid gap-2">
                {[
                  `${activeAquarium.waterType === 'Saltwater' ? '海水' : activeAquarium.waterType === 'Freshwater' ? '淡水' : '水体未记录'} · ${activeAquarium.targetTemperature ? `目标 ${activeAquarium.targetTemperature}°C` : '目标温度未记录'}`,
                  tankVolumeLiters > 0 ? `${activeAquarium.dimensions?.length}x${activeAquarium.dimensions?.width}x${activeAquarium.dimensions?.height}cm · 约${tankVolumeLiters}L` : '尺寸未记录',
                  `${activeAquarium.fishes.length} 条记录 · ${totalStockedQuantity} 只/条活体`,
                ].map(item => (
                  <div key={item} className="rounded-[16px] bg-white px-3 py-2 text-[12px] font-black text-ink/70 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 text-[13px] font-black text-ink">{isEn ? 'Camera Angle' : '镜头切换'}</div>
              <div className="app-scrollbar-hidden mt-2 grid max-h-[48dvh] gap-2 overflow-y-auto">
                {Array.from(new Set(activeAquarium.fishes.map(f => f.fishId))).map(fishId => {
                  const fishInfo = fishData.find(fish => fish.id === fishId);
                  if (!fishInfo) return null;
                  const isActive = active3DSpecies === fishId;
                  const quantity = activeAquarium.fishes.filter(item => item.fishId === fishId).reduce((sum, item) => sum + (item.quantity || 1), 0);
                  return (
                    <button
                      key={fishId}
                      type="button"
                      onClick={() => setActive3DSpecies(isActive ? null : fishId)}
                      className={`grid grid-cols-[42px_1fr] items-center gap-2 rounded-[16px] border p-2 text-left transition-colors ${
                        isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-border bg-white text-ink/64 hover:border-emerald-100'
                      }`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${getSpeciesImageSurfaceClass(fishInfo)}`}>
                        <img src={getSpeciesDisplayImage(fishInfo)} alt={fishInfo.name} className={`max-h-9 max-w-9 object-contain ${getSpeciesImageClass(fishInfo)}`} referrerPolicy="no-referrer" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-black">{fishInfo.name}</span>
                        <span className="block text-[10px] font-bold opacity-55">{quantity} 只/条</span>
                      </span>
                    </button>
                  );
                })}
                {activeAquarium.fishes.length === 0 && (
                  <div className="rounded-[16px] border border-dashed border-border bg-white px-3 py-5 text-center text-[12px] font-bold text-ink/42">
                    还没有活体生物。
                  </div>
                )}
              </div>
            </aside>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDiagnosisOpen} onOpenChange={(open) => {
        if (open) {
          setIsDiagnosisOpen(true);
          return;
        }
        requestDiagnosisClose();
      }}>
        <AdaptiveTaskContent showCloseButton={false} className="bg-bg md:max-w-[620px]">
          <SurfaceHeader
            title={(
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-700" />
                {diagnosisIssueType === '巡检' ? t('aquarium.dailyCheck') : t('aquarium.smartDiagnosis')}
              </span>
            )}
            description={diagnosisIssueType === '巡检'
              ? t('aquarium.dailyCheckDesc')
              : t('aquarium.smartDiagnosisDesc')}
            onBack={diagnosisMode === 'home'
              ? undefined
              : diagnosisMode === 'quiz' && !isDailyCheckQuiz
                ? handleDiagnosisPrevious
                : () => setDiagnosisMode('home')}
            backLabel={diagnosisMode === 'quiz' && !isDailyCheckQuiz ? t('aquarium.prevQuestion') : t('aquarium.back')}
            onClose={requestDiagnosisClose}
            closeLabel={isEn ? 'Exit' : '退出'}
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-4 pb-24">
              <section className="rounded-[18px] bg-white p-3 shadow-sm">
                <div className="mb-2 text-[12px] font-black text-ink/55">{t('aquarium.activeTankSummary')}</div>
                {aquariums.length > 1 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {aquariums.map(aquarium => (
                      <button
                        key={aquarium.id}
                        type="button"
                        onClick={() => {
                          setDiagnosisAquariumId(aquarium.id);
                          setDiagnosisResult(null);
                          setDiagnosisSaveMessage('');
                          setIsDiagnosisRecordSaved(false);
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition-colors ${
                          diagnosisTankSummary.aquariumId === aquarium.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-bg text-ink/55 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {aquarium.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t('aquarium.labelTank'), value: diagnosisTankSummary.name },
                    { label: t('aquarium.labelWater'), value: diagnosisTankSummary.water },
                    { label: t('aquarium.labelTemp'), value: diagnosisTankSummary.temperature },
                    { label: t('aquarium.labelVolume'), value: diagnosisTankSummary.volume },
                    { label: t('aquarium.labelDimensions'), value: diagnosisTankSummary.dimensions },
                    { label: t('aquarium.labelWaterChange'), value: diagnosisTankSummary.waterChange },
                    { label: t('aquarium.labelFeeding'), value: diagnosisTankSummary.recentFeeding },
                    { label: t('aquarium.labelAddedSpecies'), value: diagnosisTankSummary.recentAddedSpecies },
                  ].map(item => (
                    <div key={item.label} className="rounded-[12px] bg-bg px-2.5 py-2">
                      <div className="text-[10px] font-black text-ink/38">{item.label}</div>
                      <div className="mt-0.5 truncate text-[12px] font-black text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-[12px] bg-emerald-50 px-2.5 py-2 text-[11px] font-bold leading-relaxed text-emerald-900">
                  {t('aquarium.stockedLivestock')}{diagnosisTankSummary.stocked}
                </div>
                <div className="mt-2 rounded-[12px] bg-bg px-2.5 py-2 text-[11px] font-bold leading-relaxed text-ink/60">
                  {t('aquarium.equipmentColon')}{diagnosisTankSummary.equipment}
                </div>
                <div className="mt-2 text-[10px] font-bold text-ink/42">
                  {t('aquarium.missingInfo')}{diagnosisTankSummary.missing.join(' / ')}
                </div>
              </section>

              {careDiagnosisContext && (
                <section className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-3 shadow-sm">
                  <div className="text-[12px] font-black text-emerald-800">{t('aquarium.fromCareEncyclopedia')}{careDiagnosisContext.title}</div>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-emerald-900/70">
                    {t('aquarium.fromCareEncyclopediaDesc')}
                  </p>
                </section>
              )}

              {diagnosisMode === 'home' && (
                <>
                  {recentDiagnosisRecords.length > 0 && (
                    <section className="grid gap-2 rounded-[18px] bg-white p-3 shadow-sm">
                      <div className="text-[13px] font-black text-ink">{t('aquarium.recentDiagnosis')}</div>
                      {recentDiagnosisRecords.map(record => (
                        <button
                          key={record.diagnosisId}
                          type="button"
                          onClick={() => {
                            setSelectedDiagnosisRecord(record);
                            setDiagnosisMode('history');
                          }}
                          className="rounded-[14px] bg-bg px-3 py-2 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-black text-ink">{format(new Date(record.createdAt), 'yyyy/MM/dd')} {record.problemType}</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-ink/55">{record.riskLevel}</span>
                          </div>
                          <div className="mt-1 line-clamp-1 text-[11px] font-medium text-ink/55">{record.resultSummary}</div>
                        </button>
                      ))}
                    </section>
                  )}

                  <section className="grid gap-2 rounded-[18px] bg-white p-3 shadow-sm">
                    <div>
                      <div className="text-[13px] font-black text-ink">{isEn ? 'Select Problem Type' : '选择问题类型'}</div>
                      <p className="mt-0.5 text-[11px] font-medium text-ink/50">{isEn ? 'Tap to start test, answer one question at a time.' : '点击后进入逐题测试，每次只回答一道题。'}</p>
                    </div>
                    <div className="grid gap-2">
                      {diagnosisIssueTypes.map(type => {
                        const count = getEstimatedQuestionCount(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleStartDiagnosisQuiz(type.id)}
                            className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[16px] bg-bg p-3 text-left transition-colors hover:bg-emerald-50"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700">{type.icon}</span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-black text-ink">{type.label}</span>
                              <span className="mt-0.5 line-clamp-1 block text-[10px] font-medium text-ink/48">{type.description}</span>
                            </span>
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink/45">预计 {count} 题</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {diagnosisMode === 'quiz' && isDailyCheckQuiz && (
                <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                  {diagnosisBatchCareFocus && (
                    <div className="rounded-[15px] border border-amber-200 bg-amber-50 px-3 py-2.5" data-diagnosis-life-stage-focus={diagnosisBatchCareFocus.code}>
                      <div className="text-[11px] font-black text-amber-900">
                        {isEn ? 'Today’s observation focus' : '今天的体态观察重点'}
                      </div>
                      <p className="mt-1 text-[11px] font-semibold leading-5 text-amber-950/70">
                        {diagnosisBatchCareFocus.reason}
                      </p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-black text-ink">{isEn ? 'Complete Daily Check' : '一次完成今天检查'}</div>
                        <p className="mt-0.5 text-[11px] font-medium text-ink/50">{isEn ? 'Select based on observation, extra notes optional.' : '按实际观察选择，补充描述可以留空。'}</p>
                      </div>
                      <div className="shrink-0 text-[11px] font-black text-emerald-700">
                        {dailyCheckAnsweredCount} / {dailyCheckRequiredQuestions.length}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${dailyCheckRequiredQuestions.length > 0 ? (dailyCheckAnsweredCount / dailyCheckRequiredQuestions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {activeDiagnosisQuestions.map((question, index) => {
                      const answer = diagnosisQuizAnswers[question.id] || '';
                      return (
                        <div
                          key={question.id}
                          ref={(node) => { diagnosisQuestionRefs.current[question.id] = node; }}
                          tabIndex={-1}
                          className="rounded-[16px] bg-bg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-700">
                              {index + 1}
                            </span>
                            <div className="text-[13px] font-black leading-relaxed text-ink">{question.question}</div>
                          </div>
                          {question.optionalText ? (
                            <Input
                              value={answer === '跳过' ? '' : answer}
                              onChange={(event) => handleDiagnosisAnswer(question.id, event.target.value)}
                              placeholder={isEn ? "Optional: Describe any abnormal symptoms..." : "可选：补充一句你看到的异常"}
                              className="mt-2 h-10 rounded-[12px] bg-white text-sm"
                            />
                          ) : (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {question.options.map(option => {
                                const selected = answer === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleDiagnosisChoice(question.id, option)}
                                    className={`rounded-full border px-3 py-2 text-[11px] font-black transition-colors ${
                                      selected
                                        ? 'border-emerald-700 bg-emerald-700 text-white'
                                        : 'border-border bg-white text-ink/58 hover:border-emerald-200'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {diagnosisMode === 'quiz' && !isDailyCheckQuiz && activeDiagnosisQuestion && (
                <section
                  ref={(node) => { diagnosisQuestionRefs.current[activeDiagnosisQuestion.id] = node; }}
                  tabIndex={-1}
                  className="grid gap-2 rounded-[18px] bg-white p-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-black text-ink">{diagnosisIssueType}</div>
                      <div className="text-[11px] font-black text-ink/45">第 {diagnosisQuestionIndex + 1} / {activeDiagnosisQuestions.length} 题</div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${diagnosisProgressPercent}%` }} />
                    </div>
                  </div>
                  <div className="rounded-[16px] bg-bg p-3">
                    <div className="text-[16px] font-black leading-relaxed text-ink">{activeDiagnosisQuestion.question}</div>
                    {activeDiagnosisQuestion.id === 'optionalTestData' && (
                      <div className="mt-2 rounded-[12px] bg-blue-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-blue-800">
                        没有也没关系，系统会先根据观察到的现象给出初步判断。
                      </div>
                    )}
                    <div className="mt-3 grid gap-2">
                      {activeDiagnosisQuestion.options.map(option => {
                        const selected = currentDiagnosisAnswer === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleDiagnosisChoice(activeDiagnosisQuestion.id, option)}
                            className={`rounded-[14px] border px-3 py-3 text-left text-[13px] font-black transition-colors ${
                              selected ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-transparent bg-white text-ink/65 hover:border-emerald-100'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {activeDiagnosisQuestion.optionalText && (
                      <Input
                        value={currentDiagnosisAnswer === '跳过' ? '' : currentDiagnosisAnswer}
                        onChange={(event) => handleDiagnosisAnswer(activeDiagnosisQuestion.id, event.target.value)}
                        placeholder={isEn ? "Optional: Additional symptom description..." : "可选：补充一句症状描述"}
                        className="mt-3 h-10 rounded-[12px] bg-white text-sm"
                      />
                    )}
                    {activeDiagnosisQuestion.id === 'optionalTestData' && (
                      <div className="mt-3 grid gap-1.5 rounded-[12px] bg-white px-3 py-2 text-[10px] font-medium leading-relaxed text-ink/55">
                        <div><span className="font-black text-ink/65">pH：</span>{isEn ? 'Water pH level. Most fish adapt well, daily tests unnecessary.' : '水偏酸还是偏碱，很多鱼能适应一定范围，不需要每天测。'}</div>
                        <div><span className="font-black text-ink/65">{isEn ? "Ammonia: " : "氨氮："}</span>{isEn ? 'Toxic waste from uneaten food and fish waste. Spikes in new tanks or overfeeding.' : '鱼便、残饵腐烂后产生的有毒废物，新缸或喂多时容易升高。'}</div>
                        <div><span className="font-black text-ink/65">{isEn ? "Nitrite: " : "亚硝酸盐："}</span>{isEn ? 'Harmful compound when filter cycle is unstable; can cause gasping or lethargy.' : '过滤系统不稳定时容易出现的有害指标，可能导致鱼浮头、趴缸。'}</div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {diagnosisMode === 'result' && structuredDiagnosis && (
              <>
              <section className="grid gap-3">
                <div className="flex justify-end">
                  <button type="button" onClick={() => openExportArtifact(buildDiagnosisArtifact(artifactContext, toDiagnosisOutput(structuredDiagnosis)))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-black text-emerald-800 shadow-sm">
                    <Download className="h-4 w-4" />{isEn ? 'Download result image' : '下载诊断结果图'}
                  </button>
                </div>
                {diagnosisVisualModel && (
                  <VisualResultCard
                    model={diagnosisVisualModel}
                    onPrimaryAction={handleVisualDiagnosisPrimary}
                  />
                )}
                {diagnosisSaveMessage && (
                  <div className="rounded-[12px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                    {diagnosisSaveMessage}
                  </div>
                )}
                {diagnosisIssueType === '巡检' && isDiagnosing && (
                  <div className="rounded-[14px] border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] font-black text-sky-700">
                    AI 正在整理你的补充描述；本地风险和处理步骤已先生成。
                  </div>
                )}
              </section>

              </>
              )}

              {diagnosisMode === 'history' && selectedDiagnosisRecord && (
                <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-black text-ink">{selectedDiagnosisRecord.problemType}</div>
                      <div className="mt-0.5 text-[11px] font-medium text-ink/50">{format(new Date(selectedDiagnosisRecord.createdAt), 'yyyy/MM/dd HH:mm')}</div>
                    </div>
                    <span className="rounded-full bg-bg px-2 py-1 text-[10px] font-black text-ink/55">{selectedDiagnosisRecord.riskLevel}</span>
                  </div>
                  <div className="rounded-[14px] bg-bg px-3 py-2 text-[12px] font-black leading-relaxed text-ink">{selectedDiagnosisRecord.resultSummary}</div>
                  <div>
                    <div className="text-[12px] font-black text-ink">{isEn ? 'Suggested Actions' : '建议动作'}</div>
                    <div className="mt-1 grid gap-1">
                      {selectedDiagnosisRecord.suggestedActions.map(action => (
                        <div key={action} className="rounded-[12px] bg-bg px-3 py-2 text-[11px] font-medium text-ink/70">{action}</div>
                      ))}
                    </div>
                  </div>
                  {selectedDiagnosisRecord.followUpNotes.length > 0 && (
                    <div>
                      <div className="text-[12px] font-black text-ink">{isEn ? 'Additional Notes' : '补充记录'}</div>
                      <div className="mt-1 grid gap-1">
                        {selectedDiagnosisRecord.followUpNotes.map(note => (
                          <div key={note} className="rounded-[12px] bg-bg px-3 py-2 text-[11px] font-medium text-ink/70">{note}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
          {diagnosisMode !== 'home' && (
          <DialogFooter className="shrink-0 border-t border-white bg-white/95 px-4 py-3 shadow-[0_-10px_24px_rgba(27,77,62,0.08)]">
            {diagnosisMode === 'quiz' && (
                <Button
                  ref={diagnosisSubmitRef}
                  onClick={isDailyCheckQuiz ? () => void handleRunDiagnosis() : handleDiagnosisNext}
                  disabled={isDailyCheckQuiz ? !isDailyCheckReady : (!currentDiagnosisAnswer && !activeDiagnosisQuestion?.optionalText)}
                  className="h-10 rounded-full bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800 disabled:bg-ink/15 disabled:text-ink/35"
                >
                  {isDailyCheckQuiz
                    ? `${t('aquarium.generateCheckResults')}${isDailyCheckReady ? '' : t('aquarium.missingItemsCount', { count: dailyCheckRequiredQuestions.length - dailyCheckAnsweredCount })}`
                    : diagnosisQuestionIndex >= activeDiagnosisQuestions.length - 1 ? t('aquarium.smartDiagnosis') : t('aquarium.nextQuestion')}
                </Button>
            )}
            {diagnosisMode === 'result' && (
              <Button variant="outline" onClick={() => setDiagnosisMode('home')} className="h-10 w-full rounded-full text-sm font-bold">{t('aquarium.diagnoseAgain')}</Button>
            )}
            {diagnosisMode === 'history' && (
                <Button onClick={() => handleStartDiagnosisQuiz(selectedDiagnosisRecord?.problemType || '巡检')} className="h-10 rounded-full bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800">{t('aquarium.diagnoseAgainThisProblem')}</Button>
            )}
          </DialogFooter>
          )}
        </AdaptiveTaskContent>
      </Dialog>

      <Dialog open={isDiagnosisExitConfirmOpen} onOpenChange={setIsDiagnosisExitConfirmOpen}>
        <DialogContent showCloseButton={false} className="w-[min(420px,calc(100vw-32px))] rounded-[24px] border-border bg-white">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Exit this check?' : '退出本次检查？'}</DialogTitle>
            <DialogDescription>
              {isEn ? 'Your unanswered check has not been saved. Continue filling it out or discard this draft.' : '当前回答尚未生成结果。你可以继续填写，或放弃这次未保存的内容。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDiagnosisExitConfirmOpen(false)} className="min-h-11 rounded-full text-sm font-black">
              {isEn ? 'Continue' : '继续填写'}
            </Button>
            <Button type="button" variant="destructive" onClick={discardDiagnosisDraftAndClose} className="min-h-11 rounded-full text-sm font-black">
              {isEn ? 'Exit and discard' : '退出并放弃'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedDailyCheckArticle)} onOpenChange={(open) => !open && setSelectedDailyCheckArticle(null)}>
        <DialogContent className="flex max-h-[86dvh] w-[92vw] max-w-[560px] flex-col overflow-hidden rounded-[22px] border-border bg-bg p-0">
          <DialogHeader className="shrink-0 border-b border-white bg-white px-5 py-4 text-left">
            <DialogTitle className="text-xl font-black text-ink">{selectedDailyCheckArticle?.title}</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ink/55">{t('aquarium.selectedDailyCheckArticleDesc')}</DialogDescription>
          </DialogHeader>
          {selectedDailyCheckArticle && (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <section className="rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-3">
                <div className="text-[11px] font-black text-emerald-800">{t('aquarium.keyConclusion')}</div>
                <p className="mt-1 text-[13px] font-bold leading-relaxed text-ink">{selectedDailyCheckArticle.summary}</p>
              </section>
              <section className="mt-3 rounded-[18px] bg-white p-3 shadow-sm">
                <div className="text-[13px] font-black text-ink">{t('aquarium.stepByStepActions')}</div>
                <div className="mt-2 grid gap-2">
                  {selectedDailyCheckArticle.firstSteps.map((step, index) => (
                    <div key={step} className="grid grid-cols-[26px_1fr] gap-2 rounded-[13px] bg-bg p-2.5 text-[11px] font-medium leading-relaxed text-ink/68">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-black text-white">{index + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="mt-3 rounded-[18px] border border-red-100 bg-red-50 p-3">
                <div className="text-[13px] font-black text-red-800">{isEn ? 'Avoid For Now' : '暂时不要做'}</div>
                <div className="mt-2 grid gap-1.5">
                  {selectedDailyCheckArticle.avoid.map(item => (
                    <div key={item} className="rounded-[12px] bg-white/80 px-3 py-2 text-[11px] font-medium leading-relaxed text-red-900/72">{item}</div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRiskReminderOpen} onOpenChange={setIsRiskReminderOpen}>
        <DialogContent className="flex max-h-[82dvh] w-[90vw] max-w-[430px] md:max-w-[600px] flex-col overflow-hidden rounded-[20px] border-border bg-bg p-0">
          <DialogHeader className="shrink-0 border-b border-white bg-white px-5 py-4 text-left">
            <DialogTitle className="font-serif text-xl font-bold italic text-ink">{isEn ? 'All Reminders' : '全部提醒'}</DialogTitle>
            <DialogDescription className="text-xs font-medium text-ink/55">
              不是所有提醒都需要立即处理，先完成最明确的一项。
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-2">
              {riskReminders.map(task => {
                const toneClass = task.tone === 'danger'
                  ? 'border-red-100 bg-red-50 text-red-700'
                  : task.tone === 'warning'
                    ? 'border-amber-100 bg-amber-50 text-amber-700'
                    : 'border-sky-100 bg-sky-50 text-sky-700';
                const isDone = task.actionText.startsWith('已');
                return (
                  <div key={task.id} className="rounded-[16px] border border-border/70 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${isDone ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : toneClass}`}>
                          {isDone ? task.actionText : task.level}
                        </span>
                        <h3 className="mt-2 text-[14px] font-black leading-tight text-ink">{task.title}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-ink/58">{task.reason}</p>
                      </div>
                      <Button
                        type="button"
                        variant={isDone ? 'outline' : 'default'}
                        onClick={() => {
                          setIsRiskReminderOpen(false);
                          task.onClick();
                        }}
                        className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-black shadow-none ${
                          isDone
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : task.tone === 'danger'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : task.tone === 'warning'
                                ? 'bg-amber-600 text-white hover:bg-amber-700'
                                : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        {task.actionText}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isObservationOpen} onOpenChange={setIsObservationOpen}>
        <DialogContent className="w-[90vw] max-w-[420px] overflow-hidden rounded-[20px] border-border p-0">
          <DialogHeader className="border-b border-border bg-white px-5 py-4 text-left">
            <DialogTitle className="font-serif text-xl font-bold italic text-ink">{isEn ? 'Observe Fish Condition' : '观察鱼的状态'}</DialogTitle>
            <DialogDescription className="text-xs font-medium text-ink/55">
              {isEn ? 'Did you observe any of these in 2 minutes?' : '2 分钟内你看到以下情况了吗？'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 px-5 py-4 md:grid-cols-2">
            {(isEn ? ['Fish floating at surface', 'Rapid breathing', 'Lying at bottom or hiding', 'Refusing food or abnormal feeding', 'No obvious abnormalities'] : ['鱼浮在水面', '呼吸明显急促', '趴缸或躲藏', '拒食或抢食异常', '没有明显异常']).map(item => {
              const checked = observationChecks.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setObservationChecks(prev => prev.includes(item) ? prev.filter(value => value !== item) : [...prev, item])}
                  className={`flex items-center justify-between rounded-[14px] border px-3 py-3 text-left text-sm font-black transition-colors ${
                    checked ? 'border-red-100 bg-red-50 text-red-700' : 'border-border bg-bg text-ink/68'
                  }`}
                >
                  <span>{item}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${checked ? 'border-red-300 bg-red-500 text-white' : 'border-ink/20 bg-white text-transparent'}`}>
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 border-t border-border bg-white md:flex md:gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full text-sm font-bold"
              onClick={() => {
                setObservationChecks([]);
                markPriorityTask('observeBreathing', '已观察');
                const nextRecords = [
                  ...observationRecords,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    aquariumId: activeId,
                    createdAt: new Date().toISOString(),
                    type: 'observation',
                    note: '未发现明显呼吸异常',
                  },
                ];
                setObservationRecords(nextRecords);
                patchLocalAppState({ observationRecords: nextRecords }, { debounce: true });
                setTankActionMessage(`已记录观察：${format(new Date(), 'HH:mm')} 未发现明显呼吸异常`);
                setIsObservationOpen(false);
              }}
            >
              {isEn ? 'No Abnormalities' : '没有异常，记录观察'}
            </Button>
            <Button
              className="h-10 rounded-full bg-red-600 text-sm font-bold text-white hover:bg-red-700"
              onClick={() => {
                markPriorityTask('observeBreathing', '已发现异常');
                const nextRecords = [
                  ...observationRecords,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    aquariumId: activeId,
                    createdAt: new Date().toISOString(),
                    type: 'observation',
                    note: observationChecks.length > 0 ? observationChecks.join('、') : '发现异常',
                  },
                ];
                setObservationRecords(nextRecords);
                patchLocalAppState({ observationRecords: nextRecords }, { debounce: true });
                setTankActionMessage('已记录呼吸异常，建议继续完成鱼只异常诊断。');
                setIsObservationOpen(false);
                handleOpenDiagnosisWithType('鱼只异常');
              }}
            >
              {isEn ? 'Go to Diagnosis' : '发现异常，去诊断'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fish Dialog (Search Based) */}
              <Dialog open={isAddFishOpen} onOpenChange={(open) => {
                setIsAddFishOpen(open);
                if (!open) {
                  setFishSearchTerm('');
                  setSelectedAddFishItems([]);
                  setAddFishSuccess(null);
                  setAddFishDatePicker(null);
                  setAddFishCompatibilityReview(null);
                }
              }}>
        <AdaptiveTaskContent className="bg-bg md:max-w-[680px]">
          <DialogHeader className="shrink-0 border-b border-white px-4 pb-3 pt-4">
            <DialogTitle className="text-xl font-black text-ink">
              {additionIntent === 'record_existing'
                ? (isEn ? 'Record Existing Livestock' : '记录已有生物')
                : (isEn ? 'Plan Livestock' : '规划想养的生物')}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ink/60">
              {additionIntent === 'record_existing'
                ? (isEn ? 'Save what is already true, then review risks and unknowns.' : '先保存现实情况，再查看风险和未知信息；判断不会阻止记录。')
                : (isEn ? 'Assess first. Nothing is added until you confirm it is actually in the tank.' : '先判断再决定；确认“已经实际入缸”前，不会写入缸内物种。')}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-4 pb-24">
              {addFishSuccess ? (
                <div className="grid gap-4 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-lg font-black text-emerald-800">{isEn ? 'Recorded' : '已记录'}</div>
                      <p className="mt-1 text-[12px] font-bold leading-relaxed text-emerald-900/70">
                        已保存到 {addFishSuccess.aquariumName}。这是现实记录，下面的判断只用于提示下一步，不会撤销已保存内容。
                      </p>
                    </div>
                  </div>

                  <div className={`rounded-[16px] border p-3 ${
                    addFishSuccess.result.assessment?.status === 'not_recommended'
                      ? 'border-red-200 bg-red-50 text-red-900'
                      : addFishSuccess.result.assessment?.status === 'insufficient_data'
                        ? 'border-sky-200 bg-sky-50 text-sky-900'
                        : addFishSuccess.result.assessment?.status === 'caution'
                          ? 'border-amber-200 bg-amber-50 text-amber-900'
                          : 'border-emerald-100 bg-white text-emerald-900'
                  }`}>
                    <div className="text-[12px] font-black">
                      {addFishSuccess.result.assessment
                        ? getTankCompatibilityStatusLabel(addFishSuccess.result.assessment.status)
                        : '判断暂时不可用'}
                    </div>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed opacity-75">
                      {addFishSuccess.result.assessmentFailure || (
                        addFishSuccess.result.assessment?.status === 'not_recommended'
                          ? '已记录现实情况；当前存在紧急混养风险，请优先查看风险处理。'
                          : addFishSuccess.result.assessment?.status === 'insufficient_data'
                            ? '已记录现实情况；补充基础尺寸和水体类型后可以得到更完整判断。'
                            : addFishSuccess.result.assessment?.status === 'caution'
                              ? '已记录现实情况；请按提示重点观察，不需要重新添加。'
                              : '当前未发现阻断风险，继续观察实际状态。'
                      )}
                    </p>
                    {(addFishSuccess.result.assessment?.keyRules.length || 0) > 0 && (
                      <div className="mt-2 grid gap-1">
                        {addFishSuccess.result.assessment?.keyRules.slice(0, 3).map(rule => (
                          <div key={`${rule.code}-${rule.evidence}`} className="text-[10px] font-bold leading-relaxed">
                            <span className="font-black">{rule.title}：</span>{rule.evidence}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {addFishSuccess.result.failedItems.length > 0 && (
                    <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-3 text-[11px] font-bold text-amber-900">
                      {addFishSuccess.result.failedItems.map(item => (
                        <div key={item.fishId}>{fishData.find(fish => fish.id === item.fishId)?.name || item.fishId}：{item.message}</div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-2">
                    {addFishSuccess.items.map(item => (
                      <div key={item.fishId} className="grid grid-cols-[44px_1fr] gap-3 rounded-[16px] bg-white/82 p-2 shadow-sm">
                        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] bg-[#FBFAF6]">
                          {item.image && <img src={item.image} alt={getSpeciesNameLocalized(item, isEn)} className="h-full w-full object-contain p-1" referrerPolicy="no-referrer" />}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-ink">{getSpeciesNameLocalized(item, isEn)} x {item.quantity}</div>
                          <div className="mt-0.5 text-[11px] font-bold text-ink/48">入缸日期：{formatAddFishDateLabel(item.entryDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2">
                    <Button type="button" onClick={handlePostRecordPrimaryAction} className="h-11 rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800">
                      {addFishSuccess.result.assessment?.status === 'insufficient_data'
                        ? '补充基础资料'
                        : addFishSuccess.result.assessment?.status === 'not_recommended'
                          ? '查看风险处理'
                          : '返回鱼缸查看'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleContinueAddFish} className="h-11 rounded-full text-sm font-black text-ink/58">
                      {addFishSuccess.result.failedItems.length > 0 ? '继续处理失败项' : '继续记录其他生物'}
                    </Button>
                  </div>
                </div>
              ) : addFishCompatibilityReview ? (
                <section className={`grid gap-3 rounded-[20px] border p-4 shadow-sm ${
                  addFishCompatibilityReview.status === 'not_recommended'
                    ? 'border-red-200 bg-red-50'
                    : addFishCompatibilityReview.status === 'insufficient_data'
                      ? 'border-sky-100 bg-sky-50'
                      : 'border-amber-100 bg-amber-50'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black text-ink/45">{isEn ? 'Step 2: Planning Assessment' : '第 2 步：规划判断'}</div>
                      <div className="mt-1 text-lg font-black text-ink">
                        {getTankCompatibilityStatusLabel(addFishCompatibilityReview.status)}
                      </div>
                      <p className="mt-1 text-[12px] font-bold leading-relaxed text-ink/62">
                        {addFishCompatibilityReview.status === 'not_recommended'
                          ? '当前规划命中阻断风险，不建议实际加入；这不会删除现实中已经存在的记录。'
                          : addFishCompatibilityReview.status === 'insufficient_data'
                            ? '鱼缸关键信息不足，请先补全后再判断。'
                            : addFishCompatibilityReview.status === 'caution'
                              ? '存在需要注意的条件；确认理解后，只有实际入缸时才记录。'
                              : '当前规划允许继续；只有实际入缸后才记录到鱼缸。'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-ink/55 shadow-sm">
                      {addFishCompatibilityReview.evaluations.length} 种生物
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {addFishCompatibilityReview.evaluations.map(evaluation => (
                      <div key={evaluation.fish.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[14px] bg-white/82 px-3 py-2 shadow-sm">
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-black text-ink">{getSpeciesNameLocalized(evaluation.fish, isEn)} x {evaluation.quantity}</span>
                          <span className="mt-0.5 block truncate text-[10px] font-bold text-ink/45">{evaluation.result.summary}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-black text-ink/60">{getTankCompatibilityStatusLabel(evaluation.result.status)}</span>
                      </div>
                    ))}
                  </div>

                  {addFishCompatibilityReview.keyRules.length > 0 && (
                    <div className="rounded-[14px] bg-white/72 p-3">
                      <div className="text-[11px] font-black text-ink">{isEn ? 'Key Reasons' : '最关键的依据'}</div>
                      <div className="mt-2 grid gap-1.5">
                        {addFishCompatibilityReview.keyRules.slice(0, 3).map(rule => (
                          <div key={`${rule.code}-${rule.title}-${rule.evidence}`} className="text-[11px] font-medium leading-relaxed text-ink/62">
                            <span className="font-black text-ink/72">{rule.title}：</span>{rule.evidence}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ) : (
                <>

              <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                <div>
                  <div className="text-[13px] font-black text-ink">{isEn ? 'Step 1: Select Species' : '第 1 步：选择生物'}</div>
                  <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-ink/50">{addFishIntro}</p>
                </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                <Input 
                  placeholder={isEn ? "Search fish, shrimp, snails or scientific name..." : "搜索鱼、虾、螺或学名"} 
                  className="h-10 rounded-[14px] border-border bg-bg pl-9 text-sm font-medium text-ink"
                  value={fishSearchTerm}
                          onChange={(e) => {
                            setFishSearchTerm(e.target.value);
                            setAddFishSuccess(null);
                            setAddFishDatePicker(null);
                            setAddFishCompatibilityReview(null);
                          }}
                />
              </div>

                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-black text-ink/55">{fishSearchTerm.trim() ? '搜索结果' : '智能推荐'}</div>
                  {!fishSearchTerm.trim() && <span className="text-[10px] font-bold text-ink/35">{isEn ? 'Based on active tank' : '基于当前鱼缸'}</span>}
                </div>

                <div className="grid max-h-[300px] gap-2 overflow-y-auto pr-1">
                  {addFishList.map(fish => {
                    const isSelected = selectedAddFishItems.some(item => item.fishId === fish.id);
                    return (
                    <button
                      key={fish.id}
                      onClick={() => toggleSelectedAddFish(fish)}
                      className={`grid grid-cols-[54px_1fr] gap-3 rounded-[16px] border p-2 text-left transition-colors ${
                        isSelected ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-transparent bg-bg/70 hover:border-emerald-200 hover:bg-white'
                      }`}
                    >
                      <span className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-[14px] ${getSpeciesImageSurfaceClass(fish)}`}>
                        <img src={getSpeciesDisplayImage(fish)} alt={fish.name} className={`h-full w-full object-contain p-1 ${getSpeciesImageClass(fish)}`} referrerPolicy="no-referrer" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-ink">{getSpeciesNameLocalized(fish, isEn)}</span>
                            <span className="block truncate text-[10px] font-medium text-ink/45">{fish.scientificName || fish.category}</span>
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-ink/45'
                          }`}>
                            {isSelected ? '已选择' : '选择'}
                          </span>
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {getAddFishTags(fish).map(tag => (
                            <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-emerald-700">{tag}</span>
                          ))}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[10px] font-medium leading-relaxed text-ink/55">
                          {getAddFishReason(fish)}
                        </span>
                      </span>
                    </button>
                    );
                  })}
                  {fishSearchTerm.trim() && searchResults.length === 0 && (
                    <div className="rounded-[14px] bg-bg px-3 py-5 text-center text-xs font-medium text-ink/50">{isEn ? 'No species found' : '没有找到相关生物'}</div>
                  )}
                  {!fishSearchTerm.trim() && recommendedFishes.length === 0 && (
                    <div className="rounded-[14px] bg-amber-50 p-3 text-xs font-medium leading-relaxed text-amber-800">
                      {noRecommendationHint}
                    </div>
                  )}
                </div>
              </section>

              <section className={`grid gap-3 rounded-[18px] bg-white p-3 shadow-sm ${selectedAddSpeciesCount > 0 ? '' : 'opacity-80'}`}>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-black text-ink">{isEn ? 'Step 2: Confirm Selected Species' : '第 2 步：确认已选生物'}</div>
                    {selectedAddSpeciesCount > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                        已选择 {selectedAddSpeciesCount} 种
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-ink/50">
                    {selectedAddSpeciesCount > 0 ? '确认每种生物的数量和入缸日期后再添加。' : '还没有选择生物，请先从上方搜索或推荐中选择。'}
                  </p>
                </div>

                {selectedAddSpeciesCount > 0 ? (
                  <>
                    <div className="grid gap-2">
                      {selectedAddFishDetails.map(item => {
                        const isDatePickerOpen = addFishDatePicker?.fishId === item.fishId;
                        const datePickerMonth = isDatePickerOpen ? addFishDatePicker.month : new Date(item.entryDate);
                        const monthStartOffset = getDay(startOfMonth(datePickerMonth));
                        return (
                        <div key={item.fishId} className="grid gap-3 rounded-[16px] bg-bg p-2">
                          <div className="grid grid-cols-[46px_1fr_auto] gap-2">
                            <span className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] ${getSpeciesImageSurfaceClass(item.fish)}`}>
                              <img src={getSpeciesDisplayImage(item.fish)} alt={item.fish.name} className={`h-full w-full object-contain p-1 ${getSpeciesImageClass(item.fish)}`} referrerPolicy="no-referrer" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-ink">{getSpeciesNameLocalized(item.fish, isEn)}</div>
                              <div className="mt-0.5 truncate text-[10px] font-medium text-ink/45">{item.fish.category}</div>
                              <div className="mt-1 text-[10px] font-bold text-emerald-700">{isEn ? 'Recommend adding a small amount first and observing for 3-7 days.' : '建议先少量加入，观察 3-7 天。'}</div>
                            </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddFishCompatibilityReview(null);
                                        addFishOperationIdRef.current = '';
                                        setSelectedAddFishItems(prev => prev.filter(selected => selected.fishId !== item.fishId));
                                      }}
                                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                              aria-label={`移除 ${item.fish.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid gap-2 md:grid-cols-[0.78fr_1.22fr]">
                            <div className="rounded-[14px] bg-white p-2">
                              <Label className="text-[10px] font-black text-ink/48">{isEn ? "Quantity" : "数量"}</Label>
                              <div className="mt-1 grid h-10 grid-cols-[34px_1fr_34px] items-center gap-1 rounded-full bg-bg p-1">
                                <button
                                  type="button"
                                  onClick={() => updateSelectedAddFishItem(item.fishId, { quantity: Math.max(1, item.quantity - 1) })}
                                  disabled={item.quantity <= 1}
                                  className="flex h-8 items-center justify-center rounded-full bg-white text-lg font-black text-ink/55 shadow-sm disabled:text-ink/18"
                                  aria-label={`减少 ${item.fish.name} 数量`}
                                >
                                  -
                                </button>
                                <div className="text-center text-[20px] font-black text-ink">{item.quantity}</div>
                                <button
                                  type="button"
                                  onClick={() => updateSelectedAddFishItem(item.fishId, { quantity: item.quantity + 1 })}
                                  className="flex h-8 items-center justify-center rounded-full bg-white text-lg font-black text-emerald-700 shadow-sm"
                                  aria-label={`增加 ${item.fish.name} 数量`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="rounded-[14px] bg-white p-2">
                              <Label className="text-[10px] font-black text-ink/48">{isEn ? 'Entry Date' : '入缸日期'}</Label>
                              <button
                                type="button"
                                onClick={() => setAddFishDatePicker(prev => (
                                  prev?.fishId === item.fishId
                                    ? null
                                    : { fishId: item.fishId, month: new Date(item.entryDate) }
                                ))}
                                className="mt-1 grid h-10 w-full grid-cols-[auto_1fr] items-center gap-1 rounded-full bg-bg px-3 text-left"
                              >
                                <Calendar className="h-3.5 w-3.5 text-ink/35" />
                                <span className="truncate text-center text-[12px] font-black text-ink">{formatAddFishDateLabel(item.entryDate)}</span>
                              </button>
                            </div>
                          </div>

                          {isDatePickerOpen && (
                            <div className="rounded-[16px] bg-white p-3 shadow-sm ring-1 ring-emerald-100">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setAddFishDatePicker({ fishId: item.fishId, month: subMonths(datePickerMonth, 1) })}
                                  className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-ink/55"
                                  aria-label={isEn ? "Previous Month" : "上个月"}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="text-sm font-black text-ink">{format(datePickerMonth, 'yyyy年 M月')}</div>
                                <button
                                  type="button"
                                  onClick={() => setAddFishDatePicker({ fishId: item.fishId, month: addMonths(datePickerMonth, 1) })}
                                  className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-ink/55 disabled:text-ink/18"
                                  disabled={startOfMonth(addMonths(datePickerMonth, 1)) > new Date()}
                                  aria-label={isEn ? "Next Month" : "下个月"}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black text-ink/35">
                                {['日', '一', '二', '三', '四', '五', '六'].map(day => <span key={day}>{day}</span>)}
                              </div>
                              <div className="mt-1 grid grid-cols-7 gap-1">
                                {Array.from({ length: monthStartOffset }).map((_, index) => <span key={`empty-${index}`} />)}
                                {eachDayOfInterval({ start: startOfMonth(datePickerMonth), end: endOfMonth(datePickerMonth) }).map(date => {
                                  const dateStr = format(date, 'yyyy-MM-dd');
                                  const isSelected = item.entryDate === dateStr;
                                  const isToday = isSameDay(date, new Date());
                                  const isFuture = date > new Date() && !isToday;
                                  return (
                                    <button
                                      key={dateStr}
                                      type="button"
                                      disabled={isFuture}
                                      onClick={() => {
                                        updateSelectedAddFishItem(item.fishId, { entryDate: dateStr });
                                        setAddFishDatePicker(null);
                                      }}
                                      className={`flex h-8 items-center justify-center rounded-full text-[11px] font-black ${
                                        isSelected
                                          ? 'bg-emerald-700 text-white'
                                          : isToday
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : isFuture
                                              ? 'text-ink/18'
                                              : 'bg-bg text-ink/62'
                                      }`}
                                    >
                                      {format(date, 'd')}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                      })}
                            </div>

                            <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 p-3 text-[12px] font-bold leading-relaxed text-emerald-900">
                      {selectedAddSpeciesCount === 1 ? (
                        <>
                          {additionIntent === 'record_existing' ? '将记录' : '将评估'}：{selectedAddFishDetails[0].fish.name} x {selectedAddFishDetails[0].quantity}
                        </>
                      ) : (
                        <>
                          {additionIntent === 'record_existing' ? '将记录' : '将评估'}：{selectedAddSpeciesCount} 种生物，共 {selectedAddTotalQuantity} 只/条
                          <div className="mt-1 grid gap-0.5 text-[10px] font-bold text-emerald-900/70">
                            {selectedAddFishDetails.slice(0, 4).map(item => (
                              <span key={item.fishId}>{getSpeciesNameLocalized(item.fish, isEn)} x {item.quantity}</span>
                            ))}
                            {selectedAddFishDetails.length > 4 && <span>还有 {selectedAddFishDetails.length - 4} 种...</span>}
                          </div>
                        </>
                      )}
                      <div className="mt-1 text-[10px] font-bold text-emerald-900/65">
                        默认入缸日期为今天，可分别修改。
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-ink/12 bg-bg px-3 py-6 text-center text-[12px] font-bold text-ink/42">
                    还没有选择生物，请先从上方搜索或推荐中选择。
                  </div>
                )}
              </section>
                </>
              )}
            </div>
          </div>
                  {!addFishSuccess && (
                    <DialogFooter className="shrink-0 border-t border-white bg-white/95 px-4 py-3 shadow-[0_-10px_24px_rgba(27,77,62,0.08)]">
                      <Button
                        variant="outline"
                        className="h-10 rounded-full text-sm font-bold text-ink"
                        disabled={isAddFishSaving}
                        onClick={() => {
                          if (addFishCompatibilityReview) {
                            setAddFishCompatibilityReview(null);
                            return;
                          }
                          setIsAddFishOpen(false);
                        }}
                      >
                        {addFishCompatibilityReview ? '返回调整' : '取消'}
                      </Button>
                      <div className="grid gap-1">
                        {selectedAddSpeciesCount === 0 && <div className="text-center text-[10px] font-bold text-ink/38">{isEn ? 'Select at least one species.' : '请先从上方选择至少一种生物'}</div>}
                        {addFishCompatibilityReview && ['block', 'complete_information'].includes(getTankCompatibilityAddPolicy(addFishCompatibilityReview.status)) && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isAddFishSaving}
                            onClick={() => void handleRecordExistingFromPlan()}
                            className="h-10 rounded-full border-amber-200 bg-amber-50 text-xs font-black text-amber-900"
                          >
                            {isAddFishSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            已经在缸里了，记录实际情况
                          </Button>
                        )}
                        <Button
                          className="h-10 rounded-full bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800 disabled:bg-ink/15 disabled:text-ink/35"
                          onClick={addFishCompatibilityReview
                            ? getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'block'
                              ? () => setAddFishCompatibilityReview(null)
                              : () => void handleConfirmAddFishAfterReview()
                            : () => void handleAddFish()}
                          disabled={selectedAddSpeciesCount === 0 || isAddFishSaving}
                        >
                          {isAddFishSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />保存中…</> : selectedAddSpeciesCount === 0
                            ? '请先选择生物'
                            : addFishCompatibilityReview
                              ? getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'block'
                                ? '返回调整组合'
                                : getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'complete_information'
                                  ? '先补充鱼缸信息'
                                  : '已经实际入缸，记录下来'
                              : additionIntent === 'record_existing'
                                ? '保存到鱼缸'
                                : '查看规划判断'}
                        </Button>
                      </div>
            </DialogFooter>
          )}
        </AdaptiveTaskContent>
      </Dialog>

      <Dialog open={isTankCopilotOpen} onOpenChange={setIsTankCopilotOpen}>
        <AdaptiveTaskContent>
          <DialogHeader className="shrink-0 border-b border-border/70 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-ink">
              <Sparkles className="h-5 w-5 text-accent" />
              {isEn ? 'AI Tank Copilot' : 'AI 建缸助手'}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">
              {isEn ? 'Tell me what you want to keep, and I will complete conditions & organize a safe plan.' : '告诉我想养什么，我帮你补齐条件并整理安全方案。'}
            </DialogDescription>
          </DialogHeader>
          <div className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { step: 1, title: isEn ? 'Set Goal' : '说目标', note: isEn ? 'Input direction' : '输入方向' },
                  { step: 2, title: isEn ? 'Fill Info' : '补信息', note: isEn ? 'Max 3 questions' : '最多 3 问' },
                  { step: 3, title: isEn ? 'View Plan' : '看方案', note: isEn ? 'Next step' : '执行下一步' },
                ].map(item => {
                  const isActive = tankCopilotStep === item.step;
                  const isDone = tankCopilotStep > item.step;
                  return (
                    <div
                      key={item.step}
                      className={`rounded-[16px] border px-3 py-2 ${
                        isActive
                          ? 'border-accent/30 bg-emerald-50 text-accent'
                          : isDone
                            ? 'border-emerald-100 bg-white text-emerald-700'
                            : 'border-border bg-white text-ink/35'
                      }`}
                    >
                      <div className="text-xs font-black">{item.step}. {item.title}</div>
                      <div className="mt-0.5 text-[10px] font-bold opacity-75">{isDone ? '已完成' : item.note}</div>
                    </div>
                  );
                })}
              </div>

              <section className="rounded-[20px] border border-border bg-bg/70 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-ink">{isEn ? 'What tank do you want to build?' : '你想建什么样的缸？'}</div>
                    <div className="text-[11px] font-bold text-ink/45">
                      当前参考：{activeAquarium.name} · {activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · {activeAquarium.targetTemperature || 25}°C
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-ink/45">
                    {isEn ? 'Max 3 steps to plan' : '最多 3 步到方案'}
                  </span>
                </div>
                <div>
                  <Input
                    value={tankCopilotGoal}
                    onChange={(event) => {
                      setTankCopilotGoal(event.target.value);
                      setTankCopilotError('');
                    }}
                    placeholder={isEn ? 'e.g. Small beginner freshwater tank, low-tech planted tank, shrimp tank' : '例如：新手小型淡水缸、低维护草缸、虾缸'}
                    className="h-11 rounded-full border-border bg-white px-4 text-sm font-bold"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(isEn ? ['Beginner freshwater tank', 'Low-maintenance planted tank', 'Shrimp tank', 'Display schooling tank'] : ['新手小型淡水缸', '低维护草缸', '虾缸', '观赏鱼群游缸']).map(goal => (
                    <button
                      key={goal}
                      type="button"
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-black text-ink/58 hover:border-accent/40 hover:text-accent"
                      onClick={() => {
                        setTankCopilotGoal(goal);
                        setTankCopilotResult(null);
                        setTankCopilotAnswers({});
                        setTankCopilotError('');
                      }}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                {tankCopilotError && (
                  <div className="mt-3 rounded-[14px] bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    {tankCopilotError}
                  </div>
                )}
              </section>

              {tankCopilotResult ? (
                <>
                  <section className="rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-black text-accent">{isEn ? 'Goal Interpretation' : '目标理解'}</div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${
                        tankCopilotResult.source === 'model'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tankCopilotResult.source === 'model' ? '模型回复' : '本地模板'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-ink">
                      {tankCopilotResult.source === 'model'
                        ? tankCopilotResult.goalUnderstanding
                        : 'AI 暂不可用，系统规则仍可使用。'}
                    </p>
                    {tankCopilotNeedsAnswers && (
                      <div className="mt-3 rounded-[16px] bg-white/85 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-black text-amber-700">{isEn ? 'Step 2: Key Information' : '第 2 步：补充关键信息'}</div>
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
                            {tankCopilotMissingQuestions.length} 项
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3">
                          {tankCopilotMissingQuestions.map((question, index) => (
                            <label key={question.id} className="grid gap-1.5">
                              <span className="text-[11px] font-black text-ink/60">
                                {index + 1}. {question.prompt}
                              </span>
                              <Input
                                value={tankCopilotAnswers[question.id] || ''}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setTankCopilotAnswers(prev => ({
                                    ...prev,
                                    [question.id]: nextValue,
                                  }));
                                }}
                                placeholder={isEn ? "Write 'unsure' if not certain" : "不知道也可以写“不确定”"}
                                className="h-10 rounded-full border-border bg-white px-3 text-xs font-bold"
                              />
                            </label>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] font-bold leading-relaxed text-ink/45">
                          补完后重新生成，方案会更贴近你的鱼缸；不会直接修改真实鱼缸。
                        </p>
                      </div>
                    )}
                  </section>

                  {!tankCopilotNeedsAnswers && Boolean(tankCopilotResult.planSummary?.trim()) && (
                    <section className="rounded-[20px] border border-border bg-white p-4">
                      <div className="text-sm font-black text-ink">{isEn ? 'Recommended Direction' : '推荐方向'}</div>
                      <div className="mt-3 rounded-[14px] bg-bg px-3 py-2 text-xs font-bold leading-relaxed text-ink/65">
                        {tankCopilotResult.planSummary}
                      </div>
                    </section>
                  )}

                  {!tankCopilotNeedsAnswers && tankCopilotAllowedCandidates.length > 0 && (
                    <section className="rounded-[20px] border border-border bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-black text-ink">{isEn ? 'Candidate Species' : '候选生物'}</div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                          本地规则允许
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {tankCopilotAllowedCandidates.map(candidate => (
                          <div key={candidate.speciesId} className="rounded-[16px] bg-bg p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-sm font-black text-ink">{candidate.name}</div>
                              {candidate.recommendedQuantity > 0 && (
                                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-accent">
                                  x{candidate.recommendedQuantity}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-relaxed text-ink/50">
                              {candidate.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {!tankCopilotNeedsAnswers && tankCopilotResult.selectedCandidateIds.length > 0 && tankCopilotAllowedCandidates.length === 0 && (
                    <section className="rounded-[20px] border border-amber-100 bg-amber-50/70 p-4">
                      <div className="text-sm font-black text-amber-800">{isEn ? 'No executable candidates' : '暂无可执行候选'}</div>
                      <p className="mt-2 text-xs font-bold leading-relaxed text-amber-700">
                        模型或模板给出的候选没有通过本地规则候选池校验。请重新描述目标，或先完善鱼缸信息。
                      </p>
                    </section>
                  )}

                  {!tankCopilotNeedsAnswers && tankCopilotHiddenCandidateCount > 0 && (
                    <div className="rounded-[16px] border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                      已隐藏 {tankCopilotHiddenCandidateCount} 个未通过本地规则候选池校验的候选。
                    </div>
                  )}

                  {!tankCopilotNeedsAnswers && (
                  <section className="rounded-[20px] border border-border bg-white p-4">
                    <div className="text-sm font-black text-ink">{isEn ? 'Next Step' : '下一步动作'}</div>
                    <div className="mt-3 rounded-[16px] bg-emerald-50 px-3 py-3">
                      <div className="text-xs font-black text-emerald-700">{isEn ? 'Recommended First' : '建议先做'}</div>
                      <div className="mt-1 text-sm font-black text-ink">{tankCopilotActionView.label}</div>
                      <div className="mt-1 text-[11px] font-bold leading-relaxed text-ink/55">
                        {tankCopilotActionView.description}
                      </div>
                    </div>
                    {tankCopilotResult.blockedExplanation.length > 0 && (
                      <details data-disclosure-purpose="alternative_plan" className="mt-3 rounded-[14px] bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700">
                        <summary className="cursor-pointer">{isEn ? 'View Not Recommended' : '查看不建议方向'}</summary>
                        <div className="mt-2 grid gap-1.5">
                          {tankCopilotResult.blockedExplanation.map(reason => (
                            <div key={reason}>• {reason}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </section>
                  )}
                </>
              ) : (
                <section className="rounded-[20px] border border-dashed border-border bg-white p-5 text-center">
                  <div className="text-sm font-black text-ink">{isEn ? 'No setup plan generated yet' : '还没有生成方案'}</div>
                  <p className="mt-2 text-xs font-bold leading-relaxed text-ink/45">
                    输入一个目标后，系统会先用本地规则筛掉不安全方向，再让 AI 组织成可执行方案。
                  </p>
                </section>
              )}

              <div className="rounded-[16px] bg-bg px-4 py-3 text-[11px] font-bold leading-relaxed text-ink/45">
                系统结论由规则生成，AI 负责理解目标、解释方案和生成行动建议。
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-border/70 px-5 pb-5 pt-4 sm:justify-end">
            <Button
              type="button"
              className="h-11 rounded-full bg-accent px-6 text-sm font-black text-white"
              disabled={isTankCopilotPrimaryDisabled}
              onClick={handleTankCopilotPrimaryAction}
              title={tankCopilotNeedsAnswers && !tankCopilotHasAnswer ? '先补充至少一项信息' : undefined}
            >
              {tankCopilotPrimaryLabel}
            </Button>
          </DialogFooter>
        </AdaptiveTaskContent>
      </Dialog>

      <Dialog open={isSmartRecommendOpen} onOpenChange={(open) => {
        setIsSmartRecommendOpen(open);
        if (!open) {
          setSmartSimulation(null);
          setSmartCandidateScopeIds(null);
        }
      }}>
        <DialogContent className="flex max-h-[88dvh] w-[94vw] max-w-[920px] flex-col overflow-hidden rounded-[24px] border-border bg-white p-0">
          <DialogHeader className="shrink-0 border-b border-border/70 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-ink">
              <Sparkles className="h-5 w-5 text-accent" />
              缸内生物智能推荐
            </DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">
              系统规则先筛安全边界，AI 只做解释和排序辅助。
            </DialogDescription>
          </DialogHeader>
          <div className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2 rounded-[20px] bg-bg p-2 sm:grid-cols-2">
                {[
                  { id: 'existing_livestock' as RecommendationMode, title: '已有生物推荐', desc: '基于当前缸内生物补充' },
                  { id: 'empty_tank' as RecommendationMode, title: '空缸搭配', desc: '生成完整组合方案' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSmartRecommendMode(mode.id);
                      setSmartSimulation(null);
                    }}
                    className={`rounded-[16px] px-4 py-3 text-left transition-colors ${
                      smartRecommendMode === mode.id ? 'bg-accent text-white shadow-sm' : 'bg-white text-ink hover:bg-white/80'
                    }`}
                  >
                    <span className="block text-sm font-black">{mode.title}</span>
                    <span className={`mt-1 block text-[11px] font-bold ${smartRecommendMode === mode.id ? 'text-white/68' : 'text-ink/45'}`}>{mode.desc}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="text-sm font-black text-ink">{isEn ? 'Current Tank Profile' : '当前鱼缸画像'}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black">
                    <span className="rounded-full bg-white px-2.5 py-1 text-accent">负载 {smartRecommendation.profile.load.loadRate}%</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-ink/58">剩余 {smartRecommendation.profile.load.remainingCapacity} 负载</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-ink/58">已有 {smartRecommendation.profile.livestock.length} 种活体</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-ink/58">可补水层 {smartRecommendation.profile.availableNiches.length || 0} 个</span>
                  </div>
                </div>
                <div className="rounded-[16px] bg-white px-4 py-3 text-[12px] font-bold text-ink/62">
                  {smartRecommendation.localSummary}
                </div>
              </div>

              <div className="grid gap-2 rounded-[18px] border border-border/70 bg-white p-3">
                <Label className="text-[12px] font-black text-ink">{isEn ? 'Preference Keywords' : '偏好关键词'}</Label>
                <div className="flex flex-wrap gap-2">
                  {['新手友好', '低维护', '群游', '清洁工具', '草缸友好'].map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => setSmartPreference(prev => prev.includes(keyword) ? prev.replace(keyword, '').trim() : `${prev} ${keyword}`.trim())}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${
                        smartPreference.includes(keyword) ? 'border-accent bg-emerald-50 text-accent' : 'border-border bg-white text-ink/55'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                <Input
                  value={smartPreference}
                  onChange={event => setSmartPreference(event.target.value)}
                  className="h-10 rounded-full bg-bg text-sm font-bold"
                  placeholder={isEn ? "e.g. Low maintenance, vibrant color, beginner friendly" : "例如：想要低维护、颜色明显、适合新手"}
                />
              </div>

              {smartRecommendation.needsMoreInfo && (
                <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                  推荐前建议先补充：{smartRecommendation.infoRequests.join('、')}。
                </div>
              )}

              {!smartCandidateScope && smartRecommendation.mode === 'empty_tank' && smartRecommendation.emptyPlans.length > 0 && (
                <section className="grid gap-3">
                  <div className="text-sm font-black text-ink">{isEn ? 'Empty Tank Preset Plans' : '空缸组合方案'}</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {smartRecommendation.emptyPlans.map(plan => (
                      <div key={plan.id} className="rounded-[20px] border border-border/70 bg-bg/45 p-4">
                        <div className="text-base font-black text-ink">{plan.name}</div>
                        <div className="mt-1 text-[11px] font-bold text-ink/50">{plan.audience}</div>
                        <div className="mt-3 space-y-1.5">
                          {plan.species.map(item => (
                            <div key={item.speciesId} className="flex justify-between rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink/62">
                              <span>{item.name}</span>
                              <span>x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-[11px] font-bold text-ink/50">预计负载 {plan.estimatedLoadRate}% · 维护 {plan.maintenanceLevel}</div>
                        <Button
                          type="button"
                          className="mt-3 h-9 w-full rounded-full bg-accent text-xs font-black text-white"
                          onClick={() => {
                            const first = plan.species[0];
                            const candidate = [...smartRecommendation.direct, ...smartRecommendation.adjustable].find(item => item.speciesId === first.speciesId);
                            if (candidate) openSmartSimulation({ ...candidate, recommendedQuantity: first.quantity });
                          }}
                        >
                          加入模拟鱼缸
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(smartCandidateScope || smartRecommendation.mode === 'existing_livestock') && (
                <section className="grid gap-4">
                  {[
                    { title: '可以直接加入', items: visibleSmartDirect, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                    { title: '调整后可以加入', items: visibleSmartAdjustable, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
                    { title: '不建议加入', items: visibleSmartBlocked, tone: 'text-rose-700 bg-rose-50 border-rose-100' },
                  ].map(group => (
                    <div key={group.title} className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-ink">{group.title}</h4>
                        <span className="text-[11px] font-black text-ink/38">{group.items.length} 个</span>
                      </div>
                      {group.items.length === 0 ? (
                        <div className="rounded-[16px] border border-dashed border-border bg-bg/50 px-4 py-3 text-xs font-bold text-ink/45">
                          暂无候选。
                        </div>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {group.items.map(candidate => {
                            const fish = fishData.find(item => item.id === candidate.speciesId);
                            return (
                              <button
                                key={candidate.speciesId}
                                type="button"
                                disabled={candidate.status === 'blocked'}
                                onClick={() => openSmartSimulation(candidate)}
                                className="grid grid-cols-[64px_1fr] gap-3 rounded-[18px] border border-border/70 bg-white p-3 text-left shadow-sm transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <span className={`flex h-16 w-16 items-center justify-center rounded-[16px] ${fish ? getSpeciesImageSurfaceClass(fish) : 'bg-bg'}`}>
                                  {fish && <img src={getSpeciesDisplayImage(fish)} alt={candidate.name} className={`max-h-14 max-w-14 object-contain ${getSpeciesImageClass(fish)}`} referrerPolicy="no-referrer" />}
                                </span>
                                <span className="min-w-0">
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-black text-ink">{candidate.name}</span>
                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${group.tone}`}>
                                      {candidate.status === 'direct' ? '可加入' : candidate.status === 'adjustable' ? '需调整' : '不建议'}
                                    </span>
                                  </span>
                                  <span className="mt-1 block text-[11px] font-bold text-ink/52">建议 x{candidate.recommendedQuantity} · 适配 {candidate.fitScore}</span>
                                  <span className="mt-1 line-clamp-2 block text-[11px] font-medium leading-relaxed text-ink/55">{candidate.reason}</span>
                                  {(candidate.risks[0] || candidate.requiredAdjustments[0]) && (
                                    <span className="mt-1 block truncate text-[10px] font-black text-amber-700">
                                      {candidate.risks[0] || candidate.requiredAdjustments[0]}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {!smartCandidateScope && smartRecommendation.blockedSummary.length > 0 && (
                <div className="rounded-[18px] border border-rose-100 bg-rose-50 p-4 text-xs font-bold leading-relaxed text-rose-700">
                  {smartRecommendation.blockedSummary.slice(0, 3).map(item => <div key={item}>• {item}</div>)}
                </div>
              )}

              {smartSimulation && (
                <div className="rounded-[22px] border border-accent/20 bg-emerald-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-ink">模拟添加：{smartSimulation.candidate.name}</div>
                      <div className="mt-1 text-[11px] font-bold text-ink/55">{smartSimulation.conclusion}</div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
                      <button type="button" onClick={() => updateSmartSimulationQuantity(smartAddQuantity - 1)} className="h-7 w-7 rounded-full bg-bg text-sm font-black">-</button>
                      <span className="min-w-8 text-center text-sm font-black">{smartAddQuantity}</span>
                      <button type="button" onClick={() => updateSmartSimulationQuantity(smartAddQuantity + 1)} className="h-7 w-7 rounded-full bg-emerald-50 text-sm font-black text-accent">+</button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[16px] bg-white px-3 py-2">
                      <div className="text-[10px] font-black text-ink/38">{isEn ? "Bioload Before" : "添加前负载"}</div>
                      <div className="text-xl font-black text-ink">{smartSimulation.beforeLoadRate}%</div>
                    </div>
                    <div className="rounded-[16px] bg-white px-3 py-2">
                      <div className="text-[10px] font-black text-ink/38">{isEn ? "Bioload After" : "添加后负载"}</div>
                      <div className="text-xl font-black text-accent">{smartSimulation.afterLoadRate}%</div>
                    </div>
                    <div className="rounded-[16px] bg-white px-3 py-2">
                      <div className="text-[10px] font-black text-ink/38">{isEn ? 'Equipment Support' : '设备支持'}</div>
                      <div className="text-sm font-black text-ink">{smartSimulation.equipmentStillFits ? '仍满足' : '需确认'}</div>
                    </div>
                  </div>
                  {smartSimulation.newRisks.length > 0 && (
                    <div className="mt-3 rounded-[16px] bg-white px-3 py-2 text-[11px] font-bold text-amber-700">
                      {smartSimulation.newRisks.slice(0, 3).join(' / ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-border/70 bg-white px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
            {smartSimulation ? (
              <div className="grid w-full gap-2 sm:grid-cols-[1fr_1fr]">
                <Button type="button" variant="outline" disabled={isSmartSimulationSaving} onClick={() => setSmartSimulation(null)} className="h-11 rounded-full text-sm font-black">
                  取消模拟
                </Button>
                <Button type="button" disabled={isSmartSimulationSaving} onClick={confirmSmartSimulationAdd} className="h-11 rounded-full bg-accent text-sm font-black text-white">
                  {isSmartSimulationSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSmartSimulationSaving ? '记录中…' : '已经实际入缸，记录下来'}
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setIsSmartRecommendOpen(false)} className="ml-auto h-11 rounded-full px-6 text-sm font-black">
                关闭
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCalendarOpen} onOpenChange={(open) => {
        setIsCalendarOpen(open);
        if (open) {
          setSelectedWaterChangeDate(format(new Date(), 'yyyy-MM-dd'));
          setWaterChangeFeedback('');
        }
      }}>
        <DialogContent showCloseButton={false} className="flex h-[86dvh] max-h-[calc(100dvh-24px)] w-[92vw] max-w-[430px] md:max-w-[600px] flex-col overflow-hidden rounded-[20px] border-border bg-bg p-0">
          <DialogHeader className="shrink-0 border-b border-white px-4 pb-3 pt-4">
            <DialogTitle className="text-xl font-black text-ink">{isEn ? 'Water Change Log' : '换水记录'}</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ink/60">
              {isEn ? 'Log water change date to update next reminder.' : '记录换水日期，系统会据此更新下次提醒。'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-4 pb-6">
              <section className="rounded-[18px] bg-white p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[14px] bg-bg px-3 py-2">
                    <div className="text-[10px] font-black text-ink/42">{isEn ? 'Last Change' : '最近换水'}</div>
                    <div className="mt-1 text-[12px] font-black text-ink">{latestWaterChangeDate ? format(new Date(latestWaterChangeDate), 'yyyy/MM/dd') : '暂无记录'}</div>
                  </div>
                  <div className="rounded-[14px] bg-bg px-3 py-2">
                    <div className="text-[10px] font-black text-ink/42">{isEn ? 'Next Due' : '下次建议'}</div>
                    <div className="mt-1 text-[12px] font-black text-ink">{nextSuggestedWaterChangeDate}</div>
                  </div>
                  <div className="rounded-[14px] bg-bg px-3 py-2">
                    <div className="text-[10px] font-black text-ink/42">{isEn ? 'Cycle' : '周期'}</div>
                    <div className="mt-1 text-[12px] font-black text-ink">约 {shortestCycle} 天</div>
                  </div>
                  <div className={`rounded-[14px] px-3 py-2 ${waterChangedToday ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    <div className="text-[10px] font-black opacity-60">{isEn ? 'Today Status' : '今日状态'}</div>
                    <div className="mt-1 text-[12px] font-black">{waterChangedToday ? '今天已记录' : '今天未记录'}</div>
                  </div>
                </div>
                {waterChangeFeedback && (
                  <div className="mt-3 rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">
                    {waterChangeFeedback}
                  </div>
                )}
              </section>

              <section className="rounded-[18px] bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={isEn ? 'Previous month' : '上个月'} onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-sm font-black text-ink">{format(calendarMonth, isEn ? 'MMMM yyyy' : 'yyyy年 MM月')}</div>
                    <button type="button" onClick={() => setCalendarMonth(new Date())} className="mt-0.5 text-[10px] font-bold text-accent">
                      {isEn ? 'Today' : '回到今天'}
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={isEn ? 'Next month' : '下个月'} onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mb-3 rounded-[14px] bg-sky-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-sky-800">
                  {isEn ? 'Tap date to select, then log or cancel water change below.' : '点击日期先选中，再用底部按钮记录或取消该日换水。'}
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                  {(isEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['日', '一', '二', '三', '四', '五', '六']).map(d => (
                    <div key={d} className="text-[10px] font-bold text-ink/45">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getDay(startOfMonth(calendarMonth)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11" />
                  ))}
                  {eachDayOfInterval({ start: startOfMonth(calendarMonth), end: endOfMonth(calendarMonth) }).map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isChanged = waterChangeHistory.includes(dateStr);
                    const isToday = isSameDay(date, new Date());
                    const isSelected = selectedWaterChangeDate === dateStr;
                    const isFuture = date > new Date() && !isToday;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedWaterChangeDate(dateStr);
                          setWaterChangeFeedback('');
                        }}
                        className={`relative flex h-11 items-center justify-center rounded-full text-xs font-black transition-colors ${
                          isChanged ? 'bg-emerald-700 text-white' :
                          isSelected ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300' :
                          isToday ? 'border border-emerald-500 text-emerald-700' :
                          isFuture ? 'text-ink/25 hover:bg-bg' :
                          'text-ink hover:bg-bg'
                        }`}
                      >
                        {format(date, 'd')}
                        {isChanged && <Droplets className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-white bg-white/90 px-4 py-3">
            <Button variant="outline" className="min-h-11 rounded-full text-sm font-bold" onClick={() => setIsCalendarOpen(false)}>
              {selectedWaterDateHasRecord ? '关闭' : '取消'}
            </Button>
            <Button
              className={`min-h-11 rounded-full text-sm font-bold text-white ${selectedWaterDateHasRecord ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-800'}`}
              onClick={() => {
                const wasRecorded = selectedWaterDateHasRecord;
                handleToggleWaterChangeDate(selectedWaterChangeDate);
                setWaterChangeFeedback(wasRecorded
                  ? `已取消 ${format(new Date(selectedWaterChangeDate), 'yyyy/MM/dd')} 的换水记录。`
                  : `已记录换水，下次建议约 ${shortestCycle} 天后。`
                );
              }}
            >
              {selectedWaterDateHasRecord ? (isEn ? 'Remove Log' : '取消这天记录') : (isEn ? 'Log Water Change' : '记录这天换水')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tank Build Plan Modal */}
      <Dialog open={isBuildPlanOpen} onOpenChange={setIsBuildPlanOpen}>
        <AdaptiveTaskContent className="bg-bg md:max-w-[700px]">
          <DialogHeader className="shrink-0 border-b border-white px-4 pb-3 pt-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-ink">
              <Layers3 className="h-5 w-5 text-emerald-700" />
              鱼缸搭建方案
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ink/60">
              方案只作为规划参考；环境配置不会自动写入，推荐生物会先进入混养判断。
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-4 pb-6">
              <div className="grid grid-cols-5 gap-1.5">
                {['新手', '草缸', '虾缸', '低维护', '进阶'].map(filter => (
                  <span key={filter} className="rounded-full bg-white px-2 py-1 text-center text-[11px] font-black text-ink/55 shadow-sm">
                    {filter}
                  </span>
                ))}
              </div>

              <section className="grid gap-2 rounded-[18px] bg-white p-3 shadow-sm">
                <div>
                  <div className="text-[13px] font-black text-ink">{isEn ? 'Select a setup plan name first' : '先选择方案名称'}</div>
                  <p className="mt-0.5 text-[11px] font-medium text-ink/45">{isEn ? 'Once selected, details will display below.' : '选中方案后，下方会展示这个鱼缸的图片、尺寸、环境、造景和生物组合。'}</p>
                </div>
                <div className="grid gap-2">
                  {adaptedBuildPlans.map(plan => {
                    const template = plan.template;
                    const isSelected = selectedBuildTemplate.id === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedBuildTemplateId(template.id)}
                        className={`flex items-center justify-between gap-3 rounded-[14px] border px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                            : 'border-border/70 bg-bg/60 text-ink hover:border-emerald-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-black">{template.name}</div>
                          <div className="mt-0.5 truncate text-[10px] font-bold opacity-55">
                            当前 {plan.currentVolumeLiters}L / {plan.currentLengthCm || '未设长度'}cm · 要求 {template.minVolumeLiters}L+ / {template.minLengthCm}cm+
                          </div>
                          <div className="mt-1 line-clamp-1 text-[10px] font-bold opacity-70">
                            {plan.coreConfigSummary} · {plan.livestockSummary}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${plan.statusTone}`}>
                            {plan.statusLabel}
                          </span>
                          {isSelected && <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-black text-white">{isEn ? 'Selected' : '已选'}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
                <div className="relative aspect-[16/9] overflow-hidden" style={{ background: selectedBuildTemplate.visualGradient }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.72),transparent_28%),linear-gradient(to_top,rgba(0,0,0,0.36),transparent_64%)]" />
                  <div className="absolute inset-x-4 top-6 flex items-end justify-center gap-3">
                    {getTemplateVisualImages(selectedBuildTemplate).slice(0, 5).map((src, index) => (
                      <span key={`${src}-detail-${index}`} className="flex h-20 w-20 items-end justify-center rounded-full bg-white/16 backdrop-blur-[1px]">
                        <img src={src} alt="" className="max-h-20 max-w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.2)]" referrerPolicy="no-referrer" />
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {selectedBuildTemplate.benefitTags.map(tag => (
                        <span key={tag} className="rounded-full bg-white/84 px-2.5 py-1 text-[10px] font-black text-emerald-800 backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[19px] font-black leading-tight text-white drop-shadow-sm">{selectedBuildTemplate.name}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-white/82">{selectedBuildTemplate.tagline}</p>
                      </div>
                      <TagPill tone={selectedBuildTemplate.difficulty === '新手' ? 'normal' : 'warning'}>{selectedBuildTemplate.difficulty}</TagPill>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  {[
                    { label: '适配状态', value: selectedAdaptedBuildPlan.statusLabel },
                    { label: '当前鱼缸', value: `${selectedAdaptedBuildPlan.currentVolumeLiters}L · ${selectedAdaptedBuildPlan.currentLengthCm || '长度未设置'}cm` },
                    { label: '环境参数', value: getTemplateEnvironmentSummary(selectedBuildTemplate) },
                    { label: '适配生物', value: selectedAdaptedBuildPlan.livestockSummary },
                  ].map(item => (
                    <div key={item.label} className="rounded-[14px] bg-bg px-3 py-2">
                      <div className="text-[10px] font-black text-ink/42">{item.label}</div>
                      <div className="mt-1 text-[12px] font-black leading-snug text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                <div>
                  <h3 className="text-[14px] font-black text-ink">{isEn ? 'A. Active Tank Compatibility Results' : 'A. 当前鱼缸适配结果'}</h3>
                  <p className="mt-0.5 text-[11px] font-medium text-ink/50">{selectedAdaptedBuildPlan.summary}</p>
                </div>
                <div className={`grid gap-2 rounded-[16px] p-3 ${selectedAdaptedBuildPlan.status === 'unsuitable' ? 'bg-red-50' : selectedAdaptedBuildPlan.status === 'caution' ? 'bg-amber-50' : 'bg-emerald-50/70'}`}>
                  {[
                    { title: '最低要求', value: `${selectedBuildTemplate.minVolumeLiters}L+ · ${selectedBuildTemplate.minLengthCm}cm+` },
                    { title: '推荐水量', value: `${selectedBuildTemplate.recommendedVolumeLiters}L` },
                    { title: '自动修正', value: selectedAdaptedBuildPlan.autoFixes.join(' ') || '当前无需额外缩减。' },
                    { title: '应用前风险', value: selectedAdaptedBuildPlan.riskItems.join(' ') || '适配方案未发现高风险。' },
                  ].map(item => (
                    <div key={item.title} className="grid gap-0.5">
                      <div className="text-[10px] font-black text-emerald-800/55">{item.title}</div>
                      <div className="text-[12px] font-black leading-snug text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                <div>
                  <h3 className="text-[14px] font-black text-ink">{isEn ? 'B. Reference Plan Summary' : 'B. 规划参考摘要'}</h3>
                  <p className="mt-0.5 text-[11px] font-medium text-ink/50">{isEn ? 'Review the reference configuration. Nothing is written until you record the real setup.' : '这里展示参考配置；只有你实际记录后，环境或生物才会写入鱼缸。'}</p>
                </div>
                <div className="grid gap-2 rounded-[16px] bg-emerald-50/70 p-3">
                  {[
                    { title: '基础配置', value: selectedAdaptedBuildPlan.coreConfigSummary },
                    { title: '水体环境', value: getTemplateEnvironmentSummary(selectedBuildTemplate) },
                    { title: '造景结构', value: getTemplateLayoutSummary(selectedBuildTemplate) },
                    { title: '推荐生物', value: selectedAdaptedBuildPlan.livestockSummary },
                  ].map(item => (
                    <div key={item.title} className="grid gap-0.5">
                      <div className="text-[10px] font-black text-emerald-800/55">{item.title}</div>
                      <div className="text-[12px] font-black leading-snug text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-[18px] bg-white p-3 shadow-sm">
                <details data-disclosure-purpose="advanced_data">
                  <summary className="cursor-pointer list-none text-[14px] font-black text-ink">
                    C. 配置明细
                    <span className="ml-2 text-[11px] font-bold text-ink/45">{isEn ? 'Tap to expand' : '点击展开'}</span>
                  </summary>
                  <p className="mt-1 text-[11px] font-medium text-ink/50">{isEn ? 'Expand to view detailed substrate, plants, hardscape, equipment, and tips.' : '需要确认或微调时，再看具体底砂、水草、硬景、设备和维护提醒。'}</p>
                  <div className="mt-3 grid gap-3">
                {[
                  { title: '底砂', items: [selectedBuildTemplate.baseSubstrate] },
                  { title: '水草', items: selectedBuildTemplate.basePlants },
                  { title: '硬景', items: selectedBuildTemplate.baseHardscape },
                  { title: '设备', items: selectedBuildTemplate.baseEquipment },
                  { title: '生物推荐', items: selectedAdaptedBuildPlan.appliedSpecies.length > 0 ? selectedAdaptedBuildPlan.appliedSpecies.map(item => `${item.name} ${item.quantity}`) : ['当前适配方案暂不新增生物'] },
                  { title: '维护提醒', items: selectedBuildTemplate.maintenance },
                ].map(section => (
                    <div key={section.title} className="grid gap-1.5">
                      <div className="text-[12px] font-black text-ink">{section.title}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.map(item => (
                          <span key={`${section.title}-${item}`} className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-ink/64">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                </details>
                <div className="rounded-[14px] border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-900">
                  <span className="font-black">{isEn ? 'Key Notes:' : '主要提醒：'}</span>{selectedBuildTemplate.caution}
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-white bg-white/90 px-4 py-3">
            <Button variant="outline" onClick={() => setIsBuildPlanOpen(false)} className="h-10 rounded-full text-sm font-bold">{isEn ? 'Close' : '暂不评估'}</Button>
            <Button
              onClick={() => handleApplyBuildTemplate(selectedAdaptedBuildPlan)}
              disabled={!selectedAdaptedBuildPlan.canApply}
              className={`h-10 rounded-full text-sm font-bold text-white ${
                selectedAdaptedBuildPlan.status === 'unsuitable'
                  ? 'bg-ink/30'
                  : selectedAdaptedBuildPlan.status === 'caution'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {selectedAdaptedBuildPlan.ctaLabel}
            </Button>
          </DialogFooter>
        </AdaptiveTaskContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <AdaptiveTaskContent className="bg-bg">
          <DialogHeader className="shrink-0 border-b border-white px-4 pb-3 pt-4">
            <DialogTitle className="text-xl font-black text-ink">{isEn ? 'Tank Settings' : '鱼缸设置'}</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ink/60">
              调整尺寸、水质、设备与环境配置
            </DialogDescription>
            <div className="mt-3 grid grid-cols-2 gap-1.5 min-[390px]:grid-cols-4">
              {[
                settingsForm.waterType === 'Saltwater' ? '海水' : settingsForm.waterType === 'Freshwater' ? '淡水' : '水体未记录',
                settingsForm.targetTemperature ? `目标 ${settingsForm.targetTemperature}°C` : '目标温度未记录',
                settingsEstimatedWaterLiters > 0 ? `约 ${settingsEstimatedWaterLiters}L` : '水量未设置',
                `已配置 ${configuredSettingCount} 项`,
              ].map(item => (
                <span key={item} className="rounded-full bg-white px-2.5 py-1 text-center text-[11px] font-black text-ink/58 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </DialogHeader>
          <div ref={settingsBodyRef} className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            <div className="grid gap-5 p-4 pb-7">
              <section className="grid gap-2">
                {settingItems.map(item => {
                  const isActive = activeSettingsPanel === item.id;
                  return (
                    <div key={item.id} ref={node => { settingPanelRefs.current[item.id] = node; }} className="grid scroll-mt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => openSettingsPanel(item.id)}
                        className={`flex items-center justify-between gap-3 rounded-[16px] border bg-white px-3 py-3 text-left shadow-sm transition-colors ${
                          isActive ? 'border-accent/40 ring-2 ring-accent-light' : 'border-white hover:border-accent/25'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-[15px] font-black text-ink">{item.title}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                              item.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {item.configured ? '已配置' : '待配置'}
                            </span>
                          </span>
                          <span className="mt-1 block truncate text-[11px] font-medium text-ink/48">{item.summary}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-[11px] font-black text-accent">
                          修改
                          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                        </span>
                      </button>
                      {isActive && (
                        <div className="pl-2">
                          {renderSettingsPanel(item.id)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {false && activeSettingsPanel === 'size' && (
              <ConfigSection title={t('aquarium.dimensions')} subtitle={t('aquarium.dimensionsDesc')}>
                <div className="grid grid-cols-3 gap-2">
                  {dimensionFields.map(item => (
                    <div key={item.key} className="grid gap-1.5">
                      <Label className="text-[11px] font-bold text-ink/55">{t(`aquarium.${item.key}`)} (cm)</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={(settingsForm.dimensions as any)?.[item.key] || ''}
                        onChange={e => setSettingsForm({
                          ...settingsForm,
                          dimensions: {
                            length: settingsForm.dimensions?.length || '',
                            width: settingsForm.dimensions?.width || '',
                            height: settingsForm.dimensions?.height || '',
                            [item.key]: e.target.value,
                          }
                        })}
                        className="h-10 rounded-[12px] bg-bg text-sm font-bold md:w-[220px]"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] bg-emerald-50/70 p-3 md:flex md:flex-wrap md:gap-2">
                  <div>
                    <div className="text-[10px] font-black text-ink/45">{t('aquarium.grossVolume')}</div>
                    <div className="mt-1 text-2xl font-black text-ink">{settingsGrossVolumeLiters > 0 ? `${settingsGrossVolumeLiters}L` : '--'}</div>
                    <div className="text-[10px] font-medium text-ink/42">{t('aquarium.grossVolumeFormula')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-ink/45">{t('aquarium.estimatedWater')}</div>
                    <div className="mt-1 text-2xl font-black text-emerald-700">{settingsEstimatedWaterLiters > 0 ? `${settingsEstimatedWaterLiters}L` : '--'}</div>
                    <div className="text-[10px] font-medium text-ink/42">{t('aquarium.estimatedWaterFormula')}</div>
                  </div>
                </div>
              </ConfigSection>
              )}

              {false && activeSettingsPanel === 'parameters' && (
              <ConfigSection title={t('aquarium.parameters')} subtitle={t('aquarium.parametersDesc')}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Freshwater', label: t('aquarium.freshwater'), description: t('aquarium.freshwaterDescription') },
                    { value: 'Saltwater', label: t('aquarium.saltwater'), description: t('aquarium.saltwaterDescription') },
                    { value: 'Brackish', label: t('aquarium.brackish'), description: t('aquarium.brackishDescription'), disabled: true },
                  ].map(option => (
                    <SelectableOptionCard
                      key={option.value}
                      label={option.label}
                      description={option.description}
                      selected={settingsForm.waterType === option.value}
                      disabled={option.disabled}
                      onClick={() => updateSettingsWaterType(option.value as NonNullable<Aquarium['waterType']>)}
                    />
                  ))}
                </div>
                <div className="mt-3 grid gap-1.5">
                  <Label className="text-[11px] font-bold text-ink/55">{t('aquarium.targetTemp')}</Label>
                  <Input
                    type="number"
                    value={settingsForm.targetTemperature || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, targetTemperature: e.target.value })}
                    className="h-10 rounded-[12px] bg-bg text-sm font-bold md:w-[220px]"
                  />
                </div>
              </ConfigSection>
              )}

              {false && (activeSettingsPanel === 'substrate' || activeSettingsPanel === 'plants') && (
              <section className="overflow-hidden rounded-[22px] border border-white bg-white shadow-sm">
                <div className="border-b border-bg px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-black leading-tight text-ink">{activeSettingsPanel === 'substrate' ? t('aquarium.substrateHardscape') : t('aquarium.plants')}</h3>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink/48">{activeSettingsPanel === 'substrate' ? t('aquarium.substrateDesc') : t('aquarium.plantsDesc')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSettingsPanel === 'substrate') {
                          setIsScapeListExpanded(prev => !prev);
                        } else {
                          setIsPlantListExpanded(prev => !prev);
                        }
                      }}
                      className="shrink-0 rounded-full bg-bg px-3 py-1 text-[11px] font-bold text-accent hover:bg-accent-light"
                    >
                      {(activeSettingsPanel === 'substrate' ? isScapeListExpanded : isPlantListExpanded) ? t('aquarium.collapse') : t('aquarium.viewAll')}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[14px] bg-bg px-3 py-2">
                      <div className="text-[10px] font-black text-ink/38">{t('aquarium.selectedSubstrate')}</div>
                      <div className="mt-1 truncate text-[12px] font-black text-ink">{currentSubstrate}{selectedHardscapeNames.length > 0 ? ` / ${selectedHardscapeNames.join(i18n.language === 'zh-CN' ? '、' : ', ')}` : ''}</div>
                    </div>
                    <div className="rounded-[14px] bg-bg px-3 py-2">
                      <div className="text-[10px] font-black text-ink/38">{t('aquarium.selectedPlants')}</div>
                      <div className="mt-1 truncate text-[12px] font-black text-ink">{selectedPlantNames.length > 0 ? selectedPlantNames.join(i18n.language === 'zh-CN' ? '、' : ', ') : t('aquarium.none')}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4">
                  {activeSettingsPanel === 'substrate' && (
                  <div className="grid gap-2 rounded-[18px] bg-bg/55 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-black text-ink">{t('aquarium.substrateHardscape')}</div>
                        <div className="mt-0.5 text-[10px] font-medium text-ink/42">{t('aquarium.commonOptions')}</div>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-ink/42">{t('aquarium.selectedWithCount', { count: selectedScapeCount })}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {visibleScapeOptions.map(option => {
                        const currentHardscape = settingsForm.hardscape || [];
                        const isSelected = option.type === 'substrate'
                          ? option.value === currentSubstrate
                          : currentHardscape.includes(option.value);
                        return (
                          <SelectableOptionCard
                            key={option.id}
                            label={option.label}
                            description={option.type === 'substrate' ? (isEn ? `Substrate · ${option.hint}` : `底砂 · ${option.hint}`) : (isEn ? `Hardscape · ${option.hint}` : `硬景 · ${option.hint}`)}
                            selected={isSelected}
                            mode={option.type === 'substrate' ? 'single' : 'multi'}
                            visual={option.type === 'hardscape' ? (
                              <ResilientImage src={getSpeciesDisplayImage(option)} alt={option.label} className="h-full w-full object-contain p-0.5" />
                            ) : (
                              <span className={`h-6 w-6 rounded-full border ${
                                option.value === '无' ? 'border-dashed border-ink/30 bg-white' :
                                option.value === '水草泥' || option.value === '黑金沙' ? 'border-stone-700 bg-stone-800' :
                                option.value === '溪流砂' || option.value === '碎石' || option.value === '鹅卵石' ? 'border-stone-400 bg-stone-300' :
                                option.value === '珊瑚砂' || option.value === '化妆砂' ? 'border-amber-100 bg-amber-50' :
                                option.value === '陶粒' ? 'border-orange-600 bg-orange-500' :
                                'border-amber-300 bg-amber-200'
                              }`} />
                            )}
                            onClick={() => {
                              if (option.type === 'substrate') {
                                setSettingsForm({ ...settingsForm, substrate: option.value });
                                return;
                              }
                              setSettingsForm({
                                ...settingsForm,
                                hardscape: isSelected
                                  ? currentHardscape.filter(value => value !== option.value)
                                  : [...currentHardscape, option.value]
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                    {!isScapeListExpanded && hiddenScapeCount > 0 && (
                      <button type="button" onClick={() => setIsScapeListExpanded(true)} className="justify-self-start text-[11px] font-bold text-accent">
                        {isEn ? `View all ${hiddenScapeCount + visibleScapeOptions.length} substrates / hardscapes` : `查看全部 ${hiddenScapeCount + visibleScapeOptions.length} 个底砂/硬景`}
                      </button>
                    )}
                  </div>
                  )}

                  {activeSettingsPanel === 'plants' && (
                  <div className="grid gap-2 rounded-[18px] bg-bg/55 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-black text-ink">{isEn ? 'Plant Species' : '水草种类'}</div>
                        <div className="mt-0.5 text-[10px] font-medium text-ink/42">{isEn ? 'Selected & Common Plants' : '已选和常用水草'}</div>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-ink/42">{isEn ? `Selected ${selectedPlantCount}` : `已选 ${selectedPlantCount}`}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {visiblePlantOptions.map(plant => {
                        const current = settingsForm.plants || [];
                        const isSelected = current.includes(plant.id) || current.includes(plant.name);
                        return (
                          <SelectableOptionCard
                            key={plant.id}
                            label={plant.name}
                            description={plant.scientificName}
                            selected={isSelected}
                            mode="multi"
                            visual={<ResilientImage src={getSpeciesDisplayImage(plant)} alt={plant.name} className="h-full w-full object-contain p-0.5" />}
                            onClick={() => {
                              setSettingsForm({
                                ...settingsForm,
                                plants: isSelected
                                  ? current.filter(p => p !== plant.id && p !== plant.name)
                                  : [...current, plant.id]
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                    {!isPlantListExpanded && hiddenPlantCount > 0 && (
                      <button type="button" onClick={() => setIsPlantListExpanded(true)} className="justify-self-start text-[11px] font-bold text-accent">
                        {isEn ? `View all ${hiddenPlantCount + visiblePlantOptions.length} plant species` : `查看全部 ${hiddenPlantCount + visiblePlantOptions.length} 种水草`}
                      </button>
                    )}
                  </div>
                  )}
                </div>
              </section>
              )}

              {false && (activeSettingsPanel === 'lighting' || activeSettingsPanel === 'equipment') && (
              <section className="overflow-hidden rounded-[22px] border border-white bg-white shadow-sm">
                <div className="border-b border-bg px-4 py-3">
                  <h3 className="text-[16px] font-black leading-tight text-ink">{activeSettingsPanel === 'lighting' ? t('aquarium.lighting') : t('aquarium.equipment')}</h3>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink/48">{activeSettingsPanel === 'lighting' ? t('aquarium.lightingDesc') : t('aquarium.equipmentDesc')}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      t(`aquarium.${filterOptionKeys[settingsForm.equipment?.filter || '瀑布过滤'] || 'filterCascade'}`),
                      t(`aquarium.${lightOptionKeys[settingsForm.equipment?.light || '普通灯'] || 'lightNormal'}`),
                      settingsForm.equipment?.heater ? t('aquarium.heater') : t('aquarium.noHeater'),
                      settingsForm.equipment?.oxygen ? t('aquarium.oxygen') : t('aquarium.noOxygen'),
                    ].map(item => (
                      <span key={item} className="rounded-full bg-bg px-2.5 py-1 text-[10px] font-bold text-ink/52">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4">
                  {activeSettingsPanel === 'equipment' && (
                  <div className="grid gap-2 rounded-[18px] bg-bg/55 p-3">
                    <div>
                      <div className="text-[13px] font-black text-ink">{t('aquarium.filterSystem')}</div>
                      <div className="mt-0.5 text-[10px] font-medium text-ink/42">{t('aquarium.filterSystemDesc')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['无', '瀑布过滤', '桶滤', '上滤', '海绵过滤'].map(option => (
                        <SelectableOptionCard
                          key={option}
                          label={t(`aquarium.${filterOptionKeys[option] || 'none'}`)}
                          selected={(settingsForm.equipment?.filter || '瀑布过滤') === option}
                          onClick={() => setSettingsForm({
                            ...settingsForm,
                            equipment: { ...(settingsForm.equipment || {}), filter: option as any }
                          })}
                        />
                      ))}
                    </div>
                  </div>
                  )}
                  {activeSettingsPanel === 'lighting' && (
                  <div className="grid gap-2 rounded-[18px] bg-bg/55 p-3">
                    <div>
                      <div className="text-[13px] font-black text-ink">{t('aquarium.lighting')}</div>
                      <div className="mt-0.5 text-[10px] font-medium text-ink/42">{t('aquarium.lightingSystemDesc')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['无', '普通灯', '水草灯', '海水灯'].map(option => (
                        <SelectableOptionCard
                          key={option}
                          label={t(`aquarium.${lightOptionKeys[option] || 'none'}`)}
                          selected={(settingsForm.equipment?.light || '普通灯') === option}
                          onClick={() => setSettingsForm({
                            ...settingsForm,
                            equipment: { ...(settingsForm.equipment || {}), light: option as any }
                          })}
                        />
                      ))}
                    </div>
                  </div>
                  )}
                  {activeSettingsPanel === 'equipment' && (
                  <div className="grid gap-2 rounded-[18px] bg-bg/55 p-3">
                    <div>
                      <div className="text-[13px] font-black text-ink">{t('aquarium.helperDevices')}</div>
                      <div className="mt-0.5 text-[10px] font-medium text-ink/42">{t('aquarium.helperDevicesDesc')}</div>
                    </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'heater', label: t('aquarium.heater'), description: t('aquarium.heaterDesc') },
                      { key: 'oxygen', label: t('aquarium.oxygen'), description: t('aquarium.oxygenDesc') },
                    ].map(device => {
                      const isSelected = Boolean((settingsForm.equipment as any)?.[device.key]);
                      return (
                        <SelectableOptionCard
                          key={device.key}
                          label={device.label}
                          description={device.description}
                          selected={isSelected}
                          mode="multi"
                          onClick={() => setSettingsForm({
                            ...settingsForm,
                            equipment: {
                              ...(settingsForm.equipment || {}),
                              [device.key]: !isSelected
                            }
                          })}
                        />
                      );
                    })}
                  </div>
                  </div>
                  )}
                </div>
              </section>
              )}

              {false && activeSettingsPanel && (
              <ConfigSummaryCard
                items={[
                  { label: '水体', value: settingsForm.waterType === 'Saltwater' ? '海水' : settingsForm.waterType === 'Freshwater' ? '淡水' : '未记录' },
                  { label: '目标温度', value: settingsForm.targetTemperature ? `${settingsForm.targetTemperature}°C` : '未记录' },
                  { label: '水量', value: settingsEstimatedWaterLiters > 0 ? `约 ${settingsEstimatedWaterLiters}L` : '未设置' },
                  { label: '底砂', value: currentSubstrate },
                  { label: '过滤', value: settingsForm.equipment?.filter || '瀑布过滤' },
                  { label: '灯光', value: settingsForm.equipment?.light || '普通灯' },
                ]}
                note={`${(settingsForm.plants || []).length} 种水草，${(settingsForm.hardscape || []).length} 个硬景配置会一起保存。`}
              />
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-white bg-white/95 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:px-6">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="h-10 min-w-[112px] rounded-full text-sm font-bold">{isEn ? "Cancel" : "取消"}</Button>
            <Button onClick={() => {
              const updated = aquariums.map(a => a.id === activeId ? { ...a, ...settingsForm } : a);
              saveAquariums(updated);
              void persistCareTimelineEvent({
                aquariumId: activeAquarium.id,
                eventType: 'settings_updated',
                title: isEn ? 'Updated aquarium settings' : '更新鱼缸设置',
                label: isEn ? 'Environment and equipment settings saved' : '已保存环境与设备配置',
                payload: {},
                occurredAt: new Date().toISOString(),
                sourceType: 'aquarium_settings',
                sourceId: `${activeAquarium.id}:${Date.now()}`,
                isInferred: false,
              }).catch(error => showToast(error instanceof Error ? error.message : '设置时间线没有保存成功。', 'error'));
              markAquariumConfigured();
              setIsSettingsOpen(false);
            }} className="h-10 min-w-[128px] rounded-full bg-accent text-sm font-bold text-white hover:bg-accent/90">{isEn ? 'Save Settings' : '保存设置'}</Button>
          </DialogFooter>
        </AdaptiveTaskContent>
      </Dialog>

      {/* Guide Modal */}
      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DialogContent className="w-[90vw] max-w-[500px] rounded-sm border-border p-5">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl text-ink font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              换水与囤水提示
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="relative h-28 overflow-hidden rounded-sm border border-accent/15 bg-gradient-to-b from-sky-50 to-emerald-50">
              <div className="absolute left-5 top-5 h-12 w-10 animate-bounce rounded-b-lg rounded-t-sm border-2 border-accent/35 bg-white/70">
                <div className="absolute -right-4 top-4 h-2 w-8 rotate-[-18deg] rounded-full bg-accent/30" />
              </div>
              <div className="absolute left-20 top-7 h-12 w-24 rounded-sm border-2 border-accent/25 bg-white/60">
                <div className="absolute inset-x-1 bottom-1 h-5 animate-pulse rounded-sm bg-sky-200/70" />
                <div className="absolute left-4 top-5 h-2 w-2 animate-ping rounded-full bg-accent/40" />
                <div className="absolute right-5 top-4 h-2 w-2 animate-ping rounded-full bg-accent/30 [animation-delay:500ms]" />
              </div>
              <div className="absolute right-5 top-5 h-14 w-8 rounded-full border-2 border-ink/15 bg-white/70">
                <div className="absolute bottom-2 left-1/2 h-7 w-2 -translate-x-1/2 animate-pulse rounded-full bg-red-400/70" />
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-[10px] font-bold text-ink/50">
                囤水 → 除氯 → 对温 → 少量换水
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-sm border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-blue-600" /> 囤水小贴士</h4>
              <p className="text-xs text-blue-900/80 leading-relaxed font-medium">{isEn ? 'Age water 24 hours prior to remove chlorine and match tank temp.' : '换水前建议提前 24 小时囤水，除氯并调到接近缸内水温后再换。冬季或温差较大时，优先保证新水温度稳定。'}</p>
            </div>
            <div className="bg-bg p-3 rounded-sm border border-border">
              <h4 className="text-sm font-bold text-ink mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-accent" /> 新鱼入缸换水方法</h4>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">{isEn ? 'Acclimate new fish carefully. Do not feed or change water for 3 days.' : '新鱼入缸前需严格过温过水。建议入缸后前三天不喂食、不换水，保持水质稳定，减少应激。第四天可进行第一次少量换水（约10%）。'}</p>
            </div>
            <div className="bg-bg p-3 rounded-sm border border-border">
              <h4 className="text-sm font-bold text-ink mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-accent" /> 周期换水方法</h4>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">{isEn ? 'Change 20%-30% water weekly or bi-weekly. Never change 100% at once.' : '根据过滤系统能力和生物密度，建议每周或每两周换水 20%-30%。切忌一次性全缸换水，以免破坏硝化系统。'}</p>
            </div>
            <div className="bg-bg p-3 rounded-sm border border-border">
              <h4 className="text-sm font-bold text-ink mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-accent" /> 温度控制</h4>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">{isEn ? 'Match new water temp within 1-2°C. Pre-heat in winter.' : '换水时，新水温度应与缸内水温尽量保持一致，温差不应超过 1-2°C。冬季换水建议提前加热新水。'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified species detail for aquarium and wishlist entries */}
      <SpeciesDetailDialog
        fish={selectedAqFish?.fish || selectedWishlistFish}
        open={!!selectedAqFish || !!selectedWishlistFish}
        source="aquarium"
        aquariumContext={activeAquarium}
        imageSrc={selectedAqFish ? getSpeciesDisplayImage(selectedAqFish.fish) : selectedWishlistFish ? getSpeciesDisplayImage(selectedWishlistFish) : ''}
        owned={Boolean(selectedAqFish)}
        inCalculator={(selectedAqFish || selectedWishlistFish) ? selectedAddFishItems.some(item => item.fishId === (selectedAqFish?.fish.id || selectedWishlistFish?.id)) : false}
        inWishlist={(selectedAqFish || selectedWishlistFish) ? wishlistFishIds.has(selectedAqFish?.fish.id || selectedWishlistFish?.id || '') : false}
        detailFeedback={tankActionMessage}
        onOpenChange={(open) => {
          if (!open) closeAquariumSpeciesDetail();
        }}
        onSelectSpecies={(nextFish) => {
          const ownedRecord = activeAquarium.fishes.find(record => record.fishId === nextFish.id);
          if (ownedRecord) {
            setSelectedAqFish({ fish: nextFish, aqFish: ownedRecord });
            setSelectedWishlistFish(null);
          } else {
            setSelectedAqFish(null);
            setSelectedWishlistFish(nextFish);
          }
        }}
        onAddToCalculator={(fish) => {
          const nextCompatibilitySelection = new Set(getCompatibilitySelection());
          nextCompatibilitySelection.add(fish.id);
          setCompatibilitySelection(nextCompatibilitySelection);
          setSelectedAddFishItems(prev => (
            prev.some(item => item.fishId === fish.id)
              ? prev.filter(item => item.fishId !== fish.id)
              : [...prev, { fishId: fish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd') }]
          ));
          setTankActionMessage(selectedAddFishItems.some(item => item.fishId === fish.id) ? `已撤回 ${fish.name} 的混养计算选择。` : `已选择 ${fish.name} 参与混养计算。`);
        }}
        onToggleWishlist={(fishId) => toggleWishlist(fishId)}
        onGoCalculator={() => {
          closeAquariumSpeciesDetail(false);
          navigateToRoute(taskRoutes.encyclopedia.compatibility);
        }}
        onOpenTankSettings={(panel) => {
          closeAquariumSpeciesDetail(false);
          openAquariumSettings(panel);
        }}
        onRecordDeath={selectedAqFish ? (fish, input) => {
          if (!selectedAqFish) return;
          const batchId = input.batchId || selectedAqFish.aqFish.batches?.[0]?.id || `${selectedAqFish.aqFish.id}_legacy`;
          return getCurrentAquaGuideRepository().then(repository => repository.saveLivestockMemorial({
            speciesCatalogKey: fish.id,
            date: input.date,
            causeCodes: input.causeCodes,
            reason: input.reason,
            batchId,
            aquariumId: activeAquarium.id,
            aquariumFishId: selectedAqFish.aqFish.id,
            operationId: input.operationId,
          })).then(result => {
            setAquariums(current => current.map(item => item.id === result.aquarium.id ? result.aquarium : item));
            setDeceasedRecords(current => [...current, result.record]);
            if (!result.aquarium.fishes.some(item => item.id === selectedAqFish.aqFish.id)) {
              closeAquariumSpeciesDetail();
            }
          });
        } : undefined}
      />

      {/* Legacy fish detail modal is intentionally disabled; aquarium entries now use SpeciesDetailDialog. */}
      <Dialog open={false} onOpenChange={(open) => !open && setSelectedAqFish(null)}>
        <DialogContent className="w-[90vw] max-w-[600px] p-0 overflow-hidden border-border rounded-sm">
          {selectedAqFish && (
            <ScrollArea className="max-h-[85vh]">
              <div className="h-[180px] md:h-[240px] bg-bg relative border-b border-border">
                <img 
                  src={getSpeciesDisplayImage(selectedAqFish.fish)} 
                  alt={selectedAqFish.fish.name} 
                  className="object-contain w-full h-full p-4 opacity-95"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 md:p-8 flex flex-col gap-5 bg-white">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <DialogTitle className="font-serif text-2xl md:text-3xl italic text-ink font-bold">{selectedAqFish.fish.name}</DialogTitle>
                      <DialogDescription className="text-xs text-ink/70 mt-1 font-medium">{selectedAqFish.fish.scientificName}</DialogDescription>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 bg-accent-light text-accent rounded-sm whitespace-nowrap border border-accent/20">
                      {getDifficultyLabel(selectedAqFish.fish.difficulty)}
                    </span>
                  </div>
                </div>

                <p className="text-sm md:text-[14px] leading-relaxed text-ink font-medium">
                  {selectedAqFish.fish.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-[12px] border-t border-b border-border py-4 bg-bg/50 px-3 rounded-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'Water Temp' : '水温'}</span>
                    <span className="text-ink font-bold">{selectedAqFish.fish.waterTemperature}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'pH Level' : '酸碱度 (pH)'}</span>
                    <span className="text-ink font-bold">{selectedAqFish.fish.phLevel}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'Water Change Cycle' : '换水周期'}</span>
                    <span className="text-ink font-bold">约 {selectedAqFish.fish.waterChangeCycle} 天</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'Tank Size' : '鱼缸尺寸'}</span>
                    <span className="text-ink font-bold">{selectedAqFish.fish.tankSize}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'Temperament' : '性情'}</span>
                    <span className="text-ink font-bold">{selectedAqFish.fish.temperament === 'Peaceful' ? (isEn ? 'Peaceful' : '温和') : selectedAqFish.fish.temperament === 'Aggressive' ? (isEn ? 'Aggressive' : '凶猛') : (isEn ? 'Territorial' : '领地意识强')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink/60 uppercase tracking-wider text-[10px] font-bold">{isEn ? 'Size' : '体型'}</span>
                    <span className="text-ink font-bold">{selectedAqFish.fish.size === 'Small' ? (isEn ? 'Small' : '小型') : selectedAqFish.fish.size === 'Medium' ? (isEn ? 'Medium' : '中型') : (isEn ? 'Large' : '大型')}</span>
                  </div>
                </div>

                <div className="border border-amber-200 bg-amber-50/60 p-4 rounded-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-[11px] uppercase tracking-[1px] text-amber-800 font-bold">{isEn ? 'Diet & Feeding' : '饮食习惯'}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-amber-800 border border-amber-200">
                      {selectedAqFish.fish.feedingProfile?.feedingType || '杂食性'}
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm md:text-[14px] text-ink">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-ink/55 font-bold mb-1">{isEn ? 'Recommended Foods' : '推荐食物'}</div>
                      <p className="font-medium leading-relaxed">{selectedAqFish.fish.feedingProfile?.recommendedFoods || selectedAqFish.fish.diet}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink/55 font-bold mb-1">{isEn ? 'Frequency' : '喂食频率'}</div>
                        <p className="font-medium leading-relaxed">{selectedAqFish.fish.feedingProfile?.feedingFrequency || '每天1-2次'}</p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink/55 font-bold mb-1">{isEn ? 'Portion Rule' : '投喂量'}</div>
                        <p className="font-medium leading-relaxed">{selectedAqFish.fish.feedingProfile?.portionRule || '2-3分钟内吃完，残饵及时清理'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-ink/55 font-bold mb-1">{isEn ? 'Avoid Foods' : '禁忌'}</div>
                      <p className="font-medium leading-relaxed">{selectedAqFish.fish.feedingProfile?.avoidFoods || '过量投喂；变质饲料；长期残饵'}</p>
                    </div>
                    {selectedAqFish.fish.feedingProfile?.specialNotes && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink/55 font-bold mb-1">{isEn ? 'Special Notes' : '特殊提醒'}</div>
                        <p className="font-medium leading-relaxed">{selectedAqFish.fish.feedingProfile.specialNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-accent-light/30 border border-accent/20 p-4 rounded-sm flex flex-col gap-3">
                  <h4 className="text-[11px] uppercase tracking-[1px] text-ink/60 font-bold">{isEn ? 'Stocking Management' : '入缸管理'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] text-ink/60 font-bold mb-1 block">{isEn ? 'Entry Date' : '入缸日期'}</Label>
                      <Input 
                        type="date" 
                        className="h-9 text-sm bg-white" 
                        value={format(new Date(selectedAqFish.aqFish.entryDate), 'yyyy-MM-dd')} 
                        onChange={(e) => handleUpdateEntryDate(selectedAqFish.aqFish.id, e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-ink/60 font-bold mb-1 block">{isEn ? 'Quantity (pcs)' : '数量 (条/只)'}</Label>
                      <Input 
                        type="number" 
                        min="1"
                        className="h-9 text-sm bg-white" 
                        value={selectedAqFish.aqFish.quantity || 1} 
                        onChange={(e) => handleUpdateQuantity(selectedAqFish.aqFish.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-ink bg-white/50 p-2 rounded-sm mt-1">
                    <span>{isEn ? 'Days in tank:' : '已入缸时间:'}</span>
                    <span className="font-serif text-lg">{differenceInDays(new Date(), new Date(selectedAqFish.aqFish.entryDate))} 天</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-[#D32F2F] hover:bg-[#FFF4F4] hover:text-[#D32F2F] text-xs font-bold border border-[#FFD6D6]"
                      onClick={() => {
                        setSelectedAqFish(null);
                        setIsTankArchiveExpanded(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> {isEn ? 'Remove from Tank' : '移出鱼缸'}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full rounded-sm bg-ink hover:bg-ink/90 text-white mt-2 font-bold h-12"
                  onClick={() => setSelectedAqFish(null)}
                >
                  关闭
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <LivestockRosterDialog
        open={isTankArchiveExpanded}
        aquariumName={activeAquarium.name}
        records={activeAquarium.fishes}
        species={fishData}
        onOpenChange={(open) => {
          setIsTankArchiveExpanded(open);
          if (!open) window.setTimeout(() => document.querySelector<HTMLElement>('[data-interactive-livestock]')?.focus(), 0);
        }}
        onOpenDetail={(fish, record) => {
          setIsTankArchiveExpanded(false);
          openAquariumSpeciesDetail(fish, record, 'aquarium-records');
        }}
        onSave={saveLivestockBatches}
        onRemove={removeLivestockQuantity}
        onAdd={() => {
          setIsTankArchiveExpanded(false);
          openSpeciesAddition('record_existing');
        }}
        startedAt={activeAquarium.startedAt}
        startedAtConfirmed={Boolean(activeAquarium.startedAtConfirmedAt)}
        aquariumAgeDays={aquariumAgeDays}
        isSavingStartedAt={isSavingStartedAt}
        onConfirmStartedAt={confirmAquariumStartedAt}
        onDownloadArchive={() => openExportArtifact(buildAquariumArchiveArtifact(artifactContext))}
        onDownloadMilestone={aquariumAgeDays >= 100 && activeAquarium.startedAtConfirmedAt
          ? () => openExportArtifact(buildHundredDayArtifact(artifactContext, aquariumAgeDays))
          : undefined}
        onCreateShare={() => void createPrivateShare()}
        isCreatingShare={isCreatingShare}
      />

      <ExportArtifactDialog
        open={Boolean(exportArtifact)}
        onOpenChange={open => { if (!open) setExportArtifact(null); }}
        content={exportArtifact}
        isEn={isEn}
      />

      <Dialog open={Boolean(shareUrl)} onOpenChange={open => { if (!open) setShareUrl(''); }}>
        <DialogContent className="w-[min(92vw,520px)] max-w-[520px] rounded-[26px]">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Privacy-safe report created' : '脱敏报告链接已生成'}</DialogTitle>
            <DialogDescription>{isEn ? 'The link expires after 7 days and can be revoked in Settings. It does not include the custom aquarium name, identity, free text or internal record IDs.' : '链接 7 天后自动失效，可在设置中提前撤销。报告不会显示鱼缸名称、用户身份、自由描述或内部记录 ID。'}</DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-xs font-black text-ink/65">
            {isEn ? 'Share link' : '分享链接'}
            <input readOnly value={shareUrl} className="h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm font-semibold text-ink" onFocus={event => event.currentTarget.select()} />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareUrl('')} className="min-h-11 rounded-xl">{isEn ? 'Done' : '完成'}</Button>
            <Button onClick={() => void navigator.clipboard.writeText(shareUrl).then(() => showToast(isEn ? 'Link copied.' : '链接已复制。')).catch(() => showToast(isEn ? 'Copy failed. Copy the link manually.' : '复制失败，请手动复制。', 'error'))} className="min-h-11 rounded-xl">{isEn ? 'Copy link' : '复制链接'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
        <DialogContent className="flex max-h-[88dvh] w-[min(94vw,820px)] max-w-[820px] flex-col overflow-hidden rounded-[28px] border-amber-100 bg-[#FBFAF6] p-0">
          <DialogHeader className="shrink-0 border-b border-border bg-white px-5 pb-4 pt-5 text-left">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-xl font-black">{isEn ? "Aquarium Risk Resolution" : "鱼缸风险处理"}</DialogTitle>
            </div>
            <DialogDescription>{isEn ? "Review highest priority risk & steps, then switch to others if needed." : "先看最重要的风险和具体处理步骤，需要时再切换其他风险。"}</DialogDescription>
          </DialogHeader>
          {activeTankRisk ? (
            <div className="app-scrollbar-hidden min-h-0 overflow-y-auto px-4 py-4 md:px-5">
              {tankRiskItems.length > 1 && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                  {tankRiskItems.map((item, index) => (
                    <button
                      key={`${item.group}-${item.title}`}
                      type="button"
                      onClick={() => setActiveTankRiskIndex(index)}
                      aria-pressed={activeTankRiskIndex === index}
                      className={`min-h-10 shrink-0 rounded-full px-3 text-xs font-black ${activeTankRiskIndex === index ? 'bg-ink text-white' : 'border border-border bg-white text-ink/60'}`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="text-[10px] font-black text-rose-600">{activeTankRisk.group}</div>
                  <h3 className="mt-1 text-lg font-black text-ink">{activeTankRisk.title}</h3>
                  <div className="mt-4 flex min-h-[150px] items-center justify-center gap-2 rounded-[18px] bg-emerald-50/70 p-3">
                    {activeTankRisk.subjects.slice(0, 3).map((subject, index) => {
                      const fish = fishData.find(item => item.id === subject.id);
                      if (!fish) return null;
                      return (
                        <div key={subject.id} className={index === 0 ? 'w-28' : 'w-16'}>
                          <div className={`${index === 0 ? 'h-24' : 'h-14'} flex items-center justify-center rounded-2xl bg-white`}>
                            <img src={getSpeciesDisplayImage(fish)} alt={subject.name} className={`h-full w-full object-contain p-1 ${getSpeciesImageClass(fish)}`} />
                          </div>
                          <div className="mt-1 truncate text-center text-[10px] font-black text-ink">{subject.name} ×{subject.quantity}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-ink/60">{activeTankRisk.detail}</p>
                </div>
                <div className="rounded-[22px] border border-emerald-100 bg-white p-4">
                  <div className="text-[11px] font-black text-emerald-800">{isEn ? "Follow These 3 Steps Now" : "现在按这 3 步做"}</div>
                  <ol className="mt-3 grid gap-3">
                    {activeTankRisk.actionSteps.map((step, index) => (
                      <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 text-sm font-semibold leading-6 text-ink/75">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 rounded-2xl bg-rose-50 px-3 py-2.5">
                    <div className="text-xs font-black text-rose-800">{isEn ? "Avoid Doing This Temporarily" : "暂时不要这样做"}</div>
                    <ul className="mt-2 grid gap-1.5 text-xs font-semibold leading-5 text-rose-900/75">
                      {activeTankRisk.avoidActions.map(item => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConflictDialogOpen(false);
                      if (activeTankRisk.primaryAction === 'open_settings') openAquariumSettings();
                      else setIsTankArchiveExpanded(true);
                    }}
                    className="mt-4 min-h-12 w-full rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-800"
                  >
                    {activeTankRisk.primaryLabel}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm font-bold text-ink/55">{isEn ? "No active risks require action right now." : "当前没有需要处理的风险。"}</div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
