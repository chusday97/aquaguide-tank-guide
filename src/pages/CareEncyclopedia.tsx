import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import posthog from 'posthog-js';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { careTopicsData, type CareTopic } from '../data/careTopicsData';
import {
  getCareActionEvidence,
  getCareActionEvidenceForText,
  getCareFollowUpAction,
  getCareReferences,
  type CareActionEvidence,
} from '../data/careEvidence';
import { fishData } from '../data/fishData';
import type { PreviewImage } from '../components/common/ImagePreviewModal';
import type { Aquarium, AquariumFish, Fish as FishType } from '../types';
import type { WorkspaceNavigationContext } from '../types/navigation';
import { getLifeType } from '../modules/species/species.service';
import i18n from '../i18n';
import { loadAppStateFromStorage } from '../services/storage/local-app-state';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { ResilientImage } from '../components/common/ResilientImage';
import { getCareVisualSources } from '../lib/careVisual';
import { AdaptiveDetailContent } from '../components/common/AdaptiveDetailContent';
import {
  getCareFavorites,
  subscribeToFavorites,
  toggleCareFavorite,
  type CareFavoriteMap,
} from '../services/favorites/favorites.service';
import {
  getCompletedCareOperations,
  getSavedCareChecklists,
  setCompletedCareOperations,
  setSavedCareChecklists,
} from '../services/care/care-activity.service';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';
import { useToast } from '../components/common/ToastProvider';
import { normalizeSpeciesBatches } from '../services/aquarium/species-batches.service';
import { SearchAutocomplete } from '../components/search/SearchAutocomplete';
import { getSearchSuggestions } from '../services/search/search-suggestions.service';
import { taskRoutes } from '../services/navigation/task-routes';
import { getSpeciesDisplayImage } from '../lib/speciesVisual';
import { matchesCareCategory, type CareCategoryId } from '../services/care/care-category.service';
import { KnowledgeSceneExplorer } from '../components/interactive/KnowledgeSceneExplorer';

const ImagePreviewModal = lazy(() => import('../components/common/ImagePreviewModal').then(module => ({ default: module.ImagePreviewModal })));
const bannerTopicIds = ['guide_water_deteriorate', 'guide_new_fish_acclimation', 'guide_safe_water_change'];
type CareViewMode = 'all' | 'favorites';
type CarePresentationMode = 'scene' | 'browse';
type FlyingFavorite = { id: string; startX: number; startY: number; endX: number; endY: number };
type CareGuideView = {
  title: string;
  summary: string;
  suitableFor: string;
  todayActions: Array<{ title: string; description: string }>;
  avoidActions: Array<{ title: string; reason: string; consequence: string; alternative: string }>;
  warningSigns: Array<{ sign: string; possibleReason: string; action: string }>;
  maintenanceTips: Array<{ title: string; description: string }>;
};
type CareCard = {
  title: string;
  subtitle: string;
  coreSummary: string;
  doActions: Array<{ title: string; description?: string }>;
  avoidActions: Array<{ title: string; reason?: string }>;
  warningSigns: Array<{ sign: string; action: string }>;
  suitableFor: string[];
  source: string;
};
export type StepDiagnosisIssue = 'gasping' | 'refusal' | 'hiding' | 'aggression' | 'death' | 'cloudy' | 'shrimpDeath' | 'plantProblem';
type StepDiagnosisAnswerValue = 'none' | 'occasional' | 'frequent' | 'unknown' | 'mild' | 'obvious' | 'small' | 'large' | 'yes';
type StepDiagnosisAnswers = {
  gasping?: StepDiagnosisAnswerValue;
  cloudyWater?: StepDiagnosisAnswerValue;
  recentWaterChange?: StepDiagnosisAnswerValue;
  recentNewLivestock?: StepDiagnosisAnswerValue;
  abnormalBehavior?: StepDiagnosisAnswerValue;
};
type StepDiagnosisResult = {
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  riskLabel: string;
  conclusion: string;
  causes: string[];
  todayActions: string[];
  avoidActions: string[];
  observeItems: string[];
  evidence: string[];
};
type AssessmentScope = 'whole_tank' | 'single_species' | 'multiple_species';
type AssessmentTarget = {
  scope: AssessmentScope;
  speciesIds: string[];
};
type StepDiagnosisState = {
  issueType: StepDiagnosisIssue;
  currentStep: number;
  questionIndex: number;
  answers: StepDiagnosisAnswers;
  targetAquariumId: string;
  target: AssessmentTarget;
  result: StepDiagnosisResult | null;
};
type CareUrgencyTag = '科普了解' | '入缸前准备' | '观察为主' | '阶段护理' | '建议尽快处理' | '需要立即处理' | '谨慎操作';

const getUrgencyTagLabel = (tag: CareUrgencyTag, isEn: boolean) => {
  if (!isEn) return tag;
  const map: Record<CareUrgencyTag, string> = {
    '科普了解': 'Info',
    '入缸前准备': 'Pre-Stocking',
    '观察为主': 'Observation',
    '阶段护理': 'Routine Care',
    '建议尽快处理': 'ASAP',
    '需要立即处理': 'Immediate',
    '谨慎操作': 'Caution',
  };
  return map[tag] || tag;
};
type CareGuideType = 'diagnosis' | 'procedure' | 'careChecklist' | 'knowledge' | 'reminder';
type CareActionLevel = '日常学习' | '操作指南' | '建议关注' | '立即排查';
type CareHomeMeta = {
  topicTags: string[];
  actionLevel: CareActionLevel;
  ctaLabel: string;
};
type CareGuideMeta = {
  topicTags: string[];
  urgencyTag: CareUrgencyTag;
  guideType: CareGuideType;
  ctaLabel: string;
  secondaryCtaLabel?: string;
  relatedIssueType?: StepDiagnosisIssue;
};
type ProcedureStep = { title: string; description: string };
type ProcedureReminder = { title: string; reason: string };
type ProcedureDetail = { title: string; description: string };

const procedureGuideIds = new Set([
  'guide_new_fish_acclimation',
  'guide_safe_water_change',
  'guide_fish_death_action',
  'qa_gen_005',
  'qa_gen_006',
  'qa_gen_013',
  'qa_gen_014',
  'qa_gen_015',
  'qa_gen_016',
  'qa_gen_017',
  'qa_gen_025',
  'qa_gen_031',
  'qa_gen_033',
]);

const careChecklistGuideIds = new Set([
  'guide_pregnant_care',
  'guide_fry_care',
  'qa_gen_021',
  'qa_gen_023',
]);

const diagnosisGuideIds = new Set([
  'guide_water_deteriorate',
  'qa_gen_001',
  'qa_gen_002',
  'qa_gen_003',
  'qa_gen_008',
  'qa_gen_011',
  'qa_gen_012',
  'qa_gen_019',
  'qa_gen_020',
  'qa_gen_022',
  'qa_gen_032',
]);

const knowledgeGuideIds = new Set([
  'qa_gen_004',
  'qa_gen_007',
  'qa_gen_009',
  'qa_gen_010',
  'qa_gen_018',
  'qa_gen_024',
  'qa_gen_026',
  'qa_gen_027',
  'qa_gen_028',
  'qa_gen_029',
  'qa_gen_030',
  'qa_gen_034',
  'qa_gen_035',
]);

const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const categoryIconMap: Record<string, typeof Droplets> = {
  '水质异常': Waves,
  '怀孕 / 鱼苗': Baby,
  '新鱼入缸': Stethoscope,
  '换水维护': Droplets,
  '死亡处理': AlertTriangle,
  '鱼只异常': Fish,
  '日常喂食': Fish,
  '设备问题': Settings,
  '水草 / 藻类': Waves,
};

const actionPatterns: Array<[RegExp, string]> = [
  [/打氧|气泵|氧气|增氧/, '打氧'],
  [/停止喂食|停喂|暂停喂食/, '停喂'],
  [/少量.*换水|20|30|换水/, '少量换水'],
  [/过滤|出水|滤/, '检查过滤器'],
  [/水温|温差|加热/, '看水温'],
  [/隔离|隔离盒|检疫/, '先隔离'],
  [/捞出|死鱼|尸体/, '捞出死鱼'],
  [/过水|泡袋|对温/, '慢过水'],
  [/残饵|清理|吸便/, '清残饵'],
  [/观察|呼吸|浮头/, '观察状态'],
  [/不要|避免|别/, '当前阶段不建议'],
  [/水面|波纹/, '看水面'],
  [/下药|药/, '别乱下药'],
];

const stripStepPrefix = (value: string) => (
  value
    .replace(/^步骤[一二三四五六七八九十\d]+[：:、\s]*/g, '')
    .replace(/（[^）]*）|\([^)]*\)/g, '')
    .replace(/[。；;,.，]/g, ' ')
    .trim()
);

const cleanCareSentence = (value: string) => (
  value
    .replace(/^步骤[一二三四五六七八九十\d]+[：:、\s]*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
);

const shortActionLabel = (value: string, isEn = false) => {
  const text = stripStepPrefix(value);
  const matched = actionPatterns.find(([pattern]) => pattern.test(text));
  if (matched) {
    if (isEn) {
      const enMap: Record<string, string> = {
        '打氧': 'Aeration',
        '停喂': 'Pause Feed',
        '少量换水': 'Water Change',
        '检查过滤器': 'Check Filter',
        '看水温': 'Check Temp',
        '先隔离': 'Isolate First',
        '捞出死鱼': 'Remove Dead Fish',
        '慢过水': 'Slow Acclimate',
        '清残饵': 'Clean Waste',
        '观察状态': 'Observe Fish',
        '当前阶段不建议': 'Caution',
        '看水面': 'Check Surface',
        '别乱下药': 'Avoid Meds',
      };
      return enMap[matched[1]] || matched[1];
    }
    return matched[1];
  }
  if (isEn) {
    // English action label without ugly slicing like "Dechlo" or "Measur"
    if (/dechlorinat|chlorin/i.test(text)) return 'Dechlorinate';
    if (/measure|temp/i.test(text)) return 'Measure Temp';
    if (/siphon|vacuum|gravel|20%|30%/i.test(text)) return 'Water Change';
    if (/add new|drip|small hose/i.test(text)) return 'Add Water';
    if (/oxygen|air|aerat/i.test(text)) return 'Increase Oxygen';
    if (/feed|food|starve|pause/i.test(text)) return 'Pause Feed';
    if (/isolate|quarantine/i.test(text)) return 'Isolate';
    if (/filter|pump/i.test(text)) return 'Check Filter';

    const words = text.split(' ');
    if (words.length > 3) return words.slice(0, 3).join(' ');
    return text.length > 20 ? `${text.slice(0, 18)}...` : text;
  }
  return text.slice(0, 8) || '查看';
};

const getActionChips = (topic: CareTopic, limit = 3) => {
  const source = topic.firstSteps.length > 0
    ? topic.firstSteps
    : [...topic.keywords, topic.summary];
  return Array.from(new Set(source.map(item => shortActionLabel(item)).filter(Boolean))).slice(0, limit);
};

const splitActionText = (value: string, isEn = false) => {
  const cleaned = cleanCareSentence(value);
  const parts = cleaned.split(/[：:]/);
  if (parts.length > 1 && parts[0].length <= 25) {
    const rawTitle = parts[0].trim();
    let title = rawTitle;
    if (isEn) {
      if (/脱氯|除氯/i.test(rawTitle)) title = 'Dechlorinate';
      else if (/测水温|温差|温度/i.test(rawTitle)) title = 'Measure Temp';
      else if (/换水|吸便|抽水/i.test(rawTitle)) title = 'Water Change';
      else if (/加水|进水/i.test(rawTitle)) title = 'Add Water';
      else if (/打氧|增氧/i.test(rawTitle)) title = 'Aeration';
      else title = shortActionLabel(rawTitle, true);
    }
    return { title, description: parts.slice(1).join(': ').trim() };
  }
  const title = shortActionLabel(cleaned, isEn);
  return {
    title,
    description: cleaned === title ? '' : cleaned,
  };
};

const isNewFishAcclimationTopic = (topic: CareTopic) => (
  topic.id === 'guide_new_fish_acclimation' || /新鱼|入缸|过水/.test(`${topic.title} ${topic.summary} ${topic.keywords.join(' ')}`)
);

const getProcedureSteps = (topic: CareTopic): ProcedureStep[] => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isNewFishAcclimationTopic(topic)) {
    if (isEn) {
      return [
        { title: 'Float Temp', description: 'Float the bag on the water surface for 15-30 minutes to match temperatures.' },
        { title: 'Mix Water', description: 'Add a small amount of tank water every 5-10 minutes, repeat 3-4 times.' },
        { title: 'Release Fish', description: 'Net the fish into the tank; discard the bag water, do not pour it in.' },
      ];
    }
    return [
      { title: '浮温', description: '袋子浮在鱼缸水面 15-30 分钟，让水温接近。' },
      { title: '少量混水', description: '每隔 5-10 分钟加入少量鱼缸水，重复 3-4 次。' },
      { title: '捞鱼入缸', description: '只把鱼捞入鱼缸，袋里的水倒掉，不要倒入主缸。' },
    ];
  }
  return topic.firstSteps.slice(0, 4).map(item => {
    const action = splitActionText(item, isEn);
    return {
      title: action.title,
      description: action.description || cleanCareSentence(item),
    };
  });
};

const getProcedureReminders = (topic: CareTopic): ProcedureReminder[] => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isNewFishAcclimationTopic(topic)) {
    if (isEn) {
      return [
        { title: 'Do not pour bag water in', reason: 'Bag water can introduce contaminants and trigger water parameter swings.' },
        { title: 'Do not release immediately', reason: 'Temperature and pH differences can cause severe stress.' },
        { title: 'Avoid bright light initially', reason: 'Keep environment dark and quiet to reduce stress.' },
      ];
    }
    return [
      { title: '不要倒袋水入缸', reason: '袋水可能带入污染物，也会造成水质波动。' },
      { title: '不要立刻入缸', reason: '温差和 pH 波动可能导致应激。' },
      { title: '入缸初期避免强光', reason: '保持安静，减少惊吓。' },
    ];
  }
  return buildAvoidActions(topic).slice(0, 3).map(item => ({
    title: item.title,
    reason: item.reason,
  }));
};

const getProcedureDetails = (topic: CareTopic): ProcedureDetail[] => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isNewFishAcclimationTopic(topic)) {
    if (isEn) {
      return [
        { title: 'Why float the bag?', description: 'Water temperatures in the shipping bag and tank may differ. Floating prevents thermal shock.' },
        { title: 'Why mix water?', description: 'Mixing water slowly helps new arrivals acclimate to pH, hardness, and parameter changes.' },
        { title: 'Why avoid bag water?', description: 'Bag water contains waste, medication residue, and transport pollutants that shouldn\'t enter the main tank.' },
        { title: 'Observe for 3-7 days', description: 'Monitor for white spots, rot, clamped fins, and hiding. Confirm stability before mixing.' },
      ];
    }
    return [
      { title: '为什么要浮温', description: '运输袋和鱼缸的水温可能不同。先浮温可以减少温差刺激。' },
      { title: '为什么要少量混水', description: '少量多次混水，可以让新鱼逐步适应 pH、硬度和气味变化。' },
      { title: '为什么不能倒袋水', description: '袋水里可能有排泄物、药物残留和运输污染物，不适合进入主缸。' },
      { title: '入缸后观察 3-7 天', description: '观察白点、烂鳍、拒食、夹鳍和异常躲藏。稳定后再考虑混养。' },
    ];
  }
  return [
    ...topic.diagnoseWhen.map(item => ({ title: '后续观察', description: cleanCareSentence(item) })),
    ...(topic.nextStep ? [{ title: isEn ? 'Next Step' : '下一步', description: cleanCareSentence(topic.nextStep) }] : []),
  ].filter((item, index, list) => item.description && list.findIndex(other => other.description === item.description) === index);
};

const getProcedureObservation = (topic: CareTopic) => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isNewFishAcclimationTopic(topic)) {
    return isEn
      ? 'It is recommended to quarantine and observe new fish for 3-7 days. Confirm there is no white spot, fin rot, refusal to eat or other abnormalities before releasing into the main tank.'
      : '新鱼建议先隔离观察 3-7 天。确认无白点、烂鳍、拒食等异常后，再放入主缸。';
  }
  return cleanCareSentence(topic.nextStep || topic.diagnoseWhen[0] || (isEn ? 'After completion, continue to observe the fish condition, water temperature, and water changes.' : '完成后继续观察鱼只状态、水温和水体变化。'));
};

const inferAvoidAlternative = (topic: CareTopic, index: number) => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const action = topic.firstSteps[index] || topic.firstSteps[0] || topic.nextStep || topic.summary;
  const cleaned = cleanCareSentence(action).replace(/^下一步建议|^Next step recommended/i, isEn ? 'Recommend' : '建议');
  return cleaned || (isEn ? 'Keep observing first, prioritize treatment methods with less impact on water temperature and quality.' : '先保持观察，优先选择对水温和水质影响更小的处理方式。');
};

const inferAvoidReason = (topic: CareTopic, avoidText: string) => {
  const text = cleanCareSentence(avoidText);
  const [, explicitReason] = text.split(/[，,；;]/);
  if (explicitReason?.trim()) return explicitReason.trim();
  if (/脏水|包装袋|直接倒|换水|倒水|温差|pH|水质|自来水/.test(text)) return '这会让水温或水质短时间大幅波动，也可能把运输水里的污染物带入主缸。';
  if (/下药|药|滤材|过滤|清洗/.test(text)) return '原因未确认前处理过重，可能伤到硝化系统或健康个体。';
  if (/喂|饲料|残饵/.test(text)) return '过量食物会迅速污染水体，增加缺氧和氨氮风险。';
  if (/强光|惊吓|捞|移动|追/.test(text)) return '频繁惊扰会增加应激，让恢复或适应过程变慢。';
  if (/混养|大鱼|同一层|其它鱼/.test(text)) return '体型、食性或空间压力会放大追咬、吞食和抢食风险。';
  return topic.summary || '这个操作容易让当前问题进一步扩大。';
};

const inferAvoidConsequence = (reason: string) => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isEn) {
    if (/oxygen|ammonia|pollution|water/i.test(reason)) return 'May trigger gasping, bottom-sitting, refusal to feed, or rapid water deterioration.';
    if (/stress|scare|fluctuate|temp/i.test(reason)) return 'May cause shock, hiding, jumping out of tank, or reduced immunity.';
    if (/nitri|filter|med|drug/i.test(reason)) return 'May damage the nitriding system, making future water stability harder.';
    if (/eat|nip|food|mix/i.test(reason)) return 'May cause injury, predation, or prolonged hiding and starvation.';
    return 'May make the issue harder to assess and slower to stabilize.';
  }
  if (/缺氧|氨氮|污染|水质/.test(reason)) return '可能出现浮头、趴缸、拒食或水体迅速变差。';
  if (/应激|惊扰|波动|温差/.test(reason)) return '可能导致鱼只休克、躲藏、跳缸或抵抗力下降。';
  if (/硝化|滤材|下药|药/.test(reason)) return '可能造成硝化系统受损，后续水质更难稳定。';
  if (/吞食|追咬|抢食|混养/.test(reason)) return '可能造成受伤、被吃或长期躲避不进食。';
  return '可能让问题变得更难判断，也更难恢复稳定。';
};

const buildAvoidActions = (topic: CareTopic): CareGuideView['avoidActions'] => (
  topic.avoid.slice(0, 4).map((item, index) => {
    const sentence = cleanCareSentence(item);
    const [firstClause, ...rest] = sentence.split(/[，,；;]/).map(part => part.trim()).filter(Boolean);
    const title = firstClause || sentence;
    const reason = rest.length > 0 ? rest.join('，') : inferAvoidReason(topic, sentence);
    return {
      title,
      reason,
      consequence: inferAvoidConsequence(reason),
      alternative: inferAvoidAlternative(topic, index),
    };
  })
);

const warningPatterns: Array<{ pattern: RegExp; sign: string; possibleReason: string; action: string }> = [
  { pattern: /浮头|呼吸|喘|缺氧/, sign: '浮头或呼吸急促', possibleReason: '可能是缺氧、水质恶化或温差刺激。', action: '先增加供氧，检查过滤出水，并少量换入等温除氯水。' },
  { pattern: /拒食|不吃|趴缸|不动/, sign: '拒食或趴缸', possibleReason: '可能是应激、水温波动或水质指标异常。', action: '暂停加餐，观察体表和呼吸，同时补测温度、pH、氨氮和亚硝酸盐。' },
  { pattern: /躲|扎堆|惊慌|急游/, sign: '躲藏、扎堆或急游', possibleReason: '可能是环境变化太快、光照过强或被追逐。', action: '降低光照和打扰，增加遮蔽物，确认没有被其它生物追咬。' },
  { pattern: /死亡|死鱼|夭折|暴毙/, sign: '死亡数量增加', possibleReason: '可能是急性水质问题、传染病或强烈应激。', action: '立刻移除死亡个体，暂停喂食，少量换水并加强供氧。' },
  { pattern: /白点|烂尾|红斑|充血|立鳞/, sign: '体表出现病灶', possibleReason: '可能是外寄、细菌感染或水质长期不稳。', action: '先隔离观察，记录症状变化，再决定是否药浴或一键诊断。' },
  { pattern: /卵黄囊|鱼苗|平游|开口/, sign: '鱼苗状态异常', possibleReason: '可能是水流过强、开口食物不合适或温度不稳。', action: '保持弱水流和恒温，少量多次喂食，及时清理残饵。' },
];

const getDefaultWarningSigns = (topic: CareTopic): CareGuideView['warningSigns'] => {
  if (/怀孕|鱼苗/.test(topic.category + topic.title)) {
    return [
      { sign: '鱼苗扎堆或不平游', possibleReason: '可能是水温波动、水流过强或水质开始变差。', action: '保持弱水流，确认水温稳定，少量清理残饵。' },
      { sign: '死亡数量增加', possibleReason: '可能是喂食污染、缺氧或换水刺激。', action: '暂停喂食，少量换入等温水，并增加供氧。' },
    ];
  }
  if (/水质|换水|自来水|油膜|白浊/.test(topic.category + topic.title + topic.summary)) {
    return [
      { sign: '鱼浮头或水面聚集', possibleReason: '可能是溶氧不足或水质恶化。', action: '增加水面扰动和供氧，减少喂食并观察 1-2 小时。' },
      { sign: '水体异味或浑浊加重', possibleReason: '可能是有机物堆积或硝化系统不稳定。', action: '少量换水，清理残饵，不要大洗滤材。' },
    ];
  }
  return [
    { sign: '状态突然变差', possibleReason: '可能是水质、温度、混养压力或近期操作变化造成。', action: '先暂停新增操作，记录变化时间，再补充水温和水质数据。' },
  ];
};

const buildWarningSigns = (topic: CareTopic): CareGuideView['warningSigns'] => {
  const matched = topic.symptoms
    .map(item => {
      const cleaned = cleanCareSentence(item);
      const preset = warningPatterns.find(({ pattern }) => pattern.test(cleaned));
      if (!preset) return null;
      return {
        sign: preset.sign,
        possibleReason: preset.possibleReason,
        action: preset.action,
      };
    })
    .filter((item): item is CareGuideView['warningSigns'][number] => Boolean(item));
  const unique = matched.filter((item, index, list) => list.findIndex(other => other.sign === item.sign) === index);
  return (unique.length > 0 ? unique : getDefaultWarningSigns(topic)).slice(0, 4);
};

const buildCareGuide = (topic: CareTopic): CareGuideView => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const todayActions = topic.firstSteps.slice(0, 4).map(item => {
    const action = splitActionText(item, isEn);
    return {
      title: action.title,
      description: action.description || cleanCareSentence(item),
    };
  });
  const maintenanceTips = isNewFishAcclimationTopic(topic)
    ? [{ title: '入缸后观察', description: getProcedureObservation(topic) }]
    : [
      ...topic.observe.map(item => ({ title: isEn ? 'Key Observations' : '观察重点', description: cleanCareSentence(item) })),
      ...topic.diagnoseWhen.map(item => ({ title: isEn ? 'Follow-up Assessment' : '后续判断', description: cleanCareSentence(item) })),
      { title: isEn ? 'Next Step' : '下一步', description: cleanCareSentence(getCareFollowUpAction(topic, isEn)) },
    ]
      .filter(item => item.description)
      .filter((item, index, list) => list.findIndex(other => other.description === item.description) === index);

  return {
    title: getDisplayTitle(topic),
    summary: topic.summary,
    suitableFor: topic.symptoms.length > 0 ? cleanCareSentence(topic.symptoms[0]) : topic.summary,
    todayActions,
    avoidActions: buildAvoidActions(topic),
    warningSigns: buildWarningSigns(topic),
    maintenanceTips: maintenanceTips.length > 0
      ? maintenanceTips
      : [{ title: '持续观察', description: topic.summary || '处理后继续观察鱼只状态、水温和水体变化。' }],
  };
};

const relatedScenarioGroups: Array<{ name: string; pattern: RegExp }> = [
  { name: 'new_fish', pattern: /新鱼|入缸|过水|检疫|隔离|拒食|适应/ },
  { name: 'water', pattern: /水质|水浑|白浊|发白|发绿|异味|油膜|换水|过滤|氨氮|亚硝酸盐/ },
  { name: 'breeding', pattern: /怀孕|母鱼|鱼苗|繁殖|产后|开口|平游|卵黄囊/ },
  { name: 'death', pattern: /死亡|死鱼|暴毙|隔离|捞出|水质检测/ },
  { name: 'symptom', pattern: /浮头|呼吸|拒食|趴缸|躲藏|打架|追咬|白点|烂尾|红鳃/ },
  { name: 'equipment', pattern: /设备|过滤|滤材|加热棒|气泵|灯光|水流/ },
  { name: 'plant', pattern: /水草|黄叶|烂叶|藻|CO2|光照|草缸/ },
];

const getRelatedScenarioKeys = (topic: CareTopic) => {
  const text = `${getDisplayTitle(topic)} ${topic.title} ${topic.category} ${topic.summary} ${topic.keywords.join(' ')}`;
  return relatedScenarioGroups.filter(group => group.pattern.test(text)).map(group => group.name);
};

const getAquariumRelatedBoosts = (aquarium: Aquarium | null | undefined) => {
  const livestock = aquarium?.fishes || [];
  const details = livestock
    .map(item => fishData.find(fish => fish.id === item.fishId))
    .filter((fish): fish is FishType => Boolean(fish));
  const now = Date.now();
  const hasRecentLivestock = livestock.some(item => {
    const addedAt = new Date(item.entryDate).getTime();
    return Number.isFinite(addedAt) && now - addedAt < 14 * 24 * 60 * 60 * 1000;
  });
  const hasBreedingSpecies = details.some(fish => /孔雀|玛丽|月光|胎生|鱼苗|虾/.test(`${fish.name} ${fish.category} ${fish.description}`));
  const isNewTank = Boolean(aquarium) && (!aquarium?.lastWaterChangeDate && (aquarium?.waterChangeHistory || []).length === 0);
  const hasEquipmentGap = Boolean(aquarium && (!aquarium.equipment?.filter || aquarium.equipment.filter === '无'));
  return {
    new_fish: hasRecentLivestock ? 3 : 0,
    water: isNewTank ? 2 : 0,
    breeding: hasBreedingSpecies ? 3 : 0,
    equipment: hasEquipmentGap ? 2 : 0,
  };
};

const getRelatedCareGuides = (currentGuide: CareTopic, allGuides: CareTopic[], activeAquarium?: Aquarium | null) => {
  const currentMeta = getCareGuideMeta(currentGuide);
  const currentHomeMeta = getCareHomeMeta(currentGuide);
  const currentScenarios = getRelatedScenarioKeys(currentGuide);
  const currentKeywords = new Set(currentGuide.keywords.map(keyword => keyword.trim()).filter(Boolean));
  const aquariumBoosts = getAquariumRelatedBoosts(activeAquarium);

  return allGuides
    .filter(item => item.id !== currentGuide.id)
    .map(item => {
      const meta = getCareGuideMeta(item);
      const homeMeta = getCareHomeMeta(item);
      const scenarioKeys = getRelatedScenarioKeys(item);
      const sharedTopicTags = meta.topicTags.filter(tag => currentMeta.topicTags.includes(tag)).length
        + homeMeta.topicTags.filter(tag => currentHomeMeta.topicTags.includes(tag)).length;
      const sharedKeywords = item.keywords.filter(keyword => currentKeywords.has(keyword)).length;
      const sharedScenarios = scenarioKeys.filter(key => currentScenarios.includes(key)).length;
      const aquariumBoost = scenarioKeys.reduce((sum, key) => sum + ((aquariumBoosts as Record<string, number>)[key] || 0), 0);
      const guideTypeScore = meta.guideType === currentMeta.guideType ? 2 : (
        currentMeta.guideType === 'procedure' && meta.guideType === 'diagnosis' ? 1 :
        currentMeta.guideType === 'diagnosis' && ['procedure', 'knowledge'].includes(meta.guideType) ? 1 :
        currentMeta.guideType === 'careChecklist' && meta.guideType === 'procedure' ? 1 : 0
      );
      const score = sharedTopicTags * 5 + sharedKeywords * 2 + sharedScenarios * 6 + guideTypeScore + aquariumBoost;
      return { item, score };
    })
    .filter(({ score }) => score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => item);
};

const vagueCareCardPatterns = [/^避开风险$/, /^注意观察$/, /^保持稳定$/, /^及时处理$/, /^查过滤$/, /^观察状态$/];

const isVagueCareCardText = (value: string) => {
  const text = cleanCareSentence(value).replace(/[。！!，,\s]/g, '');
  return vagueCareCardPatterns.some(pattern => pattern.test(text));
};

const actionTextForCard = (title: string, description?: string) => {
  const cleanTitle = cleanCareSentence(title);
  const cleanDescription = cleanCareSentence(description || '');
  if (cleanDescription && (isVagueCareCardText(cleanTitle) || cleanTitle.length <= 6 || !/[。；，,]/.test(cleanTitle))) {
    return cleanDescription;
  }
  return cleanTitle || cleanDescription;
};

const careCardKey = (value: string) => (
  cleanCareSentence(value)
    .replace(/^(不要|别|避免|请|先|再|立刻|马上)/, '')
    .replace(/[，。；;,.、\s]/g, '')
    .slice(0, 16)
);

const buildCareCard = (topic: CareTopic): CareCard => {
  const guide = buildCareGuide(topic);
  const doActions = guide.todayActions
    .map(item => ({
      title: actionTextForCard(item.title, item.description),
      description: undefined,
    }))
    .filter(item => item.title && !isVagueCareCardText(item.title))
    .slice(0, 4);

  const doKeys = new Set(doActions.map(item => careCardKey(item.title)));
  const avoidActions = guide.avoidActions
    .map(item => ({
      title: actionTextForCard(item.title),
      reason: cleanCareSentence(item.reason),
    }))
    .filter(item => item.title && !isVagueCareCardText(item.title))
    .filter(item => !doKeys.has(careCardKey(item.title)) || /^不要|避免|别/.test(item.title))
    .slice(0, 4);

  const suitableFor = Array.from(new Set([
    topic.category,
    ...topic.keywords.slice(0, 3),
    guide.suitableFor,
  ].map(cleanCareSentence).filter(Boolean))).slice(0, 4);

  return {
    title: guide.title,
    subtitle: topic.category,
    coreSummary: guide.summary,
    doActions,
    avoidActions,
    warningSigns: guide.warningSigns.slice(0, 4).map(item => ({
      sign: item.sign,
      action: item.action,
    })),
    suitableFor,
    source: Boolean(i18n.language?.startsWith('en')) ? 'From AquaGuide' : '来自 AquaGuide',
  };
};

const formatCareCardAction = (item: { title: string; description?: string; reason?: string }) => {
  const detail = item.description || item.reason;
  return detail ? `${item.title}。${detail}`.replace(/。。/g, '。') : item.title;
};

const buildCareCardCopyText = (careCard: CareCard) => (
  [
    ['【AquaGuide 养护卡】', careCard.title],
    ['核心结论：', careCard.coreSummary],
    careCard.doActions.length > 0
      ? ['先做：', ...careCard.doActions.map((item, index) => `${index + 1}. ${formatCareCardAction(item)}`)]
      : [],
    careCard.avoidActions.length > 0
      ? ['暂时避免：', ...careCard.avoidActions.map((item, index) => `${index + 1}. ${formatCareCardAction(item)}`)]
      : [],
    careCard.warningSigns.length > 0
      ? ['异常提醒：', ...careCard.warningSigns.map(item => `${item.sign}：${item.action}`)]
      : [],
    [careCard.source],
  ].filter(group => group.length > 0).map(group => group.join('\n')).join('\n\n')
);

const copyPlainText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('copy command failed');
  }
};


const getRecommendationReasonLocalized = (reason: string, isEn = false) => {
  if (!isEn) return reason;
  const map: Record<string, string> = {
    '最近添加了新生物': 'New livestock added',
    '新缸优先检查水质稳定情况': 'New tank: check water stability',
    '有生物处于繁殖阶段': 'Breeding stage detected',
    '过滤设备尚未设置': 'Filter not set',
    '还没有换水记录': 'No water-change record',
    '暂无鱼缸数据': 'No tank data',
    '日常喂食和残饵管理会影响水质稳定。': 'Feeding and leftovers affect water stability.',
  };
  return map[reason] || reason;
};

const getCareImage = (topic: CareTopic, isEn = false) => {
  if (!topic.imageUrl) return '';
  let url = topic.imageUrl.startsWith('/') ? topic.imageUrl : `/${topic.imageUrl}`;
  if (isEn) {
    if (url.includes('pregnant_fish_breeder_box')) {
      return '/assets/qa/pregnant_fish_breeder_box.png';
    }
    return url.replace(/_chinese(?:_realistic_fish)?/g, '');
  }
  return url;
};

const displayTitleMapEn: Record<string, string> = {
  guide_new_fish_acclimation: 'How to Acclimate New Fish Safely',
  guide_water_deteriorate: 'What to Do if Water Quality Drops',
  guide_pregnant_care: 'How to Care for Pregnant Livebearers',
  guide_fry_care: 'How to Raise Newborn Fish Fry',
  guide_safe_water_change: 'How to Perform a Water Change Safely',
  guide_fish_death_action: 'How to Handle Dead Fish in the Tank',
};

const displayTitleMap: Record<string, string> = {
  guide_new_fish_acclimation: '如何安全给新鱼过水？',
  guide_water_deteriorate: '水质变差怎么办？',
  guide_pregnant_care: '母鱼怀孕后怎么护理？',
  guide_fry_care: '鱼苗出生后怎么照料？',
  guide_safe_water_change: '如何安全换水？',
  guide_fish_death_action: '鱼死了以后怎么处理？',
};

const getDisplayTitle = (topic: CareTopic) => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  if (isEn) {
    if (displayTitleMapEn[topic.id]) return displayTitleMapEn[topic.id];
    const title = topic.title.trim();
    if (/[\?]$/.test(title) || /what|how|why|can|should/i.test(title)) {
      return title;
    }
    return title.endsWith('?') ? title : `${title}?`;
  }
  if (displayTitleMap[topic.id]) return displayTitleMap[topic.id];
  const title = topic.title.trim();
  if (/[\?？]$/.test(title) || /怎么办|如何|怎么|要不要|能不能|可以吗|有危害吗|需要注意/.test(title)) {
    return title;
  }
  if (/入缸|过水/.test(title)) return '如何安全给新鱼过水？';
  if (/水质|水浑|发白|发绿|异味|油膜/.test(title)) return `${title}怎么办？`;
  if (/怀孕|母鱼/.test(title)) return '母鱼怀孕后怎么护理？';
  if (/鱼苗/.test(title)) return '鱼苗出生后怎么照料？';
  if (/换水/.test(title)) return `如何${title.replace(/^怎么/, '')}？`;
  if (/气泵|打氧/.test(title)) return '鱼缸一定要气泵打氧吗？';
  if (/死亡|死鱼/.test(title)) return '鱼死了以后怎么处理？';
  return `${title}怎么办？`;
};

const urgencyTagClassMap: Record<CareUrgencyTag, string> = {
  科普了解: 'bg-slate-100 text-slate-700',
  入缸前准备: 'bg-cyan-50 text-cyan-700',
  观察为主: 'bg-emerald-50 text-emerald-700',
  阶段护理: 'bg-violet-50 text-violet-700',
  建议尽快处理: 'bg-orange-100 text-orange-700',
  需要立即处理: 'bg-red-600 text-white',
  谨慎操作: 'bg-yellow-100 text-yellow-800',
};

const actionLevelClassMap: Record<CareActionLevel, string> = {
  日常学习: 'bg-slate-100 text-slate-700',
  操作指南: 'bg-emerald-50 text-emerald-700',
  建议关注: 'bg-orange-100 text-orange-700',
  立即排查: 'bg-red-600 text-white',
};

const actionLevelCtaMap: Record<CareActionLevel, string> = {
  日常学习: '查看内容',
  操作指南: '查看内容',
  建议关注: '查看内容',
  立即排查: '查看内容',
};

const careCategoryEntrances: Array<{ label: string; filter: string; icon: typeof Droplets; hint: string }> = [
  { label: '水质问题', filter: '水质异常', icon: Droplets, hint: '水浑 / 异味 / 波动' },
  { label: '新鱼入缸', filter: '新鱼入缸', icon: Stethoscope, hint: '过水 / 检疫 / 放养' },
  { label: '鱼只异常', filter: '鱼只异常', icon: Fish, hint: '浮头 / 拒食 / 体表' },
  { label: '设备维护', filter: '设备维护', icon: Settings, hint: '过滤 / 打氧 / 灯光' },
  { label: '怀孕 / 鱼苗', filter: '鱼苗养护', icon: Baby, hint: '繁殖 / 开口 / 隔离' },
  { label: '日常养护', filter: '日常养护', icon: Waves, hint: '换水 / 喂食 / 清洁' },
];

const highFrequencyFilters = ['全部', '新手必看', '水质问题', '鱼类症状', '喂食管理', '设备维护'];

const highFrequencyFilterToCategory: Record<string, string> = {
  全部: '全部',
  新手必看: '新手必看',
  水质问题: '水质异常',
  鱼类症状: '鱼只异常',
  喂食管理: '喂食管理',
  设备维护: '设备维护',
};

const sceneEntrances = [
  { label: '新鱼入缸', subtitle: '过水 / 放养', filter: '新鱼入缸' },
  { label: '水质异常', subtitle: '浑水 / 异味', filter: '水质异常' },
  { label: '怀孕 / 鱼苗', subtitle: '产卵 / 孵化', filter: '鱼苗养护' },
  { label: '设备维护', subtitle: '清洗 / 保养', filter: '设备维护' },
  { label: '鱼只异常', subtitle: '浮头 / 拒食 / 死鱼', filter: '鱼只异常' },
];

const getCareHomeMeta = (topic: CareTopic): CareHomeMeta => {
  const guideMeta = getCareGuideMeta(topic);
  const displayTitle = getDisplayTitle(topic);
  const text = `${displayTitle} ${topic.title} ${topic.category} ${topic.keywords.join(' ')}`;
  let topicTags = guideMeta.topicTags.map(tag => (
    tag === '怀孕 / 鱼苗' ? '繁殖护理' : tag
  ));
  let actionLevel: CareActionLevel = '日常学习';

  if (topic.id === 'guide_safe_water_change') {
    topicTags = ['日常养护'];
    actionLevel = '操作指南';
  } else if (topic.id === 'guide_new_fish_acclimation') {
    topicTags = ['新鱼入缸'];
    actionLevel = '操作指南';
  } else if (topic.id === 'guide_water_deteriorate') {
    topicTags = ['水质异常'];
    actionLevel = '建议关注';
  } else if (topic.id === 'guide_fish_death_action') {
    topicTags = ['鱼只异常'];
    actionLevel = '立即排查';
  } else if (topic.id === 'guide_fry_care') {
    topicTags = ['鱼苗养护'];
    actionLevel = '操作指南';
  } else if (/新缸.*白|白蒙蒙|白浊/.test(text)) {
    topicTags = ['水质异常'];
    actionLevel = '建议关注';
  } else if (/过水|入缸|换水|清洗|操作|步骤|鱼苗|怀孕|繁殖/.test(text) || guideMeta.guideType === 'procedure' || guideMeta.guideType === 'careChecklist') {
    actionLevel = '操作指南';
  } else if (/死亡|死鱼|浮头|急促|氨中毒|白点|烂尾|红鳃|暴毙/.test(text)) {
    actionLevel = '立即排查';
  } else if (/水质|水浑|发白|发绿|异味|油膜|过滤|设备|硬度|pH|混养/.test(text) || topic.urgency === '尽快处理') {
    actionLevel = '建议关注';
  }

  if (topicTags.length === 0) topicTags = ['日常养护'];

  return {
    topicTags: topicTags.slice(0, 1),
    actionLevel,
    ctaLabel: Boolean(i18n.language?.startsWith('en')) ? 'View Guide' : actionLevelCtaMap[actionLevel],
  };
};

type CareRecommendation = {
  topic: CareTopic;
  reason: string;
};

const findCareTopic = (matcher: (topic: CareTopic) => boolean) => careTopicsData.find(matcher);

const getCareRecommendations = (aquarium: Aquarium | null, allGuides: CareTopic[]): CareRecommendation[] => {
  const recommendations: CareRecommendation[] = [];
  const addRecommendation = (topic: CareTopic | undefined, reason: string) => {
    if (!topic || recommendations.some(item => item.topic.id === topic.id)) return;
    recommendations.push({ topic, reason });
  };

  const livestock = aquarium?.fishes || [];
  const livestockDetails = livestock
    .map(item => fishData.find(fish => fish.id === item.fishId))
    .filter((fish): fish is FishType => Boolean(fish));
  const now = Date.now();
  const hasRecentLivestock = livestock.some(item => {
    const addedTime = new Date(item.entryDate).getTime();
    return Number.isFinite(addedTime) && now - addedTime < 14 * 24 * 60 * 60 * 1000;
  });
  const hasWaterChangeRecord = Boolean(aquarium?.lastWaterChangeDate || (aquarium?.waterChangeHistory || []).length > 0);
  const isNewTank = Boolean(aquarium) && (!hasWaterChangeRecord || livestock.length === 0);
  const hasBreedingSpecies = livestockDetails.some(fish => /孔雀|玛丽|月光|胎生|鱼苗|虾/.test(`${fish.name} ${fish.category} ${fish.description}`));
  const hasActivePregnancy = livestock.some(item => normalizeSpeciesBatches(item).some(batch => [
    'pregnant_or_gravid',
    'in_labor_or_spawning',
    'postpartum_recovery',
  ].includes(batch.reproductiveState)));
  const hasFilter = Boolean(aquarium?.equipment?.filter && aquarium.equipment.filter !== '无');

  if (hasRecentLivestock) {
    addRecommendation(findCareTopic(topic => topic.id === 'guide_new_fish_acclimation'), '最近添加了新生物');
  }
  if (isNewTank) {
    addRecommendation(findCareTopic(topic => /白蒙蒙|白浊|新缸刚放水/.test(getDisplayTitle(topic) + topic.summary)), '新缸优先检查水质稳定情况');
  }
  if (hasActivePregnancy || hasBreedingSpecies) {
    addRecommendation(findCareTopic(topic => topic.id === 'guide_pregnant_care' || topic.id === 'guide_fry_care'), hasActivePregnancy
      ? '有生物处于繁殖阶段'
      : '');
  }
  if (!hasFilter && aquarium) {
    addRecommendation(findCareTopic(topic => /过滤|滤棉|过滤器/.test(getDisplayTitle(topic) + topic.summary + topic.keywords.join(' '))), '过滤设备尚未设置');
  }
  if ((aquarium?.waterChangeHistory || []).length === 0) {
    addRecommendation(findCareTopic(topic => topic.id === 'guide_safe_water_change'), '还没有换水记录');
  }

  addRecommendation(findCareTopic(topic => topic.id === 'guide_water_deteriorate'), aquarium ? '' : '暂无鱼缸数据');
  addRecommendation(findCareTopic(topic => topic.id === 'guide_new_fish_acclimation'), '');
  addRecommendation(findCareTopic(topic => topic.id === 'guide_safe_water_change'), '');
  addRecommendation(allGuides.find(topic => /喂食|残饵/.test(getDisplayTitle(topic) + topic.keywords.join(' '))), '日常喂食和残饵管理会影响水质稳定。');

  return recommendations.slice(0, 5);
};

const getCareGuideMeta = (topic: CareTopic): CareGuideMeta => {
  const displayTitle = getDisplayTitle(topic);
  const text = `${displayTitle} ${topic.title} ${topic.category} ${topic.summary} ${topic.keywords.join(' ')}`;
  const topicTags = new Set<string>();
  const addTag = (tag: string) => topicTags.add(tag);

  if (/新鱼|入缸|过水|检疫/.test(text)) addTag('新鱼入缸');
  if (/水质|水浑|白浊|发白|发绿|异味|油膜|氨氮|亚硝酸盐/.test(text)) addTag('水质异常');
  if (/浮头|呼吸|拒食|趴缸|白点|烂尾|鱼只异常|疾病|生病/.test(text)) addTag('鱼只异常');
  if (/怀孕|母鱼|繁殖/.test(text)) addTag('怀孕 / 鱼苗');
  if (/鱼苗|开口|平游|卵黄囊/.test(text)) addTag('鱼苗养护');
  if (/过滤|加热棒|气泵|灯|设备/.test(text)) addTag('设备维护');
  if (/混养|追咬|打架|攻击/.test(text)) addTag('混养冲突');
  if (/水草|草缸|造景|CO2|黄叶|烂叶|藻/.test(text)) addTag('草缸配置');
  if (/换水|清洁|喂食|残饵|日常/.test(text)) addTag('日常养护');
  if (topicTags.size === 0) addTag(topic.category || '日常养护');

  if (procedureGuideIds.has(topic.id) || /过水|新鱼入缸|检疫/.test(text)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: /过水|新鱼入缸|检疫/.test(text)
        ? '入缸前准备'
        : /大换水|下药|滤材|死亡/.test(text)
          ? '谨慎操作'
          : '观察为主',
      guideType: 'procedure',
      ctaLabel: /过水|新鱼入缸|检疫/.test(text) ? '设置 3 天观察提醒' : '标记已完成操作',
      secondaryCtaLabel: /过水|新鱼入缸|检疫/.test(text) ? '标记已完成过水' : '展开完整说明',
      relatedIssueType: 'gasping',
    };
  }

  if (careChecklistGuideIds.has(topic.id)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: '阶段护理',
      guideType: 'careChecklist',
      ctaLabel: '保存护理清单',
      secondaryCtaLabel: '加入阶段提醒',
      relatedIssueType: 'gasping',
    };
  }

  if (diagnosisGuideIds.has(topic.id)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: '建议尽快处理',
      guideType: 'diagnosis',
      ctaLabel: '开始快速评测',
      relatedIssueType: 'cloudy',
    };
  }

  if (knowledgeGuideIds.has(topic.id)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: /用药|除藻|硬度|pH|CO2|盐度|钙|镁|KH/.test(text) ? '谨慎操作' : '科普了解',
      guideType: 'knowledge',
      ctaLabel: '收藏文章',
      secondaryCtaLabel: '展开完整说明',
      relatedIssueType: inferStepDiagnosisIssue(topic),
    };
  }

  if (/浮头|呼吸急促|急性|氨中毒|烂尾|白点|红鳃/.test(text)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: '需要立即处理',
      guideType: 'diagnosis',
      ctaLabel: '开始快速评测',
      relatedIssueType: inferStepDiagnosisIssue(topic),
    };
  }

  if (/水质变差|水浑|发白|发绿|异味|过滤器不出水|设备异常/.test(text)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: '建议尽快处理',
      guideType: 'diagnosis',
      ctaLabel: '开始快速评测',
      relatedIssueType: inferStepDiagnosisIssue(topic),
    };
  }

  if (/换水|清洗过滤|清洁|喂食|残饵/.test(text)) {
    return {
      topicTags: Array.from(topicTags).slice(0, 2),
      urgencyTag: /大换水|下药|滤材/.test(text) ? '谨慎操作' : '观察为主',
      guideType: 'procedure',
      ctaLabel: /换水/.test(text) ? '标记已完成换水' : '标记已完成操作',
      secondaryCtaLabel: '展开完整说明',
      relatedIssueType: inferStepDiagnosisIssue(topic),
    };
  }

  return {
    topicTags: Array.from(topicTags).slice(0, 2),
    urgencyTag: /用药|除藻|硬度|pH|CO2/.test(text) ? '谨慎操作' : '科普了解',
    guideType: 'knowledge',
    ctaLabel: '收藏文章',
    secondaryCtaLabel: '展开完整说明',
    relatedIssueType: inferStepDiagnosisIssue(topic),
  };
};

const stepDiagnosisIssues: Array<{ id: StepDiagnosisIssue; label: string; description: string }> = [
  { id: 'gasping', label: '浮头 / 呼吸急促', description: '排查缺氧、水质波动和短期应激' },
  { id: 'refusal', label: '拒食', description: '排查新鱼应激、喂食压力和水质问题' },
  { id: 'hiding', label: '躲藏不动', description: '排查追咬、温度波动和环境压力' },
  { id: 'aggression', label: '追咬打架', description: '排查领地、密度和躲避空间' },
  { id: 'death', label: '死亡 / 异常死亡', description: '排查急性水质问题和污染风险' },
  { id: 'cloudy', label: '水体浑浊 / 异味', description: '排查残饵、过滤和硝化波动' },
  { id: 'shrimpDeath', label: '虾类死亡', description: '排查换水刺激、用药和蜕壳压力' },
  { id: 'plantProblem', label: '水草黄叶 / 烂叶', description: '排查光照、肥力和适应期' },
];

const stepDiagnosisIssuesEn: typeof stepDiagnosisIssues = [
  { id: 'gasping', label: 'Gasping / Rapid Breathing', description: 'Check oxygen, parameters & stress' },
  { id: 'refusal', label: 'Refusing Food', description: 'Check transport stress, feeding pressure' },
  { id: 'hiding', label: 'Hiding / Inactive', description: 'Check aggression, temp fluctuations' },
  { id: 'aggression', label: 'Chasing / Aggression', description: 'Check territory, stocking & cover' },
  { id: 'death', label: 'Livestock Death', description: 'Check acute toxicity & organic spikes' },
  { id: 'cloudy', label: 'Cloudy / Smelly Water', description: 'Check filter, residue & bio-cycle' },
  { id: 'shrimpDeath', label: 'Shrimp Mortality', description: 'Check parameter shifts & molting' },
  { id: 'plantProblem', label: 'Melting / Yellow Leaves', description: 'Check lighting, nutrients & adaptation' },
];

const stepDiagnosisQuestions: Array<{
  id: keyof StepDiagnosisAnswers;
  question: string;
  options: Array<{ label: string; value: StepDiagnosisAnswerValue }>;
}> = [
  {
    id: 'gasping',
    question: '是否看到鱼浮头或呼吸急促？',
    options: [
      { label: '没有', value: 'none' },
      { label: '偶尔', value: 'occasional' },
      { label: '经常', value: 'frequent' },
      { label: '不确定', value: 'unknown' },
    ],
  },
  {
    id: 'cloudyWater',
    question: '水体是否浑浊或有异味？',
    options: [
      { label: '没有', value: 'none' },
      { label: '有一点', value: 'mild' },
      { label: '明显', value: 'obvious' },
      { label: '不确定', value: 'unknown' },
    ],
  },
  {
    id: 'recentWaterChange',
    question: '最近 48 小时是否换水？',
    options: [
      { label: '没有', value: 'none' },
      { label: '少量换水', value: 'small' },
      { label: '大量换水', value: 'large' },
      { label: '不确定', value: 'unknown' },
    ],
  },
  {
    id: 'recentNewLivestock',
    question: '最近是否新增生物？',
    options: [
      { label: '没有', value: 'none' },
      { label: '有', value: 'yes' },
      { label: '不确定', value: 'unknown' },
    ],
  },
  {
    id: 'abnormalBehavior',
    question: '是否有拒食、躲藏或死亡？',
    options: [
      { label: '没有', value: 'none' },
      { label: '有轻微异常', value: 'mild' },
      { label: '有明显异常', value: 'obvious' },
      { label: '不确定', value: 'unknown' },
    ],
  },
];

const getStepDiagnosisQuestions = (issueType: StepDiagnosisIssue, isEn = false) => {
  const questionIdsByIssue: Record<StepDiagnosisIssue, Array<keyof StepDiagnosisAnswers>> = {
    cloudy: ['cloudyWater', 'recentWaterChange', 'recentNewLivestock'],
    gasping: ['gasping', 'cloudyWater', 'recentWaterChange'],
    death: ['gasping', 'cloudyWater', 'recentWaterChange', 'recentNewLivestock'],
    shrimpDeath: ['recentWaterChange', 'cloudyWater', 'recentNewLivestock'],
    plantProblem: ['cloudyWater', 'recentWaterChange'],
    refusal: ['abnormalBehavior', 'recentNewLivestock', 'cloudyWater'],
    hiding: ['abnormalBehavior', 'recentNewLivestock', 'recentWaterChange'],
    aggression: ['abnormalBehavior', 'recentNewLivestock'],
  };
  const ids = questionIdsByIssue[issueType];
  const questions = ids
    .map(id => stepDiagnosisQuestions.find(question => question.id === id))
    .filter((question): question is (typeof stepDiagnosisQuestions)[number] => Boolean(question));
  if (!isEn) return questions;
  const prompts: Record<keyof StepDiagnosisAnswers, string> = {
    cloudyWater: 'Is the water cloudy or discolored?',
    gasping: 'Are fish gasping or breathing rapidly?',
    recentWaterChange: 'Was there a water change in the last 48 hours?',
    recentNewLivestock: 'Were any new animals added recently?',
    abnormalBehavior: 'Is there refusal to eat, hiding, or death?',
  };
  return questions.map(question => ({
    ...question,
    question: prompts[question.id],
    options: question.options.map(option => ({
      ...option,
      label: answerLabelMapEn[option.value],
    })),
  }));
};

const inferStepDiagnosisIssue = (topic: CareTopic): StepDiagnosisIssue => {
  const text = `${topic.title}${topic.category}${topic.summary}${topic.keywords.join(' ')}`;
  if (/虾/.test(text)) return 'shrimpDeath';
  if (/水草|黄叶|烂叶|藻/.test(text)) return 'plantProblem';
  if (/死亡|死鱼|暴毙/.test(text)) return 'death';
  if (/水质|浑|发白|发绿|异味|臭|油膜/.test(text)) return 'cloudy';
  if (/追咬|打架|攻击|抢食/.test(text)) return 'aggression';
  if (/躲|趴缸|不动/.test(text)) return 'hiding';
  if (/拒食|不吃/.test(text)) return 'refusal';
  if (/浮头|呼吸|喘|缺氧/.test(text)) return 'gasping';
  return 'gasping';
};

const getTankVolumeLiters = (aquarium?: Aquarium | null) => {
  if (!aquarium?.dimensions) return 0;
  const length = Number(aquarium.dimensions.length);
  const width = Number(aquarium.dimensions.width);
  const height = Number(aquarium.dimensions.height);
  if (![length, width, height].every(Number.isFinite)) return 0;
  return Math.round((length * width * height * 0.85) / 1000);
};

const getCurrentLivestock = (aquarium?: Aquarium | null) => (
  (aquarium?.fishes || [])
    .map((aqFish: AquariumFish) => ({ aqFish, fish: fishData.find(item => item.id === aqFish.fishId) }))
    .filter((item): item is { aqFish: AquariumFish; fish: FishType } => {
      if (!item.fish) return false;
      const lifeType = getLifeType(item.fish);
      return lifeType !== 'plant' && lifeType !== 'hardscape';
    })
);

const answerLabelMap: Record<StepDiagnosisAnswerValue, string> = {
  none: '没有',
  occasional: '偶尔',
  frequent: '经常',
  unknown: '不确定',
  mild: '有一点 / 轻微',
  obvious: '明显',
  small: '少量换水',
  large: '大量换水',
  yes: '有',
};

const answerLabelMapEn: Record<StepDiagnosisAnswerValue, string> = {
  none: 'No',
  occasional: 'Occasionally',
  frequent: 'Frequently',
  unknown: 'Not sure',
  mild: 'Mild',
  obvious: 'Obvious',
  small: 'Small water change',
  large: 'Large water change',
  yes: 'Yes',
};

const riskWeight: Record<StepDiagnosisResult['riskLevel'], number> = {
  low: 1,
  unknown: 2,
  medium: 3,
  high: 4,
};

export const getIssueGuidance = (issueType: StepDiagnosisIssue, isEn: boolean) => {
  const guidance: Record<StepDiagnosisIssue, {
    routineActions: string[];
    avoidActions: string[];
    observeItems: string[];
  }> = isEn ? {
    cloudy: {
      routineActions: ['Check filter flow and intake for blockage', 'Remove visible leftovers or decaying matter', 'Record water clarity and odor, then recheck in 24 hours'],
      avoidActions: ['Do not clean all filter media at once', 'Do not medicate before the cause is clear'],
      observeItems: ['Whether the water becomes cloudier or greener', 'Whether odor becomes stronger', 'Whether filter flow becomes weaker'],
    },
    gasping: {
      routineActions: ['Increase surface movement and verify filter output', 'Pause feeding and observe breathing for 2 hours', 'Recheck whether gasping spreads to more fish'],
      avoidActions: ['Do not add medication blindly', 'Do not switch off aeration while breathing is abnormal'],
      observeItems: ['Whether gasping continues', 'Whether more fish gather at the surface', 'Whether filter output remains stable'],
    },
    refusal: {
      routineActions: ['Remove uneaten food after 3 minutes', 'Keep temperature and lighting stable', 'Offer a smaller portion at the next feeding'],
      avoidActions: ['Do not keep adding different foods', 'Do not force-feed or medicate without other signs'],
      observeItems: ['Whether appetite returns at the next feeding', 'Whether refusal spreads to other fish', 'Whether feces or swimming changes'],
    },
    hiding: {
      routineActions: ['Reduce light and disturbance for 2 hours', 'Check for chasing and available hiding places', 'Recheck activity after the tank is quiet'],
      avoidActions: ['Do not repeatedly net or chase the fish', 'Do not rearrange the whole tank immediately'],
      observeItems: ['Whether the fish leaves hiding after lights dim', 'Whether chasing continues', 'Whether breathing or posture changes'],
    },
    aggression: {
      routineActions: ['Identify the chasing and affected fish', 'Add or rearrange one hiding barrier', 'Observe whether chasing decreases for 30 minutes'],
      avoidActions: ['Do not repeatedly chase all fish with a net', 'Do not add more fish before the conflict is clear'],
      observeItems: ['Whether the same fish is repeatedly targeted', 'Whether fins are damaged', 'Whether feeding access is blocked'],
    },
    death: {
      routineActions: ['Remove the deceased animal and inspect the tank', 'Increase aeration and check filter operation', 'Record whether any other livestock is abnormal'],
      avoidActions: ['Do not medicate the whole tank before checking acute causes', 'Do not perform repeated large water changes'],
      observeItems: ['Whether another death occurs', 'Whether multiple animals breathe rapidly', 'Whether odor or cloudiness worsens'],
    },
    shrimpDeath: {
      routineActions: ['Remove the deceased shrimp and inspect molts', 'Check recent water change and medication history', 'Keep temperature and water conditions stable'],
      avoidActions: ['Do not use copper medication or unknown algaecide', 'Do not make another large water change immediately'],
      observeItems: ['Whether shrimp deaths continue', 'Whether molts fail', 'Whether other shrimp become inactive'],
    },
    plantProblem: {
      routineActions: ['Remove badly decayed leaves', 'Check whether lighting duration changed recently', 'Photograph the same leaves and compare in 3 days'],
      avoidActions: ['Do not increase fertilizer and light at the same time', 'Do not replace all plants immediately'],
      observeItems: ['Whether new leaves remain healthy', 'Whether melting spreads', 'Whether algae increases'],
    },
  } : {
    cloudy: {
      routineActions: ['检查过滤出水和进水口是否通畅', '清理可见残饵和腐败物', '记录水体清澈度与气味，24 小时后复查'],
      avoidActions: ['不要一次性清洗全部滤材', '不要在原因未明时盲目下药'],
      observeItems: ['水体是否继续变浑或发绿', '异味是否加重', '过滤出水是否减弱'],
    },
    gasping: {
      routineActions: ['增加水面扰动并确认过滤正常出水', '暂停喂食，连续观察呼吸 2 小时', '复查是否有更多鱼只浮头'],
      avoidActions: ['不要盲目下药', '呼吸异常时不要关闭增氧'],
      observeItems: ['浮头或急促呼吸是否持续', '是否有更多鱼聚集水面', '过滤出水是否保持稳定'],
    },
    refusal: {
      routineActions: ['3 分钟后捞出未吃完的饲料', '保持水温和灯光稳定', '下次只投更少份量并观察'],
      avoidActions: ['不要连续追加不同饲料', '没有其他症状时不要强行喂食或下药'],
      observeItems: ['下一次投喂是否恢复食欲', '拒食是否扩大到其他鱼', '排泄和游动是否变化'],
    },
    hiding: {
      routineActions: ['降低灯光并减少打扰 2 小时', '检查是否被追咬以及躲避空间', '环境安静后再次观察活动'],
      avoidActions: ['不要反复追捞异常鱼只', '不要立即大幅重排整个鱼缸'],
      observeItems: ['弱光后是否离开躲藏处', '追咬是否持续', '呼吸或体态是否变化'],
    },
    aggression: {
      routineActions: ['确认追咬者和被追咬对象', '增加或调整一处遮挡和躲避区', '观察 30 分钟内追咬是否减少'],
      avoidActions: ['不要频繁追捞所有生物', '冲突未确认前不要继续加鱼'],
      observeItems: ['是否固定追咬同一对象', '鱼鳍是否出现损伤', '被追对象是否无法进食'],
    },
    death: {
      routineActions: ['移出死亡个体并检查缸内情况', '加强增氧并确认过滤正常运行', '记录是否还有其他生物异常'],
      avoidActions: ['急性原因未排查前不要全缸下药', '不要连续进行大比例换水'],
      observeItems: ['是否再次出现死亡', '是否多只生物呼吸急促', '异味或浑浊是否加重'],
    },
    shrimpDeath: {
      routineActions: ['移出死亡虾并检查蜕壳情况', '核对近期换水和用药记录', '保持水温和水体稳定'],
      avoidActions: ['不要使用含铜药物或不明除藻剂', '不要马上再次大比例换水'],
      observeItems: ['虾类是否继续死亡', '是否出现蜕壳失败', '其他虾是否停止活动'],
    },
    plantProblem: {
      routineActions: ['剪除严重腐烂的叶片', '确认近期光照时长是否变化', '拍下同一叶片，3 天后对比'],
      avoidActions: ['不要同时提高肥料和光照', '不要立即整缸更换水草'],
      observeItems: ['新叶是否保持健康', '烂叶是否继续扩散', '藻类是否增加'],
    },
  };
  return guidance[issueType];
};

const buildStepDiagnosisResult = ({
  aquarium,
  livestock,
  answers,
  issueType,
}: {
  aquarium: Aquarium | null;
  livestock: Array<{ aqFish: AquariumFish; fish: FishType }>;
  answers: StepDiagnosisAnswers;
  issueType: StepDiagnosisIssue;
}): StepDiagnosisResult => {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const volumeLiters = getTankVolumeLiters(aquarium);
  const hasShrimp = livestock.some(({ fish }) => /虾|shrimp|neocaridina|caridina/i.test(`${fish.name} ${fish.scientificName}`));
  const hasBetta = livestock.some(({ fish }) => /斗鱼|betta/i.test(`${fish.name} ${fish.scientificName}`));
  const livestockText = isEn
    ? (livestock.map(({ aqFish, fish }) => `${fish.scientificName || fish.name} x${aqFish.quantity || 1}`).join(', ') || 'No livestock')
    : (livestock.map(({ aqFish, fish }) => `${fish.name} x${aqFish.quantity || 1}`).join('、') || '暂无活体生物');
  
  const questionList = getStepDiagnosisQuestions(issueType, isEn);
  const labelMap = isEn ? answerLabelMapEn : answerLabelMap;

  const evidence = [
    ...(aquarium 
      ? [
          isEn ? `Active Tank: ${aquarium.name}` : `当前鱼缸：${aquarium.name}`, 
          isEn 
            ? `Water volume: ~${volumeLiters}L · ${aquarium.waterType === 'Saltwater' ? 'Saltwater' : 'Freshwater'} · ${aquarium.targetTemperature || 25}°C`
            : `当前水体：约 ${volumeLiters}L · ${aquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · ${aquarium.targetTemperature || 25}°C`
        ] 
      : [isEn ? 'No aquarium selected' : '未选择鱼缸']),
    isEn ? `Current Livestock: ${livestockText}` : `当前活体：${livestockText}`,
    ...questionList
      .filter(question => answers[question.id])
      .map(question => {
        const qText = question.question.replace(/[？?]$/, '');
        const aText = labelMap[answers[question.id] as StepDiagnosisAnswerValue];
        return `${qText}: ${aText}`;
      }),
  ];

  if (!aquarium) {
    return {
      riskLevel: 'unknown',
      riskLabel: isEn ? 'Insufficient Info' : '信息不足',
      conclusion: isEn ? 'Please select a tank first to perform diagnosis.' : '请先选择一个鱼缸，再进行诊断。',
      causes: [isEn ? 'Missing aquarium data' : '缺少鱼缸数据'],
      todayActions: [isEn ? 'Create or select an active aquarium first' : '先创建或选择当前鱼缸'],
      avoidActions: [isEn ? 'Do not judge fish condition without tank data' : '不要在没有鱼缸数据时判断鱼只状态'],
      observeItems: [isEn ? 'Complete tank volume, temperature, filter and livestock records' : '补充鱼缸容量、水温、过滤和活体记录'],
      evidence,
    };
  }

  if (livestock.length === 0 && issueType !== 'cloudy' && issueType !== 'plantProblem') {
    return {
      riskLevel: 'unknown',
      riskLabel: isEn ? 'Insufficient Info' : '信息不足',
      conclusion: isEn ? 'No livestock in the current tank to diagnose fish condition. Add livestock first or proceed with water/equipment checks.' : '当前鱼缸暂无活体生物，无法诊断鱼只状态。你可以先添加生物，或只查看水质/设备排查建议。',
      causes: [isEn ? 'No live records in the current tank' : '当前鱼缸没有真实活体记录'],
      todayActions: [
        isEn ? 'Verify filter, temperature, and water stability first' : '先确认鱼缸过滤、温度和水体是否稳定', 
        isEn ? 'If it is just cloudy water or equipment issues, continue checking water quality' : '如果只是水浑或设备异常，可以继续按水质方向排查'
      ],
      avoidActions: [
        isEn ? 'Do not apply fish disease advice to empty tanks' : '不要套用不存在生物的疾病建议', 
        isEn ? 'Do not diagnose fish disease without live records' : '不要在没有活体记录时判断鱼病'
      ],
      observeItems: [
        isEn ? 'Is the filter outputting water normally?' : '过滤是否正常出水', 
        isEn ? 'Is the water cloudy or smelly?' : '水体是否浑浊或有异味', 
        isEn ? 'Is the temperature stable?' : '温度是否稳定'
      ],
      evidence,
    };
  }

  if (issueType === 'shrimpDeath' && !hasShrimp) {
    return {
      riskLevel: 'unknown',
      riskLabel: isEn ? 'Insufficient Info' : '信息不足',
      conclusion: isEn ? 'No shrimp records in the current tank, cannot generate shrimp death diagnosis.' : '当前鱼缸没有虾类记录，无法生成虾类死亡诊断。',
      causes: [isEn ? 'No shrimp in current livestock' : '当前活体中没有虾类'],
      todayActions: [
        isEn ? 'Confirm if the correct tank was selected' : '先确认是否选错鱼缸', 
        isEn ? 'If you have shrimp, add them to the tank record first' : '如果实际有虾，请先把虾类添加到当前鱼缸记录'
      ],
      avoidActions: [
        isEn ? 'Do not apply shrimp molting or copper risk judgments to tanks without shrimp' : '不要套用虾类蜕壳或铜药风险判断到没有虾的鱼缸'
      ],
      observeItems: [
        isEn ? 'Are current live records complete?' : '当前真实活体是否完整记录', 
        isEn ? 'Is the water smelly or cloudy?' : '水体是否有异味或浑浊'
      ],
      evidence,
    };
  }

  const issueGuidance = getIssueGuidance(issueType, isEn);
  const causes: string[] = [];
  const actions: string[] = [];
  const avoid: string[] = [...issueGuidance.avoidActions];
  const observe: string[] = [...issueGuidance.observeItems];
  let riskLevel: StepDiagnosisResult['riskLevel'] = 'low';
  const liftRisk = (next: StepDiagnosisResult['riskLevel']) => {
    if (riskWeight[next] > riskWeight[riskLevel]) riskLevel = next;
  };

  if (answers.gasping === 'frequent') {
    liftRisk('high');
    causes.push(isEn ? 'Suspected oxygen depletion, water parameter stress, or filter issue' : '疑似缺氧、水质刺激或过滤出水异常');
    actions.push(
      isEn ? 'Increase aeration or surface disturbance immediately' : '立即增加打氧或水面扰动', 
      isEn ? 'Check if filter is running normally' : '检查过滤器是否正常出水', 
      isEn ? 'Stop feeding for 12-24 hours' : '暂停喂食 12-24 小时'
    );
  } else if (answers.gasping === 'occasional') {
    liftRisk('medium');
    causes.push(isEn ? 'Possible mild oxygen depletion or temporary stress' : '可能存在轻微缺氧或短期应激');
    actions.push(
      isEn ? 'Increase surface agitation or turn on air pump temporarily' : '增加水面扰动或短时打氧', 
      isEn ? 'Check if filter is running normally' : '检查过滤器是否正常出水'
    );
  }

  if (answers.cloudyWater === 'obvious') {
    liftRisk('medium');
    causes.push(isEn ? 'Possible water quality deterioration or organic pollution' : '可能存在水质恶化或有机物污染');
    actions.push(
      isEn ? 'Remove visible uneaten food or debris' : '捞出明显残饵或腐败物', 
      isEn ? 'Perform a 20%-30% partial water change' : '少量换水 20%-30%'
    );
    avoid.push(isEn ? 'Do not add heavy medication and clean filter media at the same time' : '不要同时大量下药和清洗滤材');
    observe.push(isEn ? 'Monitor for worsening odor or mortalities' : '是否出现异味加重或死亡个体');
  } else if (answers.cloudyWater === 'mild') {
    liftRisk('medium');
    causes.push(isEn ? 'Mild water changes from uneaten food, feeding or bacteria fluctuations' : '可能是残饵、投喂或硝化波动造成的轻微水质变化');
    actions.push(
      isEn ? 'Reduce current feeding portions' : '减少本次投喂量', 
      isEn ? 'Clean visible uneaten food' : '清理可见残饵'
    );
  }

  if (answers.recentWaterChange === 'large') {
    liftRisk('medium');
    causes.push(isEn ? 'Possible temperature or water parameter shock after large water change' : '可能存在大比例换水后的水温或水质刺激');
    actions.push(isEn ? 'Keep temp stable and observe for 2-4 hours' : '保持水温稳定，先观察 2-4 小时');
    avoid.push(isEn ? 'Do not perform another large water change immediately' : '不要马上再次大比例换水');
  } else if (answers.recentWaterChange === 'small') {
    causes.push(isEn ? 'Recent small water changes are low risk, check temp differences' : '近期少量换水通常不是主要风险，但仍需确认温差');
  }

  if (answers.recentNewLivestock === 'yes') {
    liftRisk('medium');
    causes.push(isEn ? 'Possible stress from new arrivals or compatibility pressure' : '可能存在新生物入缸应激或混养压力');
    actions.push(isEn ? 'Reduce disturbance, observe under dim light for 24 hours' : '减少打扰，弱光观察 24 小时');
    observe.push(isEn ? 'Check if new additions are chased or refusing food' : '新加入个体是否被追咬或拒食');
  }

  if (answers.abnormalBehavior === 'obvious') {
    liftRisk('high');
    causes.push(isEn ? 'Evident refusal of food, hiding or death. Increase processing priority' : '已经出现明显拒食、躲藏或死亡，需要提高处理优先级');
    actions.push(isEn ? 'Record abnormal individuals, isolate if necessary' : '记录异常个体，必要时隔离观察');
    observe.push(isEn ? 'Check for dead individuals' : '是否出现死亡个体');
  } else if (answers.abnormalBehavior === 'mild') {
    liftRisk('medium');
    causes.push(isEn ? 'Mild behavioral abnormalities, monitor to see if it spreads' : '有轻微行为异常，需要继续观察是否扩大到多条生物');
  }

  if (issueType === 'aggression') {
    causes.push(hasBetta 
      ? (isEn ? 'Betta present in current tank, monitor territorial pressure' : '当前鱼缸存在斗鱼，需额外关注领地压力') 
      : (isEn ? 'Possible territorial or space competition' : '可能存在领地或空间竞争'));
    actions.push(isEn ? 'Add plants, driftwood, or rocks for hiding spots' : '增加水草、沉木或石缝作为躲避区');
    avoid.push(isEn ? 'Do not chase and net livestock repeatedly' : '不要频繁追捞所有生物');
  }

  if (hasShrimp && ['shrimpDeath', 'cloudy'].includes(issueType)) {
    causes.push(isEn ? 'Shrimp present, they are highly sensitive to parameter shifts and copper' : '当前鱼缸有虾类，虾对水质波动和药物更敏感');
    avoid.push(isEn ? 'Do not use copper-based medication or algicides' : '不要使用含铜药物或不明除藻剂');
    observe.push(isEn ? 'Monitor for continuous deaths or failed molts' : '是否出现连续死亡或蜕壳失败');
  }

  const unknownCount = questionList.filter(question => answers[question.id] === 'unknown').length;
  const unknownThreshold = Math.max(1, Math.ceil(questionList.length * 0.67));
  if (unknownCount >= unknownThreshold) {
    liftRisk('unknown');
    causes.push(isEn ? 'High amount of unsure answers in current session' : '当前回答中不确定信息较多');
    actions.push(isEn ? 'Observe for 2-4 hours, verify water change, feeding, and water stats' : '先观察 2-4 小时，并补充水质、换水和喂食信息');
  }

  const resolvedRiskLevel = riskLevel as StepDiagnosisResult['riskLevel'];
  const riskLabel = resolvedRiskLevel === 'high' 
    ? (isEn ? 'High Risk' : '高风险') 
    : resolvedRiskLevel === 'medium' 
      ? (isEn ? 'Medium Risk' : '中风险') 
      : resolvedRiskLevel === 'unknown' 
        ? (isEn ? 'Insufficient Info' : '信息不足') 
        : (isEn ? 'Low Risk' : '低风险');
  
  const conclusion = resolvedRiskLevel === 'high'
    ? (isEn ? 'Conclusion: Significant risk detected. Prioritize oxygenation, filtration, and water parameters.' : '初步判断：存在较明显风险，优先处理供氧、过滤和水质。')
    : resolvedRiskLevel === 'medium'
      ? (isEn ? 'Conclusion: Possible mild oxygen depletion, parameter swing, or short-term stress.' : '初步判断：可能存在轻微缺氧、水质波动或短期应激。')
      : resolvedRiskLevel === 'unknown'
        ? (isEn ? 'Insufficient data. Recommended to check temperature, water quality first.' : '当前信息不足，建议先补充观察和水质信息。')
        : (isEn ? 'Conclusion: No significant high risk detected. Keep observing.' : '初步判断：暂未发现明显高风险，先轻量观察。');

  return {
    riskLevel: resolvedRiskLevel,
    riskLabel,
    conclusion,
    causes: Array.from(new Set(causes.length > 0
      ? causes
      : [resolvedRiskLevel === 'unknown'
          ? (isEn ? 'Key observations are still missing' : '关键观察信息尚未确认')
          : (isEn ? 'No obvious abnormal signal in the current answers' : '本次回答暂未发现明显异常信号')]
    )).slice(0, 5),
    todayActions: Array.from(new Set(actions.length > 0 ? actions : issueGuidance.routineActions)).slice(0, 5),
    avoidActions: Array.from(new Set(avoid)).slice(0, 5),
    observeItems: Array.from(new Set(observe)).slice(0, 5),
    evidence: Array.from(new Set(evidence)).slice(0, 8),
  };
};

export default function CareEncyclopedia() {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const navigate = useNavigate();

  const categoryChips: Array<{ id: CareCategoryId; label: string }> = [
    { id: 'all', label: t('care.categories.all') },
    { id: 'fish_health', label: t('care.categories.sick_fish') },
    { id: 'water_quality', label: t('care.categories.water_bad') },
    { id: 'new_stock', label: t('care.categories.new_stock') },
    { id: 'feeding', label: t('care.categories.feeding') },
    { id: 'maintenance', label: t('care.categories.maintenance') },
    { id: 'breeding', label: t('care.categories.breeding') },
    { id: 'death', label: t('care.categories.death') },
    { id: 'equipment', label: t('care.categories.equipment') },
  ];
  const getCategoryLabel = (categoryId: CareCategoryId) => (
    categoryChips.find(item => item.id === categoryId)?.label || categoryId
  );

  const localizedCategoryEntrances = useMemo(() => [
    { id: 'water_quality' as CareCategoryId, label: t('care.categories.water_bad'), icon: Droplets, hint: isEn ? 'Cloudy / Odor / Parameter' : '水浑 / 异味 / 波动' },
    { id: 'new_stock' as CareCategoryId, label: t('care.categories.new_stock'), icon: Stethoscope, hint: isEn ? 'Acclimation / Quarantine / Stocking' : '过水 / 检疫 / 放养' },
    { id: 'fish_health' as CareCategoryId, label: t('care.categories.sick_fish'), icon: Fish, hint: isEn ? 'Gasping / Refusal / Disease' : '浮头 / 拒食 / 体表' },
    { id: 'equipment' as CareCategoryId, label: t('care.categories.equipment'), icon: Settings, hint: isEn ? 'Filter / Aeration / Light' : '过滤 / 打氧 / 灯光' },
    { id: 'breeding' as CareCategoryId, label: t('care.categories.breeding'), icon: Baby, hint: isEn ? 'Spawning / First Feed / Divide' : '繁殖 / 开口 / 隔离' },
    { id: 'maintenance' as CareCategoryId, label: t('care.categories.maintenance'), icon: Waves, hint: isEn ? 'Water Change / Feed / Clean' : '换水 / 喂食 / 清洁' },
  ], [t, isEn]);

  const localizedSceneEntrances = useMemo(() => [
    { id: 'new_stock' as CareCategoryId, label: t('care.categories.new_stock'), subtitle: isEn ? 'Acclimation / Stocking' : '过水 / 放养' },
    { id: 'water_quality' as CareCategoryId, label: t('care.categories.water_bad'), subtitle: isEn ? 'Cloudy / Odor' : '浑水 / 异味' },
    { id: 'breeding' as CareCategoryId, label: t('care.categories.breeding'), subtitle: isEn ? 'Spawning / Hatching' : '产卵 / 孵化' },
    { id: 'equipment' as CareCategoryId, label: t('care.categories.equipment'), subtitle: isEn ? 'Cleaning / Maintenance' : '清洗 / 保养' },
    { id: 'fish_health' as CareCategoryId, label: t('care.categories.sick_fish'), subtitle: isEn ? 'Gasping / Refusal / Death' : '浮头 / 拒食 / 死鱼' },
  ], [t, isEn]);

  const localizedHighFrequencyFilters = useMemo(() => [
    { id: 'all' as CareCategoryId, label: t('care.categories.all') },
    { id: 'beginner' as CareCategoryId, label: isEn ? 'Beginner Guides' : '新手必看' },
    { id: 'water_quality' as CareCategoryId, label: t('care.categories.water_bad') },
    { id: 'fish_health' as CareCategoryId, label: t('care.categories.sick_fish') },
    { id: 'feeding' as CareCategoryId, label: t('care.categories.feeding') },
    { id: 'equipment' as CareCategoryId, label: t('care.categories.equipment') },
  ], [t, isEn]);

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case '科普了解': return t('care.urgency.info');
      case '入缸前准备': return t('care.urgency.pre_stock');
      case '观察为主': return t('care.urgency.observation');
      case '阶段护理': return t('care.urgency.stage');
      case '建议尽快处理': return t('care.urgency.soon');
      case '需要立即处理': return t('care.urgency.immediate');
      case '谨慎操作': return t('care.urgency.caution');
      default: return urgency;
    }
  };

  const getActionLevelText = (level: string) => {
    switch (level) {
      case '日常学习': return t('care.actionLevel.learning');
      case '操作指南': return t('care.actionLevel.guide');
      case '建议关注': return t('care.actionLevel.watch');
      case '立即排查': return t('care.actionLevel.check');
      default: return level;
    }
  };
  const location = useLocation();
  const { captureContext, navigateToRoute, navigateToSection, restoreContext } = useWorkspaceNavigation();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CareCategoryId>('all');
  const [highFrequencyFilter, setHighFrequencyFilter] = useState<CareCategoryId>('all');
  const [careWorkspacePage, setCareWorkspacePage] = useState<'home' | 'content'>('home');
  const [careResultPage, setCareResultPage] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<CareTopic | null>(null);
  const [checkedActions, setCheckedActions] = useState<string[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [careViewMode, setCareViewMode] = useState<CareViewMode>('all');
  const [carePresentationMode, setCarePresentationMode] = useState<CarePresentationMode>(() => (
    new URLSearchParams(location.search).get('mode') === 'browse' ? 'browse' : 'scene'
  ));
  const [favorites, setFavorites] = useState<CareFavoriteMap>(() => getCareFavorites());
  const [shareTopic, setShareTopic] = useState<CareTopic | null>(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [flyingFavorites, setFlyingFavorites] = useState<FlyingFavorite[]>([]);
  const recommendationCarouselRef = useRef<HTMLDivElement | null>(null);
  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const favoriteShelfRef = useRef<HTMLButtonElement | null>(null);
  const careSearchRef = useRef<HTMLElement | null>(null);
  const contentListRef = useRef<HTMLElement | null>(null);
  const detailNavigationContextRef = useRef<WorkspaceNavigationContext | null>(null);

  const appStateSnapshot = useMemo(() => loadAppStateFromStorage(), []);
  const activeAquarium = useMemo(() => (
    appStateSnapshot.aquariums.find(item => item.id === appStateSnapshot.currentAquariumId)
    || appStateSnapshot.aquariums[0]
    || null
  ), [appStateSnapshot]);
  const aquariumVolumeLiters = getTankVolumeLiters(activeAquarium);
  const aquariumSummary = activeAquarium
    ? (isEn
        ? `${aquariumVolumeLiters || 'Unset'}L · ${activeAquarium.targetTemperature || 25}°C · ${activeAquarium.waterType === 'Saltwater' ? 'Saltwater' : 'Freshwater'} · ${(activeAquarium.fishes || []).length} species stocked`
        : `${aquariumVolumeLiters || '未设'}L · ${activeAquarium.targetTemperature || 25}°C · ${activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · 已有 ${(activeAquarium.fishes || []).length} 种生物`)
    : (isEn ? 'No tank data loaded. Showing general care recommendations.' : '还没有当前鱼缸数据，先显示通用养护推荐');
  const careRecommendations = useMemo(() => getCareRecommendations(activeAquarium, careTopicsData), [activeAquarium]);
  const careSuggestionResult = useMemo(() => getSearchSuggestions({
    query: searchTerm,
    locale: isEn ? 'en' : 'zh-CN',
    scope: 'care',
    species: fishData,
    careTopics: careTopicsData,
  }), [isEn, searchTerm]);

  useEffect(() => {
    setCarePresentationMode(new URLSearchParams(location.search).get('mode') === 'browse' ? 'browse' : 'scene');
  }, [location.search]);

  const changeCarePresentation = (mode: CarePresentationMode) => {
    setCarePresentationMode(mode);
    const params = new URLSearchParams(location.search);
    if (mode === 'browse') params.set('mode', 'browse');
    else params.delete('mode');
    navigateToRoute(params.toString() ? `/care?${params.toString()}` : '/care');
  };

  useEffect(() => {
    if (!location.hash) return;
    if (new URLSearchParams(location.search).get('mode') !== 'browse') setCarePresentationMode('browse');
    if (location.hash === '#care-favorites') {
      setCareViewMode('favorites');
      setCareWorkspacePage('content');
      setSearchTerm('');
      setActiveCategory('all');
      setCareResultPage(0);
      void navigateToSection('care-results', { updateHash: false });
      return;
    }
    if (location.hash === '#care-content') {
      void navigateToSection('care-results', { updateHash: false });
      return;
    }
    if (location.hash === '#care-search' || location.hash === '#care-diagnosis') {
      void navigateToSection('care-search', { updateHash: false });
      return;
    }
    if (location.hash === '#care-recommendations') {
      void navigateToSection('care-recommendations', { updateHash: false });
    }
  }, [location.hash, location.search, navigateToSection]);

  useEffect(() => {
    const node = recommendationCarouselRef.current;
    if (!node || careRecommendations.length === 0) return;
    const normalizedIndex = activeBannerIndex % careRecommendations.length;
    const card = node.querySelectorAll<HTMLElement>('[data-care-recommend-card]')[normalizedIndex];
    if (!card) return;
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: 'smooth' });
  }, [activeBannerIndex, careRecommendations.length]);

  useEffect(() => subscribeToFavorites(() => {
    setFavorites(getCareFavorites());
  }), []);

  const goToBanner = (index: number) => {
    setActiveBannerIndex((index + careRecommendations.length) % Math.max(1, careRecommendations.length));
  };

  const handleSelectCareCategory = (categoryId: CareCategoryId) => {
    setActiveCategory(categoryId);
    setCareViewMode('all');
    setCareWorkspacePage('content');
    setCareResultPage(0);
    void navigateToSection('care-results', { updateHash: false });
  };

  const goToCareResultPage = (page: number) => {
    const nextPage = Math.max(0, Math.min(careResultPageCount - 1, page));
    setCareResultPage(nextPage);
    void navigateToSection('care-results', { updateHash: false });
  };

  const openCareDetail = (topicId: string, sourceId?: string, captureReturnContext = true) => {
    const topic = careTopicsData.find(item => item.id === topicId);
    if (!topic) return;
    if (captureReturnContext) {
      detailNavigationContextRef.current = captureContext(sourceId);
    }
    setSelectedTopic(topic);
    setCheckedActions([]);
    window.setTimeout(() => {
      detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    const topicId = new URLSearchParams(location.search).get('topic');
    if (!topicId || selectedTopic?.id === topicId) return;
    openCareDetail(topicId, undefined, false);
  }, [location.search, selectedTopic?.id]);

  const closeCareDetail = () => {
    setSelectedTopic(null);
    if (new URLSearchParams(location.search).has('topic')) {
      if (new URLSearchParams(location.search).get('source') === 'search') {
        navigate(-1);
        return;
      }
      navigateToRoute('/care');
      return;
    }
    const context = detailNavigationContextRef.current;
    detailNavigationContextRef.current = null;
    if (context) void restoreContext(context);
  };

  const launchFavoriteFly = (source?: HTMLElement) => {
    const target = favoriteShelfRef.current;
    if (!source || !target) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const flyItem = {
      id,
      startX: sourceRect.left + sourceRect.width / 2 - 12,
      startY: sourceRect.top + sourceRect.height / 2 - 12,
      endX: targetRect.left + targetRect.width / 2 - 12,
      endY: targetRect.top + targetRect.height / 2 - 12,
    };
    setFlyingFavorites(prev => [...prev, flyItem]);
    window.setTimeout(() => {
      setFlyingFavorites(prev => prev.filter(item => item.id !== id));
    }, 720);
  };

  const toggleFavorite = (topic: CareTopic, source?: HTMLElement) => {
    const isAdding = !favorites[topic.id];
    if (isAdding) launchFavoriteFly(source);
    const next = toggleCareFavorite({
      id: topic.id,
      title: getDisplayTitle(topic),
      favoritedAt: new Date().toISOString(),
    });
    setFavorites(next);
    showToast(isAdding ? '已收录到水族册' : '已从水族册移除');
    if (isAdding) {
      try {
        posthog.capture('care_article_favorited', { topic_id: topic.id });
      } catch (e) {}
    }
  };

  const filteredTopics = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return careTopicsData.filter(topic => {
      const matchesCategory = keyword ? true : matchesCareCategory(topic, activeCategory);
      const matchesView = careViewMode === 'all' || Boolean(favorites[topic.id]);
      const homeMeta = getCareHomeMeta(topic);
      const searchable = [
        getDisplayTitle(topic),
        topic.title,
        topic.category,
        ...homeMeta.topicTags,
        homeMeta.actionLevel,
        ...topic.keywords,
      ].join(' ').toLowerCase();
      return matchesView && matchesCategory && (!keyword || searchable.includes(keyword));
    });
  }, [activeCategory, careViewMode, favorites, searchTerm]);

  const careResultPageSize = 4;
  const careResultPageCount = Math.max(1, Math.ceil(filteredTopics.length / careResultPageSize));
  const currentCareResultPage = Math.min(careResultPage, careResultPageCount - 1);
  const pagedCareTopics = filteredTopics.slice(
    currentCareResultPage * careResultPageSize,
    currentCareResultPage * careResultPageSize + careResultPageSize,
  );

  useEffect(() => {
    setCareResultPage(0);
  }, [activeCategory, careViewMode, searchTerm]);

  const highFrequencyTopics = useMemo(() => {
    const baseIds = [
      'guide_new_fish_acclimation',
      'guide_water_deteriorate',
      'guide_safe_water_change',
      'guide_fish_death_action',
      'guide_fry_care',
      'guide_pregnant_care',
    ];
    const baseTopics = baseIds
      .map(id => careTopicsData.find(topic => topic.id === id))
      .filter((topic): topic is CareTopic => Boolean(topic));
    const expanded = [...baseTopics, ...careTopicsData]
      .filter((topic, index, list) => list.findIndex(item => item.id === topic.id) === index)
      .filter(topic => matchesCareCategory(topic, highFrequencyFilter));
    return expanded.length > 0 ? expanded : baseTopics;
  }, [highFrequencyFilter]);

  const activeHighFrequencyTopic = highFrequencyTopics[activeBannerIndex % Math.max(1, highFrequencyTopics.length)] || highFrequencyTopics[0];

  const recommendedTopics = useMemo(() => {
    const favoriteTopics = Object.keys(favorites)
      .map(id => careTopicsData.find(topic => topic.id === id))
      .filter((topic): topic is CareTopic => Boolean(topic))
      .slice(0, 1);
    const defaultTopics = [
      'guide_water_deteriorate',
      'guide_fish_gasping',
      'guide_new_fish_acclimation',
      'guide_safe_water_change',
    ]
      .map(id => careTopicsData.find(topic => topic.id === id))
      .filter((topic): topic is CareTopic => Boolean(topic));
    return [...favoriteTopics, ...defaultTopics]
      .filter((topic, index, list) => list.findIndex(item => item.id === topic.id) === index)
      .slice(0, 3);
  }, [favorites]);

  const currentCareScopeLabel = isEn
    ? (careViewMode === 'favorites' ? 'My Favorites' : activeCategory === 'all' ? 'All Topics' : getCategoryLabel(activeCategory))
    : (careViewMode === 'favorites' ? '我的收藏' : activeCategory === 'all' ? '全部问题' : getCategoryLabel(activeCategory));
  const favoriteCount = Object.keys(favorites).length;
  const careListTitle = isEn
    ? (searchTerm.trim()
        ? `Search: "${searchTerm.trim()}" (${filteredTopics.length} items)`
        : careViewMode === 'favorites'
          ? `My Favorites (${filteredTopics.length} items)`
          : activeCategory !== 'all'
            ? `${getCategoryLabel(activeCategory)} (${filteredTopics.length} items)`
            : 'Care Knowledge')
    : (searchTerm.trim()
        ? `搜索结果：“${searchTerm.trim()}” · 共 ${filteredTopics.length} 篇`
        : careViewMode === 'favorites'
          ? `我的收藏 · 共 ${filteredTopics.length} 篇`
          : activeCategory !== 'all'
            ? `${getCategoryLabel(activeCategory)} · 共 ${filteredTopics.length} 篇`
            : '养护知识');
  const careListSubtitle = isEn
    ? (searchTerm.trim()
        ? 'Filtered by title, summary, category, and keywords.'
        : careViewMode === 'favorites'
          ? 'Saved articles for quick reference.'
          : activeCategory !== 'all'
            ? `Current category: ${getCategoryLabel(activeCategory)}`
            : '')
    : (searchTerm.trim()
        ? ''
        : careViewMode === 'favorites'
          ? ''
          : activeCategory !== 'all'
            ? ''
            : '');

  const openPreview = (topic: CareTopic) => {
    const image = getCareImage(topic, isEn);
    if (!image) return;
    setPreviewImages([{ src: image, title: topic.title }]);
    setPreviewIndex(0);
    setIsPreviewOpen(true);
  };

  const toggleValue = (value: string, setter: (updater: (prev: string[]) => string[]) => void) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const copyShareText = async (topic: CareTopic) => {
    const text = buildCareCardCopyText(buildCareCard(topic));
    try {
      await copyPlainText(text);
      setCopyMessage(isEn ? 'Copied' : '已复制');
      window.setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setCopyMessage('复制失败，请手动长按复制');
    }
  };

  return (
    <div className="page-frame-wide care-workspace-shell min-w-0 overflow-x-hidden">
      <div className="care-workspace-grid flex min-w-0 flex-col gap-3 pb-4 md:pb-8">
      <section className="px-1 py-1 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[20px] font-black leading-tight text-ink">{t('care.title')}</h1>
          </div>
          <button
            type="button"
            ref={favoriteShelfRef}
            onClick={() => navigateToRoute(taskRoutes.collection.care)}
            className="shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-sm"
          >
            {t('care.savedCare')}{favoriteCount > 0 ? ` ${favoriteCount}` : ''}
            <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <section className="flex items-center justify-between gap-2 px-1" aria-label={isEn ? 'Care presentation' : '养护呈现方式'}>
        <div className="inline-flex rounded-full border border-emerald-900/10 bg-white/70 p-1 shadow-sm">
          <button type="button" aria-pressed={carePresentationMode === 'scene'} onClick={() => changeCarePresentation('scene')} className={`min-h-9 rounded-full px-3 text-[11px] font-black ${carePresentationMode === 'scene' ? 'bg-emerald-800 text-white' : 'text-ink/58'}`}>{isEn ? 'Interactive check' : '互动排查'}</button>
          <button type="button" aria-pressed={carePresentationMode === 'browse'} onClick={() => changeCarePresentation('browse')} className={`min-h-9 rounded-full px-3 text-[11px] font-black ${carePresentationMode === 'browse' ? 'bg-emerald-800 text-white' : 'text-ink/58'}`}>{isEn ? 'Browse guides' : '传统浏览'}</button>
        </div>
        <button type="button" onClick={() => navigateToRoute(taskRoutes.collection.care)} className="hidden min-h-11 rounded-full px-3 text-[11px] font-black text-emerald-800 hover:bg-white/70 md:inline-flex">{isEn ? 'Saved guides' : '养护收藏'}<ChevronRight className="ml-0.5 h-3.5 w-3.5" /></button>
      </section>

      {carePresentationMode === 'scene' && (
        <KnowledgeSceneExplorer
          isEn={isEn}
          onOpenTopic={(topicId, sourceId) => openCareDetail(topicId, sourceId)}
          onBrowseList={(query) => {
            if (query) setSearchTerm(query);
            changeCarePresentation('browse');
            setCareWorkspacePage('content');
            void navigateToSection('care-results', { updateHash: false });
          }}
        />
      )}

      <div className={carePresentationMode === 'browse' ? 'contents' : 'hidden'}>

      <section id="care-recommendations" className={`care-left-panel w-full min-w-0 max-w-full scroll-mt-4 overflow-hidden rounded-[20px] border border-white/80 bg-white p-3 shadow-sm ${(!searchTerm.trim() && careWorkspacePage === 'home') ? '' : 'hidden md:block'}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[16px] font-black text-ink">{t('care.recommendedTitle')}</div>
                <p className="mt-0.5 line-clamp-1 text-[11px] font-bold text-ink/45">{t('care.recommendedBasedOn')}{aquariumSummary}</p>
              </div>
            </div>
            <div
              ref={recommendationCarouselRef}
              className="app-scrollbar-hidden flex w-full min-w-0 max-w-full overflow-hidden"
            >
              {careRecommendations.map(({ topic, reason }, index) => (
                <button
                  key={topic.id}
                  id={`care-recommendation-${topic.id}`}
                  type="button"
                  data-care-recommend-card
                  onClick={() => openCareDetail(topic.id, `care-recommendation-${topic.id}`)}
                  className="grid w-full min-w-0 max-w-full shrink-0 basis-full grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-[18px] bg-emerald-50/45 p-2.5 md:grid-cols-[42%_1fr] md:gap-3"
                >
                  <span className="relative flex h-[112px] items-center justify-center overflow-hidden rounded-[16px] bg-white/70 md:h-[148px]">
                    <CareImage topic={topic} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 py-1 text-left">
                    {reason && <span className="block text-[10px] font-black text-emerald-700">{getRecommendationReasonLocalized(reason, isEn)}</span>}
                    <span className="mt-1 line-clamp-2 block text-[15px] font-black leading-tight text-ink md:text-[17px]">{getDisplayTitle(topic)}</span>
                    <span className="mt-1 line-clamp-2 block text-[11px] font-medium leading-relaxed text-ink/58 md:text-[12px]">{topic.summary}</span>
                    <span className="mt-1.5 inline-flex items-center text-[11px] font-black text-emerald-700">
                      {t('care.openGuide')} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-1.5">
              {careRecommendations.map((item, index) => (
                <button
                  key={item.topic.id}
                  type="button"
                  aria-label={isEn ? `Show recommendation ${index + 1}` : `切换到推荐 ${index + 1}`}
                  aria-current={activeBannerIndex % Math.max(1, careRecommendations.length) === index ? 'true' : undefined}
                  onClick={() => goToBanner(index)}
                  className="flex h-5 w-7 items-center justify-center rounded-full"
                >
                  <span className={`h-1.5 rounded-full transition-all ${activeBannerIndex % Math.max(1, careRecommendations.length) === index ? 'w-5 bg-emerald-700' : 'w-1.5 bg-ink/18'}`} />
                </button>
              ))}
            </div>
      </section>

      <section id="care-search" ref={careSearchRef} className="care-left-panel scroll-mt-4 rounded-[18px] border border-white/80 bg-white p-3 shadow-sm">
        <SearchAutocomplete
          value={searchTerm}
          suggestions={careSuggestionResult.suggestions}
          placeholder={t('care.searchPlaceholder')}
          inputLabel={t('care.searchPlaceholder')}
          submitLabel={isEn ? 'Search' : '搜索'}
          viewDetailsLabel={t('searchPage.viewDetails')}
          reselectLabel={t('searchPage.chooseAgain')}
          speciesGroupLabel={t('searchPage.speciesCandidates')}
          careGroupLabel={t('searchPage.careCandidates')}
          relatedGroupLabel={t('searchPage.relatedSearches')}
          filterGroupLabel={t('searchPage.filterSuggestions')}
          ownedLabel={quantity => t('searchPage.ownedQuantity', { count: quantity })}
          compact
          onValueChange={value => {
            setSearchTerm(value);
            setCareWorkspacePage(value.trim() ? 'content' : careWorkspacePage);
            setCareResultPage(0);
          }}
          onSelectSuggestion={suggestion => {
            if (suggestion.kind === 'care' && suggestion.targetId) {
              setSearchTerm(suggestion.query);
              openCareDetail(suggestion.targetId, `care-suggestion-${suggestion.targetId}`);
              return;
            }
            setSearchTerm(suggestion.query);
            setCareWorkspacePage('content');
            setCareResultPage(0);
            void navigateToSection('care-results', { updateHash: false });
          }}
          onSubmit={value => {
            setSearchTerm(value);
            setCareWorkspacePage('content');
            setCareResultPage(0);
            void navigateToSection('care-results', { updateHash: false });
          }}
        />
      </section>

      <section id="care-categories" className={`${searchTerm.trim() ? 'hidden md:block' : ''} care-left-panel min-w-0 scroll-mt-4 rounded-[18px] border border-white/80 bg-white p-3 shadow-sm`}>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0 text-[15px] font-black text-ink">{isEn ? 'What do I want to handle now?' : '我现在想处理什么？'}</div>
            {(activeCategory !== 'all' || careViewMode !== 'all') && <button type="button" onClick={() => { setActiveCategory('all'); setCareViewMode('all'); setCareResultPage(0); }} className="min-h-11 shrink-0 rounded-full px-3 text-xs font-black text-emerald-700 hover:bg-emerald-50">{isEn ? 'Clear all' : '清除全部'}</button>}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
            {localizedCategoryEntrances.map(item => {
              const Icon = item.icon;
              const selected = activeCategory === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  data-care-category={item.id}
                  onClick={() => handleSelectCareCategory(item.id)}
                  className={`grid min-h-[76px] grid-cols-[28px_1fr] items-center gap-2 rounded-[16px] border px-3 py-2 text-left transition-colors ${
                    selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-border/70 bg-bg/70 text-ink/68 hover:border-emerald-100 hover:bg-emerald-50/45'
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-black leading-tight">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] font-bold leading-tight opacity-55">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
      </section>

      <section id="care-results" ref={contentListRef} data-care-result-count={filteredTopics.length} className="care-results-panel scroll-mt-4 grid min-w-0 grid-cols-1 gap-3">
        <div className={`${!searchTerm.trim() && careViewMode === 'all' && activeCategory === 'all' ? 'hidden md:block' : ''} px-1 py-1 md:rounded-[18px] md:border md:border-white/80 md:bg-white md:px-4 md:py-3 md:shadow-sm`}>
          <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-black text-ink">
              {careListTitle}
            </div>
            <div className="mt-0.5 text-[11px] font-bold text-ink/45">{careListSubtitle}</div>
          </div>
          {(activeCategory !== 'all' || searchTerm.trim() || careViewMode === 'favorites') && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setCareViewMode('all');
                setSearchTerm('');
                setCareWorkspacePage('home');
              }}
              className="shrink-0 rounded-full bg-bg px-3 py-1.5 text-[11px] font-black text-emerald-700"
            >
              {searchTerm.trim() ? (isEn ? 'Clear Search' : '清空搜索') : careViewMode === 'favorites' ? (isEn ? 'View All' : '查看全部') : (isEn ? 'Clear Filters' : '清除筛选')}
            </button>
          )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {pagedCareTopics.map(topic => (
            <CareArticleCard
              key={topic.id}
              topic={topic}
              favorite={Boolean(favorites[topic.id])}
              onClick={() => openCareDetail(topic.id, `care-article-${topic.id}`)}
              onToggleFavorite={(source) => toggleFavorite(topic, source)}
            />
          ))}
        </div>
        {filteredTopics.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-border bg-white p-8 text-center text-sm font-bold text-ink/50">
            {careViewMode === 'favorites'
              ? (isEn ? 'No saved care guides yet. Tap the heart icon in the top right of a guide to add it here.' : '还没有收藏的养护问题。看到常用问题时，点文章右上角爱心就会加入这里。')
              : (isEn ? 'No related guides found. Try searching for: cloudy water, gasping, acclimation, water change.' : '没有找到相关内容，可以试试：水浑、浮头、过水、换水、死鱼。')}
          </div>
        )}
        {filteredTopics.length > careResultPageSize && (
          <div className="flex items-center justify-center gap-2 rounded-[18px] bg-white/80 px-3 py-3 shadow-sm">
            <button
              type="button"
              disabled={currentCareResultPage === 0}
              onClick={() => goToCareResultPage(currentCareResultPage - 1)}
              className="h-9 rounded-full border border-border bg-white px-4 text-[12px] font-black text-ink/65 disabled:opacity-35"
            >
              {isEn ? 'Prev' : '上一页'}
            </button>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-[12px] font-black text-emerald-800">
              {isEn ? `Page ${currentCareResultPage + 1} / ${careResultPageCount}` : `第 ${currentCareResultPage + 1} / ${careResultPageCount} 页`}
            </span>
            <button
              type="button"
              disabled={currentCareResultPage >= careResultPageCount - 1}
              onClick={() => goToCareResultPage(currentCareResultPage + 1)}
              className="h-9 rounded-full border border-border bg-white px-4 text-[12px] font-black text-ink/65 disabled:opacity-35"
            >
              {isEn ? 'Next' : '下一页'}
            </button>
          </div>
        )}
      </section>

      </div>

      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && closeCareDetail()}>
        <AdaptiveDetailContent>
          {selectedTopic && (
            <CareArticleDetail
              key={selectedTopic.id}
              topic={selectedTopic}
              scrollRef={detailScrollRef}
              checkedActions={checkedActions}
              favorite={Boolean(favorites[selectedTopic.id])}
              onToggleAction={(value) => toggleValue(value, setCheckedActions)}
              onToggleFavorite={(source) => toggleFavorite(selectedTopic, source)}
              onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}
              onOpenCareCard={() => setShareTopic(selectedTopic)}
              onPreview={() => openPreview(selectedTopic)}
              onSelectRelated={(topic) => openCareDetail(topic.id, undefined, false)}
              onOpenCollection={() => navigateToRoute(taskRoutes.collection.care)}
              onRestoreActions={setCheckedActions}
              activeAquarium={activeAquarium}
            />
          )}
        </AdaptiveDetailContent>
      </Dialog>

      {flyingFavorites.map(item => (
        <div
          key={item.id}
          className="aqua-favorite-fly pointer-events-none fixed z-[80] flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-lg ring-1 ring-rose-100"
          style={{
            left: item.startX,
            top: item.startY,
            '--favorite-dx': `${item.endX - item.startX}px`,
            '--favorite-dy': `${item.endY - item.startY}px`,
          } as CSSProperties & Record<'--favorite-dx' | '--favorite-dy', string>}
        >
          <Heart className="h-3.5 w-3.5 fill-current" />
        </div>
      ))}

      <style>{`
        @keyframes aquaFavoriteFly {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.72);
          }
          14% {
            opacity: 1;
            transform: translate3d(0, -8px, 0) scale(1.08);
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--favorite-dx), var(--favorite-dy), 0) scale(0.42);
          }
        }

        .aqua-favorite-fly {
          animation: aquaFavoriteFly 680ms cubic-bezier(0.2, 0.75, 0.24, 1) forwards;
        }

        .aqua-care-card-modal-body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .aqua-care-card-modal-body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {isPreviewOpen && (
        <Suspense fallback={null}>
          <ImagePreviewModal
            images={previewImages}
            index={previewIndex}
            open
            onClose={() => setIsPreviewOpen(false)}
            onIndexChange={setPreviewIndex}
          />
        </Suspense>
      )}


      <Dialog open={!!shareTopic} onOpenChange={(open) => {
        if (!open) {
          setShareTopic(null);
          setCopyMessage('');
        }
      }}>
        <DialogContent className="flex max-h-[82dvh] w-[min(480px,calc(100vw-32px))] max-w-[480px] flex-col overflow-hidden rounded-[28px] border-border bg-white p-0">
          {shareTopic && (
            <>
              <div className="shrink-0 border-b border-white bg-white px-4 py-3">
                <div className="text-[16px] font-black text-ink">{isEn ? 'Generate Care Card' : '生成养护卡'}</div>
                <div className="mt-0.5 text-[11px] font-bold text-ink/45">{isEn ? 'Extract key steps to generate a copyable mobile card.' : '提取关键步骤，生成可复制、可保存的移动端卡片。'}</div>
              </div>
              <div className="aqua-care-card-modal-body min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F4EC]/55 px-3 py-4">
                <CareShareCardPreview topic={shareTopic} />
                {copyMessage && (
                  <div className="mt-3 rounded-[14px] bg-white px-3 py-2 text-center text-[12px] font-bold text-emerald-700">
                    {copyMessage}
                  </div>
                )}
              </div>
              <div className="modalFooter sticky bottom-0 grid shrink-0 grid-cols-2 gap-2 border-t border-[#EEF2E8] bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyShareText(shareTopic)}
                  className="h-[52px] rounded-full text-[13px] font-black"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  {copyMessage === 'Copied' || copyMessage === '已复制' ? (isEn ? 'Copied' : '已复制') : (isEn ? 'Copy Text' : '复制文字')}
                </Button>
                              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function CareImage({ topic, className, showPreviewHint = false }: { topic: CareTopic; className: string; showPreviewHint?: boolean }) {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const Icon = categoryIconMap[topic.category] || HelpCircle;
  const image = getCareImage(topic, isEn);
  const visualSources = image ? getCareVisualSources(image) : null;
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[#F7F4EC] ${className}`}>
      {image ? (
        <>
          <ResilientImage src={visualSources?.thumbnail} srcSet={`${visualSources?.thumbnail} 480w, ${visualSources?.detail} 960w`} sizes="(max-width: 430px) 100vw, 520px" alt={topic.title} className="h-full w-full object-contain p-1.5" loading="lazy" decoding="async" />
          {showPreviewHint && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm">
              <Maximize2 className="h-3 w-3" />
              {isEn ? 'View Large' : '查看大图'}
            </span>
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700/45">
          <Icon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

function CareShareCardPreview({ topic }: { topic: CareTopic }) {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const careCard = buildCareCard(topic);
  return (
    <div
      data-care-share-card
      className="mx-auto w-full max-w-[420px] rounded-[28px] bg-[#FFFDF8] p-6 text-left shadow-[0_18px_46px_rgba(39,54,45,0.12)] ring-1 ring-[#F1E9D8]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-black text-emerald-800">{isEn ? 'AquaGuide Care Card' : 'AquaGuide 养护卡'}</div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{careCard.subtitle}</span>
      </div>
      <div className="mt-2 h-1 w-16 rounded-full bg-emerald-100" />

      <h2 className="mt-5 text-[24px] font-black leading-tight text-ink">{careCard.title}</h2>
      <p className="mt-2 text-[12px] font-medium leading-relaxed text-ink/56">{isEn ? 'A concise treatment card for the current situation.' : '一张给当前情况使用的简洁处理卡。'}</p>

      <section className="mt-5 rounded-[20px] bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
        <div className="text-[12px] font-black text-emerald-800">{t('aquarium.keyConclusion')}</div>
        <p className="mt-1 text-[13px] font-black leading-relaxed text-ink">{careCard.coreSummary}</p>
      </section>

      {careCard.doActions.length > 0 && (
        <CareCardSection title={isEn ? "Do First" : "先做"} tone="green">
          {careCard.doActions.map((item, index) => (
            <CareCardChecklistItem key={item.title} index={index + 1} title={item.title} />
          ))}
        </CareCardSection>
      )}

      {careCard.avoidActions.length > 0 && (
        <CareCardSection title={isEn ? "Avoid for Now" : "暂时避免"} tone="orange">
          {careCard.avoidActions.map((item, index) => (
            <CareCardChecklistItem key={item.title} index={index + 1} title={item.title} description={item.reason} />
          ))}
        </CareCardSection>
      )}

      {careCard.warningSigns.length > 0 && (
        <section className="mt-4 rounded-[20px] bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
          <div className="text-[12px] font-black text-amber-800">{isEn ? 'Warning Signs' : '异常提醒'}</div>
          <div className="mt-2 grid gap-2">
            {careCard.warningSigns.map(item => (
              <div key={item.sign} className="text-[11px] font-medium leading-relaxed text-ink/68">
                <span className="font-black text-amber-800">{item.sign}：</span>{item.action}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-4">
        <div className="text-[12px] font-black text-ink/62">{isEn ? 'Applicable Scenarios' : '适用场景'}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {careCard.suitableFor.map(tag => (
            <span key={tag} className="rounded-full bg-[#F4EFE3] px-2.5 py-1 text-[10px] font-black leading-relaxed text-ink/58">{tag}</span>
          ))}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between border-t border-[#F0E8D7] pt-3">
        <span className="text-[12px] font-black text-emerald-800">{careCard.source}</span>
        <span className="text-[10px] font-bold text-ink/35">aquaguide.local</span>
      </div>
    </div>
  );
}

function CareCardSection({ title, tone, children }: { title: string; tone: 'green' | 'orange'; children: ReactNode }) {
  return (
    <section className="mt-4">
      <div className={`text-[13px] font-black ${tone === 'green' ? 'text-emerald-800' : 'text-orange-800'}`}>{title}</div>
      <div className="mt-2 grid gap-2">
        <div className={`grid gap-2 rounded-[20px] px-3 py-3 ring-1 ${tone === 'green' ? 'bg-emerald-50/50 ring-emerald-100' : 'bg-orange-50/55 ring-orange-100'}`}>
          <div className="contents">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CareCardChecklistItem({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="grid grid-cols-[24px_1fr] gap-2 rounded-[15px] bg-white px-3 py-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-black text-white">{index}</span>
      <span className="min-w-0">
        <span className="block text-[12px] font-black leading-relaxed text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-[11px] font-medium leading-relaxed text-ink/58">{description}</span>}
      </span>
    </div>
  );
}

function CareArticleCard({
  topic,
  favorite,
  onClick,
  onToggleFavorite,
}: {
  topic: CareTopic;
  favorite: boolean;
  onClick: () => void;
  onToggleFavorite: (source: HTMLElement) => void;
}) {
  const { t } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  return (
    <article className="group relative overflow-hidden rounded-[20px] bg-white p-3 text-left shadow-sm ring-1 ring-border/70">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(event.currentTarget);
        }}
        className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/88 shadow-sm backdrop-blur-sm transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
          favorite ? 'text-rose-500' : 'text-ink/35'
        }`}
        aria-label={favorite ? (isEn ? 'Unsave' : '取消收藏') : (isEn ? 'Save' : '收藏百科')}
      >
        <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
      </button>
      <button id={`care-article-${topic.id}`} type="button" onClick={onClick} className="grid min-h-[132px] w-full grid-cols-[112px_1fr] gap-3 text-left transition-transform active:scale-[0.99] max-[360px]:grid-cols-1">
        <span data-care-card-image>
          <CareImage topic={topic} className="h-[112px] w-[112px] rounded-[16px] max-[360px]:h-[180px] max-[360px]:w-full" />
        </span>
        <span className="min-w-0 pr-8 max-[360px]:pr-0">
          <span className="line-clamp-2 block text-[15px] font-black leading-snug text-ink">{getDisplayTitle(topic)}</span>
          <span className="mt-1.5 line-clamp-2 block text-[12px] font-medium leading-relaxed text-ink/56">{topic.summary}</span>
          <span className="mt-2 inline-flex items-center text-[11px] font-black text-emerald-700">
            {t('care.openGuide')} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
          </span>
        </span>
      </button>
    </article>
  );
}

function StepDiagnosisPanel({
  topic,
  onScheduleFollowUp,
  followUpFeedback,
}: {
  topic: CareTopic;
  onScheduleFollowUp: () => void;
  followUpFeedback?: string;
}) {
  const { t } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const appState = useMemo(() => loadAppStateFromStorage(), []);
  const aquariums = appState.aquariums;
  const defaultAquariumId = appState.currentAquariumId || aquariums[0]?.id || '';
  const [diagnosisState, setDiagnosisState] = useState<StepDiagnosisState>(() => ({
    issueType: inferStepDiagnosisIssue(topic),
    currentStep: 1,
    questionIndex: 0,
    answers: {},
    targetAquariumId: defaultAquariumId,
    target: { scope: 'whole_tank', speciesIds: [] },
    result: null,
  }));
  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);

  useEffect(() => {
    setDiagnosisState({
      issueType: inferStepDiagnosisIssue(topic),
      currentStep: 1,
      questionIndex: 0,
      answers: {},
      targetAquariumId: defaultAquariumId,
      target: { scope: 'whole_tank', speciesIds: [] },
      result: null,
    });
    setIsResultDetailOpen(false);
  }, [defaultAquariumId, topic.id]);

  const targetAquarium = aquariums.find(item => item.id === diagnosisState.targetAquariumId) || aquariums[0] || null;
  const currentLivestock = useMemo(() => getCurrentLivestock(targetAquarium), [targetAquarium]);
  const scopeLivestock = useMemo(() => {
    const grouped = new Map<string, { fish: FishType; quantity: number }>();
    currentLivestock.forEach(item => {
      const existing = grouped.get(item.fish.id);
      const quantity = item.aqFish.quantity || 1;
      grouped.set(item.fish.id, existing
        ? { ...existing, quantity: existing.quantity + quantity }
        : { fish: item.fish, quantity });
    });
    return Array.from(grouped.values());
  }, [currentLivestock]);
  const requiresSpeciesScope = !['cloudy', 'plantProblem'].includes(diagnosisState.issueType);
  const scopedLivestock = useMemo(() => {
    if (!requiresSpeciesScope || diagnosisState.target.scope === 'whole_tank') return currentLivestock;
    const selectedIds = new Set(diagnosisState.target.speciesIds);
    return currentLivestock.filter(item => selectedIds.has(item.fish.id));
  }, [currentLivestock, diagnosisState.target.scope, diagnosisState.target.speciesIds, requiresSpeciesScope]);
  const diagnosisQuestions = useMemo(() => getStepDiagnosisQuestions(diagnosisState.issueType, isEn), [diagnosisState.issueType, isEn]);
  const answeredCount = diagnosisQuestions.filter(question => diagnosisState.answers[question.id]).length;
  const isResultStep = diagnosisState.currentStep === 2 && Boolean(diagnosisState.result);
  const isTargetReady = !requiresSpeciesScope
    || diagnosisState.target.scope === 'whole_tank'
    || diagnosisState.target.speciesIds.length > 0;
  const isReady = diagnosisQuestions.length > 0 && answeredCount === diagnosisQuestions.length && isTargetReady;
  
  const issuesList = isEn ? stepDiagnosisIssuesEn : stepDiagnosisIssues;
  const issueMeta = issuesList.find(item => item.id === diagnosisState.issueType) || issuesList[0];
  
  const resultScopeLabel = diagnosisState.target.scope === 'single_species'
    ? (scopedLivestock[0]?.fish.name || (isEn ? 'Selected species' : '所选生物'))
    : diagnosisState.target.scope === 'multiple_species'
      ? (isEn ? `${scopedLivestock.length} selected species` : `所选 ${scopedLivestock.length} 种生物`)
      : (targetAquarium?.name || (isEn ? 'Current aquarium' : '当前鱼缸'));
  const resultTone = diagnosisState.result?.riskLevel === 'high'
    ? {
      badge: 'bg-red-50 text-red-700',
      panel: 'border-red-100 bg-red-50/70',
      icon: 'bg-red-600 text-white',
    }
    : diagnosisState.result?.riskLevel === 'medium'
      ? {
        badge: 'bg-amber-50 text-amber-700',
        panel: 'border-amber-100 bg-amber-50/70',
        icon: 'bg-amber-500 text-white',
      }
      : diagnosisState.result?.riskLevel === 'unknown'
        ? {
          badge: 'bg-sky-50 text-sky-700',
          panel: 'border-sky-100 bg-sky-50/70',
          icon: 'bg-sky-600 text-white',
        }
        : {
          badge: 'bg-emerald-50 text-emerald-700',
          panel: 'border-emerald-100 bg-emerald-50/70',
          icon: 'bg-emerald-700 text-white',
        };

  const updateAnswer = (key: keyof StepDiagnosisAnswers, value: StepDiagnosisAnswerValue) => {
    setIsResultDetailOpen(false);
    setDiagnosisState(prev => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
      result: null,
    }));
  };

  const showResult = () => {
    if (!isReady) return;
    const result = buildStepDiagnosisResult({
      aquarium: targetAquarium,
      livestock: scopedLivestock,
      answers: diagnosisState.answers,
      issueType: diagnosisState.issueType,
    });
    setIsResultDetailOpen(false);
    setDiagnosisState(prev => ({ ...prev, currentStep: 2, result }));
  };

  const resetDiagnosis = () => {
    setIsResultDetailOpen(false);
    setDiagnosisState(prev => ({ ...prev, currentStep: 1, questionIndex: 0, answers: {}, result: null }));
  };

  return (
    <section className="mt-4 rounded-[22px] border border-emerald-100 bg-[#F8FCF8] p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[16px] font-black text-ink">{isEn ? 'Quick check' : '快速检查'}</div>
          <div className="mt-0.5 text-[11px] font-bold text-ink/45">
            {isResultStep ? (isEn ? 'Recommendations are ready' : '处理建议已生成') : (isEn ? `Answered ${answeredCount}/${diagnosisQuestions.length}` : `已回答 ${answeredCount}/${diagnosisQuestions.length}`)}
          </div>
        </div>
        {isResultStep && (
          <button
            type="button"
            onClick={resetDiagnosis}
            className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-sm"
          >
            {isEn ? 'Check again' : '重新检查'}
          </button>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all"
          style={{ width: `${isResultStep ? 100 : diagnosisQuestions.length > 0 ? (answeredCount / diagnosisQuestions.length) * 100 : 0}%` }}
        />
      </div>

      {!isResultStep && (
        <div className="mt-3 grid gap-3">
          <div className="rounded-[18px] bg-white p-3 shadow-sm">
            <div className="text-[12px] font-black text-ink">{isEn ? 'What do you mainly observe?' : '你主要看到了什么？'}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {issuesList.map(issue => {
                const selected = diagnosisState.issueType === issue.id;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setDiagnosisState(prev => ({
                      ...prev,
                      issueType: issue.id,
                      questionIndex: 0,
                      answers: {},
                      target: { scope: 'whole_tank', speciesIds: [] },
                      result: null,
                    }))}
                    className={`rounded-full border px-3 py-2 text-[11px] font-black transition-colors ${
                      selected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border bg-bg text-ink/58'
                    }`}
                    title={issue.description}
                  >
                    {issue.label}
                  </button>
                );
              })}
            </div>
          </div>

          {aquariums.length > 1 && (
            <div className="rounded-[18px] bg-white p-3 shadow-sm">
              <div className="text-[12px] font-black text-ink">{isEn ? 'Which aquarium to check?' : '检查哪个鱼缸？'}</div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {aquariums.map(aquarium => (
                  <button
                    key={aquarium.id}
                    type="button"
                    onClick={() => setDiagnosisState(prev => ({
                      ...prev,
                      targetAquariumId: aquarium.id,
                      target: { scope: 'whole_tank', speciesIds: [] },
                      result: null,
                    }))}
                    className={`min-h-11 shrink-0 rounded-full px-3 py-2 text-[11px] font-black ${
                      diagnosisState.targetAquariumId === aquarium.id ? 'bg-emerald-700 text-white' : 'bg-bg text-ink/55'
                    }`}
                  >
                    {aquarium.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {requiresSpeciesScope && scopeLivestock.length > 0 && (
            <div className="rounded-[18px] bg-white p-3 shadow-sm">
              <div className="text-[12px] font-black text-ink">{isEn ? 'Who shows this symptom?' : '哪些生物出现了这个情况？'}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 max-[420px]:grid-cols-1">
                {([
                  ['whole_tank', isEn ? 'Whole tank' : '全缸都这样'],
                  ['single_species', isEn ? 'One species' : '某一种生物'],
                  ['multiple_species', isEn ? 'Several species' : '多种生物'],
                ] as Array<[AssessmentScope, string]>).map(([scope, label]) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setDiagnosisState(prev => ({
                      ...prev,
                      target: { scope, speciesIds: [] },
                      result: null,
                    }))}
                    aria-pressed={diagnosisState.target.scope === scope}
                    className={`min-h-11 rounded-[14px] border px-3 py-2 text-[11px] font-black transition-colors ${
                      diagnosisState.target.scope === scope
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-border bg-bg text-ink/58'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {diagnosisState.target.scope !== 'whole_tank' && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-[360px]:grid-cols-1">
                  {scopeLivestock.map(item => {
                    const selected = diagnosisState.target.speciesIds.includes(item.fish.id);
                    return (
                      <button
                        key={item.fish.id}
                        type="button"
                        onClick={() => setDiagnosisState(prev => {
                          const isSelected = prev.target.speciesIds.includes(item.fish.id);
                          const speciesIds = prev.target.scope === 'single_species'
                            ? [item.fish.id]
                            : isSelected
                              ? prev.target.speciesIds.filter(id => id !== item.fish.id)
                              : [...prev.target.speciesIds, item.fish.id];
                          return { ...prev, target: { ...prev.target, speciesIds }, result: null };
                        })}
                        aria-pressed={selected}
                        className={`grid min-h-14 grid-cols-[44px_minmax(0,1fr)] items-center gap-2 rounded-[14px] border p-2 text-left transition-colors ${
                          selected ? 'border-emerald-700 bg-emerald-50' : 'border-border bg-bg'
                        }`}
                      >
                        <img
                          src={getSpeciesDisplayImage(item.fish)}
                          alt=""
                          className="h-11 w-11 rounded-[12px] bg-white object-contain"
                        />
                        <span className="min-w-0">
                          <span className="block break-words text-[12px] font-black text-ink">{item.fish.name}</span>
                          <span className="mt-0.5 block text-[10px] font-bold text-ink/45">{isEn ? `${item.quantity} in tank` : `缸内 ${item.quantity} 只`}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2">
            {diagnosisQuestions.map((question, index) => (
              <div key={question.id} className="rounded-[18px] bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-[11px] font-black text-emerald-700">{issueMeta.label}</div>
                    <div className="mt-0.5 text-[14px] font-black leading-relaxed text-ink">{question.question}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {question.options.map(option => {
                    const selected = diagnosisState.answers[question.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateAnswer(question.id, option.value)}
                        className={`rounded-full border px-3 py-2 text-[11px] font-black transition-colors ${
                          selected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border bg-bg text-ink/55'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={showResult}
            disabled={!isReady}
            className="h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800 disabled:bg-ink/15 disabled:text-ink/35"
          >
            {isReady
              ? (isEn ? 'View recommendations' : '查看处理建议')
              : !isTargetReady
                ? (isEn ? 'Select who shows the symptom' : '请先选择检查对象')
                : (isEn ? `${diagnosisQuestions.length - answeredCount} left` : `还差 ${diagnosisQuestions.length - answeredCount} 项`)}
          </Button>
        </div>
      )}

      {isResultStep && diagnosisState.result && (
        <section data-care-assessment-result className="mt-3 overflow-hidden rounded-[22px] border border-border bg-white shadow-sm">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-emerald-800">{isEn ? 'Check complete' : '检查完成'}</div>
                <h3 className="mt-0.5 text-[19px] font-black leading-tight text-ink">{diagnosisState.result.riskLabel}</h3>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-black ${resultTone.badge}`}>
                {issueMeta.label}
              </span>
            </div>

            <div className="mt-3 flex min-w-0 items-center gap-3 rounded-[16px] bg-bg px-3 py-2.5">
              <div className="flex shrink-0 -space-x-2">
                {scopedLivestock.slice(0, 3).map(item => (
                  <span key={item.fish.id} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                    <img src={getSpeciesDisplayImage(item.fish)} alt={item.fish.name} className="h-9 w-9 object-contain" />
                  </span>
                ))}
                {scopedLivestock.length === 0 && (
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full ${resultTone.icon}`}>
                    <Waves className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="break-words text-[12px] font-black text-ink">{resultScopeLabel}</div>
                <p className="mt-0.5 text-[11px] font-semibold leading-5 text-ink/58">{diagnosisState.result.conclusion}</p>
              </div>
            </div>

            <section className={`mt-3 rounded-[18px] border p-3 ${resultTone.panel}`} data-care-assessment-next>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${resultTone.icon}`}>
                  {diagnosisState.result.riskLevel === 'unknown'
                    ? <HelpCircle className="h-4 w-4" aria-hidden="true" />
                    : diagnosisState.result.riskLevel === 'low'
                      ? <Check className="h-4 w-4" aria-hidden="true" />
                      : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                </span>
                <h4 className="text-[13px] font-black text-ink">
                  {diagnosisState.result.riskLevel === 'unknown'
                    ? (isEn ? 'Confirm these details first' : '先确认这些信息')
                    : (isEn ? 'Do these steps now' : '现在按顺序做')}
                </h4>
              </div>
              <ol className="mt-3 grid gap-2">
                {diagnosisState.result.todayActions.slice(0, 3).map((action, index) => (
                  <li key={action} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 rounded-[13px] bg-white/85 px-2.5 py-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-800 shadow-sm">{index + 1}</span>
                    <span className="min-w-0 text-[12px] font-black leading-5 text-ink">
                      <span data-care-action-text>{action}</span>
                      <ActionEvidenceInline evidence={getCareActionEvidenceForText(topic, 'immediate', action, index)} isEn={isEn} />
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {diagnosisState.result.avoidActions[0] && (
              <section className="mt-3 rounded-[16px] bg-amber-50 px-3 py-2.5">
                <div className="text-[10px] font-black text-amber-800">{isEn ? 'Avoid for now' : '暂时不要'}</div>
                <p className="mt-1 text-[11px] font-bold leading-5 text-amber-950/72">{diagnosisState.result.avoidActions[0]}</p>
                <ActionEvidenceInline evidence={getCareActionEvidenceForText(topic, 'avoid', diagnosisState.result.avoidActions[0])} isEn={isEn} />
              </section>
            )}

            <section className="mt-3 rounded-[16px] bg-sky-50 px-3 py-2.5">
              <div className="text-[10px] font-black text-sky-800">{isEn ? 'Check again after handling' : '处理后复查'}</div>
              <p className="mt-1 text-[11px] font-bold leading-5 text-sky-950/68">
                {diagnosisState.result.observeItems[0] || (isEn ? 'Keep conditions stable and check whether the same symptom improves.' : '保持环境稳定，复查同一异常是否缓解。')}
              </p>
              <ActionEvidenceInline
                evidence={getCareActionEvidenceForText(
                  topic,
                  'recheck',
                  diagnosisState.result.observeItems[0] || (isEn ? 'Keep conditions stable and check whether the same symptom improves.' : '保持环境稳定，复查同一异常是否缓解。'),
                )}
                isEn={isEn}
              />
            </section>

            <button
              type="button"
              data-disclosure-purpose="secondary_evidence"
              aria-expanded={isResultDetailOpen}
              onClick={() => setIsResultDetailOpen(value => !value)}
              className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-[14px] border border-border px-3 text-left text-[11px] font-black text-ink/62"
            >
              <span>{isEn ? 'Why this result?' : '为什么是这个结果？'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isResultDetailOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {isResultDetailOpen && (
              <div className="mt-2 grid gap-2 rounded-[14px] bg-bg p-3">
                {diagnosisState.result.causes.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-ink/55">{isEn ? 'Possible reasons' : '可能原因'}</div>
                    <ul className="mt-1 grid gap-1">
                      {diagnosisState.result.causes.slice(0, 3).map(item => <li key={item} className="text-[11px] font-semibold leading-5 text-ink/68">· {item}</li>)}
                    </ul>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-ink/55">{isEn ? 'Based on' : '判断依据'}</div>
                  <ul className="mt-1 grid gap-1">
                    {diagnosisState.result.evidence.slice(0, 4).map(item => <li key={item} className="text-[11px] font-semibold leading-5 text-ink/68">· {item}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {diagnosisState.result.riskLevel === 'unknown' ? (
              <Button type="button" onClick={resetDiagnosis} className="mt-3 h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800">
                {isEn ? 'Complete Key Checks' : '补充关键检查'}
              </Button>
            ) : (
              <Button type="button" onClick={onScheduleFollowUp} className="mt-3 h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800">
                {isEn ? 'Set Follow-up Time' : '设置复查时间'}
              </Button>
            )}
            {followUpFeedback && (
              <div role="status" className="mt-2 rounded-[15px] bg-emerald-50 px-3 py-2.5 text-center text-[11px] font-black text-emerald-800">
                {followUpFeedback}
              </div>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

const translateTopicTag = (tag: string, isEn = false) => {
  if (!isEn) return tag;
  const map: Record<string, string> = {
    '新鱼入缸': 'New Stock',
    '水质异常': 'Water Quality',
    '鱼只异常': 'Fish Abnormalities',
    '鱼苗养护': 'Fry Care',
    '设备维护': 'Equipment',
    '混养冲突': 'Compatibility',
    '草缸配置': 'Planted Tank',
    '日常养护': 'Routine Care',
    '繁殖护理': 'Breeding Care',
  };
  return map[tag] || tag;
};

function ActionEvidenceInline({ evidence, isEn }: { evidence?: CareActionEvidence; isEn: boolean }) {
  if (!evidence || evidence.citations.length === 0) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5" data-care-action-evidence={evidence.id}>
      <span className="sr-only">{isEn ? 'Sources' : '来源'}</span>
      {evidence.citations.slice(0, 2).map(reference => (
        <a
          key={reference.id}
          href={reference.url}
          target="_blank"
          rel="noreferrer"
          title={`${reference.publisher} · ${reference.title}`}
          aria-label={isEn ? `Open source: ${reference.publisher}` : `打开来源：${reference.publisher}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          data-action-kind="external"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}

export function CareArticleDetail({
  topic,
  scrollRef,
  checkedActions,
  favorite,
  onToggleAction,
  onToggleFavorite,
  onOpenShare,
  onOpenCareCard,
  onPreview,
  onSelectRelated,
  onOpenCollection,
  onRestoreActions,
  activeAquarium,
}: {
  topic: CareTopic;
  scrollRef: RefObject<HTMLDivElement | null>;
  checkedActions: string[];
  favorite: boolean;
  onToggleAction: (value: string) => void;
  onToggleFavorite: (source: HTMLElement) => void;
  onOpenShare: () => void;
  onOpenCareCard?: () => void;
  onPreview: () => void;
  onSelectRelated: (topic: CareTopic) => void;
  onOpenCollection?: () => void;
  onRestoreActions?: (values: string[]) => void;
  activeAquarium: Aquarium | null;
}) {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const navigate = useNavigate();
  const meta = getCareGuideMeta(topic);
  const careGuide = buildCareGuide(topic);
  const careReferences = getCareReferences(topic);
  const careActionEvidence = getCareActionEvidence(topic);
  const immediateEvidence = careActionEvidence.filter(item => item.kind === 'immediate');
  const avoidEvidence = careActionEvidence.filter(item => item.kind === 'avoid');
  const followUpEvidence = careActionEvidence.find(item => item.kind === 'next')
    || careActionEvidence.find(item => item.kind === 'recheck');
  const visibleActions = careGuide.todayActions;
  const completedVisibleActions = checkedActions.filter(item => visibleActions.some(action => action.description === item)).length;
  const relatedTopics = getRelatedCareGuides(topic, careTopicsData, activeAquarium);
  const [ctaFeedback, setCtaFeedback] = useState('');
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isDiagnosisStarted, setIsDiagnosisStarted] = useState(false);
  const [isChecklistSaved, setIsChecklistSaved] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [reminderSheet, setReminderSheet] = useState<null | {
    title: string;
    options: string[];
    storageType: string;
    successMessage: string;
  }>(null);
  const [selectedReminderOption, setSelectedReminderOption] = useState('');
  const [isReminderSaving, setIsReminderSaving] = useState(false);
  const procedureSteps = meta.guideType === 'procedure' ? getProcedureSteps(topic) : [];
  const procedureReminders = meta.guideType === 'procedure' ? getProcedureReminders(topic) : [];
  const procedureDetails = meta.guideType === 'procedure' ? getProcedureDetails(topic) : careGuide.maintenanceTips;
  const isWaterChangeGuide = /换水/.test(`${getDisplayTitle(topic)} ${topic.title} ${topic.keywords.join(' ')}`);
  const isFilterGuide = /过滤|滤材|清洗/.test(`${getDisplayTitle(topic)} ${topic.title} ${topic.keywords.join(' ')}`);
  const isFryGuide = /鱼苗|开口|卵黄囊/.test(`${getDisplayTitle(topic)} ${topic.title} ${topic.keywords.join(' ')}`);

  useEffect(() => {
    setIsDiagnosisStarted(false);
    setIsDetailExpanded(false);
    setCtaFeedback('');
    setIsOperationCompleted(getCompletedCareOperations().some(item => item.id === topic.id));
    const savedChecklist = getSavedCareChecklists().find(item => item.id === topic.id);
    const restoredActions = savedChecklist
      ? visibleActions
          .map(action => action.description)
          .filter(description => savedChecklist.actions.some(saved => saved === description || saved.endsWith(`：${description}`)))
      : [];
    setIsChecklistSaved(restoredActions.length > 0);
    onRestoreActions?.(restoredActions);
  }, [onRestoreActions, topic.id]);
  const primaryCtaLabel = meta.guideType === 'procedure'
    ? isNewFishAcclimationTopic(topic)
      ? isOperationCompleted ? (isEn ? 'Completed Acclimation' : '已完成过水') : (isEn ? 'Mark Acclimation Done' : '标记已完成过水')
      : isWaterChangeGuide
        ? (isEn ? 'Record Water Change in Tank' : '去记录本次换水')
        : isOperationCompleted ? (isEn ? 'Marked Completed' : '已标记完成') : isFilterGuide ? (isEn ? 'Mark Cleaning Done' : '标记已完成清洗') : (isEn ? 'Mark Operation Done' : '标记已完成操作')
    : meta.guideType === 'careChecklist'
      ? isChecklistSaved
        ? (isEn ? `${completedVisibleActions} Items Saved` : `已保存 ${completedVisibleActions} 项`)
        : completedVisibleActions > 0
          ? (isEn ? `Save ${completedVisibleActions} Completed` : `保存已完成的 ${completedVisibleActions} 项`)
          : (isEn ? 'Check Completed Items First' : '先勾选已完成项目')
      : meta.guideType === 'diagnosis'
        ? (isEn ? 'Start Quick Assessment' : '开始快速评测')
        : meta.guideType === 'knowledge'
          ? favorite
            ? onOpenCollection
              ? (isEn ? 'View in Collection' : '去水族册查看')
              : (isEn ? 'Saved in Collection' : '已收藏在水族册')
            : (isEn ? 'Save Guide' : '收藏这篇指南')
          : (isEn ? 'Set Reminder' : '设置提醒');
  const isPrimaryDisabled = (meta.guideType === 'procedure' && isOperationCompleted && !isWaterChangeGuide)
    || (meta.guideType === 'careChecklist' && (isChecklistSaved || completedVisibleActions === 0))
    || (meta.guideType === 'knowledge' && favorite && !onOpenCollection);
  const secondaryLabel: string | null = meta.guideType === 'procedure'
    ? isNewFishAcclimationTopic(topic)
      ? (isEn ? 'Set 3-Day Observe Reminder' : '设置 3 天观察提醒')
      : isWaterChangeGuide
        ? (isEn ? 'Set Next Water Change' : '设置下次换水提醒')
        : null
    : meta.guideType === 'careChecklist'
      ? isFryGuide ? (isEn ? 'Set First Feed Reminder' : '设置开口喂食提醒') : (isEn ? 'Set Phase Care Reminder' : '设置阶段护理提醒')
      : null;

  const getScheduledFor = (label = '') => {
    const scheduled = new Date();
    const hourMatch = label.match(/(\d+)\s*(?:小时|hours?|h\b)/i);
    const dayMatch = label.match(/(\d+)\s*(?:天后|day)/i);
    if (hourMatch) scheduled.setHours(scheduled.getHours() + Number(hourMatch[1]));
    else if (/明天|tomorrow/i.test(label)) scheduled.setDate(scheduled.getDate() + 1);
    else scheduled.setDate(scheduled.getDate() + Number(dayMatch?.[1] || 1));
    return scheduled.toISOString();
  };

  const addReminder = async (label?: string, storageType: string = meta.guideType, successMessage?: string) => {
    if (isReminderSaving) return false;
    setIsReminderSaving(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      const reminder = await repository.updateCareReminder({ action: 'upsert', record: {
        sourceTopicId: topic.id,
        title: getDisplayTitle(topic),
        type: storageType,
        scheduledFor: getScheduledFor(label),
        aquariumId: activeAquarium?.id,
        label,
      } });
      if (!reminder) throw new Error(isEn ? 'The care reminder was not saved.' : '养护提醒没有保存成功。');
      const scheduledLabel = new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(reminder.scheduledFor));
      setCtaFeedback(`${successMessage || (isEn ? 'Reminder scheduled' : '提醒已设置')} · ${scheduledLabel}`);
      return true;
    } catch (error) {
      setCtaFeedback(isEn ? 'Could not save the reminder. Try again.' : '提醒保存失败，请重试。');
      return false;
    } finally {
      setIsReminderSaving(false);
      window.setTimeout(() => setCtaFeedback(''), 5000);
    }
  };

  const openReminderSheet = (kind: 'newFish' | 'waterChange' | 'stage' | 'fry' | 'general') => {
    const config = {
      newFish: {
        title: isEn ? 'Set New Fish Observe Reminder' : '设置新鱼观察提醒',
        options: isEn 
          ? ['Check condition after 24h', 'Confirm stability after 3 days', 'End quarantine after 7 days']
          : ['24 小时后检查状态', '3 天后确认是否稳定', '7 天后结束隔离观察'],
        storageType: 'new_fish_observation',
        successMessage: isEn ? 'New fish reminder scheduled' : '新鱼观察提醒已设置',
      },
      waterChange: {
        title: isEn ? 'Set Next Water Change Reminder' : '设置下次换水提醒',
        options: isEn
          ? ['Remind to check water after 3 days', 'Remind small water change after 7 days', 'Remind routine water change after 14 days']
          : ['3 天后提醒复查水质', '7 天后提醒小换水', '14 天后提醒例行换水'],
        storageType: 'water_change',
        successMessage: isEn ? 'Water change reminder scheduled' : '下次换水提醒已设置',
      },
      stage: {
        title: isEn ? 'Set Phase Care Reminder' : '设置阶段护理提醒',
        options: isEn
          ? ['Remind to check state tomorrow', 'Remind to observe after 3 days', 'Remind next phase after 7 days']
          : ['明天提醒复查状态', '3 天后提醒观察变化', '7 天后提醒进入下一阶段'],
        storageType: 'stage_care',
        successMessage: isEn ? 'Phase care reminder scheduled' : '阶段护理提醒已设置',
      },
      fry: {
        title: isEn ? 'Set First Feed Reminder' : '设置开口喂食提醒',
        options: isEn
          ? ['Check yolk sac after 12h', 'Try small feeding after 24h', 'Check fry status after 3 days']
          : ['12 小时后观察卵黄囊', '24 小时后少量试喂', '3 天后复查鱼苗状态'],
        storageType: 'fry_feeding',
        successMessage: isEn ? 'First feed reminder scheduled' : '开口喂食提醒已设置',
      },
      general: {
        title: isEn ? 'Set Care Reminder' : '设置养护提醒',
        options: isEn
          ? ['Remind to review tomorrow', 'Remind to observe after 3 days', 'Remind to review after 7 days']
          : ['明天提醒复查', '3 天后提醒观察', '7 天后提醒复盘'],
        storageType: 'care',
        successMessage: isEn ? 'Care reminder scheduled' : '养护提醒已设置',
      },
    }[kind];
    setReminderSheet(config);
    setSelectedReminderOption(config.options[0]);
  };

  const confirmReminder = async () => {
    if (!reminderSheet || isReminderSaving) return;
    const saved = await addReminder(selectedReminderOption, reminderSheet.storageType, reminderSheet.successMessage);
    if (saved) setReminderSheet(null);
  };

  const markOperationCompleted = (label: string) => {
    const completed = getCompletedCareOperations();
    const next = [
      { id: topic.id, title: getDisplayTitle(topic), label, aquariumId: activeAquarium?.id, completedAt: new Date().toISOString() },
      ...completed.filter(item => item.id !== topic.id),
    ].slice(0, 50);
    try {
      setCompletedCareOperations(next);
      setIsOperationCompleted(true);
      setCtaFeedback(
        label.includes('换水') || label.toLowerCase().includes('water')
          ? (isEn ? 'Water change logged' : '已记录本次换水') 
          : (isEn ? 'Marked completed' : '已标记完成')
      );
    } catch (error) {
      setCtaFeedback(isEn ? 'Could not save the operation. Try again.' : '操作记录保存失败，请重试。');
    }
    window.setTimeout(() => setCtaFeedback(''), 1800);
  };

  const saveChecklist = () => {
    const saved = getSavedCareChecklists();
    const next = [
      {
        id: topic.id,
        title: getDisplayTitle(topic),
        savedAt: new Date().toISOString(),
        actions: visibleActions
          .filter(action => checkedActions.includes(action.description))
          .map(action => action.description),
      },
      ...saved.filter(item => item.id !== topic.id),
    ].slice(0, 30);
    try {
      setSavedCareChecklists(next);
      setIsChecklistSaved(true);
      setCtaFeedback(
        isEn
          ? `${completedVisibleActions} completed item${completedVisibleActions === 1 ? '' : 's'} saved`
          : `已保存 ${completedVisibleActions} 项完成记录`
      );
    } catch (error) {
      setCtaFeedback(isEn ? 'Could not save the checklist. Try again.' : '护理清单保存失败，请重试。');
    }
    window.setTimeout(() => setCtaFeedback(''), 1800);
  };

  const handleSecondaryCta = () => {
    if (meta.guideType === 'procedure') {
      if (isNewFishAcclimationTopic(topic)) {
        openReminderSheet('newFish');
        return;
      }
      if (isWaterChangeGuide) {
        openReminderSheet('waterChange');
        return;
      }
      setIsDetailExpanded(prev => !prev);
      return;
    }
    if (meta.guideType === 'careChecklist') {
      openReminderSheet(isFryGuide ? 'fry' : 'stage');
      return;
    }
    if (meta.guideType === 'knowledge' && relatedTopics.length > 0) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      setCtaFeedback(isEn ? 'Related content below' : '相关内容在下方');
      window.setTimeout(() => setCtaFeedback(''), 1800);
      return;
    }
    setIsDetailExpanded(prev => !prev);
  };

  const handlePrimaryCta = (source: HTMLElement) => {
    if (meta.guideType === 'procedure') {
      if (isWaterChangeGuide) {
        navigate(taskRoutes.aquarium.waterChange);
        return;
      }
      if (isNewFishAcclimationTopic(topic)) {
        markOperationCompleted(isEn ? 'Acclimation completed' : '已完成过水');
        return;
      }
      markOperationCompleted(
        isWaterChangeGuide 
          ? (isEn ? 'Water change completed' : '已完成换水') 
          : isFilterGuide 
            ? (isEn ? 'Cleaning completed' : '已完成清洗') 
            : (isEn ? 'Operation completed' : '已完成操作')
      );
      return;
    }
    if (meta.guideType === 'careChecklist') {
      saveChecklist();
      return;
    }
    if (meta.guideType === 'diagnosis') {
      setIsDiagnosisStarted(true);
      window.requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 300, behavior: 'smooth' });
      });
      return;
    }
    if (meta.guideType === 'knowledge') {
      if (favorite) {
        onOpenCollection?.();
        return;
      }
      onToggleFavorite(source);
      setCtaFeedback(isEn ? 'Saved to library' : '已收录到水族册');
      return;
    }
    openReminderSheet('general');
  };

  const detailLead = meta.guideType === 'diagnosis'
    ? {
      label: isEn ? 'Assess first, then act' : '先做快速评测',
      text: isEn ? 'Answer only what you can observe. The result will show the exact steps to take.' : '只回答你能观察到的情况，结果会直接给出处理步骤。',
    }
    : meta.guideType === 'procedure'
      ? {
        label: isEn ? 'Follow the illustrated steps' : '跟着图示操作',
        text: careGuide.summary,
      }
      : meta.guideType === 'careChecklist'
        ? {
          label: isEn ? 'Care by stage' : '按阶段照料',
          text: isEn ? 'Complete the checklist in order, then schedule the next observation.' : '按顺序完成护理项，再安排下一次观察。',
        }
        : {
          label: isEn ? 'Key takeaway' : '先看结论',
          text: careGuide.summary,
        };

  return (
    <div className="flex max-h-[88vh] flex-col bg-white">
      <div ref={scrollRef} className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-[850px] p-4 pb-8 pt-7">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] md:items-stretch">
            <button type="button" onClick={onPreview} data-care-detail-hero className="order-2 block min-w-0 md:order-1" aria-label={isEn ? `View large image of ${topic.title}` : `查看${topic.title}大图`}>
              <CareImage topic={topic} className="h-[180px] w-full rounded-[20px] md:h-full md:min-h-[430px]" showPreviewHint />
            </button>

            <div className="order-1 min-w-0 md:order-2" data-care-first-screen>
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {meta.topicTags.map(tag => (
                  <span key={tag} className="rounded-full bg-bg px-2 py-1 text-[10px] font-black text-ink/50">{translateTopicTag(tag, isEn)}</span>
                ))}
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${urgencyTagClassMap[meta.urgencyTag]}`}>
                  {getUrgencyTagLabel(meta.urgencyTag, isEn)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <h2 className="min-w-0 flex-1 text-[22px] font-black leading-tight text-ink">{careGuide.title}</h2>
                <button
                  type="button"
                  onClick={(event) => onToggleFavorite(event.currentTarget)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                    favorite ? 'text-rose-500' : 'text-ink/35'
                  }`}
                  aria-label={favorite ? (isEn ? 'Unsave' : '取消收藏') : (isEn ? 'Save' : '收藏百科')}
                >
                  <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              <section className="mt-3 rounded-[18px] border border-emerald-100 bg-emerald-50/55 p-3.5">
                <div className="text-[12px] font-black text-emerald-800">{detailLead.label}</div>
                <p className="mt-1 text-[14px] font-black leading-relaxed text-ink">{detailLead.text}</p>
              </section>
              {meta.guideType === 'diagnosis' && !isDiagnosisStarted && (
                <Button
                  type="button"
                  data-care-first-screen-primary
                  onClick={(event) => handlePrimaryCta(event.currentTarget)}
                  className="mt-3 h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800"
                >
                  {isEn ? 'Start Quick Check' : '开始快速检查'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {meta.guideType === 'careChecklist' && visibleActions.length > 0 && (
                <section className="mt-3 rounded-[18px] border border-border bg-white p-3 shadow-sm" data-care-first-screen-checklist>
                  <div className="text-[12px] font-black text-ink">{isEn ? 'Start here' : '现在先做'}</div>
                  <div className="mt-2 grid gap-2">
                    {visibleActions.slice(0, 3).map((item, index) => (
                      <div key={`first-screen-${item.title}-${item.description}`} className="rounded-[15px] bg-bg/70 p-1">
                        <ActionStepCard
                          checked={checkedActions.includes(item.description)}
                          title={`${index + 1}. ${item.title}`}
                          description={item.description}
                          onClick={() => {
                            setIsChecklistSaved(false);
                            onToggleAction(item.description);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {visibleActions.length > 3 && (
                    <div className="mt-2 text-[10px] font-bold text-ink/45">
                      {isEn ? `${visibleActions.length - 3} more items below` : `下方还有 ${visibleActions.length - 3} 项`}
                    </div>
                  )}
                </section>
              )}
              {meta.guideType === 'knowledge' && visibleActions.length > 0 && (
                <section className="mt-3 rounded-[18px] border border-border bg-white p-3 shadow-sm" data-care-first-screen-key-points>
                  <div className="text-[12px] font-black text-ink">{isEn ? 'Key points' : '关键要点'}</div>
                  <div className="mt-2 grid gap-2">
                    {visibleActions.slice(0, 2).map((item, index) => (
                      <div key={`key-point-${item.title}-${item.description}`} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 rounded-[13px] bg-bg/70 px-2.5 py-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-800">{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block text-[12px] font-black leading-5 text-ink">{item.title}</span>
                          {item.description && <span className="mt-0.5 block text-[10px] font-medium leading-4 text-ink/55">{item.description}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {meta.guideType === 'procedure' && procedureSteps.length > 0 && (
                <section className="mt-3 rounded-[18px] border border-border bg-white p-3 shadow-sm">
                  <div className="text-[12px] font-black text-ink">{isEn ? 'Follow Steps Sequentially' : '现在按顺序做'}</div>
                  <div className="mt-2 grid gap-2">
                    {procedureSteps.slice(0, 3).map((item, index) => (
                      <div key={`${item.title}-${item.description}`} className="grid grid-cols-[26px_1fr] gap-2 rounded-[14px] bg-bg/70 p-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-black text-white">{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block text-[12px] font-black text-ink break-words leading-tight">{item.title}</span>
                          <span className="mt-0.5 line-clamp-2 block text-[10px] font-medium leading-relaxed text-ink/55">{item.description}</span>
                          <ActionEvidenceInline evidence={immediateEvidence[index]} isEn={isEn} />
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {meta.guideType === 'diagnosis' ? (
            isDiagnosisStarted && (
              <StepDiagnosisPanel
                topic={topic}
                onScheduleFollowUp={() => openReminderSheet('general')}
                followUpFeedback={ctaFeedback}
              />
            )
          ) : meta.guideType === 'procedure' ? (
            <section className="mt-4 rounded-[22px] border border-emerald-100 bg-[#F8FCF8] p-3 shadow-sm">
              <div className="rounded-[16px] border border-sky-100 bg-sky-50/65 px-3 py-3">
                <div className="text-[12px] font-black text-sky-800">{isEn ? 'After you finish' : '做完以后看什么'}</div>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-ink/62">{getProcedureObservation(topic)}</p>
                <ActionEvidenceInline evidence={followUpEvidence} isEn={isEn} />
              </div>
              {procedureReminders[0] && (
                <div className="mt-2 rounded-[16px] bg-yellow-50 px-3 py-3">
                  <div className="text-[12px] font-black text-yellow-800">{isEn ? 'Avoid for now' : '暂时不要'}</div>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-yellow-900/72">
                    <strong>{procedureReminders[0].title}{isEn ? ': ' : '：'}</strong>{procedureReminders[0].reason}
                  </p>
                  <ActionEvidenceInline evidence={avoidEvidence[0]} isEn={isEn} />
                </div>
              )}
            </section>
          ) : (
            <section className="mt-4 rounded-[22px] border border-emerald-100 bg-[#F8FCF8] p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[16px] font-black text-ink">
                    {meta.guideType === 'careChecklist'
                      ? (isEn ? 'Care Checklist' : '护理清单')
                      : (isEn ? 'Full Description' : '完整说明')}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${urgencyTagClassMap[meta.urgencyTag]}`}>
                  {getUrgencyTagLabel(meta.urgencyTag, isEn)}
                </span>
              </div>

              <div className="mt-3 grid gap-2">
                {visibleActions.length > 0 ? visibleActions.map((item, index) => (
                  meta.guideType === 'careChecklist' ? (
                    <div key={`${item.title}-${item.description}`} className="rounded-[15px] bg-white p-2 shadow-sm">
                      <ActionStepCard
                        checked={checkedActions.includes(item.description)}
                        title={`${index + 1}. ${item.title}`}
                        description={item.description}
                        onClick={() => {
                          setIsChecklistSaved(false);
                          onToggleAction(item.description);
                        }}
                      />
                      <div className="px-2 pb-1">
                        <ActionEvidenceInline evidence={immediateEvidence[index]} isEn={isEn} />
                      </div>
                    </div>
                  ) : (
                    <div key={`${item.title}-${item.description}`} className="rounded-[15px] bg-white px-3 py-3 shadow-sm">
                      <div className="text-[12px] font-black leading-tight text-ink">{index + 1}. {item.title}</div>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink/62">{item.description}</p>
                      <ActionEvidenceInline evidence={immediateEvidence[index]} isEn={isEn} />
                    </div>
                  )
                )) : careGuide.maintenanceTips.slice(0, 4).map((item, index) => (
                  <div key={`${item.title}-${item.description}`} className="rounded-[15px] bg-white px-3 py-3 shadow-sm">
                    <div className="text-[12px] font-black text-ink break-words leading-tight">{index + 1}. {item.title}</div>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink/62">{item.description}</p>
                  </div>
                ))}
              </div>

              {careGuide.avoidActions.length > 0 && meta.guideType !== 'knowledge' && (
                <div className="mt-3 rounded-[16px] bg-yellow-50 px-3 py-3">
                  <div className="text-[12px] font-black text-yellow-800">{isEn ? 'Operation Reminders' : '操作提醒'}</div>
                  <div className="mt-2 grid gap-1.5">
                    {careGuide.avoidActions.slice(0, 3).map((item, index) => (
                      <div key={item.title} className="text-[11px] font-medium leading-relaxed text-yellow-900/78">
                        <span className="font-black">{item.title}{isEn ? ': ' : '：'}</span>{item.reason}
                        <ActionEvidenceInline evidence={avoidEvidence[index]} isEn={isEn} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="mt-3 rounded-[18px] border border-border bg-white p-3">
            {meta.guideType === 'knowledge' ? (
              <div className="text-[13px] font-black text-ink">{isEn ? 'Detailed Description' : '详细说明'}</div>
            ) : (
              <button
                type="button"
                data-disclosure-purpose="secondary_evidence"
                onClick={() => setIsDetailExpanded(prev => !prev)}
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
                aria-expanded={isDetailExpanded}
              >
                <span className="text-[13px] font-black text-ink">{isEn ? 'Detailed description' : '详细说明'}</span>
                <span className="rounded-full bg-bg px-2.5 py-1 text-[10px] font-black text-ink/50">
                  {isDetailExpanded ? (isEn ? 'Collapse' : '收起') : (isEn ? 'Expand' : '展开')}
                </span>
              </button>
            )}
            {(meta.guideType === 'knowledge' || isDetailExpanded) && (
              <div className="mt-3 grid gap-2">
                {procedureDetails.map(item => (
                  <div key={`${item.title}-${item.description}`} className="rounded-[14px] bg-bg px-3 py-2.5">
                    <div className="text-[12px] font-black text-ink/76 break-words leading-tight">{item.title}</div>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink/60">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-3 rounded-[18px] border border-border bg-white p-3" data-care-references>
            <div className="text-[13px] font-black text-ink">{isEn ? 'Sources' : '参考来源'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {careReferences.map(reference => (
                <a
                  key={reference.id}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`${reference.publisher} · ${reference.title}`}
                  aria-label={isEn ? `Open ${reference.publisher} source` : `打开 ${reference.publisher} 原文`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/55 px-3 text-[11px] font-black text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  data-action-kind="external"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{reference.publisher}</span>
                </a>
              ))}
            </div>
          </section>

          {onOpenCareCard && (
            <section data-care-card-utility className="mt-3 rounded-[18px] border border-emerald-100 bg-emerald-50/35 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[12px] font-black text-ink">{isEn ? 'Take this guide with you' : '带走这份指南'}</div>
                  <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-ink/45">
                    {isEn ? 'Generate a local care card you can preview and copy. This does not create a public share link.' : '生成可预览、可复制的本地养护卡；不会创建公开分享链接。'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenCareCard}
                  className="h-10 shrink-0 rounded-full border-emerald-200 bg-white px-4 text-[12px] font-black text-emerald-800 hover:bg-emerald-50"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  {isEn ? 'Generate Care Card' : '生成养护卡'}
                </Button>
              </div>
            </section>
          )}

          {relatedTopics.length > 0 && (
            <section className="mt-3 rounded-[18px] border border-border bg-white p-3">
              <div className="mb-2 text-[12px] font-black text-ink">{meta.guideType === 'procedure' || meta.guideType === 'diagnosis' ? (isEn ? 'Next Steps' : '下一步可以看') : (isEn ? 'You May Also Need' : '你可能还需要')}</div>
              <div className="grid gap-1.5">
                {relatedTopics.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRelated(item)}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-[13px] bg-bg px-3 py-2 text-left transition-colors hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="line-clamp-1 block text-[12px] font-black text-ink/76">{getDisplayTitle(item)}</span>
                      <span className="mt-0.5 line-clamp-1 block text-[10px] font-medium text-ink/45">{item.summary || (isEn ? 'View action guide for this issue.' : '查看这个问题的处理方法。')}</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/35" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {meta.guideType !== 'diagnosis' && meta.guideType !== 'knowledge' && (
      <div className="modalFooter shrink-0 border-t border-border bg-white/95 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
        <div className="grid gap-2 md:mx-auto md:max-w-[700px] md:grid-cols-[auto_auto] md:justify-end">
          <Button
            type="button"
            onClick={(event) => handlePrimaryCta(event.currentTarget)}
            disabled={isPrimaryDisabled}
            className="h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800 md:w-fit md:min-w-[180px] md:max-w-[240px]"
          >
            {primaryCtaLabel}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          {secondaryLabel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSecondaryCta}
              className="h-10 w-full rounded-full border-emerald-100 bg-white text-sm font-black text-emerald-700 hover:bg-emerald-50 md:w-fit md:min-w-[160px] md:max-w-[220px]"
            >
              {secondaryLabel}
            </Button>
          )}
          {ctaFeedback && (
            <div className="flex items-center justify-center gap-2 rounded-[18px] bg-emerald-50 px-3 py-1.5 text-center text-[11px] font-black text-emerald-700 md:col-span-2">
              <span>{ctaFeedback}</span>
              {(ctaFeedback.includes('水族册') || ctaFeedback.includes('collection') || ctaFeedback.toLowerCase().includes('saved')) && onOpenCollection && (
                <button
                  type="button"
                  onClick={onOpenCollection}
                  className="shrink-0 rounded-full bg-white px-2.5 py-1 text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                >
                  {isEn ? 'Go to Collection' : '去水族册查看'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {reminderSheet && (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/30 px-4 pb-4" onClick={() => setReminderSheet(null)}>
          <div className="w-full max-w-[430px] md:max-w-[600px] rounded-[24px] bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[17px] font-black text-ink">{reminderSheet.title}</div>
                <div className="mt-1 text-[11px] font-bold text-ink/45">{isEn ? 'Choose a time. After confirmation, it will be saved to your care plan.' : '选择一个提醒时间，确认后会保存到养护计划。'}</div>
              </div>
              <button type="button" onClick={() => setReminderSheet(null)} className="rounded-full bg-bg px-2 py-1 text-[11px] font-black text-ink/45">{isEn ? 'Close' : '关闭'}</button>
            </div>
            <div className="mt-3 grid gap-2">
              {reminderSheet.options.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedReminderOption(option)}
                  className={`rounded-[16px] border px-3 py-3 text-left text-[13px] font-black transition-colors ${
                    selectedReminderOption === option ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-border bg-bg text-ink/68'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button type="button" onClick={() => void confirmReminder()} disabled={isReminderSaving} aria-busy={isReminderSaving} className="mt-4 h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isReminderSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />}
              {isReminderSaving ? (isEn ? 'Saving…' : '正在保存…') : (isEn ? 'Confirm Settings' : '确认设置')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionStepCard({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-care-action-step
      aria-pressed={checked}
      className={`flex items-start gap-2 rounded-[15px] border px-3 py-2.5 text-left transition-colors ${
        checked ? 'border-emerald-200 bg-white text-ink/58' : 'border-white bg-white text-ink'
      }`}
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        checked ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border text-transparent'
      }`}>
        <Check className="h-3 w-3" />
      </span>
      <span className="min-w-0">
        <span className={`block text-[12px] font-black leading-tight ${checked ? 'text-emerald-700' : 'text-ink'}`}>{title}</span>
        {description && <span className="mt-1 block text-[11px] font-medium leading-relaxed text-ink/58">{description}</span>}
      </span>
    </button>
  );
}
