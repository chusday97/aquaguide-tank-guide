import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Aquarium } from '../types';
import { fishData } from '../data/fishData';
import { CompatibilityRiskCalculator } from '../components/CompatibilityRiskCalculator';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';
import { getAquariumNavigationSnapshot } from '../services/aquarium/aquarium-navigation.service';
import { selectAquariumSnapshot } from '../services/aquarium/aquarium-selection.service';
import { getCompatibilitySelection, setCompatibilitySelection } from '../services/compatibility/compatibility-selection.service';
import { reviewSpeciesAdditions } from '../services/aquarium/species-addition.service';
import { recordExistingLivestock } from '../services/aquarium/livestock-recording.service';
import { getTankCompatibilityAddPolicy } from '../lib/tankCompatibilityEngine';
import { taskRoutes } from '../services/navigation/task-routes';

export default function Compatibility() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [activeAquarium, setActiveAquarium] = useState<Aquarium | null>(null);
  const [speciesIds, setSpeciesIds] = useState<string[]>(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get('species') || '').split(',').filter(id => fishData.some(fish => fish.id === id));
    return fromUrl.length > 0 ? fromUrl : getCompatibilitySelection().filter(id => fishData.some(fish => fish.id === id));
  });

  useEffect(() => {
    setCompatibilitySelection(speciesIds);
  }, [speciesIds]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get('species') || '').split(',').filter(id => fishData.some(fish => fish.id === id));
    if (fromUrl.length > 0) setSpeciesIds(current => current.join(',') === fromUrl.join(',') ? current : fromUrl);
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const repository = await getCurrentAquaGuideRepository();
        const next = await repository.getAquariums();
        if (cancelled) return;
        const navigation = getAquariumNavigationSnapshot();
        setAquariums(next);
        setActiveAquarium(selectAquariumSnapshot(next, [navigation.currentAquariumId]) || null);
      } catch {
        if (!cancelled) {
          setAquariums([]);
          setActiveAquarium(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const source = useMemo(() => new URLSearchParams(location.search).get('source') || 'species-detail', [location.search]);

  const syncSpecies = (ids: string[]) => {
    setSpeciesIds(ids);
    const params = new URLSearchParams(location.search);
    if (ids.length > 0) params.set('species', ids.join(','));
    else params.delete('species');
    navigate({ pathname: '/compatibility', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  };

  const addToAquarium = async (items: { fishId: string; quantity: number }[]) => {
    const repository = await getCurrentAquaGuideRepository();
    const current = activeAquarium || selectAquariumSnapshot(await repository.getAquariums(), [getAquariumNavigationSnapshot().currentAquariumId]);
    if (!current) throw new Error(t('encyclopedia.noTankError'));
    const normalized = items.filter(item => fishData.some(fish => fish.id === item.fishId)).map(item => ({ fishId: item.fishId, quantity: Math.max(1, Number(item.quantity) || 1) }));
    const review = reviewSpeciesAdditions({ aquarium: current, items: normalized, speciesCatalog: fishData });
    if (!review || ['block', 'complete_information'].includes(getTankCompatibilityAddPolicy(review.status))) {
      throw new Error(t('encyclopedia.addCombinationBlocked'));
    }
    const result = await recordExistingLivestock({ repository, aquarium: current, items: normalized, speciesCatalog: fishData, operationId: `compatibility:${crypto.randomUUID()}` });
    if (result.failedItems.length > 0) throw new Error(t('encyclopedia.addCombinationBlocked'));
    setActiveAquarium(result.aquarium);
    setAquariums(existing => existing.map(item => item.id === result.aquarium.id ? result.aquarium : item));
    return { message: t('encyclopedia.addedManyToTank', { count: result.savedItems.length, tankName: result.aquarium.name, names: '' }) };
  };

  return (
    <main data-page="compatibility" data-ui-block="compatibility-page" className="editorial-page compatibility-page min-h-full px-4 pb-12 pt-6 md:px-8 md:pt-8">
      <header className="editorial-page-header mx-auto flex w-full max-w-[1280px] items-start justify-between gap-4">
        <div>
          <button type="button" data-action-id="compatibility.back" onClick={() => navigate(-1)} className="quiet-icon-button mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink/55 hover:text-accent"><ArrowLeft className="h-4 w-4" />{t('common.back', '返回')}</button>
          <p className="editorial-kicker"><Calculator className="h-4 w-4" />{t('encyclopedia.compatibilityCalc')}</p>
          <h1 className="editorial-title">{t('encyclopedia.compatibilityCalc')}</h1>
          <p className="editorial-lede">先看一句话结论和现在该怎么做；需要时再展开专业依据。</p>
          <p className="mt-2 text-xs font-semibold text-ink/42">来源：{source === 'species-detail' ? '物种详情' : source}</p>
        </div>
      </header>
      <section data-ui-block="compatibility-workspace" className="editorial-workspace mx-auto mt-8 w-full max-w-[1280px]">
        <CompatibilityRiskCalculator
          speciesIds={speciesIds}
          onSpeciesIdsChange={syncSpecies}
          preferredSpeciesIds={activeAquarium?.fishes.map(item => item.fishId) || []}
          aquariums={aquariums}
          activeAquariumId={activeAquarium?.id}
          onAddToAquarium={addToAquarium}
          onRequestTankInfo={() => navigate('/aquarium#settings')}
          onViewAquarium={() => navigate('/aquarium')}
          onBrowseAtlas={() => navigate('/encyclopedia?mode=browse')}
        />
      </section>
    </main>
  );
}
