import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Info, Loader2, Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Aquarium, Fish } from '../types';
import { fishData } from '../data/fishData';
import i18n from '../i18n';
import { englishTranslations } from '../i18n/localizeData';
import { autoTranslations } from '../i18n/localizeDataAuto';
import { getCareTaxonomyPath, getLifeType } from '../modules/species/species.service';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass } from '../lib/speciesVisual';
import { getAquariumVolumeLiters, getCurrentLivestockForAquarium } from '../lib/speciesFitEngine';
import { evaluateCompatibilityDecision, type CompatibilityItem } from '../modules/knowledge/compatibilityKnowledge';
import type { PairCompatibilityResult } from '../modules/knowledge/knowledge.types';
import type { TankCompatibilityStatus } from '../lib/tankCompatibilityEngine';
import { generateRiskExplanation, type RiskExplanationData } from '../lib/aiClient';
import { getAquariumAiReadiness } from '../services/aquarium/aquarium-setup.service';
import { recordTankCompatibility } from '../services/compatibility/compatibility-records.service';
import { trackSessionEvent } from '../services/analytics/session-events.service';

const getSpeciesName = (species: Fish, isEn: boolean) => {
  if (!isEn) return species.name;
  if (species.scientificName) return species.scientificName;
  return autoTranslations[species.id]?.name || englishTranslations[species.id]?.name || species.name;
};

const isLivestock = (fish: Fish) => !['plant', 'hardscape'].includes(getLifeType(fish));

const statusRank: Record<TankCompatibilityStatus, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
};

const statusMeta = (status: TankCompatibilityStatus, isEn: boolean) => {
  if (status === 'not_recommended') return {
    label: isEn ? 'Not recommended' : '不建议混养',
    description: isEn ? 'This combination has a clear conflict and is not recommended.' : '存在明确冲突，不建议一起养。',
    box: 'border-red-200 bg-red-50',
    text: 'text-red-800',
    icon: <AlertTriangle className="h-5 w-5" />,
  };
  if (status === 'caution') return {
    label: isEn ? 'Conditional' : '有条件可尝试',
    description: isEn ? 'This combination may work if the conditions below are met.' : '可以尝试，但需要满足以下条件。',
    box: 'border-amber-200 bg-amber-50',
    text: 'text-amber-800',
    icon: <AlertTriangle className="h-5 w-5" />,
  };
  if (status === 'insufficient_data') return {
    label: isEn ? 'More tank data needed' : '需要补充鱼缸信息',
    description: isEn ? 'Complete the tank details before deciding whether these species can live together.' : '先补充鱼缸参数，再判断是否适合混养。',
    box: 'border-sky-200 bg-sky-50',
    text: 'text-sky-800',
    icon: <Info className="h-5 w-5" />,
  };
  return {
    label: isEn ? 'Compatible' : '当前可混养',
    description: isEn ? 'No obvious conflict was found. Add gradually and observe.' : '目前没有发现明显冲突，建议少量加入并观察。',
    box: 'border-emerald-200 bg-emerald-50',
    text: 'text-emerald-800',
    icon: <CheckCircle2 className="h-5 w-5" />,
  };
};

type CompatibilityRiskCalculatorProps = {
  speciesIds?: string[];
  onSpeciesIdsChange?: (ids: string[]) => void;
  onBrowseAtlas?: () => void;
  onAddToAquarium?: (items: { fishId: string; quantity: number }[]) => void | Promise<{ message?: string } | void>;
  onRequestTankInfo?: (missingRuleCodes: string[]) => void;
  onViewAquarium?: () => void;
  preferredSpeciesIds?: string[];
  aquariums?: Aquarium[];
  activeAquariumId?: string;
  onEvaluationRecorded?: () => void;
};

type ConflictAction = {
  id: string;
  title: string;
  detail: string;
  removeSpeciesId?: string;
  tone: 'danger' | 'warning' | 'info';
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const getConflictActionLabel = (action: ConflictAction, isEn: boolean) => {
  if (!action.removeSpeciesId) return isEn ? 'Review current tank' : '查看当前鱼缸';
  const species = fishData.find(item => item.id === action.removeSpeciesId);
  const name = species ? getSpeciesName(species, isEn) : (isEn ? 'this species' : '该生物');
  const isSkip = action.title.startsWith(isEn ? 'Do not add ' : '不要加入 ');
  return isSkip
    ? (isEn ? 'Do not add ' + name : '不加入 ' + name)
    : (isEn ? 'Remove ' + name : '移除 ' + name);
};

const getPairReasons = (pair: PairCompatibilityResult) => unique([
  pair.primaryReason?.evidence,
  ...pair.secondaryReasons.map(item => item.evidence),
].filter((item): item is string => Boolean(item))).slice(0, 3);

const commonNames = ['红绿灯', '宝莲灯', '黑壳虾', '极火虾', '斑马螺', '咖啡鼠', '白云金丝', '孔雀鱼'];

export function CompatibilityRiskCalculator({
  speciesIds,
  onSpeciesIdsChange,
  onBrowseAtlas,
  onAddToAquarium,
  onRequestTankInfo,
  onViewAquarium,
  preferredSpeciesIds = [],
  aquariums = [],
  activeAquariumId = '',
  onEvaluationRecorded,
}: CompatibilityRiskCalculatorProps = {}) {
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [internalSpeciesIds, setInternalSpeciesIds] = useState<string[]>([]);
  const activeSpeciesIds = speciesIds ?? internalSpeciesIds;
  const [selectedAquariumId, setSelectedAquariumId] = useState(activeAquariumId || aquariums[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [recordError, setRecordError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [cautionConfirmed, setCautionConfirmed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RiskExplanationData | null>(null);
  const recordedKeyRef = useRef('');

  useEffect(() => {
    if (activeAquariumId) setSelectedAquariumId(activeAquariumId);
  }, [activeAquariumId]);

  const updateSpeciesIds = (next: string[] | ((current: string[]) => string[])) => {
    const resolved = typeof next === 'function' ? next(activeSpeciesIds) : next;
    if (onSpeciesIdsChange) onSpeciesIdsChange(resolved);
    else setInternalSpeciesIds(resolved);
    setCautionConfirmed(false);
    setFeedback('');
    setRecordError('');
    setAiResult(null);
  };

  const selectedAquarium = useMemo(() => (
    aquariums.find(item => item.id === selectedAquariumId)
    || aquariums.find(item => item.id === activeAquariumId)
    || aquariums[0]
    || null
  ), [activeAquariumId, aquariums, selectedAquariumId]);

  const existingLivestock = useMemo(() => (
    getCurrentLivestockForAquarium(selectedAquarium, fishData)
      .filter(item => item.species && isLivestock(item.species))
  ), [selectedAquarium]);

  const existingIds = useMemo(() => new Set(existingLivestock.map(item => item.species.id)), [existingLivestock]);
  const existingQuantity = useMemo(() => existingLivestock.reduce<Record<string, number>>((result, item) => {
    result[item.species.id] = Math.max(1, Number(item.record?.quantity || 1));
    return result;
  }, {}), [existingLivestock]);

  const selectedSpecies = useMemo(() => activeSpeciesIds
    .map(id => fishData.find(fish => fish.id === id))
    .filter((fish): fish is Fish => Boolean(fish && isLivestock(fish))), [activeSpeciesIds]);

  const candidateSpecies = useMemo(() => selectedSpecies.filter(fish => !existingIds.has(fish.id)), [existingIds, selectedSpecies]);
  const compareExistingOnly = selectedSpecies.length >= 2 && candidateSpecies.length === 0;

  const evaluationItems = useMemo<CompatibilityItem[]>(() => {
    if (candidateSpecies.length > 0 && selectedAquarium) {
      const baseline = existingLivestock.map(item => ({
        species: item.species,
        quantity: existingQuantity[item.species.id] || 1,
        origin: 'existing' as const,
      }));
      const candidates = candidateSpecies.map(species => ({
        species,
        quantity: Math.max(1, quantities[species.id] || 1),
        origin: 'candidate' as const,
      }));
      const seen = new Set<string>();
      return [...baseline, ...candidates].filter(item => {
        if (seen.has(item.species.id)) return false;
        seen.add(item.species.id);
        return true;
      });
    }
    return selectedSpecies.map(species => ({
      species,
      quantity: Math.max(1, quantities[species.id] || existingQuantity[species.id] || 1),
      origin: existingIds.has(species.id) ? 'existing' as const : 'candidate' as const,
    }));
  }, [candidateSpecies, existingIds, existingLivestock, existingQuantity, quantities, selectedAquarium, selectedSpecies]);

  const decision = useMemo(() => (
    evaluationItems.length >= 2
      ? evaluateCompatibilityDecision({ tank: selectedAquarium, items: evaluationItems })
      : null
  ), [evaluationItems, selectedAquarium]);

  const relevantPairs = useMemo(() => {
    if (!decision) return [];
    if (candidateSpecies.length === 0) return decision.pairResults;
    const candidateIds = new Set(candidateSpecies.map(item => item.id));
    return decision.pairResults.filter(pair => candidateIds.has(pair.speciesA.id) || candidateIds.has(pair.speciesB.id));
  }, [candidateSpecies, decision]);

  const resultStatus = useMemo<TankCompatibilityStatus | null>(() => {
    if (relevantPairs.length === 0) return null;
    return relevantPairs.reduce<TankCompatibilityStatus>((current, pair) => (
      statusRank[pair.status] > statusRank[current] ? pair.status : current
    ), 'compatible');
  }, [relevantPairs]);

  const blockingPairs = useMemo(() => relevantPairs.filter(pair => pair.status === 'not_recommended'), [relevantPairs]);
  const cautionPairs = useMemo(() => relevantPairs.filter(pair => pair.status === 'caution'), [relevantPairs]);
  const missingPairs = useMemo(() => relevantPairs.filter(pair => pair.status === 'insufficient_data'), [relevantPairs]);
  const meta = resultStatus ? statusMeta(resultStatus, isEn) : null;

  const readiness = useMemo(() => selectedAquarium ? getAquariumAiReadiness(selectedAquarium) : null, [selectedAquarium]);
  const aiReady = Boolean(selectedAquarium && readiness?.ready && resultStatus);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return fishData
      .filter(isLivestock)
      .filter(fish => !activeSpeciesIds.includes(fish.id))
      .filter(fish => `${fish.name} ${fish.scientificName} ${fish.category}`.toLowerCase().includes(term))
      .slice(0, 10);
  }, [activeSpeciesIds, searchTerm]);

  const commonSpecies = useMemo(() => {
    const preferred = preferredSpeciesIds
      .map(id => fishData.find(fish => fish.id === id))
      .filter((fish): fish is Fish => Boolean(fish && isLivestock(fish)));
    const common = commonNames
      .map(name => fishData.find(fish => fish.name === name) || fishData.find(fish => fish.name.includes(name)))
      .filter((fish): fish is Fish => Boolean(fish && isLivestock(fish)));
    const seen = new Set<string>();
    return [...preferred, ...common].filter(fish => {
      if (seen.has(fish.id) || activeSpeciesIds.includes(fish.id)) return false;
      seen.add(fish.id);
      return true;
    }).slice(0, 8);
  }, [activeSpeciesIds, preferredSpeciesIds]);

  const addSpecies = (fish: Fish) => {
    updateSpeciesIds(current => current.includes(fish.id) ? current : [...current, fish.id]);
    setSearchTerm('');
  };

  const removeSpecies = (fishId: string) => {
    const fish = fishData.find(item => item.id === fishId);
    updateSpeciesIds(current => current.filter(id => id !== fishId));
    setQuantities(current => {
      const next = { ...current };
      delete next[fishId];
      return next;
    });
    if (fish) setFeedback(isEn ? `${getSpeciesName(fish, true)} removed from this plan.` : `已从本次方案中移除 ${fish.name}。`);
  };

  const conflictActions = useMemo<ConflictAction[]>(() => {
    const actions: ConflictAction[] = [];
    blockingPairs.forEach(pair => {
      const aExisting = existingIds.has(pair.speciesA.id);
      const bExisting = existingIds.has(pair.speciesB.id);
      const aCandidate = candidateSpecies.some(item => item.id === pair.speciesA.id);
      const bCandidate = candidateSpecies.some(item => item.id === pair.speciesB.id);
      const reason = getPairReasons(pair)[0] || pair.rawResult.summary;

      if (aCandidate && bExisting) {
        actions.push({
          id: `${pair.pairId}-skip-a`,
          title: isEn ? `Do not add ${getSpeciesName(pair.speciesA, true)}` : `不要加入 ${pair.speciesA.name}`,
          detail: isEn ? `It is not suitable with ${getSpeciesName(pair.speciesB, true)}: ${reason}` : `它与 ${pair.speciesB.name} 不适合一起养：${reason}`,
          removeSpeciesId: pair.speciesA.id,
          tone: 'danger',
        });
        return;
      }
      if (bCandidate && aExisting) {
        actions.push({
          id: `${pair.pairId}-skip-b`,
          title: isEn ? `Do not add ${getSpeciesName(pair.speciesB, true)}` : `不要加入 ${pair.speciesB.name}`,
          detail: isEn ? `It is not suitable with ${getSpeciesName(pair.speciesA, true)}: ${reason}` : `它与 ${pair.speciesA.name} 不适合一起养：${reason}`,
          removeSpeciesId: pair.speciesB.id,
          tone: 'danger',
        });
        return;
      }
      if (aCandidate && bCandidate) {
        actions.push({
          id: `${pair.pairId}-choose-a`,
          title: isEn ? `Keep ${getSpeciesName(pair.speciesA, true)}, replace ${getSpeciesName(pair.speciesB, true)}` : `保留 ${pair.speciesA.name}，移除 ${pair.speciesB.name}`,
          detail: reason,
          removeSpeciesId: pair.speciesB.id,
          tone: 'danger',
        });
        actions.push({
          id: `${pair.pairId}-choose-b`,
          title: isEn ? `Keep ${getSpeciesName(pair.speciesB, true)}, replace ${getSpeciesName(pair.speciesA, true)}` : `保留 ${pair.speciesB.name}，移除 ${pair.speciesA.name}`,
          detail: reason,
          removeSpeciesId: pair.speciesA.id,
          tone: 'danger',
        });
        return;
      }
      if (aExisting && bExisting) {
        actions.push({
          id: `${pair.pairId}-existing`,
          title: isEn ? 'Existing tank conflict detected' : '当前缸内已有组合存在风险',
          detail: isEn ? `This conflict already exists in the current tank. Adjust the current stocking first. ${reason}` : `这个风险已经存在于当前鱼缸，请先调整缸内组合。${reason}`,
          tone: 'warning',
        });
      }
    });
    const seen = new Set<string>();
    return actions.filter(action => {
      const key = `${action.title}-${action.removeSpeciesId || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [blockingPairs, candidateSpecies, existingIds, isEn]);

  useEffect(() => {
    if (!selectedAquarium || !resultStatus || relevantPairs.length === 0) return;
    const ids = candidateSpecies.length > 0 ? candidateSpecies.map(item => item.id) : selectedSpecies.map(item => item.id);
    const key = `${selectedAquarium.id}:${ids.sort().join('|')}:${resultStatus}`;
    if (recordedKeyRef.current === key) return;
    recordedKeyRef.current = key;
    recordTankCompatibility({ aquariumId: selectedAquarium.id, speciesIds: ids, status: resultStatus });
    trackSessionEvent('compatibility_started', {
      action: 'calculate',
      status: resultStatus,
      entry: 'compatibility_v2',
      source: 'rules',
      candidateCount: ids.length,
    });
    relevantPairs.forEach(pair => {
      trackSessionEvent('compatibility_pair_evaluated', {
        action: 'evaluate_pair',
        status: pair.status,
        entry: 'compatibility_v2',
        source: 'rules',
        pairKey: `${pair.speciesA.id}__${pair.speciesB.id}`,
      });
    });
    onEvaluationRecorded?.();
  }, [candidateSpecies, onEvaluationRecorded, relevantPairs, resultStatus, selectedAquarium, selectedSpecies]);

  const requestMissingTankInfo = () => {
    if (!readiness || readiness.ready) return;
    const codes = readiness.missing.map(item => (
      item.key === 'dimensions' ? 'tank_size' : item.key === 'filter' ? 'equipment_filter' : item.key
    ));
    onRequestTankInfo?.(codes);
  };

  const openAiAdvice = async () => {
    if (!resultStatus || relevantPairs.length === 0) return;
    if (!selectedAquarium || !readiness?.ready) {
      requestMissingTankInfo();
      return;
    }
    setAiOpen(true);
    setAiLoading(true);
    setAiResult(null);
    const context = {
      finalStatus: resultStatus,
      taskGoal: 'Explain the compatibility result and give concrete adjustment options. Do not override or weaken deterministic blocking rules.',
      tank: {
        id: selectedAquarium.id,
        name: selectedAquarium.name,
        waterType: selectedAquarium.waterType,
        dimensions: selectedAquarium.dimensions,
        targetTemperature: selectedAquarium.targetTemperature,
        equipment: selectedAquarium.equipment,
      },
      existingLivestock: existingLivestock.map(item => ({
        speciesId: item.species.id,
        name: item.species.name,
        quantity: existingQuantity[item.species.id] || 1,
      })),
      plannedAdditions: candidateSpecies.map(item => ({
        speciesId: item.id,
        name: item.name,
        quantity: quantities[item.id] || 1,
      })),
      comparedSpecies: compareExistingOnly ? selectedSpecies.map(item => ({ speciesId: item.id, name: item.name })) : [],
      conflicts: relevantPairs.map(pair => ({
        pair: [pair.speciesA.name, pair.speciesB.name],
        status: pair.status,
        reasons: getPairReasons(pair),
        ruleSuggestions: pair.actions,
      })),
      ruleResult: {
        status: resultStatus,
        blockingRules: relevantPairs.flatMap(pair => pair.rawResult.blockingRules),
        warningRules: relevantPairs.flatMap(pair => pair.rawResult.warningRules),
        missingData: relevantPairs.flatMap(pair => pair.rawResult.missingData),
        suggestions: unique(relevantPairs.flatMap(pair => pair.rawResult.suggestions)).slice(0, 6),
      },
    };
    const result = await generateRiskExplanation(context);
    setAiResult(result);
    setAiLoading(false);
  };

  const recordActualStocking = async () => {
    if (!onAddToAquarium || candidateSpecies.length === 0 || !resultStatus || isRecording) return;
    if (resultStatus === 'not_recommended' || resultStatus === 'insufficient_data') return;
    if (resultStatus === 'caution' && !cautionConfirmed) {
      setCautionConfirmed(true);
      return;
    }
    setIsRecording(true);
    setRecordError('');
    try {
      const response = await onAddToAquarium(candidateSpecies.map(fish => ({
        fishId: fish.id,
        quantity: Math.max(1, quantities[fish.id] || 1),
      })));
      const feedbackMessage = response && typeof response === 'object' ? response.message : undefined;
      setFeedback(feedbackMessage || (isEn ? 'Recorded in the aquarium.' : '已记录到鱼缸。'));
    } catch {
      setRecordError(isEn ? 'Could not save the livestock record. Try again.' : '入缸记录没有保存成功，请重试。');
    } finally {
      setIsRecording(false);
    }
  };

  const canEvaluate = evaluationItems.length >= 2 && relevantPairs.length > 0;
  const aquariumVolume = selectedAquarium ? getAquariumVolumeLiters(selectedAquarium) : null;
  const contextLabel = selectedAquarium
    ? [
      selectedAquarium.name,
      aquariumVolume ? `${aquariumVolume}L` : '',
      `${existingLivestock.length} ${isEn ? 'existing species' : '种已有生物'}`,
    ].filter(Boolean).join(' · ')
    : (isEn ? 'No tank selected · comparison only' : '未选择鱼缸 · 仅比较所选组合');

  return (
    <div data-surface="compatibility-checkout-drawer" className="fixed bottom-0 right-0 top-0 z-[80] grid h-[100dvh] w-full content-start gap-4 overflow-y-auto rounded-none border-l border-emerald-100 bg-white p-4 shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-right-full duration-200 sm:min-w-0 sm:rounded-l-[24px] md:p-5">
      {onBrowseAtlas && (
        <button
          type="button"
          onClick={onBrowseAtlas}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink/50 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700"
          aria-label={isEn ? 'Close compatibility plan' : '关闭混养方案'}
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <header className="flex flex-wrap items-start justify-between gap-3 pr-12">
        <div>
          <h2 className="mt-1 text-[22px] font-black text-ink">{isEn ? 'Can these species live together?' : '这些生物能不能一起养？'}</h2>
          <p className="mt-1 max-w-[680px] text-[12px] font-semibold leading-5 text-ink/52">
            {isEn
              ? 'Existing livestock is treated as the baseline. Select only what you plan to add; AquaGuide will tell you which pair conflicts and what to change.'
              : '选择准备加入的生物，查看是否适合当前鱼缸。'}
          </p>
        </div>
        {aquariums.length > 1 && (
          <select
            value={selectedAquarium?.id || ''}
            onChange={event => setSelectedAquariumId(event.target.value)}
            className="min-h-11 rounded-full border border-border bg-white px-3 text-xs font-black text-ink/65"
          >
            {aquariums.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        )}
      </header>

      <section className="rounded-[18px] bg-bg/65 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] font-black text-ink">{isEn ? 'Evaluation baseline' : '当前鱼缸'}</div>
          {selectedAquarium && onViewAquarium && (
            <button type="button" onClick={onViewAquarium} className="text-[10px] font-black text-emerald-700">{isEn ? 'View tank' : '查看鱼缸'}</button>
          )}
        </div>
        <div className="mt-1 text-[11px] font-bold text-ink/50">{contextLabel}</div>
        {selectedAquarium && existingLivestock.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {existingLivestock.slice(0, 8).map(item => (
              <span key={item.species.id} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-ink/58">
                {getSpeciesName(item.species, isEn)} × {existingQuantity[item.species.id] || 1}
              </span>
            ))}
            {existingLivestock.length > 8 && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-ink/40">+{existingLivestock.length - 8}</span>}
          </div>
        )}
      </section>

      <section className="grid gap-3 rounded-[18px] border border-border/70 p-3">
        <div>
          <div className="text-[13px] font-black text-ink">{selectedAquarium && existingLivestock.length > 0 ? (isEn ? 'What do you want to add?' : '你准备加入什么？') : (isEn ? 'Select species to compare' : '选择要比较的生物')}</div>
          <div className="mt-1 text-[10px] font-bold text-ink/42">
            {selectedAquarium && existingLivestock.length > 0
              ? (isEn ? 'Existing livestock is included automatically.' : '已有生物会自动纳入判断')
              : (isEn ? 'Select at least two species.' : '未选择已有鱼缸时，需要至少选择 2 种。')}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder={isEn ? 'Search fish, shrimp or snails…' : '搜索鱼、虾、螺等生物'} className="h-11 rounded-[14px] bg-bg pl-9 text-sm font-bold" />
        </div>

        {(searchResults.length > 0 ? searchResults : commonSpecies).length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(searchResults.length > 0 ? searchResults : commonSpecies).map(fish => {
              const taxonomy = getCareTaxonomyPath(fish);
              return (
                <button key={fish.id} type="button" onClick={() => addSpecies(fish)} className="grid grid-cols-[48px_1fr_auto] items-center gap-2 rounded-[15px] border border-border/70 bg-white p-2 text-left hover:border-emerald-300">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${getSpeciesImageSurfaceClass(fish)}`}>
                    <img src={getSpeciesDisplayImage(fish)} alt={fish.name} className={`max-h-11 max-w-11 object-contain ${getSpeciesImageClass(fish)}`} referrerPolicy="no-referrer" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-black text-ink">{getSpeciesName(fish, isEn)}</span>
                    <span className="mt-0.5 block truncate text-[9px] font-bold text-ink/40">{taxonomy.size} · {fish.housingMode || '待评估'}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-emerald-600" />
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {selectedSpecies.map(fish => {
            const existing = existingIds.has(fish.id);
            const quantity = Math.max(1, quantities[fish.id] || existingQuantity[fish.id] || 1);
            return (
              <div key={fish.id} className={`flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-1.5 ${existing ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <img src={getSpeciesDisplayImage(fish)} alt={fish.name} className={`h-8 w-9 object-contain ${getSpeciesImageClass(fish)}`} referrerPolicy="no-referrer" />
                <div>
                  <div className="max-w-[120px] truncate text-[10px] font-black text-ink">{getSpeciesName(fish, isEn)}</div>
                  <div className="text-[8px] font-bold text-ink/40">{existing ? (isEn ? 'already in tank' : '缸内已有') : (isEn ? 'planned' : '准备加入')} · ×{quantity}</div>
                </div>
                {!existing && (
                  <div className="flex items-center rounded-full bg-white">
                    <button type="button" onClick={() => setQuantities(current => ({ ...current, [fish.id]: Math.max(1, quantity - 1) }))} className="h-8 w-8 rounded-full text-sm font-black text-ink/45">−</button>
                    <button type="button" onClick={() => setQuantities(current => ({ ...current, [fish.id]: quantity + 1 }))} className="h-8 w-8 rounded-full text-sm font-black text-emerald-700">+</button>
                  </div>
                )}
                <button type="button" onClick={() => removeSpecies(fish.id)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/40 hover:text-red-600" aria-label={isEn ? 'Remove from comparison' : '从本次比较移除'}><X className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={onBrowseAtlas} className="w-fit text-[11px] font-black text-emerald-700">{isEn ? 'Browse all species →' : '从完整图鉴继续选择 →'}</button>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-black text-ink">{isEn ? 'Compatibility result' : '混养结果'}</div>
        </div>

        {!canEvaluate || !resultStatus || !meta ? (
          <div className="rounded-[18px] border border-dashed border-border bg-bg/60 px-4 py-8 text-center">
            <div className="text-sm font-black text-ink/60">
              {selectedAquarium && existingLivestock.length > 0
                ? (isEn ? 'Select at least one species you plan to add.' : '选择至少 1 种准备加入的生物后，这里会直接给出结论。')
                : (isEn ? 'Select at least two species.' : '选择至少 2 种生物后，这里会直接给出结论。')}
            </div>
          </div>
        ) : (
          <>
            <div className={`rounded-[20px] border p-4 ${meta.box}`}>
              <div className={`flex items-start gap-3 ${meta.text}`}>
                <span className="mt-0.5">{meta.icon}</span>
                <div>
                  <div className={`font-black ${resultStatus === 'not_recommended' ? 'text-[26px] leading-tight' : 'text-[20px]'}`}>{meta.label}</div>
                  <p className="mt-1 text-[12px] font-bold leading-5 opacity-85">{meta.description}</p>
                </div>
              </div>
            </div>

            {blockingPairs.length > 0 && (
              <section className="grid gap-2">
                <div className="text-[12px] font-black text-red-700">{isEn ? 'Conflicting pairs' : '不适合的组合'}</div>
                {blockingPairs.slice(0, 4).map(pair => (
                  <article key={pair.pairId} className="rounded-[18px] border-2 border-red-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[16px] font-black text-red-800">{getSpeciesName(pair.speciesA, isEn)} × {getSpeciesName(pair.speciesB, isEn)}</div>
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-700">{isEn ? 'Cannot recommend together' : '当前不建议同缸'}</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {getPairReasons(pair).map(reason => (
                        <div key={reason} className="rounded-[13px] bg-red-50 px-3 py-2 text-[13px] font-bold leading-6 text-red-900">{reason}</div>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            )}

            {cautionPairs.length > 0 && resultStatus !== 'not_recommended' && (
              <section className="rounded-[18px] border border-amber-200 bg-amber-50/70 p-3">
                <div className="text-[12px] font-black text-amber-800">{isEn ? 'Conditions to watch' : '需要满足的条件'}</div>
                <div className="mt-2 grid gap-2">
                  {unique(cautionPairs.flatMap(pair => [...getPairReasons(pair), ...pair.actions])).slice(0, 5).map(item => (
                    <div key={item} className="rounded-[12px] bg-white px-3 py-2 text-[11px] font-bold leading-5 text-amber-900">{item}</div>
                  ))}
                </div>
              </section>
            )}

            {missingPairs.length > 0 && (
              <section className="rounded-[18px] border border-sky-200 bg-sky-50 p-3">
                <div className="text-[12px] font-black text-sky-800">{isEn ? 'Complete these details' : '补充这些信息'}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unique(missingPairs.flatMap(pair => pair.rawResult.missingData.map(item => item.evidence || item.title))).slice(0, 5).map(item => (
                    <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-sky-800">{item}</span>
                  ))}
                </div>
                {onRequestTankInfo && <Button type="button" onClick={requestMissingTankInfo} className="mt-3 h-10 rounded-full bg-sky-700 px-4 text-xs font-black text-white">{isEn ? 'Complete tank settings' : '去完善鱼缸参数'}</Button>}
              </section>
            )}

            {resultStatus === 'not_recommended' && (
              <section className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-[13px] font-black text-ink">{isEn ? 'How to adjust?' : '怎么调整？'}</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {conflictActions.map(action => (
                    <div key={action.id} className="rounded-[16px] border border-white bg-white p-3 shadow-sm">
                      <div className={`text-[12px] font-black ${action.tone === 'danger' ? 'text-red-700' : action.tone === 'warning' ? 'text-amber-700' : 'text-sky-700'}`}>{action.title}</div>
                      <p className="mt-1 text-[10px] font-semibold leading-5 text-ink/50">{action.detail}</p>
                      {action.removeSpeciesId && (
                        <Button type="button" variant="outline" onClick={() => removeSpecies(action.removeSpeciesId!)} className="mt-2 h-9 rounded-full border-red-200 px-3 text-[10px] font-black text-red-700">{getConflictActionLabel(action, isEn)}</Button>
                      )}
                      {!action.removeSpeciesId && onViewAquarium && (
                        <Button type="button" variant="outline" onClick={onViewAquarium} className="mt-2 h-9 rounded-full px-3 text-[10px] font-black">{isEn ? 'Review current tank' : '查看当前鱼缸'}</Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={() => void openAiAdvice()} disabled={aiLoading || !resultStatus} className="h-11 rounded-full bg-violet-700 text-sm font-black text-white hover:bg-violet-800">
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {!selectedAquarium || !readiness?.ready ? (isEn ? 'Complete data before AI' : '完善参数后使用 AI') : (isEn ? 'Ask AI to explain & adjust' : 'AI 建议')}
              </Button>
              {candidateSpecies.length > 0 && resultStatus !== 'not_recommended' && resultStatus !== 'insufficient_data' && onAddToAquarium && (
                <Button type="button" onClick={() => void recordActualStocking()} disabled={isRecording} className={`h-11 rounded-full text-sm font-black text-white ${resultStatus === 'caution' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                  {isRecording && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {resultStatus === 'caution' && !cautionConfirmed ? (isEn ? 'Review risk before recording' : '确认风险后再记录') : (isEn ? 'Already stocked · record now' : '已经实际入缸，记录下来')}
                </Button>
              )}
            </div>

            {!aiReady && selectedAquarium && readiness && !readiness.ready && (
              <div className="rounded-[14px] bg-violet-50 px-3 py-2 text-[10px] font-bold leading-5 text-violet-800">
                {isEn ? 'AI uses verified tank data only. Missing: ' : '还缺：'}{readiness.missing.map(item => item.label).join(isEn ? ', ' : '、')}
              </div>
            )}

            {feedback && <div className="rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800">{feedback}</div>}
            {recordError && <div role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-800">{recordError}</div>}
          </>
        )}
      </section>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="w-[92vw] max-w-[560px] rounded-[24px] border-violet-100 bg-white p-0">
          <DialogHeader className="border-b border-violet-100 bg-violet-50/70 px-5 py-4 text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-700"><Sparkles className="h-3.5 w-3.5" />{isEn ? 'AI INTERPRETATION' : 'AI 建议'}</div>
            <DialogTitle className="mt-2 text-[20px] font-black text-ink">{isEn ? 'Why this result, and what can I change?' : '为什么会这样？我具体可以怎么改？'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[62dvh] overflow-y-auto px-5 py-4">
            {aiLoading && <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm font-black text-violet-700"><Loader2 className="h-5 w-5 animate-spin" />{isEn ? 'Generating suggestions…' : '正在生成建议…'}</div>}
            {!aiLoading && aiResult && (
              <div className="grid gap-3">
                <div className={`rounded-[16px] px-3 py-2 text-[11px] font-black ${aiResult.source === 'model' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  {aiResult.source === 'model' ? (isEn ? 'AI generated' : 'AI 已生成') : (isEn ? 'AI unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试')}
                </div>
                <div className="rounded-[16px] bg-violet-50 p-3">
                  <div className="text-[11px] font-black text-violet-800">{isEn ? 'Overview' : '建议概览'}</div>
                  <p className="mt-1 text-[13px] font-bold leading-6 text-ink">{aiResult.summary}</p>
                </div>
                {aiResult.reasons.length > 0 && (
                  <section>
                    <div className="text-[12px] font-black text-ink">{isEn ? 'Why' : '为什么'}</div>
                    <div className="mt-2 grid gap-2">
                      {aiResult.reasons.slice(0, 4).map((item, index) => (
                        <div key={`${item.title}-${index}`} className="rounded-[14px] border border-border bg-white p-3">
                          <div className="text-[11px] font-black text-ink">{item.title}</div>
                          <p className="mt-1 text-[11px] font-semibold leading-5 text-ink/58">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {aiResult.suggestions.length > 0 && (
                  <section>
                    <div className="text-[12px] font-black text-ink">{isEn ? 'Adjustment options' : '调整建议'}</div>
                    <div className="mt-2 grid gap-2">
                      {aiResult.suggestions.slice(0, 4).map((item, index) => (
                        <div key={`${item.title}-${index}`} className="rounded-[14px] bg-emerald-50 px-3 py-2">
                          <div className="text-[11px] font-black text-emerald-800">{item.title}</div>
                          <p className="mt-1 text-[11px] font-semibold leading-5 text-emerald-950/70">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <div className="rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-ink/45">{isEn ? 'Check the advice against actual water conditions and livestock behavior.' : '请结合实际水质和生物状态判断。'}</div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-border px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setAiOpen(false)} className="h-11 w-full rounded-full text-sm font-black">{isEn ? 'Close' : '关闭'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompatibilityRiskCalculator;
